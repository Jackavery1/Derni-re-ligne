import { resolve } from 'path';

export const racineJs = resolve('js');

export function creerPluginStubHistoireFallback() {
    return {
        name: 'stub-histoire-textes-fallback',
        setup(buildApi) {
            buildApi.onResolve({ filter: /histoire-textes\.fallback\.js$/ }, () => ({
                path: resolve(racineJs, 'histoire-textes.fallback.stub.js'),
            }));
        },
    };
}

/** @type {import('esbuild').BuildOptions} */
export const optionsCommunesProd = {
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    target: ['es2022'],
    legalComments: 'none',
    drop: ['console', 'debugger'],
    metafile: true,
    plugins: [creerPluginStubHistoireFallback()],
};
