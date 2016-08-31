'use strict';
var assemble = require('assemble');
var browserSync = require('browser-sync');
var del = require('del');
var getDest = require('./lib/plugins/get-dest');
var gulpLoadPlugins = require('gulp-load-plugins');
var merge = require('mixin-deep');
var path = require('path');
var permalinks = require('assemble-permalinks');
var useref = require('useref');
var requireDir = require('require-dir');
var viewEvents = require('./lib/plugins/view-events');
var watch = require('base-watch');
var wiredep = require('wiredep').stream;
var yaml = require('yamljs');

var app = assemble();
var $ = gulpLoadPlugins();

// Options
app.option('layout', 'templates/layouts/default.hbs');
app.option('engine', 'hbs');

// Plugins
app.use(getDest());
app.use(permalinks());
app.use(viewEvents('permalink'));
app.use(watch());
app.onPermalink(/./, function(file, next) {
  file.data = merge({}, app.cache.data, file.data);
  next();
});

// Helpers
app.helpers('./lib/helpers/*.js');

// Collections
app.create('germanPages');
app.create('englishPages');
app.germanPages.use(permalinks(':filename/index.html'));
app.englishPages.use(permalinks('en/:filename/index.html'));

// Task: Load
app.task('load', (cb) => {
  app.partials('templates/partials/{,**/}*.hbs');
  app.germanPages('templates/pages/*.hbs');
  app.englishPages('templates/pages/en/*.hbs');
  var site = yaml.load(path.join(__dirname, './templates/data/site.yml')); // Pass global data
  app.data(site);
  cb();
});

// Task: Render
app.task('render', ['load'], () => {
  return app.toStream('germanPages')
    .pipe(app.toStream('englishPages'))
    .pipe(app.renderFile())
    .pipe($.extname())
    .pipe(app.dest(function(file) {
      file.path = 'app/';
      if (file.data.permalink === 'index/index.html') {
        file.path += 'index.html'
      } else if (file.data.permalink === 'en/index/index.html') {
        file.path += 'en/index.html'
      } else {
        file.path += file.data.permalink;
      }
      file.base = path.dirname(file.path);
      return file.base;
    }))
    .pipe(browserSync.stream());
});

// Task: Serve
app.task('serve', () => {
  browserSync.init({
    notify: false,
    port: 3000,
    server: {
      baseDir: ['app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

// Task: Clean
app.task('clean', del.bind(null, [
  'app/**/*',
  '!app/scripts',
  '!app/{images,docs,fonts}',
  '!app/{images,docs,fonts}/*',
  '!app/scripts/vendor/jquery.min.js',
  '!app/*.{png,jpg,gif,xml,txt,ico}',
  '!app/.htaccess',
]));

app.task('clean:images', del.bind(null, [
  'app/images/*',
  'assets/images/*'
]));

// Task: Styles
app.task('styles', () => {
  return app.src('assets/styles/*.scss')
    .pipe(wiredep())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(app.dest('app/styles'))
    .pipe(browserSync.stream());
});

// Task: Scripts
app.task('scripts', () => {
  return app.src('assets/scripts/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(app.dest('app/scripts'))
    .pipe(browserSync.stream());
});

// Task: Images
app.task('images', () => {
  return app.src('source/*/*.{jpg,png,gif}')
    .pipe($.responsiveImages({
      'content/*.{png,jpg,gif}': [{
        width: 360,
        suffix: '-xs'
      }, {
        width: 672,
        suffix: '-sm'
      }, {
        width: 928,
        suffix: '-md'
      }, {
        width: 1258,
        suffix: '-lg'
      }, {
        width: 2048,
        suffix: '-2x'
      }]
    }))
    .pipe($.flatten())
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(app.dest('assets/images'))
    .pipe(app.dest('app/images'));
});

// Copying Tasks
app.task('copy:fonts', () => {
  return app.src('assets/fonts/*')
    .pipe(app.dest('app/fonts'));
});
app.task('copy:static', () => {
  return app.src('static/*')
    .pipe(app.dest('app'));
});
app.task('copy:docs', () => {
  return app.src('assets/docs/*')
    .pipe(app.dest('app/docs'));
});
app.task('copy:jquery', () => {
  return app.src('bower_components/jquery/dist/jquery.min.js')
    .pipe(app.dest('app/scripts/vendor'));
});
app.task('copy', ['copy:fonts', 'copy:static', 'copy:docs', 'copy:jquery']);
app.task('pre', ['images', 'copy']);

// Task: Lint
function lint(files, options) {
  return () => {
    return app.src(files)
      .pipe(browserSync.stream())
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
app.task('lint', lint('app/scripts/*.js'));

// Task: Wiredep
app.task('wiredep', () => {
  return app.src('app/**/*.html')
    .pipe(wiredep({
      exclude: ['/jquery/', '/picturefill/'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(app.dest('app'))
    .pipe(browserSync.stream());
});

// Ready for development
app.task('dev', ['clean', 'render', 'styles', 'scripts', 'wiredep']);

// Ready for production
app.task('prod', ['clean', 'render', 'styles', 'scripts', 'wiredep', 'lint'], () => {
  return app.src('app/**/*.html')
    .pipe($.useref({searchPath: ['app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(app.dest('app'));
});

// Watch
app.watch('./templates/**/*.{hbs,yml}', ['render', 'wiredep']);
app.watch('assets/scripts/*.js', ['scripts']);
app.watch('assets/styles/**/*.scss', ['styles']);

module.exports = app;
