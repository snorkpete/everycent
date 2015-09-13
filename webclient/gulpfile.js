var pkg = require('./package.json');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');
var livereload = require('gulp-livereload');
//var runSequence = require('run-sequence');

// Check programming styles
gulp.task('jshint', function(){
  return gulp.src('app/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
  ;
});

/*
 * Outputs a compiled file name in format:  'to create a js compiled file named * '../public/js/<%= pkg.name %>-<%= type %>-<%= pkg.version %>.min.js':
 */
function compiledFileName(type, suffix){
  return pkg.name + '-' + type + '-' + pkg.version + suffix;
}
function ecUglify(src, type){
  var result = compiledFileName(type, '.min.js');
  return gulp.src(src)
            //.pipe(uglify(result, {
            //    outSourceMap: true
            //  }))
            .pipe(concat(result, {newLine: ';'}))
            .pipe(gulp.dest('../public/js'))
            .pipe(livereload())
  ;
}

gulp.task('js:app', function(){
  var src = [
    'app/**/*.module.js',
    'app/app.js',
    'app/app.route.js',
    'app/**/*.js',
    '!app/**/*.spec.js'
  ];
  return ecUglify(src, 'app');
});

gulp.task('js:vendor', function(){

  var src = [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-cookies/angular-cookies.min.js',
    'bower_components/angular-cookie/angular-cookie.min.js',
    'bower_components/ng-token-auth/dist/ng-token-auth.min.js',
    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
    //'bower_components/angular-bootstrap/ui-bootstrap.min.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'bower_components/lodash/dist/lodash.min.js',
    'bower_components/restangular/dist/restangular.min.js',
    //'bower_components/angular-toastr/dist/angular-toastr.min.js',
    'bower_components/angular-toastr/dist/angular-toastr.tpls.min.js',
    'bower_components/angular-loading-bar/build/loading-bar.min.js',
    'bower_components/angular-scroll/angular-scroll.min.js'
  ];
  return ecUglify(src, 'vendor');
});

gulp.task('css:vendor', function(){
  var result = compiledFileName('vendor', '.min.css');
  var src = [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/animate.css/animate.min.css',
    'bower_components/angular-toastr/dist/angular-toastr.min.css',
    'bower_components/angular-loading-bar/build/loading-bar.min.css'
  ];

  return gulp.src(src)
      .pipe(concat(result))
      .pipe(gulp.dest('../public/css'))
  ;
});

gulp.task('css:vendor', function(){
  var result = compiledFileName('vendor', '.min.css');
  var src = [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/animate.css/animate.min.css',
    'bower_components/angular-toastr/dist/angular-toastr.min.css',
    'bower_components/angular-loading-bar/build/loading-bar.min.css'
  ];

  return gulp.src(src)
      .pipe(concat(result))
      .pipe(gulp.dest('../public/css'));
});

gulp.task('css:app', function(){
  var result = compiledFileName('app', '.css');
  return gulp.src('app/**/*.css')
          .pipe(concatCss(result))
          .pipe(gulp.dest('../public/css'))
          .pipe(livereload())
  ;
});

gulp.task('html', function(){
  return gulp.src('app/**/*.html')
            .pipe(htmlmin({collapseWhitespace:true}))
            .pipe(templateCache({
                    filename: compiledFileName('templates', '.js'),
                    root: 'app/',
                    module: pkg.name
            }))
            .pipe(gulp.dest('../public/js'))
            .pipe(livereload())
  ;
});

gulp.task('watch', function(){
  // start the livereload server
  livereload.listen();

  // watch for changes to templates
  gulp.watch(['../public/*.html', 'app/**/*.html'], ['html']);

  // watch for changes to js
  gulp.watch(['app/**/*.js'], ['js:app']);

  // watch for changes to css
  gulp.watch(['app/**/*.css'], ['css:app']);

  livereload();
});

gulp.task('build', ['js:vendor', 'js:app', 'css:vendor', 'css:app', 'html', 'jshint']);
gulp.task('default', ['build', 'watch']);

// TODO check out gulp-bump

