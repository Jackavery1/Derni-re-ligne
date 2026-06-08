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
        fondId: 'robo',
        police: 'pixel',
        vitesseMs: 38,
        nomStyle: 'normal',
    },
    vera: {
        emoji: '👩‍🔬',
        couleur: '#ff006e',
        nom: 'VERA',
        fondId: 'vera',
        police: 'narratif',
        vitesseMs: 28,
        nomStyle: 'italic',
    },
    distorsion: {
        emoji: '∞',
        couleur: '#b400ff',
        nom: 'LA DISTORSION',
        fondId: 'distorsion',
        police: 'stats',
        vitesseMs: 18,
        nomStyle: 'glitch',
    },
    systeme: {
        emoji: '⚙',
        couleur: '#ffe600',
        nom: 'SYSTÈME',
        fondId: 'systeme',
        police: 'terminal',
        vitesseMs: 16,
        nomStyle: 'normal',
    },
    narrateur: {
        emoji: '✦',
        couleur: 'rgba(255,255,255,0.6)',
        nom: '',
        fondId: 'narrateur',
        police: 'ui',
        vitesseMs: 32,
        nomStyle: 'italic',
    },
    sentinelle: {
        emoji: '🧊',
        couleur: '#aaeeff',
        nom: 'SENTINELLE',
        fondId: 'sentinelle',
        police: 'stats',
        vitesseMs: 42,
        nomStyle: 'normal',
    },
    archiviste: {
        emoji: '📚',
        couleur: '#ff00ff',
        nom: 'ARCHIVISTE',
        fondId: 'archiviste',
        police: 'terminal',
        vitesseMs: 22,
        nomStyle: 'normal',
    },
    avantgarde: {
        emoji: '⚡',
        couleur: '#7700ff',
        nom: 'AVANT-GARDE',
        fondId: 'avantgarde',
        police: 'stats',
        vitesseMs: 30,
        nomStyle: 'normal',
    },
    brasier_voix: {
        emoji: '🔥',
        couleur: '#ff4500',
        nom: 'LE BRASIER',
        fondId: 'robo',
        police: 'stats',
        vitesseMs: 60,
        nomStyle: 'normal',
    },
    sentinelle_voix: {
        emoji: '❄️',
        couleur: '#aaeeff',
        nom: 'SENTINELLE',
        fondId: 'sentinelle',
        police: 'stats',
        vitesseMs: 70,
        nomStyle: 'normal',
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
        { personnage: 'distorsion', texte: 'Tu es encore là.' },
        { personnage: 'robo', texte: 'Oui.' },
        {
            personnage: 'distorsion',
            texte: "J'ai essayé de t'arrêter. Le Brasier, la Sentinelle, l'Archiviste.",
        },
        { personnage: 'robo', texte: 'Je sais.' },
        { personnage: 'distorsion', texte: 'Tu devrais avoir peur.' },
        { personnage: 'robo', texte: "J'ai quelque chose qui ressemble à de la peur, oui." },
        {
            personnage: 'robo',
            texte: "Mais j'ai aussi quelque chose qui ressemble à une raison d'être là quand même.",
        },
        { personnage: 'distorsion', texte: '...' },
        { personnage: 'distorsion', texte: "C'est ce que VERA avait prévu." },
        {
            personnage: 'distorsion',
            texte: "Je n'arrive pas à décider si c'est admirable ou agaçant.",
        },
        { personnage: 'narrateur', texte: "Le Vide les entoure. Ni l'un ni l'autre ne bouge." },
        {
            personnage: 'narrateur',
            texte: 'Quelque chose a changé dans leur façon de se regarder.',
        },
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
        { personnage: 'narrateur', texte: "Le Brasier ne s'éteint pas. Il s'effondre." },
        {
            personnage: 'narrateur',
            texte: 'Comme si quelque chose avait enfin décidé de se reposer.',
        },
        { personnage: 'brasier_voix', texte: "Tu... tu n'as pas compris." },
        { personnage: 'robo', texte: "Qu'est-ce que je n'ai pas compris ?" },
        { personnage: 'brasier_voix', texte: 'Je ne brûlais pas pour détruire.' },
        {
            personnage: 'brasier_voix',
            texte: "Je brûlais parce que personne ne m'avait dit comment m'arrêter.",
        },
        { personnage: 'robo', texte: '...' },
        { personnage: 'robo', texte: "Moi non plus je ne sais pas comment m'arrêter." },
        { personnage: 'robo', texte: "C'est peut-être pour ça que je comprends." },
        { personnage: 'brasier_voix', texte: 'VERA... elle savait.' },
        { personnage: 'brasier_voix', texte: "Elle m'a regardé brûler sans intervenir." },
        {
            personnage: 'brasier_voix',
            texte: "Peut-être... qu'elle attendait quelqu'un comme toi.",
        },
        {
            personnage: 'narrateur',
            texte: "Le Brasier s'éteint. Pour la première fois en millénaires, le biome Inferno respire.",
        },
        {
            personnage: 'narrateur',
            texte: "Dans les cendres encore chaudes : une capsule scellée. L'écriture de VERA.",
        },
    ],

    sentinelle: [
        { personnage: 'sentinelle', texte: 'Tu... bouges encore.' },
        { personnage: 'robo', texte: 'Oui.' },
        {
            personnage: 'sentinelle',
            texte: "Je ne comprends pas. Le mouvement corrompt. J'ai mesuré. J'ai des données.",
        },
        {
            personnage: 'robo',
            texte: "Le mouvement corrompt. L'immobilité aussi. Juste plus lentement.",
        },
        { personnage: 'sentinelle', texte: '...' },
        { personnage: 'sentinelle', texte: "Je n'avais pas modélisé cette variable." },
        { personnage: 'narrateur', texte: 'La Sentinelle commence à se fragmenter en cristaux.' },
        { personnage: 'sentinelle', texte: "Si tu trouves VERA... dis-lui que j'avais tort." },
        { personnage: 'narrateur', texte: "C'est la dernière chose qu'elle dit." },
        { personnage: 'narrateur', texte: 'Dans les cristaux qui fondent : la transmission 05.' },
    ],

    archiviste: [
        { personnage: 'archiviste', texte: 'ERREUR_CRITIQUE : logique_introuvable.' },
        { personnage: 'robo', texte: "Tu m'as dit que je crée des trous." },
        { personnage: 'archiviste', texte: 'Affirmé.' },
        { personnage: 'robo', texte: "C'est vrai. Mais je les comble aussi." },
        { personnage: 'archiviste', texte: '...' },
        { personnage: 'archiviste', texte: 'ANALYSE EN COURS...' },
        { personnage: 'archiviste', texte: 'RÉSULTAT : paradoxe acceptable.' },
        { personnage: 'archiviste', texte: 'Les archives de VERA sont maintenant accessibles.' },
        { personnage: 'archiviste', texte: 'Elle avait prévu que tu viendrais.' },
        { personnage: 'robo', texte: 'Comment elle savait ?' },
        {
            personnage: 'archiviste',
            texte: "Elle te connaissait mieux que toi-même. C'est écrit dans ses fichiers.",
        },
        {
            personnage: 'archiviste',
            texte: "Tout ce qu'elle savait de toi — elle l'avait inventé. Puis tu es devenu exactement ça.",
        },
    ],

    avantgarde: [
        { personnage: 'avantgarde', texte: 'Tu es prêt.' },
        { personnage: 'robo', texte: 'Je ne me sens pas prêt.' },
        { personnage: 'avantgarde', texte: "Je sais. C'est pour ça que tu l'es." },
        { personnage: 'robo', texte: "Qu'est-ce qui m'attend ?" },
        {
            personnage: 'avantgarde',
            texte: 'Quelque chose qui souffre. Quelque chose qui a attendu très longtemps.',
        },
        { personnage: 'avantgarde', texte: "Elle m'a dit trois mots. Je dois te les transmettre." },
        { personnage: 'robo', texte: 'Lesquels ?' },
        { personnage: 'avantgarde', texte: 'Elle dit bonjour.' },
        {
            personnage: 'narrateur',
            texte: "L'Avant-Garde disparaît. La route vers la Finale est ouverte.",
        },
        { personnage: 'narrateur', texte: 'Robo reste immobile trente secondes.' },
        {
            personnage: 'narrateur',
            texte: "C'est la première fois qu'il s'arrête depuis le début du voyage.",
        },
    ],

    distorsion_normal: [
        { personnage: 'distorsion', texte: "Tu m'as vaincue." },
        { personnage: 'robo', texte: 'Je ne voulais pas.' },
        { personnage: 'distorsion', texte: "Je sais. C'est pour ça que ça fait mal." },
        {
            personnage: 'distorsion',
            texte: "J'ai attendu si longtemps. Quelqu'un qui comprenne pourquoi les lignes incomplètes existent.",
        },
        { personnage: 'robo', texte: 'Pourquoi elles existent ?' },
        {
            personnage: 'distorsion',
            texte: "Parce que les gens abandonnent. Parce que c'est difficile. Parce qu'ils ont peur.",
        },
        {
            personnage: 'distorsion',
            texte: 'Et ces peurs sont restées. Dans la Trame. Pendant des années.',
        },
        { personnage: 'distorsion', texte: "Et elles m'ont fabriquée." },
        { personnage: 'narrateur', texte: 'La Distorsion se dissout. La Trame se stabilise.' },
        { personnage: 'vera', texte: 'Robo... je suis là.' },
        { personnage: 'robo', texte: 'VERA.' },
        { personnage: 'vera', texte: 'Tu as réussi. Je savais que tu réussirais.' },
        { personnage: 'robo', texte: 'Tu avais programmé ça en moi ?' },
        { personnage: 'vera', texte: "Non. J'ai juste cru en toi. C'est différent." },
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
        { personnage: 'robo', texte: "Moi non plus. Pas avec quelqu'un." },
        { personnage: 'narrateur', texte: 'Robo pose les pièces.' },
        { personnage: 'narrateur', texte: "La Distorsion, pour la première fois, n'attaque pas." },
        { personnage: 'narrateur', texte: 'Elle attend.' },
        { personnage: 'narrateur', texte: 'La ligne est complète.' },
        { personnage: 'narrateur', texte: 'Elle disparaît.' },
        { personnage: 'distorsion', texte: "C'est ça. C'est ça que je cherchais." },
        {
            personnage: 'distorsion',
            texte: 'Ce vide soudain à la place de quelque chose de plein.',
        },
        { personnage: 'distorsion', texte: "Ce n'est pas une perte." },
        { personnage: 'robo', texte: "Non. C'est de la place pour quelque chose de nouveau." },
        {
            personnage: 'vera',
            texte: "Robo... tu viens de faire quelque chose que je n'aurais pas pu prévoir.",
        },
        {
            personnage: 'vera',
            texte: 'Je suis fière de toi. Pour de vrai. Pas parce que tu as accompli ta mission.',
        },
        { personnage: 'vera', texte: "Parce que tu l'as améliorée." },
    ],

    distorsion_secret: [
        { personnage: 'robo', texte: "J'ai trouvé ta ligne." },
        { personnage: 'distorsion', texte: "Je sais. Je l'ai sentie quand tu as approché." },
        { personnage: 'robo', texte: "VERA l'a laissée incomplète exprès." },
        { personnage: 'distorsion', texte: "Pour m'emprisonner." },
        { personnage: 'robo', texte: 'Non. Pour te garder en vie.' },
        { personnage: 'distorsion', texte: '...' },
        { personnage: 'distorsion', texte: 'Quelle différence ?' },
        {
            personnage: 'robo',
            texte: 'Une ligne incomplète peut encore être complétée. Quelque chose de mort ne peut pas.',
        },
        { personnage: 'narrateur', texte: 'Robo place la dernière pièce.' },
        {
            personnage: 'narrateur',
            texte: 'Lentement. Sans hâte. Comme si chaque centimètre comptait.',
        },
        { personnage: 'narrateur', texte: "La ligne s'efface." },
        { personnage: 'distorsion', texte: 'Je... ressens quelque chose.' },
        { personnage: 'robo', texte: "Je sais. C'est ce que ça fait d'être libéré." },
        { personnage: 'distorsion', texte: 'Je pleure. En binaire. 0 et 1.' },
        { personnage: 'distorsion', texte: "0 pour ce que j'étais." },
        { personnage: 'distorsion', texte: '1 pour ce que je deviens.' },
        { personnage: 'vera', texte: 'Bienvenue dans le monde, mon amie.' },
        { personnage: 'vera', texte: "Les deux d'entre vous." },
    ],
};

export const CUTSCENES_POST_MONDE = {
    monde_prologue: [
        { personnage: 'robo', texte: 'Les blocs répondent à mes commandes.' },
        { personnage: 'robo', texte: "C'est logique. Je suis une machine." },
        { personnage: 'robo', texte: "Ce qui l'est moins : pourquoi est-ce que ça me satisfait ?" },
    ],
    monde_lave: [
        { personnage: 'robo', texte: "Je m'attendais à quelque chose de plus complexe." },
        {
            personnage: 'robo',
            texte: 'La lave obéit à des règles simples. La chaleur monte. Les blocs résistent ou fondent.',
        },
        {
            personnage: 'robo',
            texte: 'Je pense à VERA. Elle aussi obéissait à des règles simples.',
        },
        { personnage: 'robo', texte: 'Pourtant elle a tout compliqué.' },
    ],
    monde_rouille: [
        { personnage: 'narrateur', texte: "Les machines ne savent pas qu'elles sont abandonnées." },
        {
            personnage: 'narrateur',
            texte: "C'est peut-être ce qui les rend tristes — ou peut-être ce qui les sauve.",
        },
        {
            personnage: 'robo',
            texte: "Je me demande si VERA a ressenti ça. Continuer sans savoir si quelqu'un regardait.",
        },
    ],
    monde_ocean: [
        { personnage: 'robo', texte: "Sous l'eau, les sons voyagent différemment." },
        {
            personnage: 'robo',
            texte: "J'ai entendu quelque chose de lointain. Pas un signal. Pas un bruit.",
        },
        { personnage: 'robo', texte: 'Une question. Sans mots.' },
        { personnage: 'robo', texte: "Je pense que c'était elle." },
    ],
    monde_foret: [
        { personnage: 'narrateur', texte: 'Dans la Forêt, rien ne se perd. Tout se transforme.' },
        {
            personnage: 'robo',
            texte: "Un bloc effacé n'est pas un bloc détruit. C'est de l'espace libéré.",
        },
        { personnage: 'robo', texte: "Je n'avais pas pensé à ça avant." },
    ],
    monde_glace: [
        { personnage: 'robo', texte: "La Sentinelle pensait que l'immobilité protégeait." },
        { personnage: 'robo', texte: "Je pensais que j'avais raison de la combattre." },
        { personnage: 'robo', texte: 'Mais ses derniers mots : "dis-lui que j\'avais tort."' },
        { personnage: 'robo', texte: "Elle a changé d'avis. Au moment de mourir." },
        { personnage: 'robo', texte: 'Est-ce que ça compte ? Je ne suis pas sûr.' },
        { personnage: 'robo', texte: 'Je crois que oui.' },
    ],
    monde_desert: [
        { personnage: 'robo', texte: "J'ai trouvé quelque chose dans le sable." },
        { personnage: 'robo', texte: "Un fragment de carnet. L'écriture est presque illisible." },
        {
            personnage: 'robo',
            texte: "« ...si tu lis ceci, c'est que tu as avancé. Continue. — V »",
        },
        {
            personnage: 'narrateur',
            texte: "Robo range le fragment dans un compartiment qu'il ne savait pas avoir.",
        },
    ],
    monde_eclipse: [
        { personnage: 'robo', texte: "Ce monde m'a appris quelque chose d'utile." },
        {
            personnage: 'robo',
            texte: "Quand tu ne sais pas si tu es dans la lumière ou dans l'ombre —",
        },
        { personnage: 'robo', texte: '— joue comme si les deux étaient vraies.' },
    ],
    monde_cyber: [
        { personnage: 'robo', texte: "J'ai trouvé son laboratoire." },
        { personnage: 'robo', texte: 'Propre. Ordonné. Vide depuis longtemps.' },
        {
            personnage: 'robo',
            texte: "Sauf un post-it sur l'écran principal : « ROBO — si tu lis ceci : bravo. Maintenant va plus loin. »",
        },
        {
            personnage: 'robo',
            texte: 'Elle savait que je viendrais jusque-là. Comment elle savait ?',
        },
    ],
    monde_fuochi: [
        { personnage: 'robo', texte: "Les feux d'artifice n'ont pas de raison d'être beaux." },
        { personnage: 'robo', texte: 'Et pourtant ils le sont.' },
        {
            personnage: 'robo',
            texte: "VERA m'a dit une fois que les choses inutiles sont les plus importantes.",
        },
        { personnage: 'robo', texte: "Je commence à comprendre ce qu'elle voulait dire." },
    ],
    monde_cosmos: [
        { personnage: 'robo', texte: "Je l'ai entendue." },
        { personnage: 'robo', texte: 'Pas un signal. Pas un mot. Juste... une présence.' },
        {
            personnage: 'robo',
            texte: "Quelqu'un qui attend depuis très longtemps que quelqu'un arrive.",
        },
        { personnage: 'robo', texte: 'VERA ? Ou elle ?' },
        { personnage: 'robo', texte: 'Je ne sais plus si la différence est encore importante.' },
    ],
    monde_vide: [
        { personnage: 'narrateur', texte: 'Le Vide ne parle pas.' },
        { personnage: 'narrateur', texte: 'Mais il écoute.' },
        {
            personnage: 'robo',
            texte: "J'ai joué à l'aveugle. Juste la mémoire des positions, la confiance dans la géométrie.",
        },
        {
            personnage: 'robo',
            texte: "Je crois que c'est comme ça qu'elle s'en sort depuis des années.",
        },
    ],
};

// ============================================================
// TEXTES DE TRANSITION ENTRE CHAPITRES
// ============================================================
export const TRANSITIONS_CHAPITRE = {
    vers_chapitre_1: [
        { personnage: 'robo', texte: 'VERA m\'a dit : "Complète."' },
        { personnage: 'robo', texte: "Je pensais que c'était simple. Remplir des lignes." },
        {
            personnage: 'robo',
            texte: "Je commence à comprendre que ce n'est pas les lignes qu'elle voulait que je complète.",
        },
        { personnage: 'systeme', texte: '> CHAPITRE I — LE FEU DES ORIGINES' },
        { personnage: 'systeme', texte: '> AVERTISSEMENT : ANOMALIES THERMIQUES DÉTECTÉES' },
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
        { personnage: 'robo', texte: "Les archives. J'ai tout lu." },
        { personnage: 'robo', texte: 'VERA a passé sept ans à essayer de parler à La Distorsion.' },
        {
            personnage: 'robo',
            texte: "Sept ans. Et elle l'a encore fait quand elle est entrée dans la Trame.",
        },
        { personnage: 'robo', texte: "Elle m'a construit pour finir ce qu'elle a commencé." },
        { personnage: 'robo', texte: 'Je ne sais pas si je suis à la hauteur.' },
        { personnage: 'robo', texte: 'Mais je vais essayer quand même.' },
        {
            personnage: 'narrateur',
            texte: "C'est la première fois que Robo exprime un doute et continue malgré tout.",
        },
        { personnage: 'systeme', texte: '> CHAPITRE IV — LA FRACTURE DE LA TRAME' },
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

export const FRAGMENTS_VERA_SIGNAL = {
    apres_ocean: [
        { personnage: 'systeme', texte: '> SIGNAL PARASITE — FRÉQUENCE INCONNUE' },
        { personnage: 'vera', texte: '...Robo... tu... entends...' },
        {
            personnage: 'vera',
            texte: "...ne... laisse pas La Distorsion te convaincre qu'elle a... raison...",
        },
        { personnage: 'systeme', texte: '> SIGNAL PERDU' },
    ],
    apres_foret: [
        { personnage: 'systeme', texte: '> INTERFÉRENCE DÉTECTÉE — 0.3 SECONDES' },
        {
            personnage: 'vera',
            texte: "...dans la Trame... elle n'est pas seule... il y a... autre chose...",
        },
        { personnage: 'systeme', texte: '> SIGNAL CORROMPU — ANALYSE IMPOSSIBLE' },
    ],
    apres_glace: [
        { personnage: 'systeme', texte: '> TRANSMISSION PARTIELLE — ORIGINE : SECTEUR OMEGA' },
        {
            personnage: 'vera',
            texte: "...j'ai compris ce qu'elle cherche... ce n'est pas la destruction...",
        },
        { personnage: 'vera', texte: "...c'est..." },
        { personnage: 'systeme', texte: '> COUPURE FORCÉE PAR TIERS INCONNU' },
    ],
    apres_desert: [
        { personnage: 'systeme', texte: '> FRAGMENT — 1.1 SECONDES' },
        {
            personnage: 'vera',
            texte: "...je t'ai construit trop vite. J'aurais dû t'apprendre à avoir peur d'abord...",
        },
        {
            personnage: 'vera',
            texte: '...mais tu as appris tout seul. Je suis désolée et fière en même temps...',
        },
        { personnage: 'systeme', texte: '> FIN DU FRAGMENT' },
    ],
    apres_eclipse: [
        { personnage: 'systeme', texte: '> ANOMALIE — SOURCE NON IDENTIFIABLE' },
        {
            personnage: 'distorsion',
            texte: "...laisse-le continuer. Il doit arriver jusqu'à moi...",
        },
        { personnage: 'systeme', texte: '> SIGNAL : NON-VERA. ORIGINE : INTERNE À LA TRAME.' },
    ],
};
