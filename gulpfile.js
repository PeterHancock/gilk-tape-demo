var gulp = require('gulp'),
    path = require('path'),
    rimraf = require('rimraf'),
    browserify = require('browserify'),
    globby = require('globby'),
    through = require('through'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    path = require('path'),
    gilk = require('gilk'),
    package = require('./package'),
    reactify = require('reactify');

var publicDir = 'build/public';

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
    gulp.watch('tests/**.js', ['build:tests']);
});

function buildDocsResources() {
    return merge([
        gulp.src([
                'bower_components/prism/prism.js',
                'docs-src/public/*'
            ])
            .pipe(gulp.dest(publicDir)),
        gulp.src([
                'dist/*'
            ])
            .pipe(gulp.dest(path.join(publicDir, 'browser-tape'))),
        gulp.src([
                'bower_components/materialize/dist/*/**'
            ])
            .pipe(gulp.dest(path.join(publicDir, 'materialize'))),
        gulp.src([
                'bower_components/jquery/dist/**'
            ])
            .pipe(gulp.dest(path.join(publicDir, 'jquery')))
        ]);
}

function buildDocs() {
    return gulp.src('**/*.js', {cwd: 'tests', base: 'tests'})
        .pipe(gilk({
                title: package.description,
                index: 'README.md',
                template: 'docs-src/page.tmpl',
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
            .pipe(gulp.dest('build/public'));
      });
      merge(tasks).pipe(rtn);
    });
    return rtn;
};
