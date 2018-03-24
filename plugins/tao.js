//
// Imports
//
const { URL } = require("url");

/**
 * Plugin: tao
 *
 * Verifies that all content has `Timing-Allow-Origin`
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.exclude A list of string Regular Expressions for files to exclude
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // asset TAO misses
    let taoMisses = [];

    // current destination URL
    let destination = null;

    config.exclude = config.exclude || [];

    // convert all excludes to RegExp
    config.exclude = config.exclude.map(function(re) {
        return new RegExp(re);
    });

    /**
     * Determines if a URL is excluded from inspection
     *
     * @param {string} url URL
     *
     * @returns {boolan} True if the URL is excluded
     */
    function isExcluded(url) {
        return config.exclude.find(function(re) {
            return re.exec(url);
        });
    }

    return {
        onLoading: function(page, pageDefinition, url) {
            // reset state before this page begins
            taoMisses = [];
            destination = new URL(url);
        },
        onLoaded: function() {
            testReporter.test(
                "assets have timing-allow-origin headers",
                taoMisses.length ? taoMisses : undefined);
        },
        onPage: async function(page) {
            page.on("response", response => {
                if (response.url() === destination.href) {
                    // skip for the destination page
                    return;
                }

                if (response.url().indexOf("data:") !== -1) {
                    // skip data:
                    return;
                }

                // skip any excluded URLs
                if (isExcluded(response.url())) {
                    return;
                }

                // only care about TAO on other domains
                let responseUrl = new URL(response.url());
                if (responseUrl.host === destination.host) {
                    return;
                }

                // check for caching headers
                let headers = response.headers();
                if (!headers["timing-allow-origin"]) {
                    taoMisses.push(response.url());
                }
            });
        }
    };
};
