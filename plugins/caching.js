/**
 * Plugin: caching
 *
 * Verifies that on a soft reload, all content is served from the disk cache.
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.exclude A list of string Regular Expressions for files to exclude
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    let cacheMisses = [];

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
        onLoading: function() {
            // clear the list of cache misses for this page
            cacheMisses = [];
        },
        onLoaded: function(page, pageDefinition, url, firstLoad, reload) {
            // only run on reload -- check there are no cache misses
            if (reload) {
                testReporter.test(
                    "no cache misses",
                    cacheMisses.length ? cacheMisses : undefined);
            }
        },
        onPage: async function(page) {
            page.on("response", response => {
                // log this response if it was from the cache and not excluded
                if (!response.fromCache() && !isExcluded(response.url())) {
                    cacheMisses.push(response.url());
                }
            });
        }
    };
};
