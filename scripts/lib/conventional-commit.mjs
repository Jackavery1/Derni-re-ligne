export const TYPES_CONVENTIONNELS = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'test',
    'chore',
    'perf',
    'ci',
    'build',
];

const PATTERN = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([a-z0-9-]+\))?: .+/;

/**
 * @param {string} premiereLigne
 * @returns {{ ok: true } | { ok: false, raison: string }}
 */
export function validerPremiereLigne(premiereLigne) {
    const ligne = premiereLigne.trim();
    if (!ligne) {
        return { ok: false, raison: 'message vide' };
    }
    if (ligne.startsWith('#')) {
        return { ok: false, raison: 'commentaire git uniquement' };
    }
    if (!PATTERN.test(ligne)) {
        return { ok: false, raison: 'format Conventional Commits invalide' };
    }
    return { ok: true };
}

/**
 * @param {string} [ligneRefusee]
 * @returns {string}
 */
export function messageAideCommit(ligneRefusee) {
    const lignes = [
        'Commit refusé : le titre doit respecter Conventional Commits.',
        'Format : type(scope): description courte',
        `Types : ${TYPES_CONVENTIONNELS.join(', ')}`,
        'Exemples :',
        '  feat(codex): ajouter entree miroir',
        '  fix(types): corriger union JSDoc robo',
        '  refactor(architecture): decouper vivant.js',
    ];
    if (ligneRefusee?.trim()) {
        lignes.push('', `Reçu : ${ligneRefusee.trim()}`);
    }
    lignes.push(
        '',
        'PowerShell / Cursor (pas de HEREDOC bash) :',
        '  npm run commit -- "feat(scope): sujet" "Corps optionnel"',
        '  git commit -m "feat(scope): sujet" -m "Corps optionnel"'
    );
    return lignes.join('\n');
}
