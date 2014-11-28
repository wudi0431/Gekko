框架打包
	node lizard.js --path=lizard.json
BUSBU打包
	node busbu.js --path=busbu.json

bu\sbu开发人员需要遵守的规则
	1.页面中要配置appBaseUrl、webresourceBaseUrl两个路径
		<meta name="appBaseUrl" content="/webapp/tour/">
		<meta name="webresourceBaseUrl" content="http://webresource.c-ctrip.com/">
	2.pdconfig文件的加载作为框架文件的一个属性来加载
		eg:
		<script type="text/javascript" src="../lizard/webresource.c-ctrip.com/code/lizard/2.0/web/lizard.seed.js" pdconfig="127.0.0.1/html5/tour/webresource/tour/tourConfig.js"></script>
	3.pdconfig的具体内容
		a.所有的配置都走绝对路径
		b.所有模块都要在pdconfig中有定义，包括html模块
		eg:
		require.config({
		    paths: {
			'TourModel': Lizard.appBaseUrl + 'webresource/tour/models/tourModel',
			'Calendar2Frame': Lizard.appBaseUrl + 'webresource/tour/res/scripts/widget/Calendar2-frame.html'
		    }
		})
文件夹说明
	tour:文件夹为demo项目
	webapp:文件夹为打包后的目录
	lizard：文件夹为框架打包后的目录
执行顺序  
	0.进入当前目录，重新安装jsdom
	1.pd人员需要配置busbu.jon
	2.点击package.bat
	如需本地调试 busbu.jon中的属性weinre设置成tru，然后执行3，否则不需要执行3
	3.weinre.bat
	4.webapp为打包生成的文件
	5.busbu.json中的属性说明
	{
		/*pd项目的服务器地址*/
		"hostname":"127.0.0.1:8082",
		/*需要打包的页面*/
		"views":{
			"/webapp/tour/index":1,
			"/webapp/tour/VacationList/2/2/%E4%B8%8A%E6%B5%B7/mobi/1/nopage":1,
			"/webapp/tour/Detail/1666873/2/2/nopage":1
		},
		/*hybrid进来的首页*/
		// "defaultView":"http://127.0.0.1:8082/webapp/tour/VacationList/2/2/%E4%B8%8A%E6%B5%B7/mobi/1/nopage",
		"defaultView":"/webapp/tour/VacationList/2/2/上海/mobi/1/nopage",

		/*需要打包的域名，框架资源不需要处理，框架默认添加*/
		"resource":{
			"127.0.0.1:8082":1
		},
		/*--lizardEnv 框架代码环境*/
		"lizardEnv":"local",
		/*--channel 频道名称*/
		"channel":"tour",
		/*是否进行本地weinre调试*/
		"weinre":true,
		/**/
		"include":{
		//		"http://webresource.ctrip.com/code/lizard/2.0/webapporigin/lizard.seed.js":0,
		//		"http://webresource.ctrip.com/code/lizard/2.0/web/lizard.seed.js":0
		},
		/*生产包的根目录*/
		"root":"webapp/"
	};

