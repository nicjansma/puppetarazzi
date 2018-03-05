/**
 * Plugin: mixed-content
 *
 * Verifies there are no Mixed-Content warnings
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.warnings Fails on warnings instead of just errors
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // list of failed requests and their URLs
    let failedRequests = {};

    // URLs that failed due to Mixed-Content
    let failedMixedContent = [];

    return {
        onLoading: function() {
            // clear list of requests and mixed-content failures
            failedRequests = {};
            failedMixedContent = [];
        },
        onLoaded: function() {
            // report on any failures
            testReporter.test(
                "no mixed content",
                failedMixedContent.length ? failedMixedContent : undefined);
        },
        onPage: async function(page) {
            page.on("requestfailed", request => {
                // keep track of Request ID -> URL map
                failedRequests[request._requestId] = request.url();
            });

            page._client.on("Network.loadingFailed", event => {
                // log blocked content
                if (event.blockedReason === "mixed-content") {
                    let url = failedRequests[event.requestId];
                    failedMixedContent.push("Blockable: " + url);
                }
            });

            page._client.on("Network.requestWillBeSent", event => {
                // log warnings if configured
                if (config.warnings && event.request.mixedContentType === "optionally-blockable") {
                    failedMixedContent.push("Optionally Blockable: " + event.request.url);
                }
            });
        }
    };
};
