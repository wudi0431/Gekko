/**
 * Created by shbzhang on 13-11-21.
 */
module.exports = function (grunt) {

  var path = require('path');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    config: {
      srcDir:  '<%= pkg.channels["app"].path%>',
      destDir: '<%= pkg.channels["app"].path%>/dest',
      channel: 'app',
      cfgFile: './webapp2hybrid/busbu.json'
    },

    /**
     * 清空任务
     */
    clean: {
      options: { force: true },
      main:    '<%= config.destDir%>'
    },

    /**
     * 复制任务
     */
    "copy": {
      //web任务，copy sbu目录下的html,样式图片至sbu/dest目录
      "web_sbu":     {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir %>",
            "src":    ["**/*.html", "res/**/*.*"],
            "dest":   "<%= config.destDir %>"
          }
        ]
      },
      //hybrid任务,copy sbu目录下的样式,图片至out/webapp/sbu目录
      "app_sbu":     {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir %>",
            "src":    ["assistant/**/*.*", "res/**/*.*"],
            "dest":   "<%= config.destDir %>"
          }
        ]
      },
      //hybrid任务,复制res目录下文件至图片至out/webapp/res目录
      "app_res":     {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir%>/",
            "src":    ["images/*.*", "img/*.*", "libs/*.*", "style/*.*"],
            "dest":   "<%= config.destDir%>/"
          }
        ]
      },
      //hybrid任务,复制各个版本的common.js
      "app_app":     {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir%>/",
            "src":    ["*/hybrid/*.js" ],
            "dest":   "<%= config.destDir%>/"
          }
        ]
      },
      // hybrid任务,复制1.0版本的common.js,保持向下兼容
      "app_app_1.0": {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir%>/1.0//hybrid",
            "src":    ["*.js" ],
            "dest":   "<%= config.destDir%>/"
          }
        ]
      },
      //直接复制zip包
      "zip":         {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir.replace('webapp', '') %>",
            "src":    ["*.zip"],
            "dest":   "<%= pkg.appOutDir %>/zip"
          }
        ]
      }
    },

    /**
     * js文件迷你化
     */
    "uglify": {
      "main": {
        "options": {
          "report":   "false",
          "beautify": grunt.option('debug'),
          "compress": !grunt.option('debug'),
          "mangle":   {
            "except": ['$super']
          }
        },
        "files":   [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir %>",
            "src":    "**/*.js",
            "dest":   "<%= config.destDir %>"
          }
        ]
      }
    },

    /**
     *  html迷你化
     */
    "htmlmin": {
      "web": {
        "files": [
          {
            "expand": true,
            "cwd":    "<%= config.srcDir%>/",
            "src":    ["*.html", "views/**/*.html"],
            "dest":   "<%= config.destDir%>/"
          }
        ]
      },
      "app": {
        "files": {
          "<%= config.destDir %>/index.html": "<%= config.srcDir %>/app.index.html"
        }
      }
    },

    /**
     * css 迷你化任务
     */
    "cssmin": {
      //css 迷你化
      "minify":  {
        "expand": true,
        "cwd":    "<%= config.srcDir %>/res/style",
        "src":    ["*.css"],
        "dest":   "<%= config.destDir %>/res/style/",
        "ext":    ".css"
      },
      //合并文件
      "combine": {
        "files": {
          "<%= config.destDir %>/style/main.css": ["<%= config.srcDir %>/style/common.css", "<%= config.srcDir %>/style/cui.css"]
        }
      }
    },

    /**
     * css路径替换任务
     */
    replace: {
      options:     {
        patterns: [
          {
            match:       /\.\.\.\/img/g,
            replacement: 'http://res.m.ctrip.com/html5/content/images',
            expression:  true
          },
          {
            match:       '/-calc\\(100%-/g',
            replacement: '-calc(100% - ',
            expression:  true
          }
        ]
      },
      web_app_css: {
        files: [
          {expand: true, flatten: true, cwd: '<%= config.destDir %>/', src: ['**/*.css'], dest: '<%= config.destDir %>/res/style/'}
        ]
      },
      web_res_css: {
        files: [
          {expand: true, flatten: true, cwd: '<%= config.destDir %>/', src: ['**/*.css'], dest: '<%= config.destDir %>/style/'}
        ]
      },
      templates:   {
        options: {
          patterns: [
            {
              match:       '/"views/g',
              replacement: '"<%= config.channel %>/views',
              expression:  true
            },
            {
              match:       '/"dest\/views/g',
              replacement: '"<%= config.channel %>/dest/views',
              expression:  true
            },
            {
              match:       '/text!dest/views/g',
              replacement: 'text!<%= config.channel %>/dest/views',
              expression:  true
            },
            {
              match:       '/text!views/g',
              replacement: 'text!<%= config.channel %>/views',
              expression:  true
            },
            {
              match:       '/text!dest\/templates/g',
              replacement: 'text!<%= config.channel %>/dest/templates',
              expression:  true
            },
            {
              match:       '/text!templates/g',
              replacement: 'text!<%= config.channel %>/templates',
              expression:  true
            },
            {
              match:       '/text!views/templates/g',
              replacement: 'text!<%= config.channel %>/views/templates',
              expression:  true
            }
          ]
        },
        files:   [
          { flatten: true, src: ['<%= config.destDir %>/main.js'], dest: '<%= config.destDir %>/main.js'}
        ]
      }
    },

    /**
     * 去除空格任务
     */
    "strip": {
      "main": {
        "src":     "<%= config.destDir %>/**/*.js",
        "options": {
          "inline": true
        }
      }
    },

    /**
     * 执行压缩任务
     */
    "compress": {

      //webapp目录压缩，省得在itunes手动压缩
      "com_webapp": {
        "options": {
          "archive": "<%= pkg.appOutDir %>/webapp.zip"
        },
        "files":   [
          {
            "src":    ["**"],
            "cwd":    "<%= pkg.appOutDir %>/webapp",
            "dest":   "/webapp",
            "expand": true
          }
        ]
      },

      //hybrid压缩
      "app":        {
        "options": {
          "archive": "<%= pkg.appOutDir %>/zip/<%= config.channel%>.zip"
        },
        "files":   [
          {
            "src":    ["**"],
            "cwd":    "<%= config.destDir %>",
            "dest":   "<%= config.channel%>/",
            "expand": true
          }
        ]
      },
      //web 压缩
      "web":        {
        "options": {
          "archive": "<%= pkg.webOutDir %>/<%= config.channel%>.zip"
        },
        "files":   [
          {
            "src":    ["dest/**/*", "*.html", "*.js"],
            "cwd":    "<%= config.srcDir %>",
            "dest":   "/",
            "expand": true
          }
        ]
      },
      //权宜之计，真实app
      "com_app":    {
        "options": {
          "archive": "<%= pkg.appOutDir %>/zip/app.zip"
        },
        "files":   [
          {
            "src":    [ "*", "*/*", "*/*/*", "*/*/*/*" ],
            "cwd":    "<%= pkg.appOutDir %>/webapp/app",
            "dest":   "app",
            "expand": true
          }
        ]
      },
      //权宜之计，真实res
      "com_res":    {
        "options": {
          "archive": "<%= pkg.appOutDir %>/zip/res.zip"
        },
        "files":   [
          {
            "src":    [ "*", "*/*"],
            "cwd":    "<%= pkg.appOutDir %>/webapp/res",
            "dest":   "res",
            "expand": true
          }
        ]
      }
    },

    /**
     * 生成MD5码任务
     */
    "hashify": {
      main:          {
        options: {
          basedir: '<%= pkg.appOutDir %>/zip',
          copy:    true,
          hashmap: '/md5.json'
        },
        files:   [
          {
            src:  '<%= pkg.appOutDir %>/zip/<%=config.channel%>.zip',
            dest: '/<%= config.channel %>.zip',
            key:  '<%= config.channel %>'
          }
        ]
      },
      //权宜之计，真实app
      "hashify_app": {
        options: {
          basedir: '<%= pkg.appOutDir %>/zip',
          copy:    true,
          hashmap: '/md5.json'
        },
        files:   [
          {
            src:  '<%= pkg.appOutDir %>/zip/app.zip',
            dest: '/app.zip',
            key:  'app'
          }
        ]
      },
      //权宜之计，真实res
      "hashify_res": {
        options: {
          basedir: '<%= pkg.appOutDir %>/zip',
          copy:    true,
          hashmap: '/md5.json'
        },
        files:   [
          {
            src:  '<%= pkg.appOutDir %>/zip/res.zip',
            dest: '/res.zip',
            key:  'res'
          }
        ]
      }
    },

    /**
     * 拉取线上的框架包
     */
    curl:  {
      main: {
        src:  ['http://svn.ui.sh.ctripcorp.com/hybrid.zip'],
        dest: 'temp/hybrid.zip'
      }
    },

    //权宜之计
    unzip: {
      main: {
        src:  ['temp/hybrid.zip'],
        dest: '<%= pkg.appOutDir %>'
      }
    },

    /**
     * 调用lizard2.0的打包脚本
     */
    shell: {
      lizard2: {
        command: 'node ./webapp2hybrid/busbu.js <%= config.cfgFile %>'
      }
    }

  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-strip');
  grunt.loadNpmTasks('grunt-hashify');
  grunt.loadNpmTasks('grunt-nodemailer');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-shell');

  var platformCfg = {};
  /**
   * 默认任务
   */
  grunt.registerTask('default', 'default task', function () {
    grunt.task.run(['build']);
  });

  /**
   * 编译APP
   */
  grunt.registerTask('app', 'app task', function (application, branch) {
    grunt.option('platform', 'app');
    grunt.option('application', application);
    grunt.task.run(['build:app:' + application + ":" + branch]);
  });

  /**
   * 编译WEB
   */
  grunt.registerTask('web', 'web task', function (application, branch) {

    grunt.option('platform', 'web');
    grunt.option('application', application);
    grunt.task.run(['build:web:' + application + ":" + branch]);
  });

  /**
   * 真实操作的build任务
   */
  grunt.registerTask('build', 'build task', function (platform, application, branch) {

    var pkg = grunt.file.readJSON('package.json'),
      platform = grunt.option('platform'),
      application = grunt.option('application') || application,
      app = pkg.applications[application];
    grunt.log.debug(grunt.option('application'));

    branch = branch != 'undefined' ? branch : app.defaultPath;
    projectPath = grunt.option('path') || app.paths[branch];
    //检查参数完整型
    if (!platform || !application || !projectPath) {
      grunt.log.error('miss or error arguments,please check input!  \n ' +
        'right usage: "grunt --platform=[platform] --application=[application] --path=[path]"');
    }
    grunt.log.debug(platform + ";" + application + ":" + projectPath);

    //检测lizard的版本
    var cfg1 = "gruntCfg.json";
    var cfg2 = "busbu.json", cfgFile = "";

    var isVer1 = false, isVer2 = false;

    if (grunt.file.exists(projectPath + "/" + cfg2)) {
      isVer2 = true;
      cfgFile = projectPath + "/" + cfg2;
    } else if (grunt.file.exists(projectPath + "/webapp/" + cfg2)) {
      isVer2 = true;
      cfgFile = projectPath + "/" + cfg2;
    } else if (grunt.file.exists(projectPath + "/" + cfg1)) {
      isVer1 = true;
      cfgFile = projectPath + "/" + cfg1;
    } else if (grunt.file.exists(projectPath + "/webapp/" + cfg1)) {
      isVer1 = true;
      cfgFile = projectPath + "/webapp/" + cfg1;
    } else {
      grunt.log.error('not found busbu.json/ gruntCfg.json');
    }
    //判断结束

    if (isVer1) {
      grunt.log.debug('---------start lizard1.1 task------------');
      taskForV1();
    } else if (isVer2) {
      grunt.log.debug('---------start lizard2.0 task------------');
      taskForV2();
    }

    /**
     * lizard1 版本的任务
     */
    function taskForV1() {
      //设置源文件目录和目的目录
      var taskName = app ? app.task : '',
        srcDir, destDir,
        tasks;
      //如果给程序指定了编译任务名,取给定的任务,否则取默认任务
      if (taskName) {
        tasks = pkg.tasks[platform][taskName];
      } else {
        tasks = (application == 'app' || application == 'res') ? pkg.tasks[platform][application] : pkg.tasks[platform].default;
      }
      //如果是app平台的app任务,设一下src目录
      if (platform == 'app' && application == "app") {
        srcDir = projectPath;
      } else {
        srcDir = projectPath + "/webapp";
      }
      destDir = platform == 'web' ? srcDir + "/dest" : pkg.appOutDir + "/webapp/" + application;
      var config = {
        srcDir:  srcDir,
        destDir: destDir,
        channel: application,
        frameworkInclude: pkg.frameworkInclude
      }
      grunt.log.debug(JSON.stringify(config, null, 2));
      grunt.config.set('config', config);
      //在各SBU目录读取gruntCfg.json目录,生成requirejs目录
      if (grunt.util._.indexOf(tasks, 'requirejs') > -1) {
        loadRequireTask(platform, cfgFile);
      }
      
      //运行任务
      grunt.task.run(tasks);
    }

    /**
     * lizard2 版本任务
     */
    function taskForV2() {
      var tasks = pkg.tasks2.app.default;
      var destDir = pkg.appOutDir + "/webapp/" + application;
      var config = {
        srcDir:  projectPath,
        destDir: destDir,
        channel: application,
        frameworkInclude: pkg.frameworkInclude,
        cfgFile: "--path=" + cfgFile
      }
      grunt.log.debug(JSON.stringify(config, null, 2));
      grunt.config.set('config', config);

      grunt.task.run(tasks);
    }

    
  });


  /**
   * 读取requirejs 配置,合并文件
   * @param platform
   * @param application
   * @param projectPath
   * @returns {boolean}
   */
  function loadRequireTask(platform, cfgFile) {
    // var fileName = projectPath + "/webapp/gruntCfg.json",
    var optimize = grunt.option('debug') ? "none" : "uglify",
      requireTask;
    var modules = [];
    var config = grunt.config('config');
    var framework = config.frameworkInclude;

    grunt.log.debug('read ' + cfgFile);
    try {
      var taskCfg = grunt.file.readJSON(cfgFile);
      grunt.log.debug(JSON.stringify(taskCfg, null, 2));
      var options = taskCfg.requirejs.main.options,
        newinclude = [];
      platformCfg = options[platform];
      var requireTextPath;

      //处理require.text.js
      if (options.paths.text) {
        requireTextPath = path.join(grunt.template.process(options.baseUrl), 'require.text.js');
        grunt.file.copy(
          './require.text.js',
          requireTextPath
        );
        options.paths.text = './require.text';
      }

      //按模块打包
      if (Array.isArray(platformCfg.modules)) {
        options.templateUrl = options.templateUrl || 'templates';
        options.templateFn = options.templateFn || 'buildViewTemplatesPath';

        modules = platformCfg.modules;
        //处理框架http的js
        for (var i in options.paths) {
          if (/^http/.test(options.paths[i])) {
            options.paths[i] = 'empty:';
          }
        }
        framework.forEach(function (item) {
          options.paths[item] = 'empty:';
        });

        requireTask = {
          main: {
            options: {
              //源码路径,由于requirejs之前，代码已经被copy到dest了
              baseUrl:               config.destDir,
              dir:                   config.destDir, //压缩后目录
              allowSourceOverwrites: true,
              keepBuildDir:          true,
              paths:                 options.paths,
              optimize:              'none',
              uglify:                {
                "except": ["$super"]
              },
              modules:               modules,
              onBuildRead:           function (moduleName, path, contents) {
                //模板依赖解决
                var templateReg = new RegExp(options.templateFn + "\\(\['\"]([\\w-\\.\\/]+)['\"]\\)");
                var template = templateReg.exec(contents);
                var templateSrc;

                if (template) {
                  if (template[1].indexOf('.html') == -1) {
                    template[1] += '.html';
                  }
                  templateSrc = 'text!' + options.templateUrl + '/' + template[1];
                  contents = contents.replace(templateReg, '"' + templateSrc + '"');
                }

                if (moduleName === 'main') {
                  return '';
                }

                return contents;
              },
              onBuildWrite:          function (moduleName, path, contents) {
                //处理模块路径问题
                var templateReg = new RegExp('text!' + options.templateUrl);
                var templateSrc = grunt.template.process('text!<%= config.channel %>/dest/' + options.templateUrl);
                var defineReg = /define\('views/;
                var defineSrc = grunt.template.process("define('<%= config.channel %>/dest/views");

                return contents
                  .replace(templateReg, templateSrc)
                  .replace(defineReg, defineSrc);
              },
              done:                  function (done, output) {
                //删除require.text.js
                grunt.file.delete(requireTextPath, {
                  force: true
                });
                done();
              }
            }
          }
        }
      } else {
        //对gruntCfg.json中的include做一下处理,把main_r放在最前面,否则web打包后
        //报错
        if (platform == 'web') {
          for (var i = 0, ln = platformCfg.include.length; i < ln; i++) {
            var item = platformCfg.include[i];
            if (item == 'main_r') {
              newinclude.unshift('main_r');
            } else {
              newinclude.push(item);
            }
          }
        } else {
          newinclude = platformCfg.include;
        }
        requireTask = {
          main: {
            options: {
              baseUrl:  options.baseUrl,
              paths:    options.paths,
              optimize: optimize,
              uglify:   {
                "except": ["$super"]
              },
              include:  newinclude,
              out:      platformCfg.out,
              done:     function (done, output) {
                //删除require.text.js
                grunt.file.delete(requireTextPath, {
                  force: true
                });
                done();
              }
            }
          }
        }
      }

    } catch (e) {
      erreorLog();
      return false;
    }

    grunt.log.write(JSON.stringify(requireTask, null, 2));
    //注册新的requirejs task
    grunt.config.set("requirejs", requireTask);
  };


//将压缩包的MD5码转为大写,并格式话JSON
  grunt.registerTask('formatMD5', 'format MD5 task', function () {
    var md5Obj = grunt.file.readJSON('out/hybrid/zip/md5.json'),
      jsonObj = {};
    grunt.log.debug(JSON.stringify(md5Obj, null, 2));
    for (var name in md5Obj) {
      grunt.log.debug(name);
      var attrName = name.split('_')[0];
      if (md5Obj[attrName]['md5']) {
        jsonObj[attrName] = md5Obj[attrName];
        continue;
      }
      jsonObj[attrName] = {
        file: name,
        md5:  md5Obj[name].toUpperCase()
      }
    }
    var content = JSON.stringify(jsonObj, null, 4);
    grunt.file.write('out/hybrid/zip/md5.json', content);
  });

  /**
   * 修配配置里的版本号
   */
  grunt.registerTask('addBuildVersion', 'default task', function () {
    platformCfg.buildversion = "<%= config.srcDir %>/common/config.js";
    var config = grunt.config.get('config');
    var filePath = grunt.template.process(platformCfg.buildversion, config);
    grunt.log.writeln(filePath);
    if (!grunt.file.exists(filePath)) {
      return;
    }
    var jsBuffer = grunt.file.read(filePath);
    var content = jsBuffer.toString();
    content = content.replace(/version:\"\d+@\d+\"/g, "version:\"" + grunt.template.today('yyyymmdd@HHMM') + "\"");
    grunt.file.write(filePath, content);
  });


  /**
   * 添加版本号
   */
  grunt.registerTask('addVersion', 'format MD5 task', function () {
    var config = grunt.config.get('config');
    var filePath = grunt.template.process(platformCfg.out, config)
    grunt.log.writeln(filePath);
    var jsBuffer = grunt.file.read(filePath);
    var verArr = [];
    verArr = ["function getDateTime () {",
      "var d = new Date();",
      "var y = d.getFullYear();",
      "d.setFullYear(y+1);",
      "return d.toDateString();",
      "}",
      "var store = localStorage.getItem('H5_CFG') || '{\"value\":{}}';",
      "var config = JSON.parse(store);",
      "config.value." + config.channel + "_ver ='" + grunt.template.today('mmddhhMM') + "';",
      "config.timeout = getDateTime();",
      "localStorage.setItem('H5_CFG',JSON.stringify(config));"
    ]
    grunt.file.write(filePath, jsBuffer.toString() + verArr.join(" "));
  });

  function erreorLog(e) {
    grunt.log.error(e);
    grunt.file.writeln('build_error.log', e)
  }
}
