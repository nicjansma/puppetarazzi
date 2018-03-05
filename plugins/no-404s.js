/**
 * Plugin: mixed-content
 *
 * Verifies there are no 404s
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // 404 URLs
    let hit404s = [];

    return {
        onLoading: function() {
            // clear list of 404s
            hit404s = [];
        },
        onLoaded: function() {
            // test there are no 404s
            testReporter.test(
                "no 404s",
                hit404s.length ? hit404s : undefined);
        },
        onPage: async function(page) {
            page.on("response", response => {
                if (response.status() === 404) {
                    // keep track of all 404s
                    hit404s.push(response.url());
                }
            });
        }
    };
};
