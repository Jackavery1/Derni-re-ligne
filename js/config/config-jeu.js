export const CONFIG = {
    colonnes: 10,
    lignes: 20,
    taille: 32,
    vitesseBase: 920,
    vitesseMin: 85,
    reductionParNiveau: 52,
    lockDelay: 500,
    maxLockResets: 15,
    areMs: 170,
    coyoteTimeMs: 120,
    spawnGraceMs: 500,
    inputBufferMax: 3,
    marathonInputBufferMax: 4,
    sprintInputBufferMax: 3,
    delaiNarratifVictoireHistoireMs: 900,
    dasDelai: 167,
    arrInterval: 33,
    sprintLignes: 40,
    sprintVitesseBase: 1000,
    sprintReductionParNiveau: 35,
    sprintVitesseMin: 130,
    sprintSpawnGraceMs: 650,
    lignesParNiveau: 15,
    tempsNiveauBaseSec: 165,
    tempsNiveauBonusSec: 12,
    tempsNiveauMaxSec: 240,
    tempsAvertissementNiveauSec: 60,
    tempsAlerteFinSec: 30,
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
    pauseHauteur: 168,
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
