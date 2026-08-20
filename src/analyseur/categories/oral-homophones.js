/**
 * Catégorie: dictionnaire et explications d'homophones pour la dictée orale.
 */
(function (global) {
    'use strict';

    const categories = global.AbeAnalyseurCategories = global.AbeAnalyseurCategories || {};

    const HOMOPHONES = {
        // --- mai / mais / mes ---
        'mai': { 'mais': { desc: 'conjonction', expl: '"Mais" est une conjonction qui introduit une opposition. "Mai" est le 5e mois de l\'année.', memo: '➡️ J\'écris "mais" → j\'exprime une opposition ou restriction → je peux dire "pourtant".\n💬 Exemple : "Il est petit mais rapide" → "Il est petit pourtant rapide" ✔.\n➡️ J\'écris "mai" → c\'est le mois de l\'année.' } },
        'mais': {
            'mai': { desc: 'nom (mois)', expl: '"Mai" est le 5e mois de l\'année. "Mais" est une conjonction d\'opposition (pourtant).', memo: '➡️ J\'écris "mai" → c\'est le mois du calendrier.\n➡️ J\'écris "mais" → je peux dire "pourtant".' },
            'mes': { desc: 'déterminant possessif', expl: '"Mes" est un déterminant possessif (mes livres = les miens). "Mais" est une conjonction d\'opposition (pourtant).', memo: '➡️ J\'écris "mes" → c\'est possessif → je peux dire "tes" ou "ses".\n💬 Exemple : "Mes affaires" → "Tes affaires" ✔.\n➡️ J\'écris "mais" → opposition → je peux dire "pourtant".\n💬 Exemple : "Fatigué mais content" → "Fatigué pourtant content" ✔.' }
        },
        'mes': { 'mais': { desc: 'conjonction', expl: '"Mais" est une conjonction d\'opposition (pourtant). "Mes" est un déterminant possessif pluriel (mes amis).', memo: '➡️ J\'écris "mais" → opposition → je peux dire "pourtant".\n💬 Exemple : "Il pleut mais il fait doux" → "Il pleut pourtant il fait doux" ✔.\n➡️ J\'écris "mes" → possessif pluriel → je peux dire "tes" ou "ses".\n💬 Exemple : "Mes clés" → "Tes clés" ✔.' } },

        // --- peu / peut / peux ---
        'peu': {
            'peut': { desc: 'verbe pouvoir (3e pers.)', expl: '"Peut" est le verbe "pouvoir" conjugué avec il/elle/on (il peut). "Peu" signifie une petite quantité.', memo: '➡️ J\'écris "peut" → c\'est le verbe pouvoir → je peux dire "pouvait".\n💬 Exemple : "Il peut venir" → "Il pouvait venir" ✔.\n➡️ J\'écris "peu" → c\'est une quantité → je peux dire "beaucoup".\n💬 Exemple : "Un peu de sucre" → "Un beaucoup de sucre" (sens gardé = quantité) ✔.' },
            'peux': { desc: 'verbe pouvoir (1re/2e pers.)', expl: '"Peux" est le verbe "pouvoir" avec je/tu (je peux, tu peux). "Peu" désigne une petite quantité.', memo: '➡️ J\'écris "peux" → avec je ou tu → je peux dire "pouvais".\n💬 Exemple : "Tu peux venir" → "Tu pouvais venir" ✔.\n➡️ J\'écris "peu" → quantité → je peux dire "beaucoup".' }
        },
        'peut': {
            'peu': { desc: 'adverbe de quantité', expl: '"Peu" désigne une petite quantité (inverse de beaucoup). "Peut" est le verbe pouvoir conjugué avec il/elle/on.', memo: '➡️ J\'écris "peu" → c\'est une quantité → je peux dire "beaucoup".\n💬 Exemple : "J\'ai peu de temps" → "J\'ai beaucoup de temps" ✔.\n➡️ J\'écris "peut" → c\'est le verbe pouvoir → je peux dire "pouvait".\n💬 Exemple : "Il peut réussir" → "Il pouvait réussir" ✔.' },
            'peux': { desc: 'verbe pouvoir (1re/2e pers.)', expl: '"Peux" s\'écrit avec -x avec je/tu. "Peut" s\'écrit avec -t avec il/elle/on.', memo: '➡️ J\'écris "peux" → sujet "je" ou "tu".\n➡️ J\'écris "peut" → sujet "il", "elle" ou "on".' }
        },
        'peux': {
            'peut': { desc: 'verbe pouvoir (3e pers.)', expl: '"Peut" s\'écrit avec -t avec il/elle/on (il peut). "Peux" s\'écrit avec -x avec je/tu (je peux, tu peux).', memo: '➡️ J\'écris "peut" → avec il/elle/on.\n➡️ J\'écris "peux" → avec je/tu.' },
            'peu': { desc: 'adverbe de quantité', expl: '"Peu" désigne une petite quantité. "Peux" est le verbe pouvoir.', memo: '➡️ J\'écris "peu" → je peux dire "beaucoup".' }
        },

        // --- ou / où ---
        'ou': { 'où': { desc: 'adverbe de lieu', expl: '"Où" (accent grave) indique un lieu ou un moment. "Ou" (sans accent) exprime un choix.', memo: '➡️ J\'écris "ou" → j\'exprime un choix → je peux dire "ou bien".\n💬 Exemple : "Fromage ou dessert" → "Fromage ou bien dessert" ✔.\n➡️ J\'écris "où" → j\'indique un lieu ou un temps → "ou bien" ne marche pas.\n💬 Exemple : "La ville où je suis né" → "La ville ou bien je suis né" ✗.' } },
        'où': { 'ou': { desc: 'conjonction de coordination', expl: '"Ou" (sans accent) exprime un choix ou une alternative. "Où" (avec accent) indique un lieu ou un moment.', memo: '➡️ J\'écris "ou" → j\'exprime un choix → je peux dire "ou bien".\n💬 Exemple : "Thé ou café" → "Thé ou bien café" ✔.\n➡️ J\'écris "où" → lieu ou temps → "ou bien" ne marche pas.\n💬 Exemple : "Où habites-tu ?" → "Ou bien habites-tu ?" ✗.' } },

        // --- son / sont / sons ---
        'son': {
            'sont': { desc: 'verbe être', expl: '"Sont" est le verbe "être" conjugué (ils/elles sont). "Son" est un déterminant possessif (son livre).', memo: '➡️ J\'écris "sont" → c\'est le verbe être → je peux dire "étaient".\n💬 Exemple : "Ils sont gentils" → "Ils étaient gentils" ✔.\n➡️ J\'écris "son" → c\'est un possessif → je peux dire "mon" ou "ton".\n💬 Exemple : "Il cherche son chat" → "Il cherche mon chat" ✔.' },
            'sons': { desc: 'nom pluriel', expl: '"Sons" est le pluriel de "son" (les sons musicaux). "Son" au singulier est un déterminant ou un bruit.', memo: '➡️ J\'écris "sons" → nom pluriel → précédé de les/des.' }
        },
        'sont': { 'son': { desc: 'déterminant possessif', expl: '"Son" est un déterminant possessif qui indique la possession. "Sont" est le verbe être (ils/elles sont).', memo: '➡️ J\'écris "son" → c\'est un possessif → je peux dire "mon" ou "ton".\n💬 Exemple : "Son sac" → "Mon sac" ✔.\n➡️ J\'écris "sont" → c\'est le verbe être → je peux dire "étaient".\n💬 Exemple : "Ils sont en retard" → "Ils étaient en retard" ✔.' } },
        'sons': { 'son': { desc: 'déterminant possessif', expl: '"Son" est un déterminant possessif singulier. "Sons" est un nom pluriel.', memo: '➡️ J\'écris "son" → je peux dire "mon" ou "ton".' } },

        // --- on / ont ---
        'on': { 'ont': { desc: 'verbe avoir', expl: '"Ont" est le verbe "avoir" conjugué (ils/elles ont). "On" est un pronom indéfini (on dit que...).', memo: '➡️ J\'écris "ont" → c\'est le verbe avoir → je peux dire "avaient".\n💬 Exemple : "Elles ont réussi" → "Elles avaient réussi" ✔.\n➡️ J\'écris "on" → c\'est un pronom → je peux dire "il" ou "elle".\n💬 Exemple : "On chante ensemble" → "Il chante ensemble" ✔.' } },
        'ont': { 'on': { desc: 'pronom indéfini', expl: '"On" est un pronom sujet qui désigne une ou plusieurs personnes. "Ont" est le verbe avoir (ils/elles ont).', memo: '➡️ J\'écris "on" → c\'est un pronom → je peux dire "il" ou "elle".\n💬 Exemple : "On frappe à la porte" → "Il frappe à la porte" ✔.\n➡️ J\'écris "ont" → c\'est le verbe avoir → je peux dire "avaient".\n💬 Exemple : "Ils ont froid" → "Ils avaient froid" ✔.' } },

        // --- et / est ---
        'et': { 'est': { desc: 'verbe être', expl: '"Est" est le verbe "être" conjugué (il/elle/on est). "Et" est une conjonction qui relie deux éléments.', memo: '➡️ J\'écris "est" → c\'est le verbe être → je peux dire "était".\n💬 Exemple : "La voiture est rouge" → "La voiture était rouge" ✔.\n➡️ J\'écris "et" → je relie deux éléments → je peux souvent dire "et puis".\n💬 Exemple : "Le chat et le chien" → "Le chat et puis le chien" ✔.' } },
        'est': { 'et': { desc: 'conjonction de coordination', expl: '"Et" relie deux éléments de même nature. "Est" est le verbe être conjugué (il/elle/on est).', memo: '➡️ J\'écris "et" → je relie deux éléments → je peux souvent dire "et puis".\n💬 Exemple : "Paul et Marie" → "Paul et puis Marie" ✔.\n➡️ J\'écris "est" → c\'est le verbe être → je peux dire "était".\n💬 Exemple : "Il est content" → "Il était content" ✔.' } },

        // --- c'est / s'est ---
        'c\'est': {
            's\'est': { desc: 'pronom réfléchi + verbe être', expl: '"S\'est" s\'emploie avec un verbe pronominal (il s\'est levé, elle s\'est trompée). "C\'est" signifie "cela est".', memo: '➡️ J\'écris "s\'est" → je peux souvent dire "s\'était" avec le verbe qui suit.\n💬 Exemple : "Il s\'est levé" → "Il s\'était levé" ✔.\n➡️ J\'écris "c\'est" → cela est → je peux dire "cela est".\n💬 Exemple : "C\'est joli" → "Cela est joli" ✔.' },
            'ses': { desc: 'déterminant possessif', expl: '"Ses" est un déterminant possessif devant un nom pluriel (ses affaires). "C\'est" = cela est.', memo: '➡️ J\'écris "ses" → je peux dire "mes" ou "tes".' },
            'ces': { desc: 'déterminant démonstratif', expl: '"Ces" est un déterminant démonstratif devant un nom pluriel (ces enfants). "C\'est" = cela est.', memo: '➡️ J\'écris "ces" → je peux dire "ce" au singulier.' }
        },
        's\'est': { 'c\'est': { desc: 'présentatif', expl: '"C\'est" signifie "cela est" (c\'est vrai, c\'est bien). "S\'est" s\'utilise avec un verbe pronominal (il s\'est ...).', memo: '➡️ J\'écris "c\'est" → je peux dire "cela est".\n💬 Exemple : "C\'est vrai" → "Cela est vrai" ✔.\n➡️ J\'écris "s\'est" → pronom réfléchi + verbe → je peux dire "s\'était".\n💬 Exemple : "Il s\'est trompé" → "Il s\'était trompé" ✔.' } },

        // --- ces / ses / c'est ---
        'ces': {
            'c\'est': { desc: 'présentatif (cela est)', expl: '"C\'est" = "cela est". "Ces" est un déterminant démonstratif (ces livres).', memo: '➡️ J\'écris "c\'est" → je peux dire "cela est" ou "c\'était".\n💬 Exemple : "C\'est beau" → "Cela est beau" ✔.\n➡️ J\'écris "ces" → devant un nom pluriel.' },
            'ses': { desc: 'déterminant possessif', expl: '"Ces" sert à montrer (ces chaussures). "Ses" exprime la possession (ses chaussures = les siennes).', memo: '➡️ J\'écris "ses" → c\'est possessif → je peux dire "mes" ou "tes".\n💬 Exemple : "Ses mains" → "Mes mains" ✔.\n➡️ J\'écris "ces" → c\'est démonstratif → je peux dire "ce", "cet" ou "cette" (au singulier).\n💬 Exemple : "Ces arbres" → "Cet arbre" ✔.' }
        },
        'ses': {
            'ces': { desc: 'déterminant démonstratif', expl: '"Ces" sert à montrer des choses ou personnes. "Ses" exprime la possession (les siennes).', memo: '➡️ J\'écris "ces" → c\'est démonstratif → je peux dire "ce", "cet" ou "cette" (singulier).\n💬 Exemple : "Ces fleurs" → "Cette fleur" ✔.\n➡️ J\'écris "ses" → c\'est possessif → je peux dire "mes" ou "tes".\n💬 Exemple : "Ses mains" → "Mes mains" ✔.' },
            'c\'est': { desc: 'présentatif (cela est)', expl: '"C\'est" = "cela est". "Ses" est un déterminant possessif devant un nom pluriel.', memo: '➡️ J\'écris "c\'est" → je peux dire "cela est" ou "c\'était".\n💬 Exemple : "C\'est vrai" → "Cela est vrai" ✔.' }
        },

        // --- ce / se / c'est ---
        'ce': {
            'se': { desc: 'pronom réfléchi', expl: '"Se" est un pronom réfléchi (il se lave). "Ce" est un déterminant démonstratif (ce jour).', memo: '➡️ J\'écris "se" → pronom réfléchi → je peux dire "me" ou "te" en changeant de personne.\n💬 Exemple : "Il se lave" → "Je me lave" ✔.\n➡️ J\'écris "ce" → démonstratif → je peux dire "un" ou "cet" (devant un nom) ou "cela" (devant être).\n💬 Exemple : "Ce chat dort" → "Un chat dort" ✔. "Ce sont mes amis" → "Cela sont mes amis" (idée de désignation).' },
            'c\'est': { desc: 'présentatif (cela est)', expl: '"C\'est" signifie "cela est". "Ce" est un déterminant devant un nom singulier.', memo: '➡️ J\'écris "c\'est" → je peux dire "cela est".' }
        },
        'se': {
            'ce': { desc: 'déterminant démonstratif', expl: '"Ce" sert à montrer (ce jour, ce sont…). "Se" est un pronom réfléchi devant un verbe (se laver).', memo: '➡️ J\'écris "ce" → démonstratif → je peux dire "un" ou "cet" (devant un nom) ou "cela" (devant être).\n💬 Exemple : "Ce chat" → "Un chat" ✔.\n➡️ J\'écris "se" → pronom réfléchi → je peux dire "me" ou "te".\n💬 Exemple : "Il se lave" → "Je me lave" ✔.' },
            'c\'est': { desc: 'présentatif (cela est)', expl: '"C\'est" signifie "cela est" (c\'est beau). "Se" est un pronom réfléchi.', memo: '➡️ J\'écris "c\'est" → je peux dire "cela est".' }
        },

        // --- la / là / l'a / l'as ---
        'la': { 'là': { desc: 'adverbe de lieu', expl: '"Là" (accent grave) indique un lieu ou un moment. "La" est un déterminant ou un pronom (je la vois).', memo: '➡️ J\'écris "la" → déterminant ou pronom → je peux dire "le", "ma" ou "ta".\n💬 Exemple : "La fleur" → "Ta fleur" ✔. "Je la regarde" → "Je le regarde" ✔.\n➡️ J\'écris "là" → lieu ou moment → je peux dire "ici".\n💬 Exemple : "Il est là" → "Il est ici" ✔.' } },
        'là': { 'la': { desc: 'déterminant ou pronom', expl: '"La" (sans accent) est un article ou un pronom féminin. "Là" (avec accent) indique un lieu.', memo: '➡️ J\'écris "là" → lieu ou moment → je peux dire "ici".\n💬 Exemple : "Reste là" → "Reste ici" ✔.\n➡️ J\'écris "la" → déterminant ou pronom → je peux dire "le", "ma" ou "ta".\n💬 Exemple : "La porte" → "Ta porte" ✔.' } },

        // --- ça / sa ---
        'ca': {
            'ça': { desc: 'pronom démonstratif', expl: '"Ça" (avec cédille) remplace "cela" (je fais ça). "Ca" sans cédille ne s\'utilise pas.', memo: '➡️ J\'écris "ça" → avec cédille → je peux dire "cela".' },
            'sa': { desc: 'déterminant possessif', expl: '"Sa" est un déterminant possessif (sa maison). "Ça" remplace "cela".', memo: '➡️ J\'écris "sa" → je peux dire "ma" ou "ta".' }
        },
        'ça': { 'sa': { desc: 'déterminant possessif', expl: '"Sa" est un déterminant possessif (sa maison). "Ça" remplace "cela".', memo: '➡️ J\'écris "sa" → possessif → je peux dire "ma" ou "ta".\n💬 Exemple : "Sa voiture" → "Ta voiture" ✔.\n➡️ J\'écris "ça" → pronom → je peux dire "cela".\n💬 Exemple : "Comment ça va ?" → "Comment cela va ?" ✔.' } },
        'sa': { 'ça': { desc: 'pronom démonstratif', expl: '"Ça" est une forme contractée de "cela". "Sa" est un déterminant possessif (la sienne).', memo: '➡️ J\'écris "ça" → pronom → je peux dire "cela".\n💬 Exemple : "Ça me fait plaisir" → "Cela me fait plaisir" ✔.\n➡️ J\'écris "sa" → possessif → je peux dire "ma" ou "ta".\n💬 Exemple : "Sa montre" → "Ta montre" ✔.' } },

        // --- a / à ---
        'a': { 'à': { desc: 'préposition', expl: '"À" (accent grave) est une préposition (aller à Paris). "A" est le verbe avoir conjugué (il a).', memo: '➡️ J\'écris "a" → c\'est le verbe avoir → je peux dire "avait".\n💬 Exemple : "Il a un vélo" → "Il avait un vélo" ✔.\n➡️ J\'écris "à" → c\'est une préposition → "avait" ne marche pas.\n💬 Exemple : "Je vais à l\'école" → "Je vais avait l\'école" ✗.' } },
        'à': { 'a': { desc: 'verbe avoir', expl: '"A" (sans accent) est le verbe avoir conjugué (il a). "À" (avec accent) est une préposition.', memo: '➡️ J\'écris "a" → c\'est le verbe avoir → je peux dire "avait".\n💬 Exemple : "Il a faim" → "Il avait faim" ✔.\n➡️ J\'écris "à" → c\'est une préposition → "avait" ne marche pas.\n💬 Exemple : "Aller à Paris" → "Aller avait Paris" ✗.' } },

        // --- soi / soit ---
        'soi': { 'soit': { desc: 'verbe être subjonctif', expl: '"Soit" est le verbe "être" au subjonctif présent (qu\'il soit). "Soi" est un pronom réfléchi (en soi, de soi).', memo: '➡️ J\'écris "soit" → c\'est le verbe être → je peux dire "était" ou "fût".' } },
        'soit': { 'soi': { desc: 'pronom réfléchi', expl: '"Soi" est un pronom réfléchi utilisé après un pronom indéfini (chacun pour soi). "Soit" est le verbe "être" au subjonctif (qu\'il soit).', memo: '➡️ J\'écris "soi" → pronom invariable (chacun pour soi, en soi).' } },

        // --- leur / leurs ---
        'leur': { 'leurs': { desc: 'déterminant possessif pluriel', expl: '"Leurs" s\'écrit avec un -s devant un nom pluriel (leurs affaires). "Leur" sans -s s\'emploie devant un nom singulier ou un verbe.', memo: '➡️ J\'écris "leurs" → devant un nom pluriel (leurs amis).\n➡️ J\'écris "leur" → devant un nom singulier (leur ami) ou devant un verbe (je leur parle).' } },
        'leurs': { 'leur': { desc: 'déterminant ou pronom singulier', expl: '"Leur" sans -s s\'emploie devant un nom singulier (leur maison) ou devant un verbe (il leur dit). "Leurs" est réservé au nom pluriel.', memo: '➡️ J\'écris "leur" → devant un verbe ou un nom singulier.' } },

        // --- quand / quant / qu'en ---
        'quand': { 'quant': { desc: 'locution prépositive', expl: '"Quant" (avec un t) s\'emploie toujours dans « quant à » ou « quant au » (pour ce qui est de). "Quand" indique le temps.', memo: '➡️ J\'écris "quant" → suivi de « à », « au » ou « aux » → signifie "pour ce qui est de".\n➡️ J\'écris "quand" → indique le temps → je peux dire "lorsque".' } },
        'quant': { 'quand': { desc: 'conjonction de temps', expl: '"Quand" (avec un d) exprime le moment ou le temps (lorsque). "Quant" (avec un t) s\'emploie seulement dans « quant à ».', memo: '➡️ J\'écris "quand" → je peux dire "lorsque".' } },

        // --- tout / tous / toute / toutes ---
        'tout': { 'tous': { desc: 'déterminant / pronom pluriel', expl: '"Tous" s\'écrit avec un -s devant un nom masculin pluriel (tous les jours). "Tout" s\'emploie au masculin singulier.', memo: '➡️ J\'écris "tous" → devant un nom pluriel masculin.\n➡️ J\'écris "tout" → devant un nom singulier (tout le monde).' } },
        'tous': { 'tout': { desc: 'déterminant singulier', expl: '"Tout" s\'emploie au singulier (tout le village). "Tous" est au pluriel.', memo: '➡️ J\'écris "tout" → singulier (tout le jour).' } }
    };

    /**
     * Homophones par motif (terminaisons) — s'appliquent à tous les verbes,
     * pas seulement à des mots individuels.
     * Chaque entrée détecte une confusion entre deux terminaisons partageant
     * la même racine.
     */
    const HOMOPHONES_MOTIFS = [
        {
            // --- er / é (infinitif / participe passé) ---
            saisieSuffixe: 'er',
            attenduSuffixe: 'é',
            desc: 'infinitif / participe passé',
            expl: 'Pour distinguer -er de -é, utilise le test du 3e groupe : remplace par un verbe comme "vendre" (infinitif) ou "vendu" (participe passé). Si "vendre" fonctionne → c\'est -er. Si "vendu" fonctionne → c\'est -é.',
            memo: '➡️ J\'écris "-er" → c\'est l\'infinitif → je peux dire "vendre" ou "mordre".\n💬 Exemple : "Il veut jouer" → "Il veut vendre" ✔.\n➡️ J\'écris "-é" → c\'est le participe passé → je peux dire "vendu" ou "mordu".\n💬 Exemple : "Il a joué" → "Il a vendu" ✔.'
        },
        {
            // --- é / er (participe passé / infinitif) ---
            saisieSuffixe: 'é',
            attenduSuffixe: 'er',
            desc: 'participe passé / infinitif',
            expl: 'Pour distinguer -é de -er, utilise le test du 3e groupe : remplace par un verbe comme "vendu" (participe passé) ou "vendre" (infinitif). Si "vendu" fonctionne → c\'est -é. Si "vendre" fonctionne → c\'est -er.',
            memo: '➡️ J\'écris "-é" → c\'est le participe passé → je peux dire "vendu" ou "mordu".\n💬 Exemple : "Il a joué" → "Il a vendu" ✔.\n➡️ J\'écris "-er" → c\'est l\'infinitif → je peux dire "vendre" ou "mordre".\n💬 Exemple : "Il veut jouer" → "Il veut vendre" ✔.'
        }
    ];

    /**
     * Mapping (saisi → attendu) → parcoursType.
     * Les noms doivent correspondre exactement aux clés du dictionnaire
     * « questions » dans pedagogie.js et aux types dans homophones.js.
     */
    const PARCOURS_TYPE_MAP = {
        'a→à':  'homophone_a_a_sans',
        'à→a':  'homophone_a_a_grave',
        'son→sont':   'homophone_son_sont',
        'sont→son':   'homophone_sont_son',
        'son→sons':   'homophone_son_sons',
        'sons→son':   'homophone_son_sons',
        'on→ont':     'homophone_on_ont',
        'ont→on':     'homophone_ont_on',
        'et→est':     'homophone_et_est',
        'est→et':     'homophone_est_et',
        'ce→se':      'homophone_ce_se',
        'se→ce':      'homophone_se_ce',
        'ce→c\'est':  'homophone_ce_cest',
        'se→c\'est':  'homophone_se_cest',
        'peu→peut':   'homophone_peu_peut',
        'peut→peu':   'homophone_peut_peu',
        'peux→peut':  'homophone_peux_peut',
        'peut→peux':  'homophone_peut_peux',
        'peu→peux':   'homophone_peu_peut',
        'peux→peu':   'homophone_peut_peu',
        'ou→où':      'homophone_ou_ou_grave',
        'où→ou':      'homophone_ou_grave_ou',
        'la→là':      'homophone_la_la_grave',
        'là→la':      'homophone_la_grave_la',
        'ces→ses':    'homophone_ces_ses',
        'ses→ces':    'homophone_ses_ces',
        'ces→c\'est': 'homophone_ces_cest',
        'ses→c\'est': 'homophone_ses_cest',
        'c\'est→ses': 'homophone_cest_ses',
        'c\'est→ces': 'homophone_ces_cest',
        'c\'est→s\'est': 'homophone_cest_sest',
        's\'est→c\'est': 'homophone_sest_cest',
        'sa→ça':      'homophone_sa_ca',
        'ça→sa':      'homophone_ca_sa',
        'ca→ça':      'homophone_ca_ca',
        'ca→sa':      'homophone_ca_sa',
        'mai→mais':   'homophone_mai_mais',
        'mais→mai':   'homophone_mai_mais',
        'mes→mais':   'homophone_mes_mais',
        'mais→mes':   'homophone_mais_mes',
        'soi→soit':   'homophone_soi_soit',
        'soit→soi':   'homophone_soit_soi',
        'leur→leurs': 'homophone_leur_leurs',
        'leurs→leur': 'homophone_leurs_leur',
        'quand→quant': 'homophone_quand_quant',
        'quant→quand': 'homophone_quand_quant',
        'tout→tous':  'homophone_tout_tous',
        'tous→tout':  'homophone_tout_tous'
    };

    /**
     * Génère un parcoursType à partir d'une paire d'homophones.
     * Utilise la table de mapping ci-dessus ; si la paire n'est pas listée,
     * construit un nom générique homophone_<saisi>_<attendu> normalisé.
     */
    function genererParcoursTypeHomophone(saisie, attendu) {
        const cle = saisie + '→' + attendu;
        if (PARCOURS_TYPE_MAP[cle]) return PARCOURS_TYPE_MAP[cle];
        // Fallback générique pour les paires non listées (ex: er/é)
        const norm = (s) => String(s || '')
            .toLowerCase()
            .replace(/[àâ]/g, 'a_grave')
            .replace(/[éèê]/g, 'e')
            .replace(/[ùû]/g, 'u')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9_]/g, '');
        return 'homophone_' + norm(saisie) + '_' + norm(attendu);
    }

    function enrichirExplicationHomophone(motSaisi, motAttendu, tokenCorpus = null) {
        const normaliserApostrophe = (s) => String(s || '').toLowerCase().replace(/[’]/g, "'");
        const motBase = normaliserApostrophe(motSaisi);
        const cible = normaliserApostrophe(motAttendu);

        // 1. Recherche dans le dictionnaire spécifique (mots individuels)
        if (HOMOPHONES[motBase] && HOMOPHONES[motBase][cible]) {
            const homo = HOMOPHONES[motBase][cible];
            const memo = homo.memo || `"${motAttendu}" s'écrit différemment de "${motSaisi}".`;
            return {
                explication: `⚠️ Attention aux homophones ! ${homo.expl}`,
                titreAide: 'Homophone (' + homo.desc + ')',
                memo,
                parcoursType: genererParcoursTypeHomophone(motBase, cible)
            };
        }

        // 2. Vérification via les métadonnées corpus (homophone_de)
        if (tokenCorpus && Array.isArray(tokenCorpus.homophone_de)) {
            const homophonesCorpus = tokenCorpus.homophone_de.map((h) => normaliserApostrophe(h));
            if (homophonesCorpus.includes(motBase)) {
                return {
                    explication: `⚠️ Attention aux homophones ! Le mot attendu est « ${motAttendu} » et non « ${motSaisi} ».`,
                    titreAide: 'Homophone',
                    memo: `Ces deux mots se prononcent de façon identique mais n'ont pas la même fonction ni la même orthographe.`,
                    parcoursType: genererParcoursTypeHomophone(motBase, cible)
                };
            }
        }

        // 3. Recherche par motif de terminaison (er/é, etc.)
        for (const motif of HOMOPHONES_MOTIFS) {
            if (!motBase.endsWith(motif.saisieSuffixe) || !cible.endsWith(motif.attenduSuffixe)) continue;
            const racineSaisie = motBase.slice(0, -motif.saisieSuffixe.length);
            const racineAttendu = cible.slice(0, -motif.attenduSuffixe.length);
            if (!racineSaisie || !racineAttendu || racineSaisie !== racineAttendu) continue;
            return {
                explication: `⚠️ Attention aux homophones ! ${motif.expl}`,
                titreAide: 'Homophone (' + motif.desc + ')',
                memo: motif.memo,
                parcoursType: genererParcoursTypeHomophone(motBase, cible)
            };
        }

        return null;
    }

    categories.enrichirExplicationHomophone = enrichirExplicationHomophone;
    categories.HOMOPHONES_ORAUX = HOMOPHONES;
})(typeof window !== 'undefined' ? window : globalThis);
