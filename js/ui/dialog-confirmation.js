/**
 * @param {{
 *   dialogId: string,
 *   btnOuiId: string,
 *   btnNonId: string,
 *   fallbackMessage: string,
 * }} config
 * @returns {Promise<boolean>}
 */
export function demanderConfirmationDialog(config) {
    return new Promise((resolve) => {
        const dialog = document.getElementById(config.dialogId);
        const btnOui = document.getElementById(config.btnOuiId);
        const btnNon = document.getElementById(config.btnNonId);
        if (!dialog || !btnOui || !btnNon) {
            resolve(window.confirm(config.fallbackMessage));
            return;
        }

        const fermer = (valeur) => {
            dialog.classList.add('element-masque');
            dialog.setAttribute('aria-hidden', 'true');
            btnOui.removeEventListener('click', surOui);
            btnNon.removeEventListener('click', surNon);
            document.removeEventListener('keydown', surEchap);
            resolve(valeur);
        };

        const surOui = () => fermer(true);
        const surNon = () => fermer(false);
        const surEchap = (e) => {
            if (e.key === 'Escape') fermer(false);
        };

        btnOui.addEventListener('click', surOui);
        btnNon.addEventListener('click', surNon);
        document.addEventListener('keydown', surEchap);

        dialog.classList.remove('element-masque');
        dialog.setAttribute('aria-hidden', 'false');
        btnNon.focus();
    });
}
