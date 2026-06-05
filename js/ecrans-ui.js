import { BIOMES } from './config.js';
import { demarrerConstellation, arreterConstellation } from './constellation.js';
import {
    chargerNiveauGlobal,
    chargerBiomeActif,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
} from './progression.js';
import { AudioMoteur } from './audio.js';
import {
    ECRANS,
    etat,
    obtenirBiomeActif,
    obtenirDerniereSecondeTemps,
    definirBiomeActif,
    definirNiveauGlobal,
    definirEcranActuel,
    definirDerniereSecondeTemps,
} from './contexte-jeu.js';
import { demarrerAnimationMenu, arreterAnimationMenu } from './menu-fond.js';
import { majStatsReactionRobo, genererGalerieAchievements } from './achievements.js';
import { genererCodexComplet } from './codex.js';

export function annoncer(texte) {
    const el = document.getElementById('annonce-jeu');
    if (el) el.textContent = texte;
}

export function chargerProgression() {
    definirNiveauGlobal(chargerNiveauGlobal());
    definirBiomeActif(chargerBiomeActif());
}

export function sauvegarderRecord(score) {
    return sauvegarderRecordBiome(obtenirBiomeActif(), score);
}

export function mettreAJourAffichageRecord() {
    const el = document.getElementById('menu-record-val');
    if (el) el.textContent = obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
}

export function changerHumeur(humeur) {
    majStatsReactionRobo(humeur);
    etat.humeur = humeur;
    document.querySelectorAll('.expression').forEach((el) => el.classList.remove('active'));
    const expr = document.getElementById(`expr-${humeur}`);
    if (expr) expr.classList.add('active');
    const couleurLed = {
        neutre: '#ff006e',
        content: '#00ff88',
        excite: '#ffe600',
        triste: '#4488aa',
    };
    const led = document.getElementById('led-antenne');
    if (led) led.setAttribute('fill', couleurLed[humeur] ?? '#ff006e');
    if (humeur !== 'triste') setTimeout(() => changerHumeur('neutre'), 2500);
}

export function appliquerThemeBiome(biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    const ui = biome.ui ?? BIOMES.classique.ui;
    const root = document.documentElement.style;
    root.setProperty('--theme-primaire', ui.couleurPrimaire);
    root.setProperty('--theme-score', ui.couleurScore);
    root.setProperty('--theme-accent', ui.couleurAccent);
    root.setProperty('--theme-fond', ui.fondPanneau);
    root.setProperty('--theme-bordure', ui.bordurePanneau);
    root.setProperty('--theme-canvas', ui.bordureCanvas);

    const canvas = document.getElementById('canvas-plateau');
    if (canvas) {
        canvas.style.boxShadow = `0 0 15px ${ui.bordureCanvas}, 0 0 40px ${ui.bordureCanvas}44, inset 0 0 20px ${ui.bordureCanvas}0a`;
        canvas.style.borderColor = ui.bordureCanvas;
    }

    const sectionMascotte = document.getElementById('section-mascotte');
    if (sectionMascotte) {
        sectionMascotte.style.setProperty('--mascotte-lueur', ui.couleurPrimaire);
    }
}

export function appliquerTextesBiome(biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    const textes = biome.textes ?? BIOMES.classique.textes;

    for (const el of document.querySelectorAll('[data-label]')) {
        const cle = el.dataset.label;
        const valeur = textes[cle];
        if (!valeur) continue;
        if (el.classList.contains('pause-titre')) {
            el.textContent = `⏸ ${valeur}`;
        } else if (el.classList.contains('menu-record-label')) {
            el.textContent = `★ ${valeur}`;
        } else {
            el.textContent = valeur;
        }
    }
}

export function appliquerThemeMascotte() {
    const biome = BIOMES[obtenirBiomeActif()] ?? BIOMES.classique;
    const lueur = biome.lueurCoul;
    const section = document.getElementById('section-mascotte');
    const mascotte = document.getElementById('mascotte');
    if (section) section.style.setProperty('--mascotte-lueur', lueur);
    if (mascotte) {
        mascotte.style.filter = `drop-shadow(0 0 6px ${lueur})`;
        mascotte.querySelectorAll('[stroke="#00f5ff"]').forEach((el) => {
            el.setAttribute('stroke', lueur);
        });
        mascotte.querySelectorAll('[fill="#00f5ff"]').forEach((el) => {
            if (el.closest('#expr-neutre')) el.setAttribute('fill', lueur);
        });
    }
}

export function mettreAJourVisibilitePartie(idEcran) {
    const ecransHorsPartie = [
        ECRANS.TITRE,
        ECRANS.SELECTION,
        ECRANS.OPTIONS,
        ECRANS.ACHIEVEMENTS,
        ECRANS.PROFIL,
        ECRANS.CODEX,
    ];
    if (ecransHorsPartie.includes(idEcran)) {
        document.body.classList.remove('partie-active');
    }
}

export function afficherEcran(idEcran) {
    definirEcranActuel(idEcran);
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    const ecran = document.getElementById(idEcran);
    ecran?.classList.add('actif');
    ecran?.querySelector('button, [href], input')?.focus({ preventScroll: true });

    mettreAJourVisibilitePartie(idEcran);

    if (idEcran === ECRANS.TITRE) {
        AudioMoteur.arreterMusique();
        mettreAJourAffichageRecord();
        demarrerAnimationMenu();
    } else {
        arreterAnimationMenu();
    }

    if (idEcran === ECRANS.SELECTION) {
        demarrerConstellation();
    } else {
        arreterConstellation();
    }

    if (idEcran === ECRANS.ACHIEVEMENTS) {
        genererGalerieAchievements();
    }

    if (idEcran === ECRANS.PROFIL) {
        import('./profil-jeu.js').then(({ chargerProfilDernier, afficherProfil }) => {
            chargerProfilDernier();
            afficherProfil();
        });
    }

    if (idEcran === ECRANS.CODEX) {
        genererCodexComplet();
    }

    if (idEcran === ECRANS.PAUSE) {
        const elS = document.getElementById('pause-score');
        const elL = document.getElementById('pause-lignes');
        const elN = document.getElementById('pause-niveau');
        if (elS) elS.textContent = etat.score.toLocaleString('fr-FR');
        if (elL) elL.textContent = etat.lignes;
        if (elN) elN.textContent = etat.niveau;
    }
}

export function cacherEcrans() {
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
}

export function formaterTemps(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function obtenirTempsEcoule() {
    if (!etat.tempsDebut) return 0;
    let total = Date.now() - etat.tempsDebut - etat.tempsPauseAccumule;
    if (etat.estEnPause && etat.tempsPauseDebut) {
        total -= Date.now() - etat.tempsPauseDebut;
    }
    return Math.max(0, total);
}

export function mettreAJourAffichageTemps() {
    const sec = Math.floor(obtenirTempsEcoule() / 1000);
    if (sec === obtenirDerniereSecondeTemps()) return;
    definirDerniereSecondeTemps(sec);
    const el = document.getElementById('affichage-temps');
    if (el) el.textContent = formaterTemps(obtenirTempsEcoule());
}

export function rafraichirStats() {
    const ids = {
        'affichage-score': etat.score.toLocaleString('fr-FR'),
        'affichage-lignes': etat.lignes,
        'affichage-niveau': etat.niveau,
    };
    for (const [id, valeur] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.textContent = valeur;
        el.classList.remove('anime');
        void el.offsetWidth;
        el.classList.add('anime');
        setTimeout(() => el.classList.remove('anime'), 150);
    }

    const modNiveau = etat.lignes % 10;
    const lignesRestantes = modNiveau === 0 ? 10 : 10 - modNiveau;
    const elRestant = document.getElementById('affichage-restant');
    if (elRestant) elRestant.textContent = `${lignesRestantes} ▸ NIV.${etat.niveau + 1}`;

    const elBarre = document.getElementById('barre-progression-fill');
    if (elBarre) elBarre.style.width = `${modNiveau * 10}%`;
}

export function afficherNotifNiveau() {
    const notif = document.getElementById('notif-niveau');
    notif.textContent = `NIVEAU ${etat.niveau} !`;
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
    changerHumeur('excite');
}
