define(function(){return ("<html>\r\n<head><base href=\"../../../../../../..\"><script type=\"text/javascript\" src=\"LizardLocalroute.js\"></script>\r\n    \r\n    <title>团队游</title>\r\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n    <meta name=\"description\" content=\"团队游\">\r\n    <meta name=\"keywords\" content=\"团队游\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no\">\r\n    <link rel=\"apple-touch-startup-image\" href=\"../lizard/res.m.ctrip.com/html5/content/images/640.png\" sizes=\"320x460\">\r\n    <link rel=\"apple-touch-startup-image\" href=\"../lizard/res.m.ctrip.com/html5/content/images/940.png\" sizes=\"640x920\">\r\n    <link rel=\"apple-touch-startup-image\" href=\"../lizard/res.m.ctrip.com/html5/content/images/1004.png\" sizes=\"768x1004\">\r\n    <link rel=\"apple-touch-icon-precomposed\" sizes=\"57x57\" href=\"../lizard/res.m.ctrip.com/html5/Content/images/57.png\">\r\n    <link rel=\"apple-touch-icon-precomposed\" sizes=\"72x72\" href=\"../lizard/res.m.ctrip.com/html5/Content/images/72.png\">\r\n    <link rel=\"apple-touch-icon-precomposed\" sizes=\"114x114\" href=\"../lizard/res.m.ctrip.com/html5/Content/images/114.png\">\r\n    <link rel=\"apple-touch-icon-precomposed\" sizes=\"144x144\" href=\"../lizard/res.m.ctrip.com/html5/Content/images/144.png\">\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"../lizard/webresource.c-ctrip.com/styles/h5/common/main.css\">\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"172.16.140.161/html5/tour/webresource/tour/res/style/group_detail.css\">\r\n    \r\n    <meta name=\"appBaseUrl\" content=\"/webapp/tour/\">\r\n    <meta name=\"webresourceBaseUrl\" content=\"http://webresource.c-ctrip.com/\">\r\n\r\n</head>\r\n<body class=\"gray\" onselectstart=\"return false\">\r\n        <div id=\"headerview\" style=\"height: 48px;\">\r\n\t\t<header></header>\r\n\t</div>\r\n\t<div id=\"main\">\r\n\t\t<div class=\"main-frame\">\r\n\t\t\t<div class=\"main-viewport\"><p>hello</p></div>\r\n\t\t\t<div class=\"main-state\"></div>\r\n\t\t</div>\t\r\n\t</div>\r\n\t<div id=\"footer\"></div>\r\n\r\n    <script type=\"text/lizard-config\">\r\n        {\r\n            \"url_schema\": \"detail/{pid}/{scid}/{dcid}/{from}\",\r\n            \"model\": {\r\n                \"apis\":[{\r\n                    url:'http://m.ctrip.com/restapi/vacationapi/product/productdetail',\r\n                    postdata:{\"pId\":Lizard.P(\"pid\"),\"scId\":Lizard.P(\"scid\"),\"dcId\":Lizard.P(\"dcid\"),\"reqType\":[1],\"head\":{\"cid\":\"a64ac7fd-203a-83bd-5e99-6bb4d594171b\",\"ctok\":\"351858059049938\",\"cver\":\"1.0\",\"lang\":\"01\",\"sid\":\"8888\",\"syscode\":\"09\",\"auth\":\"\"}}\r\n                }],\r\n                \"filter\":function (datas){\r\n                    var ret = {data:datas[0].data, productType: ''};\r\n                    return ret;\r\n                },\r\n\t\t\t\tsetTDK: function(datas)\t\t\r\n                {\r\n\t\t\t\t    var detailData = datas[0].data;\r\n\t\t\t\t    return {title: detailData.pName, description: detailData.title, keywords: detailData.pName}\r\n                }\t\t\t\t\r\n            },\r\n            \"view\":{\r\n                \"header\": Lizard.T(\"headTmpl\"),\r\n                \"viewport\": Lizard.T(\"detail_tab\")\r\n            },\r\n            \"controller\":\"172.16.140.161/html5/tour/webresource/tour/controllers/detail.js\"\r\n        }\r\n    </script>\r\n\r\n    <script id=\"headTmpl\" type=\"text/lizard-template\">\r\n        <h1>产品详情</h1>\r\n    </script>\r\n\r\n    <script id=\"detail_tab\" type=\"text/lizard-template\">        \r\n       <div class=\"body\">\r\n    <div class=\"banner_box\" id=\"js_detail_pic_slide\">\r\n    </div>\r\n    <ul class=\"detail_tab\">\r\n\t    <li class=\"current\">概要</li>\r\n\t    <li><%if(data.travelDay){ %><%=data.travelDay %>日<%}else{ %>暂无<%} %>行程</li>\r\n\t    <li><%if(productType===\"\"){ %> <%=data.commentNum %>条点评<%}else{ %> 秒杀细则 <%} %></li>\r\n    </ul>\r\n    <div style=\"display: none;\" class=\"tab_loading\">\r\n\t\t<div style=\"\" class=\"cui-breaking-load\"> <div class=\"cui-i cui-m-logo\"></div> <div class=\"cui-i cui-w-loading\"></div></div>\r\n\t</div>\r\n    <div class=\"profile_box js_tab_showbox\">\r\n    <%if(data.detailInfo){ %>\r\n\t    <div class=\"product_wrap\">\r\n                <h2><%=data.detailInfo.title %></h2>\r\n\t\t        <div class=\"price_box\">\r\n                    <% if(data.detailInfo.price == 0) { %>\r\n                    <p class=\"price font14\">实时计价</p>\r\n                    <% } else { %>\r\n                    <p class=\"price\"><dfn>¥</dfn><%=data.detailInfo.price %><em>起</em></p>\r\n                    <%} %>\r\n                    <% if(data.detailInfo.isCashBack) { %><i class=\"orange\"><dfn>返</dfn><%=data.detailInfo.cashBackAmount %></i><%} %>\r\n\t\t\t\t    <% if(data.detailInfo.isWifi) { %><i class=\"wifi\">免费WiFi</i><%} %>\r\n                    <% if(!_.isEmpty(data.detailInfo.specialTags)) { %>\r\n                    <% _.each(data.detailInfo.specialTags, function (v, k) { %>\r\n\t\t\t\t    <i class=\"green\"><%=v %></i>\r\n                    <% }) %>\r\n                    <% } %>\r\n                    <% if(productType===\"cskill\") { %><span class=\"seckill_time js_seckillttime\">\r\n                        <% if(secKillSetting.cskillStatus === \"start\") {%>\r\n                            距离结束<%= secKillSetting.lastTime.hour %>:<%= secKillSetting.lastTime.minute %>:<%= secKillSetting.lastTime.second %></span> \r\n                        <% } %>\r\n                    <% } %>\r\n\t\t        </div>\r\n                <% if(productType===\"cskill\") { %>  \r\n                    <div class=\"seckill_price\">\r\n\t\t\t\t        <div class=\"seckill_priceleft\">\r\n\t\t\t\t\t        <p><span>秒杀价</span><span><dfn>¥</dfn><%=cskillData.PromotionPrice%><em>起</em></span></p>\r\n\t\t\t\t\t        <p>市场价&nbsp;<dfn>¥</dfn><del><%=cskillData.MarketPrice%></del>起</p>\r\n\t\t\t\t        </div>\r\n\t\t\t\t        <div class=\"seckill_priceright\">\r\n\t\t\t\t\t        <% if(cskillData.Inventory >-99999 && cskillData.Inventory < 99999) { %>\r\n                                <p>最后<span><%= cskillData.Inventory %></span>位</p>\r\n                            <% } %>\r\n\t\t\t\t\t        <p><%= cskillData.Schedule %>出发</p>\r\n\t\t\t\t        </div>\r\n\t\t\t        </div>\r\n                <%} %>\r\n                <% if(!_.isEmpty(data.detailInfo.promos)) { %>\r\n                <% _.each(data.detailInfo.promos, function (v, k) { %>\r\n                <p class=\"onsale_text\"><%=v %></p>\r\n                <% }) %>\r\n                <% } %>\r\n            <div class=\"corp_box_wrap\">\r\n\t\t\t\t<div class=\"corp_box\">\r\n                    <% if(!_.isEmpty(data.detailInfo.departName)) { %><span class=\"start_city\"><%=data.detailInfo.departName %>出发</span><% } %>\r\n\t\t\t\t\t<span class=\"corp\"><%=data.detailInfo.vendor %></span>\r\n\t\t\t\t\t<span class=\"number\">编号:<%=data.detailInfo.pId %></span>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t    </div>\r\n\t    <div class=\"recommend_wrap\">\r\n            <% if(data.detailInfo.recommends) { %>\r\n\t\t    <div class=\"recommend_detail\">\r\n\t\t\t    <div class=\"recommend_txt\">\r\n\t\t\t\t    <h3>产品经理推荐</h3>\r\n\t\t\t\t    <ul>\r\n                        <% _.each(data.detailInfo.recommends, function (v, k) { %>\r\n\t\t\t\t\t    <li <% if(k > 2) { %>=\"\" class=\"js_more_Content\" style=\"display:none\" <% } %>=\"\"><%=v.desc %> <% if(v.url) { %><a href=\"<%=v.url %>\" target=\"_blank\">查看更多&gt;&gt;</a><% } %></li>\r\n                        <% }) %>\r\n\t\t\t\t    </ul>\r\n                    <% if(data.detailInfo.recommends.length > 3) { %><div class=\"more_text\"><a class=\"js_more_Content_btn\" href=\"javascript:void(0);\">更多</a></div><% } %>\r\n\t\t\t    </div>\r\n\t\t    </div>\r\n            <% } %>\r\n\r\n            <% var isCost = _.every(_.pluck(data.detailInfo.costs, \"descs\"), function(key) { return key == '' }) %>\r\n\t\t\t<% if(!isCost) { %>\r\n            <div class=\"recommend_detail\">\r\n                <div class=\"recommend_txt\">\r\n                    <h3>费用说明</h3>\r\n                    <ul>\r\n                        <% _.each(data.detailInfo.costs, function (v, k) { %>\r\n                            <% if(v.descs.length > 0) { %>\r\n                                <% _.each(v.descs, function (m, n) { %>\r\n\t\t\t\t\t                <li><%=m %></li>\r\n                                <% }) %>\r\n                            <% } %>\r\n                        <% }) %>\r\n\t\t\t\t    </ul>\r\n                </div>\r\n            </div>\r\n            <% } %>\r\n\t\t    <ul class=\"more_info\">\r\n                <% if(productType===\"\") { %>  \r\n                    <li class=\"btn_active\"><a href=\"/webapp/tour/booking_step1\">出发班期与价格日历</a></li>\r\n                <%}%>\r\n                <% if(data.detailInfo.isCashBack) { %><li class=\"btn_active\"><a href=\"#detail.return.cash\">返现说明</a></li><% } %>\r\n\t\t\t    <li class=\"btn_active\"><a href=\"/webapp/tour/detail_booking_note\">预订须知</a></li>\r\n\t\t\t    <% if(_.indexOf([11,12,26,34], data.detailInfo.pCategoryId) >=0) { %><li class=\"btn_active\"><a href=\"/webapp/tour/detail_visa\">签证/签注</a></li><% } %>\r\n                <% if(productType===\"\") { %>  \r\n\t\t\t        <% if(data.qaNum > 0) { %><li class=\"detail_question btn_active\"><a><span><%=data.qaNum %>条</span>咨询问答</a></li><% } %>\r\n                <%}%>\r\n\t\t    </ul>\r\n\t    </div>\r\n\t    <% if(!data.isBook) { %><div class=\"product_offline_notice\">此产品暂不支持在线预订</div><%} %>\r\n    <%} %>\r\n    </div>\r\n\r\n    <div class=\"route_box js_tab_showbox\" style=\"display: none;\">\r\n    </div>\r\n\r\n    <div class=\"score_box js_tab_showbox\" style=\"display: none;\">\r\n    </div>\r\n</div>\r\n\r\n<% if(productType===\"\") { %>  \r\n    <% if(data.isBook) { %>\r\n        <% if(data.detailInfo.isTel) { %>\r\n        <footer class=\"book_now_double\"><a class=\"telphone_ask_btn js_telphone_btn\" href=\"javascript:void(0);\">电话咨询</a><a class=\"book_now_btn js_in_Footer\" href=\"javascript:void(0);\">开始预订</a></footer>\r\n        <% } else { %>\r\n        <footer class=\"book_now js_in_Footer\"><a href=\"javascript:void(0);\">开始预订</a></footer>\r\n        <%} %>\r\n    <% } else { %>\r\n        <footer class=\"book_now\"><a href=\"javascript:void(0);\" class=\"js_telphone_btn\">拨打免费服务电话</a></footer>\r\n    <%} %>\r\n<%}else{ %>\r\n    \r\n    <% if(secKillSetting.cskillStatus === \"noStarted\") {%>\r\n        <footer class=\"book_now seckill_disable js_dListime\"><%= secKillSetting.lastTime.month%>月<%= secKillSetting.lastTime.date%>日开抢</footer>\r\n    <%} else if(secKillSetting.cskillStatus === \"upcomingStart\") {%>\r\n        <footer class=\"book_now seckill_disable js_dListime\">即将开始&nbsp;<%= secKillSetting.lastTime.hour %>:<%= secKillSetting.lastTime.minute %>:<%= secKillSetting.lastTime.second %></footer>\r\n    <%} else if(secKillSetting.cskillStatus === \"start\") {%>\r\n        <% if(cskillData.Inventory != 0) {%>\r\n            <footer class=\"book_now js_in_Footer js_dListime\"><a href=\"javascript:;\">立即抢购</a></footer>\r\n        <% } else { %>\r\n            <footer class=\"book_now seckill_disable js_dListime\">抢光了</footer>\r\n        <% } %>\r\n    <%} else {%>\r\n        <footer class=\"book_now seckill_disable js_dListime\">抢光了</footer>\r\n    <%}%>\r\n\r\n<%} %>\r\n\r\n\r\n\r\n;\r\n    </script>\r\n\t<script id=\"detail_route_tab\" type=\"text/lizard-template\">        \r\n       <div class=\"route_detail mg_btm60\" <%if(data.singlePage){%>=\"\" style=\"margin-left:20px;margin-top:10px;margin-right:10px\" <%}%>=\"\">\r\n<%var traffic=['','flight','bus','train','ship','car']; %>\r\n<%var activeType=['餐饮','酒店','航班','景点','购物','自费项目','全天自由活动','自由活动','交通', '其它']; %>\r\n<%var dinner=['','早餐','午餐','晚餐'] %>\r\n<%_.each(data.intros,function(v,k){ %>\r\n    <h2 class=\"route_day\"><span>D<%=v.fewDay %></span><%=v.desc.split('_')[0] %><%if(!!v.trafficType && v.desc.split('_')[1]){ %><i class=\"<%=traffic[v.trafficType] %>\"></i><%=v.desc.split('_')[1] %><%} %>&nbsp;</h2>\r\n    <%_.each(v.dailys,function(w,l){ %>\r\n        <% if(!!w.departTimePre.trim() || !!w.departTime.trim()){%>\r\n        <h3 class=\"route_time\"><% if(!!w.departTimePre.trim()){%><%=w.departTimePre %> <%} %><%if(!!w.departTime.trim()){ %><%=w.departTime %><%} %></h3>\r\n        <%} %>\r\n        <ul class=\"route_list\">\r\n        <%_.each(w.scenics, function(scenicsNode,scenicsIndex){ %>\r\n        <li class=\"scenics\">\r\n\t\t\t<h4>前往景点:</h4>\r\n\t\t\t<div class=\"content\"><%=scenicsNode.name %></div>\r\n\t\t</li>\r\n        <%if(scenicsNode.takeTime){ %>\r\n        <li class=\"scenicstime\">\r\n\t\t\t<h4>活动时间:</h4>\r\n\t\t\t<div class=\"content\"><%=scenicsNode.takeTime %></div>\r\n\t\t</li>\r\n        <%} %>\r\n        <li>\r\n\t\t\t<div class=\"scenic_spot\"><%=scenicsNode.desc %></div>\r\n\t\t\t<div class=\"scenic_img\">\r\n            <%_.each(scenicsNode.imgs,function(scencsImage,ImageIndex){ %>\r\n                <%_.each(scencsImage.imgUrls,function(imgUrl,ImageUrlIndex){ %>\r\n                <a href=\"<%=imgUrl.value %>\"><img src=\"<%=imgUrl.value  %>\" alt=\"<%=scencsImage.imgName %>\" data-key=\"<%=imgUrl.key %>\"></a>\r\n                <%}) %>\r\n            <%}) %>\t\r\n\t\t\t</div>  \t\t\t\t\r\n\t\t</li>\r\n        <%}) %>\r\n        <%if(w.hotelNames && w.hotelNames.length){ %>\r\n        <li class=\"hotels\">\r\n\t\t\t<h4>入住酒店:</h4>\r\n\t\t\t<div class=\"content\"><%_.each(w.hotelNames,function(hotel,hotelIndex){ %><%if(!!hotelIndex){%> 或 <%} %><%=hotel %><%}) %></div>\r\n\t\t</li>\r\n        <%} %>\r\n\t\t<li>\r\n\t\t\t<% if(w.activeType!=9 && w.activeType!=3){%><h4><%=activeType[w.activeType] %>:</h4><%} %>\r\n\t\t\t<div class=\"content\"><%=w.desc %></div>\r\n\t\t</li>\r\n        <%if(!!w.distance){ %>\r\n        <li class=\"distance\">\r\n\t\t\t<h4>行驶距离:</h4>\r\n\t\t\t<div class=\"content\">约<%=w.distance %>公里</div>\r\n\t\t</li>\r\n        <%} %>\r\n        <%if(w.driveTime!='0/0'){ %>\r\n        <li class=\"drivertime\">\r\n\t\t\t<h4>行驶时间:</h4>\r\n\t\t\t<div class=\"content\">约<%=w.driveTime.split('/')[0] %>小时<%=w.driveTime.split('/')[1] %>分</div>\r\n\t\t</li>\r\n        <%} %>\r\n\r\n        <%if(w.dinnerInfo && w.dinnerInfo.desc){ %>\r\n        <li class=\"dinner\">\r\n\t\t\t<h4><%=dinner[w.dinnerInfo.dinnerType] %>:</h4>\r\n\t\t\t<div class=\"content\"><%=w.dinnerInfo.desc %></div>\r\n\t\t</li>\r\n        <%} %>\r\n        <%if(w.saleProduct){ %>\r\n        <li class=\"saleproduct\">\r\n\t\t\t<h4>营业产品:</h4>\r\n\t\t\t<div class=\"content\"><%=w.saleProduct %></div>\r\n\t\t</li>\r\n        <%} %>\r\n        <%if(w.referPrice && parseInt(w.referPrice)){ %>\r\n        <li class=\"referprice\">\r\n\t\t\t<h4>参考价格:</h4>\r\n\t\t\t<div class=\"content\"><%=w.referPrice %></div>\r\n\t\t</li>\r\n        <%} %>\r\n        <%if(w.takeTime){ %>\r\n        <li class=\"taketime\">\r\n\t\t\t<h4>占用时间:</h4>\r\n            <div class=\"content\">约<%=w.takeTime.split('/')[0] %>小时<%=w.takeTime.split('/')[1] %>分</div>\r\n\t\t</li>\r\n        <%} %>\r\n\t</ul>\r\n    <%}) %>\r\n<%}) %>\r\n</div>\r\n    </script>\r\n\t<script id=\"detail_score_tab\" type=\"text/lizard-template\">        \r\n       \t<div class=\"mg_btm60\" style=\"margin-bottom:60px\">\r\n\t\t<%if(data.pComment){ %>\r\n\t\t<div class=\"total_score\">\r\n\t\t\t<div class=\"score_people\"><%=data.commentPerson %>人点评</div>\r\n\t\t\t<ul class=\"score_ico star_<%=parseInt(data.pComment.tScore) %><%if(data.pComment.tScore%1>0){%>_half<%} %>\">\r\n\t\t\t\t<li></li>\r\n\t\t\t\t<li></li>\r\n\t\t\t\t<li></li>\r\n\t\t\t\t<li></li>\r\n\t\t\t\t<li></li>\r\n\t\t\t</ul>\r\n\t\t\t<span class=\"score_num\"><%=data.pComment.tScore.toFixed(1) %></span>\r\n\t\t</div>\r\n\t\t<ul class=\"score_detail\">\r\n\t\t<%_.each(data.pComment.comments,function(v,k){ %>\r\n\t\t\t<li class=\"detail_wrap\">\r\n\t\t\t\t<div class=\"name_wrap\">\r\n\t\t\t\t\t<span class=\"date\"><%=v.cDate %></span>\r\n\t\t\t\t\t<span class=\"name\">***<%=v.uName.substr(3,3) %></span>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"score_ico_wrap\">\r\n\t\t\t\t\t<ul class=\"score_ico star_<%=v.grade %>\">\r\n\t\t\t\t\t\t<li></li>\r\n\t\t\t\t\t\t<li></li>\r\n\t\t\t\t\t\t<li></li>\r\n\t\t\t\t\t\t<li></li>\r\n\t\t\t\t\t\t<li></li>\r\n\t\t\t\t\t</ul>\r\n\t\t\t\t\t<span class=\"score_num\"><%=v.grade %></span>\r\n\t\t\t\t</div>\r\n\t\t\t\t<dl class=\"score_txt\">\r\n\t\t\t\t\t<dt><%=v.title %></dt>\r\n\t\t\t\t\t<dd><%=v.content %></dd>\r\n\t\t\t\t</dl>\r\n\t\t\t</li>\r\n\t\t<%}) %>\r\n\t\t</ul>\r\n\t\t<%} %>\r\n\t\t<div class=\"no_more\" style=\"display:none;\">没有更多内容了</div>\r\n\t\t<div class=\"base_loading\" style=\"display:none;\"><i></i>加载中</div>\r\n\t\t<div class=\"no_comment\" <%if(data.pComment){ %>=\"\" style=\"display:none;\" <%} %>=\"\">暂无点评</div>\r\n\t</div>\r\n    </script>\r\n    <input type=\"hidden\" id=\"page_id\">\r\n<script type=\"text/javascript\">\r\nvar __SERVERDATE__ = {server:new Date(Date.parse('2014/6/5 16:28:45'.replace(/-/g,'/'))),local: new Date()}\r\n</script>\r\n\r\n<script type=\"text/javascript\" src=\"../lizard/webresource.c-ctrip.com/code/lizard/2.0/web/lizard.seed.js\" pdconfig=\"172.16.140.161/html5/tour/webresource/tour/tourConfig.js\"></script>\r\n\r\n\r\n</body>\r\n</html>");});