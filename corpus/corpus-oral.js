(function () {
    'use strict';

    const MIN_WORDS_PER_PHRASE = 4;

    function compterMots(phrase) {
        const texte = String(phrase || '').trim();
        if (!texte) return 0;
        const mots = texte.match(/[A-Za-zÀ-ÖØ-öø-ÿŒœ]+(?:[’'\-][A-Za-zÀ-ÖØ-öø-ÿŒœ]+)*/g);
        return Array.isArray(mots) ? mots.length : 0;
    }

    function estPhraseOraleValide(phrase) {
        return compterMots(phrase) >= MIN_WORDS_PER_PHRASE;
    }

    function randomIntSecure(maxExclusive) {
        const max = Number(maxExclusive);
        if (!Number.isInteger(max) || max <= 0) return 0;

        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const uintMax = 0xffffffff;
            const limite = uintMax - ((uintMax + 1) % max);
            const buffer = new Uint32Array(1);
            let valeur = 0;
            do {
                crypto.getRandomValues(buffer);
                valeur = buffer[0];
            } while (valeur > limite);
            return valeur % max;
        }

        return Math.floor(Math.random() * max);
    }

    function normaliserExclusions(exclusionOptionnelle) {
        if (!exclusionOptionnelle) return new Set();

        const valeurs = Array.isArray(exclusionOptionnelle)
            ? exclusionOptionnelle
            : (exclusionOptionnelle instanceof Set ? Array.from(exclusionOptionnelle) : [exclusionOptionnelle]);

        return new Set(
            valeurs
                .map((valeur) => String(valeur || '').trim().toLowerCase())
                .filter(Boolean)
        );
    }

    const STORAGE_DECK_KEY = 'abe_oral_deck_v1';

    function getStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('__abe_test__', '1');
                localStorage.removeItem('__abe_test__');
                return localStorage;
            }
        } catch {
            // fallback
        }
        return null;
    }

    let deck = [];
    let deckIndex = 0;

    function melangerDeck(source) {
        const tableau = source.slice();
        for (let i = tableau.length - 1; i > 0; i -= 1) {
            const j = randomIntSecure(i + 1);
            const tmp = tableau[i];
            tableau[i] = tableau[j];
            tableau[j] = tmp;
        }
        return tableau;
    }

    function sauvegarderDeck() {
        try {
            const storage = getStorage();
            if (!storage) return;
            storage.setItem(STORAGE_DECK_KEY, JSON.stringify({ deck, deckIndex }));
        } catch {
            // ignore
        }
    }

    function chargerDeckPersistant(source) {
        try {
            const storage = getStorage();
            if (!storage) return false;
            const brut = storage.getItem(STORAGE_DECK_KEY);
            if (!brut) return false;
            const data = JSON.parse(brut);
            if (!data || !Array.isArray(data.deck) || data.deck.length !== source.length) return false;
            deck = data.deck;
            deckIndex = Number.isInteger(data.deckIndex) && data.deckIndex >= 0 ? data.deckIndex : 0;
            return true;
        } catch {
            return false;
        }
    }

    function initialiserDeck() {
        const source = window.ABE_CORPUS_ORAL && Array.isArray(window.ABE_CORPUS_ORAL.phrases)
            ? window.ABE_CORPUS_ORAL.phrases
            : phrases;

        if (!chargerDeckPersistant(source)) {
            deck = melangerDeck(source);
            deckIndex = 0;
            sauvegarderDeck();
        }
    }

    function getNextPhraseFromDeck(exclusionOptionnelle) {
        const source = window.ABE_CORPUS_ORAL && Array.isArray(window.ABE_CORPUS_ORAL.phrases)
            ? window.ABE_CORPUS_ORAL.phrases
            : phrases;

        if (source.length === 0) return '';
        if (source.length === 1) return source[0];

        // Re-initialiser le deck si vide ou épuisé
        if (deck.length !== source.length || deckIndex >= deck.length) {
            deck = melangerDeck(source);
            deckIndex = 0;
            sauvegarderDeck();
        }

        const exclusions = normaliserExclusions(exclusionOptionnelle);

        // Avancer dans le deck en sautant les exclusions
        let tentatives = 0;
        while (tentatives < deck.length) {
            if (deckIndex >= deck.length) {
                // Deck épuisé: remélanger pour le tour suivant
                deck = melangerDeck(source);
                deckIndex = 0;
                sauvegarderDeck();
            }
            const candidate = deck[deckIndex];
            deckIndex += 1;
            sauvegarderDeck();
            if (!exclusions.has(String(candidate || '').toLowerCase())) {
                return candidate;
            }
            tentatives += 1;
        }

        // Fallback: retourner la première phrase disponible
        for (const phrase of source) {
            if (!exclusions.has(String(phrase || '').toLowerCase())) {
                return phrase;
            }
        }

        // Toutes les phrases sont exclues
        return '';
    }

    function getSecureRandomPhrase(exclusionOptionnelle) {
        return getNextPhraseFromDeck(exclusionOptionnelle);
    }

    function normaliserPhraseCanonique(phrase) {
        return String(phrase || '')
            .replace(/([ldjnmtsqcLDJNMTSQC]|qu|Qu|QU)['’]\s+/g, "$1'")
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,;:!?])/g, '$1')
            .trim()
            .toLowerCase();
    }

    function extrairePhrasesManquantes(phrasesCandidates) {
        const candidates = Array.isArray(phrasesCandidates) ? phrasesCandidates : [];
        const existantes = new Set(phrases.map((p) => normaliserPhraseCanonique(p)));
        const manquantes = [];

        candidates.forEach((phrase) => {
            const original = String(phrase || '').replace(/\s+/g, ' ').trim();
            if (!original) return;
            if (!estPhraseOraleValide(original)) return;
            const canon = normaliserPhraseCanonique(original);
            if (!canon || existantes.has(canon)) return;
            existantes.add(canon);
            manquantes.push(original);
        });

        return manquantes;
    }

    function remplacerCorpus(phrasesCandidates) {
        const prochainesPhrases = Array.isArray(phrasesCandidates)
            ? phrasesCandidates
                .map((phrase) => String(phrase || '').replace(/\s+/g, ' ').trim())
                .filter((phrase) => estPhraseOraleValide(phrase))
            : [];

        phrases.length = 0;
        phrases.push(...prochainesPhrases);
        initialiserDeck();

        return {
            ajoutees: phrases.length,
            total: phrases.length,
            phrasesAjoutees: phrases.slice()
        };
    }

    const phrases = [];
    let chargementCorpusPromise = null;

    function extrairePhrasesDepuisCorpusDetaille(data) {
        const entrees = Array.isArray(data) ? data : [];
        return entrees
            .map((entree) => String((entree && (entree.phrase_normalisee || entree.phrase_originale)) || '').trim())
            .filter(Boolean);
    }

    function estNomFichierJsonValide(nom) {
        const brut = String(nom || '').trim();
        return /^[^\\/]+\.json$/i.test(brut);
    }

    function listerFichiersCorpusJson() {
        return fetch(`corpus/index.php?v=${Date.now()}`, { cache: 'no-store' })
            .then((response) => {
                if (!response.ok) return [];
                return response.json();
            })
            .then((data) => {
                const fichiers = Array.isArray(data && data.files) ? data.files : [];
                return fichiers
                    .map((nom) => String(nom || '').trim())
                    .filter(estNomFichierJsonValide)
                    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }));
            })
            .catch(() => []);
    }

    function chargerCorpusDepuisJson() {
        if (phrases.length > 0) {
            return Promise.resolve({
                ajoutees: phrases.length,
                total: phrases.length,
                phrasesAjoutees: phrases.slice()
            });
        }

        if (chargementCorpusPromise) return chargementCorpusPromise;

        const fallbackFichiers = [
            'Corpus1.json', 'Corpus2.json'
        ];
        chargementCorpusPromise = listerFichiersCorpusJson().then((fichiersDecouverts) => {
            const fichiers = fichiersDecouverts.length > 0 ? fichiersDecouverts : fallbackFichiers;
            return Promise.all(
                fichiers.map((fichier) =>
                fetch(`corpus/${fichier}?v=${Date.now()}`, { cache: 'no-store' })
                    .then((response) => {
                        if (!response.ok) return [];
                        return response.json();
                    })
                    .then((data) => extrairePhrasesDepuisCorpusDetaille(data))
                    .catch(() => [])
                )
            );
        }).then((tousLesPhrases) => {
            const fusion = [].concat(...tousLesPhrases);
            return remplacerCorpus(fusion);
        }).catch(() => {
            chargementCorpusPromise = null;
            return {
                ajoutees: 0,
                total: phrases.length,
                phrasesAjoutees: phrases.slice()
            };
        });

        return chargementCorpusPromise;
    }

    window.ABE_CORPUS_ORAL = {
        phrases,
        minWordsPerPhrase: MIN_WORDS_PER_PHRASE,
        get count() {
            return phrases.length;
        },
        getSecureRandomPhrase,
        getMissingPhrasesFrom: extrairePhrasesManquantes,
        ensureLoaded: chargerCorpusDepuisJson,
        chargerDepuisJson: chargerCorpusDepuisJson,
        remplacerCorpus,
        mergeMissingPhrasesFrom(phrasesCandidates) {
            return remplacerCorpus(phrasesCandidates);
        }
    };

    initialiserDeck();
    chargerCorpusDepuisJson();
})();
