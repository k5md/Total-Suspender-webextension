module.exports = {
    verbose: true,
    ignoreFiles: [
        'totalSuspender.sublime-workspace',
        'totalSuspender.sublime-project',
    ],
    sourceDir: 'src',
    build: {
        overwriteDest: true,
    },
    run: {
        firefoxProfile: '../testProfile',
        keepProfileChanges: true,
    },
};