import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import gulpBabel from 'gulp-babel';
import gulpConcat from 'gulp-concat';
import del from 'del';
import browserify from 'browserify';
import transform from 'vinyl-transform';
import sourceStream from 'vinyl-source-stream';
import source from 'vinyl-source-stream'
import babelify from 'babelify'
import gutil from 'gulp-util'


const distDirectory = 'client/static';
const sourceDirectory = 'client/src';

export function cleanDist() {
  return del(`${distDirectory}`);
}

export function copyHtml() {
  return gulp.src(`${sourceDirectory}/**/*.html`)
    .pipe(gulp.dest(`${distDirectory}`))
}

var b = browserify({
  entries: [`./${sourceDirectory}/js/main.js`]
});
b.transform(babelify);

export function buildJs() {

  var browserified = function () {
    console.log(filename);
    gutil.log('b.bundle');
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(distDirectory));
  };

  return gulp.src(`${sourceDirectory}/js/**/*.js`)
    .pipe(gulpBabel({
      presets: ['es2015', 'react'],
      plugins: ['transform-react-jsx']
    }))
    .pipe(browserified)
    .pipe(gulp.dest(`${distDirectory}/js`))
}

export function buildJsBrowserify() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(distDirectory));
}


export function copyJsLib() {
  return gulp.src(`${sourceDirectory}/js-external/**/*`)
    .pipe(gulp.dest(`${distDirectory}/js-external/`))
}

export function compileSCSS() {
  return gulp.src(`${sourceDirectory}/css/*.scss`)
    .pipe((gulpSass.sync().on('error', gulpSass.logError)))
    .pipe(gulp.dest(`${distDirectory}/css/`))
}

export function copyCSS() {
  return gulp.src(`${sourceDirectory}/css/*.css`)
    .pipe(gulp.dest(`${distDirectory}/css`))
}

export function copyImg() {
  return gulp.src(`${sourceDirectory}/img/**`)
    .pipe(gulp.dest(`${distDirectory}/img`))
}

export function copyFonts() {
  return gulp.src(`${sourceDirectory}/fonts/**`)
    .pipe(gulp.dest(`${distDirectory}/fonts`))
}

export function watch() {
  gulp.watch(`${sourceDirectory}/js/**/*`, buildJsBrowserify);
  // .on('change', gulpBrowserSync.reload);

  gulp.watch(`${sourceDirectory}/css/*.scss`, compileSCSS);
  //  .on('change', gulpBrowserSync.reload);

  gulp.watch(`${sourceDirectory}/img/*`, copyImg);
  // .on('change', gulpBrowserSync.reload);

  gulp.watch(`${sourceDirectory}/fonts/*`, copyImg);
  // .on('change', gulpBrowserSync.reload);

  gulp.watch(`${sourceDirectory}/**/*.html`, copyHtml);
  //.on('change', gulpBrowserSync.reload);

}

const build = gulp.series(cleanDist, gulp.parallel(buildJsBrowserify, compileSCSS, copyCSS, copyImg, copyFonts, copyHtml, copyJsLib));
export {build};

const dev = gulp.series(build, gulp.parallel(watch));
export {dev};
