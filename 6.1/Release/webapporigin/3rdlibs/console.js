var sockjs_url = 'http://172.16.150.196:9999/echo';
var sockjs = new SockJS(sockjs_url);

window.console = {};
window.console.log = function(info){
  if (typeof info === 'string') {
    try{
      sockjs.send(info);
    } catch (e) {

    }
  }else if(typeof info === 'object'){
    try{
      var infoStr = JSON.stringify(info);
      try{
        sockjs.send(infoStr);
      } catch (e) {

      }
    } catch (e) {
      try {
        sockjs.send('Error: stringify error');
      } catch (e) {

      }
    }
  }
}