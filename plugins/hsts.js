/**
 * Plugin: hsts
 *
 * Verifies that the page loads HTTP Strict Transport Security
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // whether or not HSTS is enabled
    let hasHsts = false;

    // current destination URL
    let destination = null;

    return {
        onLoading: function(page, pageDefinition, url) {
            // reset state before this page begins
            hasHsts = false;
            destination = url;
        },
        onLoaded: function(page, pageDefinition, url, firstLoad, reload) {
            if (!reload) {
                testReporter.testIsTrue(
                    "has HSTS",
                    hasHsts);
            }
        },
        onPage: async function(page) {
            page.on("response", async response => {
                if (response.url() !== destination) {
                    return;
                }

                if (response.headers()["strict-transport-security"]) {
                    hasHsts = true;
                }
            });
        }
    };
};
