#!/usr/bin/env node
//
// Imports
//
const Puppetarazzi = require("./src/puppetarazzi");
const fs = require("fs");
const JSON5 = require("json5");

// for debugging
process.on("unhandledRejection", r => console.error(r));

// command-line arguments
if (process.argv.length <= 2) {
    console.error("Usage: puppetarazzi [config.json]");
    process.exit(1);
}

const configFile = process.argv[2];

// load the config file
const fileContents = fs.readFileSync(configFile, "utf-8");
const configJson = JSON5.parse(fileContents);

// call Puppetarazzi
(async() => {
    try {
        var p = new Puppetarazzi(configJson);
        await p.run();
    } catch (e) {
        console.error(e);

        process.exit(1);
    }

    process.exit(0);
})();
