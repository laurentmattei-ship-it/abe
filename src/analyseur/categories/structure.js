/**
 * Catégorie extraite d'analyseur.js
 * Fichier: structure.js
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierMajusculeEtPonctuationFinale() {
        const premierIndex = this.obtenirIndexSuivantSignificatif(-1);
        if (premierIndex >= 0) {
            const premierMot = this.phraseAnalysee[premierIndex];
            const texte = premierMot && premierMot.texte ? premierMot.texte : '';
            if (texte && /^[a-zàâçéèêëîïôûùüÿœæ]/.test(texte)) {
                const correction = texte.charAt(0).toUpperCase() + texte.slice(1);
                const erreur = this.creerErreurContextuelle({
                    type: 'majuscule_phrase',
                    position: premierIndex,
                    mot: texte,
                    correction,
                    explication: 'Une phrase commence par une majuscule.',
                    regle: 'On met toujours une majuscule au début d’une phrase.',
                    memo: 'Début de phrase = majuscule obligatoire.',
                    exemples: ['je pars. → Je pars.', 'aujourd\'hui... → Aujourd\'hui...'],
                    titreAide: 'Majuscule en début de phrase'
                });
                this.enregistrerErreurContextuelle(erreur);
            }
        }

        let dernierIndex = -1;
        for (let i = this.phraseAnalysee.length - 1; i >= 0; i--) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;
            if (this.estPonctuationToken(mot.texte)) {
                if (/[.!?]/.test(mot.texte)) return;
                continue;
            }
            dernierIndex = i;
            break;
        }

        if (dernierIndex >= 0) {
            const dernierMot = this.phraseAnalysee[dernierIndex];
            if (!Array.isArray(dernierMot.erreurs) || !dernierMot.erreurs.some((e) => e && e.type === 'ponctuation_finale')) {
                const erreur = this.creerErreurContextuelle({
                    type: 'ponctuation_finale',
                    position: dernierIndex,
                    mot: dernierMot.texte,
                    correction: `${dernierMot.texte}.`,
                    explication: 'Une phrase se termine par un signe de ponctuation finale.',
                    regle: 'À la fin d’une phrase, on met un point, un point d’interrogation ou un point d’exclamation.',
                    memo: 'Fin de phrase = ponctuation finale.',
                    exemples: ['Je pars → Je pars.', 'Tu viens → Tu viens ?'],
                    titreAide: 'Ponctuation finale'
                });
                this.erreursTrouvees.push(erreur);
                dernierMot.erreurs.push(erreur);
            }
        }
    }

    categories.verifierMajusculeEtPonctuationFinale = verifierMajusculeEtPonctuationFinale;

    function verifierNegationsIncompletes() {
        const marqueursNegation = new Set(['pas', 'jamais', 'plus', 'rien', 'personne', 'guere']);

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            const mot = this.phraseAnalysee[i];
            if (!mot || !marqueursNegation.has(this.normaliserTexte(mot.texte))) continue;
            if (this.estComparatifPlus(i)) continue;

            const indexVerbe = this.obtenirIndexPrecedentSignificatif(i);
            if (indexVerbe < 0) continue;
            if (this.positionsIgnoreesErreursGeneriques.has(indexVerbe)) continue;
            const verbe = this.phraseAnalysee[indexVerbe];
            if (!verbe || this.estPonctuationToken(verbe.texte)) continue;

            const estVerbal = this.estType(verbe.donnees, 'verbe') || this.estFormeAuxiliaireConnue(verbe.texte);
            if (!estVerbal) continue;

            const indexAvantVerbe = this.obtenirIndexPrecedentSignificatif(indexVerbe);
            if (indexAvantVerbe >= 0 && this.positionsIgnoreesErreursGeneriques.has(indexAvantVerbe)) {
                continue;
            }
            if (indexAvantVerbe >= 0) {
                const avantVerbe = this.phraseAnalysee[indexAvantVerbe];
                const texteAvantVerbe = this.normaliserTexte(avantVerbe && avantVerbe.texte ? avantVerbe.texte : '').replace(/[’']/g, '');
                if (texteAvantVerbe === 'c') {
                    continue;
                }
            }
            if (indexAvantVerbe >= 0 && this.estTokenNegation(this.phraseAnalysee[indexAvantVerbe].texte)) {
                continue;
            }

            let indexDebut = indexVerbe;
            let correction = this.commenceParVoyelleOuH(verbe.texte)
                ? `n'${verbe.texte}`
                : `ne ${verbe.texte}`;

            if (indexAvantVerbe >= 0 && this.estSujetOuPronomToken(this.phraseAnalysee[indexAvantVerbe])) {
                indexDebut = indexAvantVerbe;
                let sujetTexte = this.phraseAnalysee[indexAvantVerbe].texte;
                if (/^j'?$/i.test(sujetTexte)) {
                    sujetTexte = 'je';
                }
                const neParticule = this.commenceParVoyelleOuH(verbe.texte) ? "n'" : 'ne ';
                correction = `${sujetTexte} ${neParticule}${verbe.texte}`;
            }

            const morceaux = [];
            for (let j = indexDebut; j <= indexVerbe; j++) {
                const token = this.phraseAnalysee[j];
                if (token && token.texte) morceaux.push(token.texte);
            }

            const erreur = this.creerErreurContextuelle({
                type: 'negation_incomplete',
                position: indexDebut,
                indexDebut,
                spanLongueur: indexVerbe - indexDebut + 1,
                mot: morceaux.join(' '),
                correction,
                explication: 'Dans une phrase négative soignée, on encadre le verbe avec "ne / n\'" et un autre mot de négation comme "pas" ou "jamais".',
                regle: 'La négation complète s’écrit avec deux éléments : ne / n\' + verbe + pas / jamais / plus / rien…',
                memo: 'Dans l’écrit scolaire, on garde la négation complète : ne / n\' ... pas, jamais, plus…',
                exemples: ['il a pas vu → il n\'a pas vu', 'je veux pas → je ne veux pas', 'j\'ai jamais → je n\'ai jamais'],
                titreAide: 'Négation incomplète'
            });

            this.enregistrerErreurContextuelle(erreur);
        }
    }

    categories.verifierNegationsIncompletes = verifierNegationsIncompletes;

    function verifierTraitUnionInversion() {
        for (let i = 0; i < this.phraseAnalysee.length - 1; i++) {
            const verbe = this.phraseAnalysee[i];
            const pronom = this.phraseAnalysee[i + 1];

            if (!verbe || !pronom || !verbe.texte || !pronom.texte) continue;
            if (this.estPonctuationToken(verbe.texte) || this.estPonctuationToken(pronom.texte)) continue;

            const estVerbal = this.estType(verbe.donnees, 'verbe') || this.estFormeAuxiliaireConnue(verbe.texte);
            if (!estVerbal || !this.estPronomSujetInversion(pronom.texte)) continue;

            if (!this.estContexteInterrogatifDepuis(i)) continue;

            const dejaSignale = Array.isArray(pronom.erreurs)
                && pronom.erreurs.some((erreur) => erreur && erreur.type === 'trait_union_inversion');
            if (dejaSignale) continue;

            const correction = this.construireInversionAvecTraitUnion(verbe.texte, pronom.texte);
            const erreur = this.creerErreurContextuelle({
                type: 'trait_union_inversion',
                position: i,
                indexDebut: i,
                spanLongueur: 2,
                mot: `${verbe.texte} ${pronom.texte}`,
                correction,
                explication: 'Dans l\'inversion sujet-verbe d\'une question, on relie le verbe et le pronom sujet avec un trait d\'union.',
                regle: 'En interrogation inversée, on écrit verbe-pronom (ex: as-tu, vient-il, peut-on).',
                memo: 'Question inversée = trait d\'union entre verbe et sujet.',
                exemples: ['as tu ? → as-tu ?', 'vient il ? → vient-il ?', 'a il ? → a-t-il ?'],
                titreAide: 'Trait d\'union en inversion'
            });

            this.enregistrerErreurContextuelle(erreur);
        }
    }

    categories.verifierTraitUnionInversion = verifierTraitUnionInversion;

})(typeof window !== 'undefined' ? window : globalThis);
