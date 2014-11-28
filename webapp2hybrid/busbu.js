var colors=require('colors');
var vm=require('vm');
var fs=require('fs');
var http=require('http');
var url=require('url');
var path=require('path');
var mkdirp=require('mkdirp');
var jsdom=require('jsdom');
var CSSOM=require('CSSOM');
var util=require('util');
var esprima=require('esprima');
var os = require('os');
var networkInterfacess = os.networkInterfaces()["本地连接"];
var ip = null;
var platform = os.platform();
if ('win32' == platform) { 
	for(var i=0;i<networkInterfacess.length;i++){  
		var networkInterfaces = networkInterfacess[i]
		if(networkInterfaces.family=='IPv4'){  
			ip=networkInterfaces.address;  
		}  
	}
}else if ('linux' == platform){
	for(var i=0;i<os.networkInterfaces().eth0.length;i++){  
		if(os.networkInterfaces().eth0[i].family=='IPv4'){  
			ip=os.networkInterfaces().eth0[i].address;  
		}  
	}  
}



//配置环境
var config={
	/*需要打包的页面*/
	"views":{
		// "http://127.0.0.1:8082/webapp/tour/index":1,
		// "http://127.0.0.1:8082/webapp/tour/VacationList/2/2/%E4%B8%8A%E6%B5%B7/mobi/1/nopage":1,
		// "http://127.0.0.1:8082/webapp/tour/Detail/1666873/2/2/nopage":1
	},
	/*进来的首页*/
	// "defaultView":"http://127.0.0.1:8082/webapp/tour/VacationList/2/2/%E4%B8%8A%E6%B5%B7/mobi/1/nopage",
	"defaultView":"",//"/webapp/tour/VacationList/2/2/上海/mobi/1/nopage",

	/*需要打包的资源，框架资源不需要处理，框架默认添加*/
	"resource":{
		// "127.0.0.1:8082":1
	},
	/*--lizardEnv 框架代码环境*/
	"lizardEnv":"local",
	/*--channel 频道名称*/
	"channel":"tour",
	// /*--path 指定目录(config文件) */
	// "path":"busbu.json",
	// /*是否进行本地weinre调试*/
	"weinre":false,
	/**/
	"include":{
//		"http://webresource.ctrip.com/code/lizard/2.0/webapporigin/lizard.seed.js":0,
//		"http://webresource.ctrip.com/code/lizard/2.0/web/lizard.seed.js":0
	},
	/*生产包的根目录*/
	"root":"out/hybrid/webapp/",
	"level":1,
	"srcDebug":{
		"libs":[
				"3rdlibs/json2.js",
				"3rdlibs/bridge.js",
				"3rdlibs/require.js",
				"3rdlibs/underscore.js",
				"3rdlibs/zepto.js",
				"3rdlibs/backbone.js",
				"3rdlibs/fastclick.js",
				"parser.js",
				],
		"srcDir":"../WebAppOrigin",
		"open":false
	}
};
//用来替换域名的
/*
	框架资源，不同环境的配置
*/
var host={
	"local":{	
		"webresource.ctrip.com":"webresource.local.sh.ctriptravel.com",
		"webresource.c-ctrip.com":"webresource.local.sh.ctriptravel.com",
		"pic.ctrip.com":"pic.local.sh.ctriptravel.com",
		"pic.c-ctrip.com":"pic.local.sh.ctriptravel.com",
		"res.m.ctrip.com":"res.m.ctrip.com"
	},
	"ui":{
		"webresource.ctrip.com":"webresource.ui.sh.ctriptravel.com",
		"webresource.c-ctrip.com":"webresource.ui.sh.ctriptravel.com",
		 "pic.ctrip.com":"pic.fws.qa.nt.ctripcorp.com",
		 "pic.c-ctrip.com":"pic.fws.qa.nt.ctripcorp.com",
		//"pic.ctrip.com":"pic.ui.sh.ctriptravel.com",
		//"pic.c-ctrip.com":"pic.ui.sh.ctriptravel.com",
		"res.m.ctrip.com":"res.m.ctrip.com"
	},
	"fws":{
		"webresource.ctrip.com":"webresource.fws.qa.nt.ctripcorp.com",
		"webresource.c-ctrip.com":"webresource.fws.qa.nt.ctripcorp.com",
		"pic.ctrip.com":"pic.fws.qa.nt.ctripcorp.com",
		"pic.c-ctrip.com":"pic.fws.qa.nt.ctripcorp.com",
		"res.m.ctrip.com":"res.m.ctrip.com"
	},
	"uat":{
		"webresource.ctrip.com":"webresource.uat.qa.nt.ctripcorp.com",
		"webresource.c-ctrip.com":"webresource.uat.qa.nt.ctripcorp.com",
		"pic.ctrip.com":"pic.uat.qa.nt.ctripcorp.com",
		"pic.c-ctrip.com":"pic.uat.qa.nt.ctripcorp.com",
		"res.m.ctrip.com":"res.m.ctrip.com"
	},
	"pro":{
		"webresource.ctrip.com":"webresource.ctrip.com",
		"webresource.c-ctrip.com":"webresource.c-ctrip.com",
		"pic.ctrip.com":"pic.ctrip.com",
		"pic.c-ctrip.com":"pic.c-ctrip.com",
		"res.m.ctrip.com":"res.m.ctrip.com"
	}
};

/*
删除文件夹子
*/
function deleteFolderRecursive1(path) {
	/*var exec = require('child_process').exec,child;

	child = exec('rm -rf '+path,function(err,out) { 

	  console.log(out); err && console.log(err); 

	});
	
	var curPath = path;
	try{
			var files = [];

			if( fs.existsSync(path) ) {

				files = fs.readdirSync(path);

				files.forEach(function(file,index){

					curPath = path + "/" + file;

					if(fs.statSync(curPath).isDirectory()) { // recurse

						deleteFolderRecursive(curPath);

					} else { // delete file

						fs.unlinkSync(curPath);

					}

				});

				fs.rmdirSync(path);

			}
			console.log(curPath +" delete success ");
	}catch(e){
		console.log(path +" delete fail, "+e.message);
		deleteFolderRecursive(path);
	}
	*/
};
var deleteFolderRecursive = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];

        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();
// parse config
var root = "./";
(function(){
	var argv=process.argv.slice(2);
	
	var configPath="busbu.json";
	var re=/^--(\w+)=(.+)$/;
	for (var i=0;i<argv.length;i++){
		var arr=argv[i].match(re);
		if (arr){
			switch (arr[1]){
				case 'path':
					configPath=arr[2];
					break;
				default:
					break;
			}
		}
	}
	
	/*加载配置项*/
	loadConfig(configPath);
	if(config.level==3){
		config.srcDebug.open = true;
	}
	// fix config
	/*添加hostname域内的内容进入打包范围*/
	config.resource[config.hostname]=1;
	
	/*设置views的url为绝对url*/
	for (var n in config.views){
		config.views['http://'+config.hostname+n] = config.views[n];
		delete config.views[n];
	}
	
	
	
	/*将host对象中，当前环境下的站点添加到config.resource对象中，使其可以被打包*/
	if (config.lizardEnv in host){
		/*
			先将host[config.lizardEnv]上的属性copy给config.resource
		*/
		for (var h1 in host[config.lizardEnv]){
			config.resource[h1]=1;
		}
		
		/*
			将host[config.lizardEnv]中的key 、value都合并到config.resource对象中
		*/
		for (var h1 in host[config.lizardEnv]){
			var h2=host[config.lizardEnv][h1];
			for (var h in config.resource){
				if (h1==h && !(h2 in config.resource)){
					config.resource[h2]=config.resource[h];
				}
				if (h2==h && !(h1 in config.resource)){
					config.resource[h1]=config.resource[h];
				}
			}
			for (var iUrl in config.include){
				var urlObj=url.parse(iUrl);
				var h=urlObj.hostname;
				if (h1==h){
					urlObj.hostname=h2;
					urlObj.host=h2+(urlObj.port?':'+urlObj.port:'');
					var tUrl=url.format(urlObj);
					if (!(tUrl in config.include)){
						config.include[tUrl]=config.include[iUrl];
					}
				}
				if (h2==h && !(h1 in config.resource)){
					urlObj.hostname=h1;
					urlObj.host=h1+(urlObj.port?':'+urlObj.port:'');
					var tUrl=url.format(urlObj);
					if (!(tUrl in config.include)){
						config.include[tUrl]=config.include[iUrl];
					}
				}
			}
		}
	}
	
	// if (!config.root){
		// config.root=path.basename(configFile,path.extname(configFile));
	// }
	if(!config.channel){
		throw "请添加channel名称";
	}
	deleteFolderRecursive(config.root,function(e){
		console.log("!!!"+e)
		console.log("删除"+config.root+"目录以及子目录成功")
	});
	root = path.join(config.root,config.channel);
	mkdirp.sync(root);
	config.absRoot=fs.realpathSync(root);
	
})();

// console.log(config)
// return;

// load config in vm sandbox
function loadConfig(fn){
	var str='';
	try{
		str=fs.readFileSync(fn).toString();
	}catch (e){
		throw(new Error('Load config file error'));
	}

	if (str){
		try{
			// var sandbox={
				// config:str
			// };
			// vm.runInNewContext('config=eval("("+config+")");',sandbox);
			// if (typeof sandbox.config=='object'){
				// config=extend(config,sandbox.config);
			// }
			
			var ret=new Function('return (' + str + ')')();
			// var config=new Function('__sandbox','with(__sandbox){return (config);}')(sandbox);
			config=extend(config,ret);
		}catch (e){
			console.log(e.message);
			throw(new Error('Error config file format'));
		}
	}
}


// base utility
String.prototype.toReString=function(){
	var h={
		'\r':'\\r',
		'\n':'\\n',
		'\t':'\\t'
	};
	return this.replace(/([\.\\\/\+\*\?\[\]\{\}\(\)\^\$\|])/g,"\\$1").replace(/[\r\t\n]/g,function(a){
		return h[a];
	});
};

function extend(obj){
	var argv=Array.prototype.slice.call(arguments,1);
	for (var i=0;i<argv.length;i++){
		for (var key in argv[i]){
			if (key in obj && typeof obj[key]=='object'){
				extend(obj[key],argv[i][key]);
			}else{
				obj[key]=argv[i][key];
			}
		}
	}
	return obj;
}

function copy(val){
	var ret;
	switch (typeof val){
		case 'object':
			ret={};
			for (var key in val){
				ret[key]=copy(val[key]);
			}
			break;
		case 'array':
			ret=[];
			for (var i=0;i<val.length;i++){
				ret.push(copy(val[i]));
			}
			break;
		default:
			ret=val;
			break;
	}
	return ret;
}

function concatBuff(buff1,buff2){
	var buff=new Buffer(buff1.length+buff2.length);
	buff1.copy(buff,0);
	buff2.copy(buff,buff1.length);
	return buff;
}

function urlResolve(){
	var args=Array.prototype.slice.call(arguments,0);
	var u1=args.shift(),u2;
	while (u2=args.shift()){
		var urlObj=url.parse(u1);
		if (urlObj.protocol){
			urlObj.protocol='http:';
			u1=url.format(urlObj);
		}
		if (/^\/\//.test(u2)){
			u2=urlObj.protocol+u2;
		}
		u1=url.resolve(u1,u2);
	}
	return u1;
}

// async task
function task(callback){
	var _this=this;
	this.enabled=true;
	this.remain=0;
	this.hash={};
	this.callback=callback;
	setTimeout(function(){
		_this.check();
	});
}
task.prototype.uid=function(){
	return 'uid_'+new Date().getTime()+(Math.random()*1e10).toFixed(0);
};
task.prototype.add=function(flag){
	if (!this.enabled){
		throw(new Error('Add task error, instance is disabled'));
	}
	if (!flag){
		flag=this.uid();
	}
	this.hash[flag]=0;
	this.check();
	return flag;
};
task.prototype.remove=function(flag){
	if (!this.enabled){
		throw(new Error('Remove task error, instance is disabled'));
	}
	if (!flag||!(flag in this.hash)){
		throw(new Error('Remove task error, can\'t find task flag'));
	}
	this.hash[flag]=1;
	this.check();
	return flag;
};
task.prototype.check=function(){
	if (!this.enabled){
		throw(new Error('Add task error, instance is disabled'));
	}
	this.remain=0;
	for (var flag in this.hash){
		if (!this.hash[flag]){
			this.remain++;
		}
	}
	if (!this.remain){
		this.callback();
		this.enabled=false;
	}
};

// app entry
var map={},fetched={};

// app start
(function(){

	var views=[];
	for (var oUrl in config.views){
		if (config.views.hasOwnProperty(oUrl)){
			views.push(oUrl);
		}
	}
		

	
	fetchViews(function(){
	
		mapLinks();

	
		convertViews();
	
		convertReqHtmls();
		createLocalRoute();
		
		createIndexPage();
		
		// copySource(path.resolve(__dirname,'source'),config.absRoot);
		
		// saveInfo();
		console.log('[Message]'.grey+' Package Completed');
	});
	//创建首页  by wxj 
	function createIndexPage(){
		
	
		for (var oUrl in config.views){
			var lUrl = map[oUrl].filePath;
			var mimeType = map[oUrl].mimeType;
			if (mimeType=='text/html'){
				// var tUrl=lUrl+'.js';
				var content=fs.readFileSync(lUrl).toString();
				// content='define(function(){return ('+JSON.stringify(content)+');});';
				content=content.replace(/<base\b.*?>/g,'');
				content=content.replace(/<div id="headerview" style="height: 48px;">/g,'<div id="headerview" style="height: 48px;display:none;">');
				// fs.writeFileSync(path.resolve(__dirname,'source','index.html'),content);
				fs.writeFileSync(path.resolve(config.absRoot,'index.html'),content);
				
				break;
			}
		}
	}
	
	// fetch views
	function fetchViews(callback){
		var view=views.shift();
		if (view){
			var tIns=new task(function(){
				console.log('[Message]'.grey+' Fetch View End: '+view);
				fetchViews(callback);
			});
			console.log('[Message]'.grey+' Fetch View Start: '+view);
			fetchFile(view,tIns);
		}else{
			callback&&callback();
		}
	}

	// map links
	function mapLinks(){
		for (var oUrl in map){
			replaceLinks(map[oUrl].filePath,map[oUrl].mimeType);
		}
	}

	// convert views
	function convertViews(){
		for (var oUrl in config.views){
			convertHtmlToAmd(map[oUrl].filePath,map[oUrl].mimeType);
		}
	}

	// convert require htmls
	function convertReqHtmls(){
		for (var i=0;i<reqs.converts.length;i++){
			var oUrl=reqs.converts[i];
			convertHtmlToAmd(map[oUrl].filePath,map[oUrl].mimeType);
		}
	}

	// create local route
	function createLocalRoute(){
		var localRoute={};
		for (var oUrl in config.views){
			var urlSchema=map[oUrl].urlSchema;
			console.log('=================================')
			console.log(urlSchema)
			
			if (urlSchema){
				var filePath=path.relative(config.absRoot,map[oUrl].filePath).replace(/\\/g,'/');
				localRoute[urlSchema]=filePath;
				/*
					处理"defaultView":"http://127.0.0.1:8082/webapp/tour/index"这样的情况
				*/
				if(config.defaultView==oUrl){
					localRoute["defaultView"]=urlSchema;
				};
				console.log('[ Route ]'.yellow+' '+urlSchema+' : '+map[oUrl].filePath);
			}else{
				console.log('[ Warn  ]'.red+' Miss UrlSchema :'+oUrl);
			}
		}
		/*
			处理"defaultView":"/index///"这样的情况
		*/
		if(!localRoute["defaultView"]){
			localRoute["defaultView"]=config.defaultView;
		}
		
		// var content='Hybrid.localRoute.addConfig('+JSON.stringify(localRoute)+');';
		var content='window.LizardLocalroute = '+JSON.stringify(localRoute)+';';
		fs.writeFileSync(path.resolve(config.absRoot,'LizardLocalroute.js'),content);
	}

	// copy source
	function copySource(oDir,tDir){
		var arr=fs.readdirSync(oDir);
		for (var i=0;i<arr.length;i++){
			if (arr[i]!='.' && arr[i]!='..'){
				var oFile=path.resolve(oDir,arr[i]);
				var tFile=path.resolve(tDir,arr[i]);
				var stat=fs.statSync(oFile);
				if (stat.isFile()){
					fs.createReadStream(oFile).pipe(fs.createWriteStream(tFile));
					console.log('[ Copy  ]'.yellow+' '+tFile);
				}
				if (stat.isDirectory()){
					copySource(oFile,tFile);
				}
			}
		}
	}

	// save info
	function saveInfo(){
		var info={
			config:config,
			map:map,
			require:{
				baseUrl:reqs.require.baseUrl,
				paths:reqs.paths,
				converts:reqs.converts,
			},
			Lizard:reqs.Lizard
		};
		var infoFile=config.absRoot+'/info.json';
		console.log('[Message]'.grey+' Save Info: '+infoFile);
		fs.writeFileSync(infoFile,JSON.stringify(info));
	}
})();
function copyLizardSrc(lizardFileDir){
	//如果不需要本地debug则直接返回
	var srcDebug = config.srcDebug;
	if(!srcDebug.open||!lizardFileDir)return false;
	srcDebug.lizardFileDir = lizardFileDir;
	var stat = fs.stat;
	/*
	 * 复制目录中的所有文件包括子目录
	 * @param{ String } 需要复制的目录
	 * @param{ String } 复制到指定的目录
	 */
	var copy = function( src, dst ){
		console.log(" [ copy] ")
		console.log(" [src] ",src)
		console.log(" [dst] ",dst)
		
		// 读取目录中的所有文件/目录
		fs.readdir( src, function( err, paths ){
			if( err ){
				throw err;
			}

			paths.forEach(function( path ){
				var _src = src + '/' + path,
					_dst = dst + '/' + path,
					readable, writable;        

				stat( _src, function( err, st ){
					if( err ){
						throw err;
					}

					// 判断是否为文件
					if( st.isFile() ){
						// 创建读取流
						readable = fs.createReadStream( _src );
						// 创建写入流
						writable = fs.createWriteStream( _dst ,{flag:"r"});   
						// 通过管道来传输流
						readable.pipe( writable );
					}
					// 如果是目录则递归调用自身
					else if( st.isDirectory() ){
						exists( _src, _dst, copy );
					}
				});
			});
		});
	};

	// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
	var exists = function( src, dst, callback ){
		fs.exists( dst, function( exists ){
			// 已存在
			if( exists ){
				callback( src, dst );
			}
			// 不存在
			else{
				fs.mkdir( dst, function(){
					callback( src, dst );
				});
			}
		});
	};
	deleteFolderRecursive(lizardFileDir);
	exists( path.join(__dirname,srcDebug.srcDir),lizardFileDir, copy );
}
/*
	人为的创建libs对应的maps
*/
function createLibsMap(oUrl){
	var isView=oUrl in config.views;
	var oUrlObj=url.parse(oUrl);
	var specFlag=getSpecFlag(oUrl);
	
	if (!specFlag.exclude && (specFlag.include || isView || oUrlObj.host in config.resource)){
		var hostname = "";
		var oUrlObj=url.parse(oUrl);
		if (config.lizardEnv in host && oUrlObj.hostname in host[config.lizardEnv]){
			hostname = oUrlObj.hostname;
			oUrlObj.hostname=host[config.lizardEnv][oUrlObj.hostname];
			oUrlObj.host=oUrlObj.hostname+(oUrlObj.port?':'+oUrlObj.port:'');
		}
		
		map[oUrl]={};
		if(hostname){
			var filePath=path.resolve(root,"../lizard",hostname,oUrlObj.pathname.replace(/^\//,'').replace(/[^\w\.\/\\]/g,'_'))+(isView?'.html':'');
			var fileDir=path.dirname(filePath);
			map[oUrl].filePath=filePath;
		}else{
			var filePath=path.resolve(root,oUrlObj.hostname,oUrlObj.pathname.replace(/^\//,'').replace(/[^\w\.\/\\]/g,'_'))+(isView?'.html':'');
			var fileDir=path.dirname(filePath);
			map[oUrl].filePath=filePath;
		}
		map[oUrl].mimeType='application/x-javascript';
	}else{
		console.log(('[ Skip  ] '+oUrl).grey);
	}	
}
// logic fn
function fetchFile(oUrl,tIns,callback){
	var isView=oUrl in config.views;
	var oUrlObj=url.parse(oUrl);
	var specFlag=getSpecFlag(oUrl);
	
	if (!specFlag.exclude && (specFlag.include || isView || oUrlObj.host in config.resource)){
		var hostname = "";
		
		if (config.lizardEnv in host && oUrlObj.hostname in host[config.lizardEnv]){
			hostname = oUrlObj.hostname;
			oUrlObj.hostname=host[config.lizardEnv][oUrlObj.hostname];
			oUrlObj.host=oUrlObj.hostname+(oUrlObj.port?':'+oUrlObj.port:'');
		}
		
		var tUrl=url.format(oUrlObj);
		
		if (tUrl in fetched){
			setTimeout(function(){
				map[oUrl]=map[fetched[tUrl]];
				callback&&callback();
			});
			return;
		}

		fetched[tUrl]=oUrl;
		map[oUrl]={};
		
		// webapp\tour\pic.local.sh.ctriptravel.com\vacation_v2\h5\group_travel
		
		/*
			处理fileDir和filePath
		*/
		if(hostname){
			var filePath=path.resolve(root,"../lizard",hostname,oUrlObj.pathname.replace(/^\//,'').replace(/[^\w\.\/\\]/g,'_'))+(isView?'.html':'');
			var fileDir=path.dirname(filePath);
			map[oUrl].filePath=filePath;
		}else{
			var filePath=path.resolve(root,oUrlObj.hostname,oUrlObj.pathname.replace(/^\//,'').replace(/[^\w\.\/\\]/g,'_'))+(isView?'.html':'');
			var fileDir=path.dirname(filePath);
			map[oUrl].filePath=filePath;
		}
		tIns.add(oUrl);
		// [ Fetch ] http://webresource.ui.sh.ctriptravel.com/code/lizard/2.0/web/lizard.seed.js
		console.log('[ Fetch ]'.green+' '+tUrl);
		var lizardFileDir = null;
		var lizardFileUrl = null;
		
		if(config.level==1){
			if(tUrl.indexOf('web/lizard.seed')!=-1){
				tUrl = tUrl.replace('web/lizard.seed.js','hybrid/lizard.seed.js');
				tUrl = tUrl.replace('web/lizard.seed.src.js','hybrid/lizard.seed.js');
				lizardFileDir = fileDir
				lizardFileUrl = oUrl;
			}else if (tUrl.indexOf('webapporigin/lizard.seed')!=-1){
				tUrl = tUrl.replace('webapporigin/lizard.seed.js','hybrid/lizard.seed.js');
				tUrl = tUrl.replace('webapporigin/lizard.seed.src.js','hybrid/lizard.seed.js');
				lizardFileDir = fileDir
				lizardFileUrl = oUrl;
			}
		}else if(config.level==2||config.level==3){
			
			if(tUrl.indexOf('web/lizard.seed')!=-1){
				tUrl = tUrl.replace('web/lizard.seed.js','hybrid/lizard.seed.src.js');
				tUrl = tUrl.replace('web/lizard.seed.src.js','hybrid/lizard.seed.src.js');
				lizardFileDir = fileDir
				lizardFileUrl = oUrl;
			}else if (tUrl.indexOf('webapporigin/lizard.seed')!=-1){
				tUrl = tUrl.replace('webapporigin/lizard.seed.js','hybrid/lizard.seed.src.js');
				tUrl = tUrl.replace('webapporigin/lizard.seed.src.js','hybrid/lizard.seed.src.js');
				lizardFileDir = fileDir
				lizardFileUrl = oUrl;
			}
			
		}
		
		
		
		var opts=url.parse(tUrl);
		opts.agent=null;

		
		var req=http.get(opts,function(res){
			if (res.statusCode==200){
				var mimeType=(res.headers['content-type']||'').split(';')[0].trim();
				map[oUrl].mimeType=mimeType;

				var buff=new Buffer(0);
				res.on('data',function(tBuff){
					buff=concatBuff(buff,tBuff);
				});
				res.on('end',function(){
					getResource(oUrl,mimeType,buff,tIns,function(buff){
						mkdirp(fileDir,function(err){
							if (err){
								throw(new Error('Create path error: '+fileDir));
							}else{
								fs.writeFileSync(filePath,buff);
								
								copyLizardSrc(lizardFileDir);
								callback&&callback(buff);
								tIns.remove(oUrl);
							}
						});
					});
				});
				res.on('error',function(err){
					setTimeout(function(){
						throw(err);
					});
					throw(new Error('Error fetch url: '+tUrl));
				});
			}else{
				throw(new Error('Error fetch url: '+tUrl));
			}
		});
		req.on('error',function(){
			throw(new Error('Fetch url error: '+tUrl));
		});
	}else{
		console.log(('[ Skip  ] '+oUrl).grey);
	}
}

function getSpecFlag(oUrl){
	var ret={
		include:false,
		exclude:false
	};
	var len=0;
	for (var key in config.include){
		if (key.length>len && oUrl.slice(0,key.length)==key){
			len=key.length;
			if (config.include[key]){
				ret.include=true;
			}else{
				ret.exclude=true;
			}
		}
	}
	return ret;
}

function getResource(oUrl,mimeType,buff,tIns,callback){
	var resource={};
	if (mimeType=='text/html'){
		htmlResource(oUrl,buff,tIns,callback);
	}else if (mimeType=='text/css'){
		cssResource(oUrl,buff,tIns,callback);
	}else if (mimeType=='text/javascript' || mimeType=='application/x-javascript'){
		// callback&&callback(buff);
		jsResource(oUrl,buff,tIns,callback);
	}else if (/^image\/\w+$/.test(mimeType)){
		callback&&callback(buff);
	}else{
		callback&&callback(buff);
	}
}

function htmlResource(oUrl,buff,tIns,callback){
	
	
	var content=buff.toString();

	var isTmpl=!/text\/lizard-template/.test(content) && /<%[\s\S]*%>/.test(content);
	if (isTmpl){
		var fullTmplObj=tmplPreConvert(content);
		content=fullTmplObj.tmpl;
	}
	
	jsdom.env({
		url:oUrl,
		html:content,
		features:{
			FetchExternalResources:false,
			ProcessExternalResources:false,
			SkipExternalResources:false
		},
		done:function(errs,window){
			if (errs){
				for (var i=0;i<errs.length;i++){
					(function(i){
						setTimeout(function(){
							throw(errs[i]);
						});
					})(i);
				}
				throw(new Error('Html parse error: '+oUrl));
			}

			var aFlag=tIns.add();
			var aIns=new task(function(){
				content=/<\/body>/.test(content)?
					window.document.documentElement.outerHTML:
					window.document.body.innerHTML;
				if (isTmpl){
					content=fullTmplObj.restore(content);
				}
				callback&&callback(new Buffer(content));
				tIns.remove(aFlag);
			});

			// add base script
			var head=(window.document.getElementsByTagName('head')||[])[0];
			if (head){
				var baseTag=window.document.createElement('base');
				baseTag.href=path.relative(path.dirname(map[oUrl].filePath),config.absRoot).replace(/\\/g,'/');
				if (head.firstChild){
					head.insertBefore(baseTag,head.firstChild);
				}else{
					head.appendChild(baseTag);
				}
			}

			// meta tags
			var els=window.document.getElementsByTagName('meta');
			for (var i=0;i<els.length;i++){
				if (els[i].name){
					reqs.Lizard[els[i].name]=els[i].content;
				}
			}

			// link tags
			var els=window.document.getElementsByTagName('link');
			for (var i=0;i<els.length;i++){
				var rUrl=urlResolve(oUrl,els[i].href);
				els[i].href=rUrl;
				fetchFile(rUrl,tIns);
			}
			// style tags
			var els=window.document.getElementsByTagName('style');
			for (var i=0;i<els.length;i++){
				(function(el){
					var flag=aIns.add();
					cssResource(oUrl,new Buffer(els[i].innerHTML),tIns,function(buff){
						el.innerHTML=buff.toString();
						aIns.remove(flag);
					});
				})(el);
			}
			// inline style
			
			// script
			var els=window.document.getElementsByTagName('script');
			for (var i=0;i<els.length;i++){
				if (els[i].src){
					var rUrl=urlResolve(oUrl,els[i].src);
					var reg = /lizard\.seed\.(src\.)*js.*$/ig;
					if (reg.test(rUrl)) {
						reqs.Lizard["dir"] = rUrl.replace(reg, '');
					}
					els[i].src=rUrl;
					fetchFile(rUrl,tIns);
					// pdConfig
					var pdConfig=els[i].getAttribute('pdconfig');
					if (pdConfig){
						var rUrl=urlResolve(oUrl,pdConfig);
						els[i].setAttribute('pdconfig',rUrl);
						fetchFile(rUrl,tIns,function(){
							reqs.parse(oUrl,rUrl,tIns,function(tUrl){
								map[rUrl].require=tUrl;
							});
						});
					}
				}else if (els[i].type=='text/lizard-config'){
					// get urlschema
					els[i].text.replace(/([\'\"]?)url_schema\1\s*:\s*([\'\"])(.*?)\2/g,function(a,b,c,d){
						map[oUrl].urlSchema=d;
					});
					// get controller
					els[i].text=els[i].text.replace(/([\'\"]?)controller\1\s*:\s*([\'\"])(.*?)\2/g,function(a,b,c,d){
						var ret='';
						if (d){
							var rUrl=urlResolve(oUrl,d);
							fetchFile(rUrl,tIns);
							ret=b+'controller'+b+':'+c+rUrl+c;
						}else{
							ret=a;
						}
						return ret;
					});
				}else if (els[i].type=='text/lizard-template'){
					(function(el){
						var tmplObj=tmplPreConvert(el.text);
						var flag=aIns.add();
						htmlResource(oUrl,new Buffer(tmplObj.tmpl),tIns,function(buff){
							el.text=tmplObj.restore(buff.toString());
							aIns.remove(flag);
						});
					})(els[i]);
				}else{
					// console.log(els[i].type);
				}
			}

			// add local source
			/* 调整顺序 by wxj start*/
			var sources=[
				'LizardLocalroute.js'
				// ,
				// 'hybrid.js'
			];
			var srcDebug = config.srcDebug;
			
			if(srcDebug.open&&reqs.Lizard["dir"]){	
				var libs = srcDebug.libs;
				var len = libs.length;
				for (var i=0;i<len-1;i++){
					var lib = libs[i];
					sources.push(reqs.Lizard["dir"]+lib);
					createLibsMap(reqs.Lizard["dir"]+lib);
				}
			}
			if(config.weinre){
				sources.push("http://"+ip+":5389/target/target-script-min.js#anonymous");
			}
			
			
			/* 调整顺序 by wxj end*/
			if (baseTag){
				for(var i=sources.length-1;i>=0;i--){
					var sourceTag=window.document.createElement('script');
					sourceTag.type='text/javascript';
					if(!i&&config.weinre){
						sourceTag.setAttribute("LizardWeinre",config.weinre);
						sourceTag.setAttribute("id","LizardLocalroute");
						sourceTag.setAttribute("LizardIP",ip);
						sourceTag.setAttribute("LizardChanal",config.channel);
						
					}
					sourceTag.src=sources[i];
					if (baseTag.nextSibling){
						head.insertBefore(sourceTag,baseTag.nextSibling);
					}else{
						head.appendChild(sourceTag);
					}
				}
			}
		}
	});
}

function tmplPreConvert(tmpl){
	var hash={};
	var guid='';
	var re;
	while (1){
		guid=(Math.random()*10000).toFixed(0);
		re=new RegExp('lizard_'+guid+'_\\d+','g');
		if (!re.test(tmpl)){
			break;
		}
	}
	var i=0;
	tmpl=tmpl.replace(/<%[\s\S]*?%>/g,function(a){
		var id='/*lizard_'+guid+'_'+i+'*/';
		hash[i]=a;
		i++;
		return id;
	});

	return {
		tmpl:tmpl,
		restore:function(tmpl){
			var re=new RegExp('\\/?\\*lizard_'+guid+'_(\\d+)\\*\\/?','g');
			return tmpl.replace(re,function(a,b){
				return hash[b]||'';
			});
		}
	};
}

function cssResource(oUrl,buff,tIns,callback){
	var content=buff.toString();
	var modifyArr=[];
	var rules=CSSOM.parse(content).cssRules;
	for (var i=0;i<rules.length;i++){
		var styles=rules[i].style;
		if (styles){
			// handle backgournd
			var keys=['background','background-image'];
			for (var j=0;j<keys.length;j++){
				var style=styles[keys[j]];
				if (style){
					style.replace(/url\s*\(\s*([\'\"]?)(.+?)\1\s*\)/,function(a,b,c){
						var rUrl=c.trim();
						if (!/^data/.test(rUrl)){
							rUrl=urlResolve(oUrl,rUrl);
							fetchFile(rUrl,tIns);
							modifyArr.push({
								start:styles.__starts,
								end:rules[i].__ends,
								find:a,
								replacement:'url("'+rUrl+'")'
							});
							return 'url("'+rUrl+'")';
						}
					});
				}
			}
		}
	}
	for (var i=modifyArr.length-1;i>=0;i--){
		content=content.slice(0,modifyArr[i].start)+content.slice(modifyArr[i].start,modifyArr[i].end).replace(modifyArr[i].find,modifyArr[i].replacement)+content.slice(modifyArr[i].end);
	}
	// buff=new Buffer(el.innerHTML);
	buff=new Buffer(content);
	callback&&callback(buff);
}

var reqs={
	paths:{},
	converts:[],
	require:{
		_config:{},
		baseUrl:'',
		config:function(opts){
			extend(this._config,opts);
		}
	},
	Lizard:{
		dir:'',
		appBaseUrl:'',
		webresourceBaseUrl:''
	},
	sandbox:function(){
		return {
			require:copy(this.require),
			Lizard:copy(this.Lizard)
		};
	},
//	add:function(mod,path){
//		
//	},
//	fetch:function(mod){
//		if (!(mod in this.maps)){
//			
//		}
//	},
	_parsed:{},
	parse:function(pUrl,oUrl,tIns,callback){
		console.log('[ PdCfg ]'.cyan+' '+oUrl);

		var filePath=map[oUrl].filePath;

		if (oUrl in this._parsed){
			setTimeout(function(){
				callback && callback(filePath);
			});
			return;
		}else{
			this._parsed[oUrl]=true;
		}
		
		var content=fs.readFileSync(filePath).toString();
		
		var sandbox=this.sandbox();
		try{
			vm.runInNewContext(content,sandbox);
		}catch (e){
			throw(new Error('Error pdConfig: '+oUrl));
		}
		
		sandbox.require.baseUrl=sandbox.require._config.baseUrl||'';
		
		if (sandbox.require.baseUrl){
			console.log('[ Warn  ]'.red+' Found Require Base Url: '+sandbox.require.baseUrl);
		}
		
		var rIns=new task(function(){
			if (paths){
				extend(reqs.paths,paths);
			}
			var content='require.config('+JSON.stringify(sandbox.require._config)+');';
			
			fs.writeFileSync(filePath,content);
			callback && callback(filePath);
		});

	
	
		var paths=sandbox.require._config.paths;
		if (paths){
			for (var key in paths){
				var oUrl=paths[key];
				var tUrl=oUrl;
				if (!/\.html$/i.test(oUrl)&&!/\.js$/i.test(oUrl)){
					tUrl=oUrl+'.js';
				}
				if (/^[a-z]+:\/\//.test(tUrl)){
					// nothing to do
				}else if (/^\//.test(tUrl)){
					tUrl=urlResolve(pUrl,tUrl);
				}else{
					tUrl=sandbox.require.baseUrl+tUrl;
					tUrl=urlResolve(pUrl,tUrl);
				}
				if (/\.html$/i.test(oUrl)){
					this.converts.push(tUrl);
				}
				(function(key,oUrl,tUrl){
					rIns.add(tUrl);
					fetchFile(tUrl,tIns,function(){
						paths[key]=map[tUrl].filePath;
						paths[key]=paths[key].replace(/\.js$/,'');
						paths[key]=path.relative(config.absRoot,paths[key]).replace(/\\/g,'/');
						rIns.remove(tUrl);
					});
				})(key,oUrl,tUrl);
			}
		}
	}
};

function jsResource(oUrl,buff,tIns,callback){
	var content=buff.toString();
//	var astTree=esprima.parse(content,{
//		range:true
//	});
//
//	walkAstTree(astTree,function(astNode){
//		if (astNode.type=='CallExpression' && astNode.callee && astNode.callee.type=='Identifier' && astNode.callee.name=='define'){
//			var args=astNode.arguments.slice(0);
//			if (args[0].type=='Literal'){
//				reqs.add(args.shift(),oUrl);
//			}
//			if (args[0].type=='ArrayExpression'){
//				var amds=args.shift().elements;
//				for (var i=0;i<amds.length;i++){
////					reqs.fetch(content.slice.apply(content,amds[i].range));
//				}
//			}
//		}
//	});
	
	content=content.replace(/([\'\"])(text!)(\w+?)\1/g,function(a,b,c,d){
		console.log('[ Warn  ]'.red+' Require Text: '+c+d);
		return b+d+b;
	});
	
	setTimeout(function(){
		buff=new Buffer(content);
		callback&&callback(buff);
	});
}

function walkAstTree(astNode,callback){
	switch (typeof astNode){
		case 'array':
			for (var i=0;i<astNode.length;i++){
				if (astNode[i]){
					walkAstTree(astNode[i],callback);
				}
			}
			break;
		case 'object':
			callback && callback(astNode);
			for (var key in astNode){
				var node=astNode[key];
				if (node){
					walkAstTree(node,callback);
				}
			}
			break;
	}
}

function replaceLinks(lUrl,mimeType){
			
	var rUrl=config.absRoot;
	if (mimeType=='text/html'){
		rUrl=config.absRoot;
	}else if (mimeType=='text/css'){
		rUrl=path.dirname(lUrl);
	}
	if (mimeType=='text/html' || mimeType=='text/css'){
		console.log('[  Map  ]'.yellow+' '+lUrl);
		var content=fs.readFileSync(lUrl).toString();
		
		for (var oUrl in map){
			var re=new RegExp(oUrl.toReString(),'g');
			
			var replacement=path.relative(rUrl,map[oUrl].filePath).replace(/\\/g,'/');
			
			if((replacement.indexOf(".js")!=-1)&&config.weinre){
				replacement=path.join(ip+":5389",config.channel,replacement);
				replacement = replacement.replace(/\\/g,'/');
				replacement = "http://"+replacement;
				
				// console.log(replacement);
			}
			
			content=content.replace(re,replacement);
		}
		
		fs.writeFileSync(lUrl,content);
	}
}

function convertHtmlToAmd(lUrl,mimeType){
	if (mimeType=='text/html'){
		var tUrl=lUrl+'.js';
		console.log('[  AMD  ]'.yellow+' '+tUrl);
		var content=fs.readFileSync(lUrl).toString();
		content='define(function(){return ('+JSON.stringify(content)+');});';
		fs.writeFileSync(tUrl,content);
	}
}