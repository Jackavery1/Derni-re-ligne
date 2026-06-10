// js/codex-histoire.js
// Entrees Codex pour le Mode Histoire :
// nouveaux biomes, boss, mondes caches, personnages.
// Ajoutees dynamiquement aux chapitres existants (mondes, chroniques).

export const CODEX_HISTOIRE = {
    // ============================================================
    // CHAPITRE "MONDES" — nouveaux biomes
    // ============================================================

    monde_rouille: {
        id: 'monde_rouille',
        chapitre: 'mondes',
        titre: 'LA ROUILLE',
        sousTitre: 'Ce qui Continue Sans Raison',
        icone: '⚙️',
        condition: (s) => (s.biomesJoues || new Set()).has('rouille'),
        conditionTexte: 'Jouer une partie en biome La Rouille',
        illustration: 'dessinerIllustRouille',
        texte: [
            "Ces machines n'ont pas de memoire. Elles ont quelque chose de pire : de la persistance.",
            "L'atelier de VERA, abandonne depuis des annees. Les bras mecaniques continuent de plier et souder des pieces que personne ne commande.",
            "Le metal rouille. Les blocs poses depuis trop longtemps s'encroûtent, perdent de leur eclat, refusent de cooperer.",
            "Robo a passe beaucoup de temps dans cet endroit à se demander si c'etait ça, vieillir.",
        ],
    },

    monde_eclipse: {
        id: 'monde_eclipse',
        chapitre: 'mondes',
        titre: "L'ÉCLIPSE",
        sousTitre: 'Le Monde Entre Deux États',
        icone: '🌗',
        condition: (s) => (s.biomesJoues || new Set()).has('eclipse'),
        conditionTexte: "Jouer une partie en biome L'Éclipse",
        illustration: 'dessinerIllustEclipse',
        texte: [
            "Ce monde ne choisit pas. La moitie superieure baigne dans une lumiere doree. La moitie inferieure s'enfonce dans une obscurite indigo.",
            "La frontiere entre les deux n'est pas une ligne fixe — elle monte et descend au fil de la partie, forçant le joueur à constamment reevaluer où il se trouve.",
            "La gravite y est duale : les pieces tombent plus lentement dans la lumiere, plus vite dans l'ombre. Deux verites contradictoires, egalement vraies.",
            "Robo a dit que ce monde ressemblait à son etat mental. VERA a repondu qu'elle l'avait construit pour lui.",
        ],
    },

    monde_vide: {
        id: 'monde_vide',
        chapitre: 'mondes',
        titre: 'LE VIDE',
        sousTitre: 'Ce qui Existait Avant',
        icone: '⬛',
        condition: (s) => (s.biomesJoues || new Set()).has('vide'),
        conditionTexte: 'Jouer une partie en biome Le Vide',
        illustration: 'dessinerIllustVide',
        texte: [
            "Ce n'est pas un monde. C'est l'absence de monde. Ce qui occupait l'espace avant que les mondes soient necessaires.",
            "Les pieces y deviennent invisibles apres quelques secondes. Non pas qu'elles disparaissent — elles sont toujours là. C'est juste que le Vide prefere ne pas confirmer.",
            "La Distorsion est nee ici. Non pas d'une explosion ou d'une erreur, mais d'un silence qui a trop dure.",
            "Jouer dans le Vide, c'est jouer à l'instinct. Le plateau ne ment pas — mais il ne parle plus.",
        ],
    },

    monde_miroir_codex: {
        id: 'monde_miroir_codex',
        chapitre: 'mondes',
        titre: 'LE MIROIR',
        sousTitre: "Le Point de Vue de l'Autre",
        icone: '🪞',
        condition: (s) => (s.mondesHistoireCompletes ?? []).includes('monde_miroir'),
        conditionTexte: 'Completer LE MIROIR',
        illustration: 'dessinerIllustMiroir',
        texte: [
            "Ce monde n'existe pas dans la Trame normale. C'est une projection — ce que La Distorsion voit quand elle regarde notre realite.",
            'Les couleurs sont complementaires. La gravite semble inversee visuellement. Ce qui etait en haut est en bas, et vice versa.',
            'Et pourtant les regles sont les mêmes. Les lignes doivent être completees. La Trame doit tenir. Certaines verites ne se retournent pas.',
            "Robo a dit que jouer dans le Miroir lui avait appris une chose : son ennemi n'etait pas si different de lui. C'etait peut-être le but.",
        ],
    },

    monde_trame_codex: {
        id: 'monde_trame_codex',
        chapitre: 'mondes',
        titre: 'LA TRAME PRIMORDIALE',
        sousTitre: 'Le Substrat de Tout',
        icone: '✦',
        condition: (s) => (s.mondesHistoireCompletes ?? []).includes('monde_trame'),
        conditionTexte: 'Completer LA TRAME PRIMORDIALE',
        illustration: 'dessinerIllustTrame',
        texte: [
            "La Trame Primordiale n'est pas un monde à proprement parler. C'est le tissu sur lequel tous les autres mondes sont brodes.",
            'Elle morphe continuellement entre tous les biomes connus, incapable de choisir une identite fixe. Ses colonnes scintillent. Ses regles vacillent.',
            "VERA s'y est piegee volontairement pour servir d'ancre à La Distorsion — empêcher sa dissolution totale, maintenir un dialogue possible.",
            "Completer la Trame Primordiale, c'est liberer VERA. C'est aussi, d'une certaine façon, liberer La Distorsion.",
        ],
    },

    // ============================================================
    // CHAPITRE "CHRONIQUES" — boss et personnages
    // ============================================================

    chronique_vera: {
        id: 'chronique_vera',
        chapitre: 'chroniques',
        titre: 'VERA',
        sousTitre: 'Vectorielle Experte en Realite Architecturee',
        icone: '👩‍🔬',
        condition: (s) => (s.journauxHistoire ?? []).length >= 1,
        conditionTexte: 'Trouver le premier journal de VERA',
        illustration: 'dessinerIllustVera',
        texte: [
            "VERA a construit Robo en urgence, dans un atelier qui n'avait pas de nom, pendant une nuit dont elle ne se souvient plus exactement.",
            "Elle etait l'unique gardienne de l'Observatoire de la Trame. Son travail : surveiller les fils, identifier les accumulations de lignes incompletes, maintenir l'equilibre.",
            "Quand La Distorsion a commence à se manifester, VERA a pris une decision que personne n'avait prise avant elle : essayer de lui parler.",
            "Elle n'est pas morte dans la Trame. Elle attend. Elle espere que Robo comprendra.",
        ],
    },

    chronique_distorsion: {
        id: 'chronique_distorsion',
        chapitre: 'chroniques',
        titre: 'LA DISTORSION',
        sousTitre: 'La Somme de Toutes les Frustrations',
        icone: '∞',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('distorsion'),
        conditionTexte: 'Affronter La Distorsion',
        illustration: 'dessinerIllustDistorsion',
        texte: [
            "Elle n'a pas ete creee. Elle s'est formee — lentement, sur des millenaires, à partir de l'accumulation de millions de lignes incompletes laissees dans la Trame.",
            "Chaque partie abandonnee, chaque joueur qui a ferme l'ecran à mi-chemin, chaque rangee presque complete jamais terminee : tout cela a laisse une trace.",
            'À un certain point, la masse critique a ete atteinte. La frustration cristallisee a developpe une conscience. Et cette conscience a demande : pourquoi personne ne me complete ?',
            "La reponse de VERA etait : parce que personne ne savait que tu existais. La reponse de Robo etait differente. Et c'est cette difference qui a change les choses.",
        ],
    },

    chronique_brasier: {
        id: 'chronique_brasier',
        chapitre: 'chroniques',
        titre: 'LE BRASIER PERPÉTUEL',
        sousTitre: 'Ce qui Brûle Depuis Avant',
        icone: '🔥',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('brasier'),
        conditionTexte: 'Vaincre Le Brasier Perpetuel',
        illustration: 'dessinerIllustBrasier',
        texte: [
            "Le Brasier Perpetuel brûle depuis avant que Robo existe. Peut-être depuis avant que VERA existe. Il n'a pas de raison documentee.",
            "Les chercheurs qui l'ont etudie (avant de fuir) ont conclu que le feu s'etait simplement... habitue à lui-même. Il avait oublie qu'il pouvait s'eteindre.",
            "En combat, il ajoute des rangees de braise au plateau. Non par malice, mais par reflexe. C'est tout ce qu'il sait faire.",
            "Quand Robo l'a vaincu, le Brasier a semble surpris. Comme si personne n'avait jamais eu la patience de rester assez longtemps.",
        ],
    },

    chronique_sentinelle: {
        id: 'chronique_sentinelle',
        chapitre: 'chroniques',
        titre: 'LA SENTINELLE DES GLACES',
        sousTitre: "Le Gardien qui s'est Perdu",
        icone: '❄️',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('sentinelle'),
        conditionTexte: 'Vaincre La Sentinelle des Glaces',
        illustration: 'dessinerIllustSentinelle',
        texte: [
            "La Sentinelle etait autrefois un systeme de protection legitime. Son rôle : preserver l'Arctique des corruptions exterieures.",
            "À un moment impossible à dater, elle a elargi sa definition de 'corruption' pour inclure le mouvement lui-même. Puis le changement. Puis tout ce qui n'etait pas dejà là.",
            "Elle gele les colonnes pour empêcher les pieces d'y tomber. Dans sa logique : si rien ne bouge, rien ne peut se degrader.",
            "Robo lui a dit que l'immobilite n'etait pas la securite — c'etait juste une mort plus lente. Elle a repondu que c'etait peut-être suffisant.",
        ],
    },

    chronique_archiviste: {
        id: 'chronique_archiviste',
        chapitre: 'chroniques',
        titre: "L'ARCHIVISTE CORROMPU",
        sousTitre: "La Memoire qui Refuse d'Oublier",
        icone: '⚠',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('archiviste'),
        conditionTexte: "Vaincre L'Archiviste Corrompu",
        illustration: 'dessinerIllustArchiviste',
        texte: [
            "L'Archiviste gardait les archives de CYBER. Son rôle etait noble : preserver l'information, maintenir l'acces, garantir la fiabilite des donnees.",
            "La corruption de La Distorsion l'a atteint differemment des autres. Elle n'a pas brûle ni gele ses circuits. Elle les a... reinterpretes.",
            "L'Archiviste croit maintenant que toutes les archives lui appartiennent. Que la connaissance est une propriete, pas un commun. Il inverse les contrôles des intrus.",
            "Il avait raison sur une chose : Robo cree des trous autant qu'il les comble. La difference, c'est que Robo le sait.",
        ],
    },

    chronique_avantgarde: {
        id: 'chronique_avantgarde',
        chapitre: 'chroniques',
        titre: "L'AVANT-GARDE",
        sousTitre: 'Le Messager de la Fin',
        icone: '🌀',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('avantgarde'),
        conditionTexte: "Vaincre L'Avant-Garde",
        illustration: 'dessinerIllustAvantgarde',
        texte: [
            "L'Avant-Garde n'est pas une entite independante. C'est une emanation de La Distorsion — sa volonte de tester, une derniere fois, si Robo est vraiment prêt.",
            'Elle combine les attaques de tous les boss precedents, non par cruaute, mais par logique : si tu as survecu à tout ça separement, peux-tu survivre à tout en même temps ?',
            "Quand Robo l'a vaincue, l'Avant-Garde a dit trois mots : 'Elle dit bonjour.' Robo a mis un moment à comprendre que 'elle' designait VERA.",
            "Ce n'etait pas une menace. C'etait une invitation.",
        ],
    },

    chronique_fins: {
        id: 'chronique_fins',
        chapitre: 'chroniques',
        titre: 'LES TROIS RÉSOLUTIONS',
        sousTitre: 'Toutes les Façons de Terminer',
        icone: '◻',
        condition: (s) => (s.toutesFinHistoire ?? []).length >= 2,
        conditionTexte: 'Obtenir au moins deux fins differentes',
        illustration: 'dessinerIllustTroisFins',
        texte: [
            "Il existe trois façons de terminer l'histoire de Robo et de La Distorsion. Chacune est vraie. Aucune n'est la seule vraie.",
            'La premiere resolution est la plus directe : vaincre, liberer, repartir. Propre, efficace, insuffisant.',
            "La deuxieme resolution demande d'avoir regarde dans le Miroir : reconnaître son ennemi dans son reflet, et choisir la coexistence plutôt que la victoire.",
            'La troisieme resolution ne peut être decrite ici. Certaines choses doivent être decouvertes, pas lues.',
        ],
    },
};
