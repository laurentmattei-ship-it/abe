/**
 * Catégorie extraite d'analyseur.js
 * Fichier: lexique.js
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierInvariablesMultiMots() {
        // Expressions sur 2 tokens (ex: "au dessus", "par ce que").
        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i) || this.positionsIgnoreesErreursGeneriques.has(i + 1)) {
                continue;
            }

            const fenetre = this.construireFenetreTokens(i, 2);
            if (!fenetre) continue;
            const source = `${fenetre[0]} ${fenetre[1]}`;
            const cle = this.normaliserCleExpressionInvariable(source);
            const canonique = this.indexExpressionsInvariables.get(cle);
            if (!canonique) continue;

            const sourceNormalise = source.toLowerCase().replace(/[’]/g, "'").trim();
            const canoniqueNormalise = canonique.toLowerCase().replace(/[’]/g, "'").trim();
            if (sourceNormalise === canoniqueNormalise) continue;

            const erreur = this.creerErreurMotInvariable({
                source,
                correction: canonique,
                indexDebut: i,
                spanLongueur: 2
            });
            this.erreursTrouvees.push(erreur);
            this.marquerSpanErreurInvariable(erreur);
            i += 1;
        }

        // Formes compactées sur 1 token (ex: "parceque", "audessus").
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;
            if (this.estPonctuationToken(mot.texte)) continue;
            if (mot.erreurs && mot.erreurs.length > 0) continue;

            const cle = this.normaliserCleExpressionInvariable(mot.texte);
            const canonique = this.indexExpressionsInvariables.get(cle);
            if (!canonique) continue;

            const formeBrute = (mot.texte || '').toLowerCase().replace(/[’]/g, "'").trim();
            const canoniqueBrute = canonique.toLowerCase().replace(/[’]/g, "'").trim();
            if (formeBrute === canoniqueBrute) continue;

            const erreur = this.creerErreurMotInvariable({
                source: mot.texte,
                correction: canonique,
                indexDebut: i,
                spanLongueur: 1
            });
            this.erreursTrouvees.push(erreur);
            this.marquerSpanErreurInvariable(erreur);
        }
    }

    categories.verifierInvariablesMultiMots = verifierInvariablesMultiMots;

    function verifierLexiqueFigePrioritaire() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte || this.estPonctuationToken(mot.texte)) continue;
            if (Array.isArray(mot.erreurs) && mot.erreurs.length > 0) continue;

            const cle = this.normaliserCleExpressionInvariable(mot.texte);

            const correctionSFantome = this.lexiqueFigePrioritaire.invariablesSFantomes.get(cle);
            if (correctionSFantome) {
                this.enregistrerErreurContextuelle(this.creerErreurLexiqueFige({
                    type: 'invariable_s_fantome',
                    position: i,
                    mot: mot.texte,
                    correction: correctionSFantome,
                    explication: `Le mot "${correctionSFantome}" est un mot repère qui garde toujours son "s" final.`,
                    regle: 'Certains mots invariables finissent toujours par -s, même quand on n’entend pas ce son.',
                    memo: 'Mot étiquette : il garde toujours sa tenue complète, avec son s final.',
                    exemples: ['toujour → toujours', 'parfoi → parfois', 'alor → alors'],
                    titreAide: 'Mot invariable à s final'
                }));
                continue;
            }

            const correctionLiaison = this.lexiqueFigePrioritaire.motsLiaison.get(cle);
            if (correctionLiaison) {
                this.enregistrerErreurContextuelle(this.creerErreurLexiqueFige({
                    type: 'mot_liaison_lexical',
                    position: i,
                    mot: mot.texte,
                    correction: correctionLiaison,
                    explication: `Le mot de liaison "${correctionLiaison}" a une orthographe fixe qu’il faut mémoriser.`,
                    regle: 'Les mots de liaison structurent la phrase : on mémorise leur orthographe exacte.',
                    memo: 'Ces petits mots organisent les idées : on les retient comme des étiquettes toutes faites.',
                    exemples: ["dabord → d'abord", 'pourtan → pourtant', 'dorenavant → dorénavant'],
                    titreAide: 'Mot de liaison'
                }));
            }
        }
    }

    categories.verifierLexiqueFigePrioritaire = verifierLexiqueFigePrioritaire;

    function verifierLocutionsEtOralite() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte || this.estPonctuationToken(mot.texte)) continue;
            if (Array.isArray(mot.erreurs) && mot.erreurs.length > 0) continue;

            const texteMotLoop = this.normaliserTexte(mot.texte || '');
            const idxPrecLoop = this.obtenirIndexPrecedentSignificatif(i);
            const idxSuivLoop = this.obtenirIndexSuivantSignificatif(i);
            const textePrecLoop = this.normaliserTexte(idxPrecLoop >= 0 && this.phraseAnalysee[idxPrecLoop] ? this.phraseAnalysee[idxPrecLoop].texte : '');
            const texteSuivLoop = this.normaliserTexte(idxSuivLoop >= 0 && this.phraseAnalysee[idxSuivLoop] ? this.phraseAnalysee[idxSuivLoop].texte : '');
            if (texteMotLoop === 'y' && textePrecLoop === 'il' && texteSuivLoop === 'a') {
                continue;
            }

            const cleSimple = this.normaliserCleExpressionInvariable(mot.texte);
            const correctionOraleSimple = this.locutionsOrales.simples.get(cleSimple);
            if (correctionOraleSimple) {
                const texteMot = this.normaliserTexte(mot.texte || '');
                const idxPrec = this.obtenirIndexPrecedentSignificatif(i);
                const idxSuiv = this.obtenirIndexSuivantSignificatif(i);
                const textePrec = this.normaliserTexte(idxPrec >= 0 && this.phraseAnalysee[idxPrec] ? this.phraseAnalysee[idxPrec].texte : '');
                const texteSuiv = this.normaliserTexte(idxSuiv >= 0 && this.phraseAnalysee[idxSuiv] ? this.phraseAnalysee[idxSuiv].texte : '');
                if (texteMot === 'y' && textePrec === 'il' && texteSuiv === 'a') {
                    continue;
                }

                this.enregistrerErreurContextuelle(this.creerErreurLexiqueFige({
                    type: 'oralite_familiere',
                    position: i,
                    mot: mot.texte,
                    correction: correctionOraleSimple,
                    explication: 'Cette écriture reprend l’oral. Pour une phrase scolaire, on la reformule complètement.',
                    regle: 'À l’écrit scolaire, on évite les formes orales raccourcies et on écrit la phrase développée.',
                    memo: 'Ce qu’on dit vite à l’oral se réécrit souvent en plusieurs mots à l’écrit.',
                    exemples: ["y'a → il y a", 'chais → je sais'],
                    titreAide: 'Forme orale à reformuler'
                }));
                continue;
            }

            const correctionCompacte = this.trouverCorrectionInvariableCompacte(mot.texte);
            if (correctionCompacte && (correctionCompacte.includes(' ') || correctionCompacte.includes('-') || correctionCompacte.includes("'"))) {
                this.enregistrerErreurContextuelle(this.creerErreurLexiqueFige({
                    type: 'locution_mal_segmentee',
                    position: i,
                    mot: mot.texte,
                    correction: correctionCompacte,
                    explication: 'Cette expression s’écrit en plusieurs morceaux fixes : on ne la colle pas au hasard.',
                    regle: 'Certaines locutions ont une forme figée avec des espaces, un trait d’union ou une apostrophe à respecter.',
                    memo: 'Expression toute prête : on la retient comme un bloc, avec sa bonne découpe.',
                    exemples: ['parceque → parce que', 'peutetre → peut-être', 'toutacou → tout à coup'],
                    titreAide: 'Locution à bien découper'
                }));
            }
        }

        for (const entree of this.locutionsOrales.sequences) {
            const longueur = entree.source.length;
            for (let i = 0; i <= this.phraseAnalysee.length - longueur; i++) {
                let correspond = true;
                const morceaux = [];

                for (let j = 0; j < longueur; j++) {
                    const token = this.phraseAnalysee[i + j];
                    if (!token || this.estPonctuationToken(token.texte) || this.positionsIgnoreesErreursGeneriques.has(i + j)) {
                        correspond = false;
                        break;
                    }
                    if (Array.isArray(token.erreurs) && token.erreurs.length > 0) {
                        correspond = false;
                        break;
                    }

                    const normalise = this.normaliserTexte(token.texte || '').replace(/[’']/g, '');
                    if (normalise !== entree.source[j]) {
                        correspond = false;
                        break;
                    }
                    morceaux.push(token.texte);
                }

                if (!correspond) continue;

                if (entree.type === 'oralite_familiere' && Array.isArray(entree.source) && entree.source.join(' ') === 'c est pas') {
                    const idxAvant = this.obtenirIndexPrecedentSignificatif(i);
                    const tokAvant = idxAvant >= 0 ? this.phraseAnalysee[idxAvant] : null;
                    const txtAvant = this.normaliserTexte(tokAvant && tokAvant.texte ? tokAvant.texte : '');
                    if (this.estTokenNegation(txtAvant)) {
                        continue;
                    }
                }

                if (entree.type === 'oralite_familiere' && Array.isArray(entree.source) && entree.source.join(' ') === 'y a') {
                    const idxAvant = this.obtenirIndexPrecedentSignificatif(i);
                    const tokAvant = idxAvant >= 0 ? this.phraseAnalysee[idxAvant] : null;
                    const txtAvant = this.normaliserTexte(tokAvant && tokAvant.texte ? tokAvant.texte : '');
                    if (txtAvant === 'il') {
                        continue;
                    }
                }

                if (entree.type === 'oralite_familiere' && Array.isArray(entree.source)) {
                    const fenetreNorm = morceaux.map((m) => this.normaliserTexte(m || '').replace(/[’']/g, '')).join(' ');
                    if (fenetreNorm === 'il y a' || fenetreNorm === 'y a') {
                        continue;
                    }
                }

                this.enregistrerErreurContextuelle(this.creerErreurLexiqueFige({
                    type: entree.type,
                    position: i,
                    indexDebut: i,
                    spanLongueur: longueur,
                    mot: morceaux.join(' '),
                    correction: entree.correction,
                    explication: entree.explication,
                    regle: entree.regle,
                    memo: entree.memo,
                    exemples: entree.exemples,
                    titreAide: entree.titreAide
                }));
                i += longueur - 1;
            }
        }
    }

    categories.verifierLocutionsEtOralite = verifierLocutionsEtOralite;

    function verifierApostrophesObligatoires() {
        const prefixesAutorises = new Set(['j', 'c', 'l', 'm', 'n', 's', 't', 'd', 'qu']);

        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i) || this.positionsIgnoreesErreursGeneriques.has(i + 1)) {
                continue;
            }

            const mot = this.phraseAnalysee[i];
            const suivant = this.phraseAnalysee[i + 1];
            if (!mot || !suivant) continue;
            if (this.estPonctuationToken(mot.texte) || this.estPonctuationToken(suivant.texte)) continue;
            if ((mot.erreurs && mot.erreurs.length > 0) || (suivant.erreurs && suivant.erreurs.length > 0)) continue;

            const texte = this.normaliserTexte(mot.texte);
            if (!prefixesAutorises.has(texte)) continue;
            if (!this.commenceParVoyelleOuH(suivant.texte)) continue;

            const correction = `${mot.texte}'${suivant.texte}`;
            const erreur = this.creerErreurContextuelle({
                type: 'apostrophe_obligatoire',
                position: i,
                indexDebut: i,
                spanLongueur: 2,
                mot: `${mot.texte} ${suivant.texte}`,
                correction,
                explication: `Entre "${mot.texte}" et "${suivant.texte}", l'apostrophe est obligatoire en français.`,
                regle: 'Devant une voyelle ou un h muet, certains petits mots s’élident avec une apostrophe : j\'ai, c\'est, l\'enfant, qu\'il, n\'a.',
                memo: 'Devant une voyelle ou un h muet, on contracte souvent le petit mot avec une apostrophe.',
                exemples: ['j ai → j\'ai', 'c est → c\'est', 'l enfant → l\'enfant'],
                titreAide: 'Apostrophe obligatoire'
            });

            this.enregistrerErreurContextuelle(erreur);
            i += 1;
        }
    }

    categories.verifierApostrophesObligatoires = verifierApostrophesObligatoires;

    function verifierAccentsLexicauxFrequents() {
        const correctionsSimples = new Map([
            ['tres', 'très'],
            ['apres', 'après'],
            ['deja', 'déjà'],
            ['voila', 'voilà']
        ]);

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || this.estPonctuationToken(mot.texte)) continue;
            if (mot.erreurs && mot.erreurs.length > 0) continue;

            const cle = this.normaliserTexte(mot.texte);
            const correction = correctionsSimples.get(cle);
            if (!correction || mot.texte.toLowerCase() === correction) {
                continue;
            }

            const erreur = this.creerErreurContextuelle({
                type: 'accent_lexical',
                position: i,
                mot: mot.texte,
                correction,
                explication: `Le mot "${mot.texte}" a besoin d'un accent pour être correctement orthographié.`,
                regle: 'Certains mots très fréquents ont un accent qu’il faut mémoriser : très, après, déjà, voilà…',
                memo: 'Les accents font partie de l’orthographe du mot : il faut les mémoriser.',
                exemples: ['tres → très', 'apres → après', 'deja → déjà'],
                titreAide: 'Accent lexical'
            });

            this.enregistrerErreurContextuelle(erreur);
        }

        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i) || this.positionsIgnoreesErreursGeneriques.has(i + 1)) {
                continue;
            }

            const mot = this.normaliserTexte(this.phraseAnalysee[i] && this.phraseAnalysee[i].texte);
            const suivant = this.normaliserTexte(this.phraseAnalysee[i + 1] && this.phraseAnalysee[i + 1].texte);
            if (mot !== 'a' || suivant !== 'cote') continue;

            const erreur = this.creerErreurContextuelle({
                type: 'accent_lexical',
                position: i,
                indexDebut: i,
                spanLongueur: 2,
                mot: `${this.phraseAnalysee[i].texte} ${this.phraseAnalysee[i + 1].texte}`,
                correction: 'à côté',
                explication: 'Dans l’expression "à côté", le premier mot prend un accent et le second aussi.',
                regle: 'Certaines expressions fréquentes ont une orthographe figée : à côté, à travers, déjà…',
                memo: 'Dans les expressions fréquentes, l’accent fait partie de l’orthographe à mémoriser.',
                exemples: ['a cote → à côté', 'a travers → à travers', 'deja → déjà'],
                titreAide: 'Accent lexical'
            });

            this.enregistrerErreurContextuelle(erreur);
            i += 1;
        }
    }

    categories.verifierAccentsLexicauxFrequents = verifierAccentsLexicauxFrequents;

    function verifierOrthographeUsageAvancee() {
        const fautesDoublesConsonnes = {
            'acepter': 'accepter',
            'accueuil': 'accueil',
            'acueil': 'accueil',
            'acompagner': 'accompagner',
            'acord': 'accord',
            'accacia': 'acacia',
            'accademie': 'academie',
            'appercevoir': 'apercevoir',
            'appaiser': 'apaiser',
            'appetitif': 'aperitif',
            'ofrir': 'offrir',
            'efort': 'effort',
            'enmener': 'emmener',
            'janbon': 'jambon',
            'chanpion': 'champion'
        };

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;
            if (this.estPonctuationToken(mot.texte)) continue;
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            if (Array.isArray(mot.erreurs) && mot.erreurs.length > 0) continue;

            const texte = this.normaliserTexte(mot.texte);
            const precedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
            const precedentEstDet = this.estDeterminantNominalToken(precedent);
            const nombreDet = precedentEstDet && precedent && precedent.donnees
                ? this.normaliserNombre(precedent.donnees.nombre)
                : null;

            const correctionDouble = fautesDoublesConsonnes[texte];
            if (correctionDouble && correctionDouble !== texte) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'orthographe_usage_double_consonne',
                    position: i,
                    mot: mot.texte,
                    correction: correctionDouble,
                    explication: 'Attention aux doubles consonnes: ce mot suit une orthographe d\'usage specifique.',
                    regle: 'Certains prefixes imposent une consonne double (ac-, ap-, ef-, of-) avec des exceptions a memoriser.'
                }));
                continue;
            }

            const correctionMBP = this.corrigerRegleMDevantBMP(mot.texte);
            if (correctionMBP) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'orthographe_usage_m_devant_bmp',
                    position: i,
                    mot: mot.texte,
                    correction: correctionMBP,
                    explication: 'Devant m, b et p, on ecrit generalement "m" et non "n".',
                    regle: 'Regle m devant m/b/p (ex: emmener, jambon, champion), avec quelques exceptions lexicales.'
                }));
            }
        }
    }

    categories.verifierOrthographeUsageAvancee = verifierOrthographeUsageAvancee;

    function verifierMotsInconnus() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            
            // Ignorer la ponctuation
            if (this.estPonctuationToken(mot.texte)) {
                continue;
            }

            const erreursHorsMajuscule = mot.erreurs
                ? mot.erreurs.filter((erreur) => erreur && !['ponctuation_finale', 'majuscule_phrase'].includes(erreur.type))
                : [];

            if (this.positionsIgnoreesErreursGeneriques.has(i) && erreursHorsMajuscule.length > 0) {
                continue;
            }

            if (erreursHorsMajuscule.length > 0) {
                continue;
            }

            if (this.estMotInvariableCanoniqueConnu(mot.texte)) {
                continue;
            }

            if (this.estMotLexicalTolere(mot.texte)) {
                continue;
            }

            // Connecteurs fréquents parfois absents du lexique principal
            if (['ni'].includes((mot.texte || '').toLowerCase())) {
                continue;
            }

            // Éviter les faux positifs pour certaines formes auxiliaires fréquentes
            if (this.estFormeAuxiliaireConnue(mot.texte)) {
                continue;
            }
            
            // Si le mot n'a pas de données, c'est qu'il n'est pas dans le dictionnaire
            if (!mot.donnees) {
                if (this.estTokenProtege(i)) {
                    continue;
                }

                if (this.estMotLexicalTolere(mot.texte)) {
                    continue;
                }

                if (this.estParticipePasseTolereParAuxiliaire(i)) {
                    continue;
                }

                const texteNormalise = this.normaliserTexte(mot.texte || '');
                if (texteNormalise === 'a' && /[àÀ]/.test(mot.texte || '')) {
                    continue;
                }

                if (this.estLocutionNominaleAuRalenti(i)) {
                    continue;
                }

                const texteBrut = String(mot.texte || '');
                if (/ÔÇÖ|â€™|â€˜/.test(texteBrut)
                    || (texteBrut.includes('Ô') && texteBrut.includes('Ç'))
                    || /^[A-Za-z][^\x00-\x7F]+est$/i.test(texteBrut)) {
                    continue;
                }

                const correctionAccentuee = this.trouverCorrectionAccentueeContextuelle(i);
                const correctionInvariableCompacte = this.trouverCorrectionInvariableCompacte(mot.texte);
                const segmentationProbable = this.trouverSegmentationProbable(mot.texte);
                const correctionMetathese = this.trouverCorrectionMetathese(mot.texte);
                // Trouver la correction probable (ne pas l'afficher dans les indices)
                let correctionProbable =
                    correctionAccentuee
                    ||
                    (segmentationProbable && segmentationProbable.correction)
                    ||
                    correctionMetathese
                    ||
                    correctionInvariableCompacte
                    ||
                    this.trouverCorrectionContextuelleMotInconnu(i)
                    || this.trouverMotCorrection(mot.texte, { indexMot: i, phrase: this.phraseAnalysee });

                if (correctionProbable && this.motsEgauxSansCasse(correctionProbable, mot.texte)) {
                    continue;
                }

                if (!correctionAccentuee && this.doitTolérerMotInconnuAtteste(i, correctionProbable)) {
                    continue;
                }

                if (!correctionAccentuee && this.doitTolererPlurielNominalInconnu(i, correctionProbable)) {
                    continue;
                }

                // Chercher des mots similaires pour donner des indices
                const motsSimilaires = this.trouverMotsSimilaires(mot.texte, correctionProbable);
                const motsSimilairesFiltres = correctionProbable
                    ? motsSimilaires.filter((m) => this.normaliserTexte(m && m.mot) !== this.normaliserTexte(correctionProbable))
                    : motsSimilaires;

                // Heuristique: si la correction probable existe et est un verbe, on traite comme une erreur de conjugaison
                let typeErreur = 'mot_inconnu';
                let sujetTrouve = null;
                let nombreSujet = null;
                let variationsVerbe = null;
                let confusionDetectee = null;
                let metatheseDetectee = null;
                let lettreFantome = null;
                if (correctionProbable) {
                    const donnees = this.getWordData(correctionProbable);
                    const motPrecedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
                    const indexPrecedentSignificatif = this.obtenirIndexPrecedentSignificatif(i);
                    const motPrecedentSignificatif = indexPrecedentSignificatif >= 0 ? this.phraseAnalysee[indexPrecedentSignificatif] : null;
                    const textePrecedentSignificatif = this.normaliserTexte(this.obtenirTexteCorrigeToken(motPrecedentSignificatif));
                    const precedentEstDet = this.estDeterminantNominalToken(motPrecedent);

                    if (segmentationProbable) {
                        typeErreur = 'segmentation_mot_colle';
                    }
                    if (correctionAccentuee && typeErreur === 'mot_inconnu') {
                        typeErreur = 'accent_lexical';
                    }
                    if (correctionMetathese && typeErreur === 'mot_inconnu') {
                        typeErreur = 'metathese';
                    }

                    if (correctionInvariableCompacte || this.estMotInvariable(correctionProbable)) {
                        typeErreur = correctionProbable.includes(' ') || correctionProbable.includes('-') || correctionProbable.includes("'")
                            ? 'locution_mal_segmentee'
                            : 'mot_invariable';
                    }

                    // Contexte nominal prioritaire après déterminant (ex: "des frite" -> "frites")
                    if (precedentEstDet && typeErreur === 'mot_inconnu') {
                        const correctionNom = this.trouverNomProbableApresDeterminant(mot.texte, motPrecedent.donnees);
                        if (correctionNom) {
                            typeErreur = 'accord_nom_nombre';
                            variationsVerbe = null;
                            sujetTrouve = null;
                            nombreSujet = null;
                        }
                    }

                    if (typeErreur === 'mot_inconnu' && this.estType(donnees, 'verbe')) {
                        // Après un déterminant, on évite de reclasser un nom possible en verbe.
                        if (precedentEstDet) {
                            continue;
                        }

                        // Tolérer les formes conjuguées vraisemblables d'un verbe connu (ex: hurlent → hurler)
                        const infVraisemblable = this.trouverInfinitifDepuisFormeConjuguee(mot.texte);
                        if (infVraisemblable) continue;
                        typeErreur = 'conjugaison_verbe';
                        // Chercher le sujet réel avant le verbe (en sautant ne/n' et les clitiques).
                        const sujetMot = this.trouverSujetAvantIndex(i);

                        if (this.estAuxiliaireTempsTexte(textePrecedentSignificatif) 
                            && motPrecedentSignificatif 
                            && this.estType(motPrecedentSignificatif.donnees, 'verbe')
                            && this.estFormeInfinitive(correctionProbable, donnees)) {
                            const participe = this.trouverParticipePasse(correctionProbable);
                            if (participe) {
                                correctionProbable = this.ajusterParticipePasseAvecSujet(participe, indexPrecedentSignificatif);
                                typeErreur = 'verbe_participe_requis';
                            }
                        } else if (this.estSemiAuxiliaireTexte(textePrecedentSignificatif) 
                            && motPrecedentSignificatif 
                            && this.estType(motPrecedentSignificatif.donnees, 'verbe')
                            && !this.estFormeInfinitive(correctionProbable, donnees)) {
                            const infinitif = this.trouverInfinitifDepuisFormeConjuguee(correctionProbable) || correctionProbable;
                            if (infinitif) {
                                correctionProbable = infinitif;
                                typeErreur = 'verbe_infinitif_requis';
                            }
                        }

                        if (sujetMot) {
                            sujetTrouve = sujetMot.texte;
                            nombreSujet = this.getNombreSujet(sujetMot);

                            if (typeErreur === 'conjugaison_verbe') {
                                const correctionConjuguee = this.choisirVariationVerbeSelonSujet(
                                    donnees,
                                    sujetMot,
                                    correctionProbable
                                );
                                if (correctionConjuguee) {
                                    const correctionPersonnalisee = this.ajusterCorrectionVerbeSelonSujet(correctionConjuguee, sujetMot);
                                    correctionProbable = this.ajusterCorrectionSubjonctifIlFautQue(i, correctionPersonnalisee, sujetMot);
                                }
                            }
                        }
                        if (typeErreur === 'conjugaison_verbe') {
                            correctionProbable = this.ajusterCorrectionSubjonctifIlFautQue(i, correctionProbable, sujetMot || null);
                            if (this.estContexteSiImparfaitProtege(i, correctionProbable)) {
                                continue;
                            }
                            if (this.estDansTunnelSubjonctif(i)) {
                                continue;
                            }
                        }
                        variationsVerbe = this.extraireVariationsVerbe(correctionProbable);
                    }

                    // Détection de confusion phonographique en dernier recours
                    if (typeErreur === 'mot_inconnu') {
                        metatheseDetectee = this.detecterMetatheseAdjacente(mot.texte, correctionProbable);
                        if (metatheseDetectee) {
                            typeErreur = 'metathese';
                        }
                    }

                    if (typeErreur === 'mot_inconnu') {
                        lettreFantome = this.trouverIndiceLettreFantomeFinale(mot.texte, correctionProbable);
                        if (lettreFantome) {
                            typeErreur = 'lettre_fantome_finale';
                        }
                    }

                    if (typeErreur === 'mot_inconnu') {
                        confusionDetectee = this.detecterTypeConfusionPhonographique(mot.texte, correctionProbable);
                        if (confusionDetectee) {
                            typeErreur = 'confusion_phonographique';
                        }
                    }
                }

                const correctionFinale = (typeErreur === 'accord_nom_nombre' && i > 0)
                    ? (this.trouverNomProbableApresDeterminant(mot.texte, this.phraseAnalysee[i - 1].donnees) || correctionProbable)
                    : correctionProbable;

                const indexPrecedentSignificatif = this.obtenirIndexPrecedentSignificatif(i);
                const motPrecedentSignificatif = indexPrecedentSignificatif >= 0 ? this.phraseAnalysee[indexPrecedentSignificatif] : null;
                const textePrecedentSignificatif = this.normaliserTexte(this.obtenirTexteCorrigeToken(motPrecedentSignificatif));
                const estLocutionFairePeur = typeErreur === 'mot_inconnu'
                    && this.normaliserMotSimple(mot.texte) === 'peurt'
                    && this.normaliserTexte(correctionFinale || '') === 'peur'
                    && ['fait', 'fais', 'faisait', 'fera', 'font'].includes(textePrecedentSignificatif);

                const explicationErreur = estLocutionFairePeur
                    ? 'Dans l’expression "faire peur", on écrit le nom "peur".'
                    : typeErreur === 'accent_lexical'
                        ? `Le mot "${mot.texte}" a besoin d'un accent pour être correctement orthographié.`
                        : typeErreur === 'conjugaison_verbe'
                            ? `Le verbe "${mot.texte}" n'est pas bien conjugué. Il faut respecter les terminaisons du verbe.`
                            : typeErreur === 'verbe_participe_requis'
                            ? `Apres cet auxiliaire, on attend un participe passe et non l'infinitif "${mot.texte}".`
                            : typeErreur === 'verbe_infinitif_requis'
                                ? `Apres ce verbe d'appui, on attend l'infinitif du verbe et non une autre forme.`
                                : typeErreur === 'mot_invariable'
                                    ? `Le mot tel qu'il est ecrit "${mot.texte}" n'existe pas. Le mot attendu est un mot invariable.`
                                    : typeErreur === 'segmentation_mot_colle'
                                        ? `Le mot "${mot.texte}" semble avoir été collé trop vite. Il faut le découper correctement.`
                                        : typeErreur === 'metathese'
                                            ? `Deux lettres ont probablement échangé leur place dans "${mot.texte}".`
                                            : typeErreur === 'lettre_fantome_finale'
                                                ? `Il manque une lettre discrète à la fin de "${mot.texte}".`
                                                : typeErreur === 'accord_nom_nombre'
                                                    ? `Après ce déterminant, le nom doit être correctement écrit au bon nombre.`
                                                    : typeErreur === 'confusion_phonographique'
                                                        ? `"${mot.texte}" se prononce comme "${correctionProbable}" mais ne s'écrit pas de la même façon.`
                                                        : `Le mot tel qu'il est ecrit "${mot.texte}" n'existe pas.`;

                const regleErreur = estLocutionFairePeur
                    ? 'Après le verbe faire, on utilise souvent le nom peur : ce film me fait peur.'
                    : typeErreur === 'accent_lexical'
                        ? 'Certains mots ont un accent qu\'il faut mémoriser : vérifie si un accent est manquant.'
                        : typeErreur === 'conjugaison_verbe'
                            ? 'Le verbe doit être conjugué avec la bonne terminaison selon le sujet.'
                            : typeErreur === 'verbe_participe_requis'
                            ? 'Apres avoir ou etre employe comme auxiliaire de temps, on ecrit en general un participe passe.'
                            : typeErreur === 'verbe_infinitif_requis'
                                ? 'Apres aller, vouloir, pouvoir ou devoir, le deuxieme verbe reste a l infinitif.'
                                : typeErreur === 'mot_invariable'
                                    ? 'Un mot invariable garde toujours la meme orthographe: il ne s\'accorde pas.'
                                    : typeErreur === 'segmentation_mot_colle'
                                        ? 'Certains mots ou groupes de mots doivent rester séparés ou garder leur apostrophe.'
                                        : typeErreur === 'metathese'
                                            ? 'Quand deux lettres échangent leur place, il faut retrouver leur ordre exact pour fixer l’image du mot.'
                                            : typeErreur === 'lettre_fantome_finale'
                                                ? 'Certaines lettres finales ne s’entendent presque pas mais restent visibles dans le mot. Pour trouver la terminaison manquante, on peut souvent mettre le mot au féminin, trouver le verbe duquel il est issu ou un mot de la même famille.'
                                                : typeErreur === 'accord_nom_nombre'
                                                    ? 'Le déterminant et le nom doivent s\'accorder en nombre.'
                                                    : typeErreur === 'confusion_phonographique'
                                                        ? 'Certains sons peuvent s\'écrire de plusieurs façons. Il faut mémoriser la bonne orthographe de chaque mot.'
                                                        : 'Vérifie l\'orthographe du mot ou utilise un mot que tu connais.';

                const erreur = {
                    type: typeErreur,
                    position: i,
                    mot: mot.texte,
                    typeConfusion: confusionDetectee,
                    explication: explicationErreur,
                    regle: regleErreur,
                    motsSimilaires: motsSimilairesFiltres,
                    correction: correctionFinale,
                    optionsOrthographe: ['mot_invariable', 'segmentation_mot_colle', 'locution_mal_segmentee'].includes(typeErreur)
                        ? this.genererOptionsMotInvariable(correctionFinale, mot.texte)
                        : null,
                    sujet: sujetTrouve,
                    nombreSujet: nombreSujet,
                    variationsVerbe: variationsVerbe,
                    metathese: metatheseDetectee,
                    lettreFantome: lettreFantome,
                    motPont: lettreFantome ? lettreFantome.motPont : null,
                    ...(typeErreur === 'accent_lexical' ? {
                        titreAide: 'Accent lexical manquant',
                        memo: "Les accents font partie de l'orthographe du mot : il faut les mémoriser."
                    } : {})
                };
                
                this.erreursTrouvees.push(erreur);
                mot.erreurs.push(erreur);
            }
        }
    }

    categories.verifierMotsInconnus = verifierMotsInconnus;

    function verifierErreursFrequentes() {
        this.verifierFautesLexicalesFrequentes();
        this.verifierMotifsErreursFrequentes();
    }

    categories.verifierErreursFrequentes = verifierErreursFrequentes;

    function verifierFautesLexicalesFrequentes() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || mot.donnees || this.estPonctuationToken(mot.texte)) {
                continue;
            }

            const entree = this.fautesLexicalesFrequentes.get(this.normaliserCleRegle(mot.texte));
            if (!entree) {
                continue;
            }

            const erreur = {
                type: entree.type || 'mot_inconnu',
                position: i,
                mot: mot.texte,
                correction: entree.correction,
                explication: entree.explication || `Le mot "${mot.texte}" est une faute frequente.`,
                regle: entree.regle || 'Verifie l\'orthographe du mot dans le dictionnaire.',
                motsSimilaires: [],
                source: 'erreurs_frequentes'
            };

            this.positionsIgnoreesErreursGeneriques.add(i);
            this.erreursTrouvees.push(erreur);
            mot.erreurs.push(erreur);
        }
    }

    categories.verifierFautesLexicalesFrequentes = verifierFautesLexicalesFrequentes;

    function verifierMotifsErreursFrequentes() {
        if (!Array.isArray(this.motifsErreursFrequentes) || this.motifsErreursFrequentes.length === 0) {
            return;
        }

        for (const motif of this.motifsErreursFrequentes) {
            const taille = motif.contexteNormalise.length;
            for (let i = 0; i <= this.phraseAnalysee.length - taille; i++) {
                const fenetre = this.phraseAnalysee.slice(i, i + taille);
                const correspond = fenetre.every((mot, index) => this.normaliserCleRegle(mot.texte) === motif.contexteNormalise[index]);
                if (!correspond) {
                    continue;
                }

                const positionCible = i + Number(motif.cible || 0);
                const motCible = this.phraseAnalysee[positionCible];
                if (!motCible) {
                    continue;
                }

                if (motif.type === 'oralite_familiere') {
                    const texteCible = this.normaliserTexte(motCible.texte || '');
                    const idxPrec = this.obtenirIndexPrecedentSignificatif(positionCible);
                    const textePrec = this.normaliserTexte(idxPrec >= 0 && this.phraseAnalysee[idxPrec] ? this.phraseAnalysee[idxPrec].texte : '');
                    if (texteCible === 'y' && textePrec === 'il') {
                        continue;
                    }
                }

                fenetre.forEach((_, indexFenetre) => {
                    this.positionsIgnoreesErreursGeneriques.add(i + indexFenetre);
                });

                const dejaPresente = (motCible.erreurs || []).some((erreur) =>
                    erreur.type === motif.type && this.normaliserCleRegle(erreur.correction) === this.normaliserCleRegle(motif.correction)
                );
                if (dejaPresente) {
                    continue;
                }

                const sujetTrouve = motif.type.includes('verbe') ? fenetre[0].texte : null;
                const erreur = {
                    type: motif.type,
                    position: positionCible,
                    mot: motCible.texte,
                    correction: motif.correction,
                    explication: motif.explication || `Le mot "${motCible.texte}" correspond a une erreur frequente.`,
                    regle: motif.regle || 'Observe bien l\'accord dans ce groupe de mots.',
                    motsSimilaires: [],
                    sujet: sujetTrouve,
                    nombreSujet: motif.nombreSujet || null,
                    source: 'erreurs_frequentes'
                };

                this.erreursTrouvees.push(erreur);
                motCible.erreurs.push(erreur);
            }
        }
    }

    categories.verifierMotifsErreursFrequentes = verifierMotifsErreursFrequentes;

})(typeof window !== 'undefined' ? window : globalThis);
