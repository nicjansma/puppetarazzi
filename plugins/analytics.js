/**
 * Plugin: analytics
 *
 * Verifies that analytics services send beacons for the page hit
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {object[]} config.require A list of objects with a friendly `name` and
 *     `match` of Regular Expressions that match a beacon URL
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // tracks which beacons were sent for each page load
    let beacons = {};

    // default to an empty list
    config.require = config.require || [];

    // convert each string to a real RegExp
    config.require = config.require.map(function(req) {
        return {
            name: req.name,
            re: new RegExp(req.match)
        };
    });

    return {
        onLoading: function() {
            // clear our beacons list before each page load
            beacons = {};
        },
        onLoaded: function() {
            // report on each required beacon
            config.require.forEach(function(req) {
                testReporter.testIsTrue(
                    `${req.name} sent a beacon`,
                    beacons[req.name]);
            });
        },
        onPage: async function(page) {
            // check each response to see if it matches one of our beacons
            page.on("response", response => {
                config.require.forEach(function(req) {
                    if (req.re.exec(response.url())) {
                        beacons[req.name] = true;
                    }
                });
            });
        }
    };
};
