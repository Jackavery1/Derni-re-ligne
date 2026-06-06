// js/codex-histoire.js
// Entrées Codex pour le Mode Histoire :
// nouveaux biomes, boss, mondes cachés, personnages.
// Ajoutées dynamiquement aux chapitres existants (mondes, chroniques).

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
            "Ces machines n'ont pas de mémoire. Elles ont quelque chose de pire : de la persistance.",
            "L'atelier de VERA, abandonné depuis des années. Les bras mécaniques continuent de plier et souder des pièces que personne ne commande.",
            "Le métal rouille. Les blocs posés depuis trop longtemps s'encroûtent, perdent de leur éclat, refusent de coopérer.",
            "Robo a passé beaucoup de temps dans cet endroit à se demander si c'était ça, vieillir.",
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
            "Ce monde ne choisit pas. La moitié supérieure baigne dans une lumière dorée. La moitié inférieure s'enfonce dans une obscurité indigo.",
            "La frontière entre les deux n'est pas une ligne fixe — elle monte et descend au fil de la partie, forçant le joueur à constamment réévaluer où il se trouve.",
            "La gravité y est duale : les pièces tombent plus lentement dans la lumière, plus vite dans l'ombre. Deux vérités contradictoires, également vraies.",
            "Robo a dit que ce monde ressemblait à son état mental. VERA a répondu qu'elle l'avait construit pour lui.",
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
            "Ce n'est pas un monde. C'est l'absence de monde. Ce qui occupait l'espace avant que les mondes soient nécessaires.",
            "Les pièces y deviennent invisibles après quelques secondes. Non pas qu'elles disparaissent — elles sont toujours là. C'est juste que le Vide préfère ne pas confirmer.",
            "La Distorsion est née ici. Non pas d'une explosion ou d'une erreur, mais d'un silence qui a trop duré.",
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
        conditionTexte: 'Compléter LE MIROIR',
        illustration: 'dessinerIllustMiroir',
        texte: [
            "Ce monde n'existe pas dans la Trame normale. C'est une projection — ce que La Distorsion voit quand elle regarde notre réalité.",
            'Les couleurs sont complémentaires. La gravité semble inversée visuellement. Ce qui était en haut est en bas, et vice versa.',
            'Et pourtant les règles sont les mêmes. Les lignes doivent être complétées. La Trame doit tenir. Certaines vérités ne se retournent pas.',
            "Robo a dit que jouer dans le Miroir lui avait appris une chose : son ennemi n'était pas si différent de lui. C'était peut-être le but.",
        ],
    },

    monde_trame_codex: {
        id: 'monde_trame_codex',
        chapitre: 'mondes',
        titre: 'LA TRAME PRIMORDIALE',
        sousTitre: 'Le Substrat de Tout',
        icone: '✦',
        condition: (s) => (s.mondesHistoireCompletes ?? []).includes('monde_trame'),
        conditionTexte: 'Compléter LA TRAME PRIMORDIALE',
        illustration: 'dessinerIllustTrame',
        texte: [
            "La Trame Primordiale n'est pas un monde à proprement parler. C'est le tissu sur lequel tous les autres mondes sont brodés.",
            'Elle morphe continuellement entre tous les biomes connus, incapable de choisir une identité fixe. Ses colonnes scintillent. Ses règles vacillent.',
            "VERA s'y est piégée volontairement pour servir d'ancre à La Distorsion — empêcher sa dissolution totale, maintenir un dialogue possible.",
            "Compléter la Trame Primordiale, c'est libérer VERA. C'est aussi, d'une certaine façon, libérer La Distorsion.",
        ],
    },

    // ============================================================
    // CHAPITRE "CHRONIQUES" — boss et personnages
    // ============================================================

    chronique_vera: {
        id: 'chronique_vera',
        chapitre: 'chroniques',
        titre: 'VERA',
        sousTitre: 'Vectorielle Experte en Réalité Architecturée',
        icone: '👩‍🔬',
        condition: (s) => (s.journauxHistoire ?? []).length >= 1,
        conditionTexte: 'Trouver le premier journal de VERA',
        illustration: 'dessinerIllustVera',
        texte: [
            "VERA a construit Robo en urgence, dans un atelier qui n'avait pas de nom, pendant une nuit dont elle ne se souvient plus exactement.",
            "Elle était l'unique gardienne de l'Observatoire de la Trame. Son travail : surveiller les fils, identifier les accumulations de lignes incomplètes, maintenir l'équilibre.",
            "Quand La Distorsion a commencé à se manifester, VERA a pris une décision que personne n'avait prise avant elle : essayer de lui parler.",
            "Elle n'est pas morte dans la Trame. Elle attend. Elle espère que Robo comprendra.",
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
            "Elle n'a pas été créée. Elle s'est formée — lentement, sur des millénaires, à partir de l'accumulation de millions de lignes incomplètes laissées dans la Trame.",
            "Chaque partie abandonnée, chaque joueur qui a fermé l'écran à mi-chemin, chaque rangée presque complète jamais terminée : tout cela a laissé une trace.",
            'À un certain point, la masse critique a été atteinte. La frustration cristallisée a développé une conscience. Et cette conscience a demandé : pourquoi personne ne me complète ?',
            "La réponse de VERA était : parce que personne ne savait que tu existais. La réponse de Robo était différente. Et c'est cette différence qui a changé les choses.",
        ],
    },

    chronique_brasier: {
        id: 'chronique_brasier',
        chapitre: 'chroniques',
        titre: 'LE BRASIER PERPÉTUEL',
        sousTitre: 'Ce qui Brûle Depuis Avant',
        icone: '🔥',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('brasier'),
        conditionTexte: 'Vaincre Le Brasier Perpétuel',
        illustration: 'dessinerIllustBrasier',
        texte: [
            "Le Brasier Perpétuel brûle depuis avant que Robo existe. Peut-être depuis avant que VERA existe. Il n'a pas de raison documentée.",
            "Les chercheurs qui l'ont étudié (avant de fuir) ont conclu que le feu s'était simplement... habitué à lui-même. Il avait oublié qu'il pouvait s'éteindre.",
            "En combat, il ajoute des rangées de braise au plateau. Non par malice, mais par réflexe. C'est tout ce qu'il sait faire.",
            "Quand Robo l'a vaincu, le Brasier a semblé surpris. Comme si personne n'avait jamais eu la patience de rester assez longtemps.",
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
            "La Sentinelle était autrefois un système de protection légitime. Son rôle : préserver l'Arctique des corruptions extérieures.",
            "À un moment impossible à dater, elle a élargi sa définition de 'corruption' pour inclure le mouvement lui-même. Puis le changement. Puis tout ce qui n'était pas déjà là.",
            "Elle gèle les colonnes pour empêcher les pièces d'y tomber. Dans sa logique : si rien ne bouge, rien ne peut se dégrader.",
            "Robo lui a dit que l'immobilité n'était pas la sécurité — c'était juste une mort plus lente. Elle a répondu que c'était peut-être suffisant.",
        ],
    },

    chronique_archiviste: {
        id: 'chronique_archiviste',
        chapitre: 'chroniques',
        titre: "L'ARCHIVISTE CORROMPU",
        sousTitre: "La Mémoire qui Refuse d'Oublier",
        icone: '⚠',
        condition: (s) => (s.bossHistoireVaincus ?? []).includes('archiviste'),
        conditionTexte: "Vaincre L'Archiviste Corrompu",
        illustration: 'dessinerIllustArchiviste',
        texte: [
            "L'Archiviste gardait les archives de CYBER. Son rôle était noble : préserver l'information, maintenir l'accès, garantir la fiabilité des données.",
            "La corruption de La Distorsion l'a atteint différemment des autres. Elle n'a pas brûlé ni gelé ses circuits. Elle les a... réinterprétés.",
            "L'Archiviste croit maintenant que toutes les archives lui appartiennent. Que la connaissance est une propriété, pas un commun. Il inverse les contrôles des intrus.",
            "Il avait raison sur une chose : Robo crée des trous autant qu'il les comble. La différence, c'est que Robo le sait.",
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
            "L'Avant-Garde n'est pas une entité indépendante. C'est une émanation de La Distorsion — sa volonté de tester, une dernière fois, si Robo est vraiment prêt.",
            'Elle combine les attaques de tous les boss précédents, non par cruauté, mais par logique : si tu as survécu à tout ça séparément, peux-tu survivre à tout en même temps ?',
            "Quand Robo l'a vaincue, l'Avant-Garde a dit trois mots : 'Elle dit bonjour.' Robo a mis un moment à comprendre que 'elle' désignait VERA.",
            "Ce n'était pas une menace. C'était une invitation.",
        ],
    },

    chronique_fins: {
        id: 'chronique_fins',
        chapitre: 'chroniques',
        titre: 'LES TROIS RÉSOLUTIONS',
        sousTitre: 'Toutes les Façons de Terminer',
        icone: '◻',
        condition: (s) => (s.toutesFinHistoire ?? []).length >= 2,
        conditionTexte: 'Obtenir au moins deux fins différentes',
        illustration: 'dessinerIllustTroisFins',
        texte: [
            "Il existe trois façons de terminer l'histoire de Robo et de La Distorsion. Chacune est vraie. Aucune n'est la seule vraie.",
            'La première résolution est la plus directe : vaincre, libérer, repartir. Propre, efficace, insuffisant.',
            "La deuxième résolution demande d'avoir regardé dans le Miroir : reconnaître son ennemi dans son reflet, et choisir la coexistence plutôt que la victoire.",
            'La troisième résolution ne peut être décrite ici. Certaines choses doivent être découvertes, pas lues.',
        ],
    },
};
