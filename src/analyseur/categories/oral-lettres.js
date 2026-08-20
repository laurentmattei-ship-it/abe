/**
 * Catégorie: détection de lettres manquantes ou en trop pour la dictée orale.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    /**
     * Détecte si le mot saisi est un préfixe du mot attendu (lettre manquante).
     * Ex: tron → tronc
     *
     * @param {string} motSaisi   - Mot écrit par l'élève
     * @param {string} motAttendu - Mot attendu par la dictée
     * @returns {object|null}     - { explication, titreAide, memo } ou null
     */
    // Suffixes purement grammaticaux (pluriel, conjugaison) — ne pas traiter comme "lettre manquante"
    const SUFFIXES_GRAMMATICAUX = ['nt', 'ez', 'ons', 's', 'x'];

    function enrichirExplicationLettreManquante(motSaisi, motAttendu) {
        if (!motAttendu.toLowerCase().startsWith(motSaisi.toLowerCase())) return null;
        if (motAttendu.length <= motSaisi.length) return null;
        if (motAttendu.length - motSaisi.length > 3) return null;

        // Si la seule différence est un suffixe grammatical, ce n'est pas une "lettre manquante"
        const suffixeManquant = motAttendu.slice(motSaisi.length).toLowerCase();
        if (SUFFIXES_GRAMMATICAUX.includes(suffixeManquant)) return null;

        const nbLettres = motAttendu.length - motSaisi.length;
        return {
            explication: `Il manque ${nbLettres === 1 ? 'une lettre' : nbLettres + ' lettres'} à la fin de « ${motSaisi} ». Écoute bien la fin du mot dans la dictée.`,
            titreAide: 'Lettre manquante',
            memo: `Écoute bien la fin du mot dans la dictée et vérifie chaque lettre.`
        };
    }

    /**
     * Détecte si le mot attendu est un préfixe du mot saisi (lettre en trop).
     * Ex: poure → pour
     *
     * @param {string} motSaisi   - Mot écrit par l'élève
     * @param {string} motAttendu - Mot attendu par la dictée
     * @returns {object|null}     - { explication, titreAide, memo } ou null
     */
    function enrichirExplicationLettreEnTrop(motSaisi, motAttendu) {
        if (!motSaisi.toLowerCase().startsWith(motAttendu.toLowerCase())) return null;
        if (motSaisi.length <= motAttendu.length) return null;
        if (motSaisi.length - motAttendu.length > 3) return null;

        // Si la seule différence est un suffixe grammatical, ce n'est pas une "lettre en trop"
        const suffixeEnTrop = motSaisi.slice(motAttendu.length).toLowerCase();
        if (SUFFIXES_GRAMMATICAUX.includes(suffixeEnTrop)) return null;

        const nbLettres = motSaisi.length - motAttendu.length;
        return {
            explication: `Tu as ajouté ${nbLettres === 1 ? 'une lettre en trop' : nbLettres + ' lettres en trop'} à la fin de « ${motSaisi} ». Vérifie si cette fin est nécessaire.`,
            titreAide: 'Lettre en trop',
            memo: `Relis le mot : certaines lettres prononcées ne s'écrivent pas, ou tu as ajouté une lettre inutile.`
        };
    }

    categories.enrichirExplicationLettreManquante = enrichirExplicationLettreManquante;
    categories.enrichirExplicationLettreEnTrop = enrichirExplicationLettreEnTrop;
})(typeof window !== 'undefined' ? window : globalThis);
