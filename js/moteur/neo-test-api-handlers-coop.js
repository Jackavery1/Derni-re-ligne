export function creerHandlersCoop() {
    return {
        terminerPartieCoop: async () => {
            const { terminerCooperatif } = await import('../logique/coop-jeu.js');
            terminerCooperatif('j1');
        },
        basculerPauseCoop: async () => {
            const { assurerInputCoop } = await import('../logique/modes-input-lazy.js');
            await assurerInputCoop();
            const { basculerPauseCoop } = await import('../logique/coop-jeu.js');
            basculerPauseCoop();
        },
        bufferiserInputCoopTest: async (joueur, action) => {
            const { coopReinitialiserGameFeelJoueur, coopBufferiserInput } =
                await import('../logique/coop-game-feel.js');
            const { coop } = await import('../logique/coop-etat.js');
            if (!Array.isArray(coop[joueur]?.inputBuffer)) {
                coopReinitialiserGameFeelJoueur(joueur);
            }
            coopBufferiserInput(joueur, action);
        },
        obtenirBufferCoopTest: async (joueur) => {
            const { coop } = await import('../logique/coop-etat.js');
            const { coopReinitialiserGameFeelJoueur } =
                await import('../logique/coop-game-feel.js');
            if (!Array.isArray(coop[joueur]?.inputBuffer)) {
                coopReinitialiserGameFeelJoueur(joueur);
            }
            return [...(coop[joueur]?.inputBuffer ?? [])];
        },
        remplirBufferCoopTest: async (joueur, actions) => {
            const { coopReinitialiserGameFeelJoueur, coopBufferiserInput } =
                await import('../logique/coop-game-feel.js');
            coopReinitialiserGameFeelJoueur(joueur);
            for (const action of actions) {
                coopBufferiserInput(joueur, action);
            }
            const { coop } = await import('../logique/coop-etat.js');
            return [...(coop[joueur]?.inputBuffer ?? [])];
        },
    };
}
