/**
 * Catégorie: templates de nature du mot pour les explications pédagogiques.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    const TEMPLATES_NATURE = {
        nom: {
            titre: 'Nature du mot : nom',
            explication: () => `Le mot attendu est un nom. Un nom désigne une personne, un objet, un lieu ou une idée.`,
            memo: 'Pour un nom, vérifie l\'orthographe du noyau du mot puis l\'accord en nombre avec son déterminant.'
        },
        determinant: {
            titre: 'Nature du mot : déterminant',
            explication: () => `Le mot attendu est un déterminant. Il accompagne le nom et marque le genre/nombre (ou la possession).`,
            memo: 'Regarde le nom qui suit: le déterminant doit être cohérent avec ce nom.'
        },
        'déterminant': {
            titre: 'Nature du mot : déterminant',
            explication: () => `Le mot attendu est un déterminant. Il accompagne le nom et marque le genre/nombre (ou la possession).`,
            memo: 'Regarde le nom qui suit: le déterminant doit être cohérent avec ce nom.'
        },
        verbe: {
            titre: 'Nature du mot : verbe',
            explication: () => `Le mot attendu est un verbe. Le verbe exprime une action ou un état et se conjugue selon le sujet.`,
            memo: 'Pour un verbe, vérifie le sujet puis la terminaison (personne/nombre/temps).'
        },
        adjectif: {
            titre: 'Nature du mot : adjectif',
            explication: () => `Le mot attendu est un adjectif. Il apporte une précision sur un nom (ou un sujet avec un verbe d\'état).`,
            memo: 'Vérifie l\'accord de l\'adjectif avec le nom/sujet (genre et nombre).'
        },
        pronom: {
            titre: 'Nature du mot : pronom',
            explication: () => `Le mot attendu est un pronom. Il remplace un nom pour éviter la répétition.`,
            memo: 'Identifie quel nom ce pronom représente pour vérifier la bonne forme.'
        },
        preposition: {
            titre: 'Nature du mot : préposition',
            explication: () => `Le mot attendu est une préposition. C\'est un petit mot invariable qui relie deux groupes de mots.`,
            memo: 'Les prépositions sont invariables: on retient leur forme exacte.'
        },
        'préposition': {
            titre: 'Nature du mot : préposition',
            explication: () => `Le mot attendu est une préposition. C\'est un petit mot invariable qui relie deux groupes de mots.`,
            memo: 'Les prépositions sont invariables: on retient leur forme exacte.'
        },
        conjonction: {
            titre: 'Nature du mot : conjonction',
            explication: () => `Le mot attendu est une conjonction. Elle relie deux mots ou deux propositions.`,
            memo: 'Les conjonctions sont des mots de liaison: on mémorise leur orthographe.'
        },
        adverbe: {
            titre: 'Nature du mot : adverbe',
            explication: () => `Le mot attendu est un adverbe. Il modifie le sens d\'un verbe, d\'un adjectif ou d\'un autre adverbe.`,
            memo: 'Beaucoup d\'adverbes sont invariables: vérifie leur forme exacte.'
        }
    };

    /**
     * Construit une explication basée sur la nature grammaticale du mot.
     *
     * @param {object} tokenDetail - Token avec propriété nature, texte, lemme, fonction
     * @returns {object|null}      - { titreAide, explication, memo } ou null
     */
    function construireExplicationParNature(tokenDetail) {
        if (!tokenDetail) return null;

        const nature = String(tokenDetail.nature || '').trim().toLowerCase();
        const texte = String(tokenDetail.texte || '').trim();
        const lemme = String(tokenDetail.lemme || '').trim();
        const fonction = String(tokenDetail.fonction || '').trim();

        const template = TEMPLATES_NATURE[nature] || null;
        if (!template) return null;

        const complement = [];
        if (lemme) complement.push(`Infinitif ou lemme : ${lemme}.`);
        if (fonction) complement.push(`Fonction repérée : ${fonction}.`);

        return {
            titreAide: template.titre,
            explication: `${template.explication()} ${complement.join(' ')}`.trim(),
            memo: template.memo
        };
    }

    categories.construireExplicationParNature = construireExplicationParNature;
    categories.TEMPLATES_NATURE = TEMPLATES_NATURE;
})(typeof window !== 'undefined' ? window : globalThis);
