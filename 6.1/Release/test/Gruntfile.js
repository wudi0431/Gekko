/*'use strict';
module.exports = function (grunt) {
    var jsdom, doc, window;

    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            bdd: {
                options: {
                    reporter: 'spec'
                },
                src: ['<%= pkg.name%>/model/*.js']
            }
        }
    };
    grunt.initConfig(gruntConfig);

    //用例头文件 加载
    var _compile = module.__proto__._compile;
    module.__proto__._compile = function (content, filename) {
        if (filename.indexOf('testcases') > -1) {
            content = grunt.file.read('case_header.js') + content;
        }
        _compile.call(this, content, filename);
    };

    grunt.loadNpmTasks('grunt-mocha-test');


    

    grunt.registerTask('default', 'mochaTest');
};*/


'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),    
    mocha_phantomjs: {
      options: {
        'reporter': 'xunit',
        'output': 'result.xml'
      },
      all: ['runner.html']
    }
    
  });  
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.registerTask('default', [ 'mocha_phantomjs']);
};
