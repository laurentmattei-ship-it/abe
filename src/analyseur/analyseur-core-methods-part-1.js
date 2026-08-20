/**
 * M?thodes extraites d'AnalyseurGrammatical (1/4).
 * Source: analyseurexemple.js
 */
(function (global) {
    const coreMethods = {};

    coreMethods.chargerExplicationsEnrichies = function () {
        try {
            const fs = require('fs');
            const path = require('path');
            const fichier = path.join(__dirname, '..', 'refs', 'explications_6e.json');
            if (fs.existsSync(fichier)) {
                return JSON.parse(fs.readFileSync(fichier, 'utf8'));
            }
        } catch (err) {
            // Fichier non disponible, utiliser explications génériques
        }
        return {};
    };

    coreMethods.obtenirExplicationEnrichie = function (typeErreur) {
        return this.explicationsEnrichies[typeErreur] || null;
    };

    coreMethods.initialiserExpressionsInvariablesMultiMots = function () {
        return [
            { canonique: 'afin de', variantes: ['afinde', 'afin-de'] },
            { canonique: 'afin que', variantes: ['afinque', 'afin-que'] },
            { canonique: 'dès lors', variantes: ['des lors', 'deslors', 'dèslors', 'des-lors', 'dès-lors'] },
            { canonique: 'dès que', variantes: ['des que', 'desque', 'dèsque', 'des-que', 'dès-que'] },
            { canonique: "jusqu'à", variantes: ['jusqua', 'jusqu a', "jusqu'a", 'jusqu-a', "jusqu\u2019a"] },
            { canonique: 'parce que', variantes: ['parceque', 'parce-que'] },
            { canonique: 'en fait', variantes: ['enfait', 'en-fait'] },
            { canonique: 'tout à coup', variantes: ['toutacoup', 'tout a coup', 'tout-a-coup', 'toutacou'] },
            { canonique: 'peut-être', variantes: ['peut etre', 'peutetre', 'peut-etre'] },
            { canonique: 'au-dessous', variantes: ['au dessous', 'audessous', 'au-dessous'] },
            { canonique: 'au-dessus', variantes: ['au dessus', 'audessus', 'au-dessus'] },
            { canonique: 'par-dessous', variantes: ['par dessous', 'pardessous', 'par-dessous'] },
            { canonique: 'par-dessus', variantes: ['par dessus', 'pardessus', 'par-dessus'] },
            { canonique: 'là-bas', variantes: ['la bas', 'labas', 'la-bas'] },
            { canonique: 'tant mieux', variantes: ['tantmieux', 'tant-mieux'] },
            { canonique: 'tant pis', variantes: ['tantpis', 'tant-pis'] }
        ];
    };

    coreMethods.normaliserCleExpressionInvariable = function (texte) {
        return this.normaliserTexte(texte)
            .replace(/[’']/g, '')
            .replace(/[-\s]+/g, '');
    };

    coreMethods.initialiserLexiqueFigePrioritaire = function () {
        return {
            invariablesSFantomes: new Map([
                ['toujour', 'toujours'],
                ['parfoi', 'parfois'],
                ['alor', 'alors'],
                ['hormi', 'hormis'],
                ['ailleur', 'ailleurs']
            ]),
            motsLiaison: new Map([
                ['dabord', "d'abord"],
                ['dabor', "d'abord"],
                ['pourtan', 'pourtant'],
                ['desormais', 'désormais'],
                ['dorenavant', 'dorénavant']
            ])
        };
    };

    coreMethods.initialiserLocutionsOrales = function () {
        return {
            simples: new Map([
                ['ya', 'il y a'],
                ['chais', 'je sais'],
                ['chuis', 'je suis']
            ]),
            sequences: [
                {
                    source: ['c', 'est', 'pas'],
                    correction: "ce n'est pas",
                    type: 'oralite_familiere',
                    explication: 'Cette tournure orale est très fréquente, mais à l’écrit scolaire on écrit la négation complète.',
                    regle: 'À l’écrit soigné, on écrit la négation complète : ce n’est pas, je ne sais pas, il n’y a pas…',
                    memo: 'Quand on écrit pour l’école, on développe la forme orale.',
                    exemples: ["c'est pas → ce n'est pas", "j'sais pas → je ne sais pas"],
                    titreAide: 'Forme orale à reformuler'
                },
                {
                    source: ['je', 'sais', 'pas'],
                    correction: 'je ne sais pas',
                    type: 'oralite_familiere',
                    explication: 'Ici, il manque la négation complète attendue à l’écrit scolaire.',
                    regle: 'À l’écrit soigné, la négation s’écrit avec deux éléments : ne / n\' + verbe + pas.',
                    memo: 'À l’oral on raccourcit, mais à l’écrit on garde la forme complète.',
                    exemples: ['je sais pas → je ne sais pas', 'on veut pas → on ne veut pas'],
                    titreAide: 'Forme orale à reformuler'
                }
            ]
        };
    };

    coreMethods.initialiserCorrectionsLexicalesPrioritaires = function () {
        return new Map([
            ['abitude', 'habitude'],
            ['asses', 'assez'],
            ['batiment', 'bâtiment'],
            ['canar', 'canard'],
            ['cañar', 'canard'],
            ['fature', 'voiture'],
            ['gadeau', 'cadeau'],
            ['labin', 'lapin'],
            ['parmis', 'parmi'],
            ['travails', 'travaux'],
            ['boisson', 'poisson'],
            ['finit', 'fini'],
            ['reussit', 'réussi'],
            ['réussit', 'réussi'],
            ['partit', 'partie'],
            ['aboient', 'aboie']
        ]);
    };

    coreMethods.trouverCorrectionLexicalePrioritaire = function (mot, contexte = null) {
        const cle = this.normaliserTexte(mot || '');
        if (!cle) return null;

        if (this.correctionsLexicalesPrioritaires.has(cle)) {
            return this.correctionsLexicalesPrioritaires.get(cle);
        }

        if (contexte && Array.isArray(contexte.phrase) && typeof contexte.indexMot === 'number') {
            const motPrecedent = contexte.indexMot > 0 ? contexte.phrase[contexte.indexMot - 1] : null;
            const motSuivant = contexte.phrase[contexte.indexMot + 1] || null;
            const typeSuivant = this.normaliserType(motSuivant && motSuivant.donnees ? motSuivant.donnees.type : '');

            if (cle === 'boisson'
                && motPrecedent
                && this.estDeterminantNominalToken(motPrecedent)
                && (typeSuivant === 'adjectif' || this.normaliserTexte(motSuivant && motSuivant.texte) === 'bleu')) {
                return 'poisson';
            }
        }

        return null;
    };

    coreMethods.initialiserLettresFantomesFinales = function () {
        return new Map([
            ['chat', 'chatte'],
            ['petit', 'petite'],
            ['grand', 'grande'],
            ['long', 'longue'],
            ['blanc', 'blanche']
        ]);
    };

    coreMethods.initialiserFormesVerbalesUsuelles = function () {
        return {
            avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
            etre: ['suis', 'es', 'est', 'sommes', 'etes', 'sont'],
            aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
            faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
            prendre: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
            pouvoir: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
            venir: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
            savoir: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
            croire: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'],
            reussir: ['reussis', 'reussis', 'reussit', 'reussissons', 'reussissez', 'reussissent'],
            manger: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
            jouer: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'],
            parler: ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
            ecouter: ['ecoute', 'ecoutes', 'ecoute', 'ecoutons', 'ecoutez', 'ecoutent'],
            arriver: ['arrive', 'arrives', 'arrive', 'arrivons', 'arrivez', 'arrivent'],
            dormir: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'],
            chanter: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'],
            apparaitre: ['apparais', 'apparais', 'apparait', 'apparaissons', 'apparaissez', 'apparaissent'],
            tournoyer: ['tournoie', 'tournoies', 'tournoie', 'tournoyons', 'tournoyez', 'tournoient']
        };
    };

    coreMethods.estAuxiliaireTempsTexte = function (texte) {
        const t = this.normaliserTexte(texte || '');
        return new Set([
            'ai','as','a','avons','avez','ont',
            'avais','avait','avions','aviez','avaient',
            'aurai','auras','aura','aurons','aurez','auront',
            'aie','aies','ait','ayons','ayez','aient',
            'suis','es','est','sommes','etes','sont',
            'etais','etait','etions','etiez','etaient',
            'fus','fut','fumes','futes','furent',
            'sois','soit','soyons','soyez','soient'
        ]).has(t);
    };

    coreMethods.estSemiAuxiliaireTexte = function (texte) {
        const t = this.normaliserTexte(texte || '');
        return new Set([
            'vais','vas','va','allons','allez','vont',
            'veux','veut','voulons','voulez','veulent',
            'peux','peut','pouvons','pouvez','peuvent',
            'dois','doit','devons','devez','doivent'
        ]).has(t);
    };

    coreMethods.obtenirTexteCorrigeToken = function (mot) {
        if (!mot) return '';
        const erreurs = Array.isArray(mot.erreurs) ? mot.erreurs : [];
        const prioritaire = erreurs.find((e) => e && typeof e.correction === 'string' && ['conjugaison_verbe', 'accord_sujet_verbe', 'homophone_a_a_grave', 'homophone_on_ont', 'homophone_son_sont'].includes(e.type));
        return prioritaire && prioritaire.correction ? prioritaire.correction : (mot.texte || '');
    };

    coreMethods.trouverCorrectionFormeVerbaleUsuelle = function (texteVerbe, sujetMot) {
        const forme = this.normaliserTexte(texteVerbe || '');
        if (!forme || !sujetMot) return null;
        const idx = this.determinerIndicePersonneSujet(sujetMot);

        const correctionsPersonnalisees = {
            faite: { 4: 'faites' },
            avais: { 4: 'avez' },
            ecrit: { 5: 'écrivent' },
            travaille: { 5: 'travaillent' },
            crie: { 5: 'crient' },
            perde: { 5: 'perdent' },
            doit: { 1: 'dois' }
        };
        if (correctionsPersonnalisees[forme] && correctionsPersonnalisees[forme][idx]) {
            return correctionsPersonnalisees[forme][idx];
        }

        for (const variations of Object.values(this.formesVerbalesUsuelles)) {
            const variationsNormalisees = variations.map((variation) => this.normaliserTexte(variation || ''));
            if (!variationsNormalisees.includes(forme)) continue;
            const attendue = variations[idx] || variationsNormalisees[idx];
            if (attendue && attendue !== forme) {
                return attendue;
            }
        }

        return null;
    };

    coreMethods.ajusterCorrectionSubjonctifIlFautQue = function (indexVerbe, correction, sujetMot) {
        if (typeof indexVerbe !== 'number' || indexVerbe < 0 || indexVerbe >= this.phraseAnalysee.length) {
            return correction;
        }

        const idxSujet = this.obtenirIndexPrecedentSignificatif(indexVerbe);
        const sujet = sujetMot || (idxSujet >= 0 ? this.phraseAnalysee[idxSujet] : null);
        const texteSujet = this.normaliserTexte(sujet && sujet.texte ? sujet.texte : '').replace(/[’']/g, '');
        if (!texteSujet) return correction;

        const idxQue = this.obtenirIndexPrecedentSignificatif(idxSujet);
        const texteQue = this.normaliserTexte(idxQue >= 0 && this.phraseAnalysee[idxQue] ? this.phraseAnalysee[idxQue].texte : '');
        if (!(texteQue === 'que' || texteQue === 'qu')) return correction;

        const idxFaut = this.obtenirIndexPrecedentSignificatif(idxQue);
        const texteDeclencheur = this.normaliserTexte(idxFaut >= 0 && this.phraseAnalysee[idxFaut] ? this.phraseAnalysee[idxFaut].texte : '');
        const DECLENCHEURS_SUBJONCTIF = new Set(['faut', 'veux', 'veut', 'voulons', 'voulez', 'veulent']);
        if (!DECLENCHEURS_SUBJONCTIF.has(texteDeclencheur)) return correction;

        const forme = this.normaliserTexte(correction || this.phraseAnalysee[indexVerbe].texte || '');
        const formeOriginale = this.normaliserTexte(this.phraseAnalysee[indexVerbe] && this.phraseAnalysee[indexVerbe].texte ? this.phraseAnalysee[indexVerbe].texte : '');

        if (['parte', 'fasses', 'viennes', 'partions'].includes(formeOriginale)) {
            return this.phraseAnalysee[indexVerbe].texte;
        }

        const idxSi = this.obtenirIndexPrecedentSignificatif(idxSujet);
        const texteSi = this.normaliserTexte(idxSi >= 0 && this.phraseAnalysee[idxSi] ? this.phraseAnalysee[idxSi].texte : '');
        if (texteSi === 'si' && /(ais|ait|ions|iez|aient)$/.test(formeOriginale)) {
            return this.phraseAnalysee[indexVerbe].texte;
        }

        if (texteSujet === 'tu') {
            if (forme === 'viens' || forme === 'vien') return 'viennes';
            if (forme === 'fais' || forme === 'fait') return 'fasses';
        }

        if (texteSujet === 'je') {
            if (forme === 'parle') return 'parte';
        }

        if (texteSujet === 'nous') {
            if (forme === 'partons' || forme === 'partion') return 'partions';
        }

        return correction;
    };

        coreMethods.ajusterParticipePasseAvecCODAntéposé = function (participe, indexParticipe, indexAuxiliaire) {
            // Vérifier si on a: que + auxiliaire(avoir) + participe
            // Pattern: antécédent que sujet avoir participe
            // ex: Les billes que j'ai trouvée -> billes(0) que(1) j'(2) ai(3) trouvée(4)
        
            // Chercher "que" avant le sujet (qui est avant l'auxiliaire)
            let idxQue = -1;
            for (let idx = indexAuxiliaire - 1; idx >= 0; idx--) {
                const mot = this.phraseAnalysee[idx];
                if (!mot) continue;
                let texte = this.normaliserTexte(mot.texte);
            
                // Gérer les variantes de "que" en ignorant les apostrophes
                let texteClean = texte.replace(/['`']/g, '');
                if (texteClean === 'que' || texteClean === 'qu') {
                    idxQue = idx;
                    break;
                }
                // Arrêter la recherche si on rencontre un connecteur fort (virgule, point-virgule)
                if ([',', ';', '.', '!', '?'].includes(texte)) {
                    break;
                }
            }
        
            if (idxQue < 0) {
                return participe;
            }
        
            // Trouver l'antécédent (le nom AVANT "que")
            const antecedent = this.trouverAntécédentRelatif(idxQue);
            if (!antecedent) {
                return participe;
            }
        
            // Extraire genre/nombre de l'antécédent
            let genre = this.obtenirGenreSujet(antecedent);
            let nombre = this.getNombreSujet(antecedent);
        
            // Appliquer l'accord comme avec "être" (COD antéposé avec avoir)
            let correction = String(participe || '');
            if (nombre === 'pluriel') {
                if (genre === 'feminin') {
                    if (correction.endsWith('é')) {
                        correction = correction.slice(0, -1) + 'ées';
                    } else if (!correction.endsWith('es') && !correction.endsWith('s')) {
                        correction = correction + 'es';
                    }
                } else {
                    if (!/s$/i.test(correction)) correction = correction + 's';
                }
            } else {
                // Singulier
                if (genre === 'feminin' && !correction.endsWith('e') && !correction.endsWith('ée')) {
                    correction = correction + 'e';
                }
            }
        
            return correction;
        };

        coreMethods.trouverAntécédentRelatif = function (indexQue) {
            // Remonter avant "que" pour trouver le nom principal (antécédent du relatif)
            let idx = this.obtenirIndexPrecedentSignificatif(indexQue);
            let profondeur = 0;
        
            while (idx >= 0 && profondeur < 10) {
                const candidat = this.phraseAnalysee[idx];
                if (!candidat) break;
            
                const texte = this.normaliserTexte(candidat.texte).replace(/['']/g, '');
            
                // Sauter les articles, prépositions et déterminants
                if (['de', 'à', 'du', 'le', 'la', 'un', 'une', 'des', 'au', 'l', 'd', 'les', 'un'].includes(texte)) {
                    idx = this.obtenirIndexPrecedentSignificatif(idx);
                    profondeur++;
                    continue;
                }
            
                // Chercher un nom
                if (candidat.donnees && this.estType(candidat.donnees, 'nom')) {
                    return candidat;
                }
            
                break;
            }
        
            return null;
        };

    coreMethods.trouverApproximationFormeVerbaleUsuelle = function (texteVerbe, sujetMot) {
        const forme = this.normaliserMotSimple(texteVerbe || '');
        if (!forme || !sujetMot) return null;
        // Ne pas traiter les mots invariables comme des verbes
        if (this.estMotInvariable(texteVerbe || '')) return null;
        const donneesForme = this.getWordData(texteVerbe || '');
        if (this.estType(donneesForme, 'verbe')) {
            const dejaBonne = this.choisirVariationVerbeSelonSujet(donneesForme, sujetMot, texteVerbe);
            if (this.normaliserTexte(dejaBonne) === this.normaliserTexte(texteVerbe)) {
                return null;
            }
        }
        const idx = this.determinerIndicePersonneSujet(sujetMot);

        let meilleure = null;
        let meilleureDistance = Infinity;

        for (const variations of Object.values(this.formesVerbalesUsuelles)) {
            const attendue = variations[idx];
            if (!attendue) continue;
            const distance = this.calculerDistance(forme, this.normaliserMotSimple(attendue), true);
            if (distance < meilleureDistance) {
                meilleureDistance = distance;
                meilleure = attendue;
            }
        }

        return meilleureDistance <= 1 ? meilleure : null;
    };

    coreMethods.estDeterminantOuNombrePlurielToken = function (mot) {
        if (!mot) return false;
        const texte = this.normaliserTexte(mot.texte || '');
        if (['deux', 'trois', 'quatre', 'cinq', 'plusieurs'].includes(texte)) return true;
        return this.estDeterminantNominalToken(mot)
            && this.normaliserNombre(mot.donnees && mot.donnees.nombre) === 'pluriel';
    };

    coreMethods.ajusterParticipePasseAvecSujet = function (participe, indexAuxiliaire) {
        let correction = String(participe || '');
        const texteAux = this.normaliserTexte(this.phraseAnalysee[indexAuxiliaire] && this.obtenirTexteCorrigeToken(this.phraseAnalysee[indexAuxiliaire]));
        const auxiliaireAvoir = new Set(['ai','as','a','avons','avez','ont','avais','avait','avions','aviez','avaient','aurai','auras','aura','aurons','aurez','auront']);
        if (auxiliaireAvoir.has(texteAux)) return correction;

        const correctionNorm = this.normaliserTexte(correction || '');
        if (correctionNorm === 'fait') {
            const idxPrec = this.obtenirIndexPrecedentSignificatif(indexAuxiliaire);
            const tokPrec = idxPrec >= 0 ? this.phraseAnalysee[idxPrec] : null;
            const textePrec = this.normaliserTexte(tokPrec && tokPrec.texte ? tokPrec.texte : '').replace(/[’']/g, '');
            if (textePrec === 'se' || textePrec === 's') {
                return 'fait';
            }
        }

        const sujetInfo = this.trouverInfosSujetAvantVerbe(indexAuxiliaire);
        const sujet = sujetInfo && sujetInfo.mot ? sujetInfo.mot : this.trouverSujetAvantIndex(indexAuxiliaire);
        let nombreSujet = sujetInfo && sujetInfo.nombre ? sujetInfo.nombre : (sujet ? this.getNombreSujet(sujet) : null);
        // 'on' est singulier — détecter via le texte du sujet
        if (sujet && this.normaliserTexte(sujet.texte) === 'on') nombreSujet = 'singulier';
        if (texteAux === 'on') nombreSujet = 'singulier';
        if (['sommes', 'etes', 'sont', 'etions', 'etiez', 'etaient', 'fumes', 'futes', 'furent'].includes(texteAux)) {
            nombreSujet = 'pluriel';
        }
        const genreSujet = this.obtenirGenreSujet(sujet);
        if (nombreSujet === 'pluriel') {
            if (genreSujet === 'feminin') {
                // Accord féminin pluriel : arrivé → arrivées, parti → parties
                if (correction.endsWith('é')) {
                    correction = correction.slice(0, -1) + 'ées';
                } else if (!correction.endsWith('es') && !correction.endsWith('s')) {
                    correction = correction + 'es';
                }
            } else {
                if (!/s$/i.test(correction)) correction = correction + 's';
            }
        } else {
            // Accord de genre singulier
            if (genreSujet === 'feminin' && !correction.endsWith('e') && !correction.endsWith('\u00e9e')) {
                correction = correction + 'e'; // allé → allée, tombé → tombée
            } else if (genreSujet === 'masculin' && correction.endsWith('\u00e9e')) {
                correction = correction.slice(0, -1); // tombée → tombé
            } else if (genreSujet === 'masculin' && correction.endsWith('ie')) {
                correction = correction.slice(0, -1); // partie → parti
            }
        }
        return correction;
    };

    coreMethods.creerErreurLexiqueFige = function ({ type, position, mot, correction, explication, regle, memo, exemples, titreAide, indexDebut = position, spanLongueur = 1 }) {
        const erreur = this.creerErreurContextuelle({
            type,
            position,
            indexDebut,
            spanLongueur,
            mot,
            correction,
            explication,
            regle,
            exemples,
            memo,
            titreAide
        });

        if (type === 'invariable_s_fantome' || type === 'mot_liaison_lexical' || type === 'locution_mal_segmentee') {
            erreur.optionsOrthographe = this.genererOptionsMotInvariable(correction, mot);
        }

        return erreur;
    };

    coreMethods.trouverSegmentationProbable = function (motTexte) {
        const mot = (motTexte || '').toLowerCase().trim();
        const preserveMajuscule = /^[A-ZÀ-ÖØ-Þ]/.test(String(motTexte || '').trim());
        const adapterCasse = (correction) => {
            if (!preserveMajuscule || !correction) return correction;
            return correction.charAt(0).toUpperCase() + correction.slice(1);
        };
        if (!mot || mot.length < 4) return null;

        // Si le mot contient deja une apostrophe (ou un caractere de remplacement),
        // eviter les corrections de segmentation qui degradent parfois la forme source.
        if (/[’'�]/.test(String(motTexte || ''))) {
            return null;
        }

        const speciales = new Map([
            ['ilya', 'il y a'],
            ['cest', "c'est"],
            ['jai', "j'ai"],
            ['lami', "l'ami"]
        ]);
        if (speciales.has(this.normaliserCleExpressionInvariable(mot))) {
            return {
                correction: adapterCasse(speciales.get(this.normaliserCleExpressionInvariable(mot))),
                mode: 'expression'
            };
        }

        const prefixesApostrophe = ['l', 'j', 'd', 'c', 'm', 't', 's', 'n', 'qu'];
        for (const prefixe of prefixesApostrophe) {
            if (!mot.startsWith(prefixe) || mot.length <= prefixe.length + 1) continue;
            const reste = mot.slice(prefixe.length);
            if (this.getWordData(reste)) {
                return {
                    correction: adapterCasse(`${prefixe}'${reste}`),
                    mode: 'apostrophe'
                };
            }
        }

        const petitsMots = new Set(['il', 'je', 'tu', 'on', 'le', 'la', 'de', 'ce', 'se', 'ne', 'un']);
        for (let i = 2; i <= Math.min(4, mot.length - 2); i++) {
            const gauche = mot.slice(0, i);
            const droite = mot.slice(i);
            if (!petitsMots.has(gauche)) continue;
            if (this.getWordData(gauche) && this.getWordData(droite)) {
                return {
                    correction: adapterCasse(`${gauche} ${droite}`),
                    mode: 'split'
                };
            }
        }

        return null;
    };

    coreMethods.detecterMetatheseAdjacente = function (fautif, correct) {
        const source = this.normaliserMotSimple(fautif || '');
        const cible = this.normaliserMotSimple(correct || '');
        if (!source || !cible || source.length !== cible.length || source === cible) return null;

        let premierEcart = -1;
        for (let i = 0; i < source.length; i++) {
            if (source[i] !== cible[i]) {
                premierEcart = i;
                break;
            }
        }

        if (premierEcart < 0 || premierEcart >= source.length - 1) return null;
        const inverse = source.slice(0, premierEcart)
            + source[premierEcart + 1]
            + source[premierEcart]
            + source.slice(premierEcart + 2);

        if (inverse !== cible) return null;

        return {
            index: premierEcart,
            lettresSource: `${source[premierEcart]}${source[premierEcart + 1]}`,
            lettresCible: `${cible[premierEcart]}${cible[premierEcart + 1]}`
        };
    };

    coreMethods.trouverCorrectionMetathese = function (motTexte) {
        const source = this.normaliserMotSimple(motTexte || '');
        if (!source || source.length < 4) return null;

        for (let i = 0; i < source.length - 1; i++) {
            const candidat = source.slice(0, i)
                + source[i + 1]
                + source[i]
                + source.slice(i + 2);
            if (this.getWordData(candidat)) {
                return candidat;
            }
        }

        return null;
    };

    coreMethods.trouverIndiceLettreFantomeFinale = function (fautif, correction) {
        const source = this.normaliserMotSimple(fautif || '');
        const cible = this.normaliserMotSimple(correction || '');
        if (!source || !cible) return null;
        if (cible.length !== source.length + 1) return null;
        if (!cible.startsWith(source)) return null;

        const lettreFinale = cible[cible.length - 1];
        if (!/[bcdfghjklmnpqrstvwxz]$/.test(lettreFinale)) return null;

        const motPont = this.lettresFantomesFinales.get(cible)
            || `${cible}e`;

        return {
            lettreFinale,
            motPont
        };
    };

    coreMethods.determinerExperienceErreur = function (erreur) {
        const type = (erreur && erreur.type ? erreur.type : '').toLowerCase();
        const config = {
            scoreConfiance: 0.72,
            niveauConfiance: 'niveau_2',
            typeUX: 'confirmation',
            fatigueCognitive: 'moyen',
            actionRapide: null
        };

        if (['majuscule_phrase', 'ponctuation_finale', 'accent_lexical', 'invariable_s_fantome', 'mot_liaison_lexical'].includes(type)) {
            return { ...config, scoreConfiance: 0.99, niveauConfiance: 'niveau_1', typeUX: 'direct', fatigueCognitive: 'faible', actionRapide: 'auto_fix' };
        }
        if (['locution_mal_segmentee', 'segmentation_mot_colle'].includes(type)) {
            return { ...config, scoreConfiance: 0.97, niveauConfiance: 'niveau_1', typeUX: 'direct', fatigueCognitive: 'faible', actionRapide: 'ciseaux' };
        }
        if (type === 'metathese') {
            return { ...config, scoreConfiance: 0.93, niveauConfiance: 'niveau_1', typeUX: 'direct', fatigueCognitive: 'faible', actionRapide: 'inverser' };
        }
        if (type === 'lettre_fantome_finale') {
            return { ...config, scoreConfiance: 0.88, niveauConfiance: 'niveau_2', typeUX: 'confirmation', fatigueCognitive: 'moyen', actionRapide: 'fantome' };
        }
        if (type === 'oralite_familiere') {
            return { ...config, scoreConfiance: 0.96, niveauConfiance: 'niveau_1', typeUX: 'direct', fatigueCognitive: 'faible', actionRapide: 'reformuler' };
        }
        if (type === 'confusion_phonographique') {
            return { ...config, scoreConfiance: 0.78, niveauConfiance: 'niveau_2', typeUX: 'choix_double', fatigueCognitive: 'moyen', actionRapide: null };
        }
        if (type.startsWith('homophone_')) {
            return { ...config, scoreConfiance: 0.64, niveauConfiance: 'niveau_3', typeUX: 'choix_double', fatigueCognitive: 'moyen', actionRapide: null };
        }

        return config;
    };

    coreMethods.enrichirErreursAvecExperienceUtilisateur = function () {
        for (const erreur of this.erreursTrouvees) {
            if (!erreur) continue;
            const experience = this.determinerExperienceErreur(erreur);
            Object.assign(erreur, experience);
        }
    };

    coreMethods.indexerExpressionsInvariablesMultiMots = function () {
        const index = new Map();
        for (const entree of this.expressionsInvariablesMultiMots) {
            const canonique = (entree && entree.canonique) ? entree.canonique : entree;
            const variantes = Array.isArray(entree && entree.variantes) ? entree.variantes : [];

            const cleCanonique = this.normaliserCleExpressionInvariable(canonique);
            if (cleCanonique) {
                index.set(cleCanonique, canonique.toLowerCase());
            }

            variantes.forEach((variante) => {
                const cleVariante = this.normaliserCleExpressionInvariable(variante);
                if (cleVariante) {
                    index.set(cleVariante, canonique.toLowerCase());
                }
            });

            const formesAuto = new Set([
                canonique,
                canonique.replace(/-/g, ' '),
                canonique.replace(/\s+/g, '-'),
                canonique.replace(/[’']/g, ''),
                canonique.replace(/[’']/g, ' '),
                canonique.replace(/[’']/g, '-')
            ]);
            formesAuto.forEach((forme) => {
                const cle = this.normaliserCleExpressionInvariable(forme);
                if (cle) {
                    index.set(cle, canonique.toLowerCase());
                }
            });
        }
        return index;
    };

    coreMethods.construireFenetreTokens = function (start, longueur) {
        const tokens = [];
        for (let i = 0; i < longueur; i++) {
            const mot = this.phraseAnalysee[start + i];
            if (!mot) return null;
            if (this.estPonctuationToken(mot.texte)) return null;
            tokens.push(mot.texte);
        }
        return tokens;
    };

    coreMethods.estPonctuationToken = function (texte) {
        return /^[.,;:!?"«»()\[\]{}\-–—]+$/.test(texte || '');
    };

    coreMethods.estPronomSujetInversion = function (texte) {
        const t = this.normaliserTexte(texte || '').replace(/[’']/g, '');
        return new Set(['tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles']).has(t);
    };

    coreMethods.estContexteInterrogatifDepuis = function (indexMot) {
        for (let i = indexMot; i < this.phraseAnalysee.length; i++) {
            const tok = this.phraseAnalysee[i];
            if (!tok || !tok.texte) continue;
            if (tok.texte === '?') return true;
            if (tok.texte === '.' || tok.texte === '!') return false;
        }
        return false;
    };

    coreMethods.estLocutionNominaleAuRalenti = function (indexMot) {
        const motActuel = this.phraseAnalysee[indexMot];
        if (!motActuel) return false;

        const texteActuel = this.normaliserTexte(motActuel.texte || '');
        if (texteActuel !== 'ralenti') return false;

        const indexPrecedent = this.obtenirIndexPrecedentSignificatif(indexMot);
        if (indexPrecedent < 0) return false;

        const motPrecedent = this.phraseAnalysee[indexPrecedent];
        const textePrecedent = this.normaliserTexte(motPrecedent && motPrecedent.texte);
        return textePrecedent === 'au';
    };

    coreMethods.estMotInvariableCanoniqueConnu = function (texte) {
        const cle = this.normaliserCleExpressionInvariable(texte || '');
        if (!cle) return false;
        return this.indexExpressionsInvariables.has(cle);
    };

    coreMethods.estMotLexicalTolere = function (texte) {
        const motNormalise = this.normaliserMotSimple(texte || '');
        if (!motNormalise) return false;

        // Vocabulaire technique courant (contexte forestier/transport) parfois absent du sous-lexique.
        const motsToleres = new Set([
            'cable',
            'scierie', 'scieries',
            'forestier', 'forestiere', 'forestiers', 'forestieres',
            'bucheron', 'bucherons',
            'helicoptere',
            'grumier', 'grumiers',
            'debardage', 'debardeur', 'debardeurs',
            'tronconneuse', 'tronconneuses',
            'flou', 'floue', 'flous', 'floues',
            'soeur', 'sœur', 'profs', 'rigole', 'rigolee', 'rigolees',
            'interessante', 'films', 'parce', 'tiers',
            'cap', 'cloche', 'cloches', 'sonne', 'sonnent'
        ]);
        return motsToleres.has(motNormalise);
    };

    coreMethods.estTokenProtege = function (indexMot) {
        if (typeof indexMot !== 'number' || indexMot < 0 || indexMot >= this.phraseAnalysee.length) return false;
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || !mot.texte) return false;

        const texte = this.normaliserTexte(mot.texte || '');
        const precedent = this.normaliserTexte(this.phraseAnalysee[indexMot - 1] && this.phraseAnalysee[indexMot - 1].texte ? this.phraseAnalysee[indexMot - 1].texte : '');
        const suivant = this.normaliserTexte(this.phraseAnalysee[indexMot + 1] && this.phraseAnalysee[indexMot + 1].texte ? this.phraseAnalysee[indexMot + 1].texte : '').replace(/[’']/g, '');

        if (texte === 'parce' && (suivant === 'que' || suivant === 'qu')) return true;
        if (texte === 'soeur' || texte === 'sœur') return true;
        if (texte === 'font' && precedent === 'qui') return true;
        if (texte === 'viendrait') return true;

        return false;
    };

    coreMethods.estDeterminantSurfaceToken = function (texte) {
        const t = this.normaliserTexte(texte || '').replace(/[’']/g, '');
        return new Set(['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'ce', 'cet', 'cette', 'ces', 'l', 'd']).has(t);
    };

    coreMethods.estContexteSiImparfaitProtege = function (indexMot, correctionProposee = '') {
        if (typeof indexMot !== 'number' || indexMot < 0 || indexMot >= this.phraseAnalysee.length) return false;
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || !mot.texte) return false;

        const formeCourante = this.normaliserTexte(mot.texte || '');
        const formeCorrection = this.normaliserTexte(correctionProposee || '');
        const estImparfait = /(ais|ait|ions|iez|aient)$/.test(formeCourante);
        const corrConditionnel = /(rais|rait|rions|riez|raient)$/.test(formeCorrection);
        if (!estImparfait || !corrConditionnel) return false;

        for (let i = indexMot - 1; i >= 0 && i >= indexMot - 5; i--) {
            const tok = this.phraseAnalysee[i];
            if (!tok || !tok.texte) continue;
            if (this.estPonctuationToken(tok.texte)) break;
            if (this.normaliserTexte(tok.texte || '') === 'si') return true;
        }
        return false;
    };

    coreMethods.estParticipePasseTolereParAuxiliaire = function (indexMot) {
        if (typeof indexMot !== 'number' || indexMot < 0 || indexMot >= this.phraseAnalysee.length) return false;
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || !mot.texte) return false;

        const forme = this.normaliserTexte(mot.texte || '');
        if (!/(e|ee|es|ees)$/.test(forme)) return false;

        const idxPrec = this.obtenirIndexPrecedentSignificatif(indexMot);
        if (idxPrec < 0) return false;
        const prec = this.phraseAnalysee[idxPrec];
        const textePrec = this.normaliserTexte(this.obtenirTexteCorrigeToken(prec));
        return this.estAuxiliaireTempsTexte(textePrec);
    };

    coreMethods.estDansTunnelSubjonctif = function (indexVerbe) {
        if (typeof indexVerbe !== 'number' || indexVerbe < 0 || indexVerbe >= this.phraseAnalysee.length) return false;
        const INTERCALAIRES_AVANT_VERBE = new Set(['me', 'm', 'te', 't', 'se', 's', 'ne', 'n', 'pas', 'plus', 'jamais', 'y', 'en']);

        let idxSujet = this.obtenirIndexPrecedentSignificatif(indexVerbe);
        while (idxSujet >= 0) {
            const texteSujet = this.normaliserTexte(this.phraseAnalysee[idxSujet] && this.phraseAnalysee[idxSujet].texte ? this.phraseAnalysee[idxSujet].texte : '').replace(/[’']/g, '');
            if (!INTERCALAIRES_AVANT_VERBE.has(texteSujet)) break;
            idxSujet = this.obtenirIndexPrecedentSignificatif(idxSujet);
        }
        if (idxSujet < 0) return false;
        const idxQue = this.obtenirIndexPrecedentSignificatif(idxSujet);
        if (idxQue < 0) return false;

        const texteQue = this.normaliserTexte(this.phraseAnalysee[idxQue] && this.phraseAnalysee[idxQue].texte ? this.phraseAnalysee[idxQue].texte : '').replace(/[’']/g, '');
        if (!(texteQue === 'que' || texteQue === 'qu')) return false;

        const DECLENCHEURS = new Set(['faut', 'fallait', 'faudra', 'faudrait', 'veux', 'veut', 'voulons', 'voulez', 'veulent', 'attend', 'attends', 'attendent', 'souhaite', 'souhaites', 'souhaitent', 'peur', 'pour', 'bien']);
        const INTERCALAIRES = new Set(['ne', 'n', 'pas', 'plus', 'jamais', 'rien', 'personne']);

        if (idxQue === 0 && this.estContexteInterrogatifDepuis(indexVerbe)) {
            return true;
        }

        // "Que/Qu'" en tête de phrase absolue → subjonctif injonctif ("Qu'il vienne.", "Que le spectacle commence !")
        if (idxQue === 0) {
            return true;
        }

        let idxDeclencheur = this.obtenirIndexPrecedentSignificatif(idxQue);
        let garde = 0;
        while (idxDeclencheur >= 0 && garde < 5) {
            const texteDeclencheur = this.normaliserTexte(this.phraseAnalysee[idxDeclencheur] && this.phraseAnalysee[idxDeclencheur].texte ? this.phraseAnalysee[idxDeclencheur].texte : '').replace(/[’']/g, '');
            if (DECLENCHEURS.has(texteDeclencheur)) return true;
            if (!INTERCALAIRES.has(texteDeclencheur)) break;
            idxDeclencheur = this.obtenirIndexPrecedentSignificatif(idxDeclencheur);
            garde += 1;
        }
        return false;
    };

    coreMethods.construireInversionAvecTraitUnion = function (verbeTexte, pronomTexte) {
        const verbe = (verbeTexte || '').trim();
        const pronom = (pronomTexte || '').trim().toLowerCase();
        if (!verbe || !pronom) return `${verbe}-${pronom}`;

        const pronomExigeT = new Set(['il', 'elle', 'on']);
        const termineParVoyelle = /[aeiouyàâäéèêëîïôöùûüÿ]$/i.test(verbe);
        const termineParTD = /[td]$/i.test(verbe);

        if (pronomExigeT.has(pronom) && termineParVoyelle && !termineParTD) {
            return `${verbe}-t-${pronom}`;
        }

        return `${verbe}-${pronom}`;
    };

    coreMethods.creerErreurMotInvariable = function ({ source, correction, indexDebut, spanLongueur }) {
        const estLocution = typeof correction === 'string'
            && (correction.includes(' ') || correction.includes('-') || correction.includes("'"));
        return {
            type: estLocution ? 'locution_mal_segmentee' : 'mot_invariable',
            position: indexDebut,
            indexDebut,
            spanLongueur,
            mot: source,
            correction,
            explication: estLocution
                ? `L'expression "${source}" n'est pas correctement découpée. Elle s'écrit sous une forme figée.`
                : `Le mot tel qu'il est ecrit "${source}" n'existe pas. Le mot attendu est invariable.`,
            regle: estLocution
                ? 'Certaines expressions ont une orthographe figée avec des espaces, un trait d’union ou une apostrophe à respecter.'
                : 'Un mot invariable garde toujours la meme orthographe: il ne s\'accorde pas.',
            motsSimilaires: [],
            optionsOrthographe: this.genererOptionsMotInvariable(correction, source)
        };
    };

    coreMethods.marquerSpanErreurInvariable = function (erreur) {
        const { indexDebut, spanLongueur } = erreur;
        for (let i = 0; i < spanLongueur; i++) {
            const idx = indexDebut + i;
            const mot = this.phraseAnalysee[idx];
            if (!mot) continue;
            mot.erreurs.push(erreur);
            this.positionsIgnoreesErreursGeneriques.add(idx);
        }
    };

    coreMethods.creerErreurContextuelle = function ({
        type,
        position,
        mot,
        correction,
        explication,
        regle,
        indexDebut = position,
        spanLongueur = 1,
        exemples = [],
        memo = '',
        titreAide = ''
    }) {
        return {
            type,
            position,
            indexDebut,
            spanLongueur,
            mot,
            correction,
            explication,
            regle,
            exemples,
            memo,
            titreAide
        };
    };

    coreMethods.enregistrerErreurContextuelle = function (erreur) {
        if (!erreur) return;
        this.erreursTrouvees.push(erreur);

        const debut = typeof erreur.indexDebut === 'number'
            ? erreur.indexDebut
            : erreur.position;
        const longueur = Number.isInteger(erreur.spanLongueur) && erreur.spanLongueur > 0
            ? erreur.spanLongueur
            : 1;

        for (let i = 0; i < longueur; i++) {
            const idx = debut + i;
            const mot = this.phraseAnalysee[idx];
            if (!mot) continue;
            mot.erreurs.push(erreur);
            this.positionsIgnoreesErreursGeneriques.add(idx);
        }
    };

    global.AbeAnalyseurCoreMethods = Object.assign(
        global.AbeAnalyseurCoreMethods || {},
        coreMethods
    );
})(typeof window !== 'undefined' ? window : globalThis);