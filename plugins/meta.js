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
    return {
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

            for (let i = 0; i < config.required.length; i++) {
                let found = false;
                let req = config.required[i];
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
