"use strict";

const gulp         = require('gulp');
const del          = require('del');
const browserSync  = require('browser-sync').create();
const autoprefixer = require('autoprefixer');
const svgstore     = require('gulp-svgstore');
const postcss      = require("gulp-postcss");
const plumber      = require("gulp-plumber");
const notify       = require("gulp-notify");
const imagemin     = require("gulp-imagemin");
const sass         = require('gulp-sass');
const csso         = require('gulp-csso');
const rename       = require('gulp-rename');
const sourcemaps   = require('gulp-sourcemaps');

// Пути
const paths = {
  root: './docs',
  styles: {
    src: 'source/sass/**/*.scss',
    dest: 'docs/css/'
  },
  scripts: {
    src: 'source/js/**/*.js',
    dest: 'docs/js/'
  },
  html: {
    src: 'source/*.html',
    dest: 'docs/'
  },
  images: {
    src: 'source/img/**/*.{jpg,svg,png}',
    dest: 'docs/img/'
  },
  fonts: {
    src: 'source/fonts/**/*.{woff,woff2}',
    dest: 'docs/fonts/'
  }
};

// Html
gulp.task('html', function () {
  return gulp.src(paths.html.src)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: "Html",
          message: err.message
        };
      })
    }))
    .pipe(gulp.dest(paths.root))
    .pipe(browserSync.stream());
});

// Создание стилевого файла из препроцессорного и его минификация
gulp.task('style', function () {
  return gulp.src('./source/sass/style.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {title: "Style", message: err.message};
      })
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(csso())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemaps.write())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
  });

  // Оптимизация картинок
  gulp.task('images', function () {
    return gulp.src(paths.images.src)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(paths.images.dest));
  });

  gulp.task('js', function () {
    return gulp.src(paths.scripts.src)
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
});

// Очистка папки build
gulp.task('clean', function () {
  return del(paths.root);
});

// Запуск сервера
gulp.task('server', function () {
  browserSync.init({
    server: paths.root,
    ui: false,
    cors: true
  });
  gulp.watch(paths.styles.src, gulp.series('style'));
  gulp.watch(paths.html.src, gulp.series('html'));
  gulp.watch(paths.images.src, gulp.series('images'));
  gulp.watch(paths.scripts.src, gulp.series('js'));
});

// Создание SVG спрайта
gulp.task('sprite', function () {
  return gulp.src('source/img/*-icon.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest(paths.images.dest));
});

// Копирование файлов
gulp.task('copy', function  () {
  return gulp.src([
    paths.fonts.src,
    paths.images.src,
    paths.scripts.src
  ], {
    base: "source"
  })
  .pipe(gulp.dest(paths.root));
});

// Сборка проекта
gulp.task('build', gulp.series(
  'clean',
  'copy',
  'images',
  'style',
  'sprite',
  'html'
));
