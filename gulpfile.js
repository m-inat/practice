var gulp        = require('gulp');
var sass        = require('gulp-sass');
var sassGlob    = require('gulp-sass-glob');
var jsonToSass  = require('gulp-json-to-sass');
var pleeease    = require('gulp-pleeease');
var plumber     = require('gulp-plumber');
var notify      = require('gulp-notify');
var pug         = require('gulp-pug');
var browserSync = require('browser-sync');
var filter      = require('gulp-filter');
var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var data        = require('gulp-data');
var fs          = require('fs');

// config
var root = '/',
    src = 'src/',
    config = {
      'path' : {
        'htdocs' : 'dist/',
        'sass'   : src + 'sass',
        'js'     : src + 'js',
        'pug'    : src + 'pug'
      }
    }

// sass
gulp.task('sass', function() {
  gulp.src(config.path.sass + '/**/*.sass')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(jsonToSass({
    jsonPath: src + 'config/variables.json',
    scssPath: config.path.sass + '/_variables.sass'
  }))
  .pipe(sassGlob())
  .pipe(sass())
  .pipe(pleeease({
    'autoprefixer': {
      'browsers': ['last 2 versions']
    },
    'minifier': false
  }))
  .pipe(gulp.dest(config.path.htdocs + 'css'));
});

// pug
gulp.task('pug', function() {
  var locals = {
    'site': JSON.parse(fs.readFileSync(src + 'config/variables.json'))
  }
  return gulp.src(config.path.pug + '/**/*.pug')
  .pipe(plumber({
    errorHandler: notify.onError('Error: <%= error.message %>')
  }))
  .pipe(pug({
    locals : locals,
    pretty : true,
    basedir: config.path.pug
  }))
  .pipe(gulp.dest(config.path.htdocs));
});

// js
gulp.task('js', function() {
  browserify(config.path.js + '/script.js', {debug: true})
  .transform(babelify, {preset: ['env']})
  .bundle()
  .on('error', function(err) {
    console.log('Error : ' + err.message);
  })
  .pipe(source('script.js'))
  .pipe(gulp.dest(config.path.htdocs + 'js'))
});

// browserSync
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: config.path.htdocs,
      route: {
        '/bower_components': 'bower_components',
        '/dev': 'dev'
      }
    }
  });
});

// watch
gulp.task('watch', function() {
  gulp.watch(src + 'config/variables.json', ['sass', 'pug', browserSync.reload]);
  gulp.watch(config.path.sass + '/**/*.sass', ['sass', browserSync.reload]);
  gulp.watch(config.path.pug + '/**/*.pug', ['pug', browserSync.reload]);
  gulp.watch(config.path.js + '/**/*.js', ['js', browserSync.reload]);
});

// build
gulp.task('build', ['sass','pug','js']);

// default task
gulp.task('default', ['build','watch','serve']);
