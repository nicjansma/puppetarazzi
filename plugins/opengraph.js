/**
 * Plugin: opengraph
 *
 * Verifies pages have OpenGraph (and other) structured content
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.testImage Checks the og:image exists
 * @param {boolean} config.twitter Checks for twitter info
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */

//
// Imports
//
const ogs = require("open-graph-scraper");
const request = require("request-promise-native");

//
// Exports
//
module.exports = function(puppetarazzi, config, testReporter) {
    return {
        onLoaded: async function(page) {
            // get the page's HTML
            const html = await page.evaluate(
                "new XMLSerializer().serializeToString(document.doctype) + " +
                "document.documentElement.outerHTML");

            if (!html) {
                testReporter.error("Unable to parse HTML");
                return;
            }

            // run through open-graph-scraper
            ogs({ html: html }, async function(error, results) {
                if (error || !results.data) {
                    testReporter.error(results ? results.error : "Unknown error");
                    return;
                }

                // OpenGraph
                testReporter.testIsTrue("opengraph og:locale", results.data.ogLocale);
                testReporter.testIsTrue("opengraph og:title", results.data.ogTitle);
                testReporter.testIsTrue("opengraph og:type", results.data.ogType);
                testReporter.testIsTrue("opengraph og:site_name", results.data.ogSiteName);
                testReporter.testIsTrue("opengraph og:description", results.data.ogDescription);
                testReporter.testIsTrue("opengraph og:url", results.data.ogUrl);
                testReporter.testIsTrue("opengraph og:image", results.data.ogImage && results.data.ogImage.url);

                // verify the image exists
                if (config.testImage && results.data.ogImage && results.data.ogImage.url) {
                    var ogImageFailure = false;

                    try {
                        const response = await request({
                            uri: results.data.ogImage.url,
                            resolveWithFullResponse: true
                        });

                        ogImageFailure = response.statusCode !== 200;
                    } catch (e) {
                        ogImageFailure = true;
                    }

                    testReporter.testIsTrue("opengraph og:image 200 OK", !ogImageFailure);
                }

                // Twitter
                if (config.twitter) {
                    testReporter.testIsTrue("twitter card", results.data.twitterCard);
                    testReporter.testIsTrue("twitter site", results.data.twitterSite);
                    testReporter.testIsTrue("twitter title", results.data.twitterTitle);
                    testReporter.testIsTrue("twitter description", results.data.twitterDescription);
                }
            });
        }
    };
};
