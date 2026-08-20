/**
 * M?thodes extraites d'AnalyseurGrammatical (3/4).
 * Source: analyseurexemple.js
 */
(function (global) {
    const coreMethods = {};

    coreMethods.normaliserCleRegle = function (value) {
        return this.normaliserTexte(value).replace(/[’']/g, "'");
    };

    coreMethods.normaliserTexte = function (value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .toLowerCase()
            .replace(/Ã©|ã©/g, 'e')
            .replace(/Ã¨|ã¨/g, 'e')
            .replace(/Ãª|ãª/g, 'e')
            .replace(/Ã /g, 'a')
            .replace(/Ã¢|ã¢/g, 'a')
            .replace(/Ã¹|ã¹/g, 'u')
            .replace(/Ã»|ã»/g, 'u')
            .replace(/Ã´|ã´/g, 'o')
            .replace(/Ã®|ã®/g, 'i')
            .replace(/Ã¯|ã¯/g, 'i')
            .replace(/Ã§|ã§/g, 'c')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    coreMethods.versCleMojibake = function (value) {
        const texte = String(value || '');
        if (!texte) return '';
        try {
            return unescape(encodeURIComponent(texte));
        } catch (_) {
            return texte;
        }
    };

    coreMethods.reparerTexteMojibake = function (value) {
        const texte = String(value || '');
        if (!texte || !/[ÃãÂâ]/.test(texte)) return texte;
        const remplacements = [
            [/ã©|Ã©/g, 'é'],
            [/ã¨|Ã¨/g, 'è'],
            [/ãª|Ãª/g, 'ê'],
            [/ã«|Ã«/g, 'ë'],
            [/ã /g, 'à'],
            [/ã¢|Ã¢/g, 'â'],
            [/ã®|Ã®/g, 'î'],
            [/ã¯|Ã¯/g, 'ï'],
            [/ã´|Ã´/g, 'ô'],
            [/ã¹|Ã¹/g, 'ù'],
            [/ã»|Ã»/g, 'û'],
            [/ã¼|Ã¼/g, 'ü'],
            [/ã§|Ã§/g, 'ç'],
            [/å“/g, 'œ'],
            [/ã¦|Ã¦/g, 'æ']
        ];
        const corrigeManuel = remplacements.reduce((acc, [pattern, remplacement]) => acc.replace(pattern, remplacement), texte);
        if (!/[ÃãÂâ]/.test(corrigeManuel)) {
            return corrigeManuel;
        }
        try {
            const repare = decodeURIComponent(escape(texte));
            return repare && !repare.includes('�') ? repare : texte;
        } catch (_) {
            return corrigeManuel;
        }
    };

    coreMethods.motsEgauxSansCasse = function (motA, motB) {
        return String(motA || '').toLowerCase().trim() === String(motB || '').toLowerCase().trim();
    };

    coreMethods.normaliserType = function (value) {
        const t = this.normaliserTexte(value);
        if (t.includes('determinant') || t.includes('terminant') || t === 'det' || t === 'art') return 'déterminant';
        if (t.includes('pronom') || t === 'pro') return 'pronom';
        if (t.includes('adverb') || t === 'adv') return 'adverbe';
        if (t.includes('adject')) return 'adjectif';
        if (t === 'nc' || t === 'np' || t.includes('nom')) return 'nom';
        if (t.includes('ver') || t === 'aux') return 'verbe';
        if (t.includes('preposition') || t === 'pre') return 'préposition';
        if (t.includes('conjonction') || t === 'con') return 'conjonction';
        if (t.includes('interjection') || t === 'int') return 'interjection';
        return value;
    };

    coreMethods.normaliserNombre = function (value) {
        const n = this.normaliserTexte(value);
        if (n.startsWith('sing')) return 'singulier';
        if (n.startsWith('plur')) return 'pluriel';
        return null;
    };

    coreMethods.normaliserGenre = function (value) {
        const g = this.normaliserTexte(value);
        if (g.startsWith('masc')) return 'masculin';
        if (g.startsWith('fem')) return 'féminin';
        if (g.startsWith('mix')) return 'mixte';
        return null;
    };

    coreMethods.normaliserEntree = function (entree) {
        if (!entree) return null;

        const type = this.normaliserType(entree.type);
        const nombre = this.normaliserNombre(entree.nombre);
        const genre = this.normaliserGenre(entree.genre);

        return {
            ...entree,
            type,
            nombre: nombre || entree.nombre || null,
            genre: genre || entree.genre || null
        };
    };

    coreMethods.normaliserMotSimple = function (value) {
        return this.normaliserTexte(value)
            .replace(/[’']/g, '')
            .replace(/[^a-zàâçéèêëîïôûùüÿñæœ]/g, '');
    };

    coreMethods.indexerMotPourCorrection = function (mot) {
        if (!mot) return;
        const simple = this.normaliserMotSimple(mot);
        const phonetique = this.simplifierPhonetique(simple);
        const signatures = new Set([
            `${simple.charAt(0)}|${simple.length}`,
            `${phonetique.charAt(0)}|${simple.length}`,
            `${simple.slice(0, 2)}|${simple.length}`,
            `${phonetique.slice(0, 2)}|${simple.length}`
        ]);

        signatures.forEach((signature) => {
            if (!signature || signature === '|0') return;
            if (!this.indexCandidatsCorrection.has(signature)) {
                this.indexCandidatsCorrection.set(signature, []);
            }
            this.indexCandidatsCorrection.get(signature).push(mot);
        });
    };

    coreMethods.obtenirCandidatsCorrection = function (mot) {
        const simple = this.normaliserMotSimple(mot);
        if (!simple) return [];
        const phonetique = this.simplifierPhonetique(simple);
        const signatures = new Set();

        for (let delta = -2; delta <= 2; delta++) {
            const longueur = Math.max(1, simple.length + delta);
            signatures.add(`${simple.charAt(0)}|${longueur}`);
            signatures.add(`${phonetique.charAt(0)}|${longueur}`);
            signatures.add(`${simple.slice(0, 2)}|${longueur}`);
            signatures.add(`${phonetique.slice(0, 2)}|${longueur}`);
        }

        const candidats = new Set();
        signatures.forEach((signature) => {
            const bucket = this.indexCandidatsCorrection.get(signature) || [];
            bucket.forEach((motCle) => candidats.add(motCle));
        });

        if (candidats.size === 0) {
            // Ne pas retomber sur tout le dictionnaire: cela provoque des gels UI
            // dans les vérifications contextuelles quand aucun bucket n'est trouvé.
            return [];
        }

        // Garde-fou: limiter la taille pour maintenir une latence stable en front.
        const LIMITE_CANDIDATS = 300;
        return [...candidats].slice(0, LIMITE_CANDIDATS);
    };

    coreMethods.trouverNomProbableApresDeterminant = function (motTexte, donneesDeterminant) {
        const mot = (motTexte || '').toLowerCase().trim();
        if (!mot) return null;

        const nombreDet = donneesDeterminant ? this.normaliserNombre(donneesDeterminant.nombre) : null;
        const candidats = [];

        if (nombreDet === 'singulier') {
            // Candidats fréquents pour revenir au singulier
            candidats.push(mot);
            if (mot.endsWith('e') && mot.length > 2) candidats.push(mot.slice(0, -1));
            if (mot.endsWith('aux')) candidats.push(`${mot.slice(0, -3)}al`);
            if (mot.endsWith('s') && mot.length > 2) candidats.push(mot.slice(0, -1));
            if (mot.endsWith('x') && mot.length > 2) {
                candidats.push(mot.slice(0, -1));
                if (mot.endsWith('eaux')) candidats.push(`${mot.slice(0, -1)}`);
            }
        } else {
            // Candidats fréquents pour un nom au pluriel
            candidats.push(mot);
            candidats.push(`${mot}s`);
            if (mot.endsWith('s') && mot.length > 2) candidats.push(mot.slice(0, -1));
            if (mot.endsWith('x') && mot.length > 2) candidats.push(mot.slice(0, -1));
            if (mot.endsWith('e') && mot.length > 2) candidats.push(`${mot.slice(0, -1)}s`);
            if (!mot.endsWith('x')) candidats.push(`${mot}x`);
            if (mot.endsWith('al')) candidats.push(`${mot.slice(0, -2)}aux`);
            if (mot.endsWith('au') || mot.endsWith('eau') || mot.endsWith('eu')) candidats.push(`${mot}x`);
            if (mot.endsWith('ou')) {
                const ouEnX = new Set(['bijou', 'caillou', 'chou', 'genou', 'hibou', 'joujou', 'pou']);
                if (ouEnX.has(mot)) candidats.push(`${mot}x`);
            }
        }

        const candidatsUniques = [...new Set(candidats)];

        for (const c of candidatsUniques) {
            const d = this.getWordData(c);
            if (!d || !this.estType(d, 'nom')) continue;
            const nombreNom = this.normaliserNombre(d.nombre);
            if (!nombreDet || !nombreNom || nombreNom === nombreDet) {
                return c;
            }
            if (nombreDet === 'pluriel' && nombreNom === 'singulier') {
                if (/[sx]$/.test(mot)) return mot;
                if (c.endsWith('ou') && this.motsOuPlurielX.has(c)) return `${c}x`;
                if (c.endsWith('al') && c.length > 2) return `${c.slice(0, -2)}aux`;
                if (c.endsWith('au') || c.endsWith('eau') || c.endsWith('eu')) return `${c}x`;
                return `${c}s`;
            }
        }

        // Fallback morphologique: certains pluriels ne sont pas toujours présents
        // explicitement dans le dictionnaire (ex: film -> films, hibou -> hiboux).
        if (nombreDet === 'pluriel') {
            if (mot.endsWith('ou') && this.motsOuPlurielX.has(mot)) {
                return `${mot}x`;
            }

            const base = mot.endsWith('e') && mot.length > 2 ? mot.slice(0, -1) : mot;
            const donneesBase = this.getWordData(base);
            if (donneesBase && this.estType(donneesBase, 'nom')) {
                return `${base}s`;
            }

            // Dernier recours: on propose une forme plurielle plausible même sans entrée lexicale.
            if (mot.endsWith('al') && mot.length > 2) {
                return `${mot.slice(0, -2)}aux`;
            }
            if (mot.endsWith('au') || mot.endsWith('eau') || mot.endsWith('eu')) {
                return `${mot}x`;
            }
            return `${mot}s`;
        }

        return null;
    };

    coreMethods.verifierPlurielEnX = function (motSaisi, motAttendu) {
        const saisiOriginal = String(motSaisi || '').trim();
        const attenduOriginal = String(motAttendu || '').trim();
        if (!saisiOriginal || !attenduOriginal) return null;

        const saisi = this.normaliserTexte(saisiOriginal);
        const attendu = this.normaliserTexte(attenduOriginal);
        if (!saisi || !attendu || saisi === attendu) return null;

        if (attendu.endsWith('x')) {
            const baseOu = attendu.slice(0, -1);
            if (baseOu.endsWith('ou') && this.motsOuPlurielX.has(baseOu) && saisi === `${baseOu}s`) {
                return {
                    type: 'orthographe_usage_pluriel_ou',
                    correction: attenduOriginal,
                    explication: `Le mot "${baseOu}" fait partie des 7 mots en -ou qui prennent -x au pluriel.`,
                    regle: 'Exception des 7 mots en -ou : bijoux, cailloux, choux, genoux, hiboux, joujoux, poux.',
                    scenario: 'exception_7_ou'
                };
            }

            const baseAl = `${attendu.slice(0, -1)}l`;
            if (attendu.endsWith('aux') && baseAl.endsWith('al') && saisi === `${baseAl}s` && !this.exceptionsAlPlurielS.has(baseAl)) {
                return {
                    type: 'orthographe_usage_pluriel_al',
                    correction: attenduOriginal,
                    explication: 'Est-ce que ce mot fait partie des exceptions qui gardent le s ou se transforme-t-il au pluriel ?',
                    regle: 'La plupart des noms en -al font leur pluriel en -aux (cheval -> chevaux, journal -> journaux).',
                    scenario: 'al_vers_aux'
                };
            }

            const baseAil = `${attendu.slice(0, -3)}ail`;
            if (attendu.endsWith('aux') && baseAil.endsWith('ail') && saisi === `${baseAil}s`) {
                return {
                    type: 'orthographe_usage_pluriel_ail',
                    correction: attenduOriginal,
                    explication: 'Est-ce que ce mot fait partie des exceptions qui gardent le s ou se transforme-t-il au pluriel ?',
                    regle: 'Quelques noms en -ail prennent -aux: bail, corail, émail, soupirail, travail, vantail, vitrail.',
                    scenario: 'ail_vers_aux'
                };
            }

            const baseX = attendu.slice(0, -1);
            const termineAuEauEu = /(au|eau|eu)$/.test(baseX);
            if (termineAuEauEu && !this.exceptionsAuEauEuPlurielS.has(baseX) && saisi === `${baseX}s`) {
                return {
                    type: 'orthographe_usage_pluriel_au_eau_eu',
                    correction: attenduOriginal,
                    explication: `Le nom "${baseX}" prend -x au pluriel.`,
                    regle: 'Les noms en -au, -eau et -eu prennent généralement -x au pluriel.',
                    scenario: 'au_eau_eu_vers_x'
                };
            }
        }

        if (attendu.endsWith('s')) {
            const baseS = attendu.slice(0, -1);
            if (this.exceptionsAuEauEuPlurielS.has(baseS) && saisi === `${baseS}x`) {
                return {
                    type: 'orthographe_usage_exception_pluriel_s',
                    correction: attenduOriginal,
                    explication: `"${baseS}" est une exception: ce mot prend -s au pluriel.`,
                    regle: 'Exceptions qui prennent -s: bleus, pneus, landaus, sarraus.',
                    scenario: 'exception_s_au_eau_eu'
                };
            }
            if (this.exceptionsAlPlurielS.has(baseS) && saisi === `${baseS.slice(0, -2)}aux`) {
                return {
                    type: 'orthographe_usage_exception_pluriel_s',
                    correction: attenduOriginal,
                    explication: `"${baseS}" est une exception: ce mot garde le pluriel en -s.`,
                    regle: 'Exceptions en -al qui prennent -s: bals, carnavals, chacals, festivals, récitals, régals.',
                    scenario: 'exception_s_al'
                };
            }
        }

        return null;
    };

    coreMethods.trouverCorrectionContextuelleMotInconnu = function (indexMot) {
        const mot = this.phraseAnalysee[indexMot];
        if (!mot) return null;

        const motSimple = this.normaliserMotSimple(mot.texte);
        const motSuivant = this.phraseAnalysee[indexMot + 1];
        const motPrecedent = indexMot > 0 ? this.phraseAnalysee[indexMot - 1] : null;
        const textePrecedent = this.normaliserTexte(this.obtenirTexteCorrigeToken(motPrecedent));
        const sujetAvant = this.trouverSujetAvantIndex(indexMot);
        const sujetTexte = this.normaliserTexte(sujetAvant && sujetAvant.texte ? sujetAvant.texte : '').replace(/[’']/g, '');

        // Cas fréquent phonétique: "lé" pour "les" devant un nom pluriel
        if (motSimple === 'le' && motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'nom')) {
            const nombreNom = this.normaliserNombre(motSuivant.donnees.nombre);
            if (nombreNom === 'pluriel') {
                return 'les';
            }
        }

        const correctionsDirectes = {
            fortte: 'forte',
            fesons: 'faisons',
            faisont: 'faisons',
            cinema: 'cinéma',
            gateau: 'gâteau',
            ide: 'idée'
        };
        if (correctionsDirectes[motSimple]) {
            return correctionsDirectes[motSimple];
        }

        // Locution fréquente: "faire peur". Ici, on attend le nom "peur", pas le verbe "peut".
        if (motSimple === 'peurt' && ['fait', 'fais', 'faisait', 'fera', 'font'].includes(textePrecedent)) {
            return 'peur';
        }

        if (motSimple === 'somme' && sujetTexte === 'nous') return 'sommes';
        if (motSimple === 'avon' && sujetTexte === 'nous') return 'avons';
        if (motSimple === 'pleu' && sujetTexte === 'il') return 'pleut';
        if (motSimple === 'prisent' && this.estAuxiliaireTempsTexte(textePrecedent)) return 'pris';
        if (motSimple === 'prit' && this.estAuxiliaireTempsTexte(textePrecedent)) return 'pris';
        if (motSimple === 'achetter') {
            return this.estAuxiliaireTempsTexte(textePrecedent) ? 'acheté' : 'acheter';
        }
        if (motSimple === 'oublier' && this.estAuxiliaireTempsTexte(textePrecedent)) {
            return 'oublié';
        }
        if (motSimple === 'aller' && this.estAuxiliaireTempsTexte(textePrecedent)) {
            return 'allé';
        }
        if (motSimple === 'fatiguer' && this.estAuxiliaireTempsTexte(textePrecedent)) {
            return 'fatigué';
        }
        if (motSimple === 'vois' && motPrecedent && this.estDeterminantNominalToken(motPrecedent)) {
            return 'voix';
        }
        if (motSimple === 'soeur' && this.estDeterminantOuNombrePlurielToken(motPrecedent)) {
            return 'sœurs';
        }

        const correctionSansDouble = this.trouverCorrectionSansDoubleLettre(mot.texte);
        if (correctionSansDouble) {
            return correctionSansDouble;
        }

        return null;
    };

    coreMethods.trouverCorrectionSansDoubleLettre = function (mot) {
        const texte = this.normaliserMotSimple(mot);
        if (!texte || texte.length < 4) return null;

        for (let i = 1; i < texte.length; i++) {
            if (texte[i] !== texte[i - 1]) continue;
            const candidat = `${texte.slice(0, i)}${texte.slice(i + 1)}`;
            const donnees = this.getWordData(candidat);
            if (donnees) {
                return candidat;
            }
        }

        return null;
    };

    coreMethods.trouverCorrectionAccentueeContextuelle = function (indexMot) {
        const mot = this.phraseAnalysee[indexMot];
        if (!mot || !mot.texte) return null;

        const source = String(mot.texte || '').toLowerCase().trim();
        const simple = this.normaliserMotSimple(source);
        if (!simple || simple.length < 3) return null;

        const candidatsDirects = this.clefsDictionnaire
            .filter((cle) => cle !== source && this.normaliserMotSimple(cle) === simple);

        if (candidatsDirects.length > 0) {
            candidatsDirects.sort((a, b) => Math.abs(a.length - source.length) - Math.abs(b.length - source.length) || a.localeCompare(b));
            return this.reparerTexteMojibake(candidatsDirects[0]);
        }

        // Heuristique adjectif feminin/pluriel : interessante -> intéressante.
        const fabriquerDepuisBase = (suffixeSource, suffixeCible) => {
            if (!simple.endsWith(suffixeSource)) return null;
            const base = simple.slice(0, -suffixeSource.length);
            const candidatBase = this.clefsDictionnaire.find((cle) => {
                const donnees = this.getWordData(cle);
                return this.normaliserMotSimple(cle) === base && donnees && this.estType(donnees, 'adjectif');
            });
            if (!candidatBase) return null;
            return `${this.reparerTexteMojibake(candidatBase)}${suffixeCible}`;
        };

        return fabriquerDepuisBase('e', 'e')
            || fabriquerDepuisBase('es', 'es')
            || null;
    };

    coreMethods.estMotAttesteParCorpusBescherelle = function (mot) {
        if (!this.corpusBescherelleActif) return false;
        const cle = this.normaliserMotSimple(mot || '');
        if (!cle || cle.length < 5) return false;
        if (!/^[a-zàâçéèêëîïôûùüÿñæœ]+$/i.test(cle)) return false;

        return this.obtenirFrequenceCorpus(this.frequencesUnigrammesBescherelle, cle) >= 4;
    };

    coreMethods.estType = function (donnees, typeAttendu) {
        return !!donnees && this.normaliserType(donnees.type) === typeAttendu;
    };

    coreMethods.estDeterminantNominalToken = function (mot) {
        if (!mot || !mot.donnees || !this.estType(mot.donnees, 'déterminant')) return false;
        const texte = (mot.texte || '').toLowerCase().trim();
        // Exclure les déterminants élidés/clitiques (l', d') qui ne pilotent pas ce type d'accord nominal.
        if (texte.endsWith("'")) return false;
        return true;
    };

    coreMethods.estFormeAuxiliaireConnue = function (texte) {
        const t = (texte || '').toLowerCase();
        return [
            'ai','as','a','avons','avez','ont',
            'avais','avait','avions','aviez','avaient',
            'aurai','auras','aura','aurons','aurez','auront',
            'suis','es','est','sommes','êtes','sont',
            'étais','était','étions','étiez','étaient',
            'fus','fut','fûmes','fûtes','furent'
        ].includes(t);
    };

    coreMethods.getWordData = function (mot) {
        if (!this.dictionnaire || !this.dictionnaire.mots) {
            return null;
        }

        const motNettoye = mot.toLowerCase().trim();

        const clesPossibles = [motNettoye];
        const cleMojibake = this.versCleMojibake(motNettoye);
        if (cleMojibake && cleMojibake !== motNettoye) {
            clesPossibles.push(cleMojibake);
        }

        for (const cle of clesPossibles) {
            const entreeDirecte = this.dictionnaire.mots[cle];
            if (entreeDirecte) {
                const brute = Array.isArray(entreeDirecte) ? entreeDirecte[0] : entreeDirecte;
                return this.normaliserEntree(brute);
            }
        }

        for (const cle of clesPossibles) {
            const entreeVariation = this.indexVariations.get(cle);
            if (entreeVariation) {
                return this.normaliserEntree(entreeVariation);
            }
        }

        return null;
    };

    coreMethods.getWordDataOfType = function (mot, type) {
        if (!this.dictionnaire || !this.dictionnaire.mots) return null;
        const motNettoye = mot.toLowerCase().trim();
        const entrees = this.dictionnaire.mots[motNettoye];
        if (!entrees) return null;
        const liste = Array.isArray(entrees) ? entrees : [entrees];
        const entry = liste.find(e => e && e.type === type);
        return entry ? this.normaliserEntree(entry) : null;
    };

    coreMethods.extraireVariationsVerbe = function (mot) {
        if (!mot || !this.dictionnaire || !this.dictionnaire.mots) return null;
        const entrees = this.dictionnaire.mots[mot.toLowerCase().trim()];
        if (!entrees) return null;
        const liste = Array.isArray(entrees) ? entrees : [entrees];
        const entreeComplete = liste.find(e => e && Array.isArray(e.variations) && e.variations.length >= 6);
        return entreeComplete ? entreeComplete.variations : null;
    };

    coreMethods.estInfinitif = function (donnees) {
        if (!donnees) return false;
        return Array.isArray(donnees.conjugaisons) && donnees.conjugaisons.length > 0;
    };

    coreMethods.estFormeInfinitive = function (texte, donnees = null) {
        const mot = (texte || '').toLowerCase().trim();
        if (!mot) return false;

        // Priorité à l'entrée directe du mot écrit (sans passer par l'index des variations).
        if (this.dictionnaire && this.dictionnaire.mots) {
            const cles = [mot];
            const cleMojibake = this.versCleMojibake(mot);
            if (cleMojibake && cleMojibake !== mot) {
                cles.push(cleMojibake);
            }

            for (const cle of cles) {
                const entreeDirecte = this.dictionnaire.mots[cle];
                if (!entreeDirecte) continue;
                const liste = Array.isArray(entreeDirecte) ? entreeDirecte : [entreeDirecte];
                const estInfinitifVerbal = liste.some((e) => {
                    if (!e) return false;
                    const type = this.normaliserType(e.type);
                    if (type !== 'verbe') return false;
                    return Array.isArray(e.conjugaisons) && e.conjugaisons.length > 0;
                });
                if (estInfinitifVerbal) return true;
            }
        }

        // Si le mot vient d'une variation verbale, on s'appuie sur sa forme graphique.
        if (donnees && this.estType(donnees, 'verbe')) {
            return /(er|ir|re|oir)$/.test(mot);
        }

        return false;
    };

    coreMethods.trouverInfinitifDepuisParticipe = function (motPP) {
        const mot = motPP.toLowerCase().trim();
        const formes = new Set([mot]);
        if (mot.endsWith('es')) formes.add(mot.slice(0, -2));
        if (mot.endsWith('s')) formes.add(mot.slice(0, -1));
        if (mot.endsWith('e')) formes.add(mot.slice(0, -1));

        // Cas spéciaux irréguliers
        const irreg = { 'dit': 'dire', 'fait': 'faire', 'mis': 'mettre', 'pris': 'prendre',
            'écrit': 'écrire', 'ouvert': 'ouvrir', 'offert': 'offrir', 'souffert': 'souffrir',
            'mort': 'mourir', 'né': 'naître', 'été': 'être', 'eu': 'avoir', 'pu': 'pouvoir',
            'su': 'savoir', 'vu': 'voir', 'bu': 'boire', 'lu': 'lire', 'cru': 'croire',
            'dû': 'devoir', 'voulu': 'vouloir', 'venu': 'venir', 'tenu': 'tenir',
            'couru': 'courir', 'vécu': 'vivre', 'reçu': 'recevoir' };
        for (const forme of formes) {
            if (irreg[forme]) return irreg[forme];
        }

        for (const forme of formes) {
            // -é → -er (1er groupe)
            if (forme.endsWith('é')) {
                const base = forme.slice(0, -1);
                for (const suf of ['er', 'ier']) {
                    const c = base + suf;
                    const d = this.getWordData(c);
                    if (d && this.estType(d, 'verbe') && this.estInfinitif(d)) return c;
                }
            }

            // -i → -ir (2e groupe)
            if (forme.endsWith('i') && !forme.endsWith('ui')) {
                const base = forme.slice(0, -1);
                for (const suf of ['ir', 'ire']) {
                    const c = base + suf;
                    const d = this.getWordData(c);
                    if (d && this.estType(d, 'verbe') && this.estInfinitif(d)) return c;
                }
            }

            // -u → -re, -oir (3e groupe)
            if (forme.endsWith('u') && !forme.endsWith('eu')) {
                const base = forme.slice(0, -1);
                for (const suf of ['re', 'oir', 'vre']) {
                    const c = base + suf;
                    const d = this.getWordData(c);
                    if (d && this.estType(d, 'verbe') && this.estInfinitif(d)) return c;
                }
            }
        }
        return null;
    };

    coreMethods.trouverInfinitifDepuisFormeConjuguee = function (motConjugue) {
        const mot = (motConjugue || '').toLowerCase().trim();
        if (!mot) return null;

        const candidats = new Set();
        if (mot.endsWith('ez') && mot.length > 2) candidats.add(`${mot.slice(0, -1)}r`);
        if (mot.endsWith('ons') && mot.length > 3) candidats.add(`${mot.slice(0, -3)}er`);
        if (mot.endsWith('ent') && mot.length > 3) candidats.add(`${mot.slice(0, -3)}er`);
        if (mot.endsWith('e') && mot.length > 1) candidats.add(`${mot}r`);
        if (mot.endsWith('es') && mot.length > 2) candidats.add(`${mot.slice(0, -1)}r`);

        for (const candidat of candidats) {
            const donnees = this.getWordData(candidat);
            if (donnees && this.estType(donnees, 'verbe') && this.estInfinitif(donnees)) {
                return candidat;
            }
        }

        return null;
    };

    coreMethods.estParticipePasseProbable = function (texte) {
        return !!this.trouverInfinitifDepuisParticipe(texte || '');
    };

    coreMethods.trouverParticipePasse = function (infinitif) {
        const mot = infinitif.toLowerCase().trim();
        const irreg = { 'être': 'été', 'avoir': 'eu', 'faire': 'fait', 'dire': 'dit',
            'prendre': 'pris', 'mettre': 'mis', 'écrire': 'écrit', 'lire': 'lu',
            'voir': 'vu', 'boire': 'bu', 'croire': 'cru', 'savoir': 'su', 'vouloir': 'voulu',
            'pouvoir': 'pu', 'devoir': 'dû', 'recevoir': 'reçu', 'mourir': 'mort',
            'naître': 'né', 'vivre': 'vécu', 'courir': 'couru', 'venir': 'venu',
            'tenir': 'tenu', 'ouvrir': 'ouvert', 'offrir': 'offert', 'souffrir': 'souffert' };
        if (irreg[mot]) return irreg[mot];
        // -er → -é (1er groupe)
        if (mot.endsWith('er')) return mot.slice(0, -2) + 'é';
        // -ir → -i (2e groupe: finir → fini)
        if (mot.endsWith('ir') && !mot.endsWith('oir')) return mot.slice(0, -1);
        return null;
    };

    coreMethods.verifierApostrophesObligatoires = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierApostrophesObligatoires !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierApostrophesObligatoires');
        }

        return categories.verifierApostrophesObligatoires.call(this);
    };

    coreMethods.verifierAccentsLexicauxFrequents = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierAccentsLexicauxFrequents !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierAccentsLexicauxFrequents');
        }

        return categories.verifierAccentsLexicauxFrequents.call(this);
    };

    coreMethods.verifierMajusculeEtPonctuationFinale = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierMajusculeEtPonctuationFinale !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierMajusculeEtPonctuationFinale');
        }

        return categories.verifierMajusculeEtPonctuationFinale.call(this);
    };

    coreMethods.verifierNegationsIncompletes = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierNegationsIncompletes !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierNegationsIncompletes');
        }

        return categories.verifierNegationsIncompletes.call(this);
    };

    coreMethods.verifierTraitUnionInversion = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierTraitUnionInversion !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierTraitUnionInversion');
        }

        return categories.verifierTraitUnionInversion.call(this);
    };

    coreMethods.epurerErreursPonctuationFinaleSecondaires = function () {
        const typesRappel = new Set(['ponctuation_finale']);

        for (const mot of this.phraseAnalysee) {
            if (!mot || !Array.isArray(mot.erreurs) || mot.erreurs.length <= 1) continue;

            const aErreurSpecifique = mot.erreurs.some((erreur) => erreur && !typesRappel.has(erreur.type));
            if (!aErreurSpecifique) continue;

            mot.erreurs = mot.erreurs.filter((erreur) => erreur && !typesRappel.has(erreur.type));
        }

        this.erreursTrouvees = this.erreursTrouvees.filter((erreur) => {
            if (!erreur || !typesRappel.has(erreur.type)) return true;

            const indexMot = typeof erreur.indexDebut === 'number' ? erreur.indexDebut : erreur.position;
            const mot = this.phraseAnalysee[indexMot];
            if (!mot || !Array.isArray(mot.erreurs)) return true;

            return mot.erreurs.includes(erreur);
        });
    };

    coreMethods.enrichirErreursAvecExplicationsEnrichies = function () {
        if (!this.explicationsEnrichies || Object.keys(this.explicationsEnrichies).length === 0) {
            return; // Pas d'explications enrichies disponibles
        }

        for (const erreur of this.erreursTrouvees) {
            if (erreur && erreur.type) {
                const explicationEnrichie = this.obtenirExplicationEnrichie(erreur.type);
                if (explicationEnrichie) {
                    erreur.explication = explicationEnrichie;
                }
            }
        }
    };

    coreMethods.detecterTypeConfusionPhonographique = function (fautif, correct) {
        if (!fautif || !correct) return null;
        const n = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const f = n(fautif);
        const c = n(correct);
        if (f === c) return null;
        if (Math.abs(f.length - c.length) > 3) return null;
        // Paires [motif_fautif, motif_correct, type] — testées dans l'ordre
        const paires = [
            ['ssion', 'tion', 'tion_ssion'], ['tion', 'ssion', 'tion_ssion'],
            ['eau', 'o', 'o_au'], ['au', 'o', 'o_au'], ['o', 'eau', 'o_au'],
            ['ph', 'f', 'f_ph'], ['f', 'ph', 'f_ph'],
            ['gu', 'g', 'g_gu'], ['g', 'gu', 'g_gu'],
            ['ain', 'in', 'ain_in'], ['in', 'ain', 'ain_in'],
            ['ss', 's', 's_ss'], ['s', 'ss', 's_ss'],
            ['ll', 'l', 'consonne_double'], ['l', 'll', 'consonne_double'],
            ['nn', 'n', 'consonne_double'], ['n', 'nn', 'consonne_double'],
            ['mm', 'm', 'consonne_double'], ['m', 'mm', 'consonne_double'],
            ['tt', 't', 'consonne_double'], ['t', 'tt', 'consonne_double'],
            ['pp', 'p', 'consonne_double'], ['p', 'pp', 'consonne_double'],
            ['rr', 'r', 'consonne_double'], ['ff', 'f', 'consonne_double'],
            ['an', 'en', 'an_en'], ['en', 'an', 'an_en'],
            ['am', 'em', 'an_en'], ['em', 'am', 'an_en'],
            ['on', 'om', 'on_om'], ['om', 'on', 'on_om'],
            ['qu', 'k', 'q_k'], ['k', 'qu', 'q_k'],
        ];
        for (const [de, vers, type] of paires) {
            if (f.includes(de) && f.replace(de, vers) === c) return type;
        }
        return null;
    };

    coreMethods.corrigerRegleMDevantBMP = function (motTexte) {
        const mot = this.normaliserTexte(motTexte || '');
        if (!mot) return null;

        const exceptions = new Set(['bonbon', 'bonbonniere', 'embonpoint']);
        if (exceptions.has(mot)) return null;

        const candidat = mot.replace(/n([bmp])/g, 'm$1');
        if (candidat === mot) return null;

        const donnees = this.getWordData(candidat);
        if (donnees) return candidat;
        return null;
    };

    coreMethods.verifierOrthographeUsageAvancee = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierOrthographeUsageAvancee !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierOrthographeUsageAvancee');
        }

        return categories.verifierOrthographeUsageAvancee.call(this);
    };

    coreMethods.verifierPlurielsEnX = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierPlurielsEnX !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierPlurielsEnX');
        }

        return categories.verifierPlurielsEnX.call(this);
    };

    coreMethods.verifierDeterminantChaqueInvariable = function () {
        const categories = (typeof window !== 'undefined' && window.AbeAnalyseurCategories)
            ? window.AbeAnalyseurCategories
            : (typeof globalThis !== 'undefined' && globalThis.AbeAnalyseurCategories)
                ? globalThis.AbeAnalyseurCategories
                : null;

        if (!categories || typeof categories.verifierDeterminantChaqueInvariable !== 'function') {
            throw new Error('Module catégorie non chargé pour verifierDeterminantChaqueInvariable');
        }

        return categories.verifierDeterminantChaqueInvariable.call(this);
    };

    global.AbeAnalyseurCoreMethods = Object.assign(
        global.AbeAnalyseurCoreMethods || {},
        coreMethods
    );
})(typeof window !== 'undefined' ? window : globalThis);