import { CONFIG } from '../config/config-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { obtenirForme } from '../logique/piece-jeu.js';
import { logger } from '../logger.js';
import { lireStockageJson, ecrireStockageJson } from '../io/progression.js';

const MAX_VERROUS = 200;
const MAX_REACTIONS = 200;
const CLE_PROFIL = 'derniereLigne_profilDernier';

function creerDonneesVides() {
    return {
        atterrissagesColonne: new Array(CONFIG.colonnes).fill(0),
        timestampsVerrou: [],
        nbRotations: 0,
        nbHardDrops: 0,
        nbHolds: 0,
        nbMouvementsLateraux: 0,
        tempsReactions: [],
        dernierTempsApparition: 0,
        lignesParNiveau: {},
        maxHauteurPlateau: 0,
        lignesPartie: 0,
        biomeId: null,
    };
}

export const donneesPartie = creerDonneesVides();

export let dernierProfil = {
    donnees: creerDonneesVides(),
    titreStyle: '',
    profil: null,
};

export function reinitialiserDonneesPartie() {
    Object.assign(donneesPartie, creerDonneesVides());
    donneesPartie.dernierTempsApparition = Date.now();
}

export function signalerApparitionPiece() {
    donneesPartie.dernierTempsApparition = Date.now();
}

export function enregistrerReaction() {
    if (!donneesPartie.dernierTempsApparition) return;
    const reaction = Date.now() - donneesPartie.dernierTempsApparition;
    if (reaction > 0 && reaction < 10000) {
        if (donneesPartie.tempsReactions.length < MAX_REACTIONS) {
            donneesPartie.tempsReactions.push(reaction);
        }
        donneesPartie.dernierTempsApparition = null;
    }
}

export function calculerHauteurPlateau() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) {
            return CONFIG.lignes - l;
        }
    }
    return 0;
}

export function enregistrerDonneesVerrouillage() {
    if (!etat.pieceActuelle) return;
    const piece = etat.pieceActuelle;
    const forme = obtenirForme(piece);

    for (let c = 0; c < forme[0].length; c++) {
        if (forme.some((ligne) => ligne[c])) {
            const col = piece.x + c;
            if (col >= 0 && col < CONFIG.colonnes) {
                donneesPartie.atterrissagesColonne[col]++;
            }
        }
    }

    if (donneesPartie.timestampsVerrou.length < MAX_VERROUS) {
        donneesPartie.timestampsVerrou.push(Date.now());
    }

    const hauteur = calculerHauteurPlateau();
    if (hauteur > donneesPartie.maxHauteurPlateau) {
        donneesPartie.maxHauteurPlateau = hauteur;
    }
}

export function compterRotation() {
    donneesPartie.nbRotations++;
    enregistrerReaction();
}

export function compterMouvementLateral() {
    donneesPartie.nbMouvementsLateraux++;
    enregistrerReaction();
}

export function compterHardDrop() {
    donneesPartie.nbHardDrops++;
}

export function compterHold() {
    donneesPartie.nbHolds++;
}

export function enregistrerLignesParNiveau(nbLignes) {
    if (nbLignes <= 0) return;
    donneesPartie.lignesParNiveau[etat.niveau] =
        (donneesPartie.lignesParNiveau[etat.niveau] || 0) + nbLignes;
}

function clonerDonnees(src) {
    return {
        atterrissagesColonne: [...src.atterrissagesColonne],
        timestampsVerrou: [...src.timestampsVerrou],
        nbRotations: src.nbRotations,
        nbHardDrops: src.nbHardDrops,
        nbHolds: src.nbHolds,
        nbMouvementsLateraux: src.nbMouvementsLateraux,
        tempsReactions: [...src.tempsReactions],
        dernierTempsApparition: src.dernierTempsApparition,
        lignesParNiveau: { ...src.lignesParNiveau },
        maxHauteurPlateau: src.maxHauteurPlateau,
        lignesPartie: src.lignesPartie,
        biomeId: src.biomeId,
    };
}

export function calculerProfilStyle(donnees, lignesPartie) {
    const nb = donnees.timestampsVerrou.length;
    if (nb < 3) return null;

    const intervalles = [];
    for (let i = 1; i < donnees.timestampsVerrou.length; i++) {
        intervalles.push(donnees.timestampsVerrou[i] - donnees.timestampsVerrou[i - 1]);
    }
    const moyInter = intervalles.reduce((a, b) => a + b, 0) / intervalles.length;
    const vitesse = Math.round(Math.max(0, Math.min(100, 100 - (moyInter - 800) / 32)));

    const precision = Math.round(Math.min(100, (lignesPartie / nb) * 250));

    const agressivite = Math.round(Math.min(100, (donnees.nbHardDrops / nb) * 100));

    const endurance = Math.round(Math.min(100, (nb / 150) * 100));

    const ratioRot = donnees.nbRotations / nb;
    const ratioHold = donnees.nbHolds / nb;
    const creativite = Math.round(Math.min(100, ratioRot * 40 + ratioHold * 60));

    const moy = donnees.atterrissagesColonne.reduce((a, b) => a + b, 0) / CONFIG.colonnes;
    const variance =
        donnees.atterrissagesColonne.reduce((acc, v) => acc + Math.pow(v - moy, 2), 0) /
        CONFIG.colonnes;
    const ecartType = Math.sqrt(variance);
    const equilibre = Math.round(Math.max(0, Math.min(100, 100 - (ecartType / (moy || 1)) * 50)));

    return { vitesse, precision, agressivite, endurance, creativite, equilibre };
}

const NOTES_VERA = {
    agressivite: 'Il fonce. Comme si chaque ligne était la dernière. — V.',
    precision: "Pas un geste de trop. Je n'ai jamais vu ça. — V.",
    equilibre: "Il apprend l'équilibre. Plus vite que moi. — V.",
    endurance: "Il ne s'arrête pas. Je me demande s'il sait pourquoi. — V.",
    creativite: 'Il joue comme on invente. — V.',
    vitesse: 'Chaque pièce, une décision instantanée. — V.',
};

const NOTE_VERA_DEFAUT = "La Trame m'observe à travers lui. — V.";

/**
 * @param {NonNullable<ReturnType<typeof calculerProfilStyle>>} profil
 * @returns {keyof typeof NOTES_VERA | null}
 */
export function obtenirAxeDominant(profil) {
    if (!profil) return null;
    const axes = [
        { cle: 'vitesse', val: profil.vitesse },
        { cle: 'precision', val: profil.precision },
        { cle: 'agressivite', val: profil.agressivite },
        { cle: 'endurance', val: profil.endurance },
        { cle: 'creativite', val: profil.creativite },
        { cle: 'equilibre', val: profil.equilibre },
    ];
    axes.sort((a, b) => b.val - a.val);
    return /** @type {keyof typeof NOTES_VERA} */ (axes[0].cle);
}

/**
 * @param {ReturnType<typeof calculerProfilStyle>} profil
 * @returns {string}
 */
export function obtenirNoteVera(profil) {
    const axe = obtenirAxeDominant(profil);
    if (!axe) return NOTE_VERA_DEFAUT;
    return NOTES_VERA[axe] ?? NOTE_VERA_DEFAUT;
}

export function genererTitreStyle(profil) {
    if (!profil) return 'JOUEUR MYSTÉRIEUX';

    const axes = [
        { val: profil.vitesse, titres: ['ÉCLAIR', 'FULGURANT', 'RAPIDE'] },
        { val: profil.precision, titres: ['ARCHITECTE', 'CHIRURGIEN', 'PRÉCIS'] },
        { val: profil.agressivite, titres: ['AGRESSIF', 'BRUTAL', 'FRÉNÉTIQUE'] },
        { val: profil.endurance, titres: ['MARATHONIEN', 'TENACE', 'SOLIDE'] },
        { val: profil.creativite, titres: ['CRÉATIF', 'ARTISTE', 'INVENTIF'] },
        { val: profil.equilibre, titres: ['ZEN', 'ÉQUILIBRÉ', 'MAÎTRE'] },
    ].sort((a, b) => b.val - a.val);

    const dominant = axes[0];
    const secondaire = axes[1];
    const t1 = dominant.titres[Math.floor(Math.random() * dominant.titres.length)];
    const t2 = secondaire.titres[Math.floor(Math.random() * secondaire.titres.length)];

    if (dominant.val - secondaire.val < 15) return `${t1} & ${t2}`;
    return `${t2} ${t1}`;
}

export function obtenirDonneesAffichage() {
    if (donneesPartie.timestampsVerrou.length > 0) {
        return donneesPartie;
    }
    return dernierProfil.donnees;
}

export function sauvegarderSnapshotProfil(lignesPartie, biomeId) {
    donneesPartie.lignesPartie = lignesPartie;
    donneesPartie.biomeId = biomeId;
    const profil = calculerProfilStyle(donneesPartie, lignesPartie);
    const titreStyle = genererTitreStyle(profil);

    dernierProfil = {
        donnees: clonerDonnees(donneesPartie),
        titreStyle,
        profil,
    };

    try {
        ecrireStockageJson(CLE_PROFIL, {
            donnees: clonerDonnees(donneesPartie),
            titreStyle,
            profil,
        });
    } catch (err) {
        logger.warn('Erreur sauvegarde profil:', err);
    }
}

export function chargerProfilDernier() {
    try {
        /** @type {Record<string, any> | null} */
        const parsed = lireStockageJson(CLE_PROFIL, null);
        if (!parsed || typeof parsed !== 'object') return;
        dernierProfil = {
            donnees: {
                ...creerDonneesVides(),
                ...parsed.donnees,
                atterrissagesColonne: parsed.donnees?.atterrissagesColonne ?? new Array(10).fill(0),
                timestampsVerrou: parsed.donnees?.timestampsVerrou ?? [],
                tempsReactions: parsed.donnees?.tempsReactions ?? [],
                lignesParNiveau: parsed.donnees?.lignesParNiveau ?? {},
            },
            titreStyle: parsed.titreStyle ?? '',
            profil: parsed.profil ?? null,
        };
    } catch (err) {
        logger.warn('Erreur chargement profil:', err);
    }
}
