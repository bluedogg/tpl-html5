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


/**
 * Пробежим по src и добавим в путь префикс dir.src/
 * и создадим список минифицированных результирующих файлов
 *
 * @param {[type]} dir [description]
 * @param {[type]} src [description]
 * @param {[type]} pkg Если не указан, возвращает только src
 *
 * @return Возвращает { src: src, min: min }
 */
function addPrefix(dir, src, pkg, dist_name) {
    var i, k, j, min;

    min = {};

    dist_name || (dist_name = 'dist');

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
                        min[i] = dir[dist_name] + '/' + i + '/' + pkg.name.toLowerCase() + '.min.v' + pkg.version + '.' + i; // Пока только js и css
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
                                min[i][k] = dir[dist_name] + '/' + i + '/' + k + '.min.v' + pkg.version + '.' + i; // Пока только js и css
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



module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);

    // grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);




    var tmp,

        pkg = grunt.file.readJSON('component.json'),

        dir = {
            src: 'dev',
            dist: 'dist',
            dist_public: 'production/public',
        },

        // for jasmine testing
        testable = [
            'js/Tm/util.js',
        ],

        // Исходники
        src = {
            /*
            // Может быть массивом
            js: [
                'vendor/modernizr/modernizr.js',
                'vendor/jquery/jquery.js',

                'js/Tm/util.js',
                'js/app.js',
            ],
            css: [
                'css/basic.css',
                'css/main.css',
            ],
            */

            // Или объектом
            js: {
                early: [
                    'js/Tm/util.js',
                ],
                common: [
                    'js/app.js',
                ],
            },
            css: {
                common: [
                    // 'lib/bootstrap/css/bootstrap.css',
                    'css/basic.css',
                    'css/main.css',
                ],
            }

        },

        // Минифицированные файлы
        min = {}, // автоматом добавляется в addPrefix(), если не задано

        /*viewports = [
            '1920x1080', // large desktop screen
            '1280x1024', // standart desktop screen
            '1024x768',  // minimum desktop screen
            '768x1024',  // iPad
            '640x960',   // iPhone
            '320x240'    // shitty phone
        ];*/

        viewports = ['320x480','480x320','384x640','640x384','602x963','963x602','600x960','960x600','800x1280','1280x800','768x1024','1024x768'];



    //tmp = addPrefix(dir, src, pkg, 'dist_public');
    tmp = addPrefix(dir, src, pkg);
    src = tmp.src;
    min = tmp.min;

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
        min_files: min,

        /****************************************************/

        watch: {
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                // tasks: ['jshint'],
                files: [
                    '{.tmp,<%= dir.src %>}/{,**}/*.html',
                    '{.tmp,<%= dir.src %>}/css/{,**/}*.css',
                    '{.tmp,<%= dir.src %>}/js/{,**/}*.js',
                    // '<%= dir.src %>/i/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
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
                            mountFolder(connect, '.tmp'),
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
                '.tmp',
                '<%= dir.dist %>/*',
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
            src: src.js,

            grunt: {
                options: {
                    '-W097': true,
                    '-W070': true,
                    '-W117': true,
                },
                src: ['Gruntfile.js']
            },
        },


        jscs: {
            common: {
                options: {
                    config: ".jscs.json",
                },
                src: '<%= dir.src %>/js/**'
                /*files: {
                    src: src.js
                    // src: '<%= min_files.js %>'
                }*/
            }
        },



        /* Тесты *********************/

        jasmine: {
            src: testable,
            options: {
                specs: 'spec/**/*.js',
                vendor: [
                    '<%= dir.src %>/vendor/jquery/jquery.js',
                ]
            }
        },



        /* Минификация *********************/

        uglify: {
            options: {
                banner: '<%= meta.banner %>',
                mangle: true,
                beautify: false
            },
            /*all: {
                files: {
                    '<%= min_files.js %>': src.js
                }
            },*/

            early: {
                options: {
                },
                files: {
                    '<%= min_files.js.early %>': src.js.early,
                }
            },
            common: {
                options: {
                },
                files: {
                    '<%= min_files.js.common %>': src.js.common,
                }
            },
        },


        cssmin: {
            /*all: {
                files: {
                    '<%= min_files.css %>': src.css,
                },
                options: {
                    banner: '<%= meta.banner %>'
                }
            }*/

            common: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= min_files.css.common %>': src.css.common,
                }
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
                    cwd: '<%= dir.src %>',
                    src: [
                        '**/*.html',
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


        // Чистит результирующий html
        htmlmin: {
            dist: {
                options: {
                    // removeComments: true,
                    // collapseWhitespace: true,
                    // collapseBooleanAttributes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>',
                    src: '**/*.html',
                    dest: '<%= dir.dist %>'
                }]
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
                dest: '<%= dir.dist_public %>',
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
                    dest: '<%= dir.dist_public %>',
                    filter: 'isFile'
                    // filter: 'isDirectory'
                }]
            },
        },






        secret: grunt.file.readJSON('secret.json'),

        ftpush_auth: {
            host: '<%= secret.host %>',
            port: '<%= secret.port %>',
            authKey: '[key]' // .ftppass
        },

        ftpush: {
            js: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.dist_public %>/js',
                dest: '/[dir]/public_html/js',
                simple: true,
                exclusions: [
                    '**/.DS_Store'
                ]
            },
            css: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.dist_public %>/css',
                dest: '/[dir]/public_html/css',
                simple: true,
                exclusions: [
                    '**/.DS_Store'
                ]
            },
            html: {
                auth: '<%= ftpush_auth %>',
                src: '<%= dir.dist_public %>/css',
                dest: '/[dir]/public_html',
                simple: true,
                exclusions: [
                    'css', 'js', 'vendor', 'lib'
                ]
            },

            /* For Zend FW 1.x MVC Application */
            // components: {
                // auth: '<%= ftpush_auth %>',
                // src: './',
                // dest: '/[dir]',
                // simple: true,
                // exclusions: [
                    // '**/.DS_Store', 'Gruntfile.js', '.*', 'package.json', 'secret.json', '.git', 'application', 'data', 'library', 'node_modules', 'production', 'public'
                // ]
            // },
            // application: {
                // auth: '<%= ftpush_auth %>',
                // src: 'application',
                // dest: '/[dir]/application',
                // simple: true,
                // exclusions: [
                    // '**/.DS_Store'
                // ]
            // },
            // library: {
                // auth: '<%= ftpush_auth %>',
                // src: 'library',
                // dest: '/[dir]/library',
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



        empty: {}

    });

    /****************************************************/

    grunt.registerTask('default', [
    ]);

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
            // 'livereload-start',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });

    /****************************************************/

    grunt.registerTask('js', [
        'newer:jshint',
        'newer:jscs',
        'newer:uglify',
        'newer:uglify',
    ]);

    grunt.registerTask('css', [
        'newer:cssmin',
    ]);

    grunt.registerTask('html', [
        'newer:targethtml',
        'newer:htmlmin',
    ]);

    grunt.registerTask('build', [
        'js',
        'css',
        'html',
    ]);

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
