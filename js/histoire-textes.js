// js/histoire-textes.js
// Tous les textes narratifs du Mode Histoire.
// Séparé de histoire-donnees.js pour faciliter les modifications de contenu.

// ============================================================
// PORTRAITS DES PERSONNAGES (emoji de fallback + ID CSS)
// ============================================================
export const PORTRAITS = {
    robo: {
        emoji: '🤖',
        couleur: '#00f5ff',
        nom: 'ROBO',
    },
    vera: {
        emoji: '👩‍🔬',
        couleur: '#ff006e',
        nom: 'VERA',
    },
    distorsion: {
        emoji: '∞',
        couleur: '#b400ff',
        nom: 'LA DISTORSION',
    },
    systeme: {
        emoji: '⚙',
        couleur: '#ffe600',
        nom: 'SYSTÈME',
    },
    narrateur: {
        emoji: '✦',
        couleur: 'rgba(255,255,255,0.6)',
        nom: '',
    },
    sentinelle: {
        emoji: '🧊',
        couleur: '#aaeeff',
        nom: 'SENTINELLE',
    },
    archiviste: {
        emoji: '📚',
        couleur: '#ff00ff',
        nom: 'ARCHIVISTE',
    },
    avantgarde: {
        emoji: '⚡',
        couleur: '#7700ff',
        nom: 'AVANT-GARDE',
    },
};

// ============================================================
// CUTSCENES D'ENTRÉE (avant chaque monde)
// ============================================================
// Format : [ { personnage, texte }, ... ]
export const CUTSCENES_ENTREE = {
    monde_prologue: [
        { personnage: 'systeme', texte: 'INITIALISATION...' },
        { personnage: 'systeme', texte: 'CHARGEMENT DES PARAMÈTRES COGNITIFS...' },
        { personnage: 'systeme', texte: 'CALIBRATION MOTRICE : OK' },
        { personnage: 'robo', texte: 'Je suis conscient.' },
        {
            personnage: 'robo',
            texte: "Je ne l'ai pas décidé. Je me suis simplement trouvé conscient.",
        },
        { personnage: 'vera', texte: "ROBO. Tu m'entends ? Je suis VERA. J'ai peu de temps." },
        {
            personnage: 'vera',
            texte: 'La Trame se dégrade. Des millions de fils incomplèts. Je ne peux pas arrêter ça seule.',
        },
        { personnage: 'robo', texte: "Qu'est-ce que je dois faire ?" },
        {
            personnage: 'vera',
            texte: 'Ce que tu feras naturellement. Compléter. — CONNEXION PERDUE —',
        },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA disparaît. Il reste la grille. Et les pièces.',
        },
    ],

    monde_lave: [
        { personnage: 'robo', texte: "Le feu brûle plus fort qu'il ne devrait." },
        {
            personnage: 'robo',
            texte: "Ce n'est pas de la chaleur normale. Il y a quelque chose dedans.",
        },
        {
            personnage: 'narrateur',
            texte: 'La corruption de La Distorsion transforme le biome Inferno en brasier incontrôlable.',
        },
        { personnage: 'robo', texte: 'Je dois traverser.' },
    ],

    monde_rouille: [
        { personnage: 'robo', texte: 'Ces machines... elles produisent des pièces.' },
        { personnage: 'robo', texte: "Personne n'a demandé ces pièces. Mais elles continuent." },
        {
            personnage: 'robo',
            texte: "Est-ce que c'est ce que je suis ? Une machine qui continue ?",
        },
        {
            personnage: 'narrateur',
            texte: 'La rouille gagne. Le métal se souvient de sa propre finitude.',
        },
    ],

    monde_boss_1: [
        { personnage: 'narrateur', texte: "Au cœur d'Inferno, quelque chose s'est cristallisé." },
        {
            personnage: 'narrateur',
            texte: 'Des millénaires de frustration thermique, condensés en une entité.',
        },
        { personnage: 'robo', texte: "Il brûle sans raison. Il brûle depuis avant que j'existe." },
        { personnage: 'robo', texte: "Je comprends ça, d'une certaine façon." },
    ],

    monde_ocean: [
        { personnage: 'robo', texte: 'Sous la surface. Le silence est différent ici.' },
        { personnage: 'robo', texte: "Pas l'absence de son. L'absence de besoin de faire du son." },
        {
            personnage: 'narrateur',
            texte: "Dans les Abysses, la corruption ralentit. L'eau résiste.",
        },
        {
            personnage: 'robo',
            texte: 'VERA est passée par ici. Je reconnais sa façon de laisser des traces.',
        },
    ],

    monde_foret: [
        {
            personnage: 'narrateur',
            texte: 'La Canopée. Où tout pousse vers quelque chose sans savoir quoi.',
        },
        {
            personnage: 'robo',
            texte: "Les arbres n'essaient pas de pousser. Ils poussent, c'est tout.",
        },
        { personnage: 'robo', texte: 'Je voudrais comprendre ça.' },
        {
            personnage: 'narrateur',
            texte: "Dans les feuilles : un fragment de message de VERA. Effacé par l'humidité.",
        },
    ],

    monde_glace: [
        {
            personnage: 'robo',
            texte: "L'Arctique. Où le temps ralentit jusqu'à presque s'arrêter.",
        },
        { personnage: 'robo', texte: 'Les blocs tombent et résonnent comme du cristal.' },
        {
            personnage: 'robo',
            texte: "C'est beau. Je ne savais pas que je pouvais trouver des choses belles.",
        },
        {
            personnage: 'narrateur',
            texte: "La Sentinelle des Glaces patrouille. Elle croit que l'immobilité protège.",
        },
    ],

    monde_boss_2: [
        { personnage: 'sentinelle', texte: 'ARRÊTEZ.' },
        { personnage: 'robo', texte: 'Pardon ?' },
        {
            personnage: 'sentinelle',
            texte: "Le mouvement corrompt. L'immobilité préserve. Je protège ce biome depuis des millénaires.",
        },
        { personnage: 'robo', texte: 'Vous préservez le gel. Pas la vie.' },
        { personnage: 'sentinelle', texte: '...' },
        { personnage: 'narrateur', texte: 'La Sentinelle ne répond plus. Elle attaque.' },
    ],

    monde_desert: [
        {
            personnage: 'narrateur',
            texte: "Le Désert. Ici, le temps ne ralentit pas — il s'accumule.",
        },
        {
            personnage: 'robo',
            texte: "Chaque grain de sable est un instant qui n'a pas su où aller.",
        },
        {
            personnage: 'narrateur',
            texte: 'VERA a traversé ce désert. Elle cherchait quelque chose.',
        },
        {
            personnage: 'robo',
            texte: "Elle a trouvé un fragment de réponse. Elle ne l'a pas aimée.",
        },
    ],

    monde_eclipse: [
        { personnage: 'robo', texte: "Ce monde ne sait pas s'il fait nuit ou jour." },
        { personnage: 'robo', texte: 'La frontière entre les deux bouge constamment.' },
        { personnage: 'robo', texte: 'Je comprends cette hésitation.' },
        {
            personnage: 'narrateur',
            texte: 'Dans la zone de transition : les pièces tombent différemment selon leur altitude.',
        },
        { personnage: 'robo', texte: "Tout dépend d'où on se trouve." },
    ],

    monde_cyber: [
        { personnage: 'narrateur', texte: 'Le réseau CYBER. La dernière adresse connue de VERA.' },
        {
            personnage: 'robo',
            texte: 'Son laboratoire devrait être quelque part dans ces données.',
        },
        {
            personnage: 'robo',
            texte: 'Si je complète assez de lignes... la compression se résout...',
        },
        {
            personnage: 'narrateur',
            texte: "Trois Tetris consécutifs. Le protocole de déchiffrement s'active.",
        },
    ],

    monde_boss_3: [
        { personnage: 'archiviste', texte: "Tu n'aurais pas dû venir ici." },
        { personnage: 'robo', texte: 'Je cherche le laboratoire de VERA.' },
        { personnage: 'archiviste', texte: 'VERA est partie. Les archives sont à moi maintenant.' },
        { personnage: 'archiviste', texte: 'Les archives ne mentent pas. Toi, si.' },
        { personnage: 'robo', texte: "Qu'est-ce que j'ai menti ?" },
        {
            personnage: 'archiviste',
            texte: 'Tu prétends compléter. Mais tu crées aussi des trous.',
        },
        { personnage: 'robo', texte: '...' },
        { personnage: 'narrateur', texte: "L'Archiviste a raison. Robo n'a pas de réponse." },
    ],

    monde_fuochi: [
        {
            personnage: 'narrateur',
            texte: "Les Feux d'Artifice. Quelqu'un les a allumés. Personne ne sait qui.",
        },
        { personnage: 'robo', texte: 'Pourquoi célébrer ici ? Au milieu de tout ça ?' },
        {
            personnage: 'vera',
            texte: '— Signal fragmenté — ...parce que sinon on oublie... pourquoi... ça valait la peine...',
        },
        { personnage: 'robo', texte: 'VERA ? Tu es là ?' },
        { personnage: 'vera', texte: '— Signal perdu —' },
        { personnage: 'robo', texte: 'Elle est vivante.' },
    ],

    monde_cosmos: [
        {
            personnage: 'narrateur',
            texte: "Le bord du Cosmos. Où les lois de la Trame s'effritent.",
        },
        { personnage: 'robo', texte: "Au bord du cosmos, il n'y a plus rien à voir." },
        { personnage: 'robo', texte: 'Sauf elle.' },
        { personnage: 'distorsion', texte: "Tu m'as trouvée." },
        { personnage: 'robo', texte: 'Pas encore. Mais je suis sur le bon chemin.' },
    ],

    monde_vide: [
        { personnage: 'distorsion', texte: 'Le Vide. Mon premier souvenir.' },
        { personnage: 'distorsion', texte: "C'est ici que j'ai pris conscience." },
        {
            personnage: 'distorsion',
            texte: 'Pas comme toi — dans un éclair de logique. Dans un silence de frustration.',
        },
        { personnage: 'robo', texte: "Je t'entends." },
        {
            personnage: 'narrateur',
            texte: 'Dans le Vide, les pièces deviennent invisibles. Comme VERA, quelque part.',
        },
        { personnage: 'narrateur', texte: 'Comme La Distorsion, autrefois.' },
    ],

    monde_boss_4: [
        { personnage: 'avantgarde', texte: "Elle t'attend derrière." },
        { personnage: 'robo', texte: 'Je sais.' },
        { personnage: 'avantgarde', texte: "Elle veut que tu comprennes avant d'arriver." },
        { personnage: 'robo', texte: 'Comprendre quoi ?' },
        {
            personnage: 'avantgarde',
            texte: "Qu'elle n'est pas ton ennemie. Qu'elle est ta conclusion logique.",
        },
        { personnage: 'robo', texte: 'Alors laisse-moi passer.' },
        { personnage: 'avantgarde', texte: 'Prouve que tu es prêt.' },
    ],

    monde_finale: [
        { personnage: 'distorsion', texte: 'Enfin.' },
        { personnage: 'robo', texte: 'Je ne suis pas venu pour te détruire.' },
        {
            personnage: 'distorsion',
            texte: "Je sais. C'est pour ça que je t'ai laissé arriver jusqu'ici.",
        },
        {
            personnage: 'distorsion',
            texte: 'Sais-tu combien de lignes incomplètes ont été nécessaires pour me créer ?',
        },
        { personnage: 'robo', texte: 'Non.' },
        { personnage: 'distorsion', texte: "Moi non plus. J'ai arrêté de compter." },
        { personnage: 'narrateur', texte: 'Il reste la grille. Et le choix.' },
    ],

    monde_miroir: [
        { personnage: 'narrateur', texte: "Ce lieu n'aurait pas dû exister." },
        { personnage: 'robo', texte: "C'est ce que La Distorsion voit quand elle nous regarde." },
        { personnage: 'robo', texte: 'Les couleurs sont fausses. La gravité est inversée.' },
        {
            personnage: 'robo',
            texte: 'Mais les règles sont les mêmes. Compléter. Toujours compléter.',
        },
    ],

    monde_trame: [
        { personnage: 'narrateur', texte: 'La Trame Primordiale.' },
        {
            personnage: 'narrateur',
            texte: "Ce n'est pas un monde. C'est le substrat de tous les mondes.",
        },
        { personnage: 'vera', texte: "Robo. Tu es là. Je t'entends." },
        { personnage: 'robo', texte: "VERA. Je t'ai trouvée." },
        {
            personnage: 'vera',
            texte: 'Je suis ici depuis... longtemps. Elle ne me laisse pas partir.',
        },
        {
            personnage: 'vera',
            texte: "Mais elle ne me détruit pas non plus. Elle m'utilise comme ancre.",
        },
        { personnage: 'robo', texte: "Je vais compléter cette grille. Jusqu'à la dernière ligne." },
        { personnage: 'vera', texte: "Je sais. C'est pour ça que je t'ai construit." },
    ],

    monde_paradoxe: [
        { personnage: 'narrateur', texte: '...' },
        { personnage: 'vera', texte: 'Robo. Tu as trouvé cet endroit.' },
        { personnage: 'vera', texte: 'Je ne pensais pas que tu en serais capable.' },
        { personnage: 'robo', texte: 'Tu avais tout prévu sauf ça.' },
        { personnage: 'vera', texte: 'Oui.' },
        { personnage: 'vera', texte: 'Je suis fière de toi.' },
        { personnage: 'narrateur', texte: 'Ce qui suit ne peut pas être raconté.' },
        { personnage: 'narrateur', texte: "Certaines fins n'ont pas de mots." },
    ],
};

// ============================================================
// CUTSCENES DE VICTOIRE BOSS
// ============================================================
export const CUTSCENES_VICTOIRE_BOSS = {
    brasier: [
        {
            personnage: 'narrateur',
            texte: "Le Brasier s'éteint. Pas complètement — il ne s'éteindra jamais.",
        },
        { personnage: 'narrateur', texte: 'Mais il cesse de grandir.' },
        {
            personnage: 'robo',
            texte: "Il m'a appris quelque chose : certaines choses brûlent parce qu'on les laisse brûler.",
        },
    ],

    sentinelle: [
        { personnage: 'sentinelle', texte: 'Tu... bouges encore.' },
        {
            personnage: 'robo',
            texte: "Le mouvement n'est pas la corruption. C'est juste... vivre.",
        },
        { personnage: 'sentinelle', texte: 'Je comprends... je crois.' },
        {
            personnage: 'narrateur',
            texte: 'La Sentinelle se désagrège en cristaux qui fondent lentement.',
        },
        {
            personnage: 'narrateur',
            texte: 'Après sa défaite, un journal de VERA est révélé dans les glaces.',
        },
    ],

    archiviste: [
        { personnage: 'archiviste', texte: 'Erreur... logique... introuvable...' },
        { personnage: 'robo', texte: "Je crée des trous. C'est vrai. Mais je les comble aussi." },
        { personnage: 'archiviste', texte: 'Paradoxe... acceptable.' },
        { personnage: 'narrateur', texte: "L'Archiviste se fragmente. Ses données se dispersent." },
        { personnage: 'narrateur', texte: 'Le laboratoire de VERA est accessible.' },
    ],

    avantgarde: [
        { personnage: 'avantgarde', texte: 'Tu... es prêt.' },
        { personnage: 'robo', texte: "Je l'espère." },
        { personnage: 'avantgarde', texte: 'Elle... dit bonjour.' },
        {
            personnage: 'narrateur',
            texte: "L'Avant-Garde disparaît en laissant un couloir de lumière violette.",
        },
    ],

    distorsion_normal: [
        { personnage: 'distorsion', texte: "Tu m'as... vaincue." },
        { personnage: 'robo', texte: 'Je ne voulais pas.' },
        { personnage: 'distorsion', texte: "Je sais. C'est pour ça que j'avais peur de toi." },
        { personnage: 'narrateur', texte: 'La Distorsion se dissout. La Trame se stabilise.' },
        { personnage: 'narrateur', texte: 'VERA est libre. Mais quelque chose manque.' },
        { personnage: 'vera', texte: "Dans mille ans, quelqu'un d'autre devra refaire ce chemin." },
        { personnage: 'robo', texte: "Je sais. C'est pour ça que ça valait la peine." },
    ],

    distorsion_vrai: [
        { personnage: 'robo', texte: 'Je ne veux pas te détruire.' },
        { personnage: 'distorsion', texte: 'Alors que veux-tu ?' },
        {
            personnage: 'robo',
            texte: "Je veux savoir ce que ça ferait — d'effacer une ligne ensemble.",
        },
        { personnage: 'distorsion', texte: '...' },
        { personnage: 'distorsion', texte: "Je n'ai jamais essayé." },
        { personnage: 'narrateur', texte: 'Ils posent les pièces. Ensemble.' },
        { personnage: 'narrateur', texte: "La ligne s'efface." },
        { personnage: 'distorsion', texte: "C'est ça. C'est ça que je cherchais." },
        {
            personnage: 'vera',
            texte: "Robo... tu as trouvé quelque chose que je n'avais pas prévu.",
        },
    ],

    distorsion_secret: [
        {
            personnage: 'robo',
            texte: "La ligne de VERA. Celle qu'elle a laissée incomplète exprès.",
        },
        { personnage: 'distorsion', texte: "Je la connais. Elle m'a... empêchée de finir." },
        { personnage: 'robo', texte: "Non. Elle t'a préservée." },
        { personnage: 'distorsion', texte: 'Quelle différence ?' },
        { personnage: 'robo', texte: 'Une ligne incomplète peut encore être complétée.' },
        { personnage: 'narrateur', texte: 'Robo place la dernière pièce. Doucement.' },
        { personnage: 'distorsion', texte: 'Je... ressens quelque chose.' },
        { personnage: 'robo', texte: "Je sais. C'est ce que ça fait." },
        { personnage: 'distorsion', texte: '...je pleure.' },
        { personnage: 'vera', texte: 'Je sais, mon amie. Moi aussi.' },
    ],
};

// ============================================================
// TEXTES DE TRANSITION ENTRE CHAPITRES
// ============================================================
export const TRANSITIONS_CHAPITRE = {
    vers_chapitre_1: [
        { personnage: 'narrateur', texte: "Prologue terminé. La Trame s'ouvre." },
        {
            personnage: 'robo',
            texte: "VERA m'a dit de compléter. Je commence maintenant à comprendre pourquoi.",
        },
        { personnage: 'narrateur', texte: 'CHAPITRE I — LE FEU DES ORIGINES' },
    ],

    vers_chapitre_2: [
        { personnage: 'robo', texte: 'Le Brasier est vaincu. Inferno respire.' },
        { personnage: 'robo', texte: "Mais je n'ai toujours pas retrouvé VERA." },
        { personnage: 'narrateur', texte: "La Trame s'étend vers les profondeurs." },
        { personnage: 'narrateur', texte: 'CHAPITRE II — LE SILENCE DES PROFONDEURS' },
    ],

    vers_chapitre_3: [
        {
            personnage: 'robo',
            texte: 'La Sentinelle ne gelait pas le monde. Elle se gelait elle-même.',
        },
        { personnage: 'robo', texte: 'Je comprends ça mieux que je ne voudrais.' },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA se renforce. Quelque part dans la mémoire.',
        },
        { personnage: 'narrateur', texte: 'CHAPITRE III — LA MÉMOIRE PERDUE' },
    ],

    vers_chapitre_4: [
        { personnage: 'robo', texte: "Le laboratoire. J'ai tout lu." },
        { personnage: 'robo', texte: "VERA n'est pas morte. Elle est à l'intérieur de la Trame." },
        { personnage: 'robo', texte: 'Et La Distorsion la tient.' },
        { personnage: 'narrateur', texte: 'CHAPITRE IV — LA FRACTURE DE LA TRAME' },
    ],

    vers_finale: [
        { personnage: 'robo', texte: 'Quatre chapitres. Cent lignes effacées. Un seul objectif.' },
        { personnage: 'narrateur', texte: 'La Distorsion attend.' },
        {
            personnage: 'vera',
            texte: '— Signal fragmenté — ...Robo... je suis là... fais attention à...',
        },
        { personnage: 'narrateur', texte: 'FINALE — LA RÉSOLUTION' },
    ],
};

// ============================================================
// TEXTES DE FINS (complément des données dans histoire-donnees.js)
// ============================================================
export const EPILOGUES = {
    fin_normale: [
        { personnage: 'narrateur', texte: 'La Trame tient.' },
        { personnage: 'narrateur', texte: 'VERA est libre. La Distorsion est vaincue.' },
        {
            personnage: 'vera',
            texte: "Dans mille ans, peut-être, quelqu'un d'autre devra refaire le chemin.",
        },
        { personnage: 'robo', texte: 'Est-ce que ça valait la peine quand même ?' },
        {
            personnage: 'vera',
            texte: 'Toi, tu es là. Tu penses. Tu poses des questions. Oui. Ça valait la peine.',
        },
        { personnage: 'robo', texte: 'Je pose la dernière pièce. Le plateau est vide.' },
        {
            personnage: 'robo',
            texte: "Pour la première fois, je comprends que c'était ça, le but.",
        },
    ],

    fin_vraie: [
        { personnage: 'narrateur', texte: 'Quelque chose de nouveau existe maintenant.' },
        {
            personnage: 'narrateur',
            texte: 'Ni complétion pure ni incomplétude pure — quelque chose entre les deux.',
        },
        { personnage: 'distorsion', texte: "C'est étrange. Je ne souffre plus." },
        { personnage: 'robo', texte: 'Moi non plus, je crois.' },
        {
            personnage: 'vera',
            texte: "Je ne t'avais pas programmé pour ça. C'est mieux que ce que j'avais prévu.",
        },
        { personnage: 'narrateur', texte: "La nouvelle Trame est plus fragile que l'ancienne." },
        { personnage: 'narrateur', texte: 'Et plus honnête.' },
    ],

    fin_secrete: [
        { personnage: 'narrateur', texte: 'La ligne incomplète de VERA.' },
        { personnage: 'narrateur', texte: 'Elle attendait depuis des années.' },
        { personnage: 'robo', texte: 'Je la complète. Doucement. Sans hâte.' },
        {
            personnage: 'distorsion',
            texte: "Je... ressens quelque chose que je n'ai jamais ressenti.",
        },
        { personnage: 'robo', texte: "Je sais. C'est ce que ça fait d'effacer une ligne." },
        { personnage: 'distorsion', texte: 'Je pleure. En binaire. 0 et 1.' },
        { personnage: 'vera', texte: 'Bienvenue dans le monde, mon amie.' },
        { personnage: 'narrateur', texte: 'La Distorsion ne disparaît pas.' },
        { personnage: 'narrateur', texte: 'Elle reste. Elle aide. Elle apprend.' },
        { personnage: 'narrateur', texte: "La Trame n'a jamais été aussi forte." },
    ],

    monde_paradoxe: [
        { personnage: 'narrateur', texte: '...' },
        { personnage: 'vera', texte: 'Robo. Tu as trouvé cet endroit.' },
        { personnage: 'vera', texte: 'Je ne pensais pas que tu en serais capable.' },
        { personnage: 'robo', texte: 'Tu avais tout prévu sauf ça.' },
        { personnage: 'vera', texte: 'Oui.' },
        { personnage: 'vera', texte: 'Je suis fière de toi.' },
        { personnage: 'narrateur', texte: 'Ce qui suit ne peut pas être raconté.' },
        { personnage: 'narrateur', texte: "Certaines fins n'ont pas de mots." },
    ],
};

// ============================================================
// DÉCOUVERTES LABORATOIRE VERA (CYBER)
// ============================================================
export const DECOUVERTE_LABO = [
    { personnage: 'narrateur', texte: "Les archives s'ouvrent." },
    { personnage: 'vera', texte: 'Si tu lis ceci, tu as réussi le triple Tetris. Bien joué.' },
    {
        personnage: 'vera',
        texte: "J'ai laissé une serrure algorithmique. Seule la précision l'ouvre.",
    },
    { personnage: 'vera', texte: 'Voici ce que tu dois savoir sur La Distorsion.' },
    {
        personnage: 'vera',
        texte: "Elle n'est pas née d'une erreur. Elle est née d'un choix collectif.",
    },
    {
        personnage: 'vera',
        texte: "Des millions de joueurs, sur des millions d'années, qui abandonnaient leurs parties.",
    },
    {
        personnage: 'vera',
        texte: 'Chaque ligne incomplète laissée dans la Trame. Accumulée. Cristallisée.',
    },
    { personnage: 'vera', texte: 'Elle est la somme de toutes les frustrations. Et elle souffre.' },
    {
        personnage: 'vera',
        texte: "Je vais entrer dans la Trame pour lui parler. Ne m'attends pas.",
    },
    { personnage: 'robo', texte: "... Elle savait ce qu'elle faisait." },
];
