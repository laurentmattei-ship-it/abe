(function (global) {
    const api = {
        obtenirIndexPrecedentSignificatif(index) {
            for (let i = index - 1; i >= 0; i--) {
                const mot = this.phraseAnalysee[i];
                if (!mot || this.estPonctuationToken(mot.texte)) continue;
                return i;
            }
            return -1;
        },

        obtenirIndexSuivantSignificatif(index) {
            for (let i = index + 1; i < this.phraseAnalysee.length; i++) {
                const mot = this.phraseAnalysee[i];
                if (!mot || this.estPonctuationToken(mot.texte)) continue;
                return i;
            }
            return -1;
        },

        obtenirVoisinLexicalNormaliseDepuisPhrase(phrase, index, direction) {
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
        },

        obtenirFrequenceCorpus(map, cle) {
            if (!map || !cle) return 0;
            return map.get(cle) || 0;
        },

        scoreTransitionCorpusBescherelle(gauche, droite) {
            if (!this.corpusBescherelleActif || !gauche || !droite) return 0;

            const freqGauche = this.obtenirFrequenceCorpus(this.frequencesUnigrammesBescherelle, gauche);
            const freqBigramme = this.obtenirFrequenceCorpus(this.frequencesBigrammesBescherelle, `${gauche}|${droite}`);
            const denominateur = freqGauche + this.tailleVocabulaireBescherelle + 1;
            return Math.log((freqBigramme + 1) / Math.max(1, denominateur));
        },

        scoreContexteMotCorpusBescherelle(voisinGauche, mot, voisinDroite) {
            if (!this.corpusBescherelleActif) return 0;
            const centre = this.normaliserMotSimple(mot || '');
            if (!centre) return 0;

            let score = 0;
            if (voisinGauche) score += this.scoreTransitionCorpusBescherelle(voisinGauche, centre);
            if (voisinDroite) score += this.scoreTransitionCorpusBescherelle(centre, voisinDroite);
            return score;
        },

        verifierCoherenceContextuelleBescherelle() {
            const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
                ? window.AbeAnalyseurCategories
                : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                    ? globalThis.AbeAnalyseurCategories
                    : null;

            if (!categories || typeof categories.verifierCoherenceContextuelleBescherelle !== 'function') {
                throw new Error('Module catégorie non chargé pour verifierCoherenceContextuelleBescherelle');
            }

            return categories.verifierCoherenceContextuelleBescherelle.call(this);
        },

        commenceParVoyelleOuH(texte) {
            const normalise = this.normaliserTexte(texte || '');
            return /^[aeiouyh]/.test(normalise);
        },

        estTokenNegation(texte) {
            const t = (texte || '').toLowerCase();
            return t === 'ne' || t === "n'" || t === 'n';
        },

        estClitiqueObjetToken(texte) {
            const t = this.normaliserTexte(texte || '').replace(/[’']/g, '');
            return new Set([
                'me', 'm', 'te', 't', 'se', 's', 'le', 'la', 'les', 'l', 'lui', 'leur',
                'nous', 'vous', 'y', 'en'
            ]).has(t);
        },

        creerSujetVirtuel(texte, nombre = 'pluriel') {
            return {
                texte,
                donnees: {
                    type: 'pronom',
                    nombre,
                    personne: texte === 'vous' ? '2e' : (texte === 'nous' ? '1re' : '3e')
                },
                erreurs: []
            };
        }
    };

    global.AbeAnalyseurContextUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
