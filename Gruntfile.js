module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        typescript: {
            default: {
                src: [ 'src/**/*.ts' ],
                dest: 'dist/',
                options: {
                    base_path: 'src/'
                }
            }
        },

        'gh-pages': {
            options: {
                base: 'dist'
            },
            src: ['**']
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('default', [ 'typescript' ]);
    grunt.registerTask('publish', [ 'typescript' ]);
};
