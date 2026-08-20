/**
 * M?thodes extraites d'AnalyseurGrammatical (2/4).
 * Source: analyseurexemple.js
 */
(function (global) {
    const coreMethods = {};

    coreMethods.determinerMetaDetectionErreur = function (erreur) {
        const type = (erreur && erreur.type ? erreur.type : '').toLowerCase();

        if (type.startsWith('homophone_')) {
            return {
                niveauDetection: 'semantique',
                domaineDetection: 'homophones',
                testDetection: 'Remplacement contextuel (avait, cela est, ou bien, etc.)'
            };
        }

        if (type === 'verbe_infinitif_requis' || type === 'verbe_participe_requis' || type === 'conjugaison_verbe' || type === 'accord_sujet_verbe') {
            return {
                niveauDetection: 'syntaxique',
                domaineDetection: 'morphologie_verbale',
                testDetection: 'Analyse du sujet/auxiliaire et des desinences verbales (-er/-e/-es/-ent, participe passe)'
            };
        }

        if (type.startsWith('accord_')) {
            return {
                niveauDetection: 'syntaxique',
                domaineDetection: 'accords',
                testDetection: 'Analyse des dependances du groupe nominal (determinant, nom, adjectif)'
            };
        }

        if (type === 'ponctuation_finale' || type === 'majuscule_phrase' || type === 'negation_incomplete' || type === 'trait_union_inversion') {
            return {
                niveauDetection: 'syntaxique',
                domaineDetection: 'syntaxe_ponctuation',
                testDetection: 'Verification de structure de phrase et de ponctuation'
            };
        }

        if (type === 'coherence_contextuelle_bescherelle') {
            return {
                niveauDetection: 'semantique',
                domaineDetection: 'coherence_contextuelle',
                testDetection: 'Validation du mot par probabilites de contexte issues du corpus Bescherelle integral'
            };
        }

        if (type === 'mot_invariable' || type === 'mot_inconnu' || type === 'confusion_phonographique' || type === 'accent_lexical' || type === 'apostrophe_obligatoire' || type === 'invariable_s_fantome' || type === 'mot_liaison_lexical' || type === 'locution_mal_segmentee' || type === 'oralite_familiere' || type === 'segmentation_mot_colle' || type === 'metathese' || type === 'lettre_fantome_finale') {
            return {
                niveauDetection: 'lexical',
                domaineDetection: 'orthographe_usage',
                testDetection: 'Comparaison dictionnaire + patrons orthographiques'
            };
        }

        return {
            niveauDetection: 'lexical',
            domaineDetection: 'orthographe_usage',
            testDetection: 'Detection lexicale generique'
        };
    };

    coreMethods.enrichirErreursAvecNiveauxDetection = function () {
        for (const erreur of this.erreursTrouvees) {
            if (!erreur) continue;
            const meta = this.determinerMetaDetectionErreur(erreur);
            erreur.niveauDetection = meta.niveauDetection;
            erreur.domaineDetection = meta.domaineDetection;
            erreur.testDetection = meta.testDetection;
        }
    };

    coreMethods.construireResumeNiveauxDetection = function () {
        const resume = {
            lexical: 0,
            syntaxique: 0,
            semantique: 0
        };

        for (const erreur of this.erreursTrouvees) {
            if (!erreur || !erreur.niveauDetection) continue;
            if (Object.prototype.hasOwnProperty.call(resume, erreur.niveauDetection)) {
                resume[erreur.niveauDetection] += 1;
            }
        }

        return resume;
    };

    coreMethods.obtenirIndexPrecedentSignificatif = function (index) {
        for (let i = index - 1; i >= 0; i--) {
            const mot = this.phraseAnalysee[i];
            if (!mot || this.estPonctuationToken(mot.texte)) continue;
            return i;
        }
        return -1;
    };

    coreMethods.obtenirIndexSuivantSignificatif = function (index) {
        for (let i = index + 1; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || this.estPonctuationToken(mot.texte)) continue;
            return i;
        }
        return -1;
    };

    coreMethods.obtenirVoisinLexicalNormaliseDepuisPhrase = function (phrase, index, direction) {
        if (!Array.isArray(phrase)) return '';

        for (let i = index + direction; i >= 0 && i < phrase.length; i += direction) {
            const token = phrase[i];
            if (!token || this.estPonctuationToken(token.texte)) continue;
            const texte = this.obtenirTexteCorrigeToken(token) || token.texte || '';
            const normalise = this.normaliserMotSimple(texte);
            if (!normalise) continue;
            return normalise;
        }

        return '';
    };

    coreMethods.obtenirFrequenceCorpus = function (map, cle) {
        if (!map || !cle) return 0;
        return map.get(cle) || 0;
    };

    coreMethods.scoreTransitionCorpusBescherelle = function (gauche, droite) {
        if (!this.corpusBescherelleActif || !gauche || !droite) return 0;

        const freqGauche = this.obtenirFrequenceCorpus(this.frequencesUnigrammesBescherelle, gauche);
        const freqBigramme = this.obtenirFrequenceCorpus(this.frequencesBigrammesBescherelle, `${gauche}|${droite}`);
        const denominateur = freqGauche + this.tailleVocabulaireBescherelle + 1;
        return Math.log((freqBigramme + 1) / Math.max(1, denominateur));
    };

    coreMethods.scoreContexteMotCorpusBescherelle = function (voisinGauche, mot, voisinDroite) {
        if (!this.corpusBescherelleActif) return 0;
        const centre = this.normaliserMotSimple(mot || '');
        if (!centre) return 0;

        let score = 0;
        if (voisinGauche) score += this.scoreTransitionCorpusBescherelle(voisinGauche, centre);
        if (voisinDroite) score += this.scoreTransitionCorpusBescherelle(centre, voisinDroite);
        return score;
    };

    coreMethods.verifierCoherenceContextuelleBescherelle = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierCoherenceContextuelleBescherelle !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierCoherenceContextuelleBescherelle');
        }

        return categories.verifierCoherenceContextuelleBescherelle.call(this);
    };

    coreMethods.commenceParVoyelleOuH = function (texte) {
        const normalise = this.normaliserTexte(texte || '');
        return /^[aeiouyh]/.test(normalise);
    };

    coreMethods.estTokenNegation = function (texte) {
        const t = (texte || '').toLowerCase();
        return t === 'ne' || t === "n'" || t === 'n';
    };

    coreMethods.estClitiqueObjetToken = function (texte) {
        const t = this.normaliserTexte(texte || '').replace(/[’']/g, '');
        return new Set([
            'me', 'm', 'te', 't', 'se', 's', 'le', 'la', 'les', 'l', 'lui', 'leur',
            'nous', 'vous', 'y', 'en'
        ]).has(t);
    };

    coreMethods.creerSujetVirtuel = function (texte, nombre = 'pluriel') {
        return {
            texte,
            donnees: {
                type: 'pronom',
                nombre,
                personne: texte === 'vous' ? '2e' : (texte === 'nous' ? '1re' : '3e')
            },
            erreurs: []
        };
    };

    coreMethods.trouverInfosSujetAvantVerbe = function (indexMot) {
        let idx = this.obtenirIndexPrecedentSignificatif(indexMot);
        if (idx < 0) return null;

        const IGNORER_AVANT_SUJET = new Set(['ne', 'n', 'pas', 'plus', 'jamais', 'me', 'm', 'te', 't', 'se', 's', 'nous', 'vous', 'y', 'en']);
        while (idx >= 0) {
            const token = this.phraseAnalysee[idx];
            const texte = this.normaliserTexte(token && token.texte ? token.texte : '').replace(/[’']/g, '');
            if (!IGNORER_AVANT_SUJET.has(texte)) break;
            idx = this.obtenirIndexPrecedentSignificatif(idx);
        }
        if (idx < 0) return null;

        const motFinal = this.phraseAnalysee[idx];
        if (!motFinal) return null;

        if (this.estType(motFinal.donnees, 'adjectif') && idx > 0) {
            const idxAvant = this.obtenirIndexPrecedentSignificatif(idx);
            const candidatNom = idxAvant >= 0 ? this.phraseAnalysee[idxAvant] : null;
            if (candidatNom && (this.estType(candidatNom.donnees, 'nom') || this.estSujetOuPronomToken(candidatNom))) {
                idx = idxAvant;
            }
        }

        const borneMin = Math.max(0, idx - 5);
        const MOTS_RUPTURE_CLAUSE = new Set(['apres', 'puis', 'ensuite', 'mais', 'donc', 'lorsque', 'quand', 'car', 'si']);
        for (let k = idx - 1; k >= borneMin; k--) {
            const token = this.phraseAnalysee[k];
            if (!token) break;
            if (this.estPonctuationToken(token.texte)) break;
            if (MOTS_RUPTURE_CLAUSE.has(this.normaliserTexte(token.texte || ''))) break;
            if (this.normaliserTexte(token.texte) !== 'et') continue;

            const idxSujet1 = this.obtenirIndexPrecedentSignificatif(k);
            const sujet1 = idxSujet1 >= 0 ? this.phraseAnalysee[idxSujet1] : null;
            const sujet2 = this.phraseAnalysee[idx];
            if (!sujet1 || !sujet2) break;

            const estPronomTonique = (m) => { if (!m || !m.texte) return false; const tx = this.normaliserTexte(m.texte); return ['moi','toi','lui','elle','nous','vous','eux','elles','je','tu','il','on','ils'].includes(tx); };
            const sujet1Valide = this.estSujetOuPronomToken(sujet1) || this.estType(sujet1.donnees, 'nom') || estPronomTonique(sujet1);
            const sujet2Valide = this.estSujetOuPronomToken(sujet2) || this.estType(sujet2.donnees, 'nom') || estPronomTonique(sujet2);
            if (!sujet1Valide || !sujet2Valide) break;

            const t1 = this.normaliserTexte(sujet1.texte || '').replace(/[’']/g, '');
            const t2 = this.normaliserTexte(sujet2.texte || '').replace(/[’']/g, '');
            if (t2 === 'on') {
                continue;
            }
            const premiere = new Set(['j', 'je', 'moi', 'nous']);
            const deuxieme = new Set(['tu', 'toi', 'vous']);

            let texteSujet = 'ils';
            if (premiere.has(t1) || premiere.has(t2)) {
                texteSujet = 'nous';
            } else if (deuxieme.has(t1) || deuxieme.has(t2)) {
                texteSujet = 'vous';
            }

            return {
                mot: this.creerSujetVirtuel(texteSujet, 'pluriel'),
                index: idxSujet1,
                nombre: 'pluriel'
            };
        }

        const motActuel = this.phraseAnalysee[idx];
        const texteMotActuel = this.normaliserTexte(motActuel && motActuel.texte ? motActuel.texte : '').replace(/[’']/g, '');
        if (texteMotActuel === 'qui') {
            const antecedent = this.trouverAntecedentRelatif(idx);
            if (antecedent && antecedent.mot) {
                return {
                    mot: antecedent.mot,
                    index: antecedent.index,
                    nombre: this.getNombreSujetAvecCorrections(antecedent.mot, antecedent.index)
                };
            }
        }

        const idxAvant = this.obtenirIndexPrecedentSignificatif(idx);
        const motAvant = idxAvant >= 0 ? this.phraseAnalysee[idxAvant] : null;
        const idxDeuxAvant = idxAvant >= 0 ? this.obtenirIndexPrecedentSignificatif(idxAvant) : -1;
        const motDeuxAvant = idxDeuxAvant >= 0 ? this.phraseAnalysee[idxDeuxAvant] : null;
        const idxTroisAvant = idxDeuxAvant >= 0 ? this.obtenirIndexPrecedentSignificatif(idxDeuxAvant) : -1;
        const motTroisAvant = idxTroisAvant >= 0 ? this.phraseAnalysee[idxTroisAvant] : null;

        // Structure "tête de/des complément" (groupe de touristes, plupart des élèves, etc.)
        const texteMotAvant = this.normaliserTexte(motAvant && motAvant.texte ? motAvant.texte : '');
        const texteMotDeuxAvant = this.normaliserTexte(motDeuxAvant && motDeuxAvant.texte ? motDeuxAvant.texte : '');
        const estComplementDe = texteMotAvant === 'de' || texteMotAvant === 'des';
        if (motActuel && this.estType(motActuel.donnees, 'nom') && estComplementDe && idxDeuxAvant >= 0) {
            const tete = motDeuxAvant;
            const idxDetTete = this.obtenirIndexPrecedentSignificatif(idxDeuxAvant);
            const detTete = idxDetTete >= 0 ? this.phraseAnalysee[idxDetTete] : null;
            // Accepter aussi une tête précédée d'un déterminant même si taggée verbe (homographes comme "boite", "danse", etc.)
            const tetePrecedeeDet = !!(detTete && (this.estDeterminantNominalToken(detTete) || this.estDeterminantSurfaceToken(detTete.texte || '')));
            if (tete && (this.estType(tete.donnees, 'nom') || this.estSujetOuPronomToken(tete) || this.estMotLexicalTolere(tete.texte) || tetePrecedeeDet)) {
                const teteNorm = this.normaliserTexte(tete.texte || '');
                if (teteNorm === 'plupart' && detTete && this.normaliserTexte(detTete.texte || '') === 'la') {
                    return {
                        mot: this.creerSujetVirtuel('ils', 'pluriel'),
                        index: idxDeuxAvant,
                        nombre: 'pluriel'
                    };
                }
                return {
                    mot: tete,
                    index: idxDeuxAvant,
                    nombre: this.getNombreSujetAvecCorrections(tete, idxDeuxAvant)
                };
            }
        }

        const estDetIntercale = !!(motAvant && (this.estDeterminantNominalToken(motAvant) || this.estDeterminantSurfaceToken(motAvant.texte || '')));
        const estDeAvantDet = texteMotDeuxAvant === 'de' || texteMotDeuxAvant === 'des';
        if (motActuel && this.estType(motActuel.donnees, 'nom') && estDetIntercale && estDeAvantDet && idxTroisAvant >= 0) {
            const tete = motTroisAvant;
            const idxDetTete2 = this.obtenirIndexPrecedentSignificatif(idxTroisAvant);
            const detTete2 = idxDetTete2 >= 0 ? this.phraseAnalysee[idxDetTete2] : null;
            const tetePrecedeeDet2 = !!(detTete2 && (this.estDeterminantNominalToken(detTete2) || this.estDeterminantSurfaceToken(detTete2.texte || '')));
            if (tete && (this.estType(tete.donnees, 'nom') || this.estSujetOuPronomToken(tete) || this.estMotLexicalTolere(tete.texte) || tetePrecedeeDet2)) {
                return {
                    mot: tete,
                    index: idxTroisAvant,
                    nombre: this.getNombreSujetAvecCorrections(tete, idxTroisAvant)
                };
            }
        }

        let idxVirguleRecente = -1;
        for (let k = indexMot - 1; k >= 0; k--) {
            const token = this.phraseAnalysee[k];
            if (!token) continue;
            if (token.texte === ',') {
                idxVirguleRecente = k;
                break;
            }
        }

        if (idxVirguleRecente >= 0) {
            let idxVirguleAncienne = -1;
            for (let k = idxVirguleRecente - 1; k >= 0; k--) {
                const token = this.phraseAnalysee[k];
                if (!token) continue;
                if (token.texte === ',') {
                    idxVirguleAncienne = k;
                    break;
                }
            }

            if (idxVirguleAncienne >= 0) {
                const sujetAvantIncise = this.trouverSujetAvantIndex(idxVirguleAncienne);
                if (sujetAvantIncise) {
                    const indexSujet = this.phraseAnalysee.indexOf(sujetAvantIncise);
                    return {
                        mot: sujetAvantIncise,
                        index: indexSujet,
                        nombre: this.getNombreSujetAvecCorrections(sujetAvantIncise, indexSujet)
                    };
                }
            }
        }

        // Utiliser l'idx corrigé (qui peut avoir sauté des adjectifs)
        const motCandidat = this.phraseAnalysee[idx];
        if (motCandidat && (this.estSujetOuPronomToken(motCandidat) || this.estType(motCandidat.donnees, 'nom') || !motCandidat.donnees)) {
            const nombreCandidat = this.getNombreSujetAvecCorrections(motCandidat, idx);
            if (nombreCandidat || motCandidat.donnees) {
                return { mot: motCandidat, index: idx, nombre: nombreCandidat };
            }
        }
        const sujet = this.trouverSujetAvantIndex(indexMot);
        if (!sujet) return null;
        const indexSujet = this.phraseAnalysee.indexOf(sujet);
        return {
            mot: sujet,
            index: indexSujet,
            nombre: this.getNombreSujetAvecCorrections(sujet, indexSujet)
        };
    };

    coreMethods.estFormeEtreTexte = function (texte) {
        return new Set(['suis', 'es', 'est', 'sommes', 'etes', 'sont', 'etais', 'etait', 'etions', 'etiez', 'etaient']).has(this.normaliserTexte(texte || ''));
    };

    coreMethods.estComparatifPlus = function (indexMot) {
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || this.normaliserTexte(mot.texte) !== 'plus') return false;

        for (let i = indexMot + 1; i < Math.min(this.phraseAnalysee.length, indexMot + 5); i++) {
            const token = this.phraseAnalysee[i];
            if (!token) continue;
            if (this.estPonctuationToken(token.texte)) break;
            if (this.normaliserTexte(token.texte) === 'que') {
                return true;
            }
        }

        return false;
    };

    coreMethods.doitTolererPlurielNominalInconnu = function (indexMot, correctionProbable) {
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || !mot.texte || !correctionProbable) return false;

        const texte = this.normaliserTexte(mot.texte);
        const correction = this.normaliserTexte(correctionProbable);
        if (!/[sx]$/.test(texte) || /[sx]$/.test(correction)) return false;

        const donneesCorrection = this.getWordData(correctionProbable);
        if (donneesCorrection && this.estType(donneesCorrection, 'verbe')) return false;

        const precedent = indexMot > 0 ? this.phraseAnalysee[indexMot - 1] : null;
        const idxPrecSig = this.obtenirIndexPrecedentSignificatif(indexMot);
        const precSig = idxPrecSig >= 0 ? this.phraseAnalysee[idxPrecSig] : null;
        const idxDeuxPrecSig = idxPrecSig >= 0 ? this.obtenirIndexPrecedentSignificatif(idxPrecSig) : -1;

        if (this.estDeterminantOuNombrePlurielToken(precedent) || this.estDeterminantOuNombrePlurielToken(precSig)) {
            return true;
        }

        if (precSig && this.normaliserTexte(precSig.texte || '') === 'de' && idxDeuxPrecSig >= 0) {
            const tete = this.phraseAnalysee[idxDeuxPrecSig];
            if (tete && (this.estType(tete.donnees, 'nom') || this.estSujetOuPronomToken(tete))) {
                return true;
            }
        }

        if (precSig && this.normaliserTexte(precSig.texte || '') === 'cent' && this.estDeterminantOuNombrePlurielToken(idxDeuxPrecSig >= 0 ? this.phraseAnalysee[idxDeuxPrecSig] : null)) {
            return true;
        }

        return false;
    };

    coreMethods.trouverSujetAvantIndex = function (indexMot) {
        let idx = this.obtenirIndexPrecedentSignificatif(indexMot);
        while (idx >= 0) {
            const candidat = this.phraseAnalysee[idx];
            if (!candidat) return null;

            if (this.estTokenNegation(candidat.texte) || this.estClitiqueObjetToken(candidat.texte)) {
                idx = this.obtenirIndexPrecedentSignificatif(idx);
                continue;
            }

            if (this.estSujet(candidat) || this.estSujetOuPronomToken(candidat)) {
                return candidat;
            }

            return null;
        }
        return null;
    };

    coreMethods.estPronomSujetToken = function (texte) {
        const t = this.normaliserTexte(texte || '').replace(/[’']/g, '');
        return new Set([
            'j', 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
            'ce', 'ca', 'cela', 'ceci', 'qui'
        ]).has(t);
    };

    coreMethods.estSujetOuPronomToken = function (mot) {
        if (!mot) return false;
        const texte = (mot.texte || '').toLowerCase();
        if (["j'", 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'moi', 'toi', 'lui', 'eux'].includes(texte)) {
            return true;
        }
        if (mot.donnees && this.estType(mot.donnees, 'nom')) {
            return true;
        }
        if (mot.donnees && this.estType(mot.donnees, 'pronom')) {
            return this.estPronomSujetToken(mot.texte);
        }
        return false;
    };

    coreMethods.verifierInvariablesMultiMots = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierInvariablesMultiMots !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierInvariablesMultiMots');
        }

        return categories.verifierInvariablesMultiMots.call(this);
    };

    coreMethods.verifierLexiqueFigePrioritaire = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierLexiqueFigePrioritaire !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierLexiqueFigePrioritaire');
        }

        return categories.verifierLexiqueFigePrioritaire.call(this);
    };

    coreMethods.verifierLocutionsEtOralite = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierLocutionsEtOralite !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierLocutionsEtOralite');
        }

        return categories.verifierLocutionsEtOralite.call(this);
    };

    coreMethods.trouverCorrectionInvariableCompacte = function (mot) {
        const cle = this.normaliserCleExpressionInvariable(mot || '');
        if (!cle) return null;

        const canonique = this.indexExpressionsInvariables.get(cle);
        if (!canonique) return null;

        const motNormalise = (mot || '').toLowerCase().replace(/[’]/g, "'").trim();
        if (motNormalise === canonique) return null;

        return canonique;
    };

    coreMethods.initialiserMotsInvariables = function () {
        const liste = [
            'ailleurs','ainsi','alors','apres','au-dessous','au-dessus','aujourdhui','auprès','aussi','aussitot',
            'autant','autour','autrefois','autrement','avant','avec','beaucoup','bien','bientot','car','ceci',
            'cela','cependant','certes','chez','comme','comment','dabord','dans','davantage','dedans','dehors',
            'deja','demain','depuis','desormais','dessous','dessus','devant','donc','dont','dorenavant','durant',
            'encore','enfin','ensuite','entre','envers','express','guere','helas','hier','hors','hormis','ici',
            'jadis','jamais','la-bas','loin','longtemps','lorsque','maintenant','mais','malgre','mieux','moins',
            'naguere','neanmoins','non','par','parce','parfois','parmi','pas','pendant','peu','plus','plusieurs','plutot',
            'pour','pourquoi','pourtant','pres','presque','puis','quand','quelquefois','quoi','quoique','sans','sauf',
            'selon','seulement','sinon','sitot','soudain','sous','souvent','surtout','tant','tantot','tard','tot',
            'toujours','toutefois','travers','tres','trop','vers','voici','voila','volontiers','vraiment','chaque'
        ];
        const set = new Set();
        for (const mot of liste) {
            set.add(this.normaliserMotSimple(mot));
        }
        return set;
    };

    coreMethods.estMotInvariable = function (mot) {
        const cle = this.normaliserMotSimple(mot || '');
        return !!cle && this.motsInvariables.has(cle);
    };

    coreMethods.melangerTableau = function (tableau) {
        const t = [...tableau];
        for (let i = t.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [t[i], t[j]] = [t[j], t[i]];
        }
        return t;
    };

    coreMethods.genererOptionsMotInvariable = function (correction, motFautif) {
        const corr = (correction || '').toLowerCase().trim();
        const fautif = (motFautif || '').toLowerCase().trim();
        const faux = new Set();

        const sansAccent = this.normaliserMotSimple(corr);
        if (sansAccent && sansAccent !== corr) faux.add(sansAccent);
        if (fautif && fautif !== corr) faux.add(fautif);

        if (corr.includes("'")) faux.add(corr.replace(/'/g, ''));
        if (corr.includes('au')) faux.add(corr.replace(/au/g, 'o'));
        if (corr.includes('ou')) faux.add(corr.replace(/ou/g, 'u'));
        if (corr.endsWith('s')) faux.add(corr.slice(0, -1));
        if (!corr.endsWith('s')) faux.add(`${corr}s`);

        // Générer une faute simple (doublement / suppression)
        if (corr.length > 3) {
            faux.add(`${corr[0]}${corr.slice(2)}`);
            faux.add(`${corr[0]}${corr[0]}${corr.slice(1)}`);
        }

        const fauxFiltres = [...faux].filter((m) => m && m !== corr).slice(0, 3);
        while (fauxFiltres.length < 3) {
            fauxFiltres.push(`${corr}${String.fromCharCode(97 + fauxFiltres.length)}`);
        }

        return this.melangerTableau([corr, ...fauxFiltres]);
    };

    coreMethods.doitDemanderAuxiliaire = function (positionErreur) {
        if (typeof positionErreur !== 'number' || positionErreur <= 0) return false;
        const clitiques = new Set(["l'",'la','le','les','lui','leur',"m'","t'","s'",'me','te','se','nous','vous','y','en']);

        const normaliserToken = (mot) => this.normaliserMotSimple(mot && mot.texte ? mot.texte : '');

        let idx = positionErreur - 1;
        while (idx >= 0) {
            const tok = this.phraseAnalysee[idx];
            const t = normaliserToken(tok);
            if (!t) return false;
            if (clitiques.has((tok.texte || '').toLowerCase()) || clitiques.has(t)) {
                idx -= 1;
                continue;
            }
            return this.auxiliairesConj.has(t);
        }
        return false;
    };

    coreMethods.initialiser = function (dictionnaireData, erreursFrequentesData = null, reglesBescherelleData = null, bescherelleChunksData = null) {
        this.dictionnaire = dictionnaireData;
        this.indexVariations.clear();
        this.fautesLexicalesFrequentes.clear();
        this.motifsErreursFrequentes = [];
        this.clefsDictionnaire = [];
        this.indexCandidatsCorrection.clear();
        this.reglesBescherelle = null;
        this.reglesBescherelleParType = {};
        this.fichesBescherelleParType = {};
        this.corpusBescherelleActif = false;
        this.frequencesUnigrammesBescherelle.clear();
        this.frequencesBigrammesBescherelle.clear();
        this.frequencesTrigrammesBescherelle.clear();
        this.totalTokensBescherelle = 0;
        this.totalChunksBescherelle = 0;
        this.tailleVocabulaireBescherelle = 0;

        if (dictionnaireData && dictionnaireData.mots) {
            for (const [mot, valeur] of Object.entries(dictionnaireData.mots)) {
                const entree = Array.isArray(valeur) ? valeur[0] : valeur;
                if (!entree) continue;

                const motLower = mot.toLowerCase();
                this.clefsDictionnaire.push(motLower);
                this.indexVariations.set(motLower, entree);
                this.indexerMotPourCorrection(motLower);
                if (Array.isArray(entree.variations)) {
                    entree.variations.forEach((variation) => {
                        if (typeof variation === 'string' && variation.trim()) {
                            this.indexVariations.set(variation.toLowerCase(), entree);
                        }
                    });
                }
            }
        }

        if (erreursFrequentesData) {
            this.initialiserErreursFrequentes(erreursFrequentesData);
        }

        if (reglesBescherelleData) {
            this.initialiserReglesBescherelle(reglesBescherelleData);
        }

        if (bescherelleChunksData) {
            this.initialiserCorpusBescherelleIntegral(bescherelleChunksData);
        }
    };

    coreMethods.incrementerFrequence = function (map, cle, increment = 1) {
        if (!map || !cle) return;
        map.set(cle, (map.get(cle) || 0) + increment);
    };

    coreMethods.tokeniserCorpusBescherelle = function (texte) {
        if (!texte) return [];
        const brut = String(texte).toLowerCase();
        const morceaux = brut.match(/[a-zàâçéèêëîïôûùüÿœæ'-]+/gi) || [];
        const tokens = [];

        for (const morceau of morceaux) {
            const t = this.normaliserMotSimple(morceau);
            if (!t || t.length < 2 || t.length > 24) continue;
            if (/^\d+$/.test(t)) continue;
            tokens.push(t);
        }

        return tokens;
    };

    coreMethods.initialiserCorpusBescherelleIntegral = function (chunksData) {
        const chunks = Array.isArray(chunksData && chunksData.chunks) ? chunksData.chunks : [];
        if (!chunks.length) return;

        for (const chunk of chunks) {
            const tokens = this.tokeniserCorpusBescherelle(chunk && chunk.text ? chunk.text : '');
            if (!tokens.length) continue;

            this.totalChunksBescherelle += 1;
            this.totalTokensBescherelle += tokens.length;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                this.incrementerFrequence(this.frequencesUnigrammesBescherelle, token);

                if (i < tokens.length - 1) {
                    this.incrementerFrequence(this.frequencesBigrammesBescherelle, `${token}|${tokens[i + 1]}`);
                }

                if (i < tokens.length - 2) {
                    this.incrementerFrequence(this.frequencesTrigrammesBescherelle, `${token}|${tokens[i + 1]}|${tokens[i + 2]}`);
                }
            }
        }

        this.tailleVocabulaireBescherelle = this.frequencesUnigrammesBescherelle.size;
        this.corpusBescherelleActif = this.totalTokensBescherelle > 0;
    };

    coreMethods.initialiserReglesBescherelle = function (reglesBescherelleData) {
        if (!reglesBescherelleData || typeof reglesBescherelleData !== 'object') {
            return;
        }

        this.reglesBescherelle = reglesBescherelleData;
        const mapping = reglesBescherelleData.mappingTypesErreurs;
        this.reglesBescherelleParType = (mapping && typeof mapping === 'object') ? mapping : {};
        const fiches = reglesBescherelleData.fichesParType;
        this.fichesBescherelleParType = (fiches && typeof fiches === 'object') ? fiches : {};
    };

    coreMethods.appliquerFicheBescherelleErreur = function (erreur) {
        if (!erreur || !erreur.type || !this.fichesBescherelleParType) return;
        const fiche = this.fichesBescherelleParType[erreur.type];
        if (!fiche || typeof fiche !== 'object') return;

        const memoFiche = typeof fiche.memo === 'string' ? fiche.memo.trim() : '';
        const titreFiche = typeof fiche.titreAide === 'string' ? fiche.titreAide.trim() : '';
        const memoEstRappelBescherelle = /^Rep[eè]re Bescherelle/i.test(memoFiche);
        const titreEstRappelBescherelle = /^Rep[eè]re Bescherelle/i.test(titreFiche);

        if (!erreur.memo && memoFiche && !memoEstRappelBescherelle) {
            erreur.memo = memoFiche;
        }

        if ((!erreur.regle || String(erreur.regle).trim().length < 10) && typeof fiche.regle === 'string' && fiche.regle.trim()) {
            erreur.regle = fiche.regle.trim();
        }

        const exemplesCourants = Array.isArray(erreur.exemples) ? erreur.exemples : [];
        const exemplesFiche = Array.isArray(fiche.exemples) ? fiche.exemples : [];
        const fusion = [...new Set(
            [...exemplesCourants, ...exemplesFiche]
                .filter((x) => typeof x === 'string')
                .map((x) => x.trim())
                .filter((x) => x && !this.estExempleSourceBrut(x))
        )];
        if (fusion.length > 0) {
            erreur.exemples = fusion.slice(0, 6);
        }

        if (!erreur.titreAide && titreFiche && !titreEstRappelBescherelle) {
            erreur.titreAide = titreFiche;
        }
    };

    coreMethods.estExempleSourceBrut = function (exemple) {
        if (typeof exemple !== 'string') return false;
        const t = exemple.toLowerCase();
        if (t.includes('.pdf p.') || t.includes('.pdf p')) return true;
        if (t.includes('bescherelle') && t.includes('.pdf')) return true;
        return false;
    };

    coreMethods.enrichirErreursAvecFichesBescherelle = function () {
        if (!Array.isArray(this.erreursTrouvees) || this.erreursTrouvees.length === 0) return;
        for (const erreur of this.erreursTrouvees) {
            this.appliquerFicheBescherelleErreur(erreur);
        }
    };

    coreMethods.construireNoteContexteCorpus = function (erreur) {
        if (!this.corpusBescherelleActif || !erreur) return '';
        const index = typeof erreur.indexDebut === 'number' ? erreur.indexDebut : erreur.position;
        if (typeof index !== 'number' || index < 0 || index >= this.phraseAnalysee.length) return '';

        const motCourant = this.phraseAnalysee[index];
        if (!motCourant || !erreur.correction) return '';

        const voisinGauche = this.obtenirVoisinLexicalNormaliseDepuisPhrase(this.phraseAnalysee, index, -1);
        const voisinDroite = this.obtenirVoisinLexicalNormaliseDepuisPhrase(this.phraseAnalysee, index, 1);
        if (!voisinGauche && !voisinDroite) return '';

        const original = this.normaliserMotSimple(motCourant.texte || erreur.mot || '');
        const correction = this.normaliserMotSimple(erreur.correction || '');
        if (!original || !correction) return '';

        const scoreOriginal = this.scoreContexteMotCorpusBescherelle(voisinGauche, original, voisinDroite);
        const scoreCorrection = this.scoreContexteMotCorpusBescherelle(voisinGauche, correction, voisinDroite);
        const delta = scoreCorrection - scoreOriginal;

        if (delta < 0.35) return '';
        if (delta >= 1.6) return "Un mot ne voyage jamais seul ! Observe ses voisins pour trouver la forme qui s'accorde avec eux et que l'ensemble soit logique.";
        if (delta >= 0.8) return 'La correction s’accorde mieux avec le contexte local de la phrase.';
        return 'La correction améliore la cohérence avec les mots voisins.';
    };

    coreMethods.enrichirErreursAvecContexteCorpusIntegral = function () {
        if (!this.corpusBescherelleActif || !Array.isArray(this.erreursTrouvees)) return;

        for (const erreur of this.erreursTrouvees) {
            if (!erreur) continue;
            const note = this.construireNoteContexteCorpus(erreur);
            if (!note) continue;

            if (!erreur.memo) {
                erreur.memo = note;
                continue;
            }

            if (!String(erreur.memo).includes(note)) {
                erreur.memo = `${erreur.memo} ${note}`.trim();
            }
        }
    };

    coreMethods.obtenirRappelsBescherelle = function (typeErreur, limite = 2) {
        if (!typeErreur || !this.reglesBescherelleParType || !this.reglesBescherelleParType[typeErreur]) {
            return [];
        }

        const refs = this.reglesBescherelleParType[typeErreur];
        if (!Array.isArray(refs)) return [];

        return refs
            .slice(0, Math.max(1, limite))
            .map((r) => {
                const numero = r && r.numero ? `Règle ${r.numero}` : 'Règle';
                const titre = r && r.titre ? r.titre : '';
                const resume = r && r.resume ? r.resume : '';
                return `${numero} - ${titre}${resume ? ` : ${resume}` : ''}`.trim();
            })
            .filter((t) => t.length > 0);
    };

    coreMethods.initialiserErreursFrequentes = function (erreursFrequentesData) {
        const fautesLexicales = Array.isArray(erreursFrequentesData.fautesLexicales)
            ? erreursFrequentesData.fautesLexicales
            : [];
        const motifs = Array.isArray(erreursFrequentesData.motifs)
            ? erreursFrequentesData.motifs
            : [];

        fautesLexicales.forEach((entree) => {
            const cle = this.normaliserCleRegle(entree.fautif);
            if (!cle) return;
            this.fautesLexicalesFrequentes.set(cle, entree);
        });

        this.motifsErreursFrequentes = motifs
            .filter((motif) => Array.isArray(motif.contexte) && motif.contexte.length > 0)
            .map((motif) => ({
                ...motif,
                contexteNormalise: motif.contexte.map((mot) => this.normaliserCleRegle(mot))
            }));
    };

    global.AbeAnalyseurCoreMethods = Object.assign(
        global.AbeAnalyseurCoreMethods || {},
        coreMethods
    );
})(typeof window !== 'undefined' ? window : globalThis);