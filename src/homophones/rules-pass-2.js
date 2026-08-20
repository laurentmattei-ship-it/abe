/**
 * Homophones - appliquerPassage2
 * G?n?r? depuis src/analyseur/categories/homophones.js
 */
(function (global) {
    function appliquerPassage2() {
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

            // et/est
            // "il et content" -> "il est content"
            if (texte === 'et') {
                const suivantClitique = !!motSuivant && this.estClitiqueObjetToken(motSuivant.texte);
                if (suivantClitique) {
                    continue;
                }
                const suivantCompatibleEst = ['adjectif', 'adverbe', 'déterminant', 'pronom'].includes(typeSuivant);
                const suivantInfinitif = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees));
                const suivantRessembleAttribut = !!(motSuivant && (
                    this.estParticipePasseProbable(motSuivant.texte)
                    || /^[a-zàâçéèêëîïôûùüÿœæ]+(e|es|é|ée|és|ées|i|ie|is|ies|u|ue|us|ues)$/i.test(motSuivant.texte || '')
                ));
                // Restreindre aux pronoms personnels sujets pour éviter les faux positifs après les noms
                // Exception : nom singulier suivi d'un adjectif ("Le ciel et bleu")
                const precedentEstPronomPersonnel = !!(motPrecedent && this.estType(motPrecedent.donnees, 'pronom') && this.estPronomSujetToken(motPrecedent.texte));
                const precedentEstNomSingulier = !!(motPrecedent && this.estType(motPrecedent.donnees, 'nom') && this.normaliserNombre(motPrecedent.donnees.nombre) === 'singulier' && suivantCompatibleEst && typeSuivant === 'adjectif');
                if ((precedentEstPronomPersonnel || precedentEstNomSingulier) && (suivantCompatibleEst || suivantRessembleAttribut || suivantInfinitif)) {
                    const erreur = {
                        type: 'homophone_et_est',
                        position: i,
                        mot: mot.texte,
                        correction: 'est',
                        explication: `Avec le sujet "${motPrecedent.texte}", on a besoin du verbe "être" : "est".`,
                        regle: '"Est" est le verbe être (il est). "Et" sert à relier des mots ou groupes (papa et maman).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // "papa est maman" -> "papa et maman"
            if (texte === 'est') {
                const precedentNegation = !!(motPrecedent && this.estTokenNegation(motPrecedent.texte));
                const idxSujetNeg = precedentNegation ? this.obtenirIndexPrecedentSignificatif(i - 1) : -1;
                const sujetNeg = idxSujetNeg >= 0 ? this.phraseAnalysee[idxSujetNeg] : null;
                const texteSujetNeg = this.normaliserTexte(sujetNeg && sujetNeg.texte ? sujetNeg.texte : '').replace(/[’']/g, '');
                const suitNegation = !!(motSuivant && ['pas', 'jamais', 'plus', 'rien', 'personne'].includes(this.normaliserTexte(motSuivant.texte)));

                if (precedentNegation && suitNegation && ['je', 'j', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'].includes(texteSujetNeg)) {
                    const idxApresNeg = this.obtenirIndexSuivantSignificatif(i + 1);
                    const tokApresNeg = idxApresNeg >= 0 ? this.phraseAnalysee[idxApresNeg] : null;
                    const gardeEtreParticipe = !!(tokApresNeg && this.estParticipePasseProbable(tokApresNeg.texte));
                    if (gardeEtreParticipe) {
                        continue;
                    }

                    const correctionAvoir = (texteSujetNeg === 'je' || texteSujetNeg === 'j')
                        ? 'ai'
                        : texteSujetNeg === 'tu'
                            ? 'as'
                            : (texteSujetNeg === 'il' || texteSujetNeg === 'elle' || texteSujetNeg === 'on')
                                ? 'a'
                                : texteSujetNeg === 'nous'
                                    ? 'avons'
                                    : texteSujetNeg === 'vous'
                                        ? 'avez'
                                        : 'ont';

                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_est_a_avoir',
                        position: i,
                        mot: mot.texte,
                        correction: correctionAvoir,
                        explication: 'Dans cette négation, on utilise ici une forme du verbe avoir (ai, as, a, avons, avez, ont).',
                        regle: 'Dans ne ... pas avec le verbe avoir, on écrit ai/as/a/avons/avez/ont selon le sujet.'
                    }));
                    continue;
                }

                const precNominal = ['nom', 'pronom'].includes(typePrecedent);
                const suivNominal = ['nom', 'pronom', 'déterminant'].includes(typeSuivant);
                const precedeDeCe = !!(motPrecedent && (motPrecedent.texte.toLowerCase() === "c'" || motPrecedent.texte.toLowerCase() === 'ce'));
                if (!precedeDeCe && !precedentEstSujet && precNominal && suivNominal) {
                    const erreur = {
                        type: 'homophone_est_et',
                        position: i,
                        mot: mot.texte,
                        correction: 'et',
                        explication: 'Ici, on relie deux éléments: il faut la conjonction "et".',
                        regle: '"Et" relie des mots (X et Y). "Est" est une forme du verbe être.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }

                const suitPronomSujet = !!(motSuivant && this.estType(motSuivant.donnees, 'pronom') && this.estPronomSujetToken(motSuivant.texte));
                const precParticipe = !!(motPrecedent && this.estParticipePasseProbable(motPrecedent.texte));
                if (!precedeDeCe && precParticipe && suitPronomSujet) {
                    const erreur = {
                        type: 'homophone_est_et',
                        position: i,
                        mot: mot.texte,
                        correction: 'et',
                        explication: 'Ici, le mot relie deux propositions: on attend la conjonction "et".',
                        regle: '"Et" relie des mots ou propositions. "Est" est une forme du verbe être.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // son/sont
            // "ils son fatigués" -> "ils sont fatigués"
            if (texte === 'son') {
                const precedentCorrigePluriel = !!(motPrecedent && Array.isArray(motPrecedent.erreurs)
                    && motPrecedent.erreurs.some((e) =>
                        e && e.type === 'accord_nom_nombre' && typeof e.correction === 'string' && /[sx]$/i.test(e.correction)
                    ));
                const sujetPluriel = (precedentEstSujet && this.normaliserNombre(motPrecedent.donnees && motPrecedent.donnees.nombre) === 'pluriel')
                    || precedentCorrigePluriel
                    || this.estContexteNominalPlurielProbable(i - 1);
                const suivantNonNom = !!motSuivant && typeSuivant !== 'nom';
                const suivantParticipe = !!(motSuivant && this.estParticipePasseProbable(motSuivant.texte));
                if (sujetPluriel && (suivantNonNom || suivantParticipe)) {
                    const erreur = {
                        type: 'homophone_son_sont',
                        position: i,
                        mot: mot.texte,
                        correction: 'sont',
                        explication: `Avec le sujet pluriel "${motPrecedent.texte}", il faut le verbe "sont".`,
                        regle: '"Sont" est le verbe être au pluriel (ils/elles sont). "Son" est un déterminant (son cahier).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // "sont cahier" -> "son cahier"
            if (texte === 'sont') {
                const suivantNom = !!motSuivant && typeSuivant === 'nom';
                if (suivantNom && !precedentEstSujet) {
                    const erreur = {
                        type: 'homophone_sont_son',
                        position: i,
                        mot: mot.texte,
                        correction: 'son',
                        explication: `Devant le nom "${motSuivant.texte}", il faut généralement un déterminant comme "son".`,
                        regle: '"Son" détermine un nom (son livre). "Sont" est une forme du verbe être.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // ou/où
            // "tu vas ou" -> "tu vas où"
            if (texte === 'ou') {
                const precedentVerbe = !!(motPrecedent && motPrecedent.donnees && this.estType(motPrecedent.donnees, 'verbe'));
                const precedentNom = !!(motPrecedent && motPrecedent.donnees && this.normaliserType(motPrecedent.donnees.type) === 'nom');
                const debutSegment = i === 0 || this.estPonctuationToken((motPrecedent && motPrecedent.texte) || '');

                const suivantPronomSujet = motSuivant && ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'se', "s'"].includes(this.normaliserTexte(motSuivant.texte));
                const suivantVerbe = motSuivant && motSuivant.donnees && (this.estType(motSuivant.donnees, 'verbe') || this.normaliserType(motSuivant.donnees.type) === 'verbe');

                const motPrecNorm = motPrecedent ? this.normaliserTexte(motPrecedent.texte) : '';
                const estAntecedentLieuTemps = ['ville', 'pays', 'maison', 'endroit', 'lieu', 'moment', 'jour', 'station', 'cabane', 'chambre', 'rue', 'ecole', 'classe', 'salle', 'village', 'foret', 'bureau'].includes(motPrecNorm);
                const estVerbeSavoirOuMouvement = ['sais', 'sait', 'savent', 'savait', 'saches', 'savoir', 'va', 'vas', 'vont', 'allons', 'allez', 'aller', 'cherche', 'cherchent', 'trouve', 'trouvent', 'dort', 'dorment', 'habite', 'habites', 'habitent'].includes(motPrecNorm);

                const questionCopule = debutSegment && (suivantVerbe || suivantPronomSujet);
                const propositionRelativeLieu = (precedentNom || precedentVerbe || estAntecedentLieuTemps || estVerbeSavoirOuMouvement) && (suivantPronomSujet || suivantVerbe);

                if (questionCopule || propositionRelativeLieu || (estAntecedentLieuTemps && motSuivant) || (estVerbeSavoirOuMouvement && (suivantPronomSujet || suivantVerbe))) {
                    const erreur = {
                        type: 'homophone_ou_ou_grave',
                        position: i,
                        mot: mot.texte,
                        correction: 'où',
                        explication: 'Ici, il s\'agit d\'un lieu ou d\'un moment : il faut écrire "où" avec accent grave.',
                        regle: '"Où" (avec accent) indique un lieu ou un moment (où vas-tu ?, la ville où j\'habite). "Ou" (sans accent) sert à proposer un choix (thé ou café).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // "toi où moi" -> "toi ou moi"
            if (texte === 'où') {
                const precNominal = ['nom', 'pronom', 'adjectif'].includes(typePrecedent);
                const suivNominal = ['nom', 'pronom', 'adjectif'].includes(typeSuivant);
                const suitRelative = !!(motSuivant && this.estPronomSujetToken(motSuivant.texte));
                if (precNominal && suivNominal && !suitRelative) {
                    const erreur = {
                        type: 'homophone_ou_grave_ou',
                        position: i,
                        mot: mot.texte,
                        correction: 'ou',
                        explication: 'Ici, tu proposes un choix entre deux éléments: il faut "ou" sans accent.',
                        regle: '"Ou" (sans accent) exprime un choix. "Où" (avec accent) exprime un lieu/temps.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // ce/se
            // "il ce lave" -> "il se lave", "ce promener" -> "se promener"
            if (texte === 'ce') {
                const suivantVerbe = !!(motSuivant && motSuivant.donnees && (this.estType(motSuivant.donnees, 'verbe') || this.normaliserType(motSuivant.donnees.type) === 'verbe'));
                const suivantEstEtreOuSembler = motSuivant && ['est', 'sont', 'sera', 'seront', 'fut', 'furent', 'semble', 'semblent', 'paraît', 'paraissent'].includes(this.normaliserTexte(motSuivant.texte));
                if (suivantVerbe && !suivantEstEtreOuSembler) {
                    const erreur = {
                        type: 'homophone_ce_se',
                        position: i,
                        mot: mot.texte,
                        correction: 'se',
                        explication: 'Ici, il s\'agit du pronom réfléchi "se", pas du déterminant "ce".',
                        regle: 'Devant un verbe pronominal, on écrit "se" (il se lave). "Ce" est surtout un déterminant (ce livre) ou un pronom démonstratif.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // "se matin", "se beau matin", "se chat" -> "ce matin", "ce beau matin", "ce chat"
            if (texte === 'se') {
                const suivantVerbe = !!(motSuivant && motSuivant.donnees && (this.estType(motSuivant.donnees, 'verbe') || this.normaliserType(motSuivant.donnees.type) === 'verbe'));
                if (motSuivant && !suivantVerbe) {
                    const erreur = {
                        type: 'homophone_se_ce',
                        position: i,
                        mot: mot.texte,
                        correction: 'ce',
                        explication: `Devant "${motSuivant.texte}", on attend le déterminant "ce".`,
                        regle: 'On écrit "ce" devant un nom masculin singulier (ce matin). "Se" est un pronom (il se couche).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // on/ont
            // "ils on mangé" -> "ils ont mangé"
            if (texte === 'on') {
                const sujetPluriel = (precedentEstSujet && this.normaliserNombre(motPrecedent && motPrecedent.donnees && motPrecedent.donnees.nombre) === 'pluriel')
                    || this.estContexteNominalPlurielProbable(i - 1);
                const suivantVerbal = !!(motSuivant && motSuivant.donnees && (this.estType(motSuivant.donnees, 'verbe') || this.normaliserType(motSuivant.donnees.type) === 'adjectif'));
                const casIlOnParticipe = !!(motPrecedent
                    && ['il', 'elle'].includes(this.normaliserTexte(motPrecedent.texte))
                    && motSuivant
                    && this.estParticipePasseProbable(motSuivant.texte));

                let sujetPlurielElargi = sujetPluriel;
                if (!sujetPlurielElargi) {
                    const idxNomPrincipal = this.obtenirIndexPrecedentSignificatif(i);
                    if (idxNomPrincipal >= 2) {
                        const tokNom = this.phraseAnalysee[idxNomPrincipal];
                        const tokDe = this.phraseAnalysee[idxNomPrincipal - 1];
                        const tokAvant = this.phraseAnalysee[idxNomPrincipal - 2];
                        const tokAvantNomOuCorrige = !!(tokAvant && (
                            this.estType(tokAvant.donnees, 'nom')
                            || (Array.isArray(tokAvant.erreurs) && tokAvant.erreurs.some((e) =>
                                e && e.type === 'accord_nom_nombre' && typeof e.correction === 'string'
                            ))
                        ));
                        if (tokNom && tokDe && tokAvant
                            && this.normaliserTexte(tokDe.texte) === 'de'
                            && this.estType(tokNom.donnees, 'nom')
                            && tokAvantNomOuCorrige) {
                            sujetPlurielElargi = this.estSujetCorrigePluriel(tokAvant, idxNomPrincipal - 2);
                        }
                    }
                }

                if ((sujetPlurielElargi && suivantVerbal) || casIlOnParticipe) {
                    const erreur = {
                        type: 'homophone_on_ont',
                        position: i,
                        mot: mot.texte,
                        correction: 'ont',
                        explication: `Avec le sujet pluriel "${motPrecedent.texte}", il faut "ont" (verbe avoir).`,
                        regle: '"Ont" est le verbe avoir avec ils/elles. "On" est un pronom sujet singulier.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);

                    if (motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees)) {
                        const dejaParticipe = (motSuivant.erreurs || []).some((e) => e && e.type === 'verbe_participe_requis');
                        if (!dejaParticipe) {
                            const pp = this.trouverParticipePasse(motSuivant.texte);
                            if (pp) {
                                const erreurPP = {
                                    type: 'verbe_participe_requis',
                                    position: i + 1,
                                    mot: motSuivant.texte,
                                    correction: pp,
                                    explication: `Après "ont", le verbe doit être au participe passé.`,
                                    regle: 'Avec l\'auxiliaire avoir au passé composé, on écrit un participe passé (ont décidé, ont oublié...).'
                                };
                                this.erreursTrouvees.push(erreurPP);
                                motSuivant.erreurs.push(erreurPP);
                            }
                        }
                    }
                    continue;
                }
            }

            // "ont mange" en début de phrase (cas scolaire fréquent) -> "on mange"
            if (texte === 'ont') {
                const precedentPluriel = !!(motPrecedent && (
                    this.normaliserNombre(motPrecedent.donnees && motPrecedent.donnees.nombre) === 'pluriel'
                    || this.estContexteNominalPlurielProbable(i - 1)
                ));
                const contexteSubjonctif = precedentPluriel
                    && ['que', 'qu'].includes(textePrecedent)
                    && motSuivant
                    && this.estParticipePasseProbable(motSuivant.texte);
                if (contexteSubjonctif) {
                    const erreur = {
                        type: 'homophone_on_ont',
                        position: i,
                        mot: mot.texte,
                        correction: 'aient',
                        explication: 'Après "que" avec un sujet pluriel, on attend ici le subjonctif "aient".',
                        regle: 'Dans certains contextes introduits par "que", le verbe avoir se met au subjonctif : qu\'ils aient fini.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }

                const debutPhrase = i === 0 || this.estPonctuationToken((this.phraseAnalysee[i - 1] && this.phraseAnalysee[i - 1].texte) || '');
                const suivantVerbe = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'));
                if (debutPhrase && suivantVerbe) {
                    const erreur = {
                        type: 'homophone_ont_on',
                        position: i,
                        mot: mot.texte,
                        correction: 'on',
                        explication: 'Ici, on attend le pronom sujet "on", pas le verbe "ont".',
                        regle: '"On" est un pronom sujet (on mange). "Ont" est le verbe avoir à la 3e personne du pluriel (ils ont).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

        }
    }

    global.AbeHomophonesModules = global.AbeHomophonesModules || {};
    global.AbeHomophonesModules.appliquerPassage2 = appliquerPassage2;
})(typeof window !== 'undefined' ? window : globalThis);
