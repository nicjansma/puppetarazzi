//
// Imports
//
const jUnitReportBuilder = require("junit-report-builder");
const chalk = require("chalk");
const figures = require("figures");

//
// Functions
//
/**
 * Creates a new TestReporter
 *
 * @param {Puppetarazzi} p Puppetarazzi object
 */
function TestReporter(p) {
    this.reporter = null;
    this.puppetarazzi = p;
}

/**
 * Starts a Test Suite
 *
 * @param {string} name Test Suite name
 */
TestReporter.prototype.suite = function(name) {
    this.reporter = jUnitReportBuilder.testSuite().name(name);
};

/**
 * Gets a TestReporter for the specified class
 *
 * @param {string} className Class name
 *
 * @returns {TestReporter.ForClass} A TestReported for the class
 */
TestReporter.prototype.forClass = function(className) {
    var that = this;

    return {
        /**
         * Logs a Test
         *
         * @param {string} testName Test name
         * @param {boolean|string} failure True, or message for failure
         */
        test: function(testName, failure) {
            let testCase = that.reporter.testCase()
                .className(className)
                .name(testName);

            if (failure) {
                testCase.failure(failure === true ? undefined : failure);

                that.puppetarazzi.debug(className, chalk.red(figures("✖ ") + `${testName}: ${failure}`));
            } else {
                that.puppetarazzi.debug(className, chalk.green(figures("✔︎") + `${testName}`));
            }
        },

        /**
         * Tests that the expression is true
         *
         * @param {string} testName Test name
         * @param {object} test Thing to test
         */
        testIsTrue: function(testName, test) {
            this.test(testName, test ? undefined : "failed");
        },

        /**
         * Logs an class error condition
         *
         * @param {string} message Error message
         */
        error: function(message) {
            let testCase = that.reporter.testCase()
                .className(className)
                .name("ran successfully");

            testCase.failure(message);

            that.puppetarazzi.debug(className, chalk.red(figures("✖ ") + `${message}`));
        }
    };
};

/**
 * Saves the TestReporter output to jUnit XML
 *
 * @param {string} fileName File name
 */
TestReporter.prototype.save = function(fileName) {
    jUnitReportBuilder.writeTo(fileName);
};

//
// Exports
//
module.exports = TestReporter;
