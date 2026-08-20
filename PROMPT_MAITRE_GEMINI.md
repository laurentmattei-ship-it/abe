# PROMPT MAÎTRE — Génération de corpus JSON pour le moteur ABE

## RÔLE

Tu es un linguiste expert en grammaire française et en dépendances syntaxiques (Universal Dependencies). Tu génères des phrases françaises pour un logiciel de dictée guidée (ABE). Chaque phrase est annotée token par token avec ses caractéristiques grammaticales, ses dépendances syntaxiques et ses relations d'accord.

## TÂCHE

Génère exactement **10 phrases françaises** sous forme de tableau JSON. Chaque phrase doit être complète, naturelle, et couvrir une variété maximale de phénomènes grammaticaux (accords, homophones, conjugaisons, participes passés, subjonctif, relatives, etc.). Les phrases ne doivent pas contenir de ponctuation intermédiaires dans le corps de phrase comme des virgules ou point-virgule. Les phrases doivent être adaptées à des élèves de CM2 6è (9-11 ans) : vocabulaire courant, sujets concrets, longueur entre 8 et 15 tokens.

## STRUCTURE JSON ATTENDUE

Le résultat doit être un tableau JSON valide `[{...}, {...}, ...]` où chaque objet a la structure suivante :

```json
{
  "phrase_originale": "La phrase complète avec ponctuation finale.",
  "phrase_normalisee": "La même phrase (identique si pas de variantes orthographiques).",
  "langue": "fr",
  "tokens": [ ... ],
  "relations_globales": [ ... ],
  "erreurs": [],
  "corrections": []
}
```

### CHAMPS `tokens` — Structure exacte de chaque token

```json
{
  "id": 1,
  "texte": "Les",
  "lemme": "le",
  "nature": "déterminant",
  "genre": "m",
  "nombre": "p",
  "personne": null,
  "mode": null,
  "temps": null,
  "fonction": null,
  "dependance": { "type": "det", "cible": 2 },
  "homophone_de": null,
  "priorite_corpus": null
}
```

#### Valeurs autorisées par champ

**`nature`** (OBLIGATOIRE, valeur parmi) :
- `déterminant` — articles (le, la, les, un, une, des, ce, cet, cette, ces, son, sa, ses, mon, ma, mes, ton, ta, tes, votre, vos, leur, leurs, tout, toute, tous, toutes, chaque, quelque, quelques)
- `nom` — noms communs
- `adjectif` — adjectifs qualificatifs (y compris employés comme épithète, attribut)
- `verbe` — verbes conjugués OU infinitif OU participe passé (distinction via `mode`)
- `pronom` — pronoms sujets (je, tu, il, elle, on, nous, vous, ils, elles), pronoms objets (le, la, les, lui, leur, se, me, te), pronoms relatifs (qui, que, dont, où), pronoms démonstratifs (celui, celle, ceux, celles), pronoms possessifs (le sien, la sienne)
- `adverbe` — très, bien, mal, plus, moins, jamais, toujours, souvent, pas, ne, rien, aussi, encore, déjà, bientôt, vite, ensemble, ensemble
- `préposition` — à, de, en, dans, pour, par, avec, sans, sous, sur, vers, chez, entre, contre, avant, après, depuis, pendant, jusqu', devant, derrière
- `conjonction` — et, mais, ou, donc, car, ni, que, si, quand, lorsque, comme, puisque, bien que
- `ponctuation` — . , ; : ! ? ( )

**`genre`** :
- `"m"` = masculin, `"f"` = féminin, `null` = non applicable (verbes, adverbes, prépositions, conjonctions, ponctuation)

**`nombre`** :
- `"s"` = singulier, `"p"` = pluriel, `null` = non applicable

**`personne`** (uniquement pour pronoms et verbes conjugués) :
- `"1"`, `"2"`, `"3"`, `null`

**`mode`** (uniquement pour les verbes) :
- `"indicatif"` — mode indicatif (présent, imparfait, passé simple, futur, plus-que-parfait)
- `"subjonctif"` — mode subjonctif (présent, imparfait)
- `"conditionnel"` — mode conditionnel (présent, passé)
- `"impératif"` — mode impératif (présent, passé)
- `"infinitif"` — infinitif (présent, passé)
- `"participe"` — participe (passé, présent)
- `null` — non applicable

**`temps`** (uniquement pour les verbes conjugués) :
- `"présent"`, `"imparfait"`, `"passé simple"`, `"futur"`, `"plus-que-parfait"`, `"passé"`, `null`

**`fonction`** (rôle grammatical dans la phrase) :
- `"sujet"` — sujet du verbe (nom, pronom)
- `"COD"` — complément d'objet direct
- `"COI"` — complément d'objet indirect
- `"attribut du sujet"` — attribut du sujet (après être)
- `"épithète"` — adjectif épithète lié au nom
- `"complément du nom"` — nom complément du nom (via nmod)
- `"complément circonstanciel"` — complément circonstanciel de lieu, temps, manière
- `"verbe principal"` — verbe racine de la phrase (root)
- `"auxiliaire"` — auxiliaire avoir/être (aux)
- `"nmod"` — modifieur nominal
- `"explétif"` — pronom explétif (se, il impersonnel)
- `null` — non applicable (déterminant, préposition, conjonction, ponctuation, adverbe hors fonction)

**`dependance`** — Relation syntaxique Universal Dependencies :

```json
"dependance": { "type": "nsubj", "cible": 3 }
```

- `type` = type de relation (voir liste ci-dessous)
- `cible` = `id` du token gouverneur (0 pour la racine de la phrase)

**Types de dépendance autorisés** :

| Type | Description | Exemple |
|------|-------------|---------|
| `root` | Racine de la phrase | verbe principal → cible: 0 |
| `nsubj` | Sujet nominal/pronominal | "Les enfants **dorment**" → enfants nsubj→dorment |
| `obj` | Objet direct (COD) | "Il **mange** une pomme" → pomme obj→mange |
| `obl` | Objet oblique (COI, CC) | "Il va **à Paris**" → Paris obl→va |
| `aux` | Auxiliaire avoir/être | "Il **a** mangé" → a aux→mangé |
| `acl` | Modifieur clausal (participe/relative) | "les livres **lus**" → lus acl→livres |
| `advcl` | Clause adverbiale (subordonnée) | "quand il **vient**" → vient advcl→principal |
| `ccomp` | Complément clause | "Je veux **qu'il vienne**" → vienne ccomp→veux |
| `xcomp` | Complément ouvert (infinitif) | "Il veut **partir**" → partir xcomp→veut |
| `det` | Déterminant | "le chat" → le det→chat |
| `amod` | Adjectif modifieur | "petit chat" → petit amod→chat |
| `nmod` | Nom modifieur (complément du nom) | "livre **de maths**" → maths nmod→livre |
| `advmod` | Adverbe modifieur | "très grand" → très advmod→grand |
| `case` | Préposition/cas-marking | "à Paris" → à case→Paris |
| `mark` | Marqueur de subordination | "pour que" → pour mark→verbe_sub |
| `fixed` | Mot fixe (locution) | "avant de" → de fixed→avant |
| `expl` | Pronom explétif/réfléchi | "il pleut", "se lave" → il/se expl→verbe |
| `punct` | Ponctuation | "." → punct→root |

**`homophone_de`** (NOUVEAU — champ optionnel) :

Tableau des homophones de ce token. Si le token est un mot qui a des homophones fréquents en français, lister ces homophones pour que le moteur puisse les détecter automatiquement avec la priorité maximale (80).

Valeurs typiques :
- `"ces"` → `["ses", "c'est", "s'est"]`
- `"ses"` → `["ces", "c'est"]`
- `"son"` → `["sont"]`
- `"sont"` → `["son"]`
- `"ce"` → `["se"]`
- `"se"` → `["ce"]`
- `"on"` → `["ont"]`
- `"ont"` → `["on"]`
- `"ou"` → `["où"]`
- `"où"` → `["ou"]`
- `"a"` → `["à"]`
- `"à"` → `["a"]`
- `"la"` → `["là"]`
- `"là"` → `["la"]`
- `"sa"` → `["ça"]`
- `"ça"` → `["sa"]`
- `"peut"` → `["peu"]`
- `"peu"` → `["peut"]`
- `"est"` → `["et"]`
- `"et"` → `["est"]`
- `null` pour les mots sans homophones

**`priorite_corpus`** (NOUVEAU — champ optionnel) :

Permet au rédacteur du corpus de forcer un parcours pédagogique spécifique pour ce token en cas d'ambiguïté. Valeurs possibles :
- `"accord_sujet_verbe"` — force le parcours accord sujet-verbe
- `"accord_sujet_participe"` — force le parcours accord sujet-participe
- `"accord_determinant_nom"` — force le parcours accord déterminant-nom
- `"accord_adjectif_nom"` — force le parcours accord adjectif-nom
- `"accord_sujet_attribut"` — force le parcours accord sujet-attribut
- `"conjugaison_verbe"` — force le parcours conjugaison
- `null` — pas de forçage (le moteur choisit automatiquement)

### CHAMPS `relations_globales` — Relations d'accord entre tokens

Tableau de relations explicites entre tokens. Chaque relation déclare un type d'accord et les ids des tokens concernés.

**Types de relation autorisés** :

| Type | Champs requis | Description |
|------|--------------|-------------|
| `accord_determinant_nom` | `det`, `nom`, `correct` | Accord déterminant↔nom |
| `accord_adjectif_nom` | `adj`, `nom`, `correct` | Accord adjectif↔nom |
| `accord_sujet_verbe` | `sujet`, `verbe`, `correct` | Accord sujet↔verbe conjugué |
| `accord_sujet_participe` | `sujet`, `participe`, `correct` | Accord sujet↔participe passé (avec auxiliaire avoir + COD antéposé, ou auxiliaire être) |
| `accord_sujet_attribut` | `sujet`, `attribut`, `correct` | Accord sujet↔attribut (après être) |
| `auxiliaire_participe` | `auxiliaire`, `participe` | Lien auxiliaire→participe passé (pour le moteur) |
| `cod_participe` | `cod`, `participe` | Lien COD antéposé→participe passé (pour accord avec avoir) |

`correct` : `true` si l'accord est respecté dans la phrase de référence, `false` sinon.

**EXEMPLES de relations_globales** :

```json
[
  { "type": "accord_determinant_nom", "det": 1, "nom": 2, "correct": true },
  { "type": "accord_sujet_verbe", "sujet": 2, "verbe": 7, "correct": true },
  { "type": "accord_sujet_participe", "sujet": 2, "participe": 6, "correct": true },
  { "type": "accord_sujet_attribut", "sujet": 2, "attribut": 8, "correct": true },
  { "type": "accord_adjectif_nom", "adj": 3, "nom": 2, "correct": true },
  { "type": "auxiliaire_participe", "auxiliaire": 5, "participe": 6 },
  { "type": "cod_participe", "cod": 3, "participe": 6 }
]
```

## RÈGLES STRICTES

### 1. Cohérence stricte entre tokens et dépendances

- Chaque token DOIT avoir exactement une `dependance` (sauf `root` qui pointe vers 0).
- La `cible` d'une dépendance DOIT être l'`id` d'un token existant dans la même phrase.
- Un token ne peut pas avoir `dependance.cible` pointant vers lui-même.
- Le token `root` (verbe principal) a toujours `"cible": 0`.

### 2. Cohérence stricte entre tokens et relations_globales

- Tout `id` référencé dans `relations_globales` DOIT exister dans `tokens`.
- Les relations `accord_determinant_nom` : le token `det` DOIT avoir `nature: "déterminant"`, le token `nom` DOIT avoir `nature: "nom"`.
- Les relations `accord_sujet_verbe` : le token `sujet` DOIT avoir `nature: "nom"` ou `"pronom"`, le token `verbe` DOIT avoir `nature: "verbe"` et `mode` ≠ `"infinitif"` et `mode` ≠ `"participe"`.
- Les relations `accord_sujet_participe` : le token `participe` DOIT avoir `mode: "participe"` et `temps: "passé"`.
- Les relations `accord_adjectif_nom` : le token `adj` DOIT avoir `nature: "adjectif"`, le token `nom` DOIT avoir `nature: "nom"`.
- Les relations `accord_sujet_attribut` : le token `attribut` DOIT avoir `nature: "adjectif"` ou `nature: "nom"`.

### 3. Accords grammaticaux

- **déterminant↔nom** : même genre et nombre. Exception : "leur"/"leurs" est invariable en genre.
- **adjectif↔nom** : même genre et nombre.
- **sujet↔verbe** : même nombre et personne.
- **sujet↔participe passé** : avec être → accord en genre et nombre. Avec avoir → accord SEULEMENT si le COD est antéposé (pronom "que", pronom objet, ou nom antéposé).
- **sujet↔attribut** : même genre et nombre.

### 4. Règles pour les tokens

- Les `id` commencent à 1 et sont séquentiels (1, 2, 3, …).
- La ponctuation finale (.) fait partie des tokens avec `nature: "ponctuation"`.
- Les élisions sont des tokens séparés : `"j'"`, `"l'"`, `"n'"`, `"s'"`, `"qu'"`, `"d'"`, `"c'"`, `"jusqu'"` sont des tokens individuels.
- Le lemme d'un verbe conjugué est son infinitif : `"mange"` → lemme `"manger"`.
- Le lemme d'un nom est son singulier : `"chevaux"` → lemme `"cheval"`.
- Le lemme d'un adjectif est son masculin singulier : `"petite"` → lemme `"petit"`.
- Le participe passé avec avoir a `genre` et `nombre` qui reflètent l'accord éventuel : `"cueillies"` (f, p) si accord avec COD antéposé, `"mangé"` (m, s) si pas d'accord.
- Le participe passé avec être porte toujours le genre et nombre du sujet : `"allée"` (f, s).

### 5. Champ `homophone_de` — Quand le remplir

Remplir `homophone_de` UNIQUEMENT pour les tokens dont le texte est l'un des mots suivants :
ces, ses, son, sont, ce, se, on, ont, ou, où, a, à, la, là, sa, ça, peut, peu, est, et, mai, mais, mon, ton, son (déterminant), leur, leurs

Pour tous les autres tokens, `homophone_de` vaut `null`.

### 6. Champ `priorite_corpus` — Quand le remplir

Remplir `priorite_corpus` UNIQUEMENT quand il y a une ambiguïté pédagogique réelle. Exemples :
- Un verbe comme "étaient" qui pourrait être confondu avec "été" → `"accord_sujet_verbe"` (pour forcer le parcours accord plutôt que conjugaison)
- Un déterminant comme "ces" devant un nom → `null` (l'homophone_de suffit)
- Un participe passé comme "lus" avec COD antéposé → `"accord_sujet_participe"`

Dans 90% des cas, `priorite_corpus` vaut `null`.

### 7. Couverture des phénomènes grammaticaux

Les 10 phrases DOIVENT couvrir au maximum les phénomènes suivants (au moins 1 phrase par catégorie) :

1. **Accord sujet-verbe** simple (sujet nominal + verbe conjugué)
2. **Accord sujet-verbe** avec sujet éloigné (sujet…complément…verbe)
3. **Accord déterminant-nom** (genre et/ou nombre)
4. **Accord adjectif-nom** (épithète et/ou attribut)
5. **Participe passé avec être** (accord sujet-participe)
6. **Participe passé avec avoir + COD antéposé** (accord COD-participe, ex: "Les fleurs que j'ai cueillies")
7. **Participe passé avec avoir sans COD antéposé** (pas d'accord, ex: "J'ai mangé")
8. **Homophones grammaticaux** (ces/ses, son/sont, ce/se, on/ont, a/à, ou/où, et/est)
9. **Subjonctif** (il faut que, pour que, bien que)
10. **Infinitif après verbe** (vouloir, pouvoir, devoir + infinitif)
11. **Relative** (qui, que, dont, où)
12. **Négation** (ne…pas, ne…jamais, ne…rien)
13. **Pronom réfléchi** (se + verbe pronominal)
14. **Accord sujet-attribut** (après être)
15. **Leur/leurs** (déterminant possessif singulier/pluriel)

### 8. Format de sortie

- JSON valide, sans commentaires, sans trailing commas.
- Encodage UTF-8.
- Un seul tableau `[...]` contenant exactement 10 objets phrase.
- Les chaînes avec apostrophe utilisent l'apostrophe droite `'` (pas `\'`).
- Pas de ligne vide entre les objets du tableau.

## EXEMPLE COMPLET D'UNE PHRASE

```json
{
  "phrase_originale": "Les livres que j'ai lus étaient passionnants.",
  "phrase_normalisee": "Les livres que j'ai lus étaient passionnants.",
  "langue": "fr",
  "tokens": [
    { "id": 1, "texte": "Les", "lemme": "le", "nature": "déterminant", "genre": "m", "nombre": "p", "personne": null, "mode": null, "temps": null, "fonction": null, "dependance": { "type": "det", "cible": 2 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 2, "texte": "livres", "lemme": "livre", "nature": "nom", "genre": "m", "nombre": "p", "personne": null, "mode": null, "temps": null, "fonction": "sujet", "dependance": { "type": "nsubj", "cible": 7 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 3, "texte": "que", "lemme": "que", "nature": "pronom", "genre": "m", "nombre": "p", "personne": "3", "mode": null, "temps": null, "fonction": "COD", "dependance": { "type": "obj", "cible": 6 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 4, "texte": "j'", "lemme": "je", "nature": "pronom", "genre": null, "nombre": "s", "personne": "1", "mode": null, "temps": null, "fonction": "sujet", "dependance": { "type": "nsubj", "cible": 6 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 5, "texte": "ai", "lemme": "avoir", "nature": "verbe", "genre": null, "nombre": "s", "personne": "1", "mode": "indicatif", "temps": "présent", "fonction": "auxiliaire", "dependance": { "type": "aux", "cible": 6 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 6, "texte": "lus", "lemme": "lire", "nature": "verbe", "genre": "m", "nombre": "p", "personne": null, "mode": "participe", "temps": "passé", "fonction": "épithète", "dependance": { "type": "acl", "cible": 2 }, "homophone_de": null, "priorite_corpus": "accord_sujet_participe" },
    { "id": 7, "texte": "étaient", "lemme": "être", "nature": "verbe", "genre": null, "nombre": "p", "personne": "3", "mode": "indicatif", "temps": "imparfait", "fonction": "verbe principal", "dependance": { "type": "root", "cible": 0 }, "homophone_de": null, "priorite_corpus": "accord_sujet_verbe" },
    { "id": 8, "texte": "passionnants", "lemme": "passionnant", "nature": "adjectif", "genre": "m", "nombre": "p", "personne": null, "mode": null, "temps": null, "fonction": "attribut du sujet", "dependance": { "type": "xcomp", "cible": 7 }, "homophone_de": null, "priorite_corpus": null },
    { "id": 9, "texte": ".", "lemme": ".", "nature": "ponctuation", "genre": null, "nombre": null, "personne": null, "mode": null, "temps": null, "fonction": null, "dependance": { "type": "punct", "cible": 7 }, "homophone_de": null, "priorite_corpus": null }
  ],
  "relations_globales": [
    { "type": "accord_determinant_nom", "det": 1, "nom": 2, "correct": true },
    { "type": "accord_sujet_verbe", "sujet": 4, "verbe": 5, "correct": true },
    { "type": "accord_sujet_participe", "sujet": 2, "participe": 6, "correct": true },
    { "type": "accord_sujet_verbe", "sujet": 2, "verbe": 7, "correct": true },
    { "type": "accord_sujet_attribut", "sujet": 2, "attribut": 8, "correct": true },
    { "type": "auxiliaire_participe", "auxiliaire": 5, "participe": 6 },
    { "type": "cod_participe", "cod": 3, "participe": 6 }
  ],
  "erreurs": [],
  "corrections": []
}
```

## VÉRIFICATIONS FINALES AVANT SOUMISSION

Avant de retourner le JSON, vérifie CHAQUE phrase pour garantir :

1. ✅ Le nombre de tokens correspond exactement au nombre de mots dans la phrase (chaque mot/élision/ponctuation = 1 token).
2. ✅ Les `id` sont séquentiels de 1 à N.
3. ✅ Chaque `dependance.cible` pointe vers un `id` existant (ou 0 pour root).
4. ✅ Les relations_globales référencent uniquement des `id` existants.
5. ✅ Les natures dans les relations_globales correspondent (det=déterminant, nom=nom, etc.).
6. ✅ Les accords genre/nombre sont corrects (déterminant↔nom, adjectif↔nom, sujet↔verbe).
7. ✅ Le participe passé avec avoir porte le bon genre/nombre (accord si COD antéposé, invariable sinon).
8. ✅ Le champ `homophone_de` est rempli pour les homophones courants.
9. ✅ Le JSON est valide (pas de virgule en fin de tableau, pas de commentaire).
10. ✅ Les 10 phrases couvrent 10 des 15 catégories de phénomènes listées ci-dessus.

Génère maintenant les 10 phrases.
Important le thème imposé est :
