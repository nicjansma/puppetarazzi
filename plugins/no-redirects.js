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
                if (response.status() >= 300 && response.status() < 400 && response.status() !== 304) {
                    redirectUrls.push(response.url());
                }
            });
        }
    };
};
