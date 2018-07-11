/**
 * Plugin: no-redirects
 *
 * Verifies there are no redirects
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
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
        if (!config.exclude) {
            return false;
        }

        return config.exclude.find(function(re) {
            return re.exec(url);
        });
    }

    // 404 URLs
    let redirectUrls = [];

    return {
        onLoading: function() {
            // clear list of redirects
            redirectUrls = [];
        },
        onLoaded: function() {
            // test there are no redirects
            testReporter.test(
                "no redirects",
                redirectUrls.length ? redirectUrls : undefined);
        },
        onPage: async function(page) {
            page.on("response", response => {
                // skip any excluded URLs
                if (isExcluded(response.url())) {
                    return;
                }

                if (response.status() >= 300 && response.status() < 400 && response.status() !== 304) {
                    redirectUrls.push(response.url());
                }
            });
        }
    };
};
