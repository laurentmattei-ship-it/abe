import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

describe('Punctuation & Capitals - Détection et Double Faute', () => {
    it('détecte systématiquement l\'absence de point final', () => {
        // Load oral pedagogy module
        const oralPedagogy = require('../src/main/oral-pedagogy.js');
        const api = globalThis.AbeMainOralPedagogy || oralPedagogy;

        assert.ok(api, 'AbeMainOralPedagogy doit être défini');

        const phraseReference = "Les élèves écoutent le professeur dans la classe.";
        const phraseSaisieSansPoint = "Les élèves écoutent le professeur dans la classe";

        const resultatAnalyse = {
            mots: [{ texte: 'Les' }, { texte: 'élèves' }, { texte: 'écoutent' }],
            erreurs: [
                { type: 'reference_orale_attendue', mot: 'eleves', correction: 'élèves' }
            ]
        };

        const res = api.ajouterErreurPonctuationFinaleReference.call(
            api,
            resultatAnalyse,
            phraseSaisieSansPoint,
            phraseReference
        );

        const aErreurPonct = res.erreurs.some(e => e.type === 'ponctuation_finale' && e.correction === '.');
        assert.ok(aErreurPonct, 'Une erreur de type ponctuation_finale doit être ajoutée même s\'il y a déjà d\'autres erreurs');
    });

    it('extrait correctement la ponctuation finale attendue vs saisie', () => {
        const oralPedagogy = globalThis.AbeMainOralPedagogy;
        assert.strictEqual(oralPedagogy.extrairePonctuationFinale("Bonjour."), ".");
        assert.strictEqual(oralPedagogy.extrairePonctuationFinale("Comment vas-tu ?"), "?");
        assert.strictEqual(oralPedagogy.extrairePonctuationFinale("Super !"), "!");
        assert.strictEqual(oralPedagogy.extrairePonctuationFinale("Pas de point"), "");
    });

    it('n\'affiche jamais de mémo "À retenir" pour les erreurs de ponctuation finale', () => {
        require('../src/main/oral-guided-content.js');
        const guidance = require('../src/main/interaction-guidance.js');
        const apiGuidance = globalThis.AbeMainInteractionGuidance || guidance;

        const memoPonct = apiGuidance.obtenirMemoAffichable.call(apiGuidance, {
            type: 'ponctuation_finale',
            regle: 'Toute phrase se termine par un point.',
            memo: 'Toute phrase se termine par un point.'
        });

        assert.strictEqual(memoPonct, '', 'Le mémo "À retenir" doit être vide pour la ponctuation finale');

        const memoAccord = apiGuidance.obtenirMemoAffichable.call(apiGuidance, {
            type: 'accord_sujet_verbe',
            memo: 'Le verbe s\'accorde avec son sujet.'
        });
        assert.ok(memoAccord.length > 0, 'Le mémo "À retenir" doit rester actif pour les autres types d\'erreurs');
    });

    it('marque correctement la tuile de ponctuation finale comme corrigée', () => {
        require('../src/main/app-state.js');
        require('../src/main/correction-workflow.js');
        const appState = globalThis.AbeMainAppState;
        const workflow = globalThis.AbeMainCorrectionWorkflow;

        // Mock mock DOM element
        const fakeTile = {
            classList: {
                _classes: new Set(['word-tile', 'punctuation-missing-tile', 'error']),
                contains(c) { return this._classes.has(c); },
                add(...cs) { cs.forEach(c => this._classes.add(c)); },
                remove(...cs) { cs.forEach(c => this._classes.delete(c)); }
            },
            style: {},
            dataset: { extraErrorKey: "Les élèves écoutent.|2|ponctuation_finale" },
            textContent: '',
            setAttribute(k, v) { this[k] = v; }
        };

        const fakeContainer = {
            querySelectorAll(sel) {
                if (sel === '.word-tile') return [fakeTile];
                return [];
            },
            querySelector(sel) {
                if (sel === '.punctuation-missing-tile') return fakeTile;
                return null;
            }
        };

        const ctx = {
            phraseActuelle: "Les élèves écoutent.",
            erreurActuelle: {
                type: 'ponctuation_finale',
                position: 2,
                correction: '.'
            },
            motsAnalyse: [{ texte: 'Les' }, { texte: 'élèves' }, { texte: 'écoutent' }],
            erreursCorrigees: new Set(),
            sessionCorrectionsUniques: new Set(),
            sessionTotalErreursCorrigees: 0,
            wordsContainer: fakeContainer,
            obtenirSpanErreur: appState.obtenirSpanErreur,
            obtenirCleErreur: appState.obtenirCleErreur,
            estErreurCorrigee: appState.estErreurCorrigee,
            ajouterErreurCorrigeeSession: appState.ajouterErreurCorrigeeSession,
            ecrireSessionNumber() {}
        };

        const resDebut = workflow.appliquerCorrectionErreurCourante.call(ctx, '.');
        assert.strictEqual(resDebut, 2);
        assert.ok(fakeTile.classList.contains('corrected'), 'La tuile doit avoir la classe corrected');
        assert.ok(!fakeTile.classList.contains('error'), 'La tuile ne doit plus avoir la classe error');
        assert.strictEqual(fakeTile.style.animation, 'none', 'L\'animation de clignotement doit être arrêtée');
        assert.strictEqual(fakeTile.textContent, '.', 'Le texte de la tuile doit être le point');
        assert.ok(ctx.estErreurCorrigee(ctx.erreurActuelle), 'L\'erreur doit être marquée comme corrigée');
    });
});
