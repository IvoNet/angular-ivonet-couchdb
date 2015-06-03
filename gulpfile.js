/*
 * Copyright 2015 Ivo Woltring <webmaster@ivonet.nl>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var modulename = 'angular-ivonet-couchdb';

var gulp = require('gulp');
var karma = require('karma').server;
var $ = require('gulp-load-plugins')();

var src = {
   js: 'src/**/*.js',
   test: 'test/**/*.spec.js',
   dist: 'dist'
};

function preserveLicenseComment(node, comment) {
   return /Copyright|Apache|License/.test(comment.value);
}

gulp.task('js', function () {
   return gulp.src(src.js)
        .pipe($.concat(modulename + '.min.js'))
        .pipe($.uglify({preserveComments: preserveLicenseComment}))
        .pipe(gulp.dest(src.dist))
        .pipe($.notify({message: 'Finished minifying JavaScript'}));
});

gulp.task('karma', function (done) {
   return karma.start({
      configFile: __dirname + '/karma.conf.js',
      singleRun: true
   }, done);
});

gulp.task('karma:auto', function (done) {
   return karma.start({
      configFile: __dirname + '/karma.conf.js',
      singleRun: false
   }, done);
});

gulp.task('watch', function () {
   gulp.watch(src.js, ['js']);
});

gulp.task('dist', ['js']);
gulp.task('default', ['js']);
gulp.task('tests', [
   'karma:auto'
]);
gulp.task('test', [
   'karma'
]);
gulp.task('dev', [
   'js',
   'watch'
]);