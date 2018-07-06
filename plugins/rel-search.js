/**
 * Plugin: rel-search
 *
 * Verifies <link rel='search'> tag exists
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    return {
        onLoaded: async function(page) {
            // look for a rel=search tag
            let linkCount = 0;
            try {
                linkCount = await page.$$eval("link[rel='search']", links => links.length);
            } catch (e) {
                // NOP
            }

            testReporter.testIsTrue("has rel='search'", linkCount.length !== 0);
        }
    };
};
