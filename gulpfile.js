var gulp          = require('gulp'),
    uglify        = require('gulp-uglify'),
    cssnano       = require('gulp-cssnano'),
    rename        = require('gulp-rename'),
    concat        = require('gulp-concat'),
    notify        = require('gulp-notify'),
    del           = require('del'),
    templateCache = require('gulp-angular-templatecache'),
    es            = require('event-stream');


// remove the previous dist files
gulp.task('clean', function() {
    return del(['angular-material-widget-engine.min.js', 'angular-material-widget-engine.js', 'angular-material-widget-engine.min.css', 'angular-material-widget-engine.css']);
});

// build angular-material-widget-engine js files
gulp.task('js', function() {
    var js = gulp.src(['src/**/*.js', './ngMdWidgetEngineTemplates.js']);

    var template = gulp.src('src/**/templates/*.html')
    .pipe(templateCache({module: 'ngMdWidgetEngine', filename: 'ngMdWidgetEngineTemplates.js', root: "/src"}));
    
    return es.merge(template, js)
    .pipe(concat('angular-material-widget-engine.js'))
    .pipe(gulp.dest('./'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('./'))
    .pipe(notify({ message: 'JS task complete' }));
});

// build angular-material-widget-engine css files
gulp.task('css', function() {
  return gulp.src('src/**/*.css')
    .pipe(concat('angular-material-widget-engine.css'))
    .pipe(gulp.dest('./'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({zindex: false}))
    .pipe(gulp.dest('./'))
    .pipe(notify({ message: 'CSS task complete' }));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/**/*.html', ['js', 'css']);
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/**/*.js', ['js']);
});

// lets go
gulp.task('default', ['clean'], function() {
    gulp.start('js', 'css');
});