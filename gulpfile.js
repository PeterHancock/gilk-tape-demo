var gulp = require('gulp'),
    path = require('path'),
    rimraf = require('rimraf'),
    browserify = require('browserify'),
    globby = require('globby'),
    through = require('through'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    merge = require('merge-stream'),
    path = require('path'),
    gilk = require('gilk'),
    package = require('./package'),
    reactify = require('reactify'),
    livereload = require('gulp-livereload');

var publicDir = 'build/gilk-tape-demo';

gulp.task('clean', function (done) {
    rimraf('build', done);
});

gulp.task('clean:dist', function (done) {
    rimraf('dist', done);
});

gulp.task('build', ['clean', 'dist'], function () {
    return merge(buildDocsResources(), buildDocs(), browserifyTests());
});

gulp.task('build:tests', function () {
    return merge(buildDocsResources(), buildDocs(), browserifyTests());
});

gulp.task('dist', ['clean:dist'], function() {
    function browserifyTape() {
        return browserify({ entries: 'browser/browser-tape.js', transform: [reactify] })
          .require('tape')
          .bundle()
          .pipe(source('browser-tape-bundle.js'))
          .pipe(gulp.dest('dist'));
    }
    return merge(
        gulp.src('browser/browser-tape.css').pipe(gulp.dest('dist')),
        browserifyTape()
    )
})

gulp.task('default', ['build']);

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(['tests/**.js', 'README.md', 'docs-src/**'], ['build:tests']);
    gulp.watch('browser/**', ['build']);
});

function buildDocsResources() {
    var js = gulp.src([
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/materialize/dist/js/materialize.min.js',
        'bower_components/prism/prism.js',
        'docs-src/public/*.js'
    ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest(path.join(publicDir, 'js')));
    var browserTapeJs = gulp.src([
            'dist/browser-tape-bundle.js'
        ])
        .pipe(gulp.dest(path.join(publicDir, 'js')));

    var css = gulp.src([
        'docs-src/public/*.css',
        'bower_components/materialize/dist/css/materialize.min.css'
    ])
        .pipe(concat('all.css'))
        .pipe(gulp.dest(path.join(publicDir, 'css')));
    var browserTapeCss = gulp.src([
            'dist/browser-tape.css'
        ])
        .pipe(gulp.dest(path.join(publicDir, 'css')));
    var fonts = gulp.src([
            'bower_components/materialize/dist/font/**'
        ])
        .pipe(gulp.dest(path.join(publicDir, 'font')));
    return merge([js, css, browserTapeJs, browserTapeCss, fonts]);

}

function buildDocs() {
    return gulp.src('**/*.js', {cwd: 'tests', base: 'tests'})
        .pipe(gilk({
                title: package.description,
                index: 'README.md',
                template: 'docs-src/page.tmpl',
                baseurl: '/' + package.name,
                bundle: function() {
                    var dir = path.dirname(this.srcfile),
                        name = path.basename(this.srcfile, '.js');
                    return path.join(dir, name + '-bundle.js');
                }
            }))
        .pipe(gulp.dest(publicDir));
}

function browserifyTests() {
    var rtn = through();
    globby(['tests/**.js', 'tests/**/*.js'], function(err, tests) {
      if (err) {
          throw err;
      }
      var tasks = tests.map(function (test) {
          return browserify(test)
            .exclude('tape')
            .bundle()
            .pipe(source(test))
            .pipe(rename(function (p) {
                p.dirname = path.relative('tests', p.dirname);
                p.basename += '-bundle';
            }))
            .pipe(gulp.dest(publicDir));
      });
      merge(tasks)
        .pipe(livereload())
        .pipe(rtn);
    });
    return rtn;
};
