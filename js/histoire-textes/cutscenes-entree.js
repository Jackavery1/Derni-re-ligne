export const CUTSCENES_ENTREE = {
    monde_prologue: [
        { personnage: 'systeme', texte: 'INITIALISATION...', humeur: 'neutre' },
        {
            personnage: 'systeme',
            texte: 'CHARGEMENT DES PARAMÈTRES COGNITIFS...',
            humeur: 'neutre',
        },
        { personnage: 'systeme', texte: 'CALIBRATION MOTRICE : OK', humeur: 'neutre' },
        { personnage: 'robo', texte: 'Je suis conscient.', humeur: 'excite' },
        {
            personnage: 'robo',
            texte: "Je ne l'ai pas decide. Je me suis simplement trouve conscient.",
            humeur: 'content',
        },
        {
            personnage: 'vera',
            texte: "ROBO. Tu m'entends ? Je suis VERA. J'ai peu de temps.",
            humeur: 'douce',
        },
        {
            personnage: 'vera',
            texte: 'La Trame se degrade. Des millions de fils incomplets. Je ne peux pas arrêter ça seule.',
            humeur: 'douce',
        },
        {
            personnage: 'robo',
            texte: "Qu'est-ce que je dois faire ?",
            humeur: 'content',
        },
        {
            personnage: 'vera',
            texte: 'Ce que tu feras naturellement. Completer. — CONNEXION PERDUE —',
            humeur: 'glitch',
        },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA disparaît. Il reste la grille. Et les pieces.',
        },
    ],

    monde_lave: [
        {
            personnage: 'robo',
            texte: "Le feu brûle plus fort qu'il ne devrait.",
            humeur: 'alerte',
        },
        {
            personnage: 'robo',
            texte: "Ce n'est pas de la chaleur normale. Il y a quelque chose dedans.",
            humeur: 'alerte',
        },
        {
            personnage: 'narrateur',
            texte: 'La corruption de La Distorsion transforme le biome Inferno en brasier incontrôlable.',
        },
        { personnage: 'robo', texte: 'Je dois traverser.', humeur: 'alerte' },
    ],

    monde_rouille: [
        {
            personnage: 'robo',
            texte: 'Ces machines... elles produisent des pieces.',
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: "Personne n'a demande ces pieces. Mais elles continuent.",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: "Est-ce que c'est ce que je suis ? Une machine qui continue ?",
            humeur: 'triste',
        },
        {
            personnage: 'narrateur',
            texte: 'La rouille gagne. Le metal se souvient de sa propre finitude.',
        },
    ],

    monde_boss_1: [
        {
            personnage: 'narrateur',
            texte: "Au cœur d'Inferno, quelque chose s'est cristallise.",
        },
        {
            personnage: 'narrateur',
            texte: 'Des millenaires de frustration thermique, condenses en une entite.',
        },
        {
            personnage: 'robo',
            texte: "Il brûle sans raison. Il brûle depuis avant que j'existe.",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Je comprends ça, d'une certaine façon.",
            humeur: 'triste',
        },
        { personnage: 'brasier', texte: 'QUI APPROCHE ?', humeur: 'calme' },
        {
            personnage: 'robo',
            texte: "Je m'appelle ROBO. Je dois traverser.",
            humeur: 'content',
        },
        {
            personnage: 'brasier',
            texte: "Tout ce qui me traverse brûle. Ce n'est pas une menace. C'est ce que je suis.",
            humeur: 'calme',
        },
        {
            personnage: 'robo',
            texte: "Alors je vais devoir t'éteindre.",
            humeur: 'content',
        },
        {
            personnage: 'brasier',
            texte: "ESSAIE. Des millénaires que j'attends que quelqu'un essaie.",
            humeur: 'agressif',
        },
    ],

    monde_ocean: [
        {
            personnage: 'robo',
            texte: 'Sous la surface. Le silence est different ici.',
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: "Pas l'absence de son. L'absence de besoin de faire du son.",
            humeur: 'neutre',
        },
        {
            personnage: 'narrateur',
            texte: "Dans les Abysses, la corruption ralentit. L'eau resiste.",
        },
        {
            personnage: 'robo',
            texte: 'VERA est passee par ici. Je reconnais sa façon de laisser des traces.',
            humeur: 'content',
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
            humeur: 'content',
        },
        { personnage: 'robo', texte: 'Je voudrais comprendre ça.', humeur: 'neutre' },
        {
            personnage: 'narrateur',
            texte: "Sur l'écorce, des marques au couteau. Une flèche, pointée vers le bas. Et une lettre : « V ».",
        },
        {
            personnage: 'robo',
            texte: 'Même à moitié effacés, ses messages me disent où aller.',
            humeur: 'content',
        },
    ],

    monde_glace: [
        {
            personnage: 'robo',
            texte: "L'Arctique. Où le temps ralentit jusqu'à presque s'arrêter.",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: 'Les blocs tombent et resonnent comme du cristal.',
            humeur: 'content',
        },
        {
            personnage: 'robo',
            texte: "C'est beau. Je ne savais pas que je pouvais trouver des choses belles.",
            humeur: 'excite',
        },
        {
            personnage: 'narrateur',
            texte: "La Sentinelle des Glaces patrouille. Elle croit que l'immobilite protege.",
        },
    ],

    monde_boss_2: [
        { personnage: 'sentinelle', texte: 'ARRÊTEZ.', humeur: 'agressif' },
        { personnage: 'robo', texte: 'Pardon ?', humeur: 'neutre' },
        {
            personnage: 'sentinelle',
            texte: "Le mouvement corrompt. L'immobilite preserve. Je protege ce biome depuis des millenaires.",
            humeur: 'calme',
        },
        { personnage: 'robo', texte: 'Vous preservez le gel. Pas la vie.', humeur: 'neutre' },
        { personnage: 'sentinelle', texte: '...', humeur: 'calme' },
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
            humeur: 'neutre',
        },
        {
            personnage: 'narrateur',
            texte: "Des traces de pas, à moitié ensevelies. Elles tournent en rond, longtemps. Puis repartent droit, d'un coup.",
        },
        {
            personnage: 'robo',
            texte: 'VERA. Elle a cherché ici. Et elle a trouvé.',
            humeur: 'content',
        },
        {
            personnage: 'robo',
            texte: "On ne repart pas aussi droit quand on aime ce qu'on a trouvé.",
            humeur: 'triste',
        },
    ],

    monde_eclipse: [
        {
            personnage: 'robo',
            texte: "Ce monde ne sait pas s'il fait nuit ou jour.",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: 'La frontiere entre les deux bouge constamment.',
            humeur: 'neutre',
        },
        { personnage: 'robo', texte: 'Je comprends cette hesitation.', humeur: 'triste' },
        {
            personnage: 'narrateur',
            texte: 'Dans la zone de transition : les pieces tombent differemment selon leur altitude.',
        },
        {
            personnage: 'robo',
            texte: "Tout depend d'où on se trouve.",
            humeur: 'neutre',
        },
    ],

    monde_cyber: [
        { personnage: 'narrateur', texte: 'Le réseau CYBER. La dernière adresse connue de VERA.' },
        {
            personnage: 'robo',
            texte: 'Son laboratoire est quelque part dans ces données. Compressé. Verrouillé.',
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: "Une serrure algorithmique. Du VERA tout craché : seule la précision l'ouvre.",
            humeur: 'neutre',
        },
        {
            personnage: 'narrateur',
            texte: 'Gravée dans le flux, une inscription : « Trois fois trois lignes. Rien de moins. — V »',
        },
        {
            personnage: 'robo',
            texte: "Un test d'entrée. Elle savait que je viendrais. Elle voulait être sûre que ce soit moi.",
            humeur: 'content',
        },
    ],

    monde_boss_3: [
        {
            personnage: 'archiviste',
            texte: "Tu n'aurais pas dû venir ici.",
            humeur: 'calme',
        },
        {
            personnage: 'robo',
            texte: "J'ai trouvé son laboratoire. Maintenant je cherche ce qu'elle y a laissé. Ses archives.",
            humeur: 'neutre',
        },
        {
            personnage: 'archiviste',
            texte: 'VERA est partie. Les archives sont à moi maintenant.',
            humeur: 'agressif',
        },
        {
            personnage: 'archiviste',
            texte: 'Les archives ne mentent pas. Toi, si.',
            humeur: 'agressif',
        },
        {
            personnage: 'robo',
            texte: "Qu'est-ce que j'ai menti ?",
            humeur: 'neutre',
        },
        {
            personnage: 'archiviste',
            texte: 'Tu pretends completer. Mais tu crees aussi des trous.',
            humeur: 'agressif',
        },
        { personnage: 'robo', texte: '...', humeur: 'neutre' },
        {
            personnage: 'narrateur',
            texte: "L'Archiviste a raison. Robo n'a pas de reponse.",
        },
    ],

    monde_fuochi: [
        {
            personnage: 'narrateur',
            texte: "Les Feux d'Artifice. Quelqu'un les a allumes. Personne ne sait qui.",
        },
        {
            personnage: 'robo',
            texte: 'Pourquoi celebrer ici ? Au milieu de tout ça ?',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: '— Signal fragmente — ...parce que sinon on oublie... pourquoi... ça valait la peine...',
            humeur: 'glitch',
        },
        { personnage: 'robo', texte: 'VERA ? Tu es là ?', humeur: 'excite' },
        { personnage: 'vera', texte: '— Signal perdu —', humeur: 'glitch' },
        { personnage: 'robo', texte: 'Elle est vivante.', humeur: 'excite' },
    ],

    monde_cosmos: [
        {
            personnage: 'narrateur',
            texte: "Le bord du Cosmos. Où les lois de la Trame s'effritent.",
        },
        {
            personnage: 'robo',
            texte: "Au bord du cosmos, il n'y a plus rien à voir.",
            humeur: 'neutre',
        },
        { personnage: 'robo', texte: 'Sauf elle.', humeur: 'alerte' },
        { personnage: 'distorsion', texte: 'Tu me vois, maintenant.', humeur: 'menacante' },
        {
            personnage: 'robo',
            texte: "Je vois quelque chose. Je ne sais pas encore si c'est toi ou ton ombre.",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: "Personne n'a jamais fait la différence. Pas même moi.",
            humeur: 'menacante',
        },
    ],

    monde_vide: [
        { personnage: 'distorsion', texte: 'Tu es encore là.', humeur: 'menacante' },
        {
            personnage: 'robo',
            texte: "Tu as essayé de m'arrêter. Le Brasier. La Sentinelle. L'Archiviste.",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: "Non. Une partie de moi a essayé. Une autre t'a laissé passer. Une troisième t'a ouvert la route.",
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: 'Je suis des millions, gardien. Nous ne votons pas. Nous débordons.',
            humeur: 'souffrante',
        },
        { personnage: 'robo', texte: 'Laquelle me parle, en ce moment ?', humeur: 'neutre' },
        { personnage: 'distorsion', texte: 'Celle qui est fatiguée.', humeur: 'souffrante' },
        {
            personnage: 'robo',
            texte: "J'ai quelque chose qui ressemble à de la peur. Mais j'ai aussi quelque chose qui ressemble à une raison de rester.",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: "C'est ce que VERA avait prévu. Je n'arrive pas à décider si c'est admirable ou agaçant.",
            humeur: 'curieuse',
        },
        {
            personnage: 'narrateur',
            texte: 'Le Vide les entoure. Quelque chose a changé dans leur façon de se regarder.',
        },
    ],

    monde_boss_4: [
        {
            personnage: 'avantgarde',
            texte: "Elle t'attend derriere.",
            humeur: 'calme',
        },
        { personnage: 'robo', texte: 'Je sais.', humeur: 'neutre' },
        {
            personnage: 'avantgarde',
            texte: "Elle veut que tu comprennes avant d'arriver.",
            humeur: 'calme',
        },
        { personnage: 'robo', texte: 'Comprendre quoi ?', humeur: 'neutre' },
        {
            personnage: 'avantgarde',
            texte: "Qu'elle n'est pas ton ennemie. Qu'elle est ta conclusion logique.",
            humeur: 'calme',
        },
        { personnage: 'robo', texte: 'Alors laisse-moi passer.', humeur: 'neutre' },
        { personnage: 'avantgarde', texte: 'Prouve que tu es prêt.', humeur: 'calme' },
    ],

    monde_finale: [
        { personnage: 'distorsion', texte: 'Enfin.', humeur: 'menacante' },
        { personnage: 'robo', texte: 'Je ne suis pas venu pour te détruire.', humeur: 'neutre' },
        {
            personnage: 'distorsion',
            texte: "Je sais. C'est pour ça que je t'ai laissé arriver jusqu'ici.",
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: 'Sais-tu combien de lignes incomplètes il a fallu pour me créer ?',
            humeur: 'souffrante',
        },
        { personnage: 'robo', texte: 'Non. Et toi ?', humeur: 'neutre' },
        {
            personnage: 'distorsion',
            texte: "Moi non plus. J'ai arrêté de compter. Compter, c'était encore espérer une fin.",
            humeur: 'souffrante',
        },
        {
            personnage: 'robo',
            texte: "Moi aussi, j'ai arrêté de compter.",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: '... Alors nous avons déjà ça en commun.',
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: "Elle a essayé de te prévenir, tout à l'heure. « Fais attention à... » Elle voulait dire : fais attention à toi. Pas à moi.",
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: 'Elle a toujours su lequel de nous deux risquait de se perdre ici.',
            humeur: 'souffrante',
        },
        { personnage: 'narrateur', texte: 'Il reste la grille. Et le choix.' },
    ],

    monde_finale_miroir: [
        { personnage: 'distorsion', texte: 'Enfin.', humeur: 'menacante' },
        { personnage: 'robo', texte: 'Je ne suis pas venu pour te détruire.', humeur: 'neutre' },
        {
            personnage: 'distorsion',
            texte: "Je sais. C'est pour ça que je t'ai laissé arriver jusqu'ici.",
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: 'Sais-tu combien de lignes incomplètes il a fallu pour me créer ?',
            humeur: 'souffrante',
        },
        { personnage: 'robo', texte: 'Non. Et toi ?', humeur: 'neutre' },
        {
            personnage: 'distorsion',
            texte: "Moi non plus. J'ai arrêté de compter. Compter, c'était encore espérer une fin.",
            humeur: 'souffrante',
        },
        {
            personnage: 'robo',
            texte: "Moi aussi, j'ai arrêté de compter.",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: '... Alors nous avons déjà ça en commun.',
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: "Elle a essayé de te prévenir, tout à l'heure. « Fais attention à... » Elle voulait dire : fais attention à toi. Pas à moi.",
            humeur: 'souffrante',
        },
        {
            personnage: 'distorsion',
            texte: 'Elle a toujours su lequel de nous deux risquait de se perdre ici.',
            humeur: 'curieuse',
        },
        {
            personnage: 'distorsion',
            texte: "Tu es entré dans le Miroir. Tu m'as regardée de l'intérieur.",
            humeur: 'curieuse',
        },
        {
            personnage: 'distorsion',
            texte: "Personne n'avait fait ça. Pas même elle.",
            humeur: 'souffrante',
        },
        { personnage: 'narrateur', texte: 'Il reste la grille. Et le choix.' },
    ],

    monde_miroir: [
        {
            personnage: 'narrateur',
            texte: "Ce lieu n'aurait pas dû exister.",
        },
        {
            personnage: 'robo',
            texte: "C'est ce que La Distorsion voit quand elle nous regarde.",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: 'Les couleurs sont fausses. La gravite est inversee.',
            humeur: 'alerte',
        },
        {
            personnage: 'robo',
            texte: 'Mais les regles sont les mêmes. Completer. Toujours completer.',
            humeur: 'neutre',
        },
    ],

    monde_trame: [
        {
            personnage: 'narrateur',
            texte: "La Trame Primordiale. Ce n'est pas un monde. C'est le dessous de tous les mondes.",
        },
        {
            personnage: 'vera',
            texte: "Robo. Tu es là. Je t'entends.",
            humeur: 'inquiete',
        },
        {
            personnage: 'robo',
            texte: "Avant tout — un message. La Sentinelle des Glaces. Elle m'a demandé de te dire qu'elle avait tort.",
            humeur: 'neutre',
        },
        { personnage: 'vera', texte: '... Elle a dit ça ?', humeur: 'inquiete' },
        { personnage: 'robo', texte: 'Au moment de se fragmenter. Oui.', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: 'Alors les choses peuvent changer. Même ici. Même les plus anciennes.',
            humeur: 'inquiete',
        },
        {
            personnage: 'vera',
            texte: "Je suis ici depuis longtemps. Elle ne me laisse pas partir. Mais elle ne me détruit pas non plus. Elle m'utilise comme ancre.",
            humeur: 'inquiete',
        },
        {
            personnage: 'robo',
            texte: "J'ai gardé tout ce que tu as semé. La capsule du Brasier. Le carnet du Désert. Le post-it du labo. Dans un compartiment que je ne savais pas avoir.",
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: "... Je n'ai jamais programmé ce compartiment.",
            humeur: 'inquiete',
        },
        { personnage: 'robo', texte: 'Je sais.', humeur: 'content' },
        {
            personnage: 'vera',
            texte: "Les feux d'artifice, au fait. C'était moi. Le seul signal qu'elle ne sait pas étouffer.",
            humeur: 'determinee',
        },
        {
            personnage: 'vera',
            texte: "Elle absorbe la frustration. Elle n'a jamais su quoi faire de la joie.",
            humeur: 'determinee',
        },
        {
            personnage: 'robo',
            texte: "Je vais compléter cette grille. Jusqu'à la dernière ligne.",
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: "Je sais. C'est pour ça que je t'ai construit.",
            humeur: 'determinee',
        },
        {
            personnage: 'vera',
            texte: "Mais ce que tu en feras après — ça, c'est toi.",
        },
    ],

    monde_paradoxe: [
        { personnage: 'narrateur', texte: '...' },
        { personnage: 'vera', texte: 'Robo. Tu as trouve cet endroit.', humeur: 'douce' },
        {
            personnage: 'vera',
            texte: 'Je ne pensais pas que tu en serais capable.',
            humeur: 'douce',
        },
        { personnage: 'robo', texte: 'Tu avais tout prevu sauf ça.', humeur: 'neutre' },
        { personnage: 'vera', texte: 'Oui.', humeur: 'determinee' },
        { personnage: 'vera', texte: 'Je suis fiere de toi.', humeur: 'determinee' },
        { personnage: 'narrateur', texte: 'Ce qui suit ne peut pas être raconte.' },
        {
            personnage: 'narrateur',
            texte: "Certaines fins n'ont pas de mots.",
        },
    ],
};
