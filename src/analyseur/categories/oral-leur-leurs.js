/**
 * Catégorie: explications pour la distinction leur/leurs en dictée orale.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    /**
     * Génère une explication pédagogique pour l'erreur leur/leurs.
     *
     * @param {string} motSaisi           - Mot écrit par l'élève ("leur" ou "leurs")
     * @param {string} motAttendu          - Mot attendu ("leur" ou "leurs")
     * @param {object} tokenReferenceSuivant - Token suivant dans la phrase de référence
     * @param {function} detecterTypeToken   - Fonction pour détecter la nature d'un token
     * @returns {object|null}              - { explication, titreAide, memo } ou null
     */
    function enrichirExplicationLeurLeurs(motSaisi, motAttendu, tokenReferenceSuivant, detecterTypeToken) {
        const saisi = String(motSaisi || '').toLowerCase();
        const attendu = String(motAttendu || '').toLowerCase();
        const paireLeurLeurs = (attendu === 'leur' || attendu === 'leurs')
            && (saisi === 'leur' || saisi === 'leurs');
        if (!paireLeurLeurs) return null;

        if (attendu === 'leurs') {
            return {
                explication: 'Quand "leur" est devant un nom, c\'est un déterminant possessif. Il s\'accorde avec le nom qui suit : nom singulier → "leur", nom pluriel → "leurs". Regarde si le nom qui suit est au singulier ou au pluriel.',
                titreAide: 'Leur/leurs devant un nom',
                memo: 'Astuce : remplace par "ses". Si "ses" convient, écris "leurs" (pluriel). Sinon écris "leur" (singulier).'
            };
        }

        const typeSuivant = detecterTypeToken ? detecterTypeToken(tokenReferenceSuivant) : '';
        const suivantEstVerbe = typeSuivant.includes('verbe');
        const suivantEstNom = typeSuivant.includes('nom');

        if (suivantEstVerbe) {
            return {
                explication: 'Ici, "leur" est placé devant un verbe : c\'est un pronom (remplace "à eux" / "à elles"). Dans ce cas, il est toujours invariable : jamais de "s".',
                titreAide: 'Leur pronom (devant un verbe)',
                memo: 'Astuce : remplace par "lui". Si "lui" fonctionne, on écrit "leur" sans s.'
            };
        }

        if (suivantEstNom) {
            return {
                explication: 'Ici, "leur" est devant un nom : c\'est un déterminant possessif. Il s\'accorde avec le nom qui suit : nom singulier → "leur", nom pluriel → "leurs". Regarde si le nom qui suit est au singulier ou au pluriel.',
                titreAide: 'Leur/leurs devant un nom',
                memo: 'Astuce : remplace par "son/sa" au singulier et par "ses" au pluriel.'
            };
        }

        return {
            explication: 'Pour "leur/leurs", regarde le mot suivant : devant un verbe, "leur" est un pronom invariable (jamais de s). Devant un nom, c\'est un déterminant qui s\'accorde : "leur" (singulier) ou "leurs" (pluriel).',
            titreAide: 'Choisir entre leur et leurs',
            memo: 'Devant verbe → "leur". Devant nom → accord avec le nom (leur/leurs).'
        };
    }

    categories.enrichirExplicationLeurLeurs = enrichirExplicationLeurLeurs;
})(typeof window !== 'undefined' ? window : globalThis);
