'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
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
 * @param {[type]} src [description]
 * @param {[type]} pkg Если не указан, возвращает только src
 *
 * @return Возвращает { src: src, min: min }
 */
function addPrefix(src, pkg) {
    var i, k, min;

    min = {};

    if(src.length) {
        src = src.map(function(item) {
            return dir.src + '/' + item;
        });
    }
    else {
        for(i in src) {
            if(src.hasOwnProperty(i)) {
                if(src[i].length) { // Array
                    src[i] = src[i].map(function(item) {
                        return dir.src + '/' + item;
                    })
                    if(pkg) {
                        min[i] = dir.dist + '/' + i + '/' + pkg.name.toLowerCase() + '.min.v' + pkg.version + '.' + i; // Пока только js и css
                    }
                }
                else { // Object
                    min[i] = {};
                    for(k in src[i]) {
                        if(src[i].hasOwnProperty(k) && src[i][k].length) {
                            src[i][k] = src[i][k].map(function(item) {
                                return dir.src + '/' + item;
                            });
                            if(pkg) {
                                min[i][k] = dir.dist + '/' + i + '/' + k + '.min.v' + pkg.version + '.' + i; // Пока только js и css
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

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);




    var tmp,

        pkg = grunt.file.readJSON('package.json'),

        dir = {
            src: 'dev',
            dist: 'production'
        },

        // for jasmine testing
        testable = [
            'js/Tm/util.js'
        ],

        // Исходники
        src = {
            /*
            // Может быть массивом
            js: [
                'vendor/modernizr/modernizr.js',
                'vendor/jquery/jquery.js',

                'js/Tm/util.js',
                'js/app.js'
            ],
            css: [
                'css/basic.css',
                'css/common.css',
            ],
            */

            // Или объектом
            js: {
                early: [
                    'js/Tm/util.js'
                ],
                common: [
                    'js/app.js'
                ],
                vendor: [
                    'vendor/modernizr/modernizr.js',
                    'vendor/jquery/jquery.js'
                ]
            },
            css: {
                common: [
                    // 'lib/bootstrap/css/bootstrap.css',
                    'css/basic.css',
                    'css/common.css',
                ],
            }

        },

        // Минифицированные файлы
        min = {},

        /*viewports = [
            '1920x1080', // large desktop screen
            '1280x1024', // standart desktop screen
            '1024x768',  // minimum desktop screen
            '768x1024',  // iPad
            '640x960',   // iPhone
            '320x240'    // shitty phone
        ];*/

        viewports = ['320x480','480x320','384x640','640x384','602x963','963x602','600x960','960x600','800x1280','1280x800','768x1024','1024x768'];



    tmp = addPrefix(src, pkg);
    src = tmp.src;
    min = tmp.min;

    testable = addPrefix(testable);



    grunt.initConfig({

        pkg: pkg,
        meta: {
            banner: '' +
                    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
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
                files: [
                    '<%= dir.src %>/*.html',
                    '{.tmp,<%= dir.src %>}/css/{,*/}*.css',
                    '{.tmp,<%= dir.src %>}/js/{,*/}*.js',
                    '<%= dir.src %>/i/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
                // tasks: [ 'livereload' ]
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
                            lrSnippet,
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
            dist: ['.tmp', '<%= dir.dist %>/*'],
            server: '.tmp'
        },


        /****************************************************/

        jasmine: {
            src: testable,
            options: {
                specs: 'spec/**/*.js',
                vendor: [
                  '<%= dir.src %>/vendor/jquery/jquery.js'
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            grunt: [
                'Gruntfile.js'
            ],
            src: [
                src.js
            ]
        },

        uglify: {
            /*options: {
                mangle: true,
                // beautify: true,
                banner: '<%= meta.banner %>'
            },
            main: {
                files: {
                    '<%= min_files.js %>': src.js
                }
            }*/

            early: {
                options: {
                    mangle: true,
                    beautify: false
                },
                files: {
                    '<%= min_files.js.early %>': src.js.early
                }
            },
            common: {
                options: {
                    mangle: true,
                    beautify: false
                },
                files: {
                    '<%= min_files.js.common %>': src.js.common
                }
            },
            vendor: {
                options: {
                    mangle: true,
                    beautify: false
                },
                files: {
                    '<%= min_files.js.vendor %>': src.js.vendor
                }
            }
        },

        cssmin: {
            /*main: {
                files: {
                    '<%= min_files.css %>': src.css
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
                    '<%= min_files.css.common %>': src.css.common
                }
            }
        },


        targethtml: {
            dist: {
                options: {
                    curlyTags: {
                        version: '<%= pkg.version %>'
                    }
                },
                files: {
                    '<%= dir.dist %>/index.html': '<%= dir.src %>/index.html',
                }
            }
        },


        autoshot: {
            /*default_options: {
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
            },*/

            index: {
                options: {
                    path: 'screenshots/',
                    filename: 'index',
                    type: 'png',
                    remote: 'http://localhost:<%= connect.options.port %>',
                    viewport: viewports
                }
            }
        },




        empty: {}

    });

    /****************************************************/

    grunt.registerTask('default', [
    ]);

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            // 'livereload-start',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });

    /*grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', function (target) {
        if(target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            // 'coffee:dist',
            // 'compass:server',
            'livereload-start',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });*/

    /****************************************************/

    grunt.registerTask('js', [
        // 'jshint:grunt',
        // 'jshint:src',
        // 'uglify:main'
    ]);

    grunt.registerTask('css', [
        // 'cssmin:main'
    ]);

    grunt.registerTask('build', [
        // 'js',
        // 'css'
    ]);

};
