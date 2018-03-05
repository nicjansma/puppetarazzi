/**
 * Plugin: screenshots
 *
 * Takes screenshots for each page and device
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string} config.output Output directory
 * @param {boolean} config.atf Writes Above-The-Fold screenshtos
 * @param {boolean} config.full Writes full length screenshots
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
//
// Imports
//
const fs = require("fs");
const path = require("path");

//
// Exports
//
module.exports = function(puppetarazzi, config) {
    let devicePath;
    let device;

    // make sure the path exists
    const screenshotsPath = path.join(process.cwd(), config.output);
    if (!fs.existsSync(screenshotsPath)) {
        fs.mkdirSync(screenshotsPath);
    }

    return {
        onDevice: async function(newDevice) {
            // make sure the device path exists
            device = newDevice;

            devicePath = path.join(screenshotsPath, `${device.name}-${device.width}x${device.height}`);
            if (!fs.existsSync(devicePath)) {
                fs.mkdirSync(devicePath);
            }
        },
        onLoaded: async function(page, pageDefinition, url, firstLoad, reload) {
            const reloadSuffix = reload ? "-reload" : "";

            // write the Above-The-Fold screenshot
            if (config.atf) {
                await page.screenshot({
                    path: path.join(devicePath, `${pageDefinition.name}-atf${reloadSuffix}.png`),
                    fullPage: false
                });
            }

            // write the Full-Page screenshot
            if (config.full) {
                await page.screenshot({
                    path: path.join(devicePath, `${pageDefinition.name}-full${reloadSuffix}.png`),
                    fullPage: true
                });
            }
        }
    };
};
