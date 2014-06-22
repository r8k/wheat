module.exports = function(grunt) {
  grunt.initConfig({
    banner: '/*! Wheat - v0.0.1 - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> Rajiv Kilaparti <rkilaparti@apigee.com>;' +
      '  */\n',
    clean: {
      src: ['public/dist']
    },
    cssmin: {
      minify: {
        expand: true,
        cwd: 'public/stylesheets/',
        src: ['*.css', '!*.min.css'],
        dest: 'public/dist/css/',
        ext: '.min.css'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        compress: true
      },
      logs: {
        src: 'public/js/logs.js',
        dest: 'public/dist/js/logs.min.js'
      },
      socket: {
        src: 'node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
        dest: 'node_modules/socket.io/node_modules/socket.io-client/socket.io.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['clean', 'uglify', 'cssmin']);
};