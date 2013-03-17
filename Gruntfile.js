'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};


module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    var dir = {
            src: 'dev/',
            dist: 'production/'
        },

        src = {
            js: [
            ],
            css: [
            ]
        };


    src.js = src.js.map(function(item) {
        return dir.src + item;
    });
    src.css = src.css.map(function(item) {
        return dir.src + item;
    });


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        },

        dir: dir,
        min_file: {
            js: '<%= dir.dist %>js/all.min.js',
            css: '<%= dir.dist %>css/all.min.css'
        },

        /****************************************************/

        watch: {
            livereload: {
                files: [
                    '<%= dir.src %>*.html',
                    '{.tmp,<%= dir.src %>}css/{,*/}*.css',
                    '{.tmp,<%= dir.src %>}js/{,*/}*.js',
                    '<%= dir.src %>i/{,*/}*.{png,jpg,jpeg,webp}'
                ],
                tasks: [ 'livereload' ]
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'dev')
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
                            mountFolder(connect, 'production')
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


        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            grunt: [ 'Gruntfile.js' ],
            src: [ src.js ]
        },

        uglify: {
            options: {
                mangle: true,
                // beautify: true,
                banner: '<%= meta.banner %>'
            },
            my_target: {
                files: {
                    '<%= min_file.js %>': src.js
                }
            }
        },

        cssmin: {
            main: {
                files: {
                    '<%= min_file.css %>': src.css
                },
                options: {
                    banner: '<%= meta.banner %>'
                }
            }
        },



        /*copy: {
            jsall: {
                files: [
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/proaudio/mpc-all.min.js' ], dest: '/Users/ys/htdocs/mpc/cms/' }
                ]
            },
            cssextjs: {
                files: [
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/proaudio/extjs.min.css' ], dest: '/Users/ys/htdocs/mpc/cms/' }
                ]
            },
            csstriple: {
                files: [
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/proaudio/proaudio.min.css' ], dest: '/Users/ys/htdocs/mpc/cms/' },
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/videogadget/videogadget.min.css' ], dest: '/Users/ys/htdocs/mpc/cms/' },
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/mpcclub/mpcclub.min.css' ], dest: '/Users/ys/htdocs/mpc/cms/' },
                    { expand: true, cwd: '<%= dir.dist %>', src: [ 'f/discount/discount.min.css' ], dest: '/Users/ys/htdocs/mpc/cms/' }
                ]
            }
        },*/



        /*secret: grunt.file.readJSON('secret.json'),
        sftp: {
            options: {
                // privateKey: grunt.file.load("id_rsa"),
                srcBasePath: 'production/',
                path: './www/cms.mpc.ru/www/',
                host: '<%= secret.host %>',
                port: '<%= secret.port %>',
                username: '<%= secret.username %>',
                password: '<%= secret.password %>'
            },
            js: {
                files: {
                    './': '<%= min_file.js %>'
                }
            },
            css: {
                files: {
                    './': '<%= min_file.css %>'
                }
            }
        },*/


        empty: {}

    });





    grunt.registerTask('nothing', [
    ]);

    grunt.renameTask('regarde', 'watch');

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
    });

    grunt.registerTask('build', [
        'clean:dist',
        // 'coffee',
        // 'compass:dist',
        // 'useminPrepare',
        // 'imagemin',
        // 'htmlmin',
        // 'concat',
        // 'cssmin',
        // 'uglify',
        // 'copy',
        // 'usemin'
    ]);

};
