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

module.exports = function(puppetarazzi, config, testReporter) {
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
                    try {
                        const response = await request({
                            uri: rss[i].href,
                            resolveWithFullResponse: true,
                            followRedirect: true
                        });

                        rssFailure = response.statusCode !== 200 ? response.statusCode : undefined;
                    } catch (e) {
                        rssFailure = e;
                    }
                }

                testReporter.test("RSS 200 OK", rssFailure);
            }

            testReporter.testIsTrue("has RSS", rss.length !== 0);
        }
    };
};

// <link rel="alternate" type="application/rss+xml" title="TiskTasks" href="<?php echo URL_RSS; ?>" />
