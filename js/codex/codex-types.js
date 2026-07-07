/** @typedef {{ id: string, chapitre: string, titre: string, sousTitre?: string, icone?: string, conditionTexte?: string, illustration?: string, texte?: string[] }} EntreeCodexStatique */

/** @typedef {EntreeCodexStatique & { condition: (stats: object) => boolean }} EntreeCodex */

export {};
