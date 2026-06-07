/**
 * js/histoire-intro.js
 * Séquence "cold open" affichée la première fois que le joueur
 * clique sur MODE HISTOIRE. Ne se rejoue jamais.
 */
import { lireStockage, ecrireStockage } from './progression.js';

const CLE_INTRO_VUE = 'derniereLigne_introHistoireVue';

export function introHistoireDejaVue() {
    return lireStockage(CLE_INTRO_VUE, '0') === '1';
}

export function marquerIntroHistoireVue() {
    ecrireStockage(CLE_INTRO_VUE, '1');
}

/** @returns {{ lignes: string[], personnages: string[] }} */
export function obtenirSequenceIntro() {
    return {
        lignes: INTRO_COLD_OPEN.map((l) => l.texte),
        personnages: INTRO_COLD_OPEN.map((l) => l.personnage),
    };
}

/**
 * La séquence se passe AVANT le prologue :
 * VERA est seule dans l'Observatoire, La Distorsion commence à apparaître,
 * VERA décide de créer Robo.
 */
const INTRO_COLD_OPEN = [
    {
        personnage: 'narrateur',
        texte: "Il y a des millénaires, quelqu'un a inventé un jeu.",
    },
    {
        personnage: 'narrateur',
        texte: 'Des blocs qui tombent. Des lignes qui disparaissent. Simple.',
    },
    {
        personnage: 'narrateur',
        texte: "Ce que personne n'avait prévu : ce qui se passe quand on arrête.",
    },
    {
        personnage: 'systeme',
        texte: '> OBSERVATOIRE DE LA TRAME — SECTEUR OMEGA',
    },
    {
        personnage: 'systeme',
        texte: '> ALERTE NIVEAU 3 — FRAGMENTATION DÉTECTÉE',
    },
    {
        personnage: 'systeme',
        texte: '> OPÉRATEUR : VERA — CONNEXION ACTIVE',
    },
    {
        personnage: 'vera',
        texte: 'Encore.',
    },
    {
        personnage: 'vera',
        texte: "Chaque nuit, les mêmes données. Des millions de parties abandonnées. Des lignes que personne n'a voulu compléter.",
    },
    {
        personnage: 'vera',
        texte: "Je pensais que c'était du bruit. Des erreurs de calcul. Des artefacts.",
    },
    {
        personnage: 'vera',
        texte: "Ce n'est pas du bruit.",
    },
    {
        personnage: 'narrateur',
        texte: 'Au centre de la Trame, quelque chose de nouveau observe les données.',
    },
    {
        personnage: 'distorsion',
        texte: '…',
    },
    {
        personnage: 'distorsion',
        texte: 'Pourquoi personne ne finit ses lignes ?',
    },
    {
        personnage: 'vera',
        texte: "Elle a dit quelque chose. La première fois en sept ans d'écoute.",
    },
    {
        personnage: 'vera',
        texte: "Elle n'est pas encore dangereuse. Juste... seule. Et la solitude a du temps devant elle.",
    },
    {
        personnage: 'vera',
        texte: "Je dois trouver quelqu'un qui peut lui répondre. Quelqu'un qui comprend les blocs et les lignes mieux que moi.",
    },
    {
        personnage: 'systeme',
        texte: "> NOUVEAU PROJET : CRÉATION D'UN AGENT DE TERRAIN",
    },
    {
        personnage: 'systeme',
        texte: '> DESIGNATION : R.O.B.O',
    },
    {
        personnage: 'systeme',
        texte: '> FONCTION PRINCIPALE : GARDER LA TRAME',
    },
    {
        personnage: 'vera',
        texte: 'Je le construis cette nuit.',
    },
    {
        personnage: 'vera',
        texte: 'Il faudra lui apprendre à jouer. Et lui expliquer pourquoi.',
    },
    {
        personnage: 'vera',
        texte: "Mais d'abord — il faudra qu'il existe.",
    },
    {
        personnage: 'narrateur',
        texte: 'Elle soude le dernier circuit à 4h17 du matin.',
    },
    {
        personnage: 'narrateur',
        texte: "Elle n'avait pas remarqué que La Distorsion l'observait depuis une heure.",
    },
];
