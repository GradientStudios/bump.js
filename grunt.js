/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js'],
      tests: ['tests/unit/**/*.js']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },
    jshint: {
      options: {
        browser: true,
        devel: true,
        immed: false,
        evil: true,
        newcap: false,

        curly: true,
        eqeqeq: true,
        latedef: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {},
      // Specify Bump and Qunit globals for tests.
      tests: {
        globals: {
          Bump: true,

          // Custom testing functions.
          testFunc: true,
          testEnumForUniqueValues: true,
          checkTypes: true,
          epsilonNumberCheck: true,

          // QUnit's globals.
          QUnit: true,
          module: true,
          test: true,
          asyncTest: true,
          expect: true,
          start: true,
          stop: true,
          ok: true,
          equal: true,
          notEqual: true,
          deepEqual: true,
          notDeepEqual: true,
          strictEqual: true,
          notStrictEqual: true,
          raises: true
        }
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');
};
