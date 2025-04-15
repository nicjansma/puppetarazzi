/**
 * Plugin: rss
 *
 * Verifies <link rel='alternative'> type="application/rss+xml" tag exists
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.test Test RSS links
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */

//
// Imports
//
const request = require("request-promise-native");

const RETRY_ATTEMPTS = 1;

module.exports = function(puppetarazzi, config, testReporter) {
    config.retries = config.retries || RETRY_ATTEMPTS;

    return {
        onLoaded: async function(page) {
            let rss = [];

            try {
                // look for a rel=search tag
                rss = await page.$$eval("link[rel='alternate'][type='application/rss+xml']",
                    nodes => nodes.map((node) => {
                        return {
                            href: node.getAttribute("href")
                        };
                    }));
            } catch (e) {
                // NOP
            }

            // verify the RSS exists
            if (config.test) {
                let rssFailure;

                for (let i = 0; i < rss.length; i++) {
                    for (let j = 0; j < config.retries; j++) {
                        rssFailure = await requestUrl(rss[i].href);

                        if (!rssFailure) {
                            // success!  continue with the next URL
                            break;
                        }
                    }

                    // retries didn't work
                    if (rssFailure) {
                        break;
                    }
                }

                testReporter.test("RSS 200 OK", rssFailure);
            }

            testReporter.testIsTrue("has RSS", rss.length !== 0);
        }
    };
};

/**
 * Requests the specific URL
 *
 * @param {string} url URL
 * @returns {undefined|object} Undefined if there were no errors
 */
async function requestUrl(url) {
    try {
        const response = await request({
            uri: url,
            resolveWithFullResponse: true,
            followRedirect: true
        });

        return response.statusCode !== 200 ? response.statusCode : undefined;
    } catch (e) {
        return e.message;
    }
}
