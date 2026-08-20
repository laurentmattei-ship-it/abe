(function (global) {
const EXEMPLES_PAR_TYPE = {
    'accord_determinant_nom': [
        'le petit chien → déterminant singulier + nom singulier',
        'les petits chiens → déterminant pluriel + nom pluriel',
        'une grande maison → déterminant féminin singulier + nom féminin singulier'
    ],
    'accord_sujet_verbe': [
        'Le cheval mange. → qui mange ? le cheval (singulier)',
        'Les enfants jouent. → qui joue ? les enfants (pluriel)',
        'Elles sont belles. → qui est beau ? elles (pluriel)'
    ],
    'accord_adjectif_nom': [
        'un petit ruisseau → ruisseau = masculin singulier → petit',
        'une grande maison → maison = féminin singulier → grande',
        'des fruits verts → fruits = masculin pluriel → verts',
        'Erreur fréquente : une maison grand → une maison grande'
    ],
    'conjugaison_verbe': [
        'Après "je" : toujours -e ou -s (je mange, je lis)',
        'Après "tu" : toujours -s (tu manges, tu lis)',
        'Après "il/elle" : jamais de -s (il mange, elle lit)'
    ],
    'verbe_infinitif_requis': [
        'je vais manger → "manger" = infinitif ✓',
        'tu peux partir → "partir" = infinitif ✓',
        'il veut jouer → "jouer" = infinitif ✓'
    ],
    'accent_lexical': [
        'foret → forêt (accent circonflexe manquant)',
        'eleve → élève (accent aigu manquant)',
        'tres → très (accent grave manquant)'
    ],
    'verbe_participe_requis': [
        "j'ai mangé → auxiliaire avoir + participe passé",
        'elle est partie → auxiliaire être + participe passé (accord avec le sujet)',
        'les fleurs que j\'ai cueillies → avec avoir, accord si le COD est avant le verbe',
        'erreur fréquente : les robes qu\'elle a acheté → les robes qu\'elle a achetées'
    ],
    'accord_nom_nombre': [
        'le chien → nom singulier après déterminant singulier',
        'les chiens → nom pluriel après déterminant pluriel',
        'Erreur fréquente : le petits chien / le petit chiens'
    ],
    'homophone_sa_ca': [
        '"Ça marche" → cela marche ✓',
        '"sa voiture" → ma/ton voiture ✓',
        '"Ça va bien" → cela va bien ✓'
    ],
    'homophone_ca_sa': [
        '"sa maison" → ma/ton maison ✓ → "sa"',
        '"son cahier" → mon/ton cahier ✓ → "son"',
        '"ses livres" → mes/tes livres ✓ → "ses"'
    ],
    'homophone_ces_cest': [
        '"C\'est beau" → cela est beau ✓',
        '"Ces élèves" → devant un nom pluriel',
        '"Ces livres sont lourds." → devant un nom pluriel'
    ],
    'homophone_a_a_grave': [
        '"il a retrouvé" → il avait retrouvé ✓ → "a"',
        '"il a faim" → il avait faim ✓ → "a"',
        '"il a bien travaillé" → il avait bien travaillé ✓ → "a"'
    ],
    'homophone_a_a_sans': [
        '"à l\'école" → indique un lieu → "à"',
        '"il pense à toi" → complément → "à"',
        '"apprend à lire" → devant un infinitif → "à"'
    ],
    'homophone_et_est': [
        '"il est fatigué" → il était fatigué ✓ → "est"',
        '"elle est belle" → elle était belle ✓ → "est"',
        '"la maison est grande" → était grande ✓ → "est"'
    ],
    'homophone_est_et': [
        '"des livres et des cahiers" → relie deux noms → "et"',
        '"toi et moi" → relie deux pronoms → "et"',
        '"grand et fort" → relie deux adjectifs → "et"'
    ],
    'homophone_son_sont': [
        '"ils sont arrivés" → ils étaient arrivés ✓ → "sont"',
        '"elles sont belles" → elles étaient belles ✓ → "sont"',
        '"son cahier" → mon/ton cahier ✓ → "son"'
    ],
    'homophone_sont_son': [
        '"son cahier" → mon/ton cahier ✓ → "son"',
        '"son stylo" → mon/ton stylo ✓ → "son"',
        '"son chien" → mon/ton chien ✓ → "son"'
    ],
    'homophone_ou_ou_grave': [
        '"où vas-tu ?" → lieu → "où"',
        '"on se retrouve où ?" → lieu → "où"',
        '"c\'est toi ou moi ?" → choix → "ou"'
    ],
    'homophone_ou_grave_ou': [
        '"guitare ou piano ?" → choix → "ou"',
        '"toi ou moi" → choix → "ou"',
        '"vrai ou faux ?" → choix → "ou"'
    ],
    'homophone_ce_se': [
        '"il se lave" → devant verbe pronominal → "se"',
        '"elle se réveille" → devant verbe pronominal → "se"',
        '"il se lève tôt" → devant verbe pronominal → "se"'
    ],
    'homophone_se_ce': [
        '"ce livre" → devant nom → "ce"',
        '"ce matin" → devant nom → "ce"',
        '"ce garçon" → devant nom → "ce"'
    ],
    'homophone_on_ont': [
        '"ils ont travaillé" → ils avaient travaillé ✓ → "ont"',
        '"elles ont fini" → elles avaient fini ✓ → "ont"',
        '"ils ont mangé" → ils avaient mangé ✓ → "ont"'
    ],
    'homophone_ont_on': [
        '"on mange" → tu manges ✓ → "on"',
        '"on s\'appelle" → tu t\'appelles ✓ → "on"',
        '"on part demain" → tu pars ✓ → "on"'
    ],
    'homophone_leur_leurs': [
        '"leurs chiens" → nom pluriel → "leurs"',
        '"leurs livres" → nom pluriel → "leurs"',
        '"leur chien" → nom singulier → "leur"'
    ],
    'homophone_leurs_leur': [
        '"leur chien" → nom singulier → "leur"',
        '"leur maison" → nom singulier → "leur"',
        '"leurs chiens" → nom pluriel → "leurs"'
    ],
    'homophone_se_cest': [
        '"c\'est beau" → cela est beau ✓ → "c\'est"',
        '"c\'est vrai" → cela est vrai ✓ → "c\'est"',
        '"c\'est magnifique" → cela est magnifique ✓ → "c\'est"'
    ],
    'homophone_ce_cest': [
        '"c\'est beau" → cela est beau ✓ → "c\'est"',
        '"ce livre" → devant nom → "ce"',
        '"c\'est comme ça" → cela est comme ça ✓ → "c\'est"'
    ],
    'homophone_ses_cest': [
        '"c\'est beau" → cela est beau ✓ → "c\'est"',
        '"ses livres" → mes/tes livres ✓ → "ses"',
        '"ses amis" → mes/tes amis ✓ → "ses"'
    ],
    'homophone_peut_peu': [
        '"un peu d\'argent" → quantité → "peu"',
        '"très peu de temps" → quantité → "peu"',
        '"j\'ai peu mangé" → quantité → "peu"'
    ],
    'homophone_peu_peut': [
        '"il peut venir" → verbe pouvoir → "peut"',
        '"elle peut partir" → verbe pouvoir → "peut"',
        '"il se peut qu\'il pleuve" → verbe pouvoir → "peut"'
    ],
    'homophone_ni_ny': [
        '"je n\'y vais pas" → ne...y → "n\'y"',
        '"il n\'y pense plus" → ne...y → "n\'y"',
        '"ni l\'un ni l\'autre" → coordination → "ni"'
    ],
    'homophone_mais_mes': [
        '"mes guitares sont belles" → ma guitare → "mes"',
        '"mes amis" → mon ami → "mes"',
        '"mes livres" → mon livre → "mes"'
    ],
    'homophone_mes_mais': [
        '"gentil mais fatigant" → opposition → "mais"',
        '"beau mais froid" → opposition → "mais"',
        '"simple mais efficace" → opposition → "mais"'
    ],
    'homophone_la_grave_la': [
        '"la maison" → devant nom féminin → "la"',
        '"il la voit" → pronom COD → "la"',
        '"je la connais" → pronom COD → "la"'
    ],
    'homophone_la_la_grave': [
        '"reviens là" → remplace par "ici" ✓ → "là"',
        '"passe par là" → indique un lieu → "là"',
        '"il n\'est pas là" → indique un lieu → "là"'
    ],
    'homophone_ta_tas': [
        '"ta trousse" → ma/ton trousse ✓ → "ta"',
        '"ta gomme" → ma/ton gomme ✓ → "ta"',
        '"ta sœur" → ma/ton sœur ✓ → "ta"'
    ],
    'homophone_quand_quant': [
        '"quant à eux" → pour ce qui est d\'eux → "quant"',
        '"quant au résultat" → pour ce qui est du résultat → "quant"',
        '"quand reviendras-tu ?" → exprime le temps → "quand"'
    ],
    'homophone_tout_tous': [
        '"tous les garçons" → masculin pluriel → "tous"',
        '"tous les livres" → masculin pluriel → "tous"',
        '"tout le monde" → singulier → "tout"'
    ],
    'mot_invariable': [
        'Il faut les mémoriser !'
    ],
    'invariable_s_fantome': [
        'toujour → toujours',
        'parfoi → parfois',
        'alor → alors'
    ],
    'mot_liaison_lexical': [
        "dabord → d'abord",
        'pourtan → pourtant',
        'dorenavant → dorénavant'
    ],
    'locution_mal_segmentee': [
        'parceque → parce que',
        'peutetre → peut-être',
        'toutacou → tout à coup'
    ],
    'oralite_familiere': [
        "y'a → il y a",
        "c'est pas → ce n'est pas",
        'chais pas → je ne sais pas'
    ],
    'segmentation_mot_colle': [
        "lami → l'ami",
        'ilya → il y a',
        "cest → c'est"
    ],
    'metathese': [
        'formage → fromage',
        'spectale → spectacle',
        'frabique → fabrique'
    ],
    'lettre_fantome_finale': [
        'cha → chat',
        'blan → blanc',
        'lon → long'
    ],
    'confusion_phonographique': [
        'foto → photo (f/ph)',
        'balon → ballon (consonne double)',
        'poison → poisson (s/ss)'
    ],
    'apostrophe_obligatoire': [
        'j ai → j\'ai',
        'c est → c\'est',
        'l enfant → l\'enfant'
    ],
    'accent_lexical': [
        'tres → très',
        'apres → après',
        'deja → déjà'
    ],
    'majuscule_phrase': [
        'je pars. → Je pars.',
        'les enfants jouent. → Les enfants jouent.',
        'aujourd\'hui, ... → Aujourd\'hui, ...'
    ],
    'ponctuation_finale': [
        'Il mange → Il mange.',
        'Tu viens → Tu viens ?',
        'Comme c\'est beau → Comme c\'est beau !'
    ],
    'negation_incomplete': [
        'il a pas vu → il n\'a pas vu',
        'je veux plus → je ne veux plus',
        'on mange jamais → on ne mange jamais'
    ],
    'homophone_ses_ces': [
        '"ces livres" → on montre ces livres-là',
        '"ses livres" → les siens, les miens',
        '"Ces enfants jouent." → "Ses enfants jouent."'
    ],
    'homophone_ces_ses': [
        '"ses cahiers" → mes/tes cahiers ✓ → "ses"',
        '"ces cahiers" → ces cahiers-là → "ces"',
        '"Paul range ses affaires." → mon/ton ✓'
    ],
    'homophone_ma_ma_verbe': [
        '"Il m\'a dit bonjour." → m\'avait dit ✓',
        '"Ma trousse est là." → ma = déterminant',
        '"Elle m\'a vu." → m\'avait vu ✓'
    ],
    'homophone_mon_mont': [
        '"Ils m\'ont aidé." → ils m\'avaient aidé ✓',
        '"Mon cahier." → mon = déterminant',
        '"Elles m\'ont appelé." → m\'avaient ✓'
    ],
    'homophone_ton_tont': [
        '"Ils t\'ont vu." → ils t\'avaient vu ✓',
        '"Ton livre est là." → ton = déterminant',
        '"Elles t\'ont appelé." → t\'avaient ✓'
    ],
    'homophone_la_lapostrophe': [
        '"Il l\'a pris." → il l\'avait pris ✓',
        '"Tu l\'as vu ?" → tu l\'avais vu ✓',
        '"La maison est grande." → la = article'
    ],
    'homophone_cest_sest': [
        '"Il s\'est levé." → forme pronominale',
        '"C\'est beau." → cela est beau ✓',
        '"Elle s\'est cachée." → forme pronominale'
    ],
    'homophone_quant_quen': [
        '"Qu\'en penses-tu ?" → que + en',
        '"Quant à lui, il vient." → pour ce qui est de lui',
        '"Qu\'en dis-tu ?" → que + en'
    ],
    'homophone_quand_quen': [
        '"Qu\'en penses-tu ?" → que + en',
        '"Quand viens-tu ?" → exprime le temps',
        '"Qu\'en dis-tu ?" → que + en'
    ],
    'homophone_peux_peut': [
        '"Je peux venir." → je',
        '"Tu peux sortir." → tu',
        '"Il peut partir." → il'
    ],
    'homophone_peut_peux': [
        '"Je peux venir." → je',
        '"Tu peux essayer." → tu',
        '"Il peut marcher." → il'
    ],
    'homophone_tout_toute': [
        '"toute la classe" → féminin singulier',
        '"toutes les filles" → féminin pluriel',
        '"tout le monde" → masculin singulier'
    ],
    'homophone_notre_notreaccent': [
        '"Notre maison" → devant nom',
        '"La nôtre" → après article, avec accent',
        '"Le vôtre" → après article, avec accent'
    ],
    'homophone_quel_quelle_quelleapostrophe': [
        '"Quelle belle maison !" → devant nom',
        '"Je veux qu\'elle vienne." → que + elle',
        '"Je pense qu\'elles arrivent." → que + elles'
    ]
};


/**
 * Mémos synthétiques affichés après la correction — une ligne à retenir
 */
const MEMOS_PAR_TYPE = {
    'accord_sujet_verbe':       "Le verbe s'accorde toujours avec son sujet.",
    'accord_adjectif_nom':      "L'adjectif s'accorde en genre et en nombre avec le nom qu'il qualifie : masculin/féminin, singulier/pluriel.",
    'accord_determinant_nom':   "Le déterminant et le nom vont ensemble : même genre et même nombre.",
    'conjugaison_verbe':        'Après "je" : -e/-s. Après "tu" : toujours -s. Après "il/elle" : jamais de -s.',
    'verbe_infinitif_requis':   'Après aller, vouloir, pouvoir, devoir... → infinitif (manger, partir).',
    'accent_lexical':           "Les accents font partie de l'orthographe du mot : il faut les mémoriser.",
    'verbe_participe_requis':   'Participe passé : avec être, accord avec le sujet ; avec avoir, accord seulement si le COD est placé avant.',
    'homophone_a_a_grave':      'Astuce : remplace par "avait". Si ça marche → "a" (verbe). Sinon → "à".',
    'homophone_a_a_sans':       '"À" (accent) indique un lieu, un temps ou un complément.',
    'homophone_et_est':         'Remplace par "était". Si ça marche → "est" (être). Pour relier → "et".',
    'homophone_est_et':         '"Et" relie deux éléments. "Est" = verbe être (teste : remplace par "était").',
    'homophone_son_sont':       '"Sont" = avec ils/elles (remplace par "étaient"). "Son" = devant un nom.',
    'homophone_sont_son':       '"Son" = déterminant (teste avec "mon"). "Sont" = verbe être (ils/elles).',
    'homophone_on_ont':         '"Ont" = ils/elles avaient ✓. "On" = pronom sujet (teste avec "tu").',
    'homophone_ont_on':         '"On" = pronom sujet (teste avec "tu"). "Ont" = verbe avoir (ils/elles).',
    'homophone_ou_ou_grave':    '"Où" (accent) = lieu ou temps. "Ou" (sans accent) = choix.',
    'homophone_ou_grave_ou':    '"Ou" (sans accent) = choix. "Où" (accent) = lieu ou temps.',
    'homophone_ce_se':          '"Se" devant un verbe pronominal. "Ce" devant un nom.',
    'homophone_se_ce':          '"Ce" devant un nom. "Se" devant un verbe pronominal.',
    'homophone_peu_peut':       '"Peu" = quantité (un peu, très peu). "Peut" = verbe pouvoir (il/elle/on).',
    'homophone_peut_peu':       '"Peut" = verbe pouvoir (il/elle/on). "Peu" = quantité.',
    'homophone_leur_leurs':     '"Leurs" devant un nom pluriel. "Leur" devant un nom singulier.',
    'homophone_leurs_leur':     '"Leur" devant un nom singulier. "Leurs" devant un nom pluriel.',
    'homophone_mais_mes':       '"Mes" = déterminant pluriel (teste au singulier). "Mais" = opposition.',
    'homophone_mes_mais':       '"Mais" exprime une opposition. "Mes" = déterminant pluriel.',
    'homophone_la_la_grave':    '"Là" (accent) = lieu (remplace par "ici"). "La" = devant nom ou pronom.',
    'homophone_la_grave_la':    '"La" = devant nom féminin ou pronom. "Là" = lieu (remplace par "ici").',
    'homophone_ta_tas':         '"Ta" = déterminant (teste avec "ma"). "T\'as" = tu as.',
    'homophone_quand_quant':    '"Quant à/au/aux" = pour ce qui est de. "Quand" = exprime le temps.',
    'homophone_tout_tous':      '"Tous" devant un nom masculin pluriel. "Tout" devant un nom singulier.',
    'mot_inconnu':              "Pense aux mots de la même famille pour retrouver l'orthographe.",
    'mot_invariable':           'Ce mot invariable garde toujours la même forme : mémorise-le !',
    'invariable_s_fantome':     'Certains mots gardent toujours leur s final, même quand on ne l’entend pas.',
    'mot_liaison_lexical':      'Les mots de liaison organisent les idées : on mémorise leur orthographe exacte.',
    'locution_mal_segmentee':   'Une locution est une expression toute prête : on retient aussi sa bonne découpe.',
    'oralite_familiere':        'À l’écrit scolaire, on développe les formes orales raccourcies.',
    'segmentation_mot_colle':   'Quand un mot est collé, on remet les bons espaces ou la bonne apostrophe.',
    'metathese':                'Si deux lettres se croisent, on les remet dans le bon ordre pour retrouver l’image du mot.',
    'lettre_fantome_finale':    'Certaines lettres finales se cachent à l’oreille, mais réapparaissent dans un mot de la même famille.',
    // Nouveaux types ajoutés
    'confusion_phonographique': 'Certains sons s\'écrivent de plusieurs façons. Il faut mémoriser la bonne orthographe : photo, ballon, poisson…',
    'apostrophe_obligatoire':   'Devant une voyelle ou un h muet, certains petits mots s\'élident avec une apostrophe : j\'ai, l\'enfant, c\'est…',
    'accent_lexical':           'Les accents font partie de l\'orthographe : très, après, déjà, voilà… Il faut les mémoriser.',
    'majuscule_phrase':         'On met toujours une majuscule au premier mot d\'une phrase.',
    'ponctuation_finale':       'Une phrase se termine par un point, un point d\'interrogation ou un point d\'exclamation.',
    'negation_incomplete':      'Dans l\'écrit soigné, la négation est complète : ne/n\' … pas, jamais, plus, rien, personne…',
    'accord_nom_nombre':        'Le nom prend le nombre du déterminant : un/le = singulier, des/les = pluriel.',
    // Nouveaux homophones
    'homophone_ses_ces':        '"Ces" sert à montrer (ces enfants). "Ses" exprime la possession (les siens).',
    'homophone_ces_ses':        '"Ses" = possession (remplace par "mes"). "Ces" = on montre (ces-là).',
    'homophone_ma_ma_verbe':    '"M\'a" = me + a (verbe avoir). "Ma" = déterminant devant un nom.',
    'homophone_mon_mont':       '"M\'ont" = me + ont (ils/elles). "Mon" = déterminant devant un nom.',
    'homophone_ton_tont':       '"T\'ont" = te + ont (ils/elles). "Ton" = déterminant devant un nom.',
    'homophone_la_lapostrophe': '"L\'a" / "l\'as" = pronom + avoir. "La" = article ou pronom.',
    'homophone_cest_sest':      '"S\'est" dans les formes pronominales (il s\'est levé). "C\'est" = cela est.',
    'homophone_quant_quen':     '"Qu\'en" = que + en. "Quant" s\'emploie dans "quant à/au/aux".',
    'homophone_quand_quen':     '"Qu\'en" = que + en. "Quand" exprime le temps.',
    'homophone_peux_peut':      'Avec je/tu → "peux". Avec il/elle/on → "peut".',
    'homophone_peut_peux':      'Avec je/tu → "peux". Avec il/elle/on → "peut".',
    'homophone_tout_toute':     'Devant un nom féminin, "tout" s\'accorde : toute la classe, toutes les filles.',
    'homophone_notre_notreaccent': 'Après un article (le, la, les), on écrit nôtre / vôtre avec accent circumflexe.',
    'homophone_quel_quelle_quelleapostrophe': '"Qu\'elle" = que + elle. "Quelle" accompagne un nom (quelle maison !).'
};

    if (typeof global !== 'undefined') {
        global.ABE_EXEMPLES_PAR_TYPE = EXEMPLES_PAR_TYPE;
        global.ABE_MEMOS_PAR_TYPE = MEMOS_PAR_TYPE;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
