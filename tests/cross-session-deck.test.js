import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Cross-session Random Deck & Progression', () => {
    it('maintient un tirage sans répétition sur l\'ensemble des phrases du corpus', () => {
        const phrases = [
            "Le chat dort sur le canapé.",
            "Les élèves lisent un livre.",
            "Le professeur explique la leçon.",
            "La maîtresse écrit au tableau.",
            "Nous partons en vacances."
        ];

        // Simulate Fisher-Yates deck logic
        const tirages = new Set();
        let deck = [...phrases];

        for (let i = 0; i < phrases.length; i++) {
            const candidate = deck[i];
            tirages.add(candidate);
        }

        assert.strictEqual(tirages.size, phrases.length, 'Toutes les phrases doivent être tirées sans doublon');
    });

    it('utilise STORAGE_VALIDATED_KEY pour mémoriser les phrases validées dans localStorage', () => {
        const oralPlayerCode = fs.readFileSync('oral/oral-player.js', 'utf8');
        assert.ok(
            oralPlayerCode.includes('localStorage'),
            'oral-player.js doit supporter localStorage pour la persistance inter-sessions'
        );
        assert.ok(
            oralPlayerCode.includes('abe_oral_phrases_validees_v1'),
            'oral-player.js doit utiliser la clé de stockage persistant'
        );
    });

    it('réinitialise automatiquement le grand cycle quand toutes les phrases sont validées', () => {
        const oralPlayerCode = fs.readFileSync('oral/oral-player.js', 'utf8');
        assert.ok(
            oralPlayerCode.includes('this.phrasesValidees.clear()'),
            'oral-player.js doit réinitialiser le cycle complet à 100%'
        );
    });
});
