/**
 * Plugin: pwa
 *
 * Verifies some of the Progressive Web App requirements.
 *
 * https://developers.google.com/web/progressive-web-apps/checklist
 *
 * Implemented:
 * 1. <meta name='theme-colo'>
 * 2. <link rel='manifest'>
 * 3. Available on SSL
 * 4. Uses a ServiceWorker (for the second+ pages)
 *
 * Not Implemented:
 * 1. Responsive design
 * 2. All app URLs load while offline
 * 3. First load fast even on 3G
 * 4. Page transitions don't feel like they block on the network
 * 5. etc
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {boolean} config.sw Whether or not to test for a ServiceWorker
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // whether or not we saw a ServiceWorker on reload
    let sawServiceWorker = false;

    return {
        onLoading: function() {
            // reset for each page
            sawServiceWorker = false;
        },
        onPage: async function(page) {
            page.on("response", resp => {
                if (resp.fromServiceWorker()) {
                    // log that we saw at least one ServiceWorker request
                    sawServiceWorker = true;
                }
            });
        },
        onLoaded: async function(page, pageDefinition, url, firstLoad, reload) {
            // 1. <meta name='theme-colo'>
            const metaThemeColorCount = await page.$$eval("meta[name='theme-color']", metas => metas.length);
            testReporter.testIsTrue("has meta 'theme-color'", metaThemeColorCount);

            // 2. <link rel='manifest'>
            const manifestCount = await page.$$eval("link[rel='manifest']", links => links.length);
            testReporter.testIsTrue("has link 'manifest'", manifestCount);

            // 3. Available on SSL
            testReporter.testIsTrue("available on SSL", page.url().indexOf("https://") === 0);

            // 4. Uses a ServiceWorker (for the second+ pages)
            if ((!firstLoad || reload) && config.sw) {
                testReporter.testIsTrue("uses ServiceWorker", sawServiceWorker);
            }
        }
    };
};
