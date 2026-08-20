(function (global) {
    const api = {
        calculerAlignementLexical(tokensSaisis = [], tokensReference = []) {
            const saisis = this.extraireTokensLexicauxAvecMeta(tokensSaisis || []);
            const reference = this.extraireTokensLexicauxAvecMeta(tokensReference || []);
            const m = saisis.length;
            const n = reference.length;

            const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

            for (let i = 0; i <= m; i += 1) dp[i][0] = i;
            for (let j = 0; j <= n; j += 1) dp[0][j] = j;

            for (let i = 1; i <= m; i += 1) {
                for (let j = 1; j <= n; j += 1) {
                    const coutSub = saisis[i - 1].normalise === reference[j - 1].normalise ? 0 : 1;
                    const sub = dp[i - 1][j - 1] + coutSub;
                    const del = dp[i - 1][j] + 1;
                    const ins = dp[i][j - 1] + 1;
                    dp[i][j] = Math.min(sub, del, ins);
                }
            }

            const operations = [];
            let i = m;
            let j = n;

            while (i > 0 || j > 0) {
                const coutSub = (i > 0 && j > 0 && saisis[i - 1].normalise === reference[j - 1].normalise) ? 0 : 1;
                const peutSub = i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + coutSub;
                const peutDel = i > 0 && dp[i][j] === dp[i - 1][j] + 1;
                const peutIns = j > 0 && dp[i][j] === dp[i][j - 1] + 1;

                if (peutSub && coutSub === 0) {
                    operations.push({ type: 'match', saisiIndex: i - 1, referenceIndex: j - 1 });
                    i -= 1;
                    j -= 1;
                    continue;
                }

                // À coût égal, privilégier la substitution: cela garde un ancrage
                // mot-à-mot plus stable sur le corpus et évite des omissions
                // artificielles qui décalent les tuiles.
                if (peutSub) {
                    operations.push({ type: 'replace', saisiIndex: i - 1, referenceIndex: j - 1 });
                    i -= 1;
                    j -= 1;
                    continue;
                }

                if (peutIns && (!peutDel || dp[i][j - 1] <= dp[i - 1][j])) {
                    operations.push({ type: 'insert', saisiIndex: i, referenceIndex: j - 1 });
                    j -= 1;
                    continue;
                }

                if (peutDel) {
                    operations.push({ type: 'delete', saisiIndex: i - 1, referenceIndex: j });
                    i -= 1;
                    continue;
                }

                break;
            }

            operations.reverse();

            const divergentes = new Set();
            const omissions = [];

            operations.forEach((op) => {
                if (!op) return;

                if (op.type === 'insert') {
                    const ref = reference[op.referenceIndex] || null;
                    if (ref && Number.isInteger(ref.indexMot)) {
                        divergentes.add(ref.indexMot);
                        omissions.push({
                            indexMotOmis: ref.indexMot,
                            tokenAttendu: ref.token || null
                        });
                    }
                    return;
                }

                if (op.type === 'replace') {
                    const ref = reference[op.referenceIndex] || null;
                    if (ref && Number.isInteger(ref.indexMot)) {
                        divergentes.add(ref.indexMot);
                    }
                    return;
                }

                if (op.type === 'delete') {
                    const ref = reference[op.referenceIndex] || reference[op.referenceIndex - 1] || null;
                    if (ref && Number.isInteger(ref.indexMot)) {
                        divergentes.add(ref.indexMot);
                    }
                }
            });

            return {
                saisis,
                reference,
                operations,
                divergentes,
                omissions
            };
        },

        calculerPositionsDivergentesLexicales(tokensSaisis = [], tokensReference = []) {
            return this.calculerAlignementLexical(tokensSaisis, tokensReference).divergentes;
        },

        calculerPositionsDivergentesAvecOmissionLexicale(tokensSaisis = [], tokensReference = [], indexMotOmis = -1) {
            const divergentes = this.calculerAlignementLexical(tokensSaisis, tokensReference).divergentes;
            if (Number.isInteger(indexMotOmis) && indexMotOmis >= 0) {
                divergentes.add(indexMotOmis);
            }
            return divergentes;
        },

        detecterOmissionsMultiples(tokensSaisis = [], tokensReference = []) {
            return this.calculerAlignementLexical(tokensSaisis, tokensReference).omissions;
        },

        calculerPositionsDivergentesAvecOmissionsMultiples(tokensSaisis = [], tokensReference = [], omissions = []) {
            const divergentes = this.calculerAlignementLexical(tokensSaisis, tokensReference).divergentes;
            (omissions || []).forEach((omission) => {
                if (omission && Number.isInteger(omission.indexMotOmis)) {
                    divergentes.add(omission.indexMotOmis);
                }
            });
            return divergentes;
        },

        detecterOmissionUnMot(tokensSaisis = [], tokensReference = []) {
            const alignement = this.calculerAlignementLexical(tokensSaisis, tokensReference);
            if (!alignement || !Array.isArray(alignement.omissions)) return null;
            return alignement.omissions.length === 1 ? alignement.omissions[0] : null;
        }
    };

    global.AbeMainOralAlignment = api;
})(typeof window !== 'undefined' ? window : globalThis);
