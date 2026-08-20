/**
 * Catégorie extraite d'analyseur.js
 * Fichier: coherence.js
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierCoherenceContextuelleBescherelle() {
        if (!this.corpusBescherelleActif) return;

        // Noms propres ou courants sujets à de fréquents faux positifs dans le corpus
        const MOTS_PROTEGES_COHERENCE = new Set([
            'parc', 'parcs', 'bras', 'pied', 'pieds', 'fond', 'port', 'ports',
            'vers', 'verre', 'vert', 'verts', 'sol', 'sot', 'sort', 'sort',
            'quoi', 'dois', 'savent', 'font', 'parce', 'cassé', 'pleut', 'peur', 'partit', 'cap'
        ]);

        const estInfinitifLegitimeApresSemiAuxiliaire = (indexMot) => {
            const motCourant = this.phraseAnalysee[indexMot];
            if (!motCourant || !motCourant.donnees || !this.estType(motCourant.donnees, 'verbe')) return false;
            if (!this.estFormeInfinitive(motCourant.texte, motCourant.donnees)) return false;

            const idxPrec = this.obtenirIndexPrecedentSignificatif(indexMot);
            if (idxPrec < 0) return false;
            const precedent = this.phraseAnalysee[idxPrec];
            return precedent && this.estSemiAuxiliaireTexte(precedent.texte || '');
        };

        const estContexteLegitimeFais = (indexMot) => {
            const motCourant = this.phraseAnalysee[indexMot];
            if (!motCourant || this.normaliserMotSimple(motCourant.texte) !== 'fais') return false;

            // Cherche un sujet proche en remontant les tokens (en ignorant clitiques et negation).
            const IGNORER_AVANT_VERBE = new Set(['ne', "n'", 'me', "m'", 'te', "t'", 'se', "s'", 'en', 'y']);
            const SUJETS_COMPATIBLES = new Set(['je', "j'", 'tu']);

            let sujetProche = null;
            for (let k = indexMot - 1; k >= 0 && k >= indexMot - 4; k--) {
                const precedent = this.phraseAnalysee[k];
                if (!precedent || !precedent.texte) continue;
                if (this.estPonctuationToken(precedent.texte)) break;
                const t = this.normaliserTexte(precedent.texte);
                if (IGNORER_AVANT_VERBE.has(t)) continue;
                sujetProche = t;
                break;
            }

            return sujetProche ? SUJETS_COMPATIBLES.has(sujetProche) : false;
        };

        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte || this.estPonctuationToken(mot.texte)) continue;
            if (Array.isArray(mot.erreurs) && mot.erreurs.length > 0) continue;

            const original = this.normaliserMotSimple(mot.texte);
            if (!original || original.length < 4) continue;
            if (MOTS_PROTEGES_COHERENCE.has(original)) continue;
            if (this.estTokenProtege(i)) continue;
            if (this.estParticipePasseTolereParAuxiliaire(i)) continue;
            if (estInfinitifLegitimeApresSemiAuxiliaire(i)) continue;
            if (estContexteLegitimeFais(i)) continue;
            if (!this.getWordData(mot.texte)) continue;

            const voisinGauche = this.obtenirVoisinLexicalNormaliseDepuisPhrase(this.phraseAnalysee, i, -1);
            const voisinDroite = this.obtenirVoisinLexicalNormaliseDepuisPhrase(this.phraseAnalysee, i, 1);
            if (!voisinGauche && !voisinDroite) continue;

            const scoreActuel = this.scoreContexteMotCorpusBescherelle(voisinGauche, original, voisinDroite);
            let meilleur = null;

            const candidats = this.obtenirCandidatsCorrection(original);
            const LIMITE_CANDIDATS_COHERENCE = 300;
            let nombreCandidatsTraites = 0;
            for (const candidat of candidats) {
                if (nombreCandidatsTraites >= LIMITE_CANDIDATS_COHERENCE) break;
                nombreCandidatsTraites += 1;

                const cand = this.normaliserMotSimple(candidat);
                if (!cand || cand === original) continue;
                if (!this.getWordData(candidat)) continue;

                const distance = this.calculerDistance(original, cand, true);
                if (distance <= 0 || distance > 2) continue;

                const distancePhonetique = this.calculerDistance(
                    this.simplifierPhonetique(original),
                    this.simplifierPhonetique(cand),
                    true
                );
                if (distancePhonetique > 1 && distance > 1) continue;

                const scoreCandidat = this.scoreContexteMotCorpusBescherelle(voisinGauche, cand, voisinDroite);
                if (!meilleur || scoreCandidat > meilleur.score) {
                    meilleur = { mot: candidat, score: scoreCandidat };
                }
            }

            if (!meilleur) continue;

            const delta = meilleur.score - scoreActuel;
            const freqOrig = this.obtenirFrequenceCorpus(this.frequencesUnigrammesBescherelle, original);
            const freqCand = this.obtenirFrequenceCorpus(this.frequencesUnigrammesBescherelle, this.normaliserMotSimple(meilleur.mot));
            if (delta < 1.8) continue;
            if (freqCand < Math.max(5, freqOrig * 2)) continue;

            const erreur = this.creerErreurContextuelle({
                type: 'coherence_contextuelle_bescherelle',
                position: i,
                mot: mot.texte,
                correction: meilleur.mot,
                explication: 'Le contexte de la phrase correspond davantage à une autre graphie. Le moteur compare les enchaînements de mots appris sur l’ensemble du corpus Bescherelle.',
                regle: 'Pour choisir entre deux graphies proches, on vérifie la cohérence avec les mots voisins (gauche et droite).',
                memo: 'Lis les mots autour: la forme qui s’accorde le mieux avec le contexte est souvent la bonne.',
                exemples: ['Repère de contexte: vérifier le mot avec son voisin de gauche et son voisin de droite.'],
                titreAide: 'Cohérence contextuelle'
            });

            this.enregistrerErreurContextuelle(erreur);
        }
    }

    categories.verifierCoherenceContextuelleBescherelle = verifierCoherenceContextuelleBescherelle;

})(typeof window !== 'undefined' ? window : globalThis);
