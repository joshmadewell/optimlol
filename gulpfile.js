// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
var webserver = require('gulp-webserver')

// Lint Task
gulp.task('lint', function() {
    return gulp.src('./**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('webserver', function() {
    gulp.src('./')
        .pipe(webserver({
            port: 9001
        }))
});

// Default Task
gulp.task('build', []);
gulp.task('default', ['webserver']);