(function (global) {
    const api = {
        mettreAJourProgression() {
            const total = this.erreurs.length;
            const corrigees = this.erreursCorrigees.size;

            this.errorsFound.textContent = corrigees;
            this.totalErrors.textContent = total;

            const pourcentage = total > 0 ? (corrigees / total) * 100 : 100;
            this.progressFill.style.width = `${pourcentage}%`;
        },

        afficherMessage(message, type) {
            const messageEl = document.createElement('div');
            messageEl.className = `feedback-message ${type}`;
            messageEl.textContent = message;
            messageEl.style.position = 'fixed';
            messageEl.style.bottom = '20px';
            messageEl.style.left = '20px';
            messageEl.style.zIndex = '1000';
            messageEl.style.maxWidth = '400px';
            messageEl.style.textAlign = 'left';
            messageEl.style.margin = '0';

            document.body.appendChild(messageEl);

            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 3000);
        },

        reinitialiser() {
            this.jeuInvariable.reinitialiser();
            this.phraseActuelle = '';
            this.motsAnalyse = [];
            this.erreurs = [];
            this.erreurActuelle = null;
            this.questionActuelle = 0;
            this.questionsAide = [];
            this.contexteAide = {};
            this.felicitationsEnAttente = false;
            this.erreursCorrigees.clear();
            this.essaisGuidesParErreur.clear();
            this.essaisDirectsParErreur.clear();

            this.sentenceInput.value = '';
            this.verrouillerSaisie();
            this.wordsContainer.innerHTML = '';
            this.wordInteraction.classList.add('hidden');
            this.correctionInput.classList.add('hidden');
            this.questionSection.classList.add('hidden');
            this.feedbackSection.classList.add('hidden');

            this.inputSection.classList.remove('hidden');
            this.tilesSection.classList.add('hidden');

            this.mettreAJourProgression();

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('abe-reinitialiser'));
            }
        }
    };

    global.AbeMainFeedbackReset = api;
})(typeof window !== 'undefined' ? window : globalThis);
