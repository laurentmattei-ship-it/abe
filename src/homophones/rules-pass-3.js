/**
 * Homophones - appliquerPassage3
 * G?n?r? depuis src/analyseur/categories/homophones.js
 */
(function (global) {
    function appliquerPassage3() {
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

            // leur/leurs (déterminant possessif)
            if (texte === 'leur') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                if (suivantNom) {
                    const nombreNom = this.normaliserNombre(motSuivant.donnees.nombre);
                    if (nombreNom === 'pluriel') {
                        const erreur = {
                            type: 'homophone_leur_leurs',
                            position: i,
                            mot: mot.texte,
                            correction: 'leurs',
                            explication: `Le nom "${motSuivant.texte}" est au pluriel: on écrit "leurs".`,
                            regle: 'Devant un nom pluriel, on écrit "leurs". Devant un nom singulier, on écrit "leur".'
                        };
                        this.erreursTrouvees.push(erreur);
                        mot.erreurs.push(erreur);
                        continue;
                    }
                }
            }

            if (texte === 'leurs') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                if (suivantNom) {
                    const nombreNom = this.normaliserNombre(motSuivant.donnees.nombre);
                    if (nombreNom === 'singulier') {
                        const erreur = {
                            type: 'homophone_leurs_leur',
                            position: i,
                            mot: mot.texte,
                            correction: 'leur',
                            explication: `Le nom "${motSuivant.texte}" est au singulier: on écrit "leur".`,
                            regle: 'Devant un nom singulier, on écrit "leur". Devant un nom pluriel, on écrit "leurs".'
                        };
                        this.erreursTrouvees.push(erreur);
                        mot.erreurs.push(erreur);
                        continue;
                    }
                }
            }

            // se/ce/ses -> c'est (cas usuels d'usage)
            const debutSegment = i === 0 || this.estPonctuationToken((motPrecedent && motPrecedent.texte) || '');
            const suitAttribut = ['adjectif', 'adverbe', 'déterminant', 'pronom', 'nom'].includes(typeSuivant);

            // "se bien" / "ce bien" / "ses bien" -> "c'est bien"
            if ((texte === 'se' || texte === 'ce' || texte === 'ses') && debutSegment && suitAttribut) {
                // Éviter les cas corrects déterminant + nom: "ce matin", "ses livres"
                const suivantNom = typeSuivant === 'nom';
                const suivantPluriel = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'pluriel');
                const estCasDeterminantValide =
                    (texte === 'ce' && suivantNom && !suivantPluriel)
                    || (texte === 'ses' && suivantNom && suivantPluriel);

                if (!estCasDeterminantValide) {
                    const typeErreur = texte === 'se' ? 'homophone_se_cest' : (texte === 'ce' ? 'homophone_ce_cest' : 'homophone_ses_cest');
                    const erreur = {
                        type: typeErreur,
                        position: i,
                        mot: mot.texte,
                        correction: "c'est",
                        explication: `Ici, on utilise l'expression "c'est" (= cela est), pas "${mot.texte}".`,
                        regle: 'Quand on peut dire "cela est", on écrit "c\'est".'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // ni -> n'y (cas fréquents: "ni va", "ni a", "ni est")
            if (texte === 'ni') {
                const suitVerbe = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'));
                if (suitVerbe) {
                    const erreur = {
                        type: 'homophone_ni_ny',
                        position: i,
                        mot: mot.texte,
                        correction: "n'y",
                        explication: 'Ici, on exprime une négation + pronom de lieu: il faut "n\'y".',
                        regle: '"N\'y" = "ne ... y" (je n\'y vais pas). "Ni" sert à coordonner des éléments (ni l\'un ni l\'autre).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // mes/mais
            if (texte === 'mais') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const suivantPluriel = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'pluriel');
                if (suivantNom && suivantPluriel) {
                    const erreur = {
                        type: 'homophone_mais_mes',
                        position: i,
                        mot: mot.texte,
                        correction: 'mes',
                        explication: `Devant le nom pluriel "${motSuivant.texte}", on attend le déterminant possessif "mes".`,
                        regle: '"Mes" est un déterminant possessif devant un nom pluriel. "Mais" est une conjonction (opposition).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            if (texte === 'mes') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const suivantPluriel = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'pluriel');
                const suivantVerbe = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'));
                if (i === 0 && suivantNom && suivantPluriel && !suivantVerbe) {
                    continue;
                }
                const contexteConjonction = !suivantNom;
                if (contexteConjonction && (debutSegment || ['nom', 'pronom', 'verbe', 'adjectif'].includes(typePrecedent))) {
                    const erreur = {
                        type: 'homophone_mes_mais',
                        position: i,
                        mot: mot.texte,
                        correction: 'mais',
                        explication: 'Ici, on exprime une opposition: il faut la conjonction "mais".',
                        regle: '"Mais" sert à opposer deux idées. "Mes" accompagne un nom pluriel.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // la/là
            if (texte === 'là') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const suivantSing = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'singulier');
                if ((debutSegment || i === 0) && suivantNom && suivantSing) {
                    const erreur = {
                        type: 'homophone_la_grave_la',
                        position: i,
                        mot: mot.texte,
                        correction: 'la',
                        explication: `Devant le nom féminin singulier "${motSuivant.texte}", on écrit "la" (sans accent).`,
                        regle: '"La" est un déterminant. "Là" (avec accent) indique un lieu.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            if (texte === 'la') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const precedentVerbe = !!(motPrecedent && motPrecedent.donnees && this.estType(motPrecedent.donnees, 'verbe'));
                const finSegment = !motSuivant || this.estPonctuationToken(motSuivant.texte);
                const precedentNom = typePrecedent === 'nom';
                if ((!suivantNom && precedentVerbe) || (finSegment && precedentNom)) {
                    const erreur = {
                        type: 'homophone_la_la_grave',
                        position: i,
                        mot: mot.texte,
                        correction: 'là',
                        explication: 'Ici, on parle d\'un lieu: il faut "là" avec accent.',
                        regle: '"Là" indique un lieu. "La" (sans accent) est surtout un déterminant.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // ta/t'as
            if (texte === 'ta') {
                const suitVerbe = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'));
                const suitNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                if (suitVerbe && !suitNom) {
                    const erreur = {
                        type: 'homophone_ta_tas',
                        position: i,
                        mot: mot.texte,
                        correction: "t'as",
                        explication: 'Ici, on a besoin de la forme verbale "t\'as" (= tu as), pas du déterminant "ta".',
                        regle: '"T\'as" = "tu as" (verbe avoir). "Ta" est un déterminant possessif devant un nom (ta trousse).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // peu/peut
            if (texte === 'peut') {
                const precTexte = this.normaliserTexte(motPrecedent && motPrecedent.texte ? motPrecedent.texte : '');
                const texteSuivantNormalise = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
                const suitDe = ['de', "d'", 'd’'].includes(texteSuivantNormalise);
                const motApresDe = suitDe ? (this.phraseAnalysee[i + 2] || null) : null;
                const contextePetit = ['petit', 'petite', 'petits', 'petites'].includes(precTexte);
                const contextePetitApprox = /^peti/.test(precTexte);
                const contexteQuantifieur = ['un', 'une', 'du', 'de', 'des', 'tres', 'plus', 'moins', 'trop', 'assez', 'si', 'tout', 'aussi'].includes(precTexte);
                const suitNominal = ['nom', 'adjectif', 'adverbe', 'déterminant'].includes(typeSuivant);
                const motifQuantiteDe = suitDe && (
                    !motApresDe
                    || this.estType(motApresDe.donnees, 'nom')
                    || this.estType(motApresDe.donnees, 'déterminant')
                    || this.estType(motApresDe.donnees, 'adjectif')
                    || this.estType(motApresDe.donnees, 'pronom')
                );

                if (contextePetit || contextePetitApprox || motifQuantiteDe || (suitDe && contexteQuantifieur) || (contexteQuantifieur && suitNominal)) {
                    const erreur = {
                        type: 'homophone_peut_peu',
                        position: i,
                        mot: mot.texte,
                        correction: 'peu',
                        explication: 'Ici, il faut l\'adverbe de quantité "peu" et non le verbe "peut".',
                        regle: 'Devant "de" pour exprimer une quantité (peu de gens, peu d\'eau), on écrit "peu".',
                        memo: 'Teste avec "beaucoup de" : si la phrase fonctionne, il faut écrire "peu".',
                        exemples: ['Peu de gens sont venus.', 'J\'ai peu de temps.', 'Il y a peu d\'eau.'],
                        titreAide: 'Peut ou peu ?'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // peu/peut (sens inverse)
            if (texte === 'peu') {
                const suivantVerbe = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe'));
                const suitInfinitif = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees));
                if (precedentEstSujet && (suivantVerbe || suitInfinitif)) {
                    const erreur = {
                        type: 'homophone_peu_peut',
                        position: i,
                        mot: mot.texte,
                        correction: 'peut',
                        explication: 'Ici, il faut le verbe "peut" (pouvoir) et non l\'adverbe "peu".',
                        regle: 'Avec un sujet (il/elle/on/nom) et un verbe ensuite, on écrit "peut" (verbe pouvoir).'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // Règle 20 : quand / quant
            // "quant" s'emploie UNIQUEMENT dans "quant à / quant au / quant aux"
            // → si "quand" est suivi de "à/au/aux", c'est une erreur
            if (texte === 'quand') {
                const texteSuivant = this.normaliserTexte(motSuivant && motSuivant.texte ? motSuivant.texte : '');
                if (['a', 'au', 'aux'].includes(texteSuivant)) {
                    const erreur = {
                        type: 'homophone_quand_quant',
                        position: i,
                        mot: mot.texte,
                        correction: 'quant',
                        explication: 'Devant "à / au / aux", on écrit "quant" (et non "quand").',
                        regle: '"Quant à / quant au / quant aux" exprime un sujet qu\'on aborde. "Quand" exprime le temps.'
                    };
                    this.erreursTrouvees.push(erreur);
                    mot.erreurs.push(erreur);
                    continue;
                }
            }

            // Règle 8 : tout / tous devant un nom pluriel masculin
            // "tout" devant un nom masculin pluriel doit être "tous"
            if (texte === 'tout') {
                const donneeSuivant = motSuivant && motSuivant.donnees;
                if (donneeSuivant) {
                    const typeSuiv = this.normaliserType(donneeSuivant.type);
                    const nombreSuiv = this.normaliserNombre(donneeSuivant.nombre);
                    const genreSuiv = (donneeSuivant.genre || '').toLowerCase();
                    if ((typeSuiv === 'nom' || typeSuiv === 'déterminant') && nombreSuiv === 'pluriel' && (genreSuiv === 'masculin' || genreSuiv === '')) {
                        const erreur = {
                            type: 'homophone_tout_tous',
                            position: i,
                            mot: mot.texte,
                            correction: 'tous',
                            explication: `Le nom "${motSuivant.texte}" est au pluriel : on écrit "tous" devant un nom masculin pluriel.`,
                            regle: '"Tout" est singulier (tout le monde). Devant un nom masculin pluriel, on écrit "tous" (tous les garçons).'
                        };
                        this.erreursTrouvees.push(erreur);
                        mot.erreurs.push(erreur);
                        continue;
                    }
                }
            }

            // ces / ses
            if (texte === 'ses') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const suivantPluriel = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'pluriel');
                const contexteDemonstratif = ['préposition', 'conjonction'].includes(typePrecedent);
                if (suivantNom && suivantPluriel && contexteDemonstratif) {
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_ses_ces',
                        position: i,
                        mot: mot.texte,
                        correction: 'ces',
                        explication: `Ici, tu désignes les "${motSuivant.texte}" : il faut écrire "ces" et non "ses".`,
                        regle: '"Ces" sert à montrer ou désigner. "Ses" exprime la possession.',
                        memo: 'Si tu peux remplacer par "ces là", écris "ces". Si ça appartient à quelqu’un, écris "ses".',
                        exemples: ['ces livres = on montre les livres', 'ses livres = les livres lui appartiennent', 'ces enfants jouent.'],
                        titreAide: 'Ces ou ses ?'
                    }));
                    continue;
                }
            }

            if (texte === 'ces') {
                const suivantNom = !!(motSuivant && motSuivant.donnees && this.normaliserType(motSuivant.donnees.type) === 'nom');
                const suivantPluriel = !!(motSuivant && motSuivant.donnees && this.normaliserNombre(motSuivant.donnees.nombre) === 'pluriel');
                const possesseurAvant = !!(motPrecedent && ['nom', 'pronom'].includes(typePrecedent));
                if (suivantNom && suivantPluriel && possesseurAvant) {
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_ces_ses',
                        position: i,
                        mot: mot.texte,
                        correction: 'ses',
                        explication: `Ici, on parle des "${motSuivant.texte}" qui appartiennent à quelqu’un : il faut "ses".`,
                        regle: '"Ses" exprime la possession. "Ces" sert à montrer ou à désigner.',
                        memo: 'Si tu peux remplacer par "mes" ou "tes", alors il faut écrire "ses".',
                        exemples: ['ses cahiers = mes cahiers', 'ces cahiers = ceux-ci', 'Paul range ses affaires.'],
                        titreAide: 'Ces ou ses ?'
                    }));
                    continue;
                }
            }

        }
    }

    global.AbeHomophonesModules = global.AbeHomophonesModules || {};
    global.AbeHomophonesModules.appliquerPassage3 = appliquerPassage3;
})(typeof window !== 'undefined' ? window : globalThis);
