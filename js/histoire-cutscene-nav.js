export async function afficherEcranHistoire(idEcran) {
    const { afficherEcranAsync } = await import('./navigation-ecrans.js');
    await afficherEcranAsync(idEcran);
}

export function cacherEcransHistoire() {
    return import('./navigation-ecrans.js').then(({ cacherEcrans }) => cacherEcrans());
}
