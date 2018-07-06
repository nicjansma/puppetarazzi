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

    return {
        onLoading: function() {
            // reset the list for each page
            notCompressed = {};
        },
        onLoaded: function() {
            // report on each content type
            config.types.forEach(function(type) {
                testReporter.test(
                    `${type} content should be compressed`,
                    (notCompressed[type] && notCompressed[type].length) ? notCompressed[type] : undefined);
            });
        },
        onPage: async function(page) {
            page.on("response", response => {
                // skip any excluded URLs
                if (isExcluded(response.url())) {
                    return;
                }

                let contentType = response.headers()["content-type"];

                // strip anything after ';' (e.g. charset)
                if (contentType && contentType.indexOf(";") !== -1) {
                    contentType = contentType.substring(0, contentType.indexOf(";")).trim();
                }

                // see if it's one of our tracked types
                if (contentType && config.types.indexOf(contentType) !== -1) {
                    const encoding = response.headers()["content-encoding"];

                    // make sure it's encoded in one of the allowed methods
                    if (!encoding || config.encoding.indexOf(encoding) === -1) {
                        if (!notCompressed[contentType]) {
                            notCompressed[contentType] = [];
                        }

                        notCompressed[contentType].push(response.url());
                    }
                }
            });
        }
    };
};
