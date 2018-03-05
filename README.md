# Puppetarazzi

v0.1.0

Copyright 2018 Nic Jansma

http://nicj.net

Licensed under the MIT license

## Introduction

Puppetarazzi uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to load
your site's pages in a headless Chrome browser in various simulated
device resolutions, taking screenshots and capturing HAR files for each
page/device combo.

While it's there, it'll do a check-up on your site's content and will annoy you by
pointing out any flaws (mixed-content warnings, uncompressed content, 404s, etc).

Puppetarazzi contains a light-weight plugin infrastructure to easily add new checks,
and each plugin can be enabled as needed.

## Plugins

* `analytics`: Verifies that analytics services send beacons for the page hit
* `asset-compression`: Verifies that specific types of content are compressed with
   the required method.
* `caching`: Verifies that on a soft reload, all content is served from the disk
   cache.
* `har`: Writes HAR files for each page load
* `mixed-content`: Verifies there are no Mixed-Content warnings
* `no-404s`: Verifies there are no 404s
* `opengraph`: Verifies pages have OpenGraph (and other) structured content
* `pwa`: Verifies some of the Progressive Web App requirements
* `rel-canonical`: Verifies <link rel='canonical'> tag exists
* `schema`: Verifies schema.org types exist
* `screenshots`: Takes screenshots for each page and device

## Installation

Via npm:

```bash
npm install --global puppetarazzi
```

## Usage

```bash
puppetarazzi [config.json]
```

Example configuration below:

```json
{
    "name": "my-site",
    "root": "https://my-site.com",
    "verbose": true,
    "junit": "junit.xml",
    "postLoadSleep": 2000,
    "reloadAll": false,
    "plugins": {
        "analytics": {
            "require": [
                { "name": "google", "match": "google-analytics\\.com\\/.*\\/?collect.*" },
                { "name": "mPulse", "match": ".*akstat\\.io\\/*" }
            ]
        },
        "asset-compression": {
            "types": ["text/javascript", "text/css"],
            "encoding": ["gzip", "br"]
        },
        "caching": {
            "exclude": [
                "google-analytics\\.com\/collect",
                "c\\.go-mpulse\\.net\\/api\\/config\\.json",
                "\\.akstat\\.io\\/",
            ]
        },
        "har": {
            "output": "saved"
        },
        "mixed-content": {
            "warnings": true
        },
        "no-404s": {},
        "opengraph": {
            "testImage": true,
            "twitter": true
        },
        "pwa": {},
        "rel-canonical": {
            "https": true
        },
        "schema": {
            "require": [
                "http://schema.org/WebPage",
                "http://schema.org/Organization",
                "http://schema.org/Article"
            ]
        },
        "screenshots": {
            "output": "saved",
            "atf": true,
            "full": true
        }
    },
    "pages": [
        { "name": "home", "path": "/", "reload": true },
        { "name": "blog", "path": "/blog/" }
    ],
    "devices": [
        { "name": "desktop-1920", "width": 1920, "height": 1080 },
        { "name": "desktop-1440", "width": 1440, "height": 900 },
        { "name": "desktop-1280", "width": 1280, "height": 800 },
        { "name": "desktop-1024", "width": 1024, "height": 768 },
        { "name": "ipad", "width": 768, "height": 1024 },
        { "name": "ipad-pro", "width": 1024, "height": 1366 },
        { "name": "iphone", "width": 375, "height": 667 },
        { "name": "iphone-plus", "width": 414, "height": 736 },
        { "name": "iphone-x", "width": 375, "height": 812 },
        { "name": "iphone-5", "width": 320, "height": 568 },
        { "name": "galaxy-s5", "width": 360, "height": 640 },
        { "name": "nexus-5x", "width": 412, "height": 732 },
        { "name": "galaxy-s8", "width": 360, "height": 740 },
        { "name": "galaxy-note-5", "width": 480, "height": 853 },
        { "name": "galaxy-tab-10", "width": 800, "height": 1280 },
        { "name": "kindle-fire-hdx", "width": 800, "height": 1280 }
    ]
}
```

Each plugin (in `plugins/*.js`) has documentation on its options.

Global options:

* `name` - Site name
* `root` - Root URL
* `verbose` - Whether or not to log verbose messages (default: false)
* `junit` - jUnit XML file location (optional)
* `postLoadSleep` - How many milliseconds to delay after load before running checks (optional)
* `reloadAll` - Whether or not to trigger a reload of each page.  Some plugins
    require this for their checks, e.g. `asset-compression` (default: false)
* `plugins` - Each enabled plugin should be listed with its options
* `pages` - A list of `name`, `path` and `reload` (optional) pairs
* `devices` - A list of `name`, `width` and `height` pairs

## Version History

* v0.1.0 - 2018-03-04: Initial version
