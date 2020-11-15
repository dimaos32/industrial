const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sync = require('browser-sync').create();
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
let uglify = require('gulp-uglify-es').default;

// Styles

const styles = () => {
  return gulp.src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'dist'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  gulp.watch('src/*.html').on('change', sync.reload);
  gulp.watch('src/js/**/*.js').on('change', sync.reload);
  done();
}

exports.server = server;

// Images optimization

const images = () => {
  return gulp.src('src/img-origin/**/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('src/img'));
}

exports.images = images;

// Webp

const createWebp = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('src/img'));
}

exports.webp = createWebp;

// Copy

const copy = () => {
  return gulp.src([
    'src/fonts/**/*.{woff,woff2}',
    'src/img/**',
    'src/*.ico'
    ], {
    base: 'src'
    })
    .pipe(gulp.dest('dist'));
};

exports.copy = copy;

// HTML

const html = () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
};

exports.html = html;

// js

const js = () => {
  return gulp.src('src/js/**/*.js', {base: 'src'})
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
};

exports.js = js;

// Clean

const clean = () => {
  return del('dist');
};

exports.clean = clean;

// Build

const build = (done) => gulp.series(
  'clean',
  'copy',
  'styles',
  'html',
  'js'
)(done);

exports.build = build;

// Watcher

const watcher = () => {
  gulp.watch('src/sass/**/*.scss', gulp.series('styles'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  gulp.watch('src/*.html', gulp.series('html'));
};

exports.default = gulp.series(
  build, server, watcher
);
