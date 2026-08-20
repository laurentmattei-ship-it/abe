import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Corpus Integrity - Validation des 2 Grands Corpus JSON (100 phrases)', () => {
    const corpusFiles = [
        'Corpus1.json', 'Corpus2.json'
    ];

    for (const fileName of corpusFiles) {
        it(`valide la structure et le contenu de ${fileName}`, () => {
            const filePath = path.resolve('corpus', fileName);
            assert.ok(fs.existsSync(filePath), `Le fichier ${filePath} doit exister`);

            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);
            assert.ok(Array.isArray(data), `${fileName} doit contenir un tableau de phrases`);
            assert.ok(data.length > 0, `${fileName} ne doit pas être vide (trouvé ${data.length} phrases)`);

            data.forEach((entry, idx) => {
                const phrase = entry.phrase_normalisee || entry.phrase_originale;
                assert.ok(typeof phrase === 'string' && phrase.trim().length > 0, `Phrase valide à l'index ${idx} dans ${fileName}`);
                assert.ok(Array.isArray(entry.tokens), `Tableau 'tokens' requis à l'index ${idx} dans ${fileName}`);
                assert.ok(entry.tokens.length >= 3, `Au moins 3 tokens requis à l'index ${idx} dans ${fileName}`);

                entry.tokens.forEach((token, tIdx) => {
                    assert.ok(Number.isInteger(token.id), `ID entier requis pour token ${tIdx} dans ${fileName}`);
                    assert.ok(typeof token.texte === 'string', `Texte string requis pour token ${tIdx} dans ${fileName}`);
                    assert.ok(typeof token.nature === 'string', `Nature string requise pour token ${tIdx} dans ${fileName}`);
                });

                if (entry.relations_globales) {
                    assert.ok(Array.isArray(entry.relations_globales), `relations_globales doit être un tableau à l'index ${idx}`);
                }
            });
        });
    }
});
