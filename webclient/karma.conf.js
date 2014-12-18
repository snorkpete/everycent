// Karma configuration
// Generated on Thu May 29 2014 11:52:18 GMT-0400 (SA Western Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'vendor/js/angular.min.js',
      'vendor/js_test/angular-mocks.js',
      'vendor/js/*.js',
      'app/app.js',
      'app/router.js',
      //'app/common/telephone_filter.js',
      // TODO: no clue why using app/**/* doesn't work - stuff somehow doesn't load
      //'app/**/*.js',
      //'app/common/*.js',
      //'app/claim/*.js',
      //'app/claim_notification/*.js',
      //'app/client/*.js',
      //'app/policy/*.js',
      //'app/quote/*.js',
      //'app/security/*.js',
      //'app/**/*.html',
      //'app/common/blank_if_zero_filter.js',
      //'app/**/*.(!spec).js',
      //'app/**/*.jst',
      //'test/unit/lier/common/blank_if_zero_filter.spec.js'
      //'test/unit/lier/common/blank_if_zero_filter.spec.js'
      'test/unit/**/*.spec.js'
      //'app/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
      'test/e2e/**/*.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.html': ['ng-html2js']
    },

    //ngHtml2JsPreprocessor: {
    //  // setting this option will create only a single module that contains templates
    //  // from all the files, so you can load them all with module('foo')
    //  moduleName: 'templates'
    //},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['progress', 'growl'],
    reporters: ['progress', 'growl'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
