import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/** @type {Map<string, object>} */
const noeuds = new Map();

function creerNoeud(tag, { id = '', className = '' } = {}) {
    const classes = new Set(className.split(/\s+/).filter(Boolean));
    /** @type {object[]} */
    const enfants = [];
    const noeud = {
        tagName: tag.toUpperCase(),
        id,
        className,
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
            toggle: (c, force) => {
                if (force === true) classes.add(c);
                else if (force === false) classes.delete(c);
                else if (classes.has(c)) classes.delete(c);
                else classes.add(c);
            },
        },
        style: { setProperty: vi.fn() },
        textContent: '',
        width: 64,
        height: 64,
        childNodes: enfants,
        children: enfants,
        appendChild(el) {
            enfants.push(el);
            return el;
        },
        replaceChildren(...els) {
            enfants.length = 0;
            for (const el of els) enfants.push(el);
        },
        contains(cible) {
            if (cible === noeud) return true;
            return enfants.some((e) => e.contains?.(cible));
        },
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        focus: vi.fn(),
        getContext: () => ({ clearRect: vi.fn(), fillRect: vi.fn() }),
    };
    if (id) noeuds.set(id, noeud);
    return noeud;
}

function installerDomPanneau() {
    noeuds.clear();
    const racine = creerNoeud('div', {
        id: 'panneau-detail',
        className: 'panneau-detail element-masque',
    });
    const backdrop = creerNoeud('div', {
        id: 'panneau-detail-backdrop',
        className: 'panneau-detail-backdrop',
    });
    const corps = creerNoeud('aside', {
        id: 'panneau-detail-corps',
        className: 'panneau-detail-corps',
    });
    const btnFermer = creerNoeud('button', { id: 'btn-panneau-detail-fermer' });
    const iconeWrap = creerNoeud('div', { id: 'panneau-detail-icone-wrap' });
    const icone = creerNoeud('canvas', { id: 'panneau-detail-icone' });
    const titre = creerNoeud('h2', { id: 'panneau-detail-titre' });
    const sousTitre = creerNoeud('p', { id: 'panneau-detail-sous-titre' });
    const description = creerNoeud('div', { id: 'panneau-detail-description' });
    const meta = creerNoeud('ul', { id: 'panneau-detail-meta', className: 'element-masque' });
    const condition = creerNoeud('p', {
        id: 'panneau-detail-condition',
        className: 'element-masque',
    });
    const btnJouer = creerNoeud('button', {
        id: 'btn-panneau-detail-jouer',
        className: 'element-masque',
    });
    const progression = creerNoeud('div', {
        id: 'panneau-detail-progression',
        className: 'panneau-detail-progression element-masque',
    });
    const progressionFill = creerNoeud('div', {
        id: 'panneau-detail-progression-fill',
        className: 'panneau-detail-progression-fill',
    });
    const progressionTexte = creerNoeud('div', {
        id: 'panneau-detail-progression-texte',
        className: 'panneau-detail-progression-texte',
    });
    progression.appendChild(progressionFill);
    progression.appendChild(progressionTexte);

    iconeWrap.appendChild(icone);
    for (const el of [
        btnFermer,
        iconeWrap,
        titre,
        sousTitre,
        description,
        progression,
        meta,
        condition,
        btnJouer,
    ]) {
        corps.appendChild(el);
    }
    racine.appendChild(backdrop);
    racine.appendChild(corps);

    globalThis.document = {
        body: { classList: { contains: () => false } },
        getElementById: (id) => noeuds.get(id) ?? null,
        createElement: (tag) => creerNoeud(tag),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        activeElement: null,
    };
}

describe('ui-panneau-detail', () => {
    beforeEach(async () => {
        installerDomPanneau();
        vi.resetModules();
        const mod = await import('../js/ui/ui-panneau-detail.js');
        mod.initialiserPanneauDetail();
        globalThis.__panneauDetail = mod;
    });

    afterEach(() => {
        globalThis.__panneauDetail?.fermerPanneauDetail();
    });

    it('ouvre et ferme le panneau', () => {
        const { ouvrirPanneauDetail, fermerPanneauDetail, panneauDetailEstOuvert } =
            globalThis.__panneauDetail;

        expect(panneauDetailEstOuvert()).toBe(false);
        ouvrirPanneauDetail({
            id: 'test_a',
            accent: '#ff6a00',
            titre: 'INFERNO',
            sousTitre: 'Chapitre I',
            description: 'Lore de test.',
            typoDescription: 'ui',
        });
        expect(panneauDetailEstOuvert()).toBe(true);
        expect(noeuds.get('panneau-detail-titre')?.textContent).toContain('INFERNO');

        fermerPanneauDetail();
        expect(panneauDetailEstOuvert()).toBe(false);
        expect(noeuds.get('panneau-detail')?.classList.contains('element-masque')).toBe(true);
    });

    it('toggle sur le meme id', () => {
        const { ouvrirPanneauDetail, panneauDetailEstOuvert } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({ id: 'test_b', accent: '#00ddc8', titre: 'ABYSSES' });
        expect(panneauDetailEstOuvert()).toBe(true);
        ouvrirPanneauDetail({ id: 'test_b', accent: '#00ddc8', titre: 'ABYSSES' });
        expect(panneauDetailEstOuvert()).toBe(false);
    });

    it('masque le lore si verrouille', () => {
        const { ouvrirPanneauDetail } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({
            id: 'test_c',
            accent: '#6644cc',
            titre: 'SECRET',
            description: ['Ne doit pas apparaitre'],
            verrouille: true,
            conditionTexte: 'Completer le Miroir',
        });
        expect(noeuds.get('panneau-detail-description')?.textContent).toBe('');
        expect(noeuds.get('panneau-detail-titre')?.textContent).toBe('???');
        expect(noeuds.get('panneau-detail-condition')?.textContent).toContain('Miroir');
    });

    it('affiche le teaser si afficherTeaserVerrouille', () => {
        const { ouvrirPanneauDetail } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({
            id: 'test_teaser',
            accent: '#00f5ff',
            titre: 'CYBER',
            description: 'Complete LE MIROIR en mode histoire pour debloquer',
            verrouille: true,
            afficherTeaserVerrouille: true,
        });
        expect(noeuds.get('panneau-detail-titre')?.textContent).toContain('CYBER');
        const desc = noeuds.get('panneau-detail-description');
        expect(desc?.children[0]?.textContent).toContain('mode histoire');
    });

    it('affiche la barre de progression si verrouille', () => {
        const { ouvrirPanneauDetail } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({
            id: 'test_prog',
            accent: '#00ddc8',
            titre: 'CENTENAIRE',
            verrouille: true,
            conditionTexte: '100 lignes',
            progression: { actuel: 42, cible: 100 },
        });
        const bloc = noeuds.get('panneau-detail-progression');
        expect(bloc?.classList.contains('element-masque')).toBe(false);
        expect(noeuds.get('panneau-detail-progression-texte')?.textContent).toBe('42 / 100');
    });

    it('affiche le bouton jouer quand une action est fournie', () => {
        const { ouvrirPanneauDetail } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({
            id: 'test_jouer',
            accent: '#ffbb44',
            titre: 'LE CARRE',
            actionPrincipale: { libelle: '▶ JOUER', onAction: vi.fn() },
        });
        expect(noeuds.get('btn-panneau-detail-jouer')?.classList.contains('element-masque')).toBe(
            false
        );
    });

    it('masque le bouton jouer si verrouille', () => {
        const { ouvrirPanneauDetail } = globalThis.__panneauDetail;
        ouvrirPanneauDetail({
            id: 'test_lock',
            accent: '#ffbb44',
            titre: 'SECRET',
            verrouille: true,
            actionPrincipale: { onAction: vi.fn() },
        });
        expect(noeuds.get('btn-panneau-detail-jouer')?.classList.contains('element-masque')).toBe(
            true
        );
    });
});
