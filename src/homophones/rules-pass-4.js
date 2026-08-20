/**
 * Homophones - appliquerPassage4
 * G?n?r? depuis src/analyseur/categories/homophones.js
 */
(function (global) {
    function appliquerPassage4() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            const texteCourant = (mot && mot.texte ? mot.texte : '').toLowerCase();
            const erreursBloquantes = Array.isArray(mot.erreurs)
                ? mot.erreurs.filter((e) => e && !['ponctuation_finale', 'majuscule_phrase'].includes(e.type))
                : [];
            const erreursFiltrees = texteCourant === 'est'
                ? erreursBloquantes.filter((e) => e && e.type !== 'conjugaison_verbe')
                : erreursBloquantes;
            if (erreursFiltrees.length > 0) continue;
            const estPositionIgnoree = this.positionsIgnoreesErreursGeneriques.has(i);
            if (estPositionIgnoree && erreursFiltrees.length > 0) continue;
            const texte = mot.texte.toLowerCase();
            const motPrecedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
            const motSuivant = this.phraseAnalysee[i + 1] || null;
            const typePrecedent = motPrecedent && motPrecedent.donnees ? this.normaliserType(motPrecedent.donnees.type) : null;
            const typeSuivant = motSuivant && motSuivant.donnees ? this.normaliserType(motSuivant.donnees.type) : null;
            const textePrecedent = this.normaliserTexte(motPrecedent && motPrecedent.texte ? motPrecedent.texte : '');
            const texteSuivant = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
            const precedentEstSujet = !!(motPrecedent && this.estSujet(motPrecedent));

            // ma / m'a, mon / m'ont, ton / t'ont
            const prochain = this.phraseAnalysee[i + 1] || null;
            const texteProchain = this.normaliserTexte(prochain && prochain.texte ? prochain.texte : '');
            const suivantApresProchain = this.phraseAnalysee[i + 2] || null;
            const typeSuivantApresProchain = suivantApresProchain && suivantApresProchain.donnees
                ? this.normaliserType(suivantApresProchain.donnees.type)
                : null;
            const contexteNominalApresProchain = !!suivantApresProchain
                && !this.estPonctuationToken(suivantApresProchain.texte)
                && (typeSuivantApresProchain === 'nom' || typeSuivantApresProchain === null || typeSuivantApresProchain === 'adjectif');

            if ((texte === "m'" || texte === "t'") && ['a', 'as', 'ont'].includes(texteProchain) && contexteNominalApresProchain) {
                const estM = texte === "m'";
                const base = estM ? 'm' : 't';
                const correction = texteProchain === 'ont'
                    ? (estM ? 'mon' : 'ton')
                    : (estM ? 'ma' : 'ta');
                const typeErreur = texteProchain === 'ont'
                    ? (estM ? 'homophone_mon_mont' : 'homophone_ton_tont')
                    : (estM ? 'homophone_ma_ma_verbe' : 'homophone_ta_tas');

                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: typeErreur,
                    position: i,
                    indexDebut: i,
                    spanLongueur: 2,
                    mot: `${mot.texte}${prochain ? prochain.texte : ''}`,
                    correction,
                    explication: `Devant le nom "${suivantApresProchain.texte}", on attend le déterminant possessif "${correction}".`,
                    regle: `"${base}\'${texteProchain}" contient le verbe avoir. Devant un nom, on écrit plutôt "${correction}".`,
                    memo: 'Si le mot qui suit est un nom, privilégie souvent le déterminant possessif (ma/ta/mon/ton).',
                    exemples: ['ma trousse', 'ta gomme', 'mon cahier', 'ton livre'],
                    titreAide: 'Possessif ou verbe ?'
                }));
                continue;
            }

            if (texte === 'ma' && motSuivant && this.estType(motSuivant.donnees, 'verbe')) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ma_ma_verbe',
                    position: i,
                    mot: mot.texte,
                    correction: "m'a",
                    explication: 'Ici, on a besoin du verbe avoir : "m\'a" (= me a).',
                    regle: '"Ma" accompagne un nom. "M\'a" contient le verbe avoir.',
                    memo: 'Si tu peux remplacer par "m’avait", écris "m\'a".',
                    exemples: ['Il m\'a parlé.', 'Ma trousse est là.', 'Elle m\'a vu.'],
                    titreAide: 'Ma ou m\'a ?'
                }));
                continue;
            }

            if (texte === "m'a" && motSuivant && this.normaliserType(motSuivant && motSuivant.donnees && motSuivant.donnees.type) === 'nom') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ma_ma_verbe',
                    position: i,
                    mot: mot.texte,
                    correction: 'ma',
                    explication: 'Devant un nom, on attend le déterminant possessif "ma".',
                    regle: '"M\'a" contient le verbe avoir. Devant un nom, on écrit le déterminant "ma".',
                    memo: 'Teste avec "ta": si ça marche, il faut souvent "ma".',
                    exemples: ['Ma trousse est rouge.', 'Il m\'a aidée.', 'Ma sœur arrive.'],
                    titreAide: 'Ma ou m\'a ?'
                }));
                continue;
            }

            if (texte === 'mon' && precedentEstSujet && this.normaliserNombre(motPrecedent && motPrecedent.donnees && motPrecedent.donnees.nombre) === 'pluriel') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_mon_mont',
                    position: i,
                    mot: mot.texte,
                    correction: "m'ont",
                    explication: 'Avec un sujet pluriel, on a besoin de "m\'ont" (= me ont).',
                    regle: '"Mon" accompagne un nom. "M\'ont" contient le verbe avoir avec ils/elles.',
                    memo: 'Si tu peux remplacer par "m’avaient", écris "m\'ont".',
                    exemples: ['Ils m\'ont aidé.', 'Mon cahier est bleu.', 'Elles m\'ont vu.'],
                    titreAide: 'Mon ou m\'ont ?'
                }));
                continue;
            }

            if (texte === 'ton' && precedentEstSujet && this.normaliserNombre(motPrecedent && motPrecedent.donnees && motPrecedent.donnees.nombre) === 'pluriel') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ton_tont',
                    position: i,
                    mot: mot.texte,
                    correction: "t'ont",
                    explication: 'Avec un sujet pluriel, on a besoin de "t\'ont" (= te ont).',
                    regle: '"Ton" accompagne un nom. "T\'ont" contient le verbe avoir avec ils/elles.',
                    memo: 'Si tu peux remplacer par "t’avaient", écris "t\'ont".',
                    exemples: ['Ils t\'ont vu.', 'Ton livre est là.', 'Elles t\'ont appelé.'],
                    titreAide: 'Ton ou t\'ont ?'
                }));
                continue;
            }

            if (texte === "t'as" && motSuivant && this.normaliserType(motSuivant && motSuivant.donnees && motSuivant.donnees.type) === 'nom') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ta_tas',
                    position: i,
                    mot: mot.texte,
                    correction: 'ta',
                    explication: 'Devant un nom, on attend le déterminant possessif "ta".',
                    regle: '"T\'as" = tu as (verbe). Devant un nom, on écrit "ta".',
                    memo: 'Teste avec "ma": si ça marche, il faut souvent "ta".',
                    exemples: ['Ta gomme est ici.', 'Tu t\'as trompé.', 'Ta sœur arrive.'],
                    titreAide: 'Ta ou t\'as ?'
                }));
                continue;
            }

            if (texte === "m'ont" && motSuivant && this.normaliserType(motSuivant && motSuivant.donnees && motSuivant.donnees.type) === 'nom') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_mon_mont',
                    position: i,
                    mot: mot.texte,
                    correction: 'mon',
                    explication: 'Devant un nom, on écrit le déterminant possessif "mon".',
                    regle: '"M\'ont" contient le verbe avoir avec ils/elles. "Mon" détermine un nom.',
                    memo: 'Teste avec "ton": si ça marche, il faut souvent "mon".',
                    exemples: ['Mon cartable est lourd.', 'Ils m\'ont aidé.', 'Mon frère arrive.'],
                    titreAide: 'Mon ou m\'ont ?'
                }));
                continue;
            }

            if (texte === "t'ont" && motSuivant && this.normaliserType(motSuivant && motSuivant.donnees && motSuivant.donnees.type) === 'nom') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ton_tont',
                    position: i,
                    mot: mot.texte,
                    correction: 'ton',
                    explication: 'Devant un nom, on écrit le déterminant possessif "ton".',
                    regle: '"T\'ont" contient le verbe avoir avec ils/elles. "Ton" détermine un nom.',
                    memo: 'Teste avec "mon": si ça marche, il faut souvent "ton".',
                    exemples: ['Ton cahier est là.', 'Ils t\'ont vu.', 'Ton ami arrive.'],
                    titreAide: 'Ton ou t\'ont ?'
                }));
                continue;
            }

            // l'a / l'as / là
            if (texte === 'la' && motSuivant) {
                const suivantParticipe = !this.estType(motSuivant.donnees, 'nom') && !!this.trouverInfinitifDepuisParticipe(this.normaliserTexte(motSuivant.texte));
                const suivantInfinitif = !!(motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees));
                const precedentSujetSingulier = precedentEstSujet && this.normaliserNombre(motPrecedent && motPrecedent.donnees && motPrecedent.donnees.nombre) !== 'pluriel';
                if ((suivantParticipe || suivantInfinitif) && precedentSujetSingulier) {
                    const correction = this.normaliserTexte(motPrecedent && motPrecedent.texte) === 'tu' ? "l'as" : "l'a";
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_la_lapostrophe',
                        position: i,
                        mot: mot.texte,
                        correction,
                        explication: 'Ici, il ne s’agit pas du déterminant "la", mais du pronom suivi du verbe avoir.',
                        regle: '"La" peut être un déterminant. "L\'a" / "l\'as" contiennent le verbe avoir.',
                        memo: 'Si tu peux remplacer par "l’avait", écris "l’a" ou "l’as".',
                        exemples: ['Il l\'a vu.', 'Tu l\'as pris.', 'La maison est grande.'],
                        titreAide: 'La, l\'a ou l\'as ?'
                    }));
                    continue;
                }
            }

            // c'est (homophone de savoir): "tu ne c'est pas lire" -> "tu ne sais pas lire"
            if (texte === 'est' && motPrecedent && (motPrecedent.texte.toLowerCase() === "c'" || motPrecedent.texte.toLowerCase() === 'c')) {
                const idxPrec = this.obtenirIndexPrecedentSignificatif(i - 1);
                const tokPrec = idxPrec >= 0 ? this.phraseAnalysee[idxPrec] : null;
                const txtPrec = this.normaliserTexte(tokPrec && tokPrec.texte ? tokPrec.texte : '');

                let idxSujet = -1;
                if (this.estTokenNegation(txtPrec)) {
                    idxSujet = this.obtenirIndexPrecedentSignificatif(idxPrec);
                } else {
                    idxSujet = idxPrec;
                }

                const tokSujet = idxSujet >= 0 ? this.phraseAnalysee[idxSujet] : null;
                const sujet = this.normaliserTexte(tokSujet && tokSujet.texte ? tokSujet.texte : '').replace(/[’']/g, '');
                const sujetValide = ['je', 'j', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'].includes(sujet);

                const tokPas = this.phraseAnalysee[i + 1];
                const tokApresPas = this.phraseAnalysee[i + 2];
                const contexteSavoir = tokPas
                    && this.normaliserTexte(tokPas.texte) === 'pas'
                    && tokApresPas
                    && tokApresPas.donnees
                    && this.estType(tokApresPas.donnees, 'verbe')
                    && this.estFormeInfinitive(tokApresPas.texte, tokApresPas.donnees);

                if (sujetValide && contexteSavoir) {
                    const correctionSavoir = sujet === 'nous'
                        ? 'savons'
                        : sujet === 'vous'
                            ? 'savez'
                            : (sujet === 'il' || sujet === 'elle' || sujet === 'on')
                                ? 'sait'
                                : (sujet === 'ils' || sujet === 'elles')
                                    ? 'savent'
                                    : 'sais';

                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_cest_sais',
                        position: i - 1,
                        indexDebut: i - 1,
                        spanLongueur: 2,
                        mot: `${motPrecedent.texte} ${mot.texte}`,
                        correction: correctionSavoir,
                        explication: 'Ici, il faut le verbe savoir (je sais, tu sais, il sait...), pas "c\'est".',
                        regle: 'Dans la structure ne ... pas + infinitif, on emploie souvent le verbe savoir conjugué : je sais, tu sais, il sait...'
                    }));
                    continue;
                }
            }

            // c'est / s'est
            if (texte === 'est' && motPrecedent && (motPrecedent.texte.toLowerCase() === "c'" || motPrecedent.texte.toLowerCase() === 'c')) {
                const precedentAvant = i > 1 ? this.phraseAnalysee[i - 2] : null;
                const sujetAvant = !!(precedentAvant && this.estSujetOuPronomToken(precedentAvant));
                const texteSuivant2 = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
                const suivantParticipe = !!(motSuivant && (
                    this.trouverInfinitifDepuisParticipe(texteSuivant2)
                    || texteSuivant2.endsWith('é')
                    || (texteSuivant2.endsWith('er') && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'))
                ));
                if (sujetAvant && suivantParticipe) {
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_cest_sest',
                        position: i - 1,
                        indexDebut: i - 1,
                        spanLongueur: 2,
                        mot: `${motPrecedent.texte} ${mot.texte}`,
                        correction: "s'est",
                        explication: 'Ici, on a le pronom réfléchi + le verbe être : il faut écrire "s\'est".',
                        regle: 'Dans une forme pronominale au passé composé, on écrit "s\'est" (il s\'est levé). "C\'est" signifie "cela est".',
                        memo: 'Si le sujet fait l’action sur lui-même, on écrit souvent "s’est".',
                        exemples: ['Il s\'est levé.', 'C\'est beau.', 'Elle s\'est cachée.'],
                        titreAide: 'C\'est ou s\'est ?'
                    }));
                    continue;
                }
            }

            // quand / quant / qu'en
            if (texte === 'quant' && this.normaliserTexte(motSuivant && motSuivant.texte) === 'en') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_quant_quen',
                    position: i,
                    indexDebut: i,
                    spanLongueur: 2,
                    mot: `${mot.texte} ${motSuivant.texte}`,
                    correction: "qu'en",
                    explication: 'Ici, il faut écrire "qu\'en" et non "quant en".',
                    regle: '"Qu\'en" = que + en. "Quant" s’emploie surtout dans "quant à / quant au / quant aux".',
                    memo: 'Si tu peux entendre "que + en", écris "qu’en".',
                    exemples: ['Qu\'en penses-tu ?', 'Je n\'en veux qu\'un.', 'Quant à lui, il vient.'],
                    titreAide: 'Quant ou qu\'en ?'
                }));
                continue;
            }

            if (texte === 'quand' && this.normaliserTexte(motSuivant && motSuivant.texte) === 'en') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_quand_quen',
                    position: i,
                    indexDebut: i,
                    spanLongueur: 2,
                    mot: `${mot.texte} ${motSuivant.texte}`,
                    correction: "qu'en",
                    explication: 'Ici, on écrit "qu\'en" et non "quand en".',
                    regle: '"Quand" parle du temps. "Qu\'en" correspond à "que + en".',
                    memo: 'Si tu peux séparer en "que" + "en", écris "qu’en".',
                    exemples: ['Qu\'en dis-tu ?', 'Quand viens-tu ?', 'Je n\'en veux qu\'un.'],
                    titreAide: 'Quand ou qu\'en ?'
                }));
                continue;
            }

            // tord / tort (avoir tord → avoir tort)
            if (texte === 'tord') {
                const AUX_AVOIR = new Set(['ai','as','a','avons','avez','ont','avais','avait','avions','aviez','avaient','aurai','auras','aura']);
                const precedentAuxAvoir = !!(motPrecedent && AUX_AVOIR.has(this.normaliserTexte(motPrecedent.texte || '')));
                if (precedentAuxAvoir) {
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_tord_tort',
                        position: i,
                        mot: mot.texte,
                        correction: 'tort',
                        explication: 'Dans l\'expression "avoir tort", on écrit "tort" (nom) et non "tord" (verbe tordre).',
                        regle: 'L\'expression figée est "avoir tort" (= se tromper). "Tord" est une forme du verbe "tordre" (il tord le bras).',
                        memo: 'Avoir tort = se tromper. Avoir raison = être juste.',
                        exemples: ['J\'ai tort.', 'Elle avait tort.', 'Il tord le linge.'],
                        titreAide: 'Tord ou tort ?'
                    }));
                    continue;
                }
            }

            // peu / peux / peut
            if (texte === 'peux' && precedentEstSujet && !['je', 'tu'].includes(this.normaliserTexte(motPrecedent && motPrecedent.texte))) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_peux_peut',
                    position: i,
                    mot: mot.texte,
                    correction: 'peut',
                    explication: 'Avec ce sujet, il faut la forme "peut", pas "peux".',
                    regle: 'On écrit "je peux", "tu peux", mais "il/elle/on peut".',
                    memo: 'Seuls "je" et "tu" prennent "peux".',
                    exemples: ['Je peux venir.', 'Tu peux sortir.', 'Il peut partir.'],
                    titreAide: 'Peux ou peut ?'
                }));
                continue;
            }

            if (texte === 'peut' && precedentEstSujet && ['je', 'tu'].includes(this.normaliserTexte(motPrecedent && motPrecedent.texte))) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_peut_peux',
                    position: i,
                    mot: mot.texte,
                    correction: 'peux',
                    explication: 'Avec "je" ou "tu", on écrit "peux".',
                    regle: 'On écrit "je peux" et "tu peux". "Peut" s’emploie avec il/elle/on.',
                    memo: 'Avec "je" ou "tu", écris "peux".',
                    exemples: ['Je peux venir.', 'Tu peux essayer.', 'Il peut marcher.'],
                    titreAide: 'Peux ou peut ?'
                }));
                continue;
            }

            // tout / tous / toute / toutes — cas féminins simples
            if (texte === 'tout' && motSuivant && this.estType(motSuivant.donnees, 'nom') && this.normaliserGenre(motSuivant.donnees.genre) === 'féminin') {
                const nombreSuiv = this.normaliserNombre(motSuivant.donnees.nombre);
                const correction = nombreSuiv === 'pluriel' ? 'toutes' : 'toute';
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_tout_toute',
                    position: i,
                    mot: mot.texte,
                    correction,
                    explication: `Devant le nom féminin ${nombreSuiv === 'pluriel' ? 'pluriel' : 'singulier'}, on écrit "${correction}".`,
                    regle: 'Devant un nom féminin, "tout" s’accorde : toute la classe, toutes les filles.',
                    memo: 'Devant un nom féminin, pense à "toute" ou "toutes".',
                    exemples: ['toute la classe', 'toutes les filles', 'tout le monde'],
                    titreAide: 'Tout, toute ou toutes ?'
                }));
                continue;
            }

            // notre / nôtre, votre / vôtre
            if ((texte === 'notre' || texte === 'votre') && motPrecedent && ['le', 'la', 'les'].includes(this.normaliserTexte(motPrecedent.texte))) {
                const correction = texte === 'notre' ? 'nôtre' : 'vôtre';
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_notre_notreaccent',
                    position: i,
                    mot: mot.texte,
                    correction,
                    explication: 'Après un article, on écrit généralement le nom pronominal avec accent : le nôtre, le vôtre.',
                    regle: 'Devant un nom, on écrit notre / votre. Après un article, on écrit le nôtre / le vôtre.',
                    memo: 'S’il y a un article juste avant, pense souvent à nôtre / vôtre.',
                    exemples: ['Notre maison', 'La nôtre', 'Du vôtre'],
                    titreAide: 'Notre ou nôtre ?'
                }));
                continue;
            }

            // quel / quelle / quels / quelles / qu'elle / qu'elles
            if (['quel', 'quelle', 'quels', 'quelles'].includes(texte) && motSuivant && this.estType(motSuivant.donnees, 'verbe')) {
                const correction = ['quels', 'quelles'].includes(texte) ? "qu'elles" : "qu'elle";
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_quel_quelle_quelleapostrophe',
                    position: i,
                    mot: mot.texte,
                    correction,
                    explication: 'Ici, il ne s’agit pas d’un déterminant interrogatif mais de "que" + "elle(s)".',
                    regle: 'Quel / quelle / quels / quelles accompagnent un nom. Qu\'elle / qu\'elles correspondent à "que elle(s)".',
                    memo: 'S’il n’y a pas de nom après et que tu peux entendre "que elle", écris "qu’elle".',
                    exemples: ['Quelle histoire !', 'Je veux qu\'elle vienne.', 'Je pense qu\'elles arrivent.'],
                    titreAide: 'Quelle ou qu\'elle ?'
                }));
                continue;
            }

        }
    }

    global.AbeHomophonesModules = global.AbeHomophonesModules || {};
    global.AbeHomophonesModules.appliquerPassage4 = appliquerPassage4;
})(typeof window !== 'undefined' ? window : globalThis);
