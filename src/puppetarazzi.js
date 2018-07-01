//
// Imports
//
const path = require("path");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const async = require("awaitable-async");
const sleep = require("await-sleep");

const TestReporter = require("./test-reporter");

//
// Functions
//
/**
 * Creates a new Puppetarazzi
 *
 * @param {object} config Configuration
 */
function Puppetarazzi(config) {
    this.config = config;
    this.plugins = {};
    this.reporter = new TestReporter(this);
}

/**
 * Starts the Puppetarazzi run
 */
Puppetarazzi.prototype.run = async function() {
    console.log(chalk.green("Starting Puppetarazzi"));

    // load each configured plugin
    for (let plugin in this.config.plugins) {
        // load .js
        const PluginCode = require(path.join(__dirname, "..", "plugins", plugin));

        this.plugins[plugin] = new PluginCode(
            this,
            this.config.plugins[plugin],
            this.reporter.forClass(plugin));

        this.plugins[plugin].name = plugin;
    }

    // test each device individually
    for (let device of this.config.devices) {
        // launch the browser
        let browser = await puppeteer.launch();
        await this.notifyPlugins("onBrowser", browser);

        // create a new page
        let page = await browser.newPage();
        await this.notifyPlugins("onPage", page);

        console.log(chalk.blue(device.name, `${device.width}x${device.height}`));

        // notify all plugins this device is starting
        await this.notifyPlugins("onDevice", device);

        // set the viewport size
        await page.setViewport({
            width: device.width,
            height: device.height
        });

        var firstLoad = true;

        // run through each page
        for (let pageDefinition of this.config.pages) {
            var url = this.config.root + pageDefinition.path;

            console.log(chalk.bold(pageDefinition.name), chalk.underline(url));

            // start the test suite
            this.reporter.suite(
                `${this.config.name}:${device.name}:${pageDefinition.name}`);

            try {
                // navigate to about:blank first
                await page.goto("about:blank", {
                    waitUntil: ["load"]
                });
            } catch (e) {
                console.error(e);
            }

            // notify all plugins that the page is about to load
            await this.notifyPlugins("onLoading", page, pageDefinition, url);

            try {
                // goto the specified URL
                await page.goto(url, {
                    waitUntil: ["networkidle0", "load"]
                });
            } catch (e) {
                console.error(e);
            }

            // wait if configured
            if (this.config.postLoadSleep) {
                await sleep(this.config.postLoadSleep);
            }

            // notify all plugins that this page has loaded
            await this.notifyPlugins("onLoaded", page, pageDefinition, url, firstLoad, false);

            // if we're in reloadAll mode or the page is set to reload, do so
            if (this.config.reloadAll || pageDefinition.reload) {
                console.log(chalk.bold(pageDefinition.name), chalk.underline(url), "(reload)");

                try {
                    // navigate to about:blank first
                    await page.goto("about:blank", {
                        waitUntil: ["load"]
                    });
                } catch (e) {
                    console.error(e);
                }

                // notify all plugins that the page is about to load
                await this.notifyPlugins("onLoading", page, pageDefinition, url);

                try {
                    // go to the URL again
                    await page.goto(url, {
                        waitUntil: ["networkidle0", "load"]
                    });
                } catch (e) {
                    console.error(e);
                }

                // wait if configured
                if (this.config.postLoadSleep) {
                    await sleep(this.config.postLoadSleep);
                }

                // notify all plugins that this page has loaded (a reload)
                await this.notifyPlugins("onLoaded", page, pageDefinition, url, false, true);
            }
        }

        // stop the browser
        browser.close();
    }

    // write jUnit XML if requested
    if (this.config.junit) {
        this.reporter.save(this.config.junit);
    }
};

/**
 * Notifies all plugins that an event happened
 *
 * Calls each plugin's callback serially, waiting for the results
 *
 * @param {string} eventName Event name
 */
Puppetarazzi.prototype.notifyPlugins = async function(eventName) {
    var eventArgs = Array.prototype.slice.call(arguments, 1);

    await async.eachSeries(this.plugins, async(plugin) => {
        if (typeof plugin[eventName] !== "function") {
            // no callback specified
            return;
        }

        try {
            // run the plugin's callback
            await plugin[eventName].apply(plugin, eventArgs);
        } catch (e) {
            console.log(`Exception in ${plugin.name} on ${eventName}`, e);
        }

        return;
    });
};

/**
 * Logs a debug message
 *
 * @param {string} pluginName Plugin name
 * @param {string} message Message
 */
Puppetarazzi.prototype.debug = function(pluginName, message) {
    if (this.config.verbose) {
        console.log(`  ${pluginName}: ${message}`);
    }
};

//
// Exports
//
module.exports = Puppetarazzi;
