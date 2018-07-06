//
// Imports
//
const _ = require("lodash");

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
    let pageConfig = config;

    return {
        onLoading: async function(page, pageDefinition) {
            pageConfig = config;
            if (pageDefinition && pageDefinition.plugins && pageDefinition.plugins.schema) {
                pageConfig = _.merge({}, pageConfig, pageDefinition.plugins.schema);
            }
        },
        onLoaded: async function(page) {
            // look for a rel=canonical tag
            let itemTypes = [];
            try {
                itemTypes = await page.$$eval("*[itemtype]", nodes => nodes.map((node) => {
                    return node.getAttribute("itemtype");
                }));
            } catch (e) {
                // NOP
            }

            // report on each itemtype required
            pageConfig.require.forEach(function(type) {
                testReporter.testIsTrue(
                    `${type} should exist`,
                    itemTypes.indexOf(type) !== -1);
            });
        }
    };
};
