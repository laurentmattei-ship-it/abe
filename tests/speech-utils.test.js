import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const loaded = require('../oral/speech-utils.js');
const speechUtils = (loaded && typeof loaded.preparerTexteSynthese === 'function')
    ? loaded
    : (globalThis.AbeSpeechUtils || loaded);

describe('Speech Utils - Phonetic Synthesis Corrections', () => {
    it('corrige "prudent" en "prudant" (et non "prudamment")', () => {
        const input = "Le chat est prudent.";
        const output = speechUtils.preparerTexteSynthese(input);
        assert.ok(output.includes('prudant'), `Attendu 'prudant', reçu : ${output}`);
        assert.ok(!output.includes('prudamment'), `Ne doit pas contenir 'prudamment' : ${output}`);
    });

    it('corrige "evident" / "évident" en "évidant" (et non "evidamment")', () => {
        const input = "C'est évident.";
        const output = speechUtils.preparerTexteSynthese(input);
        assert.ok(output.includes('évidant'), `Attendu 'évidant', reçu : ${output}`);
        assert.ok(!output.includes('evidamment'), `Ne doit pas contenir 'evidamment' : ${output}`);
    });

    it('corrige "patient" en "passiant" (et non "patiamment")', () => {
        const input = "Le médecin est très patient.";
        const output = speechUtils.preparerTexteSynthese(input);
        assert.ok(output.includes('passiant'), `Attendu 'passiant', reçu : ${output}`);
        assert.ok(!output.includes('patiamment'), `Ne doit pas contenir 'patiamment' : ${output}`);
    });

    it('corrige "bus" en "busse"', () => {
        const input = "Nous prenons le bus.";
        const output = speechUtils.preparerTexteSynthese(input);
        assert.ok(output.includes('busse'), `Attendu 'busse', reçu : ${output}`);
    });

    it('préserve les majuscules initiales des mots corrigés', () => {
        const input = "Prudent et Patient.";
        const output = speechUtils.preparerTexteSynthese(input);
        assert.ok(output.includes('Prudant'), `Attendu 'Prudant', reçu : ${output}`);
        assert.ok(output.includes('Passiant'), `Attendu 'Passiant', reçu : ${output}`);
    });
});
