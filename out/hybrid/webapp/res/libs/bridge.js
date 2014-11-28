var __CTRIP_JS_PARAM="?jsparam=";var __CTRIP_URL_PLUGIN="ctrip://h5/plugin"+__CTRIP_JS_PARAM;var __CTRIP_YOUTH_URL_PLUGIN="ctripyouth://h5/plugin"+__CTRIP_JS_PARAM;var Internal={isIOS:false,isAndroid:false,isWinOS:false,isInApp:false,appVersion:"",osVersion:"",isYouthApp:false,isAppVersionGreatThan:function(e){if(Internal.isYouthApp){return true}if((typeof e=="string")&&(e.length>0)&&Internal.appVersion){var b=e.replace(/\./g,"");var a=Internal.appVersion.replace(/\./g,"");var d=parseFloat(b);var c=parseFloat(a);if(isNaN(c)||c-d>=0){return true}}return false},isSupportAPIWithVersion:function(a){return true;if((a!=null)&&(!Internal.isAppVersionGreatThan(a))){Internal.appVersionNotSupportCallback(a);return false}return true},appVersionNotSupportCallback:function(a){var b={tagname:"app_version_too_low",start_version:a,app_version:Internal.appVersion};CtripTool.app_log(JSON.stringify(b));window.app.callback(b)},paramErrorCallback:function(a){var b={tagname:"app_param_error",description:a};CtripTool.app_log(JSON.stringify(b));window.app.callback(b)},isNotEmptyString:function(a){if((typeof a=="string")&&(a.length>0)){return true}return false},loadURL:function(b){var c=document.createElement("iframe");var a=document.body||document.documentElement;c.style.display="none";c.setAttribute("src",b);a.appendChild(c);setTimeout(function(){c.parentNode.removeChild(c);c=null},200)},makeParamString:function(a,c,d,b){if(!Internal.isNotEmptyString(a)||!Internal.isNotEmptyString(c)){return""}if(!d){d={}}d.service=a;d.action=c;d.callback_tagname=b;return JSON.stringify(d)},makeURLWithParam:function(a){if(a==null){a=""}a=encodeURIComponent(a);if(Internal.isYouthApp){return __CTRIP_YOUTH_URL_PLUGIN+a}else{return __CTRIP_URL_PLUGIN+a}},callWin8App:function(a){window.external.notify(a)}};function __bridge_callback(c){c=decodeURIComponent(c);var d=JSON.parse(c);if(d!=null){if(d.param!=null&&d.param.hasOwnProperty("platform")){var a=navigator.userAgent;if(a.indexOf("Youth_CtripWireless")>0){Internal.isYouthApp=true}platform=d.param.platform;var b=typeof platform;if(b=="number"){if(platform==1||platform==2||platform==3){Internal.isIOS=(platform==1);Internal.isAndroid=(platform==2);Internal.isWinOS=(platform==3)}}else{if(b=="string"){if(platform=="1"||platform=="2"||platform=="3"){Internal.isIOS=(platform=="1");Internal.isAndroid=(platform=="2");Internal.isWinOS=(platform=="3")}}}Internal.isInApp=true;Internal.appVersion=d.param.version;Internal.osVersion=d.param.osVersion}val=window.app.callback(d);if(Internal.isWinOS){if(val){val="true"}else{val="false"}}return val}return -1}function __payment_callback(e){e=decodeURIComponent(e);var h=JSON.parse(e);if(h!=null){if(h.param!=null&&h.param.hasOwnProperty("platform")){var d=navigator.userAgent;if(d.indexOf("Youth_CtripWireless")>0){Internal.isYouthApp=true}platform=h.param.platform;var a=typeof platform;if(a=="number"){if(platform==1||platform==2||platform==3){Internal.isIOS=(platform==1);Internal.isAndroid=(platform==2);Internal.isWinOS=(platform==3)}}else{if(a=="string"){if(platform=="1"||platform=="2"||platform=="3"){Internal.isIOS=(platform=="1");Internal.isAndroid=(platform=="2");Internal.isWinOS=(platform=="3")}}}Internal.isInApp=true;Internal.appVersion=h.param.version;Internal.osVersion=h.param.osVersion}if(h.tagname=="app_getPayDataFromNative"){if(h.payment_route_gate){var f=Internal.makeParamString("Pay","payNative",h,h.callback);var c=Internal.makeURLWithParam(f);if(Internal.isIOS){Internal.loadURL(c);return}else{if(Internal.isAndroid){window.Util_a.payNative(f);return}else{if(Internal.isWinOS){Internal.callWin8App(f);return}}}}else{var g=h.param;CtripUtil.app_cross_package_href(h.path,g);return}return -1}}}function __writeLocalStorage(b,a){if(Internal.isNotEmptyString(b)){localStorage.setItem(b,a)}}var CtripTool={app_is_in_ctrip_app:function(){if(Internal.isInApp){return true}var a=false;var b=navigator.userAgent;if(b.indexOf("CtripWireless")>0){a=true}return a},app_log:function(b,a){CtripUtil.app_log(b,a)}};var CtripUtil={app_log_event:function(a){CtripBusiness.app_log_event(a)},app_init_member_H5_info:function(){var b=Internal.makeParamString("User","initMemberH5Info",null,"init_member_H5_info");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.initMemberH5Info(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_call_phone:function(a){if(!a){a=""}var d={};d.phone=a;var c=Internal.makeParamString("Util","callPhone",d,"call_phone");if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.callPhone(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_back_to_home:function(){var c=Internal.makeParamString("Util","backToHome",null,"back_to_home");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){var b="ctrip://wireless/";if(Internal.isYouthApp){b="ctripyouth://wireless/"}CtripUtil.app_open_url(b,1,"  ")}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_back_to_last_page:function(c,b){var e={};if(!c){c=""}e.callbackString=c;e.isDeleteH5Page=b;var d=Internal.makeParamString("Util","backToLast",e,"back_to_last_page");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.backToLast(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_refresh_nav_bar:function(a){CtripBar.app_refresh_nav_bar(a)},app_open_url:function(g,o,m,n,f){var i={};if(!g){g=""}if(!m){m=""}if(!n){n=""}i.openUrl=g;i.title=m;i.targetMode=o;i.pageName=n;i.isShowLoadingPage=f;var h=Internal.makeParamString("Util","openUrl",i,"open_url");if(Internal.appVersion){var b=false;if(o==5){if(!Internal.isAppVersionGreatThan("5.9")){var j=g.indexOf("/");if(j>0){var a=g.substr(0,j);var p=g.substr(j+1);CtripUtil.app_cross_package_href(a,p)}else{Internal.appVersionNotSupportCallback("传入URL有错误，eg. car/index.html#xxooee")}b=true}}if(!b){if(Internal.isIOS){var d=Internal.makeURLWithParam(h);Internal.loadURL(d)}else{if(Internal.isAndroid){window.Util_a.openUrl(h)}else{if(Internal.isWinOS){Internal.callWin8App(h)}}}}}else{var c=navigator.userAgent;var l=(c.indexOf("Android")>0)&&(c.indexOf("CtripWireless")>0);if(l){try{window.Util_a.openUrl(h)}catch(k){window.location.href=g}}else{window.location.href=g}}},app_check_update:function(){CtripBusiness.app_check_update()},app_recommend_app_to_friends:function(){CtripBusiness.app_recommend_app_to_friends()},app_add_weixin_friend:function(){CtripBusiness.app_add_weixin_friend()},app_cross_package_href:function(b,e){var d={};if(!b){b=""}if(!e){e=""}d.path=b;d.param=e;var c=Internal.makeParamString("Util","crossPackageJumpUrl",d,"cross_package_href");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.crossPackageJumpUrl(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_show_newest_introduction:function(){CtripBusiness.app_show_newest_introduction()},app_check_network_status:function(){var b=Internal.makeParamString("Util","checkNetworkStatus",null,"check_network_status");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.checkNetworkStatus(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_check_app_install_status:function(c,a){var e={};if(!c){c=""}if(!a){a=""}e.openUrl=c;e.packageName=a;var d=Internal.makeParamString("Util","checkAppInstallStatus",e,"check_app_install_status");if(Internal.isIOS){var b=Internal.makeURLWithParam(d);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.checkAppInstallStatus(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_refresh_native_page:function(b,a){var e={};if(!b){b=""}if(!a){a=""}e.pageName=b;e.jsonStr=a;var d=Internal.makeParamString("Util","refreshNativePage",e,"refresh_native_page");if(Internal.isIOS){var c=Internal.makeURLWithParam(d);Internal.loadURL(c)}else{if(Internal.isAndroid){window.Util_a.refreshNativePage(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_copy_string_to_clipboard:function(d){if(!Internal.isSupportAPIWithVersion("5.3")){return}var c={};if(!d){d=""}c.copyString=d;var b=Internal.makeParamString("Util","copyToClipboard",c,"copy_string_to_clipboard");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.copyToClipboard(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_read_copied_string_from_clipboard:function(){var a="5.3";if(!Internal.isSupportAPIWithVersion("5.3")){return}var c=Internal.makeParamString("Util","readCopiedStringFromClipboard",null,"read_copied_string_from_clipboard");if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.readCopiedStringFromClipboard(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_call_system_share:function(b,d,c,a){CtripBusiness.app_call_system_share(b,d,c,a)},app_download_data:function(a,d,c){if(!Internal.isSupportAPIWithVersion("5.3")){return}var f={};if(!a){a=""}if(!d){d=""}f.downloadUrl=a;f.suffix=d;f.pageUrl=window.location.href;f.isIgnoreHttpsCertification=c;var e=Internal.makeParamString("Util","downloadData",f,"download_data");if(Internal.isIOS){var b=Internal.makeURLWithParam(e);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.downloadData(e)}else{if(Internal.isWinOS){Internal.callWin8App(e)}}}},app_open_other_app:function(c,b,a){if(!Internal.isSupportAPIWithVersion("5.3")){return}var e={};if(!c){c=""}if(!b){b=""}if(!a){a=""}e.packageId=c;e.jsonParam=b;e.url=a;var d=Internal.makeParamString("Util","openOtherApp",e,"open_other_app");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.openOtherApp(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_log:function(c,a){if(!Internal.isNotEmptyString(c)){return}if(!Internal.isNotEmptyString(a)){a=""}var e={};e.log=c;e.result=a;var d=Internal.makeParamString("Util","h5Log",e,"log");if(Internal.isIOS){var b=Internal.makeURLWithParam(d);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.h5Log(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_open_adv_page:function(a){CtripBusiness.app_open_adv_page(a)},app_choose_photo:function(f,a,c){if(!Internal.isSupportAPIWithVersion("5.7")){return}var e={};e.maxFileSize=f;e.maxPhotoCount=a;e.meta=c;var d=Internal.makeParamString("Util","choosePhoto",e,"choose_photo");if(Internal.isIOS){var b=Internal.makeURLWithParam(d);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.choosePhoto(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_save_photo:function(f,a,c){if(!Internal.isSupportAPIWithVersion("5.7")){return}var e={};if(!f){f=""}if(!a){a=""}if(!c){c=""}e.photoUrl=f;e.photoBase64String=a;e.imageName=c;var d=Internal.makeParamString("Util","savePhoto",e,"save_photo");if(Internal.isIOS){var b=Internal.makeURLWithParam(d);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.savePhoto(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_h5_page_finish_loading:function(){if(!Internal.isSupportAPIWithVersion("5.8")){return}var b=Internal.makeParamString("Util","h5PageFinishLoading",null,"h5_page_finish_loading");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.h5PageFinishLoading(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}}};var CtripUser={app_member_login:function(a){var d={};d.isShowNonMemberLogin=a;var c=Internal.makeParamString("User","memberLogin",d,"member_login");if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.User_a.memberLogin(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_non_member_login:function(){var b=Internal.makeParamString("User","nonMemberLogin",null,"non_member_login");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.nonMemberLogin(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_member_auto_login:function(){var b=Internal.makeParamString("User","memberAutoLogin",null,"member_auto_login");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.memberAutoLogin(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_member_register:function(){var b=Internal.makeParamString("User","memberRegister",null,"member_register");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.memberRegister(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_finished_register:function(b){if(!Internal.isSupportAPIWithVersion("5.7")){return}if(!b){b=""}var d={};d.userInfoJson=b;var c=Internal.makeParamString("User","finishedRegister",d,"finished_register");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.finishedRegister(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_finished_login:function(b){if(!Internal.isSupportAPIWithVersion("5.8")){return}if(!b){b=""}var d={};d.userInfoJson=b;var c=Internal.makeParamString("User","finishedLogin",d,"finished_login");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.User_a.finishedLogin(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}};var CtripEncrypt={app_base64_encode:function(b){if(!Internal.isSupportAPIWithVersion("5.3")){return}if(!b){b=""}params={};params.toIncodeString=b;var c=Internal.makeParamString("Encrypt","base64Encode",params,"base64_encode");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Encrypt_a.base64Encode(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_md5_hash:function(b){if(!Internal.isSupportAPIWithVersion("5.5")){return}if(!b){b=""}params={};params.inString=b;var c=Internal.makeParamString("Encrypt","md5Hash",params,"md5_hash");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Encrypt_a.md5Hash(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_ctrip_encrypt:function(c,b){if(!Internal.isSupportAPIWithVersion("5.5")){return}if(!c){c=""}params={};params.inString=c;params.encType=b;var d=Internal.makeParamString("Encrypt","ctripEncrypt",params,"ctrip_encrypt");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Encrypt_a.ctripEncrypt(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}}};var CtripPay={app_check_pay_app_install_status:function(){if(!Internal.isSupportAPIWithVersion("5.4")){return}var b=Internal.makeParamString("Pay","checkPayAppInstallStatus",null,"check_pay_app_install_status");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Pay_a.checkPayAppInstallStatus(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_open_pay_app_by_url:function(g,b,c,f){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!b){b=""}if(!g){g=""}if(!c){c=""}if(!f){f=""}var e={};e.payMeta=b;e.payAppName=g;e.successRelativeURL=c;e.detailRelativeURL=f;var d=Internal.makeParamString("Pay","openPayAppByURL",e,"open_pay_app_by_url");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Pay_a.openPayAppByURL(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_call_pay:function(g){alert(JSON.stringify(g));var c=Internal.makeParamString("Pay","getPayDataFromNative",g,"app_getPayDataFromNative"),j=JSON.parse(c),f=j.param.split("?")[1].split("&"),h="";for(var d=0;d<f.length;d++){var e=f[d].split("="),b=e[0],k=e[1];if(b==="bustype"){h=k;break}}j.names=["payment_route_"+h];c=JSON.stringify(j);if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.getPayDataFromNative(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_store_data_to_native:function(b){var c=Internal.makeParamString("Pay","setPayDataToNative",b);if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.setPayDataToNative(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}};var CtripPipe={app_send_HTTP_pipe_request:function(c,j,a,g,i,d,h){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!c){c=""}if(!j){j=""}if(!a){a=""}if(!g){g=""}if(!i){i=""}if(!h){h=""}var f={};f.baseURL=c;f.path=j;f.method=a;f.header=g;f.parameters=i;f.sequenceId=h;f.isIgnoreHTTPSCertification=d;var e=Internal.makeParamString("Pipe","sendHTTPPipeRequest",f,"send_http_pipe_request");if(Internal.isIOS){var b=Internal.makeURLWithParam(e);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Pipe_a.sendHTTPPipeRequest(e)}else{if(Internal.isWinOS){Internal.callWin8App(e)}}}},app_abort_HTTP_pipe_request:function(b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!b){b=""}var d={};d.sequenceId=b;var c=Internal.makeParamString("Pipe","abortHTTPRequest",d,"abort_http_pipe_request");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Pipe_a.abortHTTPRequest(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_send_H5_pipe_request:function(e,h,c,d,b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!e){e=""}if(!h){h=""}if(!c){c=""}if(!d){d=""}if(!b){b=0}var g={};g.serviceCode=e;g.header=h;g.data=c;g.sequenceId=d;g.pipeType=b;var f=Internal.makeParamString("Pipe","sendH5PipeRequest",g,"send_h5_pipe_request");if(Internal.isIOS){var a=Internal.makeURLWithParam(f);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Pipe_a.sendH5PipeRequest(f)}else{if(Internal.isWinOS){Internal.callWin8App(f)}}}}};var CtripSumSungWallet={app_check_ticket_in_samsung_wallet:function(a){if(!a){a=""}var b={};b.ticketID=a;paramString=Internal.makeParamString("SamSungWallet","checkTicketInSamSungWallet",b,"check_ticket_in_samsung_wallet");if(Internal.isAndroid){window.SamSungWallet_a.checkTicketInSamSungWallet(paramString)}},app_download_ticket_in_samsung_wallet:function(a){if(!a){a=""}var b={};b.ticketID=a;paramString=Internal.makeParamString("SamSungWallet","downloadTicketInSamSungWallet",b,"download_ticket_in_samsung_wallet");if(Internal.isAndroid){window.SamSungWallet_a.downloadTicketInSamSungWallet(paramString)}},app_show_ticket_in_samsung_wallet:function(a){if(!a){a=""}var b={};b.ticketID=a;paramString=Internal.makeParamString("SamSungWallet","showTicketInSamSungWallet",b,"show_ticket_in_samsung_wallet");if(Internal.isAndroid){window.SamSungWallet_a.showTicketInSamSungWallet(paramString)}}};var CtripFile={app_get_current_sandbox_name:function(){if(!Internal.isSupportAPIWithVersion("5.4")){return}var c={};c.pageUrl=window.location.href;var b=Internal.makeParamString("File","getCurrentSandboxName",c,"get_current_sandbox_name");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.getCurrentSandboxName(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_write_text_to_file:function(f,g,b,c){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!f){f=""}if(!g){g=""}if(!b){b=""}var e={};e.pageUrl=window.location.href;e.text=f;e.fileName=g;e.relativeFilePath=b;e.isAppend=c;var d=Internal.makeParamString("File","writeTextToFile",e,"write_text_to_file");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.writeTextToFile(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_delete_file:function(e,b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!e){e=""}if(!b){b=""}var d={};d.fileName=e;d.relativeFilePath=b;d.pageUrl=window.location.href;var c=Internal.makeParamString("File","deleteFile",d,"delete_file");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.deleteFile(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_read_text_from_file:function(e,b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!e){e=""}if(!b){b=""}var d={};d.fileName=e;d.pageUrl=window.location.href;d.relativeFilePath=b;var c=Internal.makeParamString("File","readTextFromFile",d,"read_text_from_file");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.readTextFromFile(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_get_file_size:function(e,b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!e){e=""}if(!b){b=""}var d={};d.fileName=e;d.relativeFilePath=b;d.pageUrl=window.location.href;var c=Internal.makeParamString("File","getFileSize",d,"get_file_size");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.getFileSize(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_check_file_exist:function(e,b){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!e){e=""}if(!b){b=""}var d={};d.fileName=e;d.relativeFilePath=b;d.pageUrl=window.location.href;var c=Internal.makeParamString("File","checkFileExist",d,"check_file_exist");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.checkFileExist(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_make_dir:function(b,c){if(!Internal.isSupportAPIWithVersion("5.4")){return}if(!b){b=""}if(!c){c=""}var e={};e.dirName=b;e.pageUrl=window.location.href;e.relativeDirPath=c;var d=Internal.makeParamString("File","makeDir",e,"make_dir");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.File_a.makeDir(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}}};var CtripBar={app_refresh_nav_bar:function(a){if(Internal.isNotEmptyString(a)){jsonObj=JSON.parse(a);jsonObj.service="NavBar";jsonObj.action="refresh";jsonObj.callback_tagname="refresh_nav_bar";var c=JSON.stringify(jsonObj);if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.NavBar_a.refresh(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}},app_set_navbar_hidden:function(b){if(!Internal.isSupportAPIWithVersion("5.4")){return}var d={};d.isHidden=b;var c=Internal.makeParamString("NavBar","setNavBarHidden",d,"set_navbar_hidden");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.NavBar_a.setNavBarHidden(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_set_toolbar_hidden:function(b){if(!Internal.isSupportAPIWithVersion("5.4")){return}var d={};d.isHidden=b;var c=Internal.makeParamString("NavBar","setToolBarHidden",d,"set_toolbar_hidden");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.NavBar_a.setToolBarHidden(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}};var CtripMap={app_locate:function(c,b){var e={};e.timeout=c;e.isNeedCtripCity=b;var d=Internal.makeParamString("Locate","locate",e,"locate");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Locate_a.locate(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_show_map:function(g,c,f,b){if(!Internal.isSupportAPIWithVersion("5.5")){return}if(!f){f=""}if(!b){b=""}var e={};e.latitude=g;e.longitude=c;e.title=f;e.subtitle=b;var d=Internal.makeParamString("Locate","showMap",e,"show_map");if(Internal.isIOS){var a=Internal.makeURLWithParam(d);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Locate_a.showMap(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_show_map_with_POI_list:function(b){if(!Internal.isSupportAPIWithVersion("5.8")){return}var d={};d.poiList=b;var c=Internal.makeParamString("Locate","showMapWithPOIList",d,"show_map_with_POI_list");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Locate_a.showMapWithPOIList(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}};var CtripBusiness={app_choose_invoice_title:function(d){if(!Internal.isSupportAPIWithVersion("5.6")){return}if(!d){d=""}var c={};c.selectedInvoiceTitle=d;var b=Internal.makeParamString("Business","chooseInvoiceTitle",c,"choose_invoice_title");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.chooseInvoiceTitle(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_show_voice_search:function(d){if(!Internal.isSupportAPIWithVersion("5.7")){return}var c={};c.businessType=d;var b=Internal.makeParamString("Business","showVoiceSearch",c,"show_voice_search");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.showVoiceSearch(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_open_adv_page:function(a){if(!Internal.isSupportAPIWithVersion("5.4")){return}var b={};b.advUrl=a;paramString=Internal.makeParamString("Util","openAdvPage",b,"open_adv_page");if(Internal.isIOS){url=Internal.makeURLWithParam(paramString);Internal.loadURL(url)}else{if(Internal.isAndroid){window.Util_a.openAdvPage(paramString)}else{if(Internal.isWinOS){Internal.callWin8App(paramString)}}}},app_show_newest_introduction:function(){var b=Internal.makeParamString("Util","showNewestIntroduction",null,"show_newest_introduction");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.showNewestIntroduction(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_check_update:function(){var b=Internal.makeParamString("Util","checkUpdate",null,"check_update");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.checkUpdate(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_recommend_app_to_friends:function(){var b=Internal.makeParamString("Util","recommendAppToFriends",null,"recommend_app_to_friends");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.recommendAppToFriends(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_add_weixin_friend:function(){var b=Internal.makeParamString("Util","addWeixinFriend",null,"add_weixin_friend");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.addWeixinFriend(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_call_system_share:function(c,g,f,a){if(!Internal.isSupportAPIWithVersion("5.3")){return}var e={};if(!c){c=""}if(!f){f=""}if(!g){g=""}if(!a){a=""}e.title=f;e.text=g;e.linkUrl=a;e.imageRelativePath=c;var d=Internal.makeParamString("Util","callSystemShare",e,"call_system_share");if(Internal.isIOS){var b=Internal.makeURLWithParam(d);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Util_a.callSystemShare(d)}else{if(Internal.isWinOS){Internal.callWin8App(d)}}}},app_log_event:function(b){if(Internal.isNotEmptyString(b)){var d={};d.event=b;var c=Internal.makeParamString("Util","logEvent",d,"log_event");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Util_a.logEvent(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}},app_get_device_info:function(){if(!Internal.isSupportAPIWithVersion("5.7")){return}var b=Internal.makeParamString("Business","getDeviceInfo",null,"get_device_info");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.getDeviceInfo(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_read_verification_code_from_sms:function(){if(!Internal.isSupportAPIWithVersion("5.8")){return}var b=Internal.makeParamString("Business","readVerificationCodeFromSMS",null,"read_verification_code_from_sms");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.readVerificationCodeFromSMS(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_log_google_remarkting:function(b){if(!Internal.isSupportAPIWithVersion("5.8")){return}if(!b){b=""}var d={};d.screenName=b;var c=Internal.makeParamString("Business","logGoogleRemarking",d,"log_google_remarkting");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.logGoogleRemarking(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_check_app_package_info:function(){if(!Internal.isSupportAPIWithVersion("5.8")){return}var b=Internal.makeParamString("Business","checkAppPackageInfo",params,"check_app_package_info");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.checkAndroidPackageInfo(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_choose_contact_from_addressbook:function(){if(!Internal.isSupportAPIWithVersion("5.9")){return}var b=Internal.makeParamString("Business","chooseContactFromAddressbook",null,"choose_contact_from_addressbook");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.chooseContactFromAddressbook(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_send_ubt_log:function(b){if(!Internal.isSupportAPIWithVersion("5.9")){return}var d={};d.tags=b;var c=Internal.makeParamString("Business","sendUBTLog",d,"send_ubt_log");if(Internal.isIOS){var a=Internal.makeURLWithParam(c);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Business_a.sendUBTLog(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}}};var CtripPage={app_set_page_name:function(a){if(!Internal.isSupportAPIWithVersion("5.6")){return}if(!a){a=""}var d={};d.pageName=a;var c=Internal.makeParamString("Page","setPageName",d,"set_page_name");if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Page_a.setPageName(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_back_to_page:function(a){if(!Internal.isSupportAPIWithVersion("5.8")){return}if(!a){a=""}var d={};d.pageName=a;var c=Internal.makeParamString("Page","backToPage",d,"back_to_page");if(Internal.isIOS){var b=Internal.makeURLWithParam(c);Internal.loadURL(b)}else{if(Internal.isAndroid){window.Page_a.backToPage(c)}else{if(Internal.isWinOS){Internal.callWin8App(c)}}}},app_show_loading_page:function(){if(!Internal.isSupportAPIWithVersion("5.9")){return}var b=Internal.makeParamString("Page","showLoadingPage",null,"show_loading_page");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Page_a.showLoadingPage(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_hide_loading_page:function(){if(!Internal.isSupportAPIWithVersion("5.9")){return}var b=Internal.makeParamString("Page","hideLoadingPage",null,"hide_loading_page");if(Internal.isIOS){var a=Internal.makeURLWithParam(b);Internal.loadURL(a)}else{if(Internal.isAndroid){window.Page_a.hideLoadingPage(b)}else{if(Internal.isWinOS){Internal.callWin8App(b)}}}},app_enable_drag_animation:function(a){if(!Internal.isSupportAPIWithVersion("5.9")){return}var b={};b.isEnable=a;paramString=Internal.makeParamString("Page","enableDragAnimation",b,"enable_drag_animation");if(Internal.isIOS){url=Internal.makeURLWithParam(paramString);Internal.loadURL(url)}else{if(Internal.isAndroid){}else{if(Internal.isWinOS){Internal.callWin8App(paramString)}}}}};