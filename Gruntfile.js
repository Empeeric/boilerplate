module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [],
                dest: 'public/js/built.js'
            }
        },

        uglify: {
            options: {
                mangle: true
            },
            my_target: {
                files: {
                    'public/js/built.min.js': ['public/js/built.js']
                }
            }
        },

        cssmin: {
            combine: {
                files: {
                    'public/css/built.min.css': [
                        'public/css/*.css'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};