/*
 * Copyright 2015 ivonet
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

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

var modulename = 'angular-ivonet-couchdb';

var src = {
   js: 'src/**/*.js',
   test: 'test/**/*.spec.js',
   dist: 'dist'
};

gulp.task('js', function () {
   return gulp.src(src.js)
        .pipe(concat(modulename + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(src.dist))
        .pipe(notify({message: 'Finished minifying JavaScript'}));
});

gulp.task('watch', function () {
   gulp.watch(src.js, ['js']);
});

gulp.task('dist', ['js']);
gulp.task('default', [
   'js',
   'watch'
]);