#!/usr/bin/env node
//
// Imports
//
const Puppetarazzi = require("./src/puppetarazzi");
const fs = require("fs");

// command-line arguments
if (process.argv.length <= 2) {
    console.error("Usage: puppetarazzi [config.json]");
    process.exit(1);
}

const configFile = process.argv[2];

// load the config file
const fileContents = fs.readFileSync(configFile, "utf-8");
const configJson = JSON.parse(fileContents);

// call Puppetarazzi
var p = new Puppetarazzi(configJson);
p.run();
