/**
 * Catégorie extraite d'analyseur.js
 * Fichier: accords.js
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierAccordDeterminantNom() {
        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            const motActuel = this.phraseAnalysee[i];
            const motSuivant = this.phraseAnalysee[i + 1];

            const texteActuelNorm = this.normaliserTexte(motActuel && motActuel.texte ? motActuel.texte : '').replace(/[’']/g, '');
            const idxPrecSujet = this.obtenirIndexPrecedentSignificatif(i);
            const tokPrecSujet = idxPrecSujet >= 0 ? this.phraseAnalysee[idxPrecSujet] : null;
            const textePrecSujet = this.normaliserTexte(tokPrecSujet && tokPrecSujet.texte ? tokPrecSujet.texte : '');
            const clitiqueObjet = new Set(['me', 'm', 'te', 't', 'se', 's', 'nous', 'vous', 'y', 'en']);
            const estClitiqueObjetApresVerbe = clitiqueObjet.has(texteActuelNorm)
                && tokPrecSujet
                && (this.estType(tokPrecSujet.donnees, 'verbe') || this.estSemiAuxiliaireTexte(textePrecSujet) || textePrecSujet === 'allez')
                && !this.estSujetOuPronomToken(tokPrecSujet);
            if (estClitiqueObjetApresVerbe) {
                continue;
            }

            const determinerGenreAttendu = (det, indexNomCible) => {
                const motNomCible = this.phraseAnalysee[indexNomCible];
                if (!det || !motNomCible) return null;

                const genreNom = this.normaliserGenre(motNomCible.donnees && motNomCible.donnees.genre);
                if (genreNom && genreNom !== 'mixte') return genreNom;

                for (let j = i + 1; j < indexNomCible; j++) {
                    const motIntercale = this.phraseAnalysee[j];
                    if (!motIntercale || !this.estType(motIntercale.donnees, 'adjectif')) continue;
                    const texteAdj = this.normaliserTexte(motIntercale.texte || '');
                    if (/e$/.test(texteAdj) && !/(ique|iste)$/.test(texteAdj)) {
                        return 'féminin';
                    }
                }

                return null;
            };

            const estIgnoreBloquant = (mot, index) => {
                if (!this.positionsIgnoreesErreursGeneriques.has(index)) return false;
                const erreurs = Array.isArray(mot && mot.erreurs) ? mot.erreurs : [];
                return erreurs.some((erreur) => erreur && erreur.type !== 'majuscule_phrase' && erreur.type !== 'ponctuation_finale');
            };

            if (estIgnoreBloquant(motActuel, i) || estIgnoreBloquant(motSuivant, i + 1)) {
                continue;
            }

            // Si le mot actuel est un déterminant, chercher le nom ciblé (immédiat ou après adjectif/adverbe)
            if (this.estDeterminantNominalToken(motActuel)) {
                let indexNomCible = i + 1;
                while (indexNomCible < this.phraseAnalysee.length) {
                    const candidat = this.phraseAnalysee[indexNomCible];
                    const estPonctuation = this.estPonctuationToken(candidat.texte);
                    if (estPonctuation) {
                        break;
                    }
                    if (this.estType(candidat.donnees, 'nom')) {
                        break;
                    }
                    if (!(this.estType(candidat.donnees, 'adjectif') || this.estType(candidat.donnees, 'adverbe'))) {
                        break;
                    }
                    indexNomCible++;
                }

                const motNomCible = this.phraseAnalysee[indexNomCible];
                if (motNomCible && this.estType(motNomCible.donnees, 'nom')) {
                    const nombreDet = this.normaliserNombre(motActuel.donnees && motActuel.donnees.nombre);
                    const nombreNom = this.normaliserNombre(motNomCible.donnees && motNomCible.donnees.nombre);
                    const genreDet = this.normaliserGenre(motActuel.donnees && motActuel.donnees.genre);
                    const genreAttendu = determinerGenreAttendu(motActuel, indexNomCible);

                    if (nombreDet && nombreNom && nombreDet !== nombreNom) {
                        const correctionNom = this.trouverNomProbableApresDeterminant(motNomCible.texte, motActuel.donnees);
                        // Ne pas signaler si le nom semble invariable en nombre (ex: bus, bras, bois).
                        const texteNomNorm = this.normaliserTexte(motNomCible.texte || '');
                        const nomParaitInvariable = (!correctionNom || correctionNom.toLowerCase() === motNomCible.texte.toLowerCase())
                            && nombreDet === 'singulier' && nombreNom === 'pluriel'
                            && /[sx]$/.test(texteNomNorm);
                        if (nomParaitInvariable) { /* nom invariable, skip */ }
                        else if (correctionNom && correctionNom.toLowerCase() !== motNomCible.texte.toLowerCase()) {
                            const erreur = {
                                type: 'accord_nom_nombre',
                                position: indexNomCible,
                                mot: motNomCible.texte,
                                correction: correctionNom,
                                explication: `Le nom "${motNomCible.texte}" doit s'accorder avec le déterminant "${motActuel.texte}".`,
                                regle: 'Le nom s\'accorde avec le déterminant qui le précède : le/la/un/une = singulier, les/des = pluriel.'
                            };

                            this.erreursTrouvees.push(erreur);
                            motNomCible.erreurs.push(erreur);
                        } else {
                            const erreur = {
                                type: 'accord_determinant_nom',
                                position: i,
                                mot: motActuel.texte,
                                correction: this.suggereCorrectionDeterminant(motActuel.donnees, motNomCible.donnees),
                                explication: `Le déterminant "${motActuel.texte}" ne s'accorde pas en nombre avec le nom "${motNomCible.texte}".`,
                                regle: 'Le déterminant et le nom doivent correspondre en genre et en nombre (ex: ce chien, cette chienne, ces chiens).'
                            };

                            this.erreursTrouvees.push(erreur);
                            motActuel.erreurs.push(erreur);
                        }
                    } else if (genreDet && genreAttendu && genreDet !== genreAttendu && genreDet !== 'mixte' && this.normaliserNombre(motActuel.donnees.nombre) !== 'pluriel') {
                        const erreur = {
                            type: 'accord_determinant_nom',
                            position: i,
                            mot: motActuel.texte,
                            correction: genreAttendu === 'féminin' ? 'la' : 'le',
                            explication: `Le déterminant "${motActuel.texte}" ne correspond pas au genre attendu dans le groupe nominal.`,
                            regle: 'Le déterminant s’accorde avec le nom qu’il introduit, et les indices du groupe nominal aident souvent à repérer le genre attendu.'
                        };

                        this.erreursTrouvees.push(erreur);
                        motActuel.erreurs.push(erreur);
                    }
                } else if (motNomCible && (!motNomCible.erreurs || motNomCible.erreurs.length === 0)) {
                    const correctionNom = this.trouverNomProbableApresDeterminant(motNomCible.texte, motActuel.donnees);
                    const donneesNom = correctionNom ? this.getWordData(correctionNom) : null;
                    if (donneesNom && this.estType(donneesNom, 'nom')) {
                        const nombreDet = this.normaliserNombre(motActuel.donnees && motActuel.donnees.nombre);
                        const nombreNom = this.normaliserNombre(donneesNom.nombre);
                        if (!nombreDet || !nombreNom || nombreDet === nombreNom) {
                            const erreur = {
                                type: 'accord_nom_nombre',
                                position: indexNomCible,
                                mot: motNomCible.texte,
                                correction: correctionNom,
                                explication: `Après le déterminant "${motActuel.texte}", on attend un nom correctement écrit.`,
                                regle: 'Le déterminant et le nom vont ensemble : même nombre, et si possible même genre selon le contexte.'
                            };

                            this.erreursTrouvees.push(erreur);
                            motNomCible.erreurs.push(erreur);
                        }
                    }
                }

                continue;
            }
        }
    }

    categories.verifierAccordDeterminantNom = verifierAccordDeterminantNom;

    /**
     * Détecte : beaucoup de/d'/plein de/d'/peu de/trop de + nom singulier → pluriel
     * Ex: "beaucoup de livre" → "beaucoup de livres"
     */
    function verifierQuantificateurNomNombre() {
        const QUANTIFICATEURS = new Set(['beaucoup', 'plein', 'peu', 'trop', 'assez', 'tant', 'autant', 'davantage', 'moins', 'plus', 'combien']);
        for (let i = 0; i + 2 < this.phraseAnalysee.length; i++) {
            const motQuant = this.phraseAnalysee[i];
            const motDe = this.phraseAnalysee[i + 1];
            const motNom = this.phraseAnalysee[i + 2];
            const texteQuant = this.normaliserTexte(motQuant.texte || '');
            const texteDe = this.normaliserTexte(motDe.texte || '').replace(/['']/g, "'");
            if (!QUANTIFICATEURS.has(texteQuant)) continue;
            if (!["de", "d'"].includes(texteDe)) continue;
            if (!motNom.donnees || !this.estType(motNom.donnees, 'nom')) continue;
            if (this.normaliserNombre(motNom.donnees.nombre) !== 'singulier') continue;
            if (this.positionsIgnoreesErreursGeneriques.has(i + 2)) continue;
            const dejaSignale = (motNom.erreurs || []).some(e => e && e.type === 'accord_nom_nombre');
            if (dejaSignale) continue;
            const correction = this.trouverNomProbableApresDeterminant(motNom.texte, {nombre: 'pluriel'});
            if (!correction || this.normaliserTexte(correction) === this.normaliserTexte(motNom.texte)) continue;
            const erreur = {
                type: 'accord_nom_nombre',
                position: i + 2,
                mot: motNom.texte,
                correction,
                explication: `Après "${motQuant.texte} de", le nom doit être au pluriel.`,
                regle: 'Après des quantificateurs comme "beaucoup de", "plein de", "peu de", le nom se met au pluriel.'
            };
            this.erreursTrouvees.push(erreur);
            motNom.erreurs.push(erreur);
        }
    }

    categories.verifierQuantificateurNomNombre = verifierQuantificateurNomNombre;

    function verifierAccordSujetVerbe() {
        const CLITIQUES = new Set([
            "l'", "m'", "t'", "s'", 'me', 'te', 'se', 'nous', 'vous', 'y', 'en'
        ]);
        const MOTS_INTERCALES = new Set([...CLITIQUES, 'ne', "n'"]);
        const estVerbeProtegeConjugaison = (indexVerbe, correction) => {
            const motCible = this.phraseAnalysee[indexVerbe];
            if (!motCible) return false;
            if (this.estTokenProtege(indexVerbe)) return true;
            if (this.estDansTunnelSubjonctif(indexVerbe)) return true;
            if (this.estContexteSiImparfaitProtege(indexVerbe, correction)) return true;

            const texteCible = this.normaliserTexte(motCible.texte || '');
            const motSuivant = this.phraseAnalysee[indexVerbe + 1] || null;
            const texteSuivant = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
            if (texteCible === 'a' && /[àÀ]/.test(motCible.texte || '') && this.estDeterminantSurfaceToken(texteSuivant)) {
                return true;
            }
            return false;
        };

        // Recherche des patterns sujet + verbe
        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            const motActuel = this.phraseAnalysee[i];
            const motSuivant = this.phraseAnalysee[i + 1];

            if (this.positionsIgnoreesErreursGeneriques.has(i) || this.positionsIgnoreesErreursGeneriques.has(i + 1)) {
                continue;
            }

            // Si le mot actuel est un sujet (nom/pronom) et le suivant un verbe
            if (this.estSujet(motActuel) && this.estType(motSuivant.donnees, 'verbe')) {
                const texteSujetLocal = this.normaliserTexte(motActuel.texte || '').replace(/[’']/g, '');
                const idxPrecLocal = this.obtenirIndexPrecedentSignificatif(i);
                const tokPrecLocal = idxPrecLocal >= 0 ? this.phraseAnalysee[idxPrecLocal] : null;
                if (['vous', 'nous'].includes(texteSujetLocal)
                    && tokPrecLocal
                    && this.estType(tokPrecLocal.donnees, 'verbe')
                    && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees)) {
                    continue;
                }

                const sujetInfo = this.trouverInfosSujetAvantVerbe(i + 1);
                const sujetReference = sujetInfo && sujetInfo.mot ? sujetInfo.mot : motActuel;

                // Reprise pronominale: "... des photos elle sont ..." -> "elles"
                const texteSujetBrut = (motActuel.texte || '').toLowerCase();
                const texteSujetNorm = this.normaliserTexte(motActuel.texte || '');
                const estPronomIlElle = ['il', 'elle'].includes(texteSujetNorm);
                const VERBES_PLURIELS_FORTS_REPRISE = new Set(['sont', 'etaient', 'étaient', 'etions', 'étions', 'etiez', 'étiez', 'furent', 'fûmes']);
                const estVerbePlurielFortObserve = VERBES_PLURIELS_FORTS_REPRISE.has(this.normaliserTexte(motSuivant.texte || ''));
                if (estPronomIlElle && estVerbePlurielFortObserve) {
                    let antecedentPluriel = null;
                    for (let k = i - 1; k >= 0 && k >= i - 8; k--) {
                        const precedent = this.phraseAnalysee[k];
                        if (!precedent) break;
                        if (this.estPonctuationToken(precedent.texte)) break;
                        const erreurNomNombre = (precedent.erreurs || []).some((e) => e && e.type === 'accord_nom_nombre');
                        const candidatNominal = this.estType(precedent.donnees, 'nom') || erreurNomNombre || this.estContexteNominalPlurielProbable(k);
                        if (!candidatNominal) continue;
                        let nombrePrec = this.getNombreSujetAvecCorrections(precedent, k) || this.normaliserNombre(precedent.donnees && precedent.donnees.nombre);
                        if (!nombrePrec) {
                            const tPrec = this.normaliserTexte(precedent.texte || '');
                            if (/[sx]$/.test(tPrec) || this.estContexteNominalPlurielProbable(k)) {
                                nombrePrec = 'pluriel';
                            }
                        }
                        if (nombrePrec === 'pluriel') {
                            antecedentPluriel = precedent;
                            break;
                        }
                    }

                    if (antecedentPluriel) {
                        const correctionPronom = texteSujetNorm === 'elle' ? 'elles' : 'ils';
                        const dejaSignalePronom = (motActuel.erreurs || []).some((e) => e && e.type === 'accord_pronom_nombre');
                        if (!dejaSignalePronom && texteSujetBrut !== correctionPronom) {
                            const erreur = {
                                type: 'accord_pronom_nombre',
                                position: i,
                                mot: motActuel.texte,
                                correction: correctionPronom,
                                explication: `Le pronom "${motActuel.texte}" reprend "${antecedentPluriel.texte}", il doit donc être au pluriel.`,
                                regle: 'Le pronom de reprise s\'accorde en nombre avec son antécédent.'
                            };
                            this.erreursTrouvees.push(erreur);
                            motActuel.erreurs.push(erreur);
                        }
                    }
                }
                
                // Vérification de l'accord en nombre
                let nombreSujet = sujetInfo && sujetInfo.nombre
                    ? sujetInfo.nombre
                    : this.getNombreSujetAvecCorrections(motActuel, i);
                // Si le sujet porte déjà une erreur nominale (ex: "chat" -> "chats"),
                // utiliser le nombre attendu de la correction pour vérifier aussi le verbe.
                const erreurNom = (sujetReference.erreurs || []).find((e) => e.type === 'accord_nom_nombre');
                if (erreurNom && typeof erreurNom.correction === 'string' && erreurNom.correction.trim()) {
                    const donneesCorrectionNom = this.getWordData(erreurNom.correction);
                    const nombreCorrectionNom = donneesCorrectionNom ? this.normaliserNombre(donneesCorrectionNom.nombre) : null;
                    if (nombreCorrectionNom) {
                        nombreSujet = nombreCorrectionNom;
                    } else {
                        const corr = erreurNom.correction.toLowerCase();
                        if (corr.endsWith('s') || corr.endsWith('x')) {
                            nombreSujet = 'pluriel';
                        }
                    }
                }
                const nombreVerbe = this.normaliserNombre(motSuivant.donnees.nombre);

                if (nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                    // Ne pas corriger un verbe pluriel fort si le sujet est un pronom singulier :
                    // l'erreur est probablement dans le pronom (elle → elles), pas dans le verbe.
                    const VERBES_PLURIELS_ROBUSTES = new Set(['sont', 'etaient', 'étaient', 'etions', 'étions', 'etiez', 'étiez', 'furent', 'fûmes']);
                    const verbePlurelRobuste = VERBES_PLURIELS_ROBUSTES.has(this.normaliserTexte(motSuivant.texte || ''));
                    const sujetPronomSingulier = nombreSujet === 'singulier' && this.estType(sujetReference.donnees, 'pronom');
                    if (verbePlurelRobuste && sujetPronomSingulier) {
                        // skip — l'erreur est dans le pronom (elle → elles), pas dans le verbe
                    } else {
                    const correctionSujetVerbe = this.suggereCorrectionVerbe(motSuivant.donnees, nombreSujet, motSuivant.texte, sujetReference);
                    const correctionAjustee = this.ajusterCorrectionSubjonctifIlFautQue(i + 1, correctionSujetVerbe, sujetReference);
                    if (estVerbeProtegeConjugaison(i + 1, correctionAjustee)) {
                        continue;
                    }
                    if (this.normaliserTexte(correctionAjustee) === this.normaliserTexte(motSuivant.texte)) {
                        continue;
                    }
                    const erreur = {
                        type: 'accord_sujet_verbe',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: correctionAjustee,
                        explication: `Tu n'as pas accordé le verbe "${motSuivant.texte}" avec le sujet "${sujetReference.texte}".`,
                        regle: 'Le verbe doit s\'accorder en nombre avec son sujet.',
                        nombreSujet: nombreSujet,
                        variationsVerbe: this.extraireVariationsVerbe(motSuivant.texte) || this.extraireVariationsVerbe(correctionAjustee)
                    };
                    
                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                    }
                }

                const correctionPersonne = this.trouverCorrectionFormeVerbaleUsuelle(motSuivant.texte, sujetReference);
                const dejaSignale = (motSuivant.erreurs || []).some((e) => e && ['accord_sujet_verbe', 'conjugaison_verbe'].includes(e.type));
                // Guard: ne pas générer conjugaison_verbe quand le verbe est un pluriel fort (sont, étaient…)
                // et que le sujet proche est un pronom singulier — l'erreur est dans le pronom, pas le verbe.
                const VERBES_PL_ROB_PERS = new Set(['sont', 'etaient', 'étaient', 'etions', 'étions', 'etiez', 'étiez', 'furent', 'fûmes']);
                const estVerbePlurielFort = VERBES_PL_ROB_PERS.has(this.normaliserTexte(motSuivant.texte || ''));
                const nombreSujetPourGuard = nombreSujet || this.getNombreSujet(sujetReference);
                const estSujetPronomSingulier = nombreSujetPourGuard === 'singulier' && this.estType(sujetReference.donnees, 'pronom');
                if (!dejaSignale && !(estVerbePlurielFort && estSujetPronomSingulier) && correctionPersonne && this.normaliserTexte(correctionPersonne) !== this.normaliserTexte(motSuivant.texte)) {
                    const correctionAjustee = this.ajusterCorrectionSubjonctifIlFautQue(i + 1, correctionPersonne, sujetReference);
                    if (estVerbeProtegeConjugaison(i + 1, correctionAjustee)) {
                        continue;
                    }
                    const erreur = {
                        type: 'conjugaison_verbe',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: correctionAjustee,
                        explication: `Avec le sujet "${sujetReference.texte}", la forme verbale attendue est "${correctionAjustee}".`,
                        regle: 'La terminaison du verbe depend aussi de la personne du sujet : je, tu, il/elle/on, nous, vous, ils/elles.'
                    };
                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                } else if (!dejaSignale && !correctionPersonne && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees)) {
                    // Règle -ez : après "vous" sujet, le verbe doit être en -ez (pas à l'infinitif)
                    const texteSujetRef = this.normaliserTexte(sujetReference && sujetReference.texte ? sujetReference.texte : '');
                    if (texteSujetRef === 'vous') {
                        const motNorm = this.normaliserTexte(motSuivant.texte);
                        let corrEz = null;
                        if (this.formesVerbalesUsuelles[motNorm]) {
                            corrEz = this.formesVerbalesUsuelles[motNorm][4];
                        } else if (motNorm.endsWith('er')) {
                            const c = motNorm.slice(0, -2) + 'ez';
                            const dc = this.getWordData(c);
                            if (dc && this.estType(dc, 'verbe')) corrEz = c;
                        } else if (motNorm.endsWith('ir')) {
                            const c = motNorm.slice(0, -2) + 'issez';
                            const dc = this.getWordData(c);
                            if (dc && this.estType(dc, 'verbe')) corrEz = c;
                        }
                        if (corrEz && corrEz !== motSuivant.texte) {
                            if (estVerbeProtegeConjugaison(i + 1, corrEz)) {
                                continue;
                            }
                            const erreur = { type: 'conjugaison_verbe', position: i + 1, mot: motSuivant.texte, correction: corrEz, explication: `Avec le sujet "vous", le verbe prend la terminaison en -ez.`, regle: 'Avec le sujet vous, le verbe conjugué se termine en -ez.' };
                            this.erreursTrouvees.push(erreur);
                            motSuivant.erreurs.push(erreur);
                        }
                    }
                }
            }

            // Pattern relatif: "... nom qui chante"
            if (this.normaliserTexte(motActuel.texte) === 'qui' && this.estType(motSuivant.donnees, 'verbe')) {
                const antecedent = this.trouverAntecedentRelatif(i);
                if (antecedent && antecedent.mot) {
                    const nombreSujet = this.getNombreSujetAvecCorrections(antecedent.mot, antecedent.index);
                    const nombreVerbe = this.normaliserNombre(motSuivant.donnees.nombre);
                    if (nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                        const correctionSujetVerbe = this.suggereCorrectionVerbe(motSuivant.donnees, nombreSujet, motSuivant.texte, antecedent.mot);
                        const erreur = {
                            type: 'accord_sujet_verbe',
                            position: i + 1,
                            mot: motSuivant.texte,
                            correction: correctionSujetVerbe,
                            explication: `Le verbe "${motSuivant.texte}" doit s'accorder avec l'antécédent de "qui" : "${antecedent.mot.texte}".`,
                            regle: 'Dans une proposition relative, le verbe s\'accorde avec l\'antécédent de "qui".'
                        };
                        this.erreursTrouvees.push(erreur);
                        motSuivant.erreurs.push(erreur);
                    }
                }
            }

            const motIntercale = this.phraseAnalysee[i + 1];
            const motVerbeApresClitique = this.phraseAnalysee[i + 2];
            const clitiqueNormalise = this.normaliserTexte(motIntercale && motIntercale.texte ? motIntercale.texte : '').replace(/[’]/g, "'");
            if (
                this.estSujet(motActuel)
                && motIntercale
                && motVerbeApresClitique
                && MOTS_INTERCALES.has(clitiqueNormalise)
            ) {
                let nombreSujet = this.getNombreSujet(motActuel);
                let sujetPourConjugaison = motActuel;
                if (this.normaliserTexte(motActuel.texte || '') === 'qui') {
                    const antecedent = this.trouverAntecedentRelatif(i);
                    if (antecedent && antecedent.mot) {
                        nombreSujet = this.getNombreSujetAvecCorrections(antecedent.mot, antecedent.index);
                        sujetPourConjugaison = antecedent.mot;
                    }
                }
                const erreurNom = (motActuel.erreurs || []).find((e) => e && e.type === 'accord_nom_nombre' && typeof e.correction === 'string');
                if (erreurNom && erreurNom.correction) {
                    const corr = erreurNom.correction.toLowerCase();
                    if (corr.endsWith('s') || corr.endsWith('x')) {
                        nombreSujet = 'pluriel';
                    }
                }
                const nombreVerbe = this.estType(motVerbeApresClitique.donnees, 'verbe')
                    ? this.normaliserNombre(motVerbeApresClitique.donnees.nombre)
                    : null;
                if (this.estType(motVerbeApresClitique.donnees, 'verbe') && nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                    const correctionSujetVerbe = this.suggereCorrectionVerbe(
                        motVerbeApresClitique.donnees,
                        nombreSujet,
                        motVerbeApresClitique.texte,
                        motActuel
                    );
                    const erreur = {
                        type: 'accord_sujet_verbe',
                        position: i + 2,
                        mot: motVerbeApresClitique.texte,
                        correction: correctionSujetVerbe,
                        explication: `Le verbe "${motVerbeApresClitique.texte}" doit s'accorder avec le sujet "${motActuel.texte}".`,
                        regle: 'Le verbe s\'accorde avec son sujet, même si un petit pronom (se, s\', en...) est placé entre les deux.'
                    };

                    this.erreursTrouvees.push(erreur);
                    motVerbeApresClitique.erreurs.push(erreur);
                }

                const correctionIntercalee = this.trouverCorrectionFormeVerbaleUsuelle(motVerbeApresClitique.texte, sujetPourConjugaison)
                    || this.trouverApproximationFormeVerbaleUsuelle(motVerbeApresClitique.texte, sujetPourConjugaison);
                const dejaSignaleIntercale = (motVerbeApresClitique.erreurs || []).some((e) => e && ['accord_sujet_verbe', 'conjugaison_verbe'].includes(e.type));
                if (!dejaSignaleIntercale && correctionIntercalee && this.normaliserTexte(correctionIntercalee) !== this.normaliserTexte(motVerbeApresClitique.texte)) {
                    if (estVerbeProtegeConjugaison(i + 2, correctionIntercalee)) {
                        continue;
                    }
                    const erreur = {
                        type: 'conjugaison_verbe',
                        position: i + 2,
                        mot: motVerbeApresClitique.texte,
                        correction: correctionIntercalee,
                        explication: `Avec le sujet "${sujetPourConjugaison.texte}", la forme verbale attendue est "${correctionIntercalee}".`,
                        regle: 'La terminaison du verbe depend aussi de la personne du sujet, meme si un mot comme "ne" s intercale.'
                    };

                    this.erreursTrouvees.push(erreur);
                    motVerbeApresClitique.erreurs.push(erreur);
                }
            }

            // Pattern coordonné dans relative: "... qui chante et s'envole"
            if (this.normaliserTexte(motActuel.texte) === 'et' && motIntercale && motVerbeApresClitique
                && CLITIQUES.has(clitiqueNormalise) && this.estType(motVerbeApresClitique.donnees, 'verbe')) {
                let idxQui = i - 1;
                while (idxQui >= 0) {
                    const tok = this.phraseAnalysee[idxQui];
                    if (!tok) break;
                    if (this.estPonctuationToken(tok.texte)) break;
                    if (this.normaliserTexte(tok.texte) === 'qui') break;
                    idxQui -= 1;
                }
                if (idxQui >= 0 && this.phraseAnalysee[idxQui] && this.normaliserTexte(this.phraseAnalysee[idxQui].texte) === 'qui') {
                    const antecedent = this.trouverAntecedentRelatif(idxQui);
                    if (antecedent && antecedent.mot) {
                        const nombreSujet = this.getNombreSujetAvecCorrections(antecedent.mot, antecedent.index);
                        const nombreVerbe = this.normaliserNombre(motVerbeApresClitique.donnees.nombre);
                        if (nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                            const correctionSujetVerbe = this.suggereCorrectionVerbe(
                                motVerbeApresClitique.donnees,
                                nombreSujet,
                                motVerbeApresClitique.texte,
                                antecedent.mot
                            );
                            const erreur = {
                                type: 'accord_sujet_verbe',
                                position: i + 2,
                                mot: motVerbeApresClitique.texte,
                                correction: correctionSujetVerbe,
                                explication: `Le verbe "${motVerbeApresClitique.texte}" doit s'accorder avec "${antecedent.mot.texte}".`,
                                regle: 'Les verbes coordonnés gardent le même sujet : si le sujet est pluriel, les deux verbes sont au pluriel.'
                            };
                            this.erreursTrouvees.push(erreur);
                            motVerbeApresClitique.erreurs.push(erreur);
                        }
                    }
                }
            }

            // Heuristique homophone: sujet + mot connu non-verbe, mais correction probable = verbe (ex: "les enfants son" -> "sont")
            if (this.estSujet(motActuel) && !this.estType(motSuivant.donnees, 'verbe') && !this.estPonctuationToken(motSuivant.texte)) {
                // Eviter les doublons si une erreur de conjugaison est déjà portée sur ce mot.
                if (motSuivant.erreurs && motSuivant.erreurs.some((e) => e.type === 'conjugaison_verbe')) {
                    continue;
                }

                const correctionProbable = this.trouverMotCorrection(motSuivant.texte);

                if (!correctionProbable && this.getNombreSujet(motActuel) === 'singulier' && /ent$/i.test(motSuivant.texte || '')) {
                    const candidatSingulier = String(motSuivant.texte || '').replace(/ent$/i, 'e');
                    if (candidatSingulier && this.normaliserTexte(candidatSingulier) !== this.normaliserTexte(motSuivant.texte || '')) {
                        const erreurHeur = {
                            type: 'conjugaison_verbe',
                            position: i + 1,
                            mot: motSuivant.texte,
                            correction: candidatSingulier,
                            explication: `Avec le sujet "${motActuel.texte}", on attend ici une forme verbale au singulier.`,
                            regle: 'Le verbe s\'accorde avec son sujet en nombre.'
                        };
                        this.erreursTrouvees.push(erreurHeur);
                        motSuivant.erreurs.push(erreurHeur);
                        continue;
                    }
                }

                if (!correctionProbable || correctionProbable.toLowerCase() === motSuivant.texte.toLowerCase()) {
                    continue;
                }

                const donneesCorrection = this.getWordData(correctionProbable);
                if (!this.estType(donneesCorrection, 'verbe')) {
                    continue;
                }

                let correctionProbableConjuguee = this.choisirVariationVerbeSelonSujet(
                    donneesCorrection,
                    motActuel,
                    correctionProbable
                );
                correctionProbableConjuguee = this.ajusterCorrectionVerbeSelonSujet(correctionProbableConjuguee, motActuel);
                const donneesCorrectionConjuguee = this.getWordData(correctionProbableConjuguee) || donneesCorrection;

                const nombreSujet = this.getNombreSujet(motActuel);
                const nombreVerbe = this.normaliserNombre(donneesCorrectionConjuguee.nombre);
                if (nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                    continue;
                }

                const motApres = this.phraseAnalysee[i + 2];
                const contexteCompatible = !motApres
                    || this.estPonctuationToken(motApres.texte)
                    || this.estType(motApres.donnees, 'adjectif')
                    || this.estType(motApres.donnees, 'adverbe')
                    || !motApres.donnees;

                if (!contexteCompatible) {
                    const correctionUsuelle = this.trouverApproximationFormeVerbaleUsuelle(motSuivant.texte, motActuel);
                    if (!correctionUsuelle) {
                        continue;
                    }
                    if (estVerbeProtegeConjugaison(i + 1, correctionUsuelle)) {
                        continue;
                    }

                    const erreur = {
                        type: 'conjugaison_verbe',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: correctionUsuelle,
                        explication: `Avec le sujet "${motActuel.texte}", la forme attendue est "${correctionUsuelle}".`,
                        regle: 'Le verbe doit prendre la bonne forme selon la personne du sujet.'
                    };

                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                    continue;
                }

                const erreur = {
                    type: 'conjugaison_verbe',
                    position: i + 1,
                    mot: motSuivant.texte,
                    correction: correctionProbableConjuguee,
                    explication: `Le mot "${motSuivant.texte}" est incorrect ici. Avec le sujet "${motActuel.texte}", il faut le verbe "${correctionProbableConjuguee}".`,
                    regle: 'Le verbe doit s\'accorder en nombre avec son sujet.',
                    sujet: motActuel.texte,
                    nombreSujet: nombreSujet,
                    variationsVerbe: this.extraireVariationsVerbe(correctionProbableConjuguee)
                };

                if (estVerbeProtegeConjugaison(i + 1, correctionProbableConjuguee)) {
                    continue;
                }

                this.erreursTrouvees.push(erreur);
                motSuivant.erreurs.push(erreur);
            }

            if (this.estSujet(motActuel) && motSuivant && !this.estType(motSuivant.donnees, 'verbe') && !this.estPonctuationToken(motSuivant.texte) && !this.estMotInvariable(motSuivant.texte || '')) {
                const approximation = this.trouverApproximationFormeVerbaleUsuelle(motSuivant.texte, motActuel);
                const dejaSignale = (motSuivant.erreurs || []).some((e) => e && e.type === 'conjugaison_verbe');
                if (!dejaSignale && approximation) {
                    if (estVerbeProtegeConjugaison(i + 1, approximation)) {
                        continue;
                    }
                    const erreur = {
                        type: 'conjugaison_verbe',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: approximation,
                        explication: `Avec le sujet "${motActuel.texte}", la forme attendue est "${approximation}".`,
                        regle: 'Le verbe doit prendre la bonne forme selon la personne du sujet.'
                    };

                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                }
            }
        }

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const verbe = this.phraseAnalysee[i];
            if (!verbe || !this.estType(verbe.donnees, 'verbe') || this.estPonctuationToken(verbe.texte)) {
                continue;
            }

            const dejaSignale = (verbe.erreurs || []).some((e) => e && ['accord_sujet_verbe', 'conjugaison_verbe'].includes(e.type));
            if (dejaSignale) {
                continue;
            }

            const sujetInfo = this.trouverInfosSujetAvantVerbe(i);
            if (!sujetInfo || !sujetInfo.mot) {
                continue;
            }

            const sujetReference = sujetInfo.mot;
            const texteSujetRefBrut = this.normaliserTexte(sujetReference && sujetReference.texte ? sujetReference.texte : '').replace(/[’']/g, '');
            const CLITIQUES_OBJETS = new Set(['me', 'm', 'te', 't', 'se', 's', 'nous', 'vous', 'y', 'en']);
            const idxPrecSujetRef = typeof sujetInfo.index === 'number' ? this.obtenirIndexPrecedentSignificatif(sujetInfo.index) : -1;
            const tokPrecSujetRef = idxPrecSujetRef >= 0 ? this.phraseAnalysee[idxPrecSujetRef] : null;
            if (CLITIQUES_OBJETS.has(texteSujetRefBrut) && tokPrecSujetRef && this.estType(tokPrecSujetRef.donnees, 'verbe')) {
                continue;
            }
            const nombreSujet = sujetInfo.nombre || this.getNombreSujetAvecCorrections(sujetReference, sujetInfo.index);
            const nombreVerbe = this.normaliserNombre(verbe.donnees.nombre);

            // Reprise pronominale au pluriel dans la seconde passe (cas robuste):
            // "... photos elle sont ..." -> "elles"
            const sujetTexteNorm = this.normaliserTexte(sujetReference.texte || '');
            const VERBES_PLURIELS_FORTS_REPRISE = new Set(['sont', 'etaient', 'étaient', 'etions', 'étions', 'etiez', 'étiez', 'furent', 'fûmes']);
            const estVerbePlurielFortObserve = VERBES_PLURIELS_FORTS_REPRISE.has(this.normaliserTexte(verbe.texte || ''));
            if (['il', 'elle'].includes(sujetTexteNorm) && estVerbePlurielFortObserve && typeof sujetInfo.index === 'number' && sujetInfo.index >= 0) {
                let antecedentPluriel = null;
                for (let k = sujetInfo.index - 1; k >= 0 && k >= sujetInfo.index - 8; k--) {
                    const precedent = this.phraseAnalysee[k];
                    if (!precedent) break;
                    if (this.estPonctuationToken(precedent.texte)) break;
                    const erreurNomNombre = (precedent.erreurs || []).some((e) => e && e.type === 'accord_nom_nombre');
                    const candidatNominal = this.estType(precedent.donnees, 'nom') || erreurNomNombre || this.estContexteNominalPlurielProbable(k);
                    if (!candidatNominal) continue;
                    let nombrePrec = this.getNombreSujetAvecCorrections(precedent, k) || this.normaliserNombre(precedent.donnees && precedent.donnees.nombre);
                    if (!nombrePrec) {
                        const tPrec = this.normaliserTexte(precedent.texte || '');
                        if (/[sx]$/.test(tPrec) || this.estContexteNominalPlurielProbable(k)) {
                            nombrePrec = 'pluriel';
                        }
                    }
                    if (nombrePrec === 'pluriel') {
                        antecedentPluriel = precedent;
                        break;
                    }
                }

                if (antecedentPluriel) {
                    const correctionPronom = sujetTexteNorm === 'elle' ? 'elles' : 'ils';
                    const dejaSignalePronom = (sujetReference.erreurs || []).some((e) => e && e.type === 'accord_pronom_nombre');
                    if (!dejaSignalePronom && this.normaliserTexte(sujetReference.texte || '') !== correctionPronom) {
                        const erreurPronom = {
                            type: 'accord_pronom_nombre',
                            position: sujetInfo.index,
                            mot: sujetReference.texte,
                            correction: correctionPronom,
                            explication: `Le pronom "${sujetReference.texte}" reprend "${antecedentPluriel.texte}", il doit donc être au pluriel.`,
                            regle: 'Le pronom de reprise s\'accorde en nombre avec son antécédent.'
                        };
                        this.erreursTrouvees.push(erreurPronom);
                        sujetReference.erreurs.push(erreurPronom);
                    }
                }
            }

            if (nombreSujet && nombreVerbe && nombreSujet !== nombreVerbe) {
                const correctionSujetVerbe = this.suggereCorrectionVerbe(verbe.donnees, nombreSujet, verbe.texte, sujetReference);
                if (estVerbeProtegeConjugaison(i, correctionSujetVerbe)) {
                    continue;
                }
                const erreur = {
                    type: 'accord_sujet_verbe',
                    position: i,
                    mot: verbe.texte,
                    correction: correctionSujetVerbe,
                    explication: `Le verbe "${verbe.texte}" doit s'accorder avec le sujet "${sujetReference.texte}".`,
                    regle: 'Le verbe doit s\'accorder en nombre et en personne avec son sujet.',
                    nombreSujet: nombreSujet,
                    variationsVerbe: this.extraireVariationsVerbe(verbe.texte) || this.extraireVariationsVerbe(correctionSujetVerbe)
                };
                this.erreursTrouvees.push(erreur);
                verbe.erreurs.push(erreur);
                continue;
            }

            const correctionPersonne = this.trouverCorrectionFormeVerbaleUsuelle(verbe.texte, sujetReference);
            const VERBES_PL_ROB_PERS = new Set(['sont', 'etaient', 'étaient', 'etions', 'étions', 'etiez', 'étiez', 'furent', 'fûmes']);
            const estVerbePlurielFort = VERBES_PL_ROB_PERS.has(this.normaliserTexte(verbe.texte || ''));
            const nombreSujetPourGuard = nombreSujet || this.getNombreSujet(sujetReference);
            const estSujetPronomSingulier = nombreSujetPourGuard === 'singulier' && this.estType(sujetReference.donnees, 'pronom');
            if (!(estVerbePlurielFort && estSujetPronomSingulier) && correctionPersonne && this.normaliserTexte(correctionPersonne) !== this.normaliserTexte(verbe.texte)) {
                if (estVerbeProtegeConjugaison(i, correctionPersonne)) {
                    continue;
                }
                const erreur = {
                    type: 'conjugaison_verbe',
                    position: i,
                    mot: verbe.texte,
                    correction: correctionPersonne,
                    explication: `Avec le sujet "${sujetReference.texte}", la forme verbale attendue est "${correctionPersonne}".`,
                    regle: 'La terminaison du verbe depend aussi de la personne du sujet : je, tu, il/elle/on, nous, vous, ils/elles.'
                };
                this.erreursTrouvees.push(erreur);
                verbe.erreurs.push(erreur);
            }
        }
    }

    categories.verifierAccordSujetVerbe = verifierAccordSujetVerbe;

    function verifierAccordAdjectifNom() {
        const NOMS_INVARIABLES_NOMBRE = new Set(['voix']);
        const estAvantPreposition = (indexMot) => {
            if (typeof indexMot !== 'number' || indexMot < 0 || indexMot >= this.phraseAnalysee.length) return false;
            const mot = this.phraseAnalysee[indexMot];
            if (!mot || this.normaliserTexte(mot.texte || '') !== 'avant') return false;

            const idxSuivant = this.obtenirIndexSuivantSignificatif(indexMot);
            if (idxSuivant < 0) return false;
            const suivant = this.phraseAnalysee[idxSuivant];
            const texteSuivant = this.normaliserTexte(suivant && suivant.texte ? suivant.texte : '').replace(/[’']/g, '');
            return texteSuivant === 'de' || texteSuivant === 'qu' || texteSuivant === 'que';
        };
        const obtenirGenreDepuisDeterminant = (indexNom) => {
            if (typeof indexNom !== 'number' || indexNom <= 0) return null;
            const precedent = this.phraseAnalysee[indexNom - 1];
            if (!precedent || !this.estDeterminantNominalToken(precedent)) return null;
            const genreDet = this.normaliserGenre(precedent.donnees && precedent.donnees.genre);
            return genreDet && genreDet !== 'mixte' ? genreDet : null;
        };

        const obtenirNomReferenceAccord = (motNom) => {
            if (!motNom || !motNom.donnees) return motNom ? motNom.donnees : null;
            const erreurNomNombre = Array.isArray(motNom.erreurs)
                ? motNom.erreurs.find((e) => e && e.type === 'accord_nom_nombre' && typeof e.correction === 'string' && e.correction.trim())
                : null;
            if (!erreurNomNombre) return motNom.donnees;

            const donneesCorrection = this.getWordData(erreurNomNombre.correction);
            if (donneesCorrection && this.estType(donneesCorrection, 'nom')) {
                return donneesCorrection;
            }

            // Fallback : si la correction est plurielle (finit en s ou x), simuler nombre pluriel
            const corrLower = erreurNomNombre.correction.toLowerCase();
            if (corrLower.endsWith('s') || corrLower.endsWith('x')) {
                return Object.assign({}, motNom.donnees, { nombre: 'pluriel' });
            }

            return motNom.donnees;
        };

        const enrichirReferenceAccord = (motNom, indexNom) => {
            const reference = obtenirNomReferenceAccord(motNom);
            if (!reference) return reference;

            const genreReference = this.normaliserGenre(reference.genre);
            if (genreReference && genreReference !== 'mixte') return reference;

            const genreDet = obtenirGenreDepuisDeterminant(indexNom);
            if (!genreDet) return reference;

            return Object.assign({}, reference, { genre: genreDet });
        };

        const doitSignalerAccordAdjectif = (motAdj, donneesAdj, nomReference) => {
            if (!motAdj || !donneesAdj || !nomReference) return null;

            const correction = this.suggereCorrectionAdjectif(donneesAdj, nomReference, motAdj.texte);
            const correctionNormalisee = this.normaliserTexte(correction || '');
            const texteNormalise = this.normaliserTexte(motAdj.texte || '');
            // Ne signaler que si la correction est réellement différente du mot saisi
            if (correction && correctionNormalisee && correctionNormalisee !== texteNormalise) {
                return correction;
            }

            return null;
        };

        // Recherche des patterns nom + adjectif ou adjectif + nom
        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            const motActuel = this.phraseAnalysee[i];
            const motSuivant = this.phraseAnalysee[i + 1];

            if (this.positionsIgnoreesErreursGeneriques.has(i) || this.positionsIgnoreesErreursGeneriques.has(i + 1)) {
                continue;
            }

            // Pattern nom + adjectif
            if (this.estType(motActuel.donnees, 'nom') && this.estType(motSuivant.donnees, 'adjectif')) {
                if (estAvantPreposition(i + 1)) {
                    continue;
                }
                if (NOMS_INVARIABLES_NOMBRE.has(this.normaliserTexte(motActuel.texte || ''))) {
                    continue;
                }
                const nomReference = enrichirReferenceAccord(motActuel, i);
                const correctionAdjectif = doitSignalerAccordAdjectif(motSuivant, motSuivant.donnees, nomReference);
                if (correctionAdjectif) {
                    const erreur = {
                        type: 'accord_adjectif_nom',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: correctionAdjectif,
                        explication: `L'adjectif "${motSuivant.texte}" ne s'accorde pas avec le nom "${motActuel.texte}".`,
                        regle: 'L\'adjectif s\'accorde avec le nom qu\'il qualifie : masculin/féminin et singulier/pluriel (ex: petit/petite/petits/petites).'
                    };
                    
                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                }
            }

            // Pattern nom + mot qui peut être adjectif (première entrée dict pas adjectif, ex: "long")
            if (this.estType(motActuel.donnees, 'nom') && !this.estType(motSuivant.donnees, 'adjectif')) {
                const donneesAdj = this.getWordDataOfType(motSuivant.texte, 'adjectif');
                if (donneesAdj) {
                    if (estAvantPreposition(i + 1)) {
                        continue;
                    }
                    const nomReference = enrichirReferenceAccord(motActuel, i);
                    const correctionAdjectif = doitSignalerAccordAdjectif(motSuivant, donneesAdj, nomReference);
                    if (correctionAdjectif) {
                        const erreur = {
                            type: 'accord_adjectif_nom',
                            position: i + 1,
                            mot: motSuivant.texte,
                            correction: correctionAdjectif,
                            explication: `L'adjectif "${motSuivant.texte}" ne s'accorde pas avec le nom "${motActuel.texte}".`,
                            regle: 'L\'adjectif s\'accorde avec le nom qu\'il qualifie : masculin/féminin et singulier/pluriel (ex: petit/petite/petits/petites).'
                        };
                        this.erreursTrouvees.push(erreur);
                        motSuivant.erreurs.push(erreur);
                    }
                }
            }

            // Pattern adjectif + nom
            if (this.estType(motActuel.donnees, 'adjectif') && this.estType(motSuivant.donnees, 'nom')) {
                const nomReference = enrichirReferenceAccord(motSuivant, i + 1);
                const correctionAdjectif = doitSignalerAccordAdjectif(motActuel, motActuel.donnees, nomReference);
                if (correctionAdjectif) {
                    const erreur = {
                        type: 'accord_adjectif_nom',
                        position: i,
                        mot: motActuel.texte,
                        correction: correctionAdjectif,
                        explication: `L'adjectif "${motActuel.texte}" ne s'accorde pas avec le nom "${motSuivant.texte}".`,
                        regle: 'L\'adjectif s\'accorde avec le nom qu\'il qualifie : masculin/féminin et singulier/pluriel (ex: petit/petite/petits/petites).'
                    };
                    
                    this.erreursTrouvees.push(erreur);
                    motActuel.erreurs.push(erreur);
                }
            }

            // Pattern determinant + adjectif + nom : "la petite fille"
            const motApres = this.phraseAnalysee[i + 2];
            if (
                this.estDeterminantNominalToken(motActuel)
                && motSuivant
                && motApres
                && this.estType(motSuivant.donnees, 'adjectif')
                && this.estType(motApres.donnees, 'nom')
                && (!motSuivant.erreurs || motSuivant.erreurs.length === 0)
            ) {
                const nomReference = enrichirReferenceAccord(motApres, i + 2);
                const correctionAdjectif = doitSignalerAccordAdjectif(motSuivant, motSuivant.donnees, nomReference);
                if (correctionAdjectif) {
                    const erreur = {
                        type: 'accord_adjectif_nom',
                        position: i + 1,
                        mot: motSuivant.texte,
                        correction: correctionAdjectif,
                        explication: `L'adjectif "${motSuivant.texte}" doit s'accorder avec le nom "${motApres.texte}".`,
                        regle: 'Dans un groupe nominal, l’adjectif s’accorde avec le nom qu’il accompagne : masculin/féminin et singulier/pluriel.'
                    };

                    this.erreursTrouvees.push(erreur);
                    motSuivant.erreurs.push(erreur);
                }
            }

            if (
                this.estDeterminantNominalToken(motActuel)
                && motSuivant
                && motApres
                && !this.estType(motSuivant.donnees, 'adjectif')
                && this.estType(motApres.donnees, 'nom')
                && (!motSuivant.erreurs || motSuivant.erreurs.length === 0)
                && !this.estPonctuationToken(motSuivant.texte)
            ) {
                const correctionBrute = this.trouverMotCorrection(motSuivant.texte, { indexMot: i + 1, phrase: this.phraseAnalysee });
                const donneesAdj = correctionBrute ? (this.getWordDataOfType(correctionBrute, 'adjectif') || this.getWordData(correctionBrute)) : null;
                if (donneesAdj && this.estType(donneesAdj, 'adjectif')) {
                    const nomReference = enrichirReferenceAccord(motApres, i + 2);
                    const correctionAdjectif = this.suggereCorrectionAdjectif(donneesAdj, nomReference, correctionBrute || motSuivant.texte);
                    if (correctionAdjectif && this.normaliserTexte(correctionAdjectif) !== this.normaliserTexte(motSuivant.texte || '')) {
                        const erreur = {
                            type: 'accord_adjectif_nom',
                            position: i + 1,
                            mot: motSuivant.texte,
                            correction: correctionAdjectif,
                            explication: `L'adjectif "${motSuivant.texte}" doit s'accorder avec le nom "${motApres.texte}".`,
                            regle: 'Dans un groupe nominal, l’adjectif s’accorde avec le nom en genre et en nombre.'
                        };
                        this.erreursTrouvees.push(erreur);
                        motSuivant.erreurs.push(erreur);
                    }
                }
            }
        }

        // Pattern attribut du sujet : être + adjectif
        const ADVERBES_INTENSITE_ACCORD = new Set(['très', 'tres', 'trop', 'assez', 'vraiment', 'plutôt', 'plutot', 'si', 'bien', 'fort']);
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const motEtre = this.phraseAnalysee[i];
            if (!this.estFormeEtreTexte(motEtre.texte)) continue;

            // Trouver l'adjectif après l'être (en sautant adverbes d'intensité)
            let j = i + 1;
            while (j < this.phraseAnalysee.length && ADVERBES_INTENSITE_ACCORD.has(this.normaliserTexte(this.phraseAnalysee[j].texte || ''))) j++;
            if (j >= this.phraseAnalysee.length) continue;

            const motAdj = this.phraseAnalysee[j];
            if (!this.estType(motAdj.donnees, 'adjectif')) continue;
            const dejaSignaleAdj = (motAdj.erreurs || []).some((e) => e && e.type === 'accord_adjectif_nom');
            if (dejaSignaleAdj) continue;

            const sujetInfo = this.trouverInfosSujetAvantVerbe(i);
            if (!sujetInfo || !sujetInfo.mot) continue;

            const sujetReference = enrichirReferenceAccord(sujetInfo.mot, sujetInfo.index);
            const correctionAdj = doitSignalerAccordAdjectif(motAdj, motAdj.donnees, sujetReference);
            if (!correctionAdj) continue;

            const erreur = {
                type: 'accord_adjectif_nom',
                position: j,
                mot: motAdj.texte,
                correction: correctionAdj,
                explication: `L'adjectif attribut "${motAdj.texte}" doit s'accorder avec le sujet "${sujetInfo.mot.texte}".`,
                regle: 'L\'adjectif attribut s\'accorde en genre et en nombre avec le sujet du verbe être.'
            };
            this.erreursTrouvees.push(erreur);
            motAdj.erreurs.push(erreur);
        }
    }

    categories.verifierAccordAdjectifNom = verifierAccordAdjectifNom;

    function verifierAccordsComplexes() {
        const couleursInvariablesNominales = new Set(['marron', 'orange']);
        const secondsCouleurComposee = new Set(['marine', 'turquoise']);
        const estSujetCoordonne = (mot) => {
            if (!mot) return false;
            if (this.estSujetOuPronomToken(mot)) return true;
            const t = this.normaliserTexte(mot.texte || '');
            return new Set(['moi', 'toi', 'lui', 'eux']).has(t);
        };

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;

            const texte = this.normaliserTexte(mot.texte);

            // Couleurs issues d'un nom: invariables (ex: des pulls marron, des robes orange).
            if (couleursInvariablesNominales.has(texte.replace(/s$/, '')) && /s$/i.test(texte)) {
                const precedent = this.phraseAnalysee[i - 1];
                if (precedent && (this.estType(precedent.donnees, 'nom') || (this.estType(precedent.donnees, 'verbe') && this.estFormeEtreTexte(precedent.texte)))) {
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'accord_adjectif_couleur_invariable',
                        position: i,
                        mot: mot.texte,
                        correction: texte.replace(/s$/i, ''),
                        explication: 'Cet adjectif de couleur issu d\'un nom est invariable.',
                        regle: 'Les couleurs issues d\'un nom (marron, orange...) restent invariables.'
                    }));
                    continue;
                }
            }

            // Couleur composée: invariable (ex: des yeux bleu marine).
            if (i >= 2) {
                const mot1 = this.phraseAnalysee[i - 1];
                const nom = this.phraseAnalysee[i - 2];
                const t1 = this.normaliserTexte(mot1 && mot1.texte ? mot1.texte : '');
                const t2 = this.normaliserTexte(mot.texte);
                // Obtenir la forme masculine singulier de base (bleu, vert, etc.)
                let base1;
                if (t1.endsWith('es') && t1.length > 3) {
                    const b = t1.slice(0, -2);
                    const db = this.getWordData(b);
                    base1 = (db && this.estType(db, 'adjectif')) ? b : t1.replace(/s$/i, '');
                } else if (t1.endsWith('e') && t1.length > 2) {
                    const b = t1.slice(0, -1);
                    const db = this.getWordData(b);
                    base1 = (db && this.estType(db, 'adjectif')) ? b : t1;
                } else {
                    base1 = t1.replace(/s$/i, '');
                }
                const base2 = t2.replace(/s$/i, '');

                if (nom && this.estType(nom.donnees, 'nom') && secondsCouleurComposee.has(base2) && (this.estType(mot1 && mot1.donnees, 'adjectif') || this.estType(mot1 && mot1.donnees, 'nom'))) {
                    const aAccord1 = /s$/i.test(t1);
                    const aAccord2 = /s$/i.test(t2);
                    if (aAccord1 || aAccord2) {
                        this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                            type: 'accord_adjectif_couleur_compose',
                            position: i - 1,
                            indexDebut: i - 1,
                            spanLongueur: 2,
                            mot: `${mot1.texte} ${mot.texte}`,
                            correction: `${base1} ${base2}`,
                            explication: 'Une couleur composée s\'écrit en général sans accord.',
                            regle: 'Les adjectifs de couleur composés restent invariables (ex: des yeux bleu marine).'
                        }));
                        continue;
                    }
                }
            }

            // Sujets multiples coordonnés: "X et Y" -> verbe au pluriel.
            if (texte === 'et' && i > 0 && i + 2 < this.phraseAnalysee.length) {
                const sujet1 = this.phraseAnalysee[i - 1];
                const sujet2 = this.phraseAnalysee[i + 1];
                const verbe = this.phraseAnalysee[i + 2];

                if (estSujetCoordonne(sujet1) && estSujetCoordonne(sujet2) && verbe && this.estType(verbe.donnees, 'verbe')) {
                    const verbeTexte = this.normaliserTexte(verbe.texte || '');
                    const nombreVerbe = this.normaliserNombre(verbe.donnees.nombre)
                        || (/ent$/.test(verbeTexte)
                            ? 'pluriel'
                            : (/^(est|a|va|fait|doit|peut|veut|mange)$/.test(verbeTexte) ? 'singulier' : null));
                    if (nombreVerbe && nombreVerbe !== 'pluriel') {
                        const t1 = this.normaliserTexte(sujet1.texte || '');
                        const t2 = this.normaliserTexte(sujet2.texte || '');
                        const coordNous = new Set(['je', 'j', 'tu', 'moi', 'toi', 'nous', 'vous']);
                        const sujetCible = (coordNous.has(t1) || coordNous.has(t2)) ? 'nous' : 'ils';

                        let correction = null;
                        if (Array.isArray(verbe.donnees && verbe.donnees.variations) && verbe.donnees.variations.length >= 6) {
                            correction = sujetCible === 'nous' ? verbe.donnees.variations[3] : verbe.donnees.variations[5];
                        }
                        if (!correction && verbeTexte === 'est') {
                            correction = sujetCible === 'nous' ? 'sommes' : 'sont';
                        }
                        if (!correction && verbeTexte === 'a') {
                            correction = sujetCible === 'nous' ? 'avons' : 'ont';
                        }
                        if (!correction) {
                            correction = this.suggereCorrectionVerbe(verbe.donnees, 'pluriel', verbe.texte, sujet2);
                        }
                        this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                            type: 'accord_sujet_multiple_verbe',
                            position: i + 2,
                            mot: verbe.texte,
                            correction,
                            explication: 'Avec deux sujets coordonnés par "et", le verbe se met au pluriel.',
                            regle: 'Deux sujets reliés par "et" entraînent en général un accord du verbe au pluriel.'
                        }));
                    }
                }
            }
        }
    }

    categories.verifierAccordsComplexes = verifierAccordsComplexes;

})(typeof window !== 'undefined' ? window : globalThis);
