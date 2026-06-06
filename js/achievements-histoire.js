import { store } from './store-core.js';
import { ETAT_HISTOIRE_VIDE } from './histoire-donnees.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';

function etatH() {
    if (!store.histoire.etat) {
        store.histoire.etat = chargerEtatHistoire();
    }
    return store.histoire.etat;
}

/** @param {keyof typeof ETAT_HISTOIRE_VIDE.prouessesHistoire} champ @param {number} valeur */
function _majProuesse(champ, valeur) {
    const e = etatH();
    if (!e.prouessesHistoire) {
        e.prouessesHistoire = { ...ETAT_HISTOIRE_VIDE.prouessesHistoire };
    }
    if (champ === 'meilleurTimerBossMs') {
        e.prouessesHistoire.meilleurTimerBossMs = Math.min(
            e.prouessesHistoire.meilleurTimerBossMs ?? Infinity,
            valeur
        );
    } else {
        e.prouessesHistoire[champ] = Math.max(e.prouessesHistoire[champ] ?? 0, valeur);
    }
    sauvegarderEtatHistoire(e);
    store.histoire.etat = e;
}

function _valeurProuesse(champ, sessionValue = 0) {
    const e = etatH();
    const persist = e.prouessesHistoire?.[champ] ?? 0;
    if (champ === 'meilleurTimerBossMs') {
        return Math.min(persist || Infinity, sessionValue || Infinity);
    }
    return Math.max(persist, sessionValue);
}

export const ACHIEVEMENTS_HISTOIRE = {
    premier_monde: {
        id: 'premier_monde',
        nom: "L'ÉVEIL",
        description: 'Compléter le Prologue du Mode Histoire',
        icone: '🤖',
        categorie: 'histoire',
        decoration: 'trainee_simple',
        condition: () => etatH().mondesCompletes.includes('monde_prologue'),
    },
    premier_chapitre: {
        id: 'premier_chapitre',
        nom: 'SURVIVANT DU FEU',
        description: 'Compléter le Chapitre I',
        icone: '🔥',
        categorie: 'histoire',
        decoration: 'flammes_bords',
        condition: () => etatH().bossVaincus?.includes('brasier'),
    },
    tous_chapitres: {
        id: 'tous_chapitres',
        nom: 'TRAVERSÉE',
        description: 'Compléter les quatre chapitres principaux',
        icone: '🗺',
        categorie: 'histoire',
        decoration: 'particules_biome',
        condition: () => {
            const e = etatH();
            const bossPrincipaux = ['brasier', 'sentinelle', 'archiviste', 'avantgarde'];
            return bossPrincipaux.every((id) => e.bossVaincus?.includes(id));
        },
    },
    premier_boss: {
        id: 'premier_boss',
        nom: 'PREMIER ADVERSAIRE',
        description: 'Vaincre un boss pour la première fois',
        icone: '⚔',
        categorie: 'histoire_boss',
        decoration: 'eclairs_bords',
        condition: () => (etatH().bossVaincus?.length ?? 0) >= 1,
    },
    tous_boss: {
        id: 'tous_boss',
        nom: 'DOMINATION',
        description: 'Vaincre les cinq boss du Mode Histoire',
        icone: '👑',
        categorie: 'histoire_boss',
        decoration: 'couronne_lumineuse',
        condition: () => {
            const e = etatH();
            return ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'].every((id) =>
                e.bossVaincus?.includes(id)
            );
        },
    },
    sans_continue: {
        id: 'sans_continue',
        nom: 'SANS FILET',
        description: 'Vaincre tous les boss sans utiliser de Continue',
        icone: '💎',
        categorie: 'histoire_boss',
        decoration: 'gemmes_orbitales',
        condition: () => {
            const e = etatH();
            const tousVaincus = [
                'brasier',
                'sentinelle',
                'archiviste',
                'avantgarde',
                'distorsion',
            ].every((id) => e.bossVaincus?.includes(id));
            return tousVaincus && (e.nbContinuesUtilises ?? 0) === 0;
        },
    },
    boss_rapide: {
        id: 'boss_rapide',
        nom: 'EFFICACITÉ MAXIMALE',
        description: 'Vaincre un boss en moins de 2 minutes',
        icone: '⚡',
        categorie: 'histoire_boss',
        decoration: 'trainee_combo',
        condition: () =>
            _valeurProuesse('meilleurTimerBossMs', store.timerBossBattus ?? Infinity) <= 120000,
    },
    premier_journal: {
        id: 'premier_journal',
        nom: 'SIGNAL REÇU',
        description: 'Trouver le premier journal de VERA',
        icone: '📔',
        categorie: 'histoire_vera',
        decoration: 'halo_relique',
        condition: () => (etatH().journauxTrouves?.length ?? 0) >= 1,
    },
    cinq_journaux: {
        id: 'cinq_journaux',
        nom: 'ARCHIVISTE',
        description: 'Trouver cinq journaux de VERA',
        icone: '📚',
        categorie: 'histoire_vera',
        decoration: 'notes_flottantes',
        condition: () => (etatH().journauxTrouves?.length ?? 0) >= 5,
    },
    tous_journaux: {
        id: 'tous_journaux',
        nom: 'TRANSMISSION COMPLÈTE',
        description: 'Trouver les neuf journaux de VERA',
        icone: '📡',
        categorie: 'histoire_vera',
        decoration: 'aura_cosmos',
        condition: () => etatH().conditionsTrame?.tousJournauxTrouves === true,
    },
    labo_vera: {
        id: 'labo_vera',
        nom: 'ADRESSE TROUVÉE',
        description: 'Découvrir le laboratoire de VERA dans CYBER',
        icone: '🔬',
        categorie: 'histoire_vera',
        decoration: 'halo_oracle',
        condition: () => etatH().laboDecouvert === true,
    },
    fin_normale_obtenue: {
        id: 'fin_normale_obtenue',
        nom: 'LE CYCLE',
        description: 'Obtenir la Fin Normale du Mode Histoire',
        icone: '◻',
        categorie: 'histoire_fins',
        decoration: 'bordure_pulse',
        condition: () => (etatH().toutesFinObtenues ?? []).includes('fin_normale'),
    },
    fin_vraie_obtenue: {
        id: 'fin_vraie_obtenue',
        nom: "L'HARMONIE",
        description: 'Obtenir la Fin Vraie du Mode Histoire',
        icone: '∞',
        categorie: 'histoire_fins',
        decoration: 'trainee_arc_en_ciel',
        condition: () => (etatH().toutesFinObtenues ?? []).includes('fin_vraie'),
    },
    fin_secrete_obtenue: {
        id: 'fin_secrete_obtenue',
        nom: 'LA LIGNE PARFAITE',
        description: 'Obtenir la Fin Secrète du Mode Histoire',
        icone: '✦',
        categorie: 'histoire_fins',
        decoration: 'aura_dorée',
        condition: () => (etatH().toutesFinObtenues ?? []).includes('fin_secrete'),
    },
    toutes_fins: {
        id: 'toutes_fins',
        nom: 'TRANSCENDANCE',
        description: 'Obtenir les trois fins du Mode Histoire',
        icone: '🌟',
        categorie: 'histoire_fins',
        decoration: 'trainee_arc_en_ciel',
        condition: () => {
            const finsObtenues = etatH().toutesFinObtenues ?? [];
            return ['fin_normale', 'fin_vraie', 'fin_secrete'].every((f) =>
                finsObtenues.includes(f)
            );
        },
    },
    miroir_decouvert: {
        id: 'miroir_decouvert',
        nom: 'REFLET',
        description: 'Découvrir LE MIROIR',
        icone: '🪞',
        categorie: 'histoire_secrets',
        decoration: 'bordure_bicolore',
        condition: () => {
            const e = etatH();
            return (
                e.mondesCachesDebloques?.includes('monde_miroir') ||
                (e.conditionsMiroir?.bossArchivisteVaincu &&
                    (e.conditionsMiroir?.tetrisTriplesCyber ?? 0) >= 3)
            );
        },
    },
    miroir_complete: {
        id: 'miroir_complete',
        nom: 'AU-DELÀ DU REFLET',
        description: 'Compléter LE MIROIR',
        icone: '✧',
        categorie: 'histoire_secrets',
        decoration: 'vortex_bords',
        condition: () => etatH().mondesCompletes?.includes('monde_miroir'),
    },
    trame_decouverte: {
        id: 'trame_decouverte',
        nom: 'FIL INVISIBLE',
        description: 'Découvrir LA TRAME PRIMORDIALE',
        icone: '✦',
        categorie: 'histoire_secrets',
        decoration: 'aura_cosmos',
        condition: () => {
            const e = etatH();
            return (
                e.mondesCachesDebloques?.includes('monde_trame') ||
                (e.conditionsTrame?.miroirComplete &&
                    e.conditionsTrame?.tousJournauxTrouves &&
                    e.conditionsTrame?.tousBossSansContinue &&
                    e.conditionsTrame?.actionDistorsionFaite)
            );
        },
    },
    trame_complete: {
        id: 'trame_complete',
        nom: 'TISSEUR',
        description: 'Compléter LA TRAME PRIMORDIALE',
        icone: '🌌',
        categorie: 'histoire_secrets',
        decoration: 'etoiles_trainee',
        condition: () => etatH().mondesCompletes?.includes('monde_trame'),
    },
    rouille_maitrise: {
        id: 'rouille_maitrise',
        nom: 'FORGERON',
        description: 'Effacer 20 blocs rouillés dans LA ROUILLE',
        icone: '⚙',
        categorie: 'histoire_prouesses',
        decoration: 'halo_relique',
        condition: () =>
            _valeurProuesse('blocksRouillesMax', store.blocksRouillesEffaces ?? 0) >= 20,
    },
    eclipse_equilibre: {
        id: 'eclipse_equilibre',
        nom: 'ÉQUILIBRISTE',
        description: "Effacer 10 lignes dans la zone basse de L'ÉCLIPSE sans game over",
        icone: '🌗',
        categorie: 'histoire_prouesses',
        decoration: 'flash_cyan',
        condition: () =>
            _valeurProuesse('lignesEclipseBasseMax', store.lignesEclipseBasse ?? 0) >= 10,
    },
    vide_survivant: {
        id: 'vide_survivant',
        nom: "À L'AVEUGLE",
        description: 'Effacer 15 lignes dans LE VIDE',
        icone: '⬛',
        categorie: 'histoire_prouesses',
        decoration: 'vortex_bords',
        condition: () => _valeurProuesse('lignesVideMax', store.lignesVide ?? 0) >= 15,
    },
    miroir_sans_erreur: {
        id: 'miroir_sans_erreur',
        nom: 'INVERSÉ PARFAIT',
        description: 'Compléter LE MIROIR avec plus de 95% de précision',
        icone: '💎',
        categorie: 'histoire_prouesses',
        decoration: 'gemmes_orbitales',
        condition: () => _valeurProuesse('precisionMiroirMax', store.precisionMiroir ?? 0) >= 0.95,
    },
    patience_distorsion: {
        id: 'patience_distorsion',
        nom: "L'ART DE L'INACHÈVEMENT",
        description: 'Tenir 30 secondes sans effacer face à La Distorsion',
        icone: '⏳',
        categorie: 'histoire_prouesses',
        decoration: 'halo_oracle',
        condition: () => etatH().conditionsTrame?.actionDistorsionFaite === true,
    },
};

export function reinitialiserStatsAchievementsHistoire() {
    store.histoire.boss.timerDebut = 0;
    store.timerBossBattus = Infinity;
    store.blocksRouillesEffaces = 0;
    store.lignesEclipseBasse = 0;
    store.lignesVide = 0;
    store.precisionMiroir = 0;
}

export function enregistrerVictoireBossTimer(timestampDebut) {
    const duree = performance.now() - timestampDebut;
    store.timerBossBattus = Math.min(store.timerBossBattus ?? Infinity, duree);
    _majProuesse('meilleurTimerBossMs', duree);
}

export function ajouterBlocksRouillesEffaces(nb) {
    if (!store.histoire.actif) return;
    store.blocksRouillesEffaces = (store.blocksRouillesEffaces ?? 0) + nb;
    _majProuesse('blocksRouillesMax', store.blocksRouillesEffaces);
}

export function ajouterLignesEclipseBasse(nb) {
    if (!store.histoire.actif) return;
    store.lignesEclipseBasse = (store.lignesEclipseBasse ?? 0) + nb;
    _majProuesse('lignesEclipseBasseMax', store.lignesEclipseBasse);
}

export function ajouterLignesVide(nb) {
    if (!store.histoire.actif) return;
    store.lignesVide = (store.lignesVide ?? 0) + nb;
    _majProuesse('lignesVideMax', store.lignesVide);
}

export function enregistrerPrecisionMiroir(precision) {
    if (!store.histoire.actif) return;
    store.precisionMiroir = precision;
    _majProuesse('precisionMiroirMax', precision);
}
