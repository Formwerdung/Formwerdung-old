'use strict';
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var fs = require('fs');

var $ = gulpLoadPlugins();

gulp.task('deploy:subtree', () => {
  return gulp.src('app')
    .pipe($.subtree());
});

gulp.task('deploy:rsync', () => {
  if (fs.existsSync('./sshconfig.json')) {
    var deployConfig = require('./sshconfig.json');
    return gulp.src('app/**')
      .pipe($.rsync({
        root: 'app',
        hostname: deployConfig.hostname,
        username: deployConfig.username,
        destination: deployConfig.destination,
        progress: true
      }))
  } else {
    console.log('sshconfig.json config file not found');
  };
});
