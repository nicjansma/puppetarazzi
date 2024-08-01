/**
 * Plugin: caching
 *
 * Verifies that the page and all assets have `Cache-Control` headers, and
 * on a soft reload, all content is served from the disk cache.
 *
 * @param {Puppetarazzi} puppetarazzi Puppetarazzi instance
 * @param {object} config Configuration
 * @param {string[]} config.exclude A list of string Regular Expressions for files to exclude
 * @param {boolean} config.page Test for caching on the page itself
 * @param {TestReporter} testReporter Test reporter
 *
 * @returns {object} Plugin
 */
module.exports = function(puppetarazzi, config, testReporter) {
    // asset cache misses
    let cacheMisses = [];

    // assets with missing headers
    let missingHeaders = [];

    // whether the page was a cache miss (on reload)
    let pageCacheMiss = false;

    // whether the page was missing caching headers
    let pageMissingHeaders = false;

    // current destination URL
    let destination = null;

    // URLs from first page
    let firstPageUrls = [];

    // Currently on the first page
    let isFirstLoad = false;

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
     * @returns {boolean} True if the URL is excluded
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
        onLoading: function(page, pageDefinition, url, firstLoad, reload) {
            // reset state before this page begins
            cacheMisses = [];
            missingHeaders = [];
            pageCacheMiss = false;
            pageMissingHeaders = false;
            destination = url;
            isFirstLoad = firstLoad;

            if (firstLoad) {
                firstPageUrls = [];
            }
        },
        onLoaded: function(page, pageDefinition, url, firstLoad, reload) {
            // caching headers checks
            testReporter.testIsTrue(
                "page has cache-control headers",
                !pageMissingHeaders);

            testReporter.test(
                "assets have cache-control headers",
                missingHeaders.length ? missingHeaders : undefined);

            // on reload, check there are no cache misses
            if (reload) {
                testReporter.testIsTrue(
                    "page cache miss",
                    !pageCacheMiss);

                testReporter.test(
                    "asset cache misses",
                    cacheMisses.length ? cacheMisses : undefined);
            }
        },
        onPage: async function(page) {
            page.on("response", async response => {
                let isPage = response.url() === destination;

                if (isFirstLoad) {
                    firstPageUrls.push(response.url());
                }

                if (response.url().indexOf("data:") !== -1) {
                    // skip data:
                    return;
                }

                if (isPage && !config.page) {
                    // skip for the destination page
                    return;
                }

                // skip any excluded URLs
                if (isExcluded(response.url())) {
                    return;
                }

                // check for caching headers
                let headers = response.headers();
                if (!headers["cache-control"] ||
                    headers["cache-control"].indexOf("max-age=") === -1 ||
                    headers["cache-control"].indexOf("max-age=0") !== -1) {
                    if (isPage) {
                        pageMissingHeaders = true;
                    } else {
                        missingHeaders.push(response.url());
                    }
                }

                // log cache misses
                if (!response.fromCache()) {
                    if (isPage) {
                        // the browser navigating on reload won't use disk cache
                        if (response.status() !== 304) {
                            pageCacheMiss = true;
                        }
                    } else if (config.excludeLazy) {
                        // Look to see if this URL is a lazy loading image, and if so,
                        // we can skip it since it may be random
                        let imgs = [];

                        try {
                            imgs = await page.$$eval("img", nodes => nodes.map((node) => {
                                return {
                                    loading: node.getAttribute("loading"),
                                    src: node.getAttribute("src")
                                };
                            }));
                        } catch (e) {
                            // NOP
                        }

                        // look for any IMG loading=lazy with the same src, and the URL was NOT loaded in the original
                        var matchingImg = imgs.find((i) => i.src === response.url() && i.loading === "lazy")
                            && firstPageUrls.indexOf(response.url()) === -1;

                        if (!matchingImg) {
                            // not a loading="lazy", add to the cache misses
                            cacheMisses.push(response.url());
                        }
                    } else {
                        // lazy loads are not excluded
                        cacheMisses.push(response.url());
                    }
                }
            });
        }
    };
};
