var gulp = require('gulp'),
    qunit = require('gulp-qunit');

gulp.task('default', function() {
});

gulp.task('test', function() {
    return gulp.src('./test/*.html').pipe(qunit());
});
