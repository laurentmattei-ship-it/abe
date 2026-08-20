/**
 * Cat?gorie: Homophones contextuels
 * Orchestrateur modulaire (r?gles r?parties dans src/homophones/).
 */
(function (global) {
    function verifierHomophonesContextuels() {
        const modules = global.AbeHomophonesModules || {};
        const pipeline = [
            modules.appliquerPassage1,
            modules.appliquerPassage2,
            modules.appliquerPassage3,
            modules.appliquerPassage4,
            modules.appliquerPassage5
        ];

        for (const etape of pipeline) {
            if (typeof etape === 'function') {
                etape.call(this);
            }
        }
    }

    global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};
    global.AbeAnalyseurCategories.verifierHomophonesContextuels = verifierHomophonesContextuels;
})(typeof window !== 'undefined' ? window : globalThis);
