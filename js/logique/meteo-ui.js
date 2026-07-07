import { proposerInfobulleMeteo } from '../ui/infobulles-contexte.js';
import { meteo, ETATS_METEO, depsMeteo, effacerTimeoutsMeteo } from './meteo-etat.js';

function cacherBanniereMeteo() {
    document.getElementById('banniere-meteo')?.classList.remove('visible');
}

function afficherAlerteMeteo(evenement) {
    const banniere = document.getElementById('banniere-meteo');
    if (!banniere) return;
    effacerTimeoutsMeteo();
    banniere.style.setProperty('--meteo-couleur', evenement.couleur);
    const iconeEl = document.getElementById('meteo-icone');
    const texteEl = document.getElementById('meteo-texte');
    if (iconeEl) iconeEl.textContent = evenement.icone;
    if (texteEl) texteEl.textContent = evenement.alerte;
    const barre = document.getElementById('meteo-barre-alerte');
    if (barre) {
        barre.style.animation = 'none';
        void barre.offsetWidth;
        barre.style.animation = '';
    }
    banniere.classList.add('visible');
    mettreAJourIndicateurMeteo();
    const biomeId = depsMeteo.obtenirBiomeActif?.() ?? 'classique';
    proposerInfobulleMeteo(biomeId, evenement);
    meteo.timeoutAlerteTexte = setTimeout(() => {
        if (texteEl) texteEl.textContent = evenement.actif;
        meteo.timeoutBanniere = setTimeout(cacherBanniereMeteo, evenement.duree || 1500);
    }, 5000);
}

export function mettreAJourIndicateurMeteo() {
    const indic = document.getElementById('indicateur-meteo');
    if (!indic) return;

    const iconeEl = document.getElementById('meteo-actif-icone');
    const nomEl = document.getElementById('meteo-actif-nom');
    const barreEl = document.getElementById('meteo-barre-duree');

    if (meteo.etat === ETATS_METEO.ALERTE && meteo.evenementActuel) {
        indic.style.display = 'block';
        indic.classList.add('meteo-telegraphie');
        indic.classList.remove('meteo-proche');
        indic.style.setProperty('--meteo-actif-couleur', meteo.evenementActuel.couleur);
        if (iconeEl) iconeEl.textContent = meteo.evenementActuel.icone + ' ';
        if (nomEl) nomEl.textContent = meteo.evenementActuel.alerte;
        if (barreEl) {
            const pct = ((meteo.timerAlerte / 5000) * 100).toFixed(1);
            barreEl.style.width = pct + '%';
        }
        return;
    }

    if (
        meteo.etat === ETATS_METEO.REPOS &&
        meteo.timerProchain > 0 &&
        meteo.timerProchain <= 10000
    ) {
        indic.style.display = 'block';
        indic.classList.add('meteo-proche');
        indic.classList.remove('meteo-telegraphie');
        indic.style.setProperty('--meteo-actif-couleur', 'rgba(255, 230, 0, 0.6)');
        if (iconeEl) iconeEl.textContent = '⚠ ';
        if (nomEl) nomEl.textContent = 'Météo imminente';
        if (barreEl) {
            const pct = ((1 - meteo.timerProchain / 10000) * 100).toFixed(1);
            barreEl.style.width = pct + '%';
        }
        return;
    }

    if (
        meteo.etat === ETATS_METEO.ACTIF &&
        meteo.evenementActuel &&
        meteo.evenementActuel.duree > 0
    ) {
        indic.classList.remove('meteo-telegraphie', 'meteo-proche');
        indic.style.display = 'block';
        indic.style.setProperty('--meteo-actif-couleur', meteo.evenementActuel.couleur);
        if (iconeEl) iconeEl.textContent = meteo.evenementActuel.icone + ' ';
        if (nomEl) nomEl.textContent = meteo.evenementActuel.actif;
        if (barreEl) {
            const pct = ((meteo.timerActif / meteo.evenementActuel.duree) * 100).toFixed(1);
            barreEl.style.width = pct + '%';
        }
    } else {
        indic.style.display = 'none';
        indic.classList.remove('meteo-telegraphie', 'meteo-proche');
    }
}

export { afficherAlerteMeteo, cacherBanniereMeteo };
