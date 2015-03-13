// Karma configuration
// Generated on Thu May 29 2014 11:52:18 GMT-0400 (SA Western Standard Time)

module.exports = function(config) {
  var pkg =require('./package.json');
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
       '../public/js/everycent-vendor-' + pkg.version + '.min.js',
       'bower_components/angular-mocks/angular-mocks.js',
       '../public/js/everycent-app-' + pkg.version + '.js',
       '../public/js/everycent-templates-' + pkg.version + '.js',
      'test/unit/**/*.spec.js'
    ],

    // list of files to exclude
    exclude: [
      //'test/e2e/**/*.js',
       //'../public/js/everycent-app-*.min.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      //'**/*.html': ['ng-html2js']
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
    reporters: ['dots', 'progress', 'growl'],


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
    //browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
