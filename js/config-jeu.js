export const CONFIG = {
    colonnes: 10,
    lignes: 20,
    taille: 32,
    vitesseBase: 900,
    vitesseMin: 80,
    reductionParNiveau: 60,
    lockDelay: 500,
    maxLockResets: 15,
    dasDelai: 167,
    arrInterval: 33,
    sprintLignes: 40,
};

export const LAYOUT = {
    panneauLargeur: 128,
    gap: 10,
    plateauLargeur: 320,
    plateauHauteur: 640,
    previewHauteur: 200,
    holdHauteur: 72,
    statsHauteur: 280,
    mascotteHauteur: 130,
    pauseHauteur: 40,
    paddingVertical: 16,
    margeScale: 20,
    hauteurControles: 132,
};

export const TABLE_KICK_STANDARD = [
    [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
    ],
    [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
    ],
    [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
    ],
    [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
    ],
];

export const TABLE_KICK_I = [
    [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
    ],
    [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
    ],
    [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
    ],
    [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
    ],
];

export const TETROMINOS = {
    I: {
        rotations: [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
            ],
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ],
        ],
    },
    O: {
        rotations: [
            [
                [1, 1],
                [1, 1],
            ],
        ],
    },
    T: {
        rotations: [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
        ],
    },
    S: {
        rotations: [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
        ],
    },
    Z: {
        rotations: [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0],
            ],
        ],
    },
    J: {
        rotations: [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ],
        ],
    },
    L: {
        rotations: [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0],
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
            ],
        ],
    },
};

export const TOUCHES_DEFAUT = {
    gauche: 'ArrowLeft',
    droite: 'ArrowRight',
    bas: 'ArrowDown',
    tournerH: 'ArrowUp',
    tournerAH: 'KeyX',
    chute: 'Space',
    hold: 'KeyC',
    pause: 'KeyP',
};
