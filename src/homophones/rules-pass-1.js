/**
 * Homophones - appliquerPassage1
 * G?n?r? depuis src/analyseur/categories/homophones.js
 */
(function (global) {
    function appliquerPassage1() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            const texteCourant = (mot && mot.texte ? mot.texte : '').toLowerCase();
            const erreursBloquantes = Array.isArray(mot.erreurs)
                ? mot.erreurs.filter((e) => e && !['ponctuation_finale', 'majuscule_phrase'].includes(e.type))
                : [];
            const erreursFiltrees = texteCourant === 'est'
                ? erreursBloquantes.filter((e) => e && e.type !== 'conjugaison_verbe')
                : erreursBloquantes;
            if (erreursFiltrees.length > 0) continue;
            const estPositionIgnoree = this.positionsIgnoreesErreursGeneriques.has(i);
            if (estPositionIgnoree && erreursFiltrees.length > 0) continue;
            const texte = mot.texte.toLowerCase();
            const motPrecedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
            const motSuivant = this.phraseAnalysee[i + 1] || null;
            const typePrecedent = motPrecedent && motPrecedent.donnees ? this.normaliserType(motPrecedent.donnees.type) : null;
            const typeSuivant = motSuivant && motSuivant.donnees ? this.normaliserType(motSuivant.donnees.type) : null;
            const textePrecedent = this.normaliserTexte(motPrecedent && motPrecedent.texte ? motPrecedent.texte : '');
            const texteSuivant = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
            const precedentEstSujet = !!(motPrecedent && this.estSujet(motPrecedent));

            // "sa" (dét. possessif) → "ça" (pronom) quand il n'est pas suivi d'un nom dans les 2 mots
            if (texte === 'sa') {
                const suivantImmediate = this.phraseAnalysee[i + 1] || null;
                const suivantPonctuation = !!(suivantImmediate && this.estPonctuationToken(suivantImmediate.texte));
                const suivantVerbe = !!(suivantImmediate && suivantImmediate.donnees && this.estType(suivantImmediate.donnees, 'verbe'));
                if (suivantImmediate && !suivantPonctuation && !suivantVerbe) {
                    continue;
                }

                const suivants = [this.phraseAnalysee[i + 1], this.phraseAnalysee[i + 2]].filter(Boolean);
                const hasNom = suivants.some((m) => {
                    if (!m) return false;
                    if (m.donnees && this.normaliserType(m.donnees.type) === 'nom') return true;
                    const t = this.normaliserTexte(m.texte || '');
                    return new Set(['soeur', 'frere', 'profs', 'film', 'films']).has(t);
                });
                if (!hasNom) {
                    const erreur = {
                        type: 'homophone_sa_ca',
                        position: i,
                        mot: mot.texte,
                        correction: 'ça',
                        explication: `"Sa" est un déterminant possessif (sa maison). Ici, il faut le pronom "ça" (= cela).`,
                        regle: '"Sa" se place devant un nom (sa voiture, sa maison). "Ça" remplace "cela" et s\'utilise seul (c\'est comme ça, je fais ça).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                }
            }

            // "ça" (pronom) / "ca" (sans cédille) -> déterminant possessif avant un nom
            if (texte === 'ça' || texte === 'ca') {
                if (motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom') {
                    const nombreNom = this.normaliserNombre(motSuivant.donnees.nombre);
                    const genreNom = this.normaliserGenre(motSuivant.donnees.genre);
                    let correction = 'sa';
                    if (nombreNom === 'pluriel') correction = 'ses';
                    else if (genreNom === 'masculin') correction = 'son';

                    const erreur = {
                        type: 'homophone_ca_sa',
                        position: i,
                        mot: mot.texte,
                        correction,
                        explication: `Devant le nom "${motSuivant.texte}", il faut un déterminant possessif (${correction}), pas "${mot.texte}".`,
                        regle: 'Devant un nom, on écrit un déterminant possessif (sa/son/ses). "Ça" remplace "cela" et ne détermine pas un nom.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                }
            }

            // "ces" (dét. démonstratif pluriel) → "c'est" quand pas suivi d'un nom pluriel
            if (texte === 'ces') {
                const texteSuivant = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
                const suivants = [this.phraseAnalysee[i + 1], this.phraseAnalysee[i + 2]].filter(Boolean);
                const hasNom = suivants.some((m) => {
                    if (!m || !m.texte) return false;
                    if (m.donnees && this.normaliserType(m.donnees.type) === 'nom') return true;

                    const correctionNom = this.trouverNomProbableApresDeterminant(m.texte, mot.donnees);
                    return !!correctionNom;
                });
                const forceCest = texteSuivant === 'sont';
                if (forceCest || !hasNom) {
                    const erreur = {
                        type: 'homophone_ces_cest',
                        position: i,
                        mot: mot.texte,
                        correction: "c'est",
                        explication: `"Ces" est un déterminant démonstratif pluriel (ces élèves, ces livres). Ici, il faut "c'est".`,
                        regle: '"Ces" se place devant un nom pluriel (ces enfants). "C\'est" = "cela est" (c\'est beau, c\'est comme ça).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                }
            }

            // a/à
            // Cas 1: "il à mangé" -> "il a mangé"
            if (texte === 'à') {
                if (motSuivant && this.estDeterminantSurfaceToken(motSuivant.texte || '')) {
                    continue;
                }
                if (precedentEstSujet && motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe')) {
                    const erreur = {
                        type: 'homophone_a_a_grave',
                        position: i,
                        mot: mot.texte,
                        correction: 'a',
                        explication: 'Peux-tu remplacer ce mot par "avait" ? Si oui, c\'est le verbe "avoir" : on écrit "a" sans accent.',
                        regle: 'Si tu peux remplacer par "avait", c\'est la forme du verbe avoir: "a" sans accent. Sinon, c\'est la préposition "à", qui prend un accent grave.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // Cas 2: "commence a manger" -> "commence à manger"
            if (texte === 'a') {
                const suivantInfinitif = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estInfinitif(motSuivant.donnees));
                if (!precedentEstSujet && suivantInfinitif) {
                    const erreur = {
                        type: 'homophone_a_a_sans',
                        position: i,
                        mot: mot.texte,
                        correction: 'à',
                        explication: 'Ici, le remplacement par "avait" ne fonctionne pas: il faut la préposition "à" avec accent grave.',
                        regle: 'Si tu peux remplacer par "avait", écris "a" sans accent. Sinon, écris la préposition "à" avec accent grave.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }

                const motApresElision = (motSuivant && /['’]$/.test(motSuivant.texte || '') && this.phraseAnalysee[i + 2]) ? this.phraseAnalysee[i + 2] : null;
                const contexteNominal = !!motSuivant && (
                    this.estDeterminantNominalToken(motSuivant)
                    || this.estType(motSuivant.donnees, 'nom')
                    || this.estType(motSuivant.donnees, 'pronom')
                    || this.estType(motSuivant.donnees, 'adverbe')
                    || !!(motApresElision && this.estType(motApresElision.donnees, 'nom'))
                    || /^[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸ]/.test(motSuivant.texte || '')
                );
                const precedentVerbal = !!motPrecedent && (
                    this.estType(motPrecedent.donnees, 'verbe')
                    || this.estParticipePasseProbable(motPrecedent.texte)
                );
                if (!precedentEstSujet && precedentVerbal && contexteNominal && textePrecedent !== 'y') {
                    const erreur = {
                        type: 'homophone_a_a_sans',
                        position: i,
                        mot: mot.texte,
                        correction: 'à',
                        explication: 'Ici, le mot introduit un groupe nominal ou un lieu: on attend la preposition "à".',
                        regle: 'Quand le mot introduit un lieu, une personne ou un complement nominal, on ecrit la preposition "à" avec accent grave.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            if (texte === 'des' && textePrecedent === 'beaucoup') {
                const erreur = {
                    type: 'mot_liaison_lexical',
                    position: i,
                    mot: mot.texte,
                    correction: 'de',
                    explication: 'On dit "beaucoup de", jamais "beaucoup des" dans ce contexte general.',
                    regle: 'Apres "beaucoup", on emploie en general la preposition "de".'
                };
                this.erreursTrouvees.push(erreur);
                mot.erreurs.push(erreur);
                continue;
            }

            if (texte === 'ou') {
                const motAvantPas = i > 1 ? this.phraseAnalysee[i - 2] : null;
                const texteAvantPas = this.normaliserTexte(motAvantPas && motAvantPas.texte ? motAvantPas.texte : '');
                const suitInfinitif = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees));
                const suitPronomSujet = !!(motSuivant && this.estType(motSuivant.donnees, 'pronom') && this.estPronomSujetToken(this.normaliserTexte(motSuivant.texte)));
                if (textePrecedent === 'pas' && (suitInfinitif || suitPronomSujet)) {
                    const erreur = {
                        type: 'homophone_ou_ou_grave',
                        position: i,
                        mot: mot.texte,
                        correction: 'où',
                        explication: 'Ici, le mot introduit un lieu ou une direction indirecte: on ecrit "où".',
                        regle: '"Ou" sert a choisir entre deux choses. "Où" renvoie a un lieu ou a une direction.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            if (texte === 'où') {
                const suitDet = !!(motSuivant && this.estDeterminantSurfaceToken(motSuivant.texte || ''));
                const idxPrec = this.obtenirIndexPrecedentSignificatif(i);
                const tokPrec = idxPrec >= 0 ? this.phraseAnalysee[idxPrec] : null;
                const precNominal = !!(tokPrec && (this.estType(tokPrec.donnees, 'nom') || this.estType(tokPrec.donnees, 'déterminant')));
                if (suitDet && precNominal) {
                    const erreur = {
                        type: 'homophone_ou_ou_grave',
                        position: i,
                        mot: mot.texte,
                        correction: 'ou',
                        explication: 'Ici, on exprime un choix entre deux éléments: on écrit "ou" sans accent.',
                        regle: '"Ou" sert à choisir entre deux éléments. "Où" renvoie à un lieu.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            if (texte === 'vois' && motPrecedent && this.estDeterminantNominalToken(motPrecedent)) {
                const erreur = {
                    type: 'mot_inconnu',
                    position: i,
                    mot: mot.texte,
                    correction: 'voix',
                    explication: 'Apres un determinant, on attend plutot le nom "voix" que le verbe "vois".',
                    regle: 'Apres un determinant, on attend souvent un nom. "Voix" est le nom; "vois" est le verbe voir.'
                };
                this.erreursTrouvees.push(erreur);
                mot.erreurs.push(erreur);
                continue;
            }

        }
    }

    global.AbeHomophonesModules = global.AbeHomophonesModules || {};
    global.AbeHomophonesModules.appliquerPassage1 = appliquerPassage1;
})(typeof window !== 'undefined' ? window : globalThis);
