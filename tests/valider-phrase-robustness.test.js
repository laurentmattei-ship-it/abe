import { describe, it } from 'node:test';
import assert from 'node:assert';

globalThis.window = globalThis;

const files = [
    'src/analyseur/categories/coherence.js',
    'src/analyseur/categories/lexique.js',
    'src/analyseur/categories/determinant-chaque.js',
    'src/analyseur/categories/pluriels-x.js',
    'src/analyseur/categories/structure.js',
    'src/analyseur/categories/accords.js',
    'src/analyseur/categories/verbes.js',
    'src/homophones/rules-pass-1.js',
    'src/homophones/rules-pass-2.js',
    'src/homophones/rules-pass-3.js',
    'src/homophones/rules-pass-4.js',
    'src/homophones/rules-pass-5.js',
    'src/analyseur/categories/homophones.js',
    'src/analyseur/categories/pedagogie.js',
    'src/analyseur/categories/oral-accent.js',
    'src/analyseur/categories/oral-homophones.js',
    'src/analyseur/categories/oral-conjugaison.js',
    'src/analyseur/categories/oral-lettres.js',
    'src/analyseur/categories/oral-leur-leurs.js',
    'src/analyseur/categories/oral-nature.js',
    'src/analyseur/categories/oral-regles.js',
    'src/analyseur/categories/oral-jeu-invariable.js',
    'src/analyseur/categories/oral-definitions.js',
    'src/analyseur/normalization-utils.js',
    'src/analyseur/context-utils.js',
    'src/analyseur/lexical-corrections.js',
    'src/analyseur/analyseur-core-methods-part-1.js',
    'src/analyseur/analyseur-core-methods-part-2.js',
    'src/analyseur/analyseur-core-methods-part-3.js',
    'src/analyseur/analyseur-core-methods-part-4.js',
    'analyseur.js',
    'src/main/oral-alignment.js',
    'src/main/oral-reference-filter.js',
    'src/main/oral-pedagogy.js',
    'src/main/oral-guided-content.js',
    'src/main/interaction-guidance.js',
    'src/main/app-state.js',
    'src/main/tiles-renderer.js',
    'src/main/correction-workflow.js',
    'src/main/ui-modals.js',
    'src/main/feedback-reset.js',
    'main.js'
];

for (const file of files) {
    await import(`file:///c:/xampp/htdocs/abe/${file}`);
}

describe('Validation Phrase Robustness & Anti-Freeze', () => {
    it('gère enCoursDAnalyse et déverrouille l’interface en cas d’erreur', async () => {
        const appState = globalThis.AbeMainAppState;
        assert.ok(appState, 'AbeMainAppState doit exister');

        let modalMasquee = false;
        let errorDisplayed = null;

        const dummyApp = {
            ...appState,
            enCoursDAnalyse: false,
            dictionnaireCharge: true,
            validateBtn: { disabled: false },
            sentenceInput: { value: 'Les chats mangent.', disabled: false },
            erreursCorrigees: new Set(),
            essaisGuidesParErreur: new Map(),
            essaisDirectsParErreur: new Map(),
            inputSection: { classList: { add() {} } },
            tilesSection: { classList: { remove() {} } },
            obtenirPhraseReferenceOrale() { return ''; },
            reconnaitrePhraseOrale() { return { reconnue: true, exacte: true }; },
            montrerModalAnalyse() {},
            mettreAJourModalAnalyse() {},
            masquerModalAnalyse() { modalMasquee = true; },
            attendreRendu() { return Promise.resolve(); },
            attendre() { return Promise.resolve(); },
            afficherMessage(msg, type) { if (type === 'error') errorDisplayed = msg; },
            ajouterErreursTrouveesSession() {},
            afficherTuiles() {},
            mettreAJourProgression() {},
            appliquerFiltreReferenceOrale(p, res) { return res; },
            analyseur: {
                analyserPhraseProgressive() {
                    throw new Error('Simulated internal analyzer crash');
                }
            }
        };

        await globalThis.AbeApplication.prototype.validerPhrase.call(dummyApp);

        assert.strictEqual(dummyApp.enCoursDAnalyse, false, 'enCoursDAnalyse doit revenir à false');
        assert.strictEqual(dummyApp.validateBtn.disabled, false, 'le bouton valider doit être réactivé');
        assert.strictEqual(dummyApp.sentenceInput.disabled, false, 'le champ de saisie doit être réactivé');
        assert.strictEqual(modalMasquee, true, 'la modale doit être masquée dans la clause finally');
        assert.ok(errorDisplayed, 'Un message d’erreur doit être affiché au lieu d’un freeze');
    });

    it('enrichirExplicationAccord gère correctement la dépendance inverse déterminant-nom sans ReferenceError', () => {
        const oralPedagogy = globalThis.AbeMainOralPedagogy;
        assert.ok(oralPedagogy, 'AbeMainOralPedagogy doit exister');

        const entreeCorpus = {
            phraseOriginale: 'Les chats mangent.',
            tokensLexicaux: [
                { id: 1, texte: 'Les', nature: 'déterminant', genre: 'm', nombre: 'p', dependance: { type: 'det', cible: 2 } },
                { id: 2, texte: 'chats', nature: 'nom', genre: 'm', nombre: 'p', dependance: { type: 'nsubj', cible: 3 } },
                { id: 3, texte: 'mangent', nature: 'verbe', dependance: { type: 'root', cible: 0 } }
            ],
            tokensParId: new Map([
                [1, { id: 1, texte: 'Les', nature: 'déterminant', genre: 'm', nombre: 'p', dependance: { type: 'det', cible: 2 } }],
                [2, { id: 2, texte: 'chats', nature: 'nom', genre: 'm', nombre: 'p', dependance: { type: 'nsubj', cible: 3 } }],
                [3, { id: 3, texte: 'mangent', nature: 'verbe', dependance: { type: 'root', cible: 0 } }]
            ])
        };

        const dummyApp = {
            ...oralPedagogy,
            motsAnalyse: [{ texte: 'Les' }, { texte: 'chat' }, { texte: 'mangent' }],
            obtenirEntreeCorpusDetailleReference() { return entreeCorpus; }
        };

        // On teste le token 2 (le nom 'chat' saisi au lieu de 'chats')
        const tokenDetail = entreeCorpus.tokensLexicaux[1];
        const res = oralPedagogy.enrichirExplicationAccord.call(dummyApp, 'chat', 'chats', 1, entreeCorpus.tokensLexicaux, tokenDetail);

        assert.ok(res, 'Une explication d’accord doit être renvoyée');
        assert.strictEqual(res.parcoursType, 'accord_determinant_nom');
        assert.strictEqual(res.contexteAccord.nom.texte, 'chat');
        assert.strictEqual(res.contexteAccord.determinant.texte, 'Les');
    });
});
