const gulp            = require('gulp'),
    fileinclude     = require('gulp-file-include'),
    minifyCSS       = require('gulp-minify-css'),
    merge           = require('merge-stream'),
    concat          = require('gulp-concat'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    browserSync     = require('browser-sync'),
    spritesmith     = require('gulp.spritesmith'),
    imagemin        = require('gulp-imagemin'),
    cache           = require('gulp-cache'),
    ghPages         = require('gulp-gh-pages'),
    csso            = require('gulp-csso'),
    clean           = require('gulp-clean'),
    del             = require('del');

    // запуск сервера
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port: "7777"
    });

    gulp.watch(['./*.html']).on('change', browserSync.reload);
    gulp.watch('./js/*.js').on('change', browserSync.reload);

    gulp.watch([
        './templates/index.html'
    ], ['fileinclude']);

    gulp.watch(['./templates/**/*.scss'], ['scss']);
});

// компіляція sass/scss в css
gulp.task('scss', function() {
    gulp.src(['./templates/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(
            scss({ outputStyle: 'expanded' })
            .on('error', gutil.log)
        )
        .on('error', notify.onError())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.stream());
});

// збірка сторінки з шаблонів
gulp.task('fileinclude', function() {
    gulp.src('./templates/index.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }).on('error', gutil.log))
        .on('error', notify.onError())
        .pipe(gulp.dest('./'))
});

// зтиснення svg, png, jpeg
gulp.task('minify:img', function() {
    // беремо всі картинки крім папки де лежать картинки для спрайту
    return gulp.src(['./image/**/*', '!./image/sprite/*'])
        .pipe(imagemin().on('error', gutil.log))
        .pipe(gulp.dest('./image/'));
});

// зтиснення css
gulp.task('minify:css', function() {
    gulp.src('./css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 30 versions'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(gulp.dest('./css/'));
});

// зтиснення js
gulp.task('minify:js', function() {
    gulp.src('./js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./js/'));
});

// зтиснення html
gulp.task('minify:html', function() {
    var opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src(['./*.html'])
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./'));
});

// видалити папку dist
gulp.task('clean', function() {
    return gulp.src('./', { read: false }).pipe(clean());
});

// створення спрайту з картинок з папки images/sprite
gulp.task('sprite', function() {
    var spriteData = gulp.src('image/sprite/*.png').pipe(
        spritesmith({
            imgName: 'sprite.png',
            cssName: '_icon-mixin.scss',
            retinaImgName: 'sprite@2x.png',
            retinaSrcFilter: ['image/sprite/*@2x.png'],
            cssVarMap: function(sprite) {
                sprite.name = 'icon-' + sprite.name;
            }
        })
    );

    var imgStream = spriteData.img.pipe(gulp.dest('image/'));
    var cssStream = spriteData.css.pipe(gulp.dest('templates/'));

    return merge(imgStream, cssStream);
});

gulp.task('sprite:svg', function() {
    gulp.src('image/sprite/*.svg')
    .pipe(svgSprite( ))
    .pipe(gulp.dest('image'));

});

gulp.task('sсss', function(){ // Создаем таск Sass
    return gulp.src('src/sсss/main.scss') // Берем источник
        .pipe(sсss().on('error', sсss.logError)) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('src/css')) // Выгружаем результата в папку app/css
        .pipe(browserSync.stream());
});



// публікація на gh-pages
gulp.task('deploy', () => 
    gulp.src('./**/*').pipe(ghPages())
);

// при виклику в терміналі команди gulp, буде запущені задачі 
// server - для запупуску сервера, 
// sass - для компіляції sass в css, тому що браузер 
// не розуміє попередній синтаксис,
// fileinclude - для того щоб з маленьких шаблонів зібрати повну сторінку
gulp.task('default', ['server', 'scss', 'fileinclude']);

// при виклику команди gulp production
// будуть стиснуті всі ресурси в папку public
// після чого командою gulp deploy їх можна опублікувати на github
gulp.task('production', ['minify:html', 'minify:css', 'minify:js', 'minify:img']);
