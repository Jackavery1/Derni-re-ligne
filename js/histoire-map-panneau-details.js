import { JOURNAUX_VERA } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirEtatMonde, SEUILS_COMPLETION } from './histoire-mondes.js';
import { modeDevActif } from './mode-dev-etat.js';
import { obtenirEtoilesPersistees } from './gestionnaire-difficulte.js';
import { definirTexteUi, sansAccentsE } from './texte-jeu.js';
import { obtenirGuideMondeSecret } from './conditions-secrets.js';

function _mettreAJourGuideEtAvertissement(monde, etatMonde, estBoss) {
    const elGuide = document.getElementById('histoire-detail-guide');
    const guideSecret = obtenirGuideMondeSecret(monde.id);
    if (elGuide) {
        if (guideSecret && (etatMonde !== 'complete' || monde.estCache)) {
            elGuide.textContent = sansAccentsE(guideSecret);
            elGuide.classList.remove('element-masque');
        } else {
            elGuide.textContent = '';
            elGuide.classList.add('element-masque');
        }
    }

    const elAvert = document.getElementById('histoire-detail-avert');
    const btnBriefing = document.getElementById('btn-histoire-briefing-distorsion');
    const mondesDifficiles = [
        'monde_miroir',
        'monde_trame',
        'monde_vide',
        'monde_eclipse',
        'monde_finale',
    ];
    if (elAvert) {
        const afficherAvert =
            etatMonde === 'disponible' && mondesDifficiles.includes(monde.id) && !estBoss;
        if (afficherAvert) {
            elAvert.textContent = sansAccentsE(
                'Monde exigeant — prenez le temps de lire les objectifs et les mécaniques du biome.'
            );
            elAvert.classList.remove('element-masque');
        } else {
            elAvert.textContent = '';
            elAvert.classList.add('element-masque');
        }
    }

    if (btnBriefing) {
        const afficherBriefing =
            (monde.id === 'monde_boss_4' || monde.id === 'monde_finale') &&
            etatMonde === 'disponible';
        btnBriefing.classList.toggle('element-masque', !afficherBriefing);
    }
}

export function mettreAJourPanneauDetails(etatCarte, monde, etatHist, lancerMondeDepuisCarte) {
    void etatCarte;
    const panneau = document.getElementById('histoire-monde-details');
    if (!panneau || !monde) return;

    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estBoss = monde.estBoss;

    const elNom = /** @type {HTMLElement | null} */ (panneau.querySelector('.histoire-detail-nom'));
    if (elNom) {
        definirTexteUi(elNom, monde.nomAffiche);
        elNom.style.setProperty('--detail-couleur', biome.lueurCoul);
    }

    const elType = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-type')
    );
    if (elType) {
        definirTexteUi(elType, estBoss ? '⚔ COMBAT DE BOSS' : `${biome.icone} ${biome.nom}`);
        elType.style.setProperty('--detail-couleur', estBoss ? 'var(--rose)' : biome.lueurCoul);
    }

    const elStatut = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-statut')
    );
    if (elStatut) {
        if (etatMonde === 'complete') {
            elStatut.textContent = '✓ COMPLETE';
            elStatut.classList.add('histoire-detail-statut-complete');
            elStatut.classList.remove('histoire-detail-statut-dim');
        } else if (etatMonde === 'disponible') {
            if (estBoss) {
                elStatut.textContent = 'OBJECTIF : VAINCRE LE BOSS';
            } else {
                const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
                elStatut.textContent = `OBJECTIF : ${seuil} LIGNES`;
            }
            elStatut.classList.remove('histoire-detail-statut-complete');
            elStatut.classList.add('histoire-detail-statut-dim');
        } else {
            elStatut.textContent = '🔒 VERROUILLE';
            elStatut.classList.remove('histoire-detail-statut-complete');
            elStatut.classList.add('histoire-detail-statut-dim');
        }
    }

    const elEtoiles = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-etoiles')
    );
    if (elEtoiles) {
        const etoiles = obtenirEtoilesPersistees(etatHist, monde.id);
        elEtoiles.textContent = '';
        etoiles.forEach((obtenue, i) => {
            const span = document.createElement('span');
            span.className = 'histoire-carte-etoile';
            span.textContent = '★';
            span.classList.toggle('histoire-carte-etoile-active', obtenue);
            span.setAttribute('aria-label', `Etoile ${i + 1}${obtenue ? ' obtenue' : ''}`);
            elEtoiles.appendChild(span);
        });
    }

    const elJournal = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-journal')
    );
    if (elJournal) {
        const journalDispo = JOURNAUX_VERA.find((j) => {
            if (j.biomeId !== monde.biomeId) return false;
            if (etatHist.journauxTrouves.includes(j.id)) return false;
            if (j.condition === 'debloquer_apres_boss_sentinelle') {
                return monde.bossId === 'sentinelle';
            }
            if (j.condition === 'trouver_laboratoire_vera') return monde.id === 'monde_cyber';
            return true;
        });
        elJournal.textContent = journalDispo ? '📔 TRANSMISSION CACHEE' : '';
    }

    const btnJouer = /** @type {HTMLButtonElement | null} */ (
        panneau.querySelector('.bouton-jouer-monde')
    );
    if (btnJouer) {
        const peutJouer = modeDevActif() || etatMonde !== 'verrouille';
        btnJouer.classList.toggle('element-masque', !peutJouer);
        btnJouer.textContent = etatMonde === 'complete' ? '↺ REJOUER' : '▶ JOUER';
        btnJouer.onclick = () => lancerMondeDepuisCarte(monde);
    }

    _mettreAJourGuideEtAvertissement(monde, etatMonde, estBoss);

    panneau.classList.remove('histoire-panneau-masque');
}
