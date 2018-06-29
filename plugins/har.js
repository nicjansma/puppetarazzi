/**
 * Plugin: har
 *
 * Writes HAR files for each page load
 *
 * via https://github.com/GoogleChrome/puppeteer/issues/1916
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string} config.output Output directory
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */

//
// Imports
//
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { harFromMessages } = require("chrome-har");

// list of events for converting to HAR
let events = [];

// event types to observe
const observe = [
    "Page.loadEventFired",
    "Page.domContentEventFired",
    "Page.frameStartedLoading",
    "Page.frameAttached",
    "Page.frameScheduledNavigation",
    "Network.requestWillBeSent",
    "Network.requestServedFromCache",
    "Network.dataReceived",
    "Network.responseReceived",
    "Network.resourceChangedPriority",
    "Network.loadingFinished",
    "Network.loadingFailed",
];

//
// Exports
//
module.exports = function(puppetarazzi, config) {
    let devicePath;
    let device;

    // make our output path
    const harPath = path.join(process.cwd(), config.output);
    if (!fs.existsSync(harPath)) {
        fs.mkdirSync(harPath);
    }

    return {
        onPage: async function(page) {
            // register events listeners
            const client = await page.target().createCDPSession();

            events = [];

            await client.send("Page.enable");
            await client.send("Network.enable");

            // observe each network event
            observe.forEach(method => {
                client.on(method, params => {
                    events.push({ method, params });
                });
            });
        },
        onDevice: async function(newDevice) {
            device = newDevice;

            // make sure this device's output dir exists
            devicePath = path.join(harPath, `${device.name}-${device.width}x${device.height}`);
            if (!fs.existsSync(devicePath)) {
                fs.mkdirSync(devicePath);
            }
        },
        onLoaded: async function(page, pageDefinition, url, firstLoad, reload) {
            const reloadSuffix = reload ? "-reload" : "";

            // convert the events to HAR
            const har = harFromMessages(events);

            // output file name
            const fileName = path.join(devicePath, `${pageDefinition.name}${reloadSuffix}.har`);

            // write to the FS
            await promisify(fs.writeFile)(fileName, JSON.stringify(har));
        }
    };
};
