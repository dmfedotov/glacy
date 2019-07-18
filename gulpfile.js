"use strict";

const gulp         = require('gulp');
const del          = require('del');
const browserSync  = require('browser-sync').create();
// const htmlmin      = require('gulp-htmlmin');
const autoprefixer = require('autoprefixer');
const svgstore     = require('gulp-svgstore');
const cheerio      = require('gulp-cheerio');
const replace      = require('gulp-replace');
const postcss      = require("gulp-postcss");
// const uncss        = require('postcss-uncss');
const plumber      = require("gulp-plumber");
const notify       = require("gulp-notify");
const imagemin     = require("gulp-imagemin");
// const uglify       = require("gulp-uglify");
// const webp         = require("gulp-webp");
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

  // Удаление из css неиспользуемых стилей
// gulp.task('uncss', function () {
//   return gulp.src(paths.styles.dest)
//   .pipe(postcss([
//     uncss({
//       html: ['index.html', 'catalog.html', 'form.html']
//     })
//   ]))
// });

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
});

// Создание SVG спрайта
gulp.task('sprite', function () {
  return gulp.src('source/img/*-icon.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest("source/img"));
});

// Копирование файлов
gulp.task('copy', function  () {
  return gulp.src([
    paths.fonts.src,
    paths.images.src,
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
  // 'sprite',
  'html',
  // 'uncss'
));
