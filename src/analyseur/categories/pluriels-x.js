/**
 * Catégorie dédiée aux pluriels en -x.
 */
(function (global) {
    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    function verifierPlurielsEnX() {
        for (let i = 0; i < this.phraseAnalysee.length; i++) {
            const mot = this.phraseAnalysee[i];
            if (!mot || !mot.texte) continue;
            if (this.estPonctuationToken(mot.texte)) continue;
            if (this.positionsIgnoreesErreursGeneriques.has(i)) continue;
            if (Array.isArray(mot.erreurs) && mot.erreurs.length > 0) continue;

            const precedent = i > 0 ? this.phraseAnalysee[i - 1] : null;
            const precedentEstDet = this.estDeterminantNominalToken(precedent);
            const nombreDet = precedentEstDet && precedent && precedent.donnees
                ? this.normaliserNombre(precedent.donnees.nombre)
                : null;

            if (!precedentEstDet || nombreDet !== 'pluriel') continue;

            const attendu = this.trouverNomProbableApresDeterminant(mot.texte, precedent.donnees || { nombre: 'pluriel' });
            const regleX = attendu ? this.verifierPlurielEnX(mot.texte, attendu) : null;
            if (!regleX) continue;

            this.enregistrerErreurContextuelle(this.creerErreurContextuelle({
                type: regleX.type,
                position: i,
                mot: mot.texte,
                correction: regleX.correction,
                explication: regleX.explication,
                regle: regleX.regle
            }));
        }
    }

    categories.verifierPlurielsEnX = verifierPlurielsEnX;
})(typeof window !== 'undefined' ? window : globalThis);