/**
 * Catégorie: règles contextuelles par type d'erreur pour la dictée orale.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    const REGLES_PAR_TYPE = {
        'Leur': "Ce mot n'est pas écrit avec la forme adaptée à cette phrase. Réfléchis en regardant les mots qui sont autour.",
        'accent': 'Les accents et la cédille font partie de l\'orthographe correcte du mot. Il faut les écrire.',
        'cédille': 'Les accents et la cédille font partie de l\'orthographe correcte du mot. Il faut les écrire.',
        'conjugaison': 'Un verbe doit être conjugué selon son sujet. Vérifie qui fait l\'action.',
        'lettre manquante': 'Il manque une ou plusieurs lettres au mot que tu as écrit.',
        'lettre en trop': 'Tu as ajouté une ou plusieurs lettres en trop dans ce mot.',
        'homophone': 'Des mots qui se prononcent de la même façon ne s\'écrivent pas pareil. Choisis la bonne orthographe.',
        'orthographe': 'L\'orthographe d\'un nom dépend de son genre, son nombre et ses lettres particulières. Vérifie chaque lettre.',
        'accord': 'L\'accord en genre et en nombre est obligatoire. Vérifie le mot avec celui qu\'il accompagne.',
        'nature': 'La nature du mot (nom, verbe, adjectif…) détermine les règles d\'orthographe qui s\'appliquent. Identifie-la pour choisir la bonne forme.'
    };

    const REGLE_GENERIQUE = 'La phrase attendue doit être reproduite exactement, mot par mot et ponctuation comprise.';

    /**
     * Retourne la règle contextuelle adaptée au titre d'aide de l'erreur.
     *
     * @param {string} titreAide - Titre d'aide de l'erreur (ex: "Accent ou cédille manquant(e)")
     * @returns {string}         - Règle pédagogique adaptée
     */
    function obtenirReglePourTitreAide(titreAide) {
        if (!titreAide) return REGLE_GENERIQUE;

        // Cas spécial leur/leurs
        if (titreAide.includes('Leur')) {
            return REGLES_PAR_TYPE['Leur'];
        }

        // Recherche par mot-clé dans le titre
        for (const [cle, regle] of Object.entries(REGLES_PAR_TYPE)) {
            if (cle === 'Leur') continue;
            if (titreAide.toLowerCase().includes(cle)) {
                return regle;
            }
        }

        return REGLE_GENERIQUE;
    }

    categories.obtenirReglePourTitreAide = obtenirReglePourTitreAide;
})(typeof window !== 'undefined' ? window : globalThis);
