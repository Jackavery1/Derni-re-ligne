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
    };
}
