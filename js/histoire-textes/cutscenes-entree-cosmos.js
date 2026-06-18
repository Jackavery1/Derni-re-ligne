export const CUTSCENES_ENTREE_COSMOS = {
    monde_fuochi: {
        scene: 'seuil_brasier',
        lignes: [
            {
                personnage: 'narrateur',
                texte: "Les Feux d'Artifice. Quelqu'un les a allumés. Personne ne sait qui.",
            },
            {
                personnage: 'robo',
                texte: 'Pourquoi célébrer ici ? Au milieu de tout ça ?',
                humeur: 'neutre',
            },
            {
                personnage: 'vera',
                texte: '— Signal fragmenté — ...parce que sinon on oublie... pourquoi... ça valait la peine...',
                humeur: 'glitch',
            },
            { personnage: 'robo', texte: 'VERA ? Tu es là ?', humeur: 'excite' },
            { personnage: 'vera', texte: '— Signal perdu —', humeur: 'glitch' },
            { personnage: 'robo', texte: 'Elle est vivante.', humeur: 'excite' },
        ],
    },

    monde_cosmos: {
        scene: 'observatoire',
        lignes: [
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
                texte: "Personne n'a jamais fait la différence. Même moi, je... non. Nous. Nous ne sommes pas sûres.",
                humeur: 'menacante',
            },
        ],
    },

    monde_vide: [
        {
            scene: 'vide_errance',
            personnage: 'distorsion',
            texte: 'Tu es encore là.',
            humeur: 'menacante',
        },
        {
            scene: 'vide_errance',
            personnage: 'robo',
            texte: "Tu as essayé de m'arrêter. Le Brasier. La Sentinelle. L'Archiviste.",
            humeur: 'neutre',
        },
        {
            scene: 'vide_errance',
            personnage: 'distorsion',
            texte: "Non. Une partie de moi a essayé. Une autre t'a laissé passer. Une troisième t'a ouvert la route.",
            humeur: 'souffrante',
        },
        {
            scene: 'vide_errance',
            personnage: 'distorsion',
            texte: 'Je suis des millions, gardien. On ne vote pas, entre nous, on déborde — désolée si ça donne le vertige.',
            humeur: 'souffrante',
        },
        {
            scene: 'vide_errance',
            personnage: 'robo',
            texte: 'Laquelle me parle, en ce moment ?',
            humeur: 'neutre',
        },
        {
            scene: 'vide_errance',
            personnage: 'distorsion',
            texte: 'Celle qui est fatiguée.',
            humeur: 'souffrante',
        },
        {
            scene: 'vide_errance',
            personnage: 'robo',
            texte: "J'ai quelque chose qui ressemble à de la peur. Mais j'ai aussi quelque chose qui ressemble à une raison de rester.",
            humeur: 'neutre',
        },
        {
            scene: 'vide_errance',
            personnage: 'distorsion',
            texte: "C'est ce que VERA avait prévu. Je n'arrive pas à décider si c'est admirable ou agaçant.",
            humeur: 'curieuse',
        },
        {
            scene: 'vide_errance',
            personnage: 'narrateur',
            texte: 'Le Vide les entoure. Quelque chose a changé dans leur façon de se regarder.',
        },
    ],

    monde_boss_4: [
        {
            scene: 'seuil_avantgarde',
            personnage: 'avantgarde',
            texte: "Elle t'attend derrière.",
            humeur: 'calme',
        },
        { scene: 'seuil_avantgarde', personnage: 'robo', texte: 'Je sais.', humeur: 'neutre' },
        {
            scene: 'seuil_avantgarde',
            personnage: 'avantgarde',
            texte: "Elle veut que tu comprennes avant d'arriver.",
            humeur: 'calme',
        },
        {
            scene: 'seuil_avantgarde',
            personnage: 'robo',
            texte: 'Comprendre quoi ?',
            humeur: 'neutre',
        },
        {
            scene: 'seuil_avantgarde',
            personnage: 'avantgarde',
            texte: "Qu'elle n'est pas ton ennemie. Qu'elle est ta conclusion logique.",
            humeur: 'calme',
        },
        {
            scene: 'seuil_avantgarde',
            personnage: 'robo',
            texte: 'Alors laisse-moi passer.',
            humeur: 'neutre',
        },
        {
            scene: 'seuil_avantgarde',
            personnage: 'avantgarde',
            texte: 'Prouve que tu es prêt.',
            humeur: 'calme',
        },
    ],
};
