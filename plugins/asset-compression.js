/**
 * Plugin: asset-compression
 *
 * Verifies that specific types of content are compressed with the required
 * method.
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.types A list of `Content-Type`s that must be encoded
 * @param {string[]} config.types A list of `Content-Encoding`s that are allowed
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // files that were not compressed for this page load
    let notCompressed = {};

    config.types = config.types || [];

    return {
        onLoading: function() {
            // reset the list for each page
            notCompressed = {};
        },
        onLoaded: function() {
            // report on each content type
            config.types.forEach(function(type) {
                testReporter.test(
                    `${type} should be compressed`,
                    (notCompressed[type] && notCompressed[type].length) ? notCompressed[type] : undefined);
            });
        },
        onPage: async function(page) {
            page.on("response", response => {
                const contentType = response.headers()["content-type"];

                // see if it's one of our tracked types
                if (config.types.indexOf(contentType) !== -1) {
                    const encoding = response.headers()["content-encoding"];

                    // make sure it's encoded in one of the allowed methods
                    if (!encoding || config.encoding.indexOf(encoding) === -1) {
                        notCompressed[contentType].push(response.url());
                    }
                }
            });
        }
    };
};
