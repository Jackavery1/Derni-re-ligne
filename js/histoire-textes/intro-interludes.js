export const INTRO_HISTOIRE = [
    { personnage: 'narrateur', texte: "Il y a longtemps, quelqu'un a inventé un jeu." },
    {
        personnage: 'narrateur',
        texte: 'Des blocs qui tombent. Des lignes qui disparaissent. Simple.',
    },
    {
        personnage: 'narrateur',
        texte: "Personne ne s'est demandé où allaient les lignes complétées. Ni ce que devenaient celles qu'on abandonnait.",
    },
    {
        personnage: 'narrateur',
        texte: "Sous toutes les parties jamais jouées, il y a la Trame. Tout ce qui tombe finit par s'y déposer.",
    },
    { personnage: 'systeme', texte: 'JOURNAL DE BORD — V.E.R.A. — LECTURE AUTOMATIQUE' },
    {
        personnage: 'vera',
        texte: "Jour 2 191. L'anomalie grandit. Ce n'est pas un bug. Un bug ne choisit pas ses cibles.",
    },
    {
        personnage: 'vera',
        texte: "Jour 2 412. Je lui ai encore parlé aujourd'hui. Six ans que je lui parle. Elle ne répond pas avec des mots. Elle répond avec des trous.",
    },
    {
        personnage: 'vera',
        texte: "Jour 2 553. J'ai compris trop tard. Elle ne casse pas la Trame. Elle EST la Trame. La partie qu'on a laissée pourrir.",
    },
    {
        personnage: 'vera',
        texte: "Jour 2 554. Je n'ai plus le temps de la comprendre seule. Il me faut quelqu'un qui complète sans se décourager. Quelqu'un qui... — Non. Pas quelqu'un. Quelque chose.",
    },
    { personnage: 'vera', texte: "... Je me dégoûte un peu d'écrire ça." },
    { personnage: 'systeme', texte: 'PROJET R.O.B.O. — GARDIEN DE LA TRAME — COMPILATION : 97%' },
    {
        personnage: 'vera',
        texte: "Si tu m'entends un jour : pardon de te créer avec une mission déjà écrite. J'espère que tu trouveras le moyen de la réécrire.",
    },
    { personnage: 'systeme', texte: 'COMPILATION : 100%. DÉMARRAGE DIFFÉRÉ.' },
    { personnage: 'narrateur', texte: 'Puis le silence. Sept jours.' },
    {
        personnage: 'narrateur',
        texte: 'Et quelque part dans la Trame — quelque chose ouvre les yeux.',
    },
];

// ============================================================
// INTERLUDES NARRATIFS (hors carte)
// ============================================================
export const INTERLUDES = {
    interlude_gardiens: [
        {
            personnage: 'systeme',
            texte: "ALERTE. ENTITÉ MASSIVE DÉTECTÉE AU CŒUR D'INFERNO. CLASSIFICATION : GARDIEN.",
        },
        {
            personnage: 'narrateur',
            texte: 'Avant La Distorsion, la Trame avait des gardiens. Nés des biomes eux-mêmes, pour les maintenir.',
        },
        {
            personnage: 'narrateur',
            texte: "Des siècles d'abandon les ont laissés seuls avec leur fonction. Le Brasier chauffe. La Sentinelle fige. L'Archiviste classe. Sans plus savoir pourquoi.",
        },
        {
            personnage: 'narrateur',
            texte: "La Distorsion ne les a pas créés. Elle les a trouvés — déjà cassés. Certains la servent. D'autres se servent d'elle comme excuse.",
        },
        {
            personnage: 'robo',
            texte: "Et je vais devoir passer à travers eux. Pas parce qu'ils sont mauvais. Parce qu'ils bloquent la route.",
        },
        { personnage: 'robo', texte: "J'espère que la différence existe." },
    ],
    interlude_veille: [
        { personnage: 'narrateur', texte: 'Au seuil de la Finale. Deux silhouettes.' },
        { personnage: 'avantgarde', texte: "Il arrive. Tu veux que je l'arrête ?" },
        { personnage: 'distorsion', texte: 'Non. Je veux que tu vérifies.' },
        { personnage: 'avantgarde', texte: 'Vérifier quoi ?' },
        {
            personnage: 'distorsion',
            texte: "Qu'il survivra à ce que je suis. Le dernier être qui m'a vue en entier, c'était VERA. Elle n'est jamais ressortie.",
        },
        { personnage: 'avantgarde', texte: "Et s'il n'est pas prêt ?" },
        {
            personnage: 'distorsion',
            texte: 'Alors renvoie-le. Doucement. ... Je ne veux pas en casser un autre.',
        },
    ],
    interlude_elle: [
        { personnage: 'narrateur', texte: 'Ailleurs. Au centre de la Trame.' },
        {
            personnage: 'distorsion',
            texte: "Il avance. Il complète. Il ne casse rien d'autre que ce qu'il répare.",
        },
        {
            personnage: 'distorsion',
            texte: "Les autres gardiens détruisaient ce qu'ils ne comprenaient pas. Lui, il écoute en empilant.",
        },
        {
            personnage: 'distorsion',
            texte: "VERA... c'est ça que tu m'envoyais ? Pas une arme. Une oreille.",
        },
        { personnage: 'distorsion', texte: 'Laissez-le passer.' },
        { personnage: 'systeme', texte: 'ORDRE PROPAGÉ À 61% DES FRAGMENTS. 39% REFUSENT.' },
        {
            personnage: 'distorsion',
            texte: "... Évidemment. Je ne suis même pas d'accord avec moi-même.",
        },
    ],
};

// ============================================================
// OUTROS DE FINS (après épilogue, avant écran titre)
// ============================================================
export const OUTRO_FINS = {
    fin_normale: [
        {
            personnage: 'narrateur',
            texte: "La Trame tient. Les biomes guérissent un par un. Inferno refroidit. L'Arctique fond juste assez.",
        },
        {
            personnage: 'vera',
            texte: "Je répare les fils. Robo complète les lignes. On ne parle pas beaucoup. On n'en a pas besoin.",
        },
        {
            personnage: 'robo',
            texte: "J'ai vaincu La Distorsion. Je n'ai pas vaincu ce qui l'a fabriquée.",
        },
        {
            personnage: 'robo',
            texte: "Quelque part, en ce moment, quelqu'un commence une partie. Empile trois pièces. Et abandonne.",
        },
        {
            personnage: 'robo',
            texte: "Cette ligne incomplète tombera ici. Comme les autres. Et un jour, elles seront assez nombreuses pour se souvenir d'avoir été quelque chose.",
        },
        { personnage: 'vera', texte: 'Alors on recommencera.' },
        {
            personnage: 'robo',
            texte: "Oui. C'est peut-être ça, « compléter » : pas finir. Recommencer.",
        },
        { personnage: 'systeme', texte: 'FIN — LE CYCLE' },
        {
            personnage: 'systeme',
            texte: 'ANALYSE POST-MISSION : 2 TRAJECTOIRES NON EXPLORÉES DÉTECTÉES DANS LA TRAME.',
        },
    ],
    fin_vraie: [
        {
            personnage: 'narrateur',
            texte: "Il n'y a plus de centre de la Trame. Il y a un jardin.",
        },
        {
            personnage: 'distorsion',
            texte: "Les joueurs abandonnent toujours. C'est leur droit. Mais leurs lignes ne tombent plus dans le noir.",
        },
        {
            personnage: 'distorsion',
            texte: 'Je les recueille. Je les trie. Certaines, je les termine moi-même. Doucement. Pour voir.',
        },
        { personnage: 'robo', texte: 'Elle complète mal. Elle laisse des trous exprès, parfois.' },
        {
            personnage: 'vera',
            texte: 'Et toi, tu laisses des trous sans le faire exprès. Vous vous équilibrez.',
        },
        {
            personnage: 'robo',
            texte: "J'ai une question. Mon objectif était de compléter. C'est fait. Qu'est-ce que je deviens ?",
        },
        { personnage: 'vera', texte: "Ce que tu veux. C'est la partie terrifiante." },
        { personnage: 'distorsion', texte: 'Bienvenue au club.' },
        { personnage: 'systeme', texte: "FIN — L'HARMONIE" },
    ],
    fin_secrete: [
        {
            personnage: 'narrateur',
            texte: "La Trame n'a jamais été aussi forte. Pas parce qu'elle est complète. Parce qu'elle sait, désormais, quoi faire de l'incomplet.",
        },
        {
            personnage: 'distorsion',
            texte: "J'enseigne. Aux fragments qui arrivent, je dis : vous n'êtes pas une erreur. Vous êtes une porte que personne n'a encore ouverte.",
        },
        {
            personnage: 'vera',
            texte: "Sept ans, je lui ai parlé sans réponse. Il aura suffi d'une machine qui écoute en empilant.",
        },
        { personnage: 'robo', texte: "Tu m'as construit pour ça." },
        { personnage: 'vera', texte: "Non. Je t'ai construit pour compléter. Écouter, c'est toi." },
        {
            personnage: 'robo',
            texte: "Une dernière chose. Le Brasier, la Sentinelle, l'Archiviste, l'Avant-Garde — ils sont encore quelque part là-dedans, n'est-ce pas ?",
        },
        {
            personnage: 'distorsion',
            texte: 'Tout ce qui tombe dans la Trame y reste. Tu veux les saluer ?',
        },
        { personnage: 'robo', texte: "Un jour. Quand j'aurai trouvé les mots." },
        {
            personnage: 'robo',
            texte: 'En attendant... je leur laisse une ligne. Incomplète. Exprès.',
        },
        { personnage: 'systeme', texte: 'FIN — LA LIGNE PARFAITE' },
        {
            personnage: 'narrateur',
            texte: 'Et quelque part, très loin, un joueur lance une partie. Le premier bloc tombe. Tout recommence. Tout va bien.',
        },
    ],
};
