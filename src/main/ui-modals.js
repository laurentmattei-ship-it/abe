(function (global) {
    const api = {
        montrerModalAnalyse(message, progression = 0) {
            if (this.modalAnalyseTexte) {
                this.modalAnalyseTexte.textContent = message;
            }
            if (this.analyseProgressFill) {
                this.analyseProgressFill.style.width = `${Math.max(0, Math.min(100, progression))}%`;
            }
            if (this.modalAnalyse) {
                this.modalAnalyse.classList.remove('hidden');
            }
        },

        mettreAJourModalAnalyse(message, progression) {
            if (this.modalAnalyseTexte && message) {
                this.modalAnalyseTexte.textContent = message;
            }
            if (this.analyseProgressFill && typeof progression === 'number') {
                this.analyseProgressFill.style.width = `${Math.max(0, Math.min(100, progression))}%`;
            }
        },

        masquerModalAnalyse() {
            if (this.modalAnalyse) {
                this.modalAnalyse.classList.add('hidden');
            }
        },

        montrerModaleReinitialisation() {
            if (!this.modalReinitialisation) return;

            const restantes = this.obtenirErreursNonCorrigees().length;
            this.reinitialisationErreursRestantes = restantes;
            if (this.modalReinitialisationTexte) {
                this.modalReinitialisationTexte.textContent = `Il reste ${restantes} erreur(s) non corrigée(s). Veux-tu vraiment recommencer ?`;
            }

            this.modaleReinitialisationOuverte = true;
            this.modalReinitialisation.classList.remove('hidden');
        },

        fermerModaleReinitialisation() {
            if (this.modalReinitialisation) {
                this.modalReinitialisation.classList.add('hidden');
            }
            this.nettoyerEtatModaleReinitialisation();
        },

        montrerModalePhraseOrale(message) {
            if (this.modalPhraseOraleTexte) {
                this.modalPhraseOraleTexte.textContent = message || 'La phrase entrée ne correspond pas à la phrase dictée. Réécoute la dictée puis réessaie.';
            }
            if (this.modalPhraseOrale) {
                this.modalPhraseOrale.classList.remove('hidden');
            }
        },

        fermerModalePhraseOrale() {
            if (this.modalPhraseOrale) {
                this.modalPhraseOrale.classList.add('hidden');
            }
        },

        montrerModaleFelicitations() {
            if (this.modalFelicitations) {
                const statsEl = document.getElementById('modal-felicitations-stats');
                if (statsEl) {
                    const totalSession = typeof this.sessionTotalErreursCorrigees === 'number' ? this.sessionTotalErreursCorrigees : 0;
                    if (totalSession > 0) {
                        statsEl.innerHTML = `🌟 Tu as déjà corrigé <strong>${totalSession}</strong> erreur${totalSession > 1 ? 's' : ''} dans cette session !`;
                        statsEl.classList.remove('hidden');
                    } else {
                        statsEl.classList.add('hidden');
                    }
                }
                this.modalFelicitations.classList.remove('hidden');
            }
        },

        fermerModaleFelicitations() {
            if (this.modalFelicitations) {
                this.modalFelicitations.classList.add('hidden');
            }
        }
    };

    global.AbeMainUiModals = api;
})(typeof window !== 'undefined' ? window : globalThis);
