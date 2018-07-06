/**
 * Plugin: rel-canonical
 *
 * Verifies <link rel='canonical'> tag exists
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.https Require the URL to be HTTPS
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    return {
        onLoaded: async function(page) {
            // look for a rel=canonical tag
            let hrefs = [];

            try {
                hrefs = await page.$$eval("link[rel='canonical']", links => links.map((a) => {
                    return a.href;
                }));
            } catch (e) {
                // NOP
            }

            testReporter.testIsTrue("has rel='canonical'", hrefs.length !== 0);

            // verify HTTPS if desired
            if (config.https) {
                testReporter.test(
                    "has rel='canonical' pointing at HTTPS",
                    (hrefs.length === 0 || hrefs[0].indexOf("https://") !== 0) ?
                        (hrefs[0] || "missing rel='canonical'") : undefined);
            }
        }
    };
};
