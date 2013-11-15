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
        }
    });

    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', [ 'typescript' ]);
};
