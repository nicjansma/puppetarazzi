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
    let loadedOk = false;

    // current destination URL
    let destination = null;

    return {
        onLoading: function(page, pageDefinition, url) {
            // reset state before this page begins
            loadedOk = false;
            destination = url;
        },
        onLoaded: function() {
            testReporter.testIsTrue(
                "page loaded OK",
                loadedOk);
        },
        onPage: async function(page) {
            page.on("response", async response => {
                if (response.url() !== destination) {
                    return;
                }

                if (response.ok()) {
                    let contents = await response.text();
                    if (contents && contents.length) {
                        loadedOk = true;
                    }
                }
            });
        }
    };
};
