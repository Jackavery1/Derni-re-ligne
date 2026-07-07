export async function afficherEcranHistoire(idEcran) {
    const { afficherEcranAsync } = await import('../ui/navigation-ecrans.js');
    await afficherEcranAsync(idEcran);
}

export function cacherEcransHistoire() {
    return import('../ui/navigation-ecrans.js').then(({ cacherEcrans }) => cacherEcrans());
}
