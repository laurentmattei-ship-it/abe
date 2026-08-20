/**
 * Règle dédiée : "chaque" est invariable en genre et bloqué au singulier.
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierDeterminantChaqueInvariable() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;
            if (this.estPonctuationToken(mot.texte)) continue;

            const dejaSignale = Array.isArray(mot.erreurs)
                && mot.erreurs.some((erreur) => erreur && !['majuscule_phrase', 'ponctuation_finale'].includes(erreur.type));
            if (dejaSignale) continue;

            const texte = this.normaliserTexte(mot.texte || '');
            if (texte !== 'chaques') continue;

            const erreur = this.creerErreurContextuelle({
                type: 'mot_invariable',
                position: i,
                mot: mot.texte,
                correction: 'chaque',
                explication: 'Le déterminant "chaque" est invariable en genre et reste au singulier.',
                regle: 'On écrit "chaque" avec un nom singulier : chaque garçon, chaque fille. La forme "chaques" n’existe pas.',
                exemples: ['chaque garçon', 'chaque fille', 'chaque enfant joue'],
                memo: '"Chaque" ne prend jamais de s.',
                titreAide: 'Déterminant invariable'
            });

            this.enregistrerErreurContextuelle(erreur);
        }
    }

    categories.verifierDeterminantChaqueInvariable = verifierDeterminantChaqueInvariable;
})(typeof window !== 'undefined' ? window : globalThis);