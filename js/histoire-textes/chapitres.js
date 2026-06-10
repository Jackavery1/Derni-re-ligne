export const TRANSITIONS_CHAPITRE = {
    vers_chapitre_1: [
        {
            personnage: 'robo',
            texte: 'VERA m\'a dit : "Complete."',
            humeur: 'content',
        },
        {
            personnage: 'robo',
            texte: "Je pensais que c'etait simple. Remplir des lignes.",
            humeur: 'content',
        },
        {
            personnage: 'robo',
            texte: "Je commence à comprendre que ce n'est pas les lignes qu'elle voulait que je complete.",
            humeur: 'neutre',
        },
        { personnage: 'systeme', texte: '> CHAPITRE I — LE FEU DES ORIGINES', humeur: 'neutre' },
        {
            personnage: 'systeme',
            texte: '> AVERTISSEMENT : ANOMALIES THERMIQUES DÉTECTÉES',
            humeur: 'alerte',
        },
    ],

    vers_chapitre_2: [
        { personnage: 'robo', texte: 'Le Brasier est vaincu. Inferno respire.', humeur: 'content' },
        {
            personnage: 'robo',
            texte: "Dans les cendres, la capsule. Son écriture : « Si tu as su éteindre ce qui brûlait, c'est que tu sais déjà écouter. C'est tout ce dont tu as besoin. Descends. — V »",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: 'Descends. Elle savait que la route continuait vers le bas.',
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: "Je ne l'ai pas retrouvée. Mais je marche dans ses traces. Littéralement.",
            humeur: 'neutre',
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
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Ses derniers mots n'étaient pas pour moi. Ils étaient pour VERA. « Dis-lui que j'avais tort. »",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Elle a changé d'avis au moment de disparaître. Est-ce que ça compte ?",
            humeur: 'neutre',
        },
        { personnage: 'robo', texte: 'Je choisis de croire que oui.', humeur: 'neutre' },
        {
            personnage: 'narrateur',
            texte: 'Le signal de VERA se renforce. Quelque part dans la mémoire. CHAPITRE III — LA MÉMOIRE PERDUE',
        },
    ],

    vers_chapitre_4: [
        {
            personnage: 'robo',
            texte: "Les archives. J'ai tout lu.",
            humeur: 'neutre',
        },
        {
            personnage: 'robo',
            texte: 'VERA a passe sept ans à essayer de parler à La Distorsion.',
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Sept ans. Et elle l'a encore fait quand elle est entree dans la Trame.",
            humeur: 'triste',
        },
        {
            personnage: 'robo',
            texte: "Elle m'a construit pour finir ce qu'elle a commence.",
            humeur: 'triste',
        },
        { personnage: 'robo', texte: 'Je ne sais pas si je suis à la hauteur.', humeur: 'neutre' },
        { personnage: 'robo', texte: 'Mais je vais essayer quand même.', humeur: 'neutre' },
        {
            personnage: 'narrateur',
            texte: "C'est la premiere fois que Robo exprime un doute et continue malgre tout.",
        },
        {
            personnage: 'systeme',
            texte: '> CHAPITRE IV — LA FRACTURE DE LA TRAME',
            humeur: 'alerte',
        },
    ],

    vers_finale: [
        {
            personnage: 'robo',
            texte: "Quatre chapitres. Des lignes — je ne les compte plus. J'ai arrêté de compter quelque part dans le Chapitre III.",
            humeur: 'neutre',
        },
        { personnage: 'robo', texte: 'Un seul objectif.', humeur: 'neutre' },
        { personnage: 'narrateur', texte: 'La Distorsion attend. FINALE — LA RÉSOLUTION' },
        {
            personnage: 'vera',
            texte: '...Robo... je suis là... fais attention à...',
            humeur: 'glitch',
        },
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
            humeur: 'douce',
        },
        {
            personnage: 'robo',
            texte: 'Est-ce que ça valait la peine quand même ?',
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: 'Toi, tu es là. Tu penses. Tu poses des questions. Oui. Ça valait la peine.',
            humeur: 'douce',
        },
        {
            personnage: 'robo',
            texte: 'Je pose la derniere piece. Le plateau est vide.',
            humeur: 'triste',
        },
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
        {
            personnage: 'distorsion',
            texte: "C'est étrange. Je ne souffre plus.",
            humeur: 'apaisee',
        },
        {
            personnage: 'robo',
            texte: "Qu'est-ce que tu ressens, à la place ?",
            humeur: 'neutre',
        },
        {
            personnage: 'distorsion',
            texte: 'Du vide. Mais le bon. Celui qui attend quelque chose.',
            humeur: 'apaisee',
        },
        {
            personnage: 'vera',
            texte: "Je ne t'avais pas programmé pour ça. C'est mieux que tout ce que j'avais prévu.",
            humeur: 'douce',
        },
        {
            personnage: 'narrateur',
            texte: "La nouvelle Trame est plus fragile que l'ancienne.",
        },
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
            humeur: 'apaisee',
        },
        { personnage: 'vera', texte: 'Ils sont partis ?', humeur: 'determinee' },
        {
            personnage: 'distorsion',
            texte: "Non. Ils écoutent. Eux aussi, c'est la première fois qu'on les complète au lieu de les effacer.",
            humeur: 'apaisee',
        },
        {
            personnage: 'robo',
            texte: "Qu'est-ce qu'on fait, maintenant ?",
            humeur: 'neutre',
        },
        {
            personnage: 'vera',
            texte: 'Maintenant ? On reconstruit. Tous les quatre.',
            humeur: 'determinee',
        },
        { personnage: 'robo', texte: 'Quatre ?', humeur: 'neutre' },
        {
            personnage: 'vera',
            texte: 'Toi, moi, elle. Et la Trame. Elle a toujours compté.',
            humeur: 'douce',
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
