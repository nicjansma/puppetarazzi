//
// Imports
//
const _ = require("lodash");

/**
 * Plugin: meta
 *
 * Verifies the specified `<meta>` tags exist
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.requried List of `name`, `http-equiv` and `content` pairs exist
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    let pageConfig = config;

    return {
        onLoading: async function(page, pageDefinition) {
            pageConfig = config;

            // overwrite with required list from page definition
            if (pageDefinition && pageDefinition.plugins && pageDefinition.plugins.meta) {
                pageConfig = _.merge({}, pageDefinition.plugins.meta);
            }
        },
        onLoaded: async function(page) {
            let metas = [];

            try {
                metas = await page.$$eval(
                    "meta",
                    nodes => nodes.map((node) => {
                        return {
                            name: node.getAttribute("name"),
                            "http-equiv": node.getAttribute("http-equiv"),
                            content: node.getAttribute("content")
                        };
                    }));
            } catch (e) {
                // NOP
            }

            for (let i = 0; i < pageConfig.required.length; i++) {
                let found = false;
                let req = pageConfig.required[i];
                let type = req["http-equiv"] ? "http-equiv" : "name";

                for (let j = 0; j < metas.length; j++) {
                    // match on the correct type
                    if (metas[j][type] === req[type]) {

                        // if content is specified it must match, otherwise it
                        // just must exist
                        if (!req.content ||
                            req.content.length === 0 ||
                            req.content === metas[j].content) {
                            found = true;
                            break;
                        }
                    }
                }

                testReporter.testIsTrue(`has ${type}='${req[type]}' content='${req.content}'`, found);
            }
        }
    };
};
