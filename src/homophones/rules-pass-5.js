/**
 * Homophones - appliquerPassage5
 * G?n?r? depuis src/analyseur/categories/homophones.js
 */
(function (global) {
    function appliquerPassage5() {
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

            // Homophones/paronymes avances (lot 1)
            const texteNorm = this.normaliserTexte(mot.texte || '');
            const motDeuxAvant = i > 1 ? this.phraseAnalysee[i - 2] : null;
            const motDeuxApres = this.phraseAnalysee[i + 2] || null;
            const texteDeuxAvant = this.normaliserTexte(motDeuxAvant && motDeuxAvant.texte ? motDeuxAvant.texte : '');
            const texteDeuxApres = this.normaliserTexte(motDeuxApres && motDeuxApres.texte ? motDeuxApres.texte : '');

            const verbeAlimentaireAvant = /^(mang|croqu|degust|gout|cuisin|prepare|ador)/.test(textePrecedent) || /^(mang|croqu|degust|gout|cuisin|prepare|ador)/.test(texteDeuxAvant);
            const verbePaiementAvant = /^(pay|regl|recev|ecop|contest)/.test(textePrecedent) || /^(pay|regl|recev|ecop|contest)/.test(texteDeuxAvant);

            if (texteNorm === 'amende' && verbeAlimentaireAvant) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_amende_amande',
                    position: i,
                    mot: mot.texte,
                    correction: 'amande',
                    explication: 'Ici, on parle du fruit sec: il faut "amande".',
                    regle: '"Amande" = fruit. "Amende" = contravention.'
                }));
                continue;
            }

            if (texteNorm === 'amande' && (verbePaiementAvant || texteSuivant === 'de')) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_amande_amende',
                    position: i,
                    mot: mot.texte,
                    correction: 'amende',
                    explication: 'Ici, on parle d\'une sanction a payer: il faut "amende".',
                    regle: '"Amende" = contravention. "Amande" = fruit.'
                }));
                continue;
            }

            const contexteEcriture = /^(stylo|plume|cahier|feuille|bouteille|cartouche|papier)$/.test(texteSuivant)
                || /^(stylo|plume|cahier|feuille|bouteille|cartouche|papier)$/.test(textePrecedent)
                || (texteDeuxAvant === 'avec' && typePrecedent === 'déterminant')
                || /^(ecri|trac|color)/.test(textePrecedent);
            const contexteMarine = /^(bateau|navire|port|ponton|jetee|marin)$/.test(texteSuivant)
                || /^(bateau|navire|port|ponton|jetee|marin)$/.test(textePrecedent)
                || /^(bateau|navire|port|ponton|jetee|marin)$/.test(texteDeuxAvant)
                || /^(jet|lev|mouill)/.test(textePrecedent);

            if (texteNorm === 'ancre' && contexteEcriture) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_ancre_encre',
                    position: i,
                    mot: mot.texte,
                    correction: 'encre',
                    explication: 'Dans le contexte de l\'ecriture, on utilise "encre".',
                    regle: '"Encre" = liquide pour ecrire. "Ancre" = piece d\'un bateau.'
                }));
                continue;
            }

            if (texteNorm === 'encre' && contexteMarine) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_encre_ancre',
                    position: i,
                    mot: mot.texte,
                    correction: 'ancre',
                    explication: 'Dans le contexte maritime, il faut "ancre".',
                    regle: '"Ancre" = piece d\'un bateau. "Encre" = liquide pour ecrire.'
                }));
                continue;
            }

            const contexteHistoire = /^(lire|lis|lu|racon|ecout|histoire)$/.test(textePrecedent)
                || /^(lire|lis|lu|racon|ecout|histoire)$/.test(texteDeuxAvant)
                || /^(histoire|roman|legende)$/.test(texteSuivant);
            const contexteComptage = /^(faire|fais|fait|rendre|calcul|addition|banque)$/.test(textePrecedent)
                || /^(faire|fais|fait|rendre|calcul|addition|banque)$/.test(texteDeuxAvant);

            if (texteNorm === 'compte' && contexteHistoire) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_compte_conte',
                    position: i,
                    mot: mot.texte,
                    correction: 'conte',
                    explication: 'Ici, on parle d\'un recit: il faut "conte".',
                    regle: '"Conte" = histoire. "Compte" = calcul, recit de faits ou compte bancaire.'
                }));
                continue;
            }

            if (texteNorm === 'conte' && contexteComptage) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_conte_compte',
                    position: i,
                    mot: mot.texte,
                    correction: 'compte',
                    explication: 'Ici, on est dans le sens du calcul ou du bilan: il faut "compte".',
                    regle: '"Compte" = calcul, bilan, compte bancaire. "Conte" = histoire.'
                }));
                continue;
            }

            if (texteNorm === 'conte' && textePrecedent === 'le' && texteSuivant === 'de') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_conte_comte',
                    position: i,
                    mot: mot.texte,
                    correction: 'comte',
                    explication: 'Dans un titre nobiliaire ("le ... de"), il faut "comte".',
                    regle: '"Comte" est un titre de noblesse. "Conte" est une histoire.'
                }));
                continue;
            }

            if (texteNorm === 'comte' && contexteHistoire) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_comte_conte',
                    position: i,
                    mot: mot.texte,
                    correction: 'conte',
                    explication: 'Ici, on parle d\'une histoire: il faut "conte".',
                    regle: '"Conte" = histoire. "Comte" = titre de noblesse.'
                }));
                continue;
            }

            if (texteNorm === 'pret' && texteSuivant === 'de') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_pret_pres',
                    position: i,
                    mot: mot.texte,
                    correction: 'près',
                    explication: 'Devant "de", on exprime la proximite: il faut "près".',
                    regle: '"Près de" indique la proximite. "Prêt" signifie disponible.'
                }));
                continue;
            }

            const suiteInfinitive = !!(motSuivant && motSuivant.donnees && this.estType(motSuivant.donnees, 'verbe') && this.estFormeInfinitive(motSuivant.texte, motSuivant.donnees));
            if (texteNorm === 'pres' && (texteSuivant === 'a' || texteSuivant === 'à' || suiteInfinitive)) {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_pres_pret',
                    position: i,
                    mot: mot.texte,
                    correction: 'prêt',
                    explication: 'Ici, le sens est "disponible / pret a...": il faut "prêt".',
                    regle: '"Prêt" signifie disponible (pret a partir). "Pres" / "pres" correspond a "près" (proximite).'
                }));
                continue;
            }

            if (texte === "d'" && texteSuivant === 'avantage') {
                const contexteComparatif = ['plus', 'moins', 'pas', 'encore', 'bien', 'beaucoup', 'si', 'toujours'].includes(textePrecedent)
                    || ['plus', 'moins', 'pas', 'encore', 'bien', 'beaucoup', 'si', 'toujours'].includes(texteDeuxAvant)
                    || /^(travaill|etud|progres|reussi)/.test(textePrecedent)
                    || /^(travaill|etud|progres|reussi)/.test(texteDeuxAvant);

                if (contexteComparatif) {
                    if (motSuivant) {
                        this.positionsIgnoreesErreursGeneriques.add(i + 1);
                    }
                    this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                        type: 'homophone_davantageapostrophe_davantage',
                        position: i,
                        indexDebut: i,
                        spanLongueur: 2,
                        mot: `${mot.texte} ${motSuivant ? motSuivant.texte : ''}`.trim(),
                        correction: 'davantage',
                        explication: 'Ici, on exprime "plus" : il faut le mot "davantage" en un seul bloc.',
                        regle: '"Davantage" signifie "plus". "D\'avantage" introduit plutot le nom "avantage".'
                    }));
                    continue;
                }
            }

            if (texte === 'davantage' && motSuivant && this.estType(motSuivant.donnees, 'nom') && texteSuivant !== 'de') {
                this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                    type: 'homophone_davantage_davantageapostrophe',
                    position: i,
                    mot: mot.texte,
                    correction: "d'avantage",
                    explication: 'Ici, on introduit le nom "avantage": la graphie attendue est "d\'avantage".',
                    regle: '"Davantage" = plus. "D\'avantage" = de + avantage (nom).'
                }));
                continue;
            }
        }
    }

    global.AbeHomophonesModules = global.AbeHomophonesModules || {};
    global.AbeHomophonesModules.appliquerPassage5 = appliquerPassage5;
})(typeof window !== 'undefined' ? window : globalThis);
