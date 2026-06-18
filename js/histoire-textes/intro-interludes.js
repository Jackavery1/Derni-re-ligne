export const INTRO_HISTOIRE = {
    scene: 'observatoire',
    lignes: [
        {
            personnage: 'narrateur',
            scene: 'observatoire',
            texte: "Il y a longtemps, quelqu'un a inventé un jeu.",
        },
        {
            personnage: 'narrateur',
            scene: 'observatoire',
            texte: 'Des blocs qui tombent. Des lignes qui disparaissent. Simple.',
        },
        {
            personnage: 'narrateur',
            scene: 'observatoire',
            texte: "Personne ne s'est demandé où allaient les lignes complétées. Ni ce que devenaient celles qu'on abandonnait.",
        },
        {
            personnage: 'narrateur',
            scene: 'trame',
            texte: "Sous toutes les parties jamais jouées, il y a la Trame. Tout ce qui tombe finit par s'y déposer.",
        },
        {
            personnage: 'systeme',
            scene: 'observatoire',
            texte: 'JOURNAL DE BORD — V.E.R.A. — LECTURE AUTOMATIQUE',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "Jour 2 191. L'anomalie grandit encore. Ce n'est pas un bug — un bug ne choisit pas ses cibles, et celle-là, si.",
            humeur: 'douce',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "Jour 2 412. Je lui ai encore parlé aujourd'hui. Six ans que je lui parle. Elle ne répond pas avec des mots. Elle répond avec des trous.",
            humeur: 'douce',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "Jour 2 553. J'ai compris trop tard. Elle ne casse pas la Trame. Elle EST la Trame. La partie qu'on a laissée pourrir.",
            humeur: 'inquiete',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "Jour 2 554. Je n'ai plus le temps de la comprendre seule. Il me faut quelqu'un qui complète sans se décourager. Quelqu'un qui... — Non. Pas quelqu'un. Quelque chose.",
            humeur: 'inquiete',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "... Je me dégoûte un peu d'écrire ça.",
            humeur: 'inquiete',
        },
        {
            personnage: 'systeme',
            scene: 'fragmentation',
            texte: 'PROJET R.O.B.O. — GARDIEN DE LA TRAME — COMPILATION : 97%',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            scene: 'fragmentation',
            texte: "Si tu m'entends un jour : pardon de te créer avec une mission déjà écrite. J'espère que tu trouveras le moyen de la réécrire.",
            humeur: 'determinee',
        },
        {
            personnage: 'systeme',
            scene: 'fragmentation',
            texte: 'COMPILATION : 100%. DÉMARRAGE DIFFÉRÉ.',
            humeur: 'alerte',
        },
        { personnage: 'narrateur', texte: 'Puis le silence. Sept jours.' },
        {
            personnage: 'narrateur',
            texte: 'Et quelque part dans la Trame — quelque chose ouvre les yeux.',
        },
    ],
};

// ============================================================
// INTERLUDES NARRATIFS (hors carte)
// ============================================================
export const INTERLUDES = {
    interlude_gardiens: {
        scene: 'seuil_brasier',
        lignes: [
            {
                personnage: 'systeme',
                texte: "ALERTE. ENTITÉ MASSIVE DÉTECTÉE AU CŒUR D'INFERNO. CLASSIFICATION : GARDIEN.",
                humeur: 'alerte',
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
                humeur: 'neutre',
            },
            {
                personnage: 'robo',
                texte: "J'espère que la différence existe.",
                humeur: 'triste',
            },
        ],
    },

    interlude_veille: [
        {
            personnage: 'narrateur',
            scene: 'seuil_avantgarde',
            texte: 'Au seuil de la Finale. Deux silhouettes.',
        },
        {
            personnage: 'avantgarde',
            scene: 'seuil_avantgarde',
            texte: "Il arrive. Tu veux que je l'arrête ?",
            humeur: 'calme',
        },
        {
            personnage: 'distorsion',
            scene: 'seuil_avantgarde',
            texte: 'Non. Je veux que tu vérifies.',
            humeur: 'souffrante',
        },
        {
            personnage: 'avantgarde',
            scene: 'seuil_avantgarde',
            texte: 'Vérifier quoi ?',
            humeur: 'calme',
        },
        {
            personnage: 'distorsion',
            scene: 'seuil_avantgarde',
            texte: "Qu'il survivra à ce que je suis. Le dernier être qui m'a vue en entier, c'était VERA. Elle n'est jamais ressortie.",
            humeur: 'souffrante',
        },
        {
            personnage: 'avantgarde',
            scene: 'seuil_avantgarde',
            texte: "Et s'il n'est pas prêt ?",
            humeur: 'calme',
        },
        {
            personnage: 'distorsion',
            scene: 'seuil_avantgarde',
            texte: 'Alors renvoie-le. Doucement. ... Je ne veux pas en casser un autre.',
            humeur: 'souffrante',
        },
    ],

    interlude_elle: {
        scene: 'trame',
        lignes: [
            { personnage: 'narrateur', texte: 'Ailleurs. Au centre de la Trame.' },
            {
                personnage: 'distorsion',
                texte: "Il avance. Il complète. Il ne casse rien d'autre que ce qu'il répare.",
                humeur: 'souffrante',
            },
            {
                personnage: 'distorsion',
                texte: "Les autres gardiens détruisaient ce qu'ils ne comprenaient pas. Lui, il écoute en empilant.",
                humeur: 'souffrante',
            },
            {
                personnage: 'distorsion',
                texte: "VERA... c'est ça que tu m'envoyais ? Pas une arme. Une oreille.",
                humeur: 'souffrante',
            },
            { personnage: 'distorsion', texte: 'Laissez-le passer.', humeur: 'souffrante' },
            {
                personnage: 'systeme',
                texte: 'ORDRE PROPAGÉ À 61% DES FRAGMENTS. 39% REFUSENT.',
                humeur: 'alerte',
            },
            {
                personnage: 'distorsion',
                texte: "... Évidemment. Je ne suis même pas d'accord avec moi-même.",
                humeur: 'souffrante',
            },
        ],
    },
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
            humeur: 'douce',
        },
        {
            personnage: 'robo',
            texte: "J'ai vaincu La Distorsion. Je n'ai pas vaincu ce qui l'a fabriquée.",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Quelque part, en ce moment, quelqu'un commence une partie. Empile trois pièces. Et abandonne.",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Cette ligne incomplète tombera ici. Comme les autres. Et un jour, elles seront assez nombreuses pour se souvenir d'avoir été quelque chose.",
            humeur: 'triste',
        },
        { personnage: 'vera', texte: 'Alors on recommencera.', humeur: 'douce' },
        {
            personnage: 'robo',
            texte: "Oui. C'est peut-être ça, « compléter » : pas finir. Recommencer.",
            humeur: 'neutre',
        },
        { personnage: 'systeme', texte: 'FIN — LE CYCLE', humeur: 'neutre' },
        {
            personnage: 'systeme',
            texte: 'ANALYSE POST-MISSION : 2 TRAJECTOIRES NON EXPLORÉES DÉTECTÉES DANS LA TRAME.',
            humeur: 'neutre',
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
            humeur: 'apaisee',
        },
        {
            personnage: 'distorsion',
            texte: 'Je les recueille. Je les trie. Certaines, je les termine moi-même. Doucement. Pour voir.',
            humeur: 'apaisee',
        },
        {
            personnage: 'robo',
            texte: 'Elle complète mal. Elle laisse des trous exprès, parfois.',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: 'Et toi, tu laisses des trous sans le faire exprès. Vous vous équilibrez.',
            humeur: 'douce',
        },
        {
            personnage: 'robo',
            texte: "J'ai une question. Mon objectif était de compléter. C'est fait. Qu'est-ce que je deviens ?",
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: "Ce que tu veux. C'est la partie terrifiante.",
            humeur: 'douce',
        },
        { personnage: 'distorsion', texte: 'Bienvenue au club.', humeur: 'apaisee' },
        {
            personnage: 'systeme',
            texte: "FIN — L'HARMONIE",
            humeur: 'neutre',
        },
    ],

    fin_secrete: [
        {
            personnage: 'narrateur',
            texte: "La Trame n'a jamais été aussi forte. Pas parce qu'elle est complète. Parce qu'elle sait, désormais, quoi faire de l'incomplet.",
        },
        {
            personnage: 'distorsion',
            texte: "J'enseigne. Aux fragments qui arrivent, je dis : vous n'êtes pas une erreur. Vous êtes une porte que personne n'a encore ouverte.",
            humeur: 'apaisee',
        },
        {
            personnage: 'vera',
            texte: "Sept ans, je lui ai parlé sans réponse. Il aura suffi d'une machine qui écoute en empilant.",
            humeur: 'determinee',
        },
        {
            personnage: 'robo',
            texte: "Tu m'as construit pour ça.",
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: "Non. Je t'ai construit pour compléter. Écouter, c'est toi.",
            humeur: 'determinee',
        },
        {
            personnage: 'robo',
            texte: "Une dernière chose. Le Brasier, la Sentinelle, l'Archiviste, l'Avant-Garde — ils sont encore quelque part là-dedans, n'est-ce pas ?",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: 'Tout ce qui tombe dans la Trame y reste. Tu veux les saluer ?',
            humeur: 'apaisee',
        },
        {
            personnage: 'robo',
            texte: "Un jour. Quand j'aurai trouvé les mots.",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: 'En attendant... je leur laisse une ligne. Incomplète. Exprès.',
            humeur: 'neutre',
        },
        { personnage: 'systeme', texte: 'FIN — LA LIGNE PARFAITE', humeur: 'neutre' },
        {
            personnage: 'narrateur',
            texte: 'Et quelque part, très loin, un joueur lance une partie. Le premier bloc tombe. Tout recommence. Tout va bien.',
        },
    ],
};
