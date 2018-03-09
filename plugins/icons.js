/**
 * Plugin: icons
 *
 * Verifies there are <link rel=""> icons
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.requried List of rel, sizes pairs that are required
 * @param {boolean} config.tile Requires msapplication-TileImage
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    return {
        onLoaded: async function(page) {
            const icons = await page.$$eval(
                "link[rel='apple-touch-icon'],link[rel='icon'],link[rel='shortcut icon']",
                nodes => nodes.map((node) => {
                    return {
                        rel: node.getAttribute("rel"),
                        sizes: node.getAttribute("sizes"),
                        href: node.getAttribute("href")
                    };
                }));

            for (let i = 0; i < config.required.length; i++) {
                let found = false;

                for (let j = 0; j < icons.length; j++) {
                    if (icons[j].rel === config.required[i].rel &&
                        icons[j].sizes === config.required[i].sizes) {
                        found = true;
                        break;
                    }
                }

                testReporter.testIsTrue(`has rel='${config.required[i].rel}' ${config.required[i].sizes}`, found);
            }

            if (config.tile) {
                const tileIconCount = await page.$$eval("meta[name='msapplication-TileImage']", nodes => nodes.length);
                testReporter.testIsTrue("has msapplication-TileImage", tileIconCount);
            }
        }
    };
};

// <!-- icons -->
// <meta name="msapplication-TileColor" content="#f7d200" />
// <meta name="msapplication-TileImage" content="<?php echo URL_FAVICONS; ?>tileicon-v<?php echo VER_FAVICON; ?>.png" />
