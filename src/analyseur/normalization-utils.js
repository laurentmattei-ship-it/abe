(function (global) {
    const api = {
        normaliserTexte(value) {
            if (value === null || value === undefined) return '';
            return String(value)
                .toLowerCase()
                .replace(/Ã©|ã©/g, 'e')
                .replace(/Ã¨|ã¨/g, 'e')
                .replace(/Ãª|ãª/g, 'e')
                .replace(/Ã /g, 'a')
                .replace(/Ã¢|ã¢/g, 'a')
                .replace(/Ã¹|ã¹/g, 'u')
                .replace(/Ã»|ã»/g, 'u')
                .replace(/Ã´|ã´/g, 'o')
                .replace(/Ã®|ã®/g, 'i')
                .replace(/Ã¯|ã¯/g, 'i')
                .replace(/Ã§|ã§/g, 'c')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
        },

        normaliserCleRegle(value) {
            return this.normaliserTexte(value).replace(/[’']/g, "'");
        },

        versCleMojibake(value) {
            const texte = String(value || '');
            if (!texte) return '';
            try {
                return unescape(encodeURIComponent(texte));
            } catch (_) {
                return texte;
            }
        },

        reparerTexteMojibake(value) {
            const texte = String(value || '');
            if (!texte || !/[ÃãÂâ]/.test(texte)) return texte;
            const remplacements = [
                [/ã©|Ã©/g, 'é'],
                [/ã¨|Ã¨/g, 'è'],
                [/ãª|Ãª/g, 'ê'],
                [/ã«|Ã«/g, 'ë'],
                [/ã /g, 'à'],
                [/ã¢|Ã¢/g, 'â'],
                [/ã®|Ã®/g, 'î'],
                [/ã¯|Ã¯/g, 'ï'],
                [/ã´|Ã´/g, 'ô'],
                [/ã¹|Ã¹/g, 'ù'],
                [/ã»|Ã»/g, 'û'],
                [/ã¼|Ã¼/g, 'ü'],
                [/ã§|Ã§/g, 'ç'],
                [/å“/g, 'œ'],
                [/ã¦|Ã¦/g, 'æ']
            ];
            const corrigeManuel = remplacements.reduce((acc, [pattern, remplacement]) => acc.replace(pattern, remplacement), texte);
            if (!/[ÃãÂâ]/.test(corrigeManuel)) {
                return corrigeManuel;
            }
            try {
                const repare = decodeURIComponent(escape(texte));
                return repare && !repare.includes('�') ? repare : texte;
            } catch (_) {
                return corrigeManuel;
            }
        },

        motsEgauxSansCasse(motA, motB) {
            return String(motA || '').toLowerCase().trim() === String(motB || '').toLowerCase().trim();
        },

        normaliserType(value) {
            const t = this.normaliserTexte(value);
            if (t.includes('determinant') || t.includes('terminant') || t === 'det' || t === 'art') return 'déterminant';
            if (t.includes('pronom') || t === 'pro') return 'pronom';
            if (t.includes('adverb') || t === 'adv') return 'adverbe';
            if (t.includes('adject')) return 'adjectif';
            if (t === 'nc' || t === 'np' || t.includes('nom')) return 'nom';
            if (t.includes('ver') || t === 'aux') return 'verbe';
            if (t.includes('preposition') || t === 'pre') return 'préposition';
            if (t.includes('conjonction') || t === 'con') return 'conjonction';
            if (t.includes('interjection') || t === 'int') return 'interjection';
            return value;
        },

        normaliserNombre(value) {
            const n = this.normaliserTexte(value);
            if (n.startsWith('sing')) return 'singulier';
            if (n.startsWith('plur')) return 'pluriel';
            return null;
        },

        normaliserGenre(value) {
            const g = this.normaliserTexte(value);
            if (g.startsWith('masc')) return 'masculin';
            if (g.startsWith('fem')) return 'féminin';
            if (g.startsWith('mix')) return 'mixte';
            return null;
        },

        normaliserEntree(entree) {
            if (!entree) return null;

            const type = this.normaliserType(entree.type);
            const nombre = this.normaliserNombre(entree.nombre);
            const genre = this.normaliserGenre(entree.genre);

            return {
                ...entree,
                type,
                nombre: nombre || entree.nombre || null,
                genre: genre || entree.genre || null
            };
        },

        normaliserMotSimple(value) {
            return this.normaliserTexte(value)
                .replace(/[’']/g, '')
                .replace(/[^a-zàâçéèêëîïôûùüÿñæœ]/g, '');
        }
    };

    global.AbeAnalyseurNormalizationUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
