import { eclaircir, assombrir } from './rendu-blocs-utils.js';

export const FONDS_BIOME = {
    classique: ['#030412', '#010208'],
    lave: ['#0f0300', '#060100'],
    ocean: ['#000812', '#000306'],
    foret: ['#020a02', '#010401'],
    glace: ['#030810', '#010406'],
    desert: ['#0c0800', '#060300'],
    cyber: ['#0a000f', '#040006'],
    fuochi: ['#06040a', '#020108'],
    cosmos: ['#040010', '#010006'],
};

export const NOMS_MONDES_REQUIS = {
    lave: 'INFERNO (Ch. I)',
    ocean: 'ABYSSES (Ch. II)',
    foret: 'LA CANOPÉE (Ch. II)',
    glace: 'ARCTIQUE (Ch. II)',
    desert: 'LE DÉSERT (Ch. III)',
    cyber: 'CYBER (Ch. III)',
    fuochi: "FEUX D'ARTIFICE (Ch. IV)",
    cosmos: 'COSMOS (Ch. IV)',
};

export function dessinerFondBiome(ctx, w, h, biomeId) {
    const [coulFond1, coulFond2] = FONDS_BIOME[biomeId] ?? FONDS_BIOME.classique;
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, coulFond1);
    grad.addColorStop(0.6, coulFond2);
    grad.addColorStop(1, '#000002');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

export function afficherPanneauVerrouille(noeud) {
    const requis = NOMS_MONDES_REQUIS[noeud.id] ?? 'monde Histoire';
    const elStatut = document.getElementById('sel-biome-statut');
    const elNom = document.getElementById('sel-biome-nom');
    if (elNom) elNom.textContent = `${noeud.biome.icone} ${noeud.biome.nom}`;
    if (elStatut) elStatut.textContent = `🔒 Complete ${requis} en Mode Histoire pour debloquer`;
    const panneau = document.getElementById('sel-info-biome');
    if (panneau) panneau.style.display = 'flex';
}

function dessinerNoeudVerrouille(ctx, noeud, rayon) {
    ctx.save();
    const gradLock = ctx.createRadialGradient(noeud.x, noeud.y, 0, noeud.x, noeud.y, rayon * 1.8);
    gradLock.addColorStop(0, 'rgba(10,5,20,0.8)');
    gradLock.addColorStop(1, 'rgba(5,5,10,0.4)');
    ctx.fillStyle = gradLock;
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(30,20,50,0.9)';
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100,80,140,0.6)';
    ctx.font = `${Math.floor(rayon * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', noeud.x, noeud.y);
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(80,70,100,0.55)';
    ctx.fillText(noeud.biome.nom, noeud.x, noeud.y + rayon + 13);
    ctx.restore();
}

function dessinerHaloNoeud(ctx, noeud, rayon, couleur) {
    ctx.save();
    const gradHalo = ctx.createRadialGradient(noeud.x, noeud.y, 0, noeud.x, noeud.y, rayon * 2.2);
    gradHalo.addColorStop(0, couleur + '18');
    gradHalo.addColorStop(1, 'transparent');
    ctx.fillStyle = gradHalo;
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function dessinerLignesConstellation(ctx, noeuds) {
    for (let i = 0; i < noeuds.length; i++) {
        for (let j = i + 1; j < noeuds.length; j++) {
            const a = noeuds[i];
            const b = noeuds[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist >= 220) continue;
            const debloque = !a.verrouille && !b.verrouille;
            ctx.strokeStyle = debloque ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
    }
}

export function dessinerNoeudBiome(ctx, noeud, timestamp, biomeHover, biomeChoisi) {
    const t = timestamp / 1000;
    noeud.pulsation += noeud.vitessePuls;
    const pulse = Math.sin(noeud.pulsation);
    const couleur = noeud.biome.lueurCoul;
    const estHover = biomeHover === noeud.id;
    const estChoisi = biomeChoisi === noeud.id;
    const rayon = noeud.verrouille ? noeud.rayon * 0.72 : noeud.rayon;

    if (noeud.flashRejet && timestamp - noeud.flashRejet < 400) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,40,40,0.35)';
        ctx.beginPath();
        ctx.arc(noeud.x, noeud.y, rayon + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    if (noeud.verrouille) {
        dessinerNoeudVerrouille(ctx, noeud, rayon);
        return;
    }

    dessinerHaloNoeud(ctx, noeud, rayon, couleur);

    ctx.save();

    if (estChoisi) {
        ctx.shadowColor = couleur;
        ctx.shadowBlur = 35;
        ctx.strokeStyle = couleur;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(noeud.x, noeud.y, rayon + 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (estHover) {
        ctx.shadowColor = couleur;
        ctx.shadowBlur = 25;
        ctx.save();
        ctx.translate(noeud.x, noeud.y);
        ctx.rotate(t * 1.2);
        ctx.strokeStyle = couleur;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, rayon + 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.strokeStyle = couleur + '33';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = couleur + '55';
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon + 4, 0, Math.PI * 2);
    ctx.stroke();

    const grad = ctx.createRadialGradient(
        noeud.x - rayon * 0.2,
        noeud.y - rayon * 0.2,
        0,
        noeud.x,
        noeud.y,
        rayon
    );
    grad.addColorStop(0, eclaircir(couleur, 1.35));
    grad.addColorStop(0.55, couleur);
    grad.addColorStop(1, assombrir(couleur, 0.45));
    ctx.fillStyle = grad;
    ctx.shadowColor = couleur;
    ctx.shadowBlur = estHover || estChoisi ? 0 : 12;
    ctx.beginPath();
    ctx.arc(noeud.x, noeud.y, rayon, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(noeud.biome.icone, noeud.x, noeud.y);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = couleur + '99';
    ctx.fillText(noeud.biome.nom, noeud.x, noeud.y + rayon + 14);

    ctx.restore();
}
