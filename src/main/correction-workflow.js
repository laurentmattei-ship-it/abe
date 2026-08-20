(function (global) {
    const api = {
        incrementerEssaisGuideErreurActuelle() {
            const cle = this.obtenirCleErreur();
            if (!cle) return 0;
            const essais = (this.essaisGuidesParErreur.get(cle) || 0) + 1;
            this.essaisGuidesParErreur.set(cle, essais);
            return essais;
        },

        reinitialiserEssaisGuideErreurActuelle() {
            const cle = this.obtenirCleErreur();
            if (cle) {
                this.essaisGuidesParErreur.delete(cle);
            }
        },

        incrementerEssaisDirectErreurActuelle() {
            const cle = this.obtenirCleErreur();
            if (!cle) return 0;
            const essais = (this.essaisDirectsParErreur.get(cle) || 0) + 1;
            this.essaisDirectsParErreur.set(cle, essais);
            return essais;
        },

        reinitialiserEssaisDirectErreurActuelle() {
            const cle = this.obtenirCleErreur();
            if (cle) {
                this.essaisDirectsParErreur.delete(cle);
            }
        },

        appliquerCorrectionErreurCourante(correction) {
            if (!this.erreurActuelle || !correction) return null;
            const span = this.obtenirSpanErreur();
            if (!span) return null;

            const { debut, longueur } = span;

            if (['ponctuation_finale', 'reference_orale_mot_manquant'].includes(this.erreurActuelle.type)) {
                const attendu = String(this.erreurActuelle.correction || '').trim();
                const saisie = String(correction || '').trim();
                const estPonctuationFinale = this.erreurActuelle.type === 'ponctuation_finale';
                const valeurCorrigee = estPonctuationFinale
                    ? (() => {
                        const signeAttendu = /^[.?!]$/.test(attendu.slice(-1)) ? attendu.slice(-1) : '.';
                        return /^[.?!]$/.test(saisie)
                            ? saisie
                            : (/^[.?!]$/.test(saisie.slice(-1)) ? saisie.slice(-1) : signeAttendu);
                    })()
                    : (saisie || attendu);

                const cleErreur = this.obtenirCleErreur(this.erreurActuelle);
                if (cleErreur && !this.erreursCorrigees.has(cleErreur)) {
                    this.erreursCorrigees.add(cleErreur);
                    const uniqueKey = `${this.phraseActuelle}|${debut}|${this.erreurActuelle.type}`;
                    this.ajouterErreurCorrigeeSession(uniqueKey);
                }

                // Recherche robuste de la tuile extra dans le DOM sans dépendre de querySelector avec sélecteur complexe
                let tuileExtra = null;
                const container = this.wordsContainer || document.getElementById('words-container') || document;
                const tuiles = container.querySelectorAll('.word-tile');
                for (const t of tuiles) {
                    if (cleErreur && t.dataset.extraErrorKey === cleErreur) {
                        tuileExtra = t;
                        break;
                    }
                }
                if (!tuileExtra) {
                    if (estPonctuationFinale) {
                        tuileExtra = container.querySelector('.punctuation-missing-tile');
                    } else if (this.erreurActuelle.type === 'reference_orale_mot_manquant') {
                        tuileExtra = container.querySelector('.missing-word-tile');
                    }
                }

                if (tuileExtra) {
                    tuileExtra.classList.remove('error', 'selected', 'punctuation-wrong-tile');
                    tuileExtra.classList.add('corrected');
                    tuileExtra.style.animation = 'none';
                    tuileExtra.style.pointerEvents = 'none';
                    tuileExtra.textContent = valeurCorrigee;
                    if (estPonctuationFinale) {
                        tuileExtra.title = `Ponctuation finale corrigée : ${valeurCorrigee}`;
                        tuileExtra.setAttribute('aria-label', `Ponctuation finale corrigée : ${valeurCorrigee}`);
                    } else {
                        tuileExtra.title = `Mot manquant corrigé : ${valeurCorrigee}`;
                        tuileExtra.setAttribute('aria-label', `Mot manquant corrigé : ${valeurCorrigee}`);
                    }
                    tuileExtra.style.display = '';
                }

                return typeof debut === 'number' ? debut : 0;
            }

            const motsSource = [];
            for (let i = 0; i < longueur; i++) {
                const token = this.motsAnalyse[debut + i];
                if (token && token.texte) motsSource.push(token.texte);
            }
            const motFaux = this.erreurActuelle.mot || motsSource.join(' ');

            const premier = this.motsAnalyse[debut];
            if (!premier) return null;

            const correctionFinale = correction;

            const erreursAPreserver = Array.isArray(premier.erreurs)
                ? premier.erreurs.filter((erreur) => {
                    if (!erreur || this.estErreurCorrigee(erreur) || erreur === this.erreurActuelle) return false;
                    if (!['ponctuation_finale', 'majuscule_phrase'].includes(erreur.type)) return false;
                    if (erreur.type === 'majuscule_phrase' && /^[A-ZÀÂÉÈÊËÎÏÔÛÙÜŸŒÆ]/.test(correctionFinale)) {
                        const cle = this.obtenirCleErreur(erreur);
                        if (cle && !this.erreursCorrigees.has(cle)) {
                            this.erreursCorrigees.add(cle);
                        }
                        return false;
                    }
                    return true;
                })
                : [];
            premier.texte = correctionFinale;
            premier.donnees = this.analyseur ? this.analyseur.getWordData(correctionFinale) : premier.donnees;
            premier.erreurs = erreursAPreserver;

            for (let i = 1; i < longueur; i++) {
                const token = this.motsAnalyse[debut + i];
                if (!token) continue;
                token.texte = '';
                token.donnees = null;
                token.erreurs = [];
            }

            const cleErreur = this.obtenirCleErreur(this.erreurActuelle);
            if (cleErreur && !this.erreursCorrigees.has(cleErreur)) {
                this.erreursCorrigees.add(cleErreur);
                const uniqueKey = `${this.phraseActuelle}|${debut}|${this.erreurActuelle.type}`;
                this.ajouterErreurCorrigeeSession(uniqueKey);
            }

            const tuile = document.querySelector(`[data-index="${debut}"]`);
            if (tuile) {
                tuile.innerHTML = '';

                const faux = document.createElement('span');
                faux.className = 'mot-barre';
                faux.textContent = motFaux;
                tuile.appendChild(faux);

                const separateur = document.createElement('span');
                separateur.className = 'mot-separateur';
                separateur.textContent = '/';
                tuile.appendChild(separateur);

                const juste = document.createElement('span');
                juste.className = 'mot-corrige';
                juste.textContent = correctionFinale;
                tuile.appendChild(juste);

                tuile.classList.remove('error', 'selected', 'initial-cap-alert');
                tuile.classList.add('corrected');

                const erreursRestantes = Array.isArray(premier.erreurs)
                    ? premier.erreurs.filter((erreur) => !this.estErreurCorrigee(erreur) && erreur.type !== 'ponctuation_finale')
                    : [];
                if (erreursRestantes.length > 0) {
                    tuile.classList.add('error');
                    if (erreursRestantes.some((e) => e.type === 'majuscule_phrase')) {
                        tuile.classList.add('initial-cap-alert');
                    }
                }
                tuile.style.pointerEvents = erreursRestantes.length > 0 ? 'auto' : 'none';
            }

            for (let i = 1; i < longueur; i++) {
                const tuileConsommee = document.querySelector(`[data-index="${debut + i}"]`);
                if (!tuileConsommee) continue;
                tuileConsommee.classList.remove('error', 'selected');
                tuileConsommee.style.pointerEvents = 'none';
                tuileConsommee.style.display = 'none';
            }

            return debut;
        },

        selectionnerErreurDirecte(erreur, tuileElement = null) {
            if (!erreur) return;
            const nouvelleCle = this.obtenirCleErreur(erreur);
            if (!nouvelleCle) return;

            if (this.erreursCorrigees.has(nouvelleCle)) {
                this.afficherMessage('Cette erreur a déjà été corrigée !', 'info');
                return;
            }

            if (this.correctionEnCoursCle && this.correctionEnCoursCle !== nouvelleCle) {
                this.reinitialiserFluxCorrection();
            }

            this.erreurActuelle = erreur;
            this.erreurActuelle.indexMot = typeof erreur.indexDebut === 'number'
                ? erreur.indexDebut
                : erreur.position;
            this.correctionEnCoursCle = nouvelleCle;

            document.querySelectorAll('.word-tile').forEach((t) => t.classList.remove('selected'));
            if (tuileElement) {
                tuileElement.classList.add('selected');
            } else if (typeof this.erreurActuelle.indexMot === 'number') {
                const tuileMot = document.querySelector(`[data-index="${this.erreurActuelle.indexMot}"]`);
                if (tuileMot) tuileMot.classList.add('selected');
            }

            this.wordInteraction.classList.remove('hidden');
            this.correctionInput.classList.add('hidden');
            this.rendreActionsRapides();

            const tuileCible = tuileElement || document.querySelector(`[data-index="${this.erreurActuelle.indexMot}"]`);
            if (tuileCible && this.erreurActuelle.type === 'confusion_phonographique') {
                const repere = this.detecterRepereVisuelErreur(this.erreurActuelle);
                if (repere && /boucle/.test(repere)) {
                    tuileCible.classList.add('mirror-confusion');
                }
            }
            if (tuileCible && this.erreurActuelle.type === 'metathese') {
                tuileCible.classList.add('metathese-focus');
            }

            if (this.erreurActuelle.type === 'reference_orale_mot_manquant') {
                this.demarrerAide();
            }
        }
    };

    global.AbeMainCorrectionWorkflow = api;
})(typeof window !== 'undefined' ? window : globalThis);
