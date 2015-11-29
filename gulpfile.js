var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var less = require('gulp-less');
var babelify = require('babelify');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();

var production = true;

function scripts(watch) {
  var bundler, rebundle;
  bundler = browserify({
    basedir: __dirname,
    debug: !production,
    entries: './app/index.jsx',
    extensions: ['.jsx'],
    cache: {},
    packageCache: {},
    fullPaths: watch
  });
  if(watch) {
    bundler = watchify(bundler);
  }

  bundler.transform(babelify);
//  if(production) {
//    bundler.transform({global: true}, uglifyify);
//  }

  rebundle = function() {
    var start = new Date().getTime();

    var stream = bundler.bundle();
    stream.on('error', function(err) {
        console.log(err);
    });

    stream = stream.pipe(source('bundle.js'));
    stream = stream.pipe(gulp.dest('./app/dist'));
    stream = stream.pipe(browserSync.reload({ stream: true }));
//
//    if(production) {
//      stream.pipe(gStreamify(uglify()));
//    }

    var end = new Date().getTime();
    var time = end - start;

    console.log('[browserify]', 'rebundle took ', time + ' ms');

    return stream;
  };
  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('less', function() {
  return gulp.src(["./app/assets/styles/*.less","./app/assets/styles/**/*.less"])
  .pipe(less())
  .pipe(concat('style.css'))
  .pipe(gulp.dest('./app/dist'))
  .pipe(browserSync.reload({ stream: true }));
});

gulp.task('watchLess', function() {
  gulp.watch(["./app/assets/styles/*.less","./app/assets/styles/**/*.less"], ['less']);
});

gulp.task('watchScripts', function() {
  return scripts(true);
});

gulp.task('server', function() {
  browserSync.init({
        server: "./app"
    });
});

gulp.task('default', ['less', 'watchLess', 'watchScripts', 'server'], function() {

});
