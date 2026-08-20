/**
 * Catégorie: définitions pédagogiques (nature, dépendance, relation globale).
 * Données pures extractibles de main.js.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    const DEFINITIONS_NATURE = {
        nom: 'Désigne une personne, un objet, un lieu ou une idée.',
        determinant: 'Accompagne le nom, marque le genre/nombre (ou la possession).',
        'déterminant': 'Accompagne le nom, marque le genre/nombre (ou la possession).',
        verbe: 'Exprime une action ou un état, se conjugue selon le sujet.',
        adjectif: 'Apporte une précision sur un nom (ou un sujet avec un verbe d\'état).',
        pronom: 'Remplace un nom pour éviter la répétition.',
        preposition: 'Petit mot invariable qui relie deux groupes de mots.',
        'préposition': 'Petit mot invariable qui relie deux groupes de mots.',
        conjonction: 'Mot de liaison qui relie deux mots ou deux propositions.',
        adverbe: 'Modifie le sens d\'un verbe, d\'un adjectif ou d\'un autre adverbe.',
        participe: 'Forme du verbe utilisée comme adjectif ou dans un temps composé.',
        interjection: 'Mot qui exprime une émotion (ah, oh, zut).',
        numéral: 'Mot qui exprime un nombre (deux, cent).',
        'nom propre': 'Nom désignant un être ou lieu unique (Marie, Paris).'
    };

    const DEFINITIONS_DEPENDANCE = {
        nsubj: 'Sujet : celui qui fait l\'action.',
        obj: 'COD : l\'objet direct de l\'action.',
        obl: 'Complément circonstanciel : précise le lieu, le temps, le moyen.',
        det: 'Déterminant : lié au nom qu\'il introduit.',
        amod: 'Adjectif épithète : lié directement au nom qu\'il qualifie.',
        nmod: 'Complément du nom : un nom qui complète un autre nom (ex: le sac de Pierre).',
        xcomp: 'Complément de verbe infinitif : un verbe qui en suit un autre (ex: il veut partir).',
        advcl: 'Proposition subordonnée : une phrase qui agit comme un adverbe.',
        case: 'Marqueur de cas : la préposition qui introduit un groupe.',
        mark: 'Marqueur de subordination : le mot qui lance une sous-phrase (ex: parce que).',
        expl: 'Explétif : le "il" dans "Il pleut" (il ne représente personne).'
    };

    const DEFINITIONS_RELATION_GLOBALE = {
        accord_sujet_verbe: 'La flèche part du nsubj vers le verbe. C\'est la priorité n°1.',
        accord_sujet_verbe_passif: 'Attention, le sujet subit l\'action (ex: La souris est mangée).',
        accord_relatif: 'Le verbe s\'accorde avec l\'antécédent du pronom "qui".',
        accord_attribut: 'L\'adjectif s\'accorde avec le sujet via un verbe d\'état (être, paraître).',
        accord_participe_passe_cod_antepose: 'Cas complexe: le obj est placé avant le verbe (ex: Les fleurs que j\'ai cueillies).'
    };

    function obtenirDefinitionNaturePedagogique(nature) {
        const cle = String(nature || '').toLowerCase().trim();
        return DEFINITIONS_NATURE[cle] || '';
    }

    function obtenirDefinitionDependancePedagogique(dep) {
        const cle = String(dep || '').toLowerCase().trim();
        return DEFINITIONS_DEPENDANCE[cle] || '';
    }

    function obtenirDefinitionRelationGlobalePedagogique(type) {
        const cle = String(type || '').toLowerCase().trim();
        return DEFINITIONS_RELATION_GLOBALE[cle] || '';
    }

    categories.obtenirDefinitionNaturePedagogique = obtenirDefinitionNaturePedagogique;
    categories.obtenirDefinitionDependancePedagogique = obtenirDefinitionDependancePedagogique;
    categories.obtenirDefinitionRelationGlobalePedagogique = obtenirDefinitionRelationGlobalePedagogique;
})(typeof window !== 'undefined' ? window : globalThis);
