const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Log current working directory and the path to package.json
console.log('Current working directory:', process.cwd());
console.log('Checking package.json at path:', path.resolve(__dirname, '../../../package.json'));

// Directly read package.json to verify its content
fs.readFile(path.resolve(__dirname, '../../../package.json'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }
    console.log('package.json content:', data);

    try {
        const jsonContent = JSON.parse(data);
        console.log('Parsed package.json content:', jsonContent);
    } catch (parseErr) {
        console.error('Error parsing package.json:', parseErr);
        return;
    }

    // Proceed with esbuild if package.json is valid
    runEsbuild();
});

function runEsbuild() {
    const production = process.argv.includes('--production');
    const watch = process.argv.includes('--watch');

    const esbuildProblemMatcherPlugin = {
        name: 'esbuild-problem-matcher',
        setup(build) {
            build.onStart(() => {
                console.log('[watch] build started');
            });
            build.onEnd((result) => {
                result.errors.forEach(({ text, location }) => {
                    console.error(`✘ [ERROR] ${text}`);
                    console.error(`    ${location.file}:${location.line}:${location.column}:`);
                });
                console.log('[watch] build finished');
            });
        },
    };

    async function main() {
        try {
            const ctx = await esbuild.context({
                entryPoints: ['index.js'],
                bundle: true,
                format: 'cjs',
                minify: production,
                sourcemap: !production,
                sourcesContent: false,
                platform: 'node',
                outfile: 'out.js',
                external: ['vscode'],
                logLevel: 'silent',
                plugins: [esbuildProblemMatcherPlugin],
            });
            if (watch) {
                await ctx.watch();
            } else {
                await ctx.rebuild();
                await ctx.dispose();
            }
        } catch (error) {
            console.error('Build failed with error:', error);
            process.exit(1);
        }
    }

    main().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}