import { store } from './store-core.js';
import { chargerEtatHistoire } from './progression.js';

function etatH() {
    if (!store.histoire.etat) {
        store.histoire.etat = chargerEtatHistoire();
    }
    return store.histoire.etat;
}

function _valeurProuesse(champ, sessionValue = 0) {
    const e = etatH();
    const persist = e.prouessesHistoire?.[champ] ?? 0;
    if (champ === 'meilleurTimerBossMs') {
        return Math.min(persist || Infinity, sessionValue || Infinity);
    }
    return Math.max(persist, sessionValue);
}

export const ACHIEVEMENTS_HISTOIRE_CONDITIONS = {
    premier_monde: () => etatH().mondesCompletes.includes('monde_prologue'),
    premier_chapitre: () => etatH().bossVaincus?.includes('brasier'),
    tous_chapitres: () => {
        const e = etatH();
        const bossPrincipaux = ['brasier', 'sentinelle', 'archiviste', 'avantgarde'];
        return bossPrincipaux.every((id) => e.bossVaincus?.includes(id));
    },
    premier_boss: () => (etatH().bossVaincus?.length ?? 0) >= 1,
    tous_boss: () => {
        const e = etatH();
        return ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'].every((id) =>
            e.bossVaincus?.includes(id)
        );
    },
    sans_continue: () => {
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
    boss_rapide: () =>
        _valeurProuesse('meilleurTimerBossMs', store.timerBossBattus ?? Infinity) <= 120000,
    premier_journal: () => (etatH().journauxTrouves?.length ?? 0) >= 1,
    cinq_journaux: () => (etatH().journauxTrouves?.length ?? 0) >= 5,
    tous_journaux: () => etatH().conditionsTrame?.tousJournauxTrouves === true,
    labo_vera: () => etatH().laboDecouvert === true,
    fin_normale_obtenue: () => (etatH().toutesFinObtenues ?? []).includes('fin_normale'),
    fin_vraie_obtenue: () => (etatH().toutesFinObtenues ?? []).includes('fin_vraie'),
    fin_secrete_obtenue: () => (etatH().toutesFinObtenues ?? []).includes('fin_secrete'),
    toutes_fins: () => {
        const finsObtenues = etatH().toutesFinObtenues ?? [];
        return ['fin_normale', 'fin_vraie', 'fin_secrete'].every((f) => finsObtenues.includes(f));
    },
    miroir_decouvert: () => {
        const e = etatH();
        return (
            e.mondesCachesDebloques?.includes('monde_miroir') ||
            (e.conditionsMiroir?.bossArchivisteVaincu &&
                (e.conditionsMiroir?.tetrisTriplesCyber ?? 0) >= 3)
        );
    },
    miroir_complete: () => etatH().mondesCompletes?.includes('monde_miroir'),
    trame_decouverte: () => {
        const e = etatH();
        return (
            e.mondesCachesDebloques?.includes('monde_trame') ||
            (e.conditionsTrame?.miroirComplete &&
                e.conditionsTrame?.tousJournauxTrouves &&
                e.conditionsTrame?.tousBossSansContinue &&
                e.conditionsTrame?.actionDistorsionFaite)
        );
    },
    trame_complete: () => etatH().mondesCompletes?.includes('monde_trame'),
    paradoxe_atteint: () => etatH().mondesCompletes?.includes('monde_paradoxe'),
    rouille_maitrise: () =>
        _valeurProuesse('blocksRouillesMax', store.blocksRouillesEffaces ?? 0) >= 20,
    eclipse_equilibre: () =>
        _valeurProuesse('lignesEclipseBasseMax', store.lignesEclipseBasse ?? 0) >= 10,
    vide_survivant: () => _valeurProuesse('lignesVideMax', store.lignesVide ?? 0) >= 15,
    miroir_sans_erreur: () =>
        _valeurProuesse('precisionMiroirMax', store.precisionMiroir ?? 0) >= 0.95,
    patience_distorsion: () => etatH().conditionsTrame?.actionDistorsionFaite === true,
};
