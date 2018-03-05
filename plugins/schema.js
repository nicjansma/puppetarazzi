/**
 * Plugin: schema
 *
 * Verifies schema.org types exist
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.require schema.org types to require
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    return {
        onLoaded: async function(page) {
            // look for a rel=canonical tag
            const itemTypes = await page.$$eval("*[itemtype]", nodes => nodes.map((node) => {
                return node.getAttribute("itemtype");
            }));

            // report on each itemtype required
            config.require.forEach(function(type) {
                testReporter.testIsTrue(
                    `${type} should exist`,
                    itemTypes.indexOf(type) !== -1);
            });
        }
    };
};
