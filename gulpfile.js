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

gulp.task('app', function(cb) {
	es.concat(
		gulp.src('./app/**/*')
			.pipe(gulp.dest('./build/js/app')),

		gulp.src('./appDependencies/lib/**/*')
			.pipe(gulp.dest('./build/lib')),

		gulp.src('./appDependencies/img/**/*')
			.pipe(gulp.dest('./build/img')),

		gulp.src('index.html')
			.pipe(gulp.dest('./build'))
	).on('end', cb);
});

gulp.task('sass', function() {
	gulp.src('./appDependencies/sass/main.scss')
		.pipe(sass())
		.pipe(gulp.dest('./build/css'));
});

// Lint Task
gulp.task('lint', function() {
    gulp.src('./**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('webserver', function() {
    connect.server({
        root: './build',
        port: 9001,
        fallback: 'index.html'
    });
});
gulp.task('watch', function() {
	gulp.watch('appDependencies/sass/**/*.scss', ['sass']);
	gulp.watch('app/**/*', ['app']);
});

// Default Task
gulp.task('build', function() {
	runSequence('clean', ['app', 'sass']);
});

gulp.task('default', function() {
	runSequence('clean', ['app', 'sass', 'watch', 'webserver']);
});