/**
 * Plugin: basic
 *
 * Verifies that the page loads with a 200 response
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // whether or not the page loaded OK
    let failureMessage = null;

    // current destination URL
    let destination = null;

    return {
        onLoading: function(page, pageDefinition, url) {
            // reset state before this page begins
            failureMessage = null;
            destination = url;
        },
        onLoaded: function() {
            testReporter.test(
                "page loaded OK",
                failureMessage);
        },
        onPage: async function(page) {
            page.on("response", async response => {
                if (response.url() !== destination) {
                    return;
                }

                if (response.ok() || response.status() === 304) {
                    let contents = await response.text();
                    if (contents && contents.length) {
                        failureMessage = null;
                    }
                } else {
                    failureMessage = response.status();
                }
            });
        }
    };
};
