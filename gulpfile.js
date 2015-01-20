// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var del = require('del');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var es = require('event-stream');
var runSequence = require('run-sequence')

gulp.task('clean', function(cb) {
	del(['./build'], cb);
});

gulp.task('web-app', function(cb) {
	es.concat(
		gulp.src('./web/app/**/*')
			.pipe(gulp.dest('./build/js/app')),

		gulp.src('./web/appDependencies/lib/**/*')
			.pipe(gulp.dest('./build/lib')),

		gulp.src('./web/appDependencies/img/**/*')
			.pipe(gulp.dest('./build/img')),

		gulp.src('./web/index.html')
			.pipe(gulp.dest('./build'))
	).on('end', cb);
});

gulp.task('sass', function() {
	gulp.src('./web/appDependencies/sass/main.scss')
		.pipe(sass())
		.pipe(gulp.dest('./build/css'));
});

// Lint Task
gulp.task('lint', function() {
    gulp.src(['./web/app/**/*.js', './node_api/app/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('webserver', function() {
    connect.server({
        root: './build',
        port: 9001
    });
});
gulp.task('watch', function() {
	gulp.watch('./web/appDependencies/sass/**/*.scss', ['sass']);
	gulp.watch('./web/app/**/*', ['app']);
});

// Default Task
gulp.task('build-web', function() {
	runSequence('clean', ['web-app', 'sass']);
});

gulp.task('debug-web', function() {
	runSequence('clean', ['web-app', 'sass', 'watch', 'webserver']);
});