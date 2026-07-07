import { obtenirEtatHistoire, obtenirProgressionGlobale } from './histoire-mondes.js';
import { sansAccentsE } from '../logique/texte-jeu.js';
import { obtenirResumeConditionsTrame } from './conditions-secrets.js';

export function mettreAJourEnteteHistoire() {
    const prog = obtenirProgressionGlobale();
    const elMondes = document.getElementById('histoire-prog-mondes');
    const elJournaux = document.getElementById('histoire-prog-journaux');
    const elTrame = document.getElementById('histoire-prog-trame');
    const btnTrame = document.getElementById('btn-histoire-trame');
    if (elMondes) elMondes.textContent = `${prog.nbCompletes}/${prog.nbTotal} MONDES`;
    if (elJournaux) {
        elJournaux.textContent = `${prog.nbJournaux}/${prog.nbJournauxTotal} TRANSMISSIONS`;
    }

    const etatHist = obtenirEtatHistoire();
    const resumeTrame = obtenirResumeConditionsTrame(etatHist);
    const trameDebloquee = etatHist.mondesCompletes?.includes('monde_trame');
    const elListe = document.getElementById('histoire-trame-detail-liste');
    if (elTrame && btnTrame) {
        if (trameDebloquee) {
            btnTrame.classList.add('element-masque');
            elListe?.replaceChildren();
        } else {
            btnTrame.classList.remove('element-masque');
            btnTrame.classList.toggle(
                'histoire-prog-trame--en-cours',
                resumeTrame.validees < resumeTrame.total
            );
            elTrame.textContent = `TRAME ${resumeTrame.validees}/${resumeTrame.total}`;
            const detail = resumeTrame.details
                .map((d) => `${d.ok ? '✓' : '○'} ${d.libelle}`)
                .join(' · ');
            btnTrame.title = detail;
            if (elListe) {
                elListe.replaceChildren();
                for (const d of resumeTrame.details) {
                    const li = document.createElement('li');
                    li.classList.toggle('histoire-trame-condition-ok', d.ok);
                    li.textContent = sansAccentsE(`${d.ok ? '✓' : '○'} ${d.libelle}`);
                    elListe.appendChild(li);
                }
            }
        }
    }
}
