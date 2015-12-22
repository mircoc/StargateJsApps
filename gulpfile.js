
var gulp = require('gulp'),
	fs = require('fs'),
	mainBowerFiles = require('main-bower-files'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    gulpUtil = require('gulp-util'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    notifier = require('node-notifier'),
    footer = require('gulp-footer'),
 	header = require('gulp-header'),
    del = require('del'),
    webserver = require('gulp-webserver'),
    watch = require('gulp-watch'),
    argv = require('minimist')(process.argv.slice(2)),
    karma = require('karma'),
    buildConfig = require('./config/build.config'),
  	karmaConf = require('./config/karma.conf.js');


gulp.task('build:bower', function() {
	// take all bower includes and concatenate them,
	// in a file to be included before others
	return gulp.src(buildConfig.bowerFileList)
		.pipe(concat(buildConfig.bowerAllIncludes))
		.pipe(gulp.dest(buildConfig.build));
});


gulp.task('build:src:nonotify', ['build:bower'], function() {
	return gulp.src('src/**/*.js')
		.pipe(concat(buildConfig.distFile))
		.pipe(header(buildConfig.closureStart))
		.pipe(footer(buildConfig.closureEnd))
	    .pipe(jshint('.jshintrc'))
	    .pipe(jshint.reporter('jshint-stylish'))

	    // add bower include on top
	    .pipe(header(fs.readFileSync(buildConfig.build + buildConfig.bowerAllIncludes, 'utf8')))

	    // save non minified version to dist folder
	    .pipe(gulp.dest(buildConfig.dist))
		
		// save minified version	    
	    .pipe(rename({suffix: '.min'}))
	    .pipe(uglify().on('error', gulpUtil.log))
	    .pipe(header(buildConfig.banner))
	    .pipe(gulp.dest(buildConfig.dist));
});

gulp.task('build:src', ['build:src:nonotify'], function() {
	notifier.notify({ title: "Build Success", message: 'Build StargateJS completed' });
});

/*
gulp.task('demo:serve', function() {
  gulp.src('demo/www/')
    .pipe(webserver({
    	//path: 'demo/www/',
      	livereload: true,
      	fallback: 'index.html',
      	directoryListing: false,
      	open: true
    }));
});

gulp.task('demo:clean', function () {
	// delete platforms and plugins
	return del([
		'demo/platforms/',
		'demo/plugins/'
	])
	.then(function() {
		return process.chdir(cordovaTestProjectDir);
	})
	.then(function() {
		// add platform and download again plugin specified by config.xml
    	return cdv.platform('add', [testPlatform])
	});
});
*/

gulp.task('lint:jshint', function() {
	return gulp.src('src/**/*.js')

		// create temporary build for linting
		.pipe(concat(buildConfig.distFile + '.lint.tmp.js'))
		.pipe(header(buildConfig.closureStart))
		.pipe(footer(buildConfig.closureEnd))
		.pipe(gulp.dest(buildConfig.build))
	    .pipe(jshint('.jshintrc'))
	    .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
	    .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['build:src'] );
gulp.task('build', ['build:src'] );



gulp.task('lint', ['lint:jshint'] );
gulp.task('test', ['karma:singlerun'] );

/*
gulp.task('clean', ['demo:clean'] );


gulp.task('demo:run', ['build:src'], function(cb) {
    process.chdir(cordovaTestProjectDir);
    return cdv.run({platforms:[testPlatform], options:['--device']});
});
*/

gulp.task('karma', ['build'], function (done) {
	
	// default to don't do single run
	argv.singlerun && (karmaConf.singleRun = true);
	argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
	argv.reporters && (karmaConf.reporters = argv.reporters.trim().split(','));

	new karma.Server(karmaConf, done).start();
});

gulp.task('karma:singlerun', ['build'], function (done) {
	
	karmaConf.singleRun = true;
	argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
	argv.reporters && (karmaConf.reporters = argv.reporters.trim().split(','));

	new karma.Server(karmaConf, done).start();
});
