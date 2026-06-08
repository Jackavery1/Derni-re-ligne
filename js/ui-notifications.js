/**
 * Affiche une notification temporaire dans #notif-niveau (solo, coop, synchro).
 * @param {string} texte
 * @param {{ classesAjouter?: string[], classesRetirer?: string[] }} [options]
 */
export function afficherNotificationNiveau(texte, options = {}) {
    if (typeof document === 'undefined') return;
    const notif = document.getElementById('notif-niveau');
    if (!notif) return;

    notif.textContent = texte;
    if (options.classesRetirer?.length) {
        for (const cls of options.classesRetirer) notif.classList.remove(cls);
    }
    if (options.classesAjouter?.length) {
        for (const cls of options.classesAjouter) notif.classList.add(cls);
    }
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}
