var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sassLint = require('gulp-sass-lint'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    svgSprite = require("gulp-svg-sprites"),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

 //browser-sync task for starting the server.
gulp.task('browser-sync', ['watch'], function() {
    //watch files
    var files = [
        //update this for all theme base files
        './style.css',
        './*.html'
    ];
    //initialize browsersync
	browserSync.init(files,{
		server: {
			baseDir: "./dist"
		}
	});
	/* USE THIS IF YOU ARE USING GULP FOR COMPILATION ON AN IIS or WORDPRESS SITE*/
    /*browserSync.init(files, {
        //browsersync with a php server - change this to your wordpress localhost from WAMP
        proxy: "localhost:8088/pantheon",
        notify: false
    });*/


});

//For error handling
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var plumberErrorHandler = {
    errorHandler: notify.onError({
        title: 'Gulp',
        message: 'Error: <%= error.message %>'
    })
};

//Sass compile
gulp.task('sass', ['sass-lint'], function() {
	//main css
    gulp.src('./src/scss/*.scss')
        .pipe(plumber(plumberErrorHandler))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'))
		.pipe(reload({ stream: true}));

});

gulp.task('vendor-sass', function() {
    gulp.src('./src/vendor/scss/**/*.s+(a|c)ss')
        .pipe(plumber(plumberErrorHandler))
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest('./css'))
        .pipe(reload({
            stream: true
        }));
});

//lint custom Sass
gulp.task('sass-lint', function() {
    return gulp.src('./src/sass/**/*.s+(a|c)ss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
});

//JS concat and lint
gulp.task('js', function() {
    gulp.src('./src/js/**/*.js')
        .pipe(plumber(plumberErrorHandler))
        .pipe(jshint())
        .pipe(jshint.reporter('fail'))
        .pipe(concat('js/theme.js'))
        .pipe(gulp.dest('./'))
        .pipe(reload({
            stream: true
        }));

    gulp.src('./src/vendor/js/**/*.js')
        .pipe(plumber(plumberErrorHandler))
        .pipe(concat('js/vendors.js'))
        .pipe(gulp.dest('./'))
        .pipe(reload({
            stream: true
        }));
});

/* Build spritesheets.
* Take individual svg sprites - creates Sass file for use in site.
*/
gulp.task('sprite', function() {
	//main site sprites
    gulp.src('./src/sprites/*.svg')
        .pipe(svgSprite({
            shape: {
                spacing: {
                    padding: 5
                }
            },
            svg: {
                namespaceIDs: true, // Add namespace token to all IDs in SVG shapes
                namespaceClassnames: true, // Add namespace token to all CSS class names in SVG shapes
            },
            cssFile: "src/scss/shared/_sprite.scss",
            selector: "icon-%f",
        }))
        .pipe(gulp.dest("./src"));


});

//image optimisation for assets uploaded in the dashboard.
gulp.task('img', function() {
    gulp.src('src/images/**/*.{png,jpg,gif}')
        .pipe(plumber(plumberErrorHandler))
        .pipe(imagemin({
            optimizationLevel: 7,
            progressive: true
        }))
        .pipe(gulp.dest('./dest/images'))
        .pipe(reload({
            stream: true
        }));
});

/*BUILD ONLY TASKS */

gulp.task('smush', function() {
	//minify css main
	gulp.src('css/*.css')
        .pipe(cleanCSS({
            debug: true
        	}, function(details) {
            	console.log(details.name + ': ' + details.stats.originalSize);
            	console.log(details.name + ': ' + details.stats.minifiedSize);
        	})
		)
        .pipe(gulp.dest('./build/css'));

    //minify js
	gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'));

});

//watch for updates rebuild as required
gulp.task('watch', ['compile'],  function() {
    gulp.watch('src/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('./src/vendor/js/**/*.js', ['js'])
    gulp.watch('src/images/**/.{png,jpg,gif}', ['img']);
    gulp.watch('./src/sprites/*.*', ['sprite']);
    gulp.watch('./src/vendor/scss/**/*.s+(a|c)ss', ['vendor-sass']);
});

gulp.task('compile', ['sprite', 'img', 'sass', 'vendor-sass', 'js']);

gulp.task('default', ['browser-sync']);

gulp.task('build', ['smush']);
