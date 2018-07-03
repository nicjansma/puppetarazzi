/**
 * Plugin: img-alt
 *
 * Verifies all IMGs have an alt tag
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.exclude A list of string Regular Expressions for files to exclude
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    /**
     * Determines if a URL is excluded from inspection
     *
     * @param {string} url URL
     *
     * @returns {boolan} True if the URL is excluded
     */
    function isExcluded(url) {
        if (!config.exclude) {
            return false;
        }

        return config.exclude.find(function(re) {
            return re.exec(url);
        });
    }

    return {
        onLoaded: async function(page) {
            const imgs = await page.$$eval("img", nodes => nodes.map((node) => {
                return {
                    alt: node.getAttribute("alt"),
                    src: node.getAttribute("src")
                };
            }));

            let imgsWithoutAlt = [];
            for (let i = 0; i < imgs.length; i++) {
                if (!imgs[i].alt) {
                    // skip any excluded URLs
                    if (!isExcluded(imgs[i].src)) {
                        imgsWithoutAlt.push(imgs[i].src);
                    }
                }
            }

            testReporter.test(
                "imgs had alt descriptions",
                imgsWithoutAlt.length === 0 ? undefined : imgsWithoutAlt);
        }
    };
};
