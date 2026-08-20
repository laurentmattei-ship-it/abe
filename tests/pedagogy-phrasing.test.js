import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Pedagogy Phrasing - Cohérence et Justesse Pédagogique', () => {
    it('ne doit plus contenir la formulation inversée "Le mot que tu as écrit est un" dans oral-pedagogy.js', () => {
        const content = fs.readFileSync('src/main/oral-pedagogy.js', 'utf8');
        assert.ok(
            !content.includes('Le mot que tu as écrit est un nom'),
            'Ne doit pas affirmer à tort ce que l\'élève a écrit pour un nom attendu'
        );
        assert.ok(
            !content.includes('Le mot que tu as écrit est un verbe'),
            'Ne doit pas affirmer à tort ce que l\'élève a écrit pour un verbe attendu'
        );
        assert.ok(
            !content.includes('Le mot que tu as écrit est un adjectif'),
            'Ne doit pas affirmer à tort ce que l\'élève a écrit pour un adjectif attendu'
        );
        assert.ok(
            !content.includes('Le mot que tu as écrit est un déterminant'),
            'Ne doit pas affirmer à tort ce que l\'élève a écrit pour un déterminant attendu'
        );
        assert.ok(
            content.includes('Dans la phrase dictée, ce mot est'),
            'Doit utiliser la formulation "Dans la phrase dictée, ce mot est..."'
        );
    });

    it('gère "determinant" correctement dans interaction-guidance et oral-pedagogy', () => {
        const contentGuidance = fs.readFileSync('src/main/interaction-guidance.js', 'utf8');
        assert.ok(contentGuidance.includes('contexte.determinant'), 'Doit définir contexte.determinant');

        const contentPedagogy = fs.readFileSync('src/analyseur/categories/pedagogie.js', 'utf8');
        assert.ok(contentPedagogy.includes('contexte.determinant'), 'Doit supporter contexte.determinant');
    });

    it('utilise "mot attendu" au lieu de "mot du corpus" dans les aides génériques d\'oral-pedagogy.js', () => {
        const content = fs.readFileSync('src/main/oral-pedagogy.js', 'utf8');
        assert.ok(
            !content.includes('Le mot que tu as écrit ne correspond pas au mot du corpus'),
            'Ne doit plus contenir "Le mot que tu as écrit ne correspond pas au mot du corpus."'
        );
        assert.ok(
            content.includes('Le mot que tu as écrit ne correspond pas au mot attendu'),
            'Doit contenir "Le mot que tu as écrit ne correspond pas au mot attendu."'
        );
    });
});
