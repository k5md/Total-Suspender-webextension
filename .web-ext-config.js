module.exports = {
    verbose: true,
    sourceDir: './src',
    build: {
        overwriteDest: true,
    },
    run: {
        firefoxProfile: '../testProfile',
        keepProfileChanges: true,
    },
};