/**
 * Module d'analyse grammaticale pour l'application Abe
 * Détecte les erreurs courantes dans les phrases des élèves de 6ème
 */

class AnalyseurGrammatical {
    constructor() {
        this.dictionnaire = null;
        this.erreursTrouvees = [];
        this.phraseAnalysee = [];
        this.indexVariations = new Map();
        this.fautesLexicalesFrequentes = new Map();
        this.motifsErreursFrequentes = [];
        this.positionsIgnoreesErreursGeneriques = new Set();
        this.motsInvariables = this.initialiserMotsInvariables();
        this.expressionsInvariablesMultiMots = this.initialiserExpressionsInvariablesMultiMots();
        this.indexExpressionsInvariables = this.indexerExpressionsInvariablesMultiMots();
        this.lexiqueFigePrioritaire = this.initialiserLexiqueFigePrioritaire();
        this.correctionsLexicalesPrioritaires = this.initialiserCorrectionsLexicalesPrioritaires();
        this.locutionsOrales = this.initialiserLocutionsOrales();
        this.lettresFantomesFinales = this.initialiserLettresFantomesFinales();
        this.formesVerbalesUsuelles = this.initialiserFormesVerbalesUsuelles();
        this.reglesBescherelle = null;
        this.reglesBescherelleParType = {};
        this.fichesBescherelleParType = {};
        this.corpusBescherelleActif = false;
        this.frequencesUnigrammesBescherelle = new Map();
        this.frequencesBigrammesBescherelle = new Map();
        this.frequencesTrigrammesBescherelle = new Map();
        this.totalTokensBescherelle = 0;
        this.totalChunksBescherelle = 0;
        this.tailleVocabulaireBescherelle = 0;
        this.clefsDictionnaire = [];
        this.indexCandidatsCorrection = new Map();
        this.auxiliairesConj = new Set([
            'ai','as','a','avons','avez','ont',
            'avais','avait','avions','aviez','avaient',
            'aurai','auras','aura','aurons','aurez','auront',
            'suis','es','est','sommes','etes','sont',
            'etais','etait','etions','etiez','etaient',
            'fus','fut','fumes','futes','furent'
        ]);
        this.motsOuPlurielX = new Set(['bijou', 'caillou', 'chou', 'genou', 'hibou', 'joujou', 'pou']);
        this.exceptionsAuEauEuPlurielS = new Set(['bleu', 'pneu', 'landau', 'sarrau']);
        this.exceptionsAlPlurielS = new Set(['bal', 'carnaval', 'chacal', 'festival', 'récital', 'recital', 'régal', 'regal']);
        this.motsAilPlurielAux = new Set(['bail', 'corail', 'émail', 'email', 'soupirail', 'travail', 'vantail', 'vitrail']);
        this.explicationsEnrichies = this.chargerExplicationsEnrichies();
    }

    analyserPhrase(phrase) {
        this.erreursTrouvees = [];
        this.phraseAnalysee = this.tokeniser(phrase);
        this.positionsIgnoreesErreursGeneriques.clear();

        this.verifierErreursFrequentes();
        this.verifierInvariablesMultiMots();
        this.verifierLexiqueFigePrioritaire();
        this.verifierLocutionsEtOralite();
        this.verifierApostrophesObligatoires();
        this.verifierAccentsLexicauxFrequents();
        this.verifierMajusculeEtPonctuationFinale();
        this.verifierTraitUnionInversion();
        this.verifierNegationsIncompletes();
        this.verifierDeterminantChaqueInvariable();
        this.verifierPlurielsEnX();
        this.verifierOrthographeUsageAvancee();
        this.verifierAccordsComplexes();

        // Vérification des mots inconnus
        this.verifierMotsInconnus();
        
        // Analyse des différents types d'erreurs
        this.verifierAccordDeterminantNom();
        this.verifierQuantificateurNomNombre();
        this.verifierAccordSujetVerbe();
        this.verifierAccordAdjectifNom();
        this.verifierHomophonesContextuels();
        this.verifierCoherenceContextuelleBescherelle();
        this.verifierInfinitifApresPreposition();
        this.verifierFormeVerbaleApresAuxiliaire();
        this.verifierSubjonctifApresConjonction();
        this.epurerErreursVerbalesSecondaires();
        this.enrichirErreursAvecFichesBescherelle();
        this.enrichirErreursAvecContexteCorpusIntegral();
        this.enrichirErreursAvecNiveauxDetection();
        this.enrichirErreursAvecExperienceUtilisateur();
        this.enrichirErreursAvecExplicationsEnrichies();

        return {
            mots: this.phraseAnalysee,
            erreurs: this.erreursTrouvees,
            resumeDetection: this.construireResumeNiveauxDetection()
        };
    }

    async analyserPhraseProgressive(phrase, options = {}) {
        const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
        const pauseMs = Number.isFinite(options.pauseMs) ? Math.max(0, options.pauseMs) : 0;
        const pause = () => new Promise((resolve) => setTimeout(resolve, pauseMs));

        this.erreursTrouvees = [];
        this.phraseAnalysee = this.tokeniser(phrase);
        this.positionsIgnoreesErreursGeneriques.clear();

        const etapes = [
            () => {
                this.verifierErreursFrequentes();
                this.verifierInvariablesMultiMots();
                this.verifierLexiqueFigePrioritaire();
                this.verifierLocutionsEtOralite();
                this.verifierApostrophesObligatoires();
                this.verifierAccentsLexicauxFrequents();
            },
            () => {
                this.verifierMajusculeEtPonctuationFinale();
                this.verifierTraitUnionInversion();
                this.verifierNegationsIncompletes();
                this.verifierDeterminantChaqueInvariable();
                this.verifierPlurielsEnX();
            },
            () => {
                this.verifierOrthographeUsageAvancee();
                this.verifierAccordsComplexes();
                this.verifierMotsInconnus();
            },
            () => {
                this.verifierAccordDeterminantNom();
                this.verifierQuantificateurNomNombre();
                this.verifierAccordSujetVerbe();
                this.verifierAccordAdjectifNom();
            },
            () => {
                this.verifierHomophonesContextuels();
                this.verifierCoherenceContextuelleBescherelle();
                this.verifierInfinitifApresPreposition();
                this.verifierFormeVerbaleApresAuxiliaire();
                this.verifierSubjonctifApresConjonction();
            },
            () => {
                this.epurerErreursVerbalesSecondaires();
                this.enrichirErreursAvecFichesBescherelle();
                this.enrichirErreursAvecContexteCorpusIntegral();
                this.enrichirErreursAvecNiveauxDetection();
                this.enrichirErreursAvecExperienceUtilisateur();
                this.enrichirErreursAvecExplicationsEnrichies();
            }
        ];

        for (let i = 0; i < etapes.length; i += 1) {
            console.log('[DEBUG] analyserPhraseProgressive étape', i + 1, '/', etapes.length, 'START');
            etapes[i]();
            console.log('[DEBUG] analyserPhraseProgressive étape', i + 1, '/', etapes.length, 'DONE, erreurs:', this.erreursTrouvees.length);
            if (onProgress) {
                onProgress({
                    etape: i + 1,
                    totalEtapes: etapes.length
                });
            }
            await pause();
        }

        return {
            mots: this.phraseAnalysee,
            erreurs: this.erreursTrouvees,
            resumeDetection: this.construireResumeNiveauxDetection()
        };
    }
}

const _abeAnalyseurCoreMethods = (typeof window !== "undefined" && window.AbeAnalyseurCoreMethods)
    || (typeof globalThis !== "undefined" && globalThis.AbeAnalyseurCoreMethods)
    || null;
if (_abeAnalyseurCoreMethods) {
    Object.assign(AnalyseurGrammatical.prototype, _abeAnalyseurCoreMethods);
}

if (typeof window !== 'undefined') {
    window.AnalyseurGrammatical = AnalyseurGrammatical;
} else if (typeof globalThis !== 'undefined') {
    globalThis.AnalyseurGrammatical = AnalyseurGrammatical;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyseurGrammatical };
}

