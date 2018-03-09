/**
 * Plugin: img-alt
 *
 * Verifies all IMGs have an alt tag
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
            const imgs = await page.$$eval("img", nodes => nodes.map((node) => {
                return {
                    alt: node.getAttribute("alt")
                };
            }));

            let hasImgWithoutAlt = false;
            for (let i = 0; i < imgs.length; i++) {
                if (!imgs[i].alt) {
                    hasImgWithoutAlt = true;
                    break;
                }
            }

            testReporter.testIsTrue("imgs had alt descriptions", !hasImgWithoutAlt);
        }
    };
};

// <!-- icons -->
// <meta name="msapplication-TileColor" content="#f7d200" />
// <meta name="msapplication-TileImage" content="<?php echo URL_FAVICONS; ?>tileicon-v<?php echo VER_FAVICON; ?>.png" />
