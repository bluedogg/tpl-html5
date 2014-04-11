'use strict';

var LIVERELOAD_PORT = 35729;
var liveReloadSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};


// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'


module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);

    // grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);



    /**
     * Пробежим по src и добавим в путь префикс dir.src/
     * и создадим список минифицированных результирующих файлов
     *
     * @param {[type]} dir [description]
     * @param {[type]} src [description]
     * @param {[type]} pkg Если не указан, возвращает только src
     * @param {[type]} distName Ключ dist-директории (dist, distPublic...)
     *
     * @return Возвращает { src: src, min: min }
     */
    function addPrefix(dir, src, pkg, distName) {
        var i, k, j, min;

        min = {};

        distName || (distName = 'dist');

        if(src.length) {
            src = src.map(function(item) {
                return dir.src + '/' + item;
            });
        }
        else {
            for(i in src) {
                if(src.hasOwnProperty(i)) {
                    if(src[i].length) { // Array
                        for(j = 0; j < src[i].length; j++) {
                            src[i][j] = dir.src + '/' + src[i][j];
                        }
                        /*src[i] = src[i].map(function(item) {
                            return dir.src + '/' + item;
                        })*/
                        if(pkg) {
                            min[i] = dir[distName] + '/' + i + '/' + pkg.name.toLowerCase() + '.min.v' + pkg.version + '.' + i; // Пока только js и css
                        }
                    }
                    else { // Object
                        min[i] = {};
                        for(k in src[i]) {
                            if(src[i].hasOwnProperty(k) && src[i][k].length) {
                                for(j = 0; j < src[i][k].length; j++) {
                                    src[i][k][j] = dir.src + '/' + src[i][k][j];
                                }
                                /*src[i][k] = src[i][k].map(function(item) {
                                    return dir.src + '/' + item;
                                });*/
                                if(pkg) {
                                    min[i][k] = dir[distName] + '/' + i + '/' + k + '.min.v' + pkg.version + '.' + i; // Пока только js и css
                                }
                            }
                        }
                    }
                }
            }
        }

        return (pkg ? {
            src: src,
            min: min
        } : src);
    }





    var config = grunt.file.readJSON('grunt-config.json');

    var pkg = grunt.file.readJSON('component.json');

    /*var viewports = [
        '1920x1080', // large desktop screen
        '1280x1024', // standart desktop screen
        '1024x768',  // minimum desktop screen
        '768x1024',  // iPad
        '640x960',   // iPhone
        '320x240'    // shitty phone
    ];*/
    var viewports = ['320x480','480x320','384x640','640x384','602x963','963x602','600x960','960x600','800x1280','1280x800','768x1024','1024x768'];

    var dir = config.dir;

    // for jasmine testing
    var testable = config.testable;

    // Исходники
    var src = config.src;




    //tmp = addPrefix(dir, src, pkg, 'distPublic');
    var tmp = addPrefix(dir, src, pkg);
    src = tmp.src;

    // Минифицированные файлы. Автоматом добавляются в addPrefix(), если не заданы
    var min = tmp.min || {};

    testable = addPrefix(dir, testable);

    grunt.initConfig({

        pkg: pkg,
        meta: {
            banner: '' +
                    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.authors %>;' +
                    ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        },


        dir: dir,
        min: min,
        src: src,

        /****************************************************/

        watch: {
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT,
                    // atBegin: true,
                    nospawn : true,
                    // reload: true, // Автоматом перезапускает таск, при изменении Gruntfile.js
                },
                // tasks: ['includereplace:livereload'],
                files: [
                    // 'Gruntfile.js',
                    // '{.tmp,<%= dir.src %>}/{,**}/*.html',
                    // '{.tmp,<%= dir.src %>}/css/{,**/}*.css',
                    // '{.tmp,<%= dir.src %>}/js/{,**/}*.js',
                    '<%= dir.src %>/{,**}/*.html',
                    '<%= dir.src %>/css/{,**/}*.css',
                    '<%= dir.src %>/js/{,**/}*.js',
                ]
            }
        },

        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
                // hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            liveReloadSnippet,
                            mountFolder(connect, '.tmp/' + dir.src),
                            mountFolder(connect, dir.src)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, dir.dist)
                        ];
                    }
                }
            }
        },

        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },

        clean: {
            dist: [
                '<%= dir.dist %>/*',
            ],
            distVendor: [
                '<%= dir.dist %>/vendor/*',
            ],
            server: '.tmp'
        },


        /****************************************************/

        /* Валидация *********************/

        jshint: {
            options: {
                "globals": {
                    "jQuery": true,
                    "node": true
                },
                "asi": true,
                "laxcomma": true,
                "expr": true,
                "boss": true,
                "proto": true,
            },
            src: '<%= dir.src %>/js/{,**/}*.js',
            // src: '<%= src.js.common %>',

            separately: '<%= dir.src %>/<%= dir.srcSeparately.js %>/{,**/}*.js',

            grunt: {
                options: {
                    '-W097': true,
                    '-W070': true,
                    '-W117': true,
                },
                src: ['Gruntfile.js']
            },
        },


        // Lint inline JS
        inlinelint: {
            all: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>',
                    src: [
                        '**/*.html',
                        '!inc/**',
                        '!vendor/**',
                        '!lib/**',
                    ],
                }]
            }
        },


        jscs: {
            common: {
                options: {
                    config: ".jscs.json",
                },
                src: '<%= dir.src %>/js/{,**/}*.js'
            },

            separately: {
                options: {
                    config: ".jscs.json",
                },
                src: '<%= dir.src %>/<%= dir.srcSeparately.js %>/{,**/}/*.js'
            }
        },


        htmlhint: {
            htmlhintrc: '.htmlhintrc',
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>',
                    src: [
                        '**/*.html',
                        '!inc/**',
                        '!vendor/**',
                        '!lib/**',
                    ],
                }]
            },
        },



        /* Тесты *********************/

        jasmine: {
            options: {
                specs: 'spec/**/*.js',
                display: 'short',
                vendor: [
                    '<%= dir.src %>/vendor/jquery/jquery.js',
                ]
            },
            src: testable,
        },



        /* Минификация *********************/

        uglify: {
            options: {
                banner: '<%= meta.banner %>',
                mangle: true,
                beautify: false,
                compress: {
                    drop_console: true
                }
            },
            /*all: {
                files: {
                    '<%= min.js %>': '<%= src.js %>''
                }
            },*/

            /*early: {
                options: {
                },
                files: {
                    '<%= min.js.early %>': '<%= src.js.early %>',
                }
            },*/
            common: {
                options: {
                },
                files: {
                    '<%= min.js.common %>': '<%= src.js.common %>',
                }
            },

            separately: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>/<%= dir.srcSeparately.js %>',
                    src: '{,**/}*.js',
                    dest: '<%= dir.dist %>/<%= dir.srcSeparately.js %>',
                    ext: '.min.js',
                    extDot: 'last'
                }]
            },

            vendor: {
                options: {
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>',
                    src: 'vendor/{,**/}*.js',
                    dest: '<%= dir.dist %>',
                    ext: '.min.js',
                    extDot: 'last'
                }],
            },
        },


        cssmin: {
            /*all: {
                files: {
                    '<%= min.css %>': '<%= src.css %>',
                },
                options: {
                    banner: '<%= meta.banner %>'
                }
            },*/

            common: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= min.css.common %>': '<%= src.css.common %>',
                }
            },

            separately: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>/<%= dir.srcSeparately.css %>',
                    src: '{,**/}*.css',
                    dest: '<%= dir.dist %>/<%= dir.srcSeparately.css %>',
                    ext: '.min.css',
                    extDot: 'last'
                }]
            },

            vendor: {
                options: {
                    banner: ''
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>',
                    src: 'vendor/{,**/}*.css',
                    dest: '<%= dir.dist %>',
                    ext: '.min.css',
                    extDot: 'last'
                }],
            },
        },


        includereplace: {
            options: {
                prefix: '<!-- @@',
                suffix: ' -->',
                includesDir: '<%= dir.src %>/inc/',
            },
            livereload: {
                files: {
                    '.tmp/': '<%= dir.src %>/*.html'
                }
            },
            livereloadComplete: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>',
                    src: [
                        '**/*.html',
                        '!inc/**',
                        '!vendor/**',
                        '!lib/**',
                    ],
                    dest: '.tmp/<%= dir.src %>'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.src %>',
                    src: [
                        '**/*.html',
                        '!inc/**',
                        '!vendor/**',
                        '!lib/**',
                    ],
                    dest: '<%= dir.dist %>'
                }]
            }
        },



        targethtml: {
            dist: {
                options: {
                    curlyTags: {
                        version: '<%= pkg.version %>',
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>',
                    src: [
                        '**/*.html',
                        '!inc/**',
                        '!vendor/**',
                        '!lib/**',
                    ],
                    dest: '<%= dir.dist %>'
                }]
                /*files: {
                    '<%= dir.dist %>/index.html': '<%= dir.src %>/index.html',
                }*/
            }
        },





        bower: {
            dev: {
                dest: '<%= dir.dist %>/vendor',
                js_dest: '<%= dir.dist %>/vendor/js',
                css_dest: '<%= dir.dist %>/vendor/css',
                options: {
                    packageSpecific: {
                        bootstrap: {
                            dest: '<%= dir.dist %>/vendor/fonts',
                            css_dest: '<%= dir.dist %>/vendor/css'
                        },
                    }
                }
            }
        },


        bootstrap: {
            dest: '<%= dir.src %>/vendor/bootstrap-custom',
            js: [
                // 'bootstrap-affix.js',
                // 'bootstrap-alert.js',
                'bootstrap-button.js',
                // 'bootstrap-carousel.js',
                // 'bootstrap-collapse.js',
                'bootstrap-dropdown.js',
                'bootstrap-modal.js',
                // 'bootstrap-popover.js',
                // 'bootstrap-scrollspy.js',
                // 'bootstrap-tab.js',
                // 'bootstrap-tooltip.js',
                // 'bootstrap-transition.js',
                // 'bootstrap-typeahead.js',
            ],
            css: [
                'accordion.less',
                'alerts.less',
                'breadcrumbs.less',
                'button-groups.less',
                'buttons.less',
                'carousel.less',
                'close.less',
                'code.less',
                'component-animations.less',
                'dropdowns.less',
                'forms.less',
                'grid.less',
                'hero-unit.less',
                'labels-badges.less',
                'layouts.less',
                'media.less',
                'modals.less',
                'navbar.less',
                'navs.less',
                'pager.less',
                'pagination.less',
                'popovers.less',
                'progress-bars.less',
                'reset.less',
                'responsive-1200px-min.less',
                'responsive-767px-max.less',
                'responsive-768px-979px.less',
                'responsive-navbar.less',
                'responsive-utilities.less',
                'scaffolding.less',
                'sprites.less',
                'tables.less',
                'thumbnails.less',
                'tooltip.less',
                'type.less',
                'utilities.less',
                'wells.less',
            ]
        },



        symlink: {
            // Enable overwrite to delete symlinks before recreating them
            options: {
                overwrite: false
            },
            // The "build/target.txt" symlink will be created and linked to
            // "source/target.txt". It should appear like this in a file listing:
            // build/target.txt -> ../source/target.txt
            // Явное указание путей
            /*explicit: {
                src: '<%= dir.dist %>/{js,css}/**',
                dest: '<%= dir.distPublic %>',
                // filter: 'isFile'
            },*/
            // These examples using "expand" to generate src-dest file mappings:
            // http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically
            expanded: {
                // Создает симлинки в [dest] на все собранные файлы, найденные в [src] и её детях
                files: [{
                    expand: true,
                    overwrite: false,
                    cwd: '<%= dir.dist %>',
                    src: ['js/**', 'css/**'], // [dir.dist] -> /js/**, /css/**
                    dest: '<%= dir.distPublic %>',
                    filter: 'isFile'
                    // filter: 'isDirectory'
                }]
            },
        },





        /* Деплой ***************/

        secret: grunt.file.readJSON('secret.json'),

        ftpush_auth: {
            host: '<%= secret.host %>',
            port: '<%= secret.port %>',
            authKey: '[key]' // .ftppass
        },

        ftpush: {
            js: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.distPublic %>/js',
                dest: '<%= dir.remoteApp %>/<%= dir.remotePublic %>/js',
                simple: true,
                exclusions: [
                    '**/.DS_Store'
                ]
            },
            css: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.distPublic %>/css',
                dest: '<%= dir.remoteApp %>/<%= dir.remotePublic %>/css',
                simple: true,
                exclusions: [
                    '**/.DS_Store'
                ]
            },
            html: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.distPublic %>/css',
                dest: '<%= dir.remoteApp %>/<%= dir.remotePublic %>',
                simple: true,
                exclusions: [
                    'css', 'js', 'vendor', 'lib'
                ]
            },

            /* For Zend FW 1.x MVC Application */
            // components: {
                // auth: '<%= ftpush_auth %>',
                // src: './',
                // dest: '<%= dir.remoteApp %>',
                // simple: true,
                // exclusions: [
                    // '**/.DS_Store', 'Gruntfile.js', '.*', 'package.json', 'secret.json', '.git', 'application', 'data', 'library', 'node_modules', 'production', 'public'
                // ]
            // },
            // application: {
                // auth: '<%= ftpush_auth %>',
                // src: 'application',
                // dest: '<%= dir.remoteApp %>/application',
                // simple: true,
                // exclusions: [
                    // '**/.DS_Store'
                // ]
            // },
            // library: {
                // auth: '<%= ftpush_auth %>',
                // src: 'library',
                // dest: '<%= dir.remoteApp %>/library',
                // simple: true,
                // exclusions: [
                    // '**/.DS_Store', '.git', '.svn', '.ZendFramework*'
                // ]
            // },
        },




        uncss: {
            dist: {
                options: {
                    // ignore       : ['#added_at_runtime', /test\-[0-9]+/],
                    media        : [
                        // '(min-width: 700px) handheld and (orientation: landscape)',
                        // 'print',
                    ],
                    // csspath      : '../public/css/',
                    // raw          : 'h1 { color: green }',
                    // stylesheets  : ['lib/bootstrap/dist/css/bootstrap.css', 'src/public/css/main.css'],
                    ignoreSheets : [/fonts.googleapis/],
                    // urls         : ['http://localhost:3000/mypage', '...'], // Deprecated
                    // timeout      : 1000,
                    // htmlroot     : 'public',
                    // report       : 'min'
                },
                files: {
                    'dev/css/uncss-clean.css': [
                        'dev/*.html',
                    ]
                }
            }
        },


        /*autoshot: {
            default_options: {
                options: {
                    // necessary config
                    path: 'screenshots/',
                    filename: '',
                    type: 'PNG',
                    // optional config, must set either remote or local
                    remote: 'http://localhost:<%= connect.options.port %>',
                    // local: { path: 'dev/index.html', port: '9001' },
                    viewport: viewports
                },
            },

            index: {
                options: {
                    path: 'screenshots/',
                    filename: 'index',
                    type: 'png',
                    remote: 'http://localhost:<%= connect.options.port %>',
                    viewport: viewports
                }
            }
        },*/



        // Сохраняет в переменную [property] текущую git-ревизию. Usage: <%= meta.revision %>
        revision: {
            options: {
                property: 'meta.revision',
                ref: 'HEAD',
                short: true
            }
        },


        empty: {}

    });



    /****************************************************/

    grunt.registerTask('default', [
    ]);

    /****************************************************/

    grunt.registerTask('server', function(target) {
        if(target === 'dist') {
            return grunt.task.run([
                'build',
                'open',
                'connect:dist:keepalive'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'includereplace:livereload',
            'connect:livereload',
            'open:server',
            'watch'
        ]);

        grunt.event.on('watch', function(action, filepath, target) {
            grunt.log.writeln(target + ': ' + filepath + ' has ' + action);

            // Был измененен инклюд, пересоберём все html
            if(grunt.file.isMatch(dir.src + '/inc/*.html', filepath)) {
                grunt.task.run([
                    'includereplace:livereloadComplete'
                ]);
            }
            // Просто html-ка, пересоберём только её
            else {
                grunt.config('includereplace.livereload.files', {'.tmp/': filepath});
                grunt.task.run([
                    'includereplace:livereload'
                ]);
            }
        });
    });

    /****************************************************/

    grunt.registerTask('js', [
        'newer:jshint',
        'newer:jscs',
        'newer:jasmine',
        // 'newer:uglify:early',
        'newer:uglify:common',
        //'newer:uglify:separately',
    ]);

    grunt.registerTask('css', [
        'newer:cssmin:common',
        //'newer:cssmin:separately',
    ]);

    grunt.registerTask('html', [
        'newer:inlinelint',
        'newer:htmlhint',
        'newer:includereplace:dist',
        'newer:targethtml',
    ]);

    grunt.registerTask('build', function(target) {
        var tasks = [];

        if(target === 'vendor') {
            tasks = tasks.concat([
                'clean:distVendor',
                'bower',
                'uglify:vendor',
                'cssmin:vendor',
            ]);
        }
        else {
            tasks = tasks.concat([
                'js',
                'html',
                'css',
            ]);

            /*if(target == 'public') {
                tasks = tasks.concat([
                ]);
            }*/
        }

        return grunt.task.run(tasks);
    });

    /*grunt.registerTask('deploy-front', [
        'ftpush:components',
        'ftpush:js',
        'ftpush:css',
        // 'ftp-deploy',
    ]);

    grunt.registerTask('deploy-back', [
        'ftpush:application',
        'ftpush:library',
    ]);

    grunt.registerTask('deploy', [
        'deploy-front',
        'deploy-back',
    ]);*/

};
