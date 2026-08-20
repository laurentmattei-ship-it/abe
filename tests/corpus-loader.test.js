import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Corpus Loader - Couverture Complète des Fallbacks', () => {
    it('vérifie que corpus-oral.js inclut Corpus1 et Corpus2 dans son fallback', () => {
        const content = fs.readFileSync('corpus/corpus-oral.js', 'utf8');
        for (let i = 1; i <= 2; i++) {
            assert.ok(content.includes(`Corpus${i}.json`), `Corpus${i}.json doit être présent dans corpus/corpus-oral.js`);
        }
    });

    it('vérifie que oral-pedagogy.js inclut Corpus1 et Corpus2 dans son fallback', () => {
        const content = fs.readFileSync('src/main/oral-pedagogy.js', 'utf8');
        for (let i = 1; i <= 2; i++) {
            assert.ok(content.includes(`Corpus${i}.json`), `Corpus${i}.json doit être présent dans src/main/oral-pedagogy.js`);
        }
    });
});
