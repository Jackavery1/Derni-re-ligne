export async function afficherEcranHistoire(idEcran) {
    const { afficherEcranAsync } = await import('./navigation-ecrans.js');
    await afficherEcranAsync(idEcran);
}

export function cacherEcransHistoire() {
    void import('./navigation-ecrans.js').then(({ cacherEcrans }) => cacherEcrans());
}
