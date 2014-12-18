module.exports = function (grunt) {

  grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        options: {
          separator: ';'
        },
        files: {

          // vendor js //
          '../public/js/<%= pkg.name %>-vendor-<%= pkg.version %>.min.js':[
            'bower_components/angular/angular.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap.min.js',
            'bower_components/angular-loading-bar/build/loading-bar.min.js'
          ],

          // main application js //
          '../public/js/<%= pkg.name %>-app-<%= pkg.version %>.js': [
            'app/app.js',
            'app/**/*.js',
            '!app/**/*.spec.js'
          ],

          // login application js //
          '../public/js/<%= pkg.name %>-login-<%= pkg.version %>.js': [
            'loginapp/login.js',
            'app/common/*.js',
            '!app/common/*.spec.js'
          ],
        }
      },
      css: {
        files:{
          '../public/css/<%= pkg.name %>.css': [
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'bower_components/angular-loading-bar/build/loading-bar.min.css',
            'app/**/*.css'
          ]
        }
      }
    },

    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      js: {
        files: {
          '../public/js/<%= pkg.name %>-app-<%= pkg.version %>.min.js': ['../public/js/<%= pkg.name %>-app-<%= pkg.version %>.js'],
          '../public/js/<%= pkg.name %>-login-<%= pkg.version %>.min.js': ['../public/js/<%= pkg.name %>-login-<%= pkg.version %>.js']
        }
      }
    },
    //less: {
    //  style: {
    //    files: {
    //      "public/css/style.css": "less/style.less"
    //    }
    //  }
    //},

    // Running unit tests
    // ------------------
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
      }
    },

    // Running end to end tests
    // ------------------------
    //protractor: {
    //  options: {
    //    configFile: 'protractor.conf.js',
    //    keepAlive: true,  // false means stop the grunt process if test fails
    //    args: {}         // arguments passed to the protractor command
    //  },
    //  chrome: {
    //    options: {
    //      args: {
    //        browser: 'chrome'
    //      }
    //    }
    //  }
    //  // Adding the items below allows for running against multiple browsers with a single grunt protractor command
    //  //safari: {
    //  //  options:{
    //  //    args: {
    //  //      browser: 'safari'
    //  //    }
    //  //  }
    //  //},
    //  //firefox: {
    //  //  options:{
    //  //    args: {
    //  //      browser: 'firefox'
    //  //    }
    //  //  }
    //  //}
    //},
    ngtemplates: {
      'app': {
        src: 'app/**/*.html',
        dest: '../public/js/<%= pkg.name %>-templates-<%= pkg.version %>.js',
        options:{
          module: 'everycent',
          htmlmin:{
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true, // Only if you don't use comment directives!
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      }
    },
    watch: {
      js: {
        //files: ['javascript/*.js'],
        //tasks: ['concat:js', 'uglify:js'],
        files: ['app/*.js', 'app/**/*.js'],
        tasks: ['concat:js', 'uglify:js'],
        options: {
          livereload: true,
        }
      },
      css: {
        //files: ['less/*.less'],
        //tasks: ['less:style'],
        files: ['assets/*.css', 'assets/**/*.css'],
        options: {
          livereload: true,
        }
      },
      html: {
        //files: ['less/*.less'],
        //tasks: ['less:style'],
        files: ['../public/*.html', '*.html', 'app/*.html', 'app/**/*.html', 'loginapp/**/*.html'],
        tasks:['ngtemplates'],
        options: {
          livereload: true
        }
      }
      //,
      //karma: {
      //  files: ['app/*.js', 'app/**/*.js'],
      //}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-less');
  //grunt.loadNpmTasks('grunt-karma');
  //grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('watching', [ 'watch' ]);
  //grunt.registerTask('concat', [ 'concat' ]);

  grunt.registerTask('default', ['watching']);
};
