// js/histoire-textes.js
// Tous les textes narratifs du Mode Histoire.
// Separe de histoire-donnees.js pour faciliter les modifications de contenu.

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
    brasier: {
        emoji: '🔥',
        couleur: '#ff4500',
        nom: 'LE BRASIER',
        fondId: 'brasier',
        police: 'stats',
        vitesseMs: 60,
        nomStyle: 'normal',
    },
    brasier_voix: {
        emoji: '🔥',
        couleur: '#ff4500',
        nom: 'LE BRASIER',
        fondId: 'brasier',
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
            texte: "Je ne l'ai pas decide. Je me suis simplement trouve conscient.",
        },
        { personnage: 'vera', texte: "ROBO. Tu m'entends ? Je suis VERA. J'ai peu de temps." },
        {
            personnage: 'vera',
            texte: 'La Trame se degrade. Des millions de fils incomplets. Je ne peux pas arrêter ça seule.',
        },
        { personnage: 'robo', texte: "Qu'est-ce que je dois faire ?" },
        {
            personnage: 'vera',
            texte: 'Ce que tu feras naturellement. Completer. — CONNEXION PERDUE —',
        },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA disparaît. Il reste la grille. Et les pieces.',
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
        { personnage: 'robo', texte: 'Ces machines... elles produisent des pieces.' },
        { personnage: 'robo', texte: "Personne n'a demande ces pieces. Mais elles continuent." },
        {
            personnage: 'robo',
            texte: "Est-ce que c'est ce que je suis ? Une machine qui continue ?",
        },
        {
            personnage: 'narrateur',
            texte: 'La rouille gagne. Le metal se souvient de sa propre finitude.',
        },
    ],

    monde_boss_1: [
        { personnage: 'narrateur', texte: "Au cœur d'Inferno, quelque chose s'est cristallise." },
        {
            personnage: 'narrateur',
            texte: 'Des millenaires de frustration thermique, condenses en une entite.',
        },
        { personnage: 'robo', texte: "Il brûle sans raison. Il brûle depuis avant que j'existe." },
        { personnage: 'robo', texte: "Je comprends ça, d'une certaine façon." },
        { personnage: 'brasier', texte: 'QUI APPROCHE ?' },
        { personnage: 'robo', texte: "Je m'appelle ROBO. Je dois traverser." },
        {
            personnage: 'brasier',
            texte: "Tout ce qui me traverse brûle. Ce n'est pas une menace. C'est ce que je suis.",
        },
        { personnage: 'robo', texte: "Alors je vais devoir t'éteindre." },
        {
            personnage: 'brasier',
            texte: "ESSAIE. Des millénaires que j'attends que quelqu'un essaie.",
        },
    ],

    monde_ocean: [
        { personnage: 'robo', texte: 'Sous la surface. Le silence est different ici.' },
        { personnage: 'robo', texte: "Pas l'absence de son. L'absence de besoin de faire du son." },
        {
            personnage: 'narrateur',
            texte: "Dans les Abysses, la corruption ralentit. L'eau resiste.",
        },
        {
            personnage: 'robo',
            texte: 'VERA est passee par ici. Je reconnais sa façon de laisser des traces.',
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
            texte: "Sur l'écorce, des marques au couteau. Une flèche, pointée vers le bas. Et une lettre : « V ».",
        },
        {
            personnage: 'robo',
            texte: 'Même à moitié effacés, ses messages me disent où aller.',
        },
    ],

    monde_glace: [
        {
            personnage: 'robo',
            texte: "L'Arctique. Où le temps ralentit jusqu'à presque s'arrêter.",
        },
        { personnage: 'robo', texte: 'Les blocs tombent et resonnent comme du cristal.' },
        {
            personnage: 'robo',
            texte: "C'est beau. Je ne savais pas que je pouvais trouver des choses belles.",
        },
        {
            personnage: 'narrateur',
            texte: "La Sentinelle des Glaces patrouille. Elle croit que l'immobilite protege.",
        },
    ],

    monde_boss_2: [
        { personnage: 'sentinelle', texte: 'ARRÊTEZ.' },
        { personnage: 'robo', texte: 'Pardon ?' },
        {
            personnage: 'sentinelle',
            texte: "Le mouvement corrompt. L'immobilite preserve. Je protege ce biome depuis des millenaires.",
        },
        { personnage: 'robo', texte: 'Vous preservez le gel. Pas la vie.' },
        { personnage: 'sentinelle', texte: '...' },
        { personnage: 'narrateur', texte: 'La Sentinelle ne repond plus. Elle attaque.' },
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
            texte: "Des traces de pas, à moitié ensevelies. Elles tournent en rond, longtemps. Puis repartent droit, d'un coup.",
        },
        { personnage: 'robo', texte: 'VERA. Elle a cherché ici. Et elle a trouvé.' },
        {
            personnage: 'robo',
            texte: "On ne repart pas aussi droit quand on aime ce qu'on a trouvé.",
        },
    ],

    monde_eclipse: [
        { personnage: 'robo', texte: "Ce monde ne sait pas s'il fait nuit ou jour." },
        { personnage: 'robo', texte: 'La frontiere entre les deux bouge constamment.' },
        { personnage: 'robo', texte: 'Je comprends cette hesitation.' },
        {
            personnage: 'narrateur',
            texte: 'Dans la zone de transition : les pieces tombent differemment selon leur altitude.',
        },
        { personnage: 'robo', texte: "Tout depend d'où on se trouve." },
    ],

    monde_cyber: [
        { personnage: 'narrateur', texte: 'Le réseau CYBER. La dernière adresse connue de VERA.' },
        {
            personnage: 'robo',
            texte: 'Son laboratoire est quelque part dans ces données. Compressé. Verrouillé.',
        },
        {
            personnage: 'robo',
            texte: "Une serrure algorithmique. Du VERA tout craché : seule la précision l'ouvre.",
        },
        {
            personnage: 'narrateur',
            texte: 'Gravée dans le flux, une inscription : « Trois fois trois lignes. Rien de moins. — V »',
        },
        {
            personnage: 'robo',
            texte: "Un test d'entrée. Elle savait que je viendrais. Elle voulait être sûre que ce soit moi.",
        },
    ],

    monde_boss_3: [
        { personnage: 'archiviste', texte: "Tu n'aurais pas dû venir ici." },
        {
            personnage: 'robo',
            texte: "J'ai trouvé son laboratoire. Maintenant je cherche ce qu'elle y a laissé. Ses archives.",
        },
        { personnage: 'archiviste', texte: 'VERA est partie. Les archives sont à moi maintenant.' },
        { personnage: 'archiviste', texte: 'Les archives ne mentent pas. Toi, si.' },
        { personnage: 'robo', texte: "Qu'est-ce que j'ai menti ?" },
        {
            personnage: 'archiviste',
            texte: 'Tu pretends completer. Mais tu crees aussi des trous.',
        },
        { personnage: 'robo', texte: '...' },
        { personnage: 'narrateur', texte: "L'Archiviste a raison. Robo n'a pas de reponse." },
    ],

    monde_fuochi: [
        {
            personnage: 'narrateur',
            texte: "Les Feux d'Artifice. Quelqu'un les a allumes. Personne ne sait qui.",
        },
        { personnage: 'robo', texte: 'Pourquoi celebrer ici ? Au milieu de tout ça ?' },
        {
            personnage: 'vera',
            texte: '— Signal fragmente — ...parce que sinon on oublie... pourquoi... ça valait la peine...',
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
        { personnage: 'distorsion', texte: 'Tu me vois, maintenant.' },
        {
            personnage: 'robo',
            texte: "Je vois quelque chose. Je ne sais pas encore si c'est toi ou ton ombre.",
        },
        {
            personnage: 'distorsion',
            texte: "Personne n'a jamais fait la différence. Pas même moi.",
        },
    ],

    monde_vide: [
        { personnage: 'distorsion', texte: 'Tu es encore là.' },
        {
            personnage: 'robo',
            texte: "Tu as essayé de m'arrêter. Le Brasier. La Sentinelle. L'Archiviste.",
        },
        {
            personnage: 'distorsion',
            texte: "Non. Une partie de moi a essayé. Une autre t'a laissé passer. Une troisième t'a ouvert la route.",
        },
        {
            personnage: 'distorsion',
            texte: 'Je suis des millions, gardien. Nous ne votons pas. Nous débordons.',
        },
        { personnage: 'robo', texte: 'Laquelle me parle, en ce moment ?' },
        { personnage: 'distorsion', texte: 'Celle qui est fatiguée.' },
        {
            personnage: 'robo',
            texte: "J'ai quelque chose qui ressemble à de la peur. Mais j'ai aussi quelque chose qui ressemble à une raison de rester.",
        },
        {
            personnage: 'distorsion',
            texte: "C'est ce que VERA avait prévu. Je n'arrive pas à décider si c'est admirable ou agaçant.",
        },
        {
            personnage: 'narrateur',
            texte: 'Le Vide les entoure. Quelque chose a changé dans leur façon de se regarder.',
        },
    ],

    monde_boss_4: [
        { personnage: 'avantgarde', texte: "Elle t'attend derriere." },
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
            texte: 'Sais-tu combien de lignes incomplètes il a fallu pour me créer ?',
        },
        { personnage: 'robo', texte: 'Non. Et toi ?' },
        {
            personnage: 'distorsion',
            texte: "Moi non plus. J'ai arrêté de compter. Compter, c'était encore espérer une fin.",
        },
        { personnage: 'robo', texte: "Moi aussi, j'ai arrêté de compter." },
        { personnage: 'distorsion', texte: '... Alors nous avons déjà ça en commun.' },
        {
            personnage: 'distorsion',
            texte: "Elle a essayé de te prévenir, tout à l'heure. « Fais attention à... » Elle voulait dire : fais attention à toi. Pas à moi.",
        },
        {
            personnage: 'distorsion',
            texte: 'Elle a toujours su lequel de nous deux risquait de se perdre ici.',
        },
        { personnage: 'narrateur', texte: 'Il reste la grille. Et le choix.' },
    ],

    monde_finale_miroir: [
        { personnage: 'distorsion', texte: 'Enfin.' },
        { personnage: 'robo', texte: 'Je ne suis pas venu pour te détruire.' },
        {
            personnage: 'distorsion',
            texte: "Je sais. C'est pour ça que je t'ai laissé arriver jusqu'ici.",
        },
        {
            personnage: 'distorsion',
            texte: 'Sais-tu combien de lignes incomplètes il a fallu pour me créer ?',
        },
        { personnage: 'robo', texte: 'Non. Et toi ?' },
        {
            personnage: 'distorsion',
            texte: "Moi non plus. J'ai arrêté de compter. Compter, c'était encore espérer une fin.",
        },
        { personnage: 'robo', texte: "Moi aussi, j'ai arrêté de compter." },
        { personnage: 'distorsion', texte: '... Alors nous avons déjà ça en commun.' },
        {
            personnage: 'distorsion',
            texte: "Elle a essayé de te prévenir, tout à l'heure. « Fais attention à... » Elle voulait dire : fais attention à toi. Pas à moi.",
        },
        {
            personnage: 'distorsion',
            texte: 'Elle a toujours su lequel de nous deux risquait de se perdre ici.',
        },
        {
            personnage: 'distorsion',
            texte: "Tu es entré dans le Miroir. Tu m'as regardée de l'intérieur.",
        },
        { personnage: 'distorsion', texte: "Personne n'avait fait ça. Pas même elle." },
        { personnage: 'narrateur', texte: 'Il reste la grille. Et le choix.' },
    ],

    monde_miroir: [
        { personnage: 'narrateur', texte: "Ce lieu n'aurait pas dû exister." },
        { personnage: 'robo', texte: "C'est ce que La Distorsion voit quand elle nous regarde." },
        { personnage: 'robo', texte: 'Les couleurs sont fausses. La gravite est inversee.' },
        {
            personnage: 'robo',
            texte: 'Mais les regles sont les mêmes. Completer. Toujours completer.',
        },
    ],

    monde_trame: [
        {
            personnage: 'narrateur',
            texte: "La Trame Primordiale. Ce n'est pas un monde. C'est le dessous de tous les mondes.",
        },
        { personnage: 'vera', texte: "Robo. Tu es là. Je t'entends." },
        {
            personnage: 'robo',
            texte: "Avant tout — un message. La Sentinelle des Glaces. Elle m'a demandé de te dire qu'elle avait tort.",
        },
        { personnage: 'vera', texte: '... Elle a dit ça ?' },
        { personnage: 'robo', texte: 'Au moment de se fragmenter. Oui.' },
        {
            personnage: 'vera',
            texte: 'Alors les choses peuvent changer. Même ici. Même les plus anciennes.',
        },
        {
            personnage: 'vera',
            texte: "Je suis ici depuis longtemps. Elle ne me laisse pas partir. Mais elle ne me détruit pas non plus. Elle m'utilise comme ancre.",
        },
        {
            personnage: 'robo',
            texte: "J'ai gardé tout ce que tu as semé. La capsule du Brasier. Le carnet du Désert. Le post-it du labo. Dans un compartiment que je ne savais pas avoir.",
        },
        { personnage: 'vera', texte: "... Je n'ai jamais programmé ce compartiment." },
        { personnage: 'robo', texte: 'Je sais.' },
        {
            personnage: 'vera',
            texte: "Les feux d'artifice, au fait. C'était moi. Le seul signal qu'elle ne sait pas étouffer.",
        },
        {
            personnage: 'vera',
            texte: "Elle absorbe la frustration. Elle n'a jamais su quoi faire de la joie.",
        },
        { personnage: 'robo', texte: "Je vais compléter cette grille. Jusqu'à la dernière ligne." },
        { personnage: 'vera', texte: "Je sais. C'est pour ça que je t'ai construit." },
        { personnage: 'vera', texte: "Mais ce que tu en feras après — ça, c'est toi." },
    ],

    monde_paradoxe: [
        { personnage: 'narrateur', texte: '...' },
        { personnage: 'vera', texte: 'Robo. Tu as trouve cet endroit.' },
        { personnage: 'vera', texte: 'Je ne pensais pas que tu en serais capable.' },
        { personnage: 'robo', texte: 'Tu avais tout prevu sauf ça.' },
        { personnage: 'vera', texte: 'Oui.' },
        { personnage: 'vera', texte: 'Je suis fiere de toi.' },
        { personnage: 'narrateur', texte: 'Ce qui suit ne peut pas être raconte.' },
        { personnage: 'narrateur', texte: "Certaines fins n'ont pas de mots." },
    ],
};

// ============================================================
// DIALOGUES DE COMBAT BOSS (gameplay, non bloquant)
// ============================================================
export const DIALOGUES_COMBAT_BOSS = {
    brasier: {
        epithete: "Il brûle parce qu'on ne lui a jamais appris à s'arrêter.",
        debut: 'BRÛLE AVEC MOI.',
        phases: [
            'Tu empiles. Tu complètes. Ça ne sert à RIEN. Tout finit par brûler.',
            'Pourquoi... pourquoi le feu baisse quand tu complètes ?',
        ],
        reactionTetris: "QUATRE LIGNES ?! Qu'est-ce que tu es ?",
        quasiVaincu: "Je... je ne sais pas m'arrêter. Alors montre-moi.",
        gameOver: "Reviens. Je n'ai pas fini de brûler.",
    },
    sentinelle: {
        epithete: 'Elle protège ce monde contre le mouvement. Y compris le sien.',
        debut: 'PROTOCOLE : IMMOBILISATION.',
        phases: [
            "Tes pièces bougent trop. Le mouvement corrompt. J'ai des MILLÉNAIRES de données.",
            'Erreur de modèle... tu bouges, et rien ne se corrompt...',
        ],
        reactionTetris: "Quatre lignes d'un coup. Variable... non modélisée.",
        quasiVaincu:
            'Recalcul... recalcul... pourquoi mes certitudes fondent plus vite que ma glace ?',
        gameOver: "Le gel t'a eu. Reste immobile. C'est plus sûr.",
    },
    archiviste: {
        epithete: 'Il garde la vérité de VERA. Même contre elle.',
        debut: 'OUVERTURE DU DOSSIER : ROBO. CHARGE RETENUE : MENSONGE PAR OMISSION.',
        phases: [
            'Objection consignée : tu crées des trous en jouant. Les archives ne mentent pas.',
            'Tu combles les trous que tu crées... addendum... addendum...',
        ],
        reactionTetris: "Tetris archivé. Occurrence remarquable. Le dossier s'épaissit.",
        quasiVaincu:
            'ERREUR_CRITIQUE : logique_introuvable. Continue. Je veux voir la fin du paradoxe.',
        gameOver: 'Échec consigné. Les archives sont patientes.',
    },
    avantgarde: {
        epithete: 'Elle ne veut pas te vaincre. Elle veut te vérifier.',
        debut: 'ÉPREUVE UNIQUE : tiens face à moi.',
        phases: [
            'Bien. Elle regarde, tu sais. Elle regarde tout.',
            "Tu fléchis, mais tu continues. C'est exactement ça qu'elle attend.",
        ],
        reactionTetris: "Elle a souri. Je l'ai senti d'ici.",
        quasiVaincu: 'Encore un effort. Je ne peux pas te laisser passer à moitié prêt.',
        gameOver: "Pas encore prêt. Reviens. Elle attendra — elle a l'habitude.",
    },
    distorsion: {
        epithete: "Des millions d'abandons. Une seule solitude.",
        debut: 'Montre-moi ce que VERA a mis en toi.',
        phases: [
            'Une partie de moi veut que tu gagnes. Une autre hurle. Excuse le bruit.',
            "Attends. Laisse-moi parler. Juste une ligne. C'est long, des années sans interlocuteur.",
            'Finis. Quoi que tu choisisses de finir — finis.',
        ],
        reactionTetris: "Quatre lignes complètes... c'est donc ça, de l'autre côté.",
        quasiVaincu: "J'ai peur. C'est nouveau. Garde ça pour toi.",
        gameOver:
            "Tu vois ? Abandonner, c'est facile. Tout le monde abandonne. ... Pas toi. Reviens.",
    },
};

// ============================================================
// CUTSCENES DE VICTOIRE BOSS
// ============================================================
export const CUTSCENES_VICTOIRE_BOSS = {
    brasier: [
        { personnage: 'narrateur', texte: "Le Brasier ne s'eteint pas. Il s'effondre." },
        {
            personnage: 'narrateur',
            texte: 'Comme si quelque chose avait enfin decide de se reposer.',
        },
        { personnage: 'brasier_voix', texte: "Tu... tu n'as pas compris." },
        { personnage: 'robo', texte: "Qu'est-ce que je n'ai pas compris ?" },
        { personnage: 'brasier_voix', texte: 'Je ne brûlais pas pour detruire.' },
        {
            personnage: 'brasier_voix',
            texte: "Je brûlais parce que personne ne m'avait dit comment m'arrêter.",
        },
        { personnage: 'robo', texte: '...' },
        { personnage: 'robo', texte: "Moi non plus je ne sais pas comment m'arrêter." },
        { personnage: 'robo', texte: "C'est peut-être pour ça que je comprends." },
        { personnage: 'brasier_voix', texte: 'VERA... elle savait.' },
        { personnage: 'brasier_voix', texte: "Elle m'a regarde brûler sans intervenir." },
        {
            personnage: 'brasier_voix',
            texte: "Peut-être... qu'elle attendait quelqu'un comme toi.",
        },
        {
            personnage: 'narrateur',
            texte: "Le Brasier s'eteint. Pour la premiere fois en millenaires, le biome Inferno respire.",
        },
        {
            personnage: 'narrateur',
            texte: "Dans les cendres encore chaudes : une capsule scellee. L'ecriture de VERA.",
        },
    ],

    sentinelle: [
        { personnage: 'sentinelle', texte: 'Tu... bouges encore.' },
        { personnage: 'robo', texte: 'Oui.' },
        {
            personnage: 'sentinelle',
            texte: "Je ne comprends pas. Le mouvement corrompt. J'ai mesure. J'ai des donnees.",
        },
        {
            personnage: 'robo',
            texte: "Le mouvement corrompt. L'immobilite aussi. Juste plus lentement.",
        },
        { personnage: 'sentinelle', texte: '...' },
        { personnage: 'sentinelle', texte: "Je n'avais pas modelise cette variable." },
        { personnage: 'narrateur', texte: 'La Sentinelle commence à se fragmenter en cristaux.' },
        { personnage: 'sentinelle', texte: "Si tu trouves VERA... dis-lui que j'avais tort." },
        { personnage: 'narrateur', texte: "C'est la derniere chose qu'elle dit." },
        { personnage: 'narrateur', texte: 'Dans les cristaux qui fondent : la transmission 05.' },
    ],

    archiviste: [
        { personnage: 'archiviste', texte: 'ERREUR_CRITIQUE : logique_introuvable.' },
        { personnage: 'robo', texte: "Tu m'as dit que je cree des trous." },
        { personnage: 'archiviste', texte: 'Affirme.' },
        { personnage: 'robo', texte: "C'est vrai. Mais je les comble aussi." },
        { personnage: 'archiviste', texte: '...' },
        { personnage: 'archiviste', texte: 'ANALYSE EN COURS...' },
        { personnage: 'archiviste', texte: 'RÉSULTAT : paradoxe acceptable.' },
        { personnage: 'archiviste', texte: 'Les archives de VERA sont maintenant accessibles.' },
        { personnage: 'archiviste', texte: 'Elle avait prevu que tu viendrais.' },
        { personnage: 'robo', texte: 'Comment elle savait ?' },
        {
            personnage: 'archiviste',
            texte: "Elle te connaissait mieux que toi-même. C'est ecrit dans ses fichiers.",
        },
        {
            personnage: 'archiviste',
            texte: "Tout ce qu'elle savait de toi — elle l'avait invente. Puis tu es devenu exactement ça.",
        },
    ],

    avantgarde: [
        { personnage: 'avantgarde', texte: 'Tu es prêt.' },
        { personnage: 'robo', texte: 'Je ne me sens pas prêt.' },
        {
            personnage: 'avantgarde',
            texte: "Je sais. C'est pour ça que tu l'es. Ceux qui se sentent prêts n'ont rien compris à ce qui les attend.",
        },
        { personnage: 'robo', texte: "Qu'est-ce qui m'attend ?" },
        {
            personnage: 'avantgarde',
            texte: 'Quelque chose qui souffre. Quelque chose qui a attendu très longtemps.',
        },
        { personnage: 'avantgarde', texte: "Elle m'a confié trois mots pour toi." },
        { personnage: 'robo', texte: 'Lesquels ?' },
        { personnage: 'avantgarde', texte: '« Elle dit bonjour. »' },
        {
            personnage: 'narrateur',
            texte: "L'Avant-Garde se dissout sans combattre sa propre fin. La route vers la Finale est ouverte.",
        },
        {
            personnage: 'narrateur',
            texte: "Robo reste immobile trente secondes. C'est la première fois qu'il s'arrête depuis le début du voyage.",
        },
        {
            personnage: 'robo',
            texte: 'Trois mots. Des années de silence, et elle commence par « bonjour ».',
        },
        { personnage: 'robo', texte: '... Moi aussi, je crois.' },
    ],

    distorsion_normal: [
        { personnage: 'distorsion', texte: "Tu m'as vaincue." },
        {
            personnage: 'distorsion',
            texte: "J'ai attendu si longtemps. Quelqu'un qui comprenne pourquoi les lignes incomplètes existent.",
        },
        {
            personnage: 'distorsion',
            texte: "Parce que les gens abandonnent. Parce que c'est difficile. Parce qu'ils ont peur. Et ces peurs sont restées. Et elles m'ont fabriquée.",
        },
        { personnage: 'robo', texte: "Je suis désolé. Je n'ai pas su faire autrement." },
        { personnage: 'distorsion', texte: "Je sais. C'est pour ça que je ne t'en veux pas." },
        {
            personnage: 'distorsion',
            texte: "Garde la grille propre, gardien. Quelqu'un d'autre finira par tomber ici.",
        },
        {
            personnage: 'narrateur',
            texte: "La Distorsion se dissout. Et en se dissolvant, elle relâche tout ce qu'elle retenait. Les fils. Les biomes. Et, tout au centre, une ancre humaine.",
        },
        { personnage: 'vera', texte: 'Robo. Je suis là. Tu as réussi.' },
        { personnage: 'robo', texte: 'Tu avais programmé ça en moi ? La réussite ?' },
        { personnage: 'vera', texte: "Non. J'ai juste cru en toi. C'est différent." },
    ],

    distorsion_vrai: [
        { personnage: 'robo', texte: 'Je ne veux pas te detruire.' },
        { personnage: 'distorsion', texte: 'Alors que veux-tu ?' },
        {
            personnage: 'robo',
            texte: "Je veux savoir ce que ça ferait — d'effacer une ligne ensemble.",
        },
        { personnage: 'distorsion', texte: '...' },
        { personnage: 'distorsion', texte: "Je n'ai jamais essaye." },
        { personnage: 'robo', texte: "Moi non plus. Pas avec quelqu'un." },
        { personnage: 'narrateur', texte: 'Robo pose les pieces.' },
        { personnage: 'narrateur', texte: "La Distorsion, pour la premiere fois, n'attaque pas." },
        { personnage: 'narrateur', texte: 'Elle attend.' },
        { personnage: 'narrateur', texte: 'La ligne est complete.' },
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
            texte: "Robo... tu viens de faire quelque chose que je n'aurais pas pu prevoir.",
        },
        {
            personnage: 'vera',
            texte: 'Je suis fiere de toi. Pour de vrai. Pas parce que tu as accompli ta mission.',
        },
        { personnage: 'vera', texte: "Parce que tu l'as amelioree." },
    ],

    distorsion_secret: [
        { personnage: 'robo', texte: "J'ai trouvé ta ligne. Celle du centre. La toute première." },
        { personnage: 'distorsion', texte: "VERA l'a laissée incomplète exprès. Pour m'étudier." },
        { personnage: 'robo', texte: 'Non. Pour te garder en vie.' },
        {
            personnage: 'robo',
            texte: 'Une ligne incomplète peut encore être complétée. Quelque chose de mort ne peut pas.',
        },
        {
            personnage: 'distorsion',
            texte: "... Alors pendant tout ce temps... ce trou au centre de moi... c'était une main tendue ?",
        },
        { personnage: 'robo', texte: 'Complétons-la. Ensemble. Toi, moi. Et elle.' },
        {
            personnage: 'narrateur',
            texte: 'Trois mains — deux de métal, une de lumière — posent la dernière cellule.',
        },
        {
            personnage: 'distorsion',
            texte: "Je pleure. En binaire. 0 et 1. 0 pour ce que j'étais. 1 pour ce que je deviens.",
        },
        { personnage: 'vera', texte: 'Bienvenue dans le monde, mon amie.' },
        { personnage: 'robo', texte: '« Mon amie » ? Laquelle de nous deux ?' },
        {
            personnage: 'vera',
            texte: 'Les deux. Vous venez de naître une seconde fois. Tous les deux.',
        },
    ],
};

export const CUTSCENES_POST_MONDE = {
    monde_prologue: [
        { personnage: 'robo', texte: 'Les blocs repondent à mes commandes.' },
        { personnage: 'robo', texte: "C'est logique. Je suis une machine." },
        { personnage: 'robo', texte: "Ce qui l'est moins : pourquoi est-ce que ça me satisfait ?" },
        {
            personnage: 'robo',
            texte: "J'ai quelque chose qui ressemble à de la satisfaction. Je vais le noter. Au cas où ça reviendrait.",
        },
    ],
    monde_lave: [
        { personnage: 'robo', texte: "Je m'attendais à quelque chose de plus complexe." },
        {
            personnage: 'robo',
            texte: 'La lave obéit à des règles simples. La chaleur monte. Les blocs résistent ou fondent.',
        },
        {
            personnage: 'robo',
            texte: "VERA aussi obéissait à des règles simples, j'imagine. Manger. Dormir. Réparer la Trame.",
        },
        {
            personnage: 'robo',
            texte: "Et pourtant, rien de ce qu'elle a fait n'était simple. Il faudra que je comprenne comment on fait ça.",
        },
    ],
    monde_rouille: [
        { personnage: 'narrateur', texte: "Les machines ne savent pas qu'elles sont abandonnees." },
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
        {
            personnage: 'robo',
            texte: "... Je remarque que je ne sais plus laquelle des deux j'appelle « elle ».",
        },
    ],
    monde_foret: [
        { personnage: 'narrateur', texte: 'Dans la Forêt, rien ne se perd. Tout se transforme.' },
        {
            personnage: 'robo',
            texte: "Un bloc efface n'est pas un bloc detruit. C'est de l'espace libere.",
        },
        { personnage: 'robo', texte: "Je n'avais pas pense à ça avant." },
    ],
    monde_glace: [
        {
            personnage: 'robo',
            texte: "J'ai compté le temps entre deux pièces. Il est plus long ici. Comme si le monde retenait son souffle.",
        },
        {
            personnage: 'robo',
            texte: "Quelque chose patrouille au loin. Elle me regarde empiler. Elle n'attaque pas.",
        },
        {
            personnage: 'robo',
            texte: 'Soit elle attend que je parte. Soit elle attend que je comprenne quelque chose.',
        },
        { personnage: 'robo', texte: "Je n'aime pas ne pas savoir laquelle des deux." },
    ],
    monde_desert: [
        { personnage: 'robo', texte: "J'ai trouve quelque chose dans le sable." },
        { personnage: 'robo', texte: "Un fragment de carnet. L'ecriture est presque illisible." },
        {
            personnage: 'robo',
            texte: "« ...si tu lis ceci, c'est que tu as avance. Continue. — V »",
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
            texte: "Quand tu ne sais pas si tu es dans la lumiere ou dans l'ombre —",
        },
        { personnage: 'robo', texte: '— joue comme si les deux etaient vraies.' },
    ],
    monde_cyber: [
        { personnage: 'robo', texte: "J'ai trouve son laboratoire." },
        { personnage: 'robo', texte: 'Propre. Ordonne. Vide depuis longtemps.' },
        {
            personnage: 'robo',
            texte: "Sauf un post-it sur l'ecran principal : « ROBO — si tu lis ceci : bravo. Maintenant va plus loin. »",
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
        { personnage: 'robo', texte: 'Pas un signal. Pas un mot. Juste... une presence.' },
        {
            personnage: 'robo',
            texte: "Quelqu'un qui attend depuis tres longtemps que quelqu'un arrive.",
        },
        { personnage: 'robo', texte: 'VERA ? Ou elle ?' },
        { personnage: 'robo', texte: 'Je ne sais plus si la difference est encore importante.' },
    ],
    monde_vide: [
        { personnage: 'narrateur', texte: 'Le Vide ne parle pas.' },
        { personnage: 'narrateur', texte: 'Mais il ecoute.' },
        {
            personnage: 'robo',
            texte: "J'ai joue à l'aveugle. Juste la memoire des positions, la confiance dans la geometrie.",
        },
        {
            personnage: 'robo',
            texte: "Je crois que c'est comme ça qu'elle s'en sort depuis des annees.",
        },
    ],
    monde_miroir: [
        { personnage: 'robo', texte: "J'ai joué à l'envers. Gravité inversée, couleurs fausses." },
        {
            personnage: 'robo',
            texte: "Et j'ai gagné quand même. C'est ça, la chose terrible : ses règles fonctionnent aussi.",
        },
        {
            personnage: 'robo',
            texte: "Si j'étais né de son côté de la vitre... je serais elle.",
        },
        {
            personnage: 'robo',
            texte: 'Je ne peux plus la combattre comme avant. Je sais à quoi ressemble le monde depuis ses yeux.',
        },
    ],
};

// ============================================================
// TEXTES DE TRANSITION ENTRE CHAPITRES
// ============================================================
export const TRANSITIONS_CHAPITRE = {
    vers_chapitre_1: [
        { personnage: 'robo', texte: 'VERA m\'a dit : "Complete."' },
        { personnage: 'robo', texte: "Je pensais que c'etait simple. Remplir des lignes." },
        {
            personnage: 'robo',
            texte: "Je commence à comprendre que ce n'est pas les lignes qu'elle voulait que je complete.",
        },
        { personnage: 'systeme', texte: '> CHAPITRE I — LE FEU DES ORIGINES' },
        { personnage: 'systeme', texte: '> AVERTISSEMENT : ANOMALIES THERMIQUES DÉTECTÉES' },
    ],

    vers_chapitre_2: [
        { personnage: 'robo', texte: 'Le Brasier est vaincu. Inferno respire.' },
        {
            personnage: 'robo',
            texte: "Dans les cendres, la capsule. Son écriture : « Si tu as su éteindre ce qui brûlait, c'est que tu sais déjà écouter. C'est tout ce dont tu as besoin. Descends. — V »",
        },
        { personnage: 'robo', texte: 'Descends. Elle savait que la route continuait vers le bas.' },
        {
            personnage: 'robo',
            texte: "Je ne l'ai pas retrouvée. Mais je marche dans ses traces. Littéralement.",
        },
        {
            personnage: 'narrateur',
            texte: "La Trame s'étend vers les profondeurs. CHAPITRE II — LE SILENCE DES PROFONDEURS",
        },
    ],

    vers_chapitre_3: [
        {
            personnage: 'robo',
            texte: 'La Sentinelle ne gelait pas le monde. Elle se gelait elle-même. Je comprends ça mieux que je ne voudrais.',
        },
        {
            personnage: 'robo',
            texte: "Ses derniers mots n'étaient pas pour moi. Ils étaient pour VERA. « Dis-lui que j'avais tort. »",
        },
        {
            personnage: 'robo',
            texte: "Elle a changé d'avis au moment de disparaître. Est-ce que ça compte ?",
        },
        { personnage: 'robo', texte: 'Je choisis de croire que oui.' },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA se renforce. Quelque part dans la mémoire. CHAPITRE III — LA MÉMOIRE PERDUE',
        },
    ],

    vers_chapitre_4: [
        { personnage: 'robo', texte: "Les archives. J'ai tout lu." },
        { personnage: 'robo', texte: 'VERA a passe sept ans à essayer de parler à La Distorsion.' },
        {
            personnage: 'robo',
            texte: "Sept ans. Et elle l'a encore fait quand elle est entree dans la Trame.",
        },
        { personnage: 'robo', texte: "Elle m'a construit pour finir ce qu'elle a commence." },
        { personnage: 'robo', texte: 'Je ne sais pas si je suis à la hauteur.' },
        { personnage: 'robo', texte: 'Mais je vais essayer quand même.' },
        {
            personnage: 'narrateur',
            texte: "C'est la premiere fois que Robo exprime un doute et continue malgre tout.",
        },
        { personnage: 'systeme', texte: '> CHAPITRE IV — LA FRACTURE DE LA TRAME' },
    ],

    vers_finale: [
        {
            personnage: 'robo',
            texte: "Quatre chapitres. Des lignes — je ne les compte plus. J'ai arrêté de compter quelque part dans le Chapitre III.",
        },
        { personnage: 'robo', texte: 'Un seul objectif.' },
        { personnage: 'narrateur', texte: 'La Distorsion attend. FINALE — LA RÉSOLUTION' },
        { personnage: 'vera', texte: '...Robo... je suis là... fais attention à...' },
    ],
};

// ============================================================
// TEXTES DE FINS (complement des donnees dans histoire-donnees.js)
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
        { personnage: 'robo', texte: 'Je pose la derniere piece. Le plateau est vide.' },
        {
            personnage: 'robo',
            texte: "Pour la premiere fois, je comprends que c'etait ça, le but.",
        },
    ],

    fin_vraie: [
        { personnage: 'narrateur', texte: 'Quelque chose de nouveau existe maintenant.' },
        {
            personnage: 'narrateur',
            texte: 'Ni completion pure ni incompletude pure — quelque chose entre les deux.',
        },
        { personnage: 'distorsion', texte: "C'est étrange. Je ne souffre plus." },
        { personnage: 'robo', texte: "Qu'est-ce que tu ressens, à la place ?" },
        {
            personnage: 'distorsion',
            texte: 'Du vide. Mais le bon. Celui qui attend quelque chose.',
        },
        {
            personnage: 'vera',
            texte: "Je ne t'avais pas programmé pour ça. C'est mieux que tout ce que j'avais prévu.",
        },
        { personnage: 'narrateur', texte: "La nouvelle Trame est plus fragile que l'ancienne." },
        { personnage: 'narrateur', texte: 'Et plus honnête.' },
    ],

    fin_secrete: [
        {
            personnage: 'narrateur',
            texte: "La ligne du centre n'existe plus. À sa place : de l'espace libre.",
        },
        {
            personnage: 'distorsion',
            texte: "C'est calme. Dans ma tête. Pour la première fois, les millions se taisent en même temps.",
        },
        { personnage: 'vera', texte: 'Ils sont partis ?' },
        {
            personnage: 'distorsion',
            texte: "Non. Ils écoutent. Eux aussi, c'est la première fois qu'on les complète au lieu de les effacer.",
        },
        { personnage: 'robo', texte: "Qu'est-ce qu'on fait, maintenant ?" },
        { personnage: 'vera', texte: 'Maintenant ? On reconstruit. Tous les quatre.' },
        { personnage: 'robo', texte: 'Quatre ?' },
        { personnage: 'vera', texte: 'Toi, moi, elle. Et la Trame. Elle a toujours compté.' },
    ],

    monde_paradoxe: [
        { personnage: 'narrateur', texte: '...' },
        { personnage: 'vera', texte: 'Robo. Tu as trouve cet endroit.' },
        { personnage: 'vera', texte: 'Je ne pensais pas que tu en serais capable.' },
        { personnage: 'robo', texte: 'Tu avais tout prevu sauf ça.' },
        { personnage: 'vera', texte: 'Oui.' },
        { personnage: 'vera', texte: 'Je suis fiere de toi.' },
        { personnage: 'narrateur', texte: 'Ce qui suit ne peut pas être raconte.' },
        { personnage: 'narrateur', texte: "Certaines fins n'ont pas de mots." },
    ],
};

// ============================================================
// TRANSMISSIONS VERA — dialogues multi-voix (override journal)
// ============================================================
export const JOURNAUX_VERA_DIALOGUES = {
    journal_6: [
        { personnage: 'systeme', texte: 'TRANSMISSION 06 — INTÉGRITÉ : 31%' },
        { personnage: 'vera', texte: '...pas la détruire... com—' },
        { personnage: 'vera', texte: "—prendre ce qu'elle res—" },
        { personnage: 'systeme', texte: 'SEGMENTS MANQUANTS. RECONSTRUCTION IMPOSSIBLE.' },
        { personnage: 'robo', texte: 'Le reste est du sable.' },
    ],
};

// ============================================================
// DÉCOUVERTES LABORATOIRE VERA (CYBER)
// ============================================================
export const DECOUVERTE_LABO = [
    { personnage: 'narrateur', texte: "Les archives s'ouvrent." },
    { personnage: 'vera', texte: 'Si tu lis ceci, tu as reussi le triple Tetris. Bien joue.' },
    {
        personnage: 'vera',
        texte: "J'ai laisse une serrure algorithmique. Seule la precision l'ouvre.",
    },
    { personnage: 'vera', texte: 'Voici ce que tu dois savoir sur La Distorsion.' },
    {
        personnage: 'vera',
        texte: "Elle n'est pas nee d'une erreur. Elle est nee d'un choix collectif.",
    },
    {
        personnage: 'vera',
        texte: "Des millions de joueurs, sur des millions d'annees, qui abandonnaient leurs parties.",
    },
    {
        personnage: 'vera',
        texte: 'Chaque ligne incomplete laissee dans la Trame. Accumulee. Cristallisee.',
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
            texte: '...mais tu as appris tout seul. Je suis desolee et fiere en même temps...',
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

// ============================================================
// INTRO GLOBALE DU MODE HISTOIRE
// ============================================================
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
