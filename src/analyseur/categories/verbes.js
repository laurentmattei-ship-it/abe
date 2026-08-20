/**
 * Catégorie extraite d'analyseur.js
 * Fichier: verbes.js
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierFormeVerbaleApresAuxiliaire() {
        // Semi-auxiliaires modaux: le verbe suivant doit être à l'infinitif
        const SEMI_AUXILIAIRES = new Set([
            'vais','vas','va','allons','allez','vont',
            'veux','veut','voulons','voulez','veulent',
            'peux','peut','pouvons','pouvez','peuvent',
            'dois','doit','devons','devez','doivent',
            'sais','sait','savons','savez','savent',
            'viens','vient','venons','venez','viennent',
            'faut','fallait','faudra'
        ]);
        // Auxiliaires de temps: le verbe suivant doit être au participe passé
        const AUXILIAIRES_TEMPS = new Set([
            'ai','as','a','avons','avez','ont',
            'avais','avait','avions','aviez','avaient',
            'aurai','auras','aura','aurons','aurez','auront',
            'suis','es','est','sommes','êtes','sont',
            'étais','était','étions','étiez','étaient',
            'fus','fut','fûmes','fûtes','furent'
        ]);
        const AUX_AVOIR = new Set(['ai','as','a','avons','avez','ont','avais','avait','avions','aviez','avaient','aurai','auras','aura','aurons','aurez','auront']);
        const FORMES_IRREGULIERES_PP = new Map([
            ['partit', 'parti'],
            ['prit', 'pris'],
            ['prena', 'pris'],
            ['ouvrit', 'ouvert'],
            ['mit', 'mis']
        ]);
        // Pronoms clitiques objets à sauter pour trouver le verbe suivant
        const CLITIQUES = new Set([
            "l'","la","le","les","lui","leur","m'","t'","s'",
            'me','te','se','nous','vous','y','en'
        ]);

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            let texte = this.normaliserTexte(this.obtenirTexteCorrigeToken(mot));
            const erreursMot = Array.isArray(mot.erreurs) ? mot.erreurs : [];
            if (texte === 'on' && erreursMot.some((e) =>
                e && (e.type === 'homophone_on_ont' || (e.type === 'conjugaison_verbe' && this.normaliserTexte(e.correction) === 'ont'))
            )) {
                texte = 'ont';
            }
            if (texte === 'son' && erreursMot.some((e) =>
                e && (e.type === 'homophone_son_sont' || (e.type === 'conjugaison_verbe' && this.normaliserTexte(e.correction) === 'sont'))
            )) {
                texte = 'sont';
            }
            if (texte === 'la' && erreursMot.some((e) => e && e.type === 'homophone_la_lapostrophe')) {
                texte = 'a';
            }
            if (texte === 'et' && erreursMot.some((e) => e && e.type === 'homophone_et_est')) {
                texte = 'est';
            }
            const motPrecedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
            const forceAuxiliaireA = erreursMot.some((e) =>
                e && (e.type === 'homophone_a_preposition' || (e.type === 'conjugaison_verbe' && this.normaliserTexte(e.correction) === 'a'))
            );

            // "à" (accentué) est une préposition: ne pas l'interpréter comme auxiliaire,
            // sauf si une erreur de l'élève demande explicitement la correction vers "a".
            if (texte === 'a' && /[àÀ]/.test(mot.texte || '') && !forceAuxiliaireA) {
                continue;
            }

            const estSemiAux = SEMI_AUXILIAIRES.has(texte);
            const estAuxTemps = !estSemiAux && AUXILIAIRES_TEMPS.has(texte);
            
            
            if (!estSemiAux && !estAuxTemps) continue;

            if (estAuxTemps && this.estFormeEtreTexte(texte)) {
                const idxSuivantSignificatif = this.obtenirIndexSuivantSignificatif(i);
                const motSuivantSignificatif = idxSuivantSignificatif >= 0 ? this.phraseAnalysee[idxSuivantSignificatif] : null;
                const idxApresSuivant = idxSuivantSignificatif >= 0 ? this.obtenirIndexSuivantSignificatif(idxSuivantSignificatif) : -1;
                const motApresSuivant = idxApresSuivant >= 0 ? this.phraseAnalysee[idxApresSuivant] : null;
                const texteSuivantSignificatif = this.normaliserTexte(motSuivantSignificatif && motSuivantSignificatif.texte ? motSuivantSignificatif.texte : '');

                if (motSuivantSignificatif && !this.estType(motSuivantSignificatif.donnees, 'verbe')) {
                    if (this.estType(motSuivantSignificatif.donnees, 'adjectif') || ['pres', 'pret'].includes(texteSuivantSignificatif)) {
                        continue;
                    }

                    if (['a', 'à', 'de'].includes(texteSuivantSignificatif)
                        && motApresSuivant
                        && this.estType(motApresSuivant.donnees, 'verbe')
                        && this.estFormeInfinitive(motApresSuivant.texte, motApresSuivant.donnees)) {
                        continue;
                    }
                }
            }

            // Désambiguïsation: après un verbe lexical, "a" est souvent la préposition "à" non accentuée.
            // Ex: "je commence a manger".
            if (estAuxTemps && texte === 'a' && motPrecedent && motPrecedent.donnees && this.estType(motPrecedent.donnees, 'verbe') && !this.estSujet(motPrecedent)) {
                continue;
            }

            // Éviter "c'est" (c' + est) : ce n'est pas un auxiliaire de temps ici
            // SAUF si c' a l'erreur homophone_cest_sest (c'est → s'est), auquel cas est est bien un auxiliaire
            if (estAuxTemps && texte === 'est' && i > 0) {
                const precMot = this.phraseAnalysee[i - 1];
                const precTexte = precMot.texte.toLowerCase();
                if (precTexte === "c'" || precTexte === 'ce') {
                    const precEstCorrigeSest = Array.isArray(precMot.erreurs) && precMot.erreurs.some((e) => e && e.type === 'homophone_cest_sest');
                    if (!precEstCorrigeSest) continue;
                }
            }

            // Sauter les clitiques et adverbes pour trouver le prochain verbe
            let j = i + 1;
            while (j < this.phraseAnalysee.length) {
                const tj = this.phraseAnalysee[j].texte.toLowerCase();
                const dj = this.phraseAnalysee[j].donnees;
                const typeJ = dj ? this.normaliserType(dj.type) : null;
                if (CLITIQUES.has(tj) || typeJ === 'adverbe' || tj === '-') { j++; continue; } // '-' = tiret d'inversion
                break;
            }
            if (j >= this.phraseAnalysee.length) continue;

            const motVerbe = this.phraseAnalysee[j];
            if (estSemiAux && motVerbe.donnees && !this.estType(motVerbe.donnees, 'verbe')) {
                continue;
            }
            const erreursSignificativesVerbe = (motVerbe.erreurs || []).filter((e) => e && e.type !== 'ponctuation_finale' && e.type !== 'majuscule_phrase');
            // Pour un semi-auxiliaire (faut, peut, doit…), on ignore les erreurs conjugaison_verbe
            // déjà détectées sur le verbe suivant: l'infinitif prime sur la conjugaison correcte.
            const erreursBloquantesVerbe = estSemiAux
                ? erreursSignificativesVerbe.filter(e => e && !['conjugaison_verbe', 'verbe_participe_requis'].includes(e.type))
                : erreursSignificativesVerbe;
            if (erreursBloquantesVerbe.length > 0) continue;

            const typeMotVerbe = motVerbe.donnees ? this.normaliserType(motVerbe.donnees.type) : null;
            const estAttributApresEtre = estAuxTemps
                && ['est', 'suis', 'es', 'sommes', 'êtes', 'etes', 'sont', 'étais', 'etais', 'était', 'etait', 'étions', 'etions', 'étiez', 'etiez', 'étaient', 'etaient'].includes(texte)
                && typeMotVerbe === 'adjectif';
            if (estAttributApresEtre) continue;

            const correctionIrreguliere = FORMES_IRREGULIERES_PP.get(this.normaliserTexte(motVerbe.texte));
            if (estAuxTemps && correctionIrreguliere && !this.motsEgauxSansCasse(correctionIrreguliere, motVerbe.texte)) {
                let correction = correctionIrreguliere;
                let explication = `Après "${mot.texte}", on attend ici le participe passé du verbe, pas une forme simple comme "${motVerbe.texte}".`;
                let regle = 'Après un auxiliaire de temps, on écrit un participe passé : a pris, a mis, a ouvert…';
                if (!AUX_AVOIR.has(texte)) {
                    correction = this.ajusterParticipePasseAvecSujet(correction, i);
                    explication = 'Le participe passé avec être s\'accorde avec le sujet.';
                    regle = 'Avec l\'auxiliaire être, le participe passé s\'accorde en genre et en nombre avec le sujet.';
                } else {
                    correction = this.ajusterParticipePasseAvecCODAntéposé(correction, j, i) || correction;
                }
                const erreur = {
                    type: 'verbe_participe_requis',
                    position: j,
                    mot: motVerbe.texte,
                    correction,
                    explication,
                    regle
                };
                this.erreursTrouvees.push(erreur);
                motVerbe.erreurs.push(erreur);
                continue;
            }

            let clitiqueCodAvantVerbe = false;
            for (let k = i + 1; k < j; k++) {
                const tk = this.normaliserTexte(this.phraseAnalysee[k] && this.phraseAnalysee[k].texte ? this.phraseAnalysee[k].texte : '').replace(/[’']/g, '');
                if (['le', 'la', 'les', 'l', 'me', 'm', 'te', 't', 'nous', 'vous'].includes(tk)) {
                    clitiqueCodAvantVerbe = true;
                    break;
                }
            }

            const estVerbeDictionnaire = !!(motVerbe.donnees && this.estType(motVerbe.donnees, 'verbe'));
            const infinitifDepuisPP = this.trouverInfinitifDepuisParticipe(motVerbe.texte);
            const formeInfinitive = this.estFormeInfinitive(motVerbe.texte, motVerbe.donnees);

            if (estSemiAux) {
                // Doit être suivi d'un infinitif.
                // On accepte soit un infinitif explicite, soit une forme verbale reconnue comme infinitif.
                if (!formeInfinitive && infinitifDepuisPP) {
                    // Retirer les erreurs conjugaison_verbe préexistantes sur ce verbe (infinitif prime)
                    motVerbe.erreurs = (motVerbe.erreurs || []).filter(e => e && !['conjugaison_verbe', 'verbe_participe_requis'].includes(e.type));
                    this.erreursTrouvees = this.erreursTrouvees.filter(e => !(e && ['conjugaison_verbe', 'verbe_participe_requis'].includes(e.type) && e.position === j));
                    const erreur = {
                        type: 'verbe_infinitif_requis',
                        position: j,
                        mot: motVerbe.texte,
                        correction: infinitifDepuisPP,
                            explication: `Ne confonds pas -é et -er : après "${mot.texte}", on attend l'infinitif en -er.`,
                            regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "prendre", il faut l\'infinitif en -er (ex: nous aimerions prendre).'
                    };
                    this.erreursTrouvees.push(erreur);
                    motVerbe.erreurs.push(erreur);
                } else if (!formeInfinitive) {
                    // Essayer d'abord depuis la correction conjugaison_verbe existante
                    const errConjExistante = erreursSignificativesVerbe.find(e => e && e.type === 'conjugaison_verbe' && typeof e.correction === 'string');
                    const texteBase = errConjExistante ? errConjExistante.correction : motVerbe.texte;
                    const normaliserVersInfinitif = (forme) => {
                        const brut = this.normaliserTexte(forme || '');
                        if (!brut) return null;
                        let inf = this.trouverInfinitifDepuisFormeConjuguee(brut);
                        if (inf) return inf;
                        if (brut.endsWith('urent') && brut.length > 5) {
                            inf = `${brut.slice(0, -5)}ir`;
                            const dInf = this.getWordData(inf);
                            if (dInf && this.estType(dInf, 'verbe') && this.estInfinitif(dInf)) return inf;
                        }
                        return null;
                    };
                    const infinitifConjugue = normaliserVersInfinitif(texteBase) || normaliserVersInfinitif(motVerbe.texte);
                    if (infinitifConjugue) {
                        // Retirer les erreurs conjugaison_verbe préexistantes (infinitif prime)
                        motVerbe.erreurs = (motVerbe.erreurs || []).filter(e => e && !['conjugaison_verbe', 'verbe_participe_requis'].includes(e.type));
                        this.erreursTrouvees = this.erreursTrouvees.filter(e => !(e && ['conjugaison_verbe', 'verbe_participe_requis'].includes(e.type) && e.position === j));
                        const erreur = {
                            type: 'verbe_infinitif_requis',
                            position: j,
                            mot: motVerbe.texte,
                            correction: infinitifConjugue,
                            explication: `Après "${mot.texte}", on attend l'infinitif du verbe, pas une forme conjuguée.`,
                            regle: 'Après un verbe semi-auxiliaire (falloir, pouvoir, devoir…), le verbe suivant doit être à l\'infinitif.'
                        };
                        this.erreursTrouvees.push(erreur);
                        motVerbe.erreurs.push(erreur);
                    }
                }
            } else {
                // Doit être suivi d'un participe passé — si c'est un infinitif, c'est une erreur
                if (!estVerbeDictionnaire && infinitifDepuisPP) {
                    const idxSujetApres = this.obtenirIndexSuivantSignificatif(j);
                    const sujetApres = idxSujetApres >= 0 ? this.phraseAnalysee[idxSujetApres] : null;
                    if (estAuxTemps && !AUX_AVOIR.has(texte) && sujetApres && this.estDeterminantNominalToken(sujetApres) && /\u00e9(e|es|s)?$/i.test(motVerbe.texte)) {
                        continue;
                    }

                    let correction = this.trouverParticipePasse(infinitifDepuisPP) || motVerbe.texte;

                    if (estAuxTemps && !AUX_AVOIR.has(texte)) {
                        correction = this.ajusterParticipePasseAvecSujet(correction, i);
                    } else if (estAuxTemps && AUX_AVOIR.has(texte)) {
                        // Vérifier COD antéposé (que + avoir + participe)
                        correction = this.ajusterParticipePasseAvecCODAntéposé(correction, j, i) || correction;
                    }

                    if (!this.motsEgauxSansCasse(correction, motVerbe.texte)) {
                        const erreur = {
                            type: 'verbe_participe_requis',
                            position: j,
                            mot: motVerbe.texte,
                            correction,
                            explication: `Ne confonds pas -é et -er : après "${mot.texte}", on attend un participe passé en -é.`,
                            regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "pris", il faut le participe passé en -é (ex: nous avons pris).'
                        };
                        this.erreursTrouvees.push(erreur);
                        motVerbe.erreurs.push(erreur);
                        continue;
                    }
                }

                if (estVerbeDictionnaire && formeInfinitive) {
                    const ppBase = this.trouverParticipePasse(motVerbe.texte);
                    let pp = ppBase;
                    
                    if (pp) {
                        // Pour auxiliaire être, ajuster avec sujet
                        if (estAuxTemps && !AUX_AVOIR.has(texte)) {
                            pp = this.ajusterParticipePasseAvecSujet(pp, i);
                        }
                        // Pour auxiliaire avoir, vérifier COD antéposé
                        else if (estAuxTemps && AUX_AVOIR.has(texte)) {
                            pp = this.ajusterParticipePasseAvecCODAntéposé(pp, j, i) || pp;
                        }
                    }
                    
                    if (pp && !this.motsEgauxSansCasse(pp, motVerbe.texte)) {
                        const erreur = {
                            type: 'verbe_participe_requis',
                            position: j,
                            mot: motVerbe.texte,
                            correction: pp,
                            explication: `Ne confonds pas -é et -er : après "${mot.texte}", le verbe doit être au participe passé en -é.`,
                            regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "pris", il faut le participe passé en -é (ex: nous avons pris).'
                        };
                        this.erreursTrouvees.push(erreur);
                        motVerbe.erreurs.push(erreur);
                    }
                } else if (estVerbeDictionnaire && !formeInfinitive) {
                    if (estAuxTemps && !AUX_AVOIR.has(texte) && infinitifDepuisPP) {
                        const basePP = this.trouverParticipePasse(infinitifDepuisPP);
                        if (basePP) {
                            const ppAttendu = this.ajusterParticipePasseAvecSujet(basePP, i);
                            if (ppAttendu && !this.motsEgauxSansCasse(ppAttendu, motVerbe.texte)) {
                                const erreur = {
                                    type: 'verbe_participe_requis',
                                    position: j,
                                    mot: motVerbe.texte,
                                    correction: ppAttendu,
                                    explication: 'Le participe passé avec être s\'accorde avec le sujet.',
                                    regle: 'Avec l\'auxiliaire être, le participe passé s\'accorde en genre et en nombre avec le sujet.'
                                };
                                this.erreursTrouvees.push(erreur);
                                motVerbe.erreurs.push(erreur);
                                continue;
                            }
                        }
                    }

                    const infinitifDepuisParticipe = this.trouverInfinitifDepuisParticipe(motVerbe.texte);
                    if (estAuxTemps && AUX_AVOIR.has(texte) && infinitifDepuisParticipe && !clitiqueCodAvantVerbe) {
                        const ppBase = this.trouverParticipePasse(infinitifDepuisParticipe);
                        let ppAttendu = ppBase;
                        
                        // Vérifier COD antéposé (que + avoir + participe)
                        if (ppAttendu) {
                            ppAttendu = this.ajusterParticipePasseAvecCODAntéposé(ppAttendu, j, i) || ppAttendu;
                        }
                        
                        if (ppAttendu && !this.motsEgauxSansCasse(ppAttendu, motVerbe.texte)) {
                            const erreur = {
                                type: 'verbe_participe_requis',
                                position: j,
                                mot: motVerbe.texte,
                                correction: ppAttendu,
                                explication: `Ne confonds pas -é et -er : après "${mot.texte}", on attend un participe passé en -é.`,
                                regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "pris", il faut le participe passé en -é (ex: nous avons pris).'
                            };
                            this.erreursTrouvees.push(erreur);
                            motVerbe.erreurs.push(erreur);
                            continue;
                        }
                    }

                    const infinitifConjugue = this.trouverInfinitifDepuisFormeConjuguee(motVerbe.texte);
                    if (infinitifConjugue) {
                        const ppBase = this.trouverParticipePasse(infinitifConjugue);
                        let pp = ppBase;
                        
                        if (pp) {
                            // Pour auxiliaire être, ajuster avec sujet
                            if (estAuxTemps && !AUX_AVOIR.has(texte)) {
                                pp = this.ajusterParticipePasseAvecSujet(pp, i);
                            }
                            // Pour auxiliaire avoir, vérifier COD antéposé
                            else if (estAuxTemps && AUX_AVOIR.has(texte)) {
                                pp = this.ajusterParticipePasseAvecCODAntéposé(pp, j, i) || pp;
                            }
                        }
                        
                        if (pp && !this.motsEgauxSansCasse(pp, motVerbe.texte)) {
                            const erreur = {
                                type: 'verbe_participe_requis',
                                position: j,
                                mot: motVerbe.texte,
                                correction: pp,
                                explication: `Ne confonds pas -é et -er : après "${mot.texte}", le verbe doit être au participe passé en -é.`,
                                regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "pris", il faut le participe passé en -é (ex: nous avons pris).'
                            };
                            this.erreursTrouvees.push(erreur);
                            motVerbe.erreurs.push(erreur);
                        }
                    }
                    // Vérifier si PP modal (osé, voulu, pu, décidé…) + clitique + PP → infinitif requis
                    const VERBES_MODAUX_PP = new Set(['ose','voulu','pu','decide','commence','essaye','oblige','tente','reussi','su','du','prevu','accepte','refuse','oublie']);
                    const normPP = this.normaliserTexte(motVerbe.texte || '');
                    if (estAuxTemps && AUX_AVOIR.has(texte) && VERBES_MODAUX_PP.has(normPP)) {
                        let k2 = j + 1;
                        while (k2 < this.phraseAnalysee.length) {
                            const c2 = this.phraseAnalysee[k2];
                            if (!c2 || this.estPonctuationToken(c2.texte)) break;
                            if (this.estClitiqueObjetToken(c2.texte)) { k2++; continue; }
                            break;
                        }
                        if (k2 < this.phraseAnalysee.length) {
                            const motApresModal = this.phraseAnalysee[k2];
                            if (motApresModal && !this.estPonctuationToken(motApresModal.texte)) {
                                const dejaSignaleModal = (motApresModal.erreurs || []).some((e) => e && (e.type === 'verbe_infinitif_requis' || e.type === 'verbe_participe_requis'));
                                const infDP2 = !dejaSignaleModal && this.trouverInfinitifDepuisParticipe(motApresModal.texte);
                                if (infDP2 && !this.estFormeInfinitive(motApresModal.texte, motApresModal.donnees)) {
                                    const erreur = { type: 'verbe_infinitif_requis', position: k2, mot: motApresModal.texte, correction: infDP2, explication: `Après "${motVerbe.texte}", on attend l'infinitif du verbe.`, regle: 'Après un verbe modal au participe passé, le verbe suivant reste à l\'infinitif.' };
                                    this.erreursTrouvees.push(erreur);
                                    motApresModal.erreurs.push(erreur);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    categories.verifierFormeVerbaleApresAuxiliaire = verifierFormeVerbaleApresAuxiliaire;

    function verifierInfinitifApresPreposition() {
        const PREPOSITIONS = new Set(['a', 'à', 'de', "d'", 'pour', 'sans']);

        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || (mot.erreurs && mot.erreurs.length > 0)) continue;

            const texte = this.normaliserTexte(mot.texte);
            if (!PREPOSITIONS.has(texte)) continue;

            if (texte === 'a' && i > 0 && this.estSujetOuPronomToken(this.phraseAnalysee[i - 1])) {
                continue;
            }

            // Cas "n'a" : après négation, "a" est généralement l'auxiliaire avoir.
            if (
                texte === 'a'
                && i > 1
                && this.estTokenNegation(this.phraseAnalysee[i - 1] && this.phraseAnalysee[i - 1].texte)
                && this.estSujetOuPronomToken(this.phraseAnalysee[i - 2])
            ) {
                continue;
            }

            if (texte === 'a') {
                const idxPrec = this.obtenirIndexPrecedentSignificatif(i);
                const motPrec = idxPrec >= 0 ? this.phraseAnalysee[idxPrec] : null;
                const idxSujet = idxPrec >= 0 ? this.obtenirIndexPrecedentSignificatif(idxPrec) : -1;
                const sujetPotentiel = idxSujet >= 0 ? this.phraseAnalysee[idxSujet] : null;
                if (motPrec && this.estClitiqueObjetToken(motPrec.texte)) {
                    continue;
                }
                if (motPrec && this.estClitiqueObjetToken(motPrec.texte) && sujetPotentiel && this.estSujetOuPronomToken(sujetPotentiel)) {
                    continue;
                }
            }

            let j = i + 1;
            while (j < this.phraseAnalysee.length) {
                const candidat = this.phraseAnalysee[j];
                if (!candidat) break;
                if (this.estPonctuationToken(candidat.texte)) break;
                if (this.estClitiqueObjetToken(candidat.texte) || this.estTokenNegation(candidat.texte)) {
                    j += 1;
                    continue;
                }
                break;
            }

            if (j >= this.phraseAnalysee.length) continue;
            const motVerbe = this.phraseAnalysee[j];
            if (!motVerbe) continue;

            const infinitifDepuisPP = this.trouverInfinitifDepuisParticipe(motVerbe.texte);
            if (infinitifDepuisPP) {
                const dejaSignale = (motVerbe.erreurs || []).some((e) => e && e.type === 'verbe_infinitif_requis');
                if (dejaSignale) continue;
                const erreur = {
                    type: 'verbe_infinitif_requis',
                    position: j,
                    mot: motVerbe.texte,
                    correction: infinitifDepuisPP,
                    explication: `Ne confonds pas -é et -er : après "${mot.texte}", on attend l'infinitif en -er.`,
                    regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "prendre", il faut l\'infinitif en -er (ex: nous aimerions prendre).'
                };
                this.erreursTrouvees.push(erreur);
                motVerbe.erreurs.push(erreur);
                continue;
            }

            const estVerbe = !!(motVerbe.donnees && this.estType(motVerbe.donnees, 'verbe'));
            if (!estVerbe) continue;

            const dejaInfinitif = this.estFormeInfinitive(motVerbe.texte, motVerbe.donnees);
            if (dejaInfinitif) continue;

            const infinitifConjugue = this.trouverInfinitifDepuisFormeConjuguee(motVerbe.texte);
            if (!infinitifConjugue) continue;

            const dejaSignale = (motVerbe.erreurs || []).some((e) => e && e.type === 'verbe_infinitif_requis');
            if (dejaSignale) continue;

            const erreur = {
                type: 'verbe_infinitif_requis',
                position: j,
                mot: motVerbe.texte,
                correction: infinitifConjugue,
                explication: `Ne confonds pas -é et -er : après "${mot.texte}", on attend l'infinitif en -er.`,
                regle: 'Pour choisir entre -er et -é, remplace le verbe par un verbe du 3e groupe (par exemple: prendre). Si tu entends "prendre", il faut l\'infinitif en -er (ex: nous aimerions prendre).'
            };
            this.erreursTrouvees.push(erreur);
            motVerbe.erreurs.push(erreur);
        }
    }

    categories.verifierInfinitifApresPreposition = verifierInfinitifApresPreposition;

})(typeof window !== 'undefined' ? window : globalThis);
