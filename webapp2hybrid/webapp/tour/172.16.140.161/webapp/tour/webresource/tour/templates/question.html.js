define(function(){return ("﻿<div class=\"nofoot\">\r\n\t<ul class=\"question_wrap\">\r\n        <%_.each(data.qas,function(v,k){ %>\r\n        <li>\r\n            <div class=\"question_product\">\r\n                <span><%=v.qDate %></span>***<%=v.uName.substr(3,3) %>\r\n            </div>\r\n            <dl class=\"question_detail\">\r\n\t\t\t\t<dt><%=v.content %></dt>\r\n\t\t\t\t<dd><%=v.reply %></dd>\r\n\t\t    </dl>\r\n        </li>\r\n        <%}) %>\r\n\t</ul>\r\n\t<div class=\"base_loading\" style=\"display:none;\"><i></i>加载中</div>\r\n    <div class=\"no_more\" style=\"display:none\">没有更多结果了</div>\r\n    <div class=\"wireless_failure\" style=\"display:none;\">\r\n\t    <div class=\"no_wifi\">\r\n\t\t<i class=\"wifi_ico\"></i>\r\n\t\t<p>网络不给力，请稍后再试试吧</p>\r\n\t\t<a class=\"try_again\" href=\"javascript:;\">重试</a>\r\n\t</div>\r\n\t    <div class=\"dial_service\">\r\n\t\t<p>或者拨打携程客服电话</p>\r\n\t\t<a class=\"dial_btn\" href=\"tel:8008206666\">联系客服</a>\r\n\t</div>\r\n</div>\t\r\n<div class=\"failure_mask\" style=\"top:400px;display:none;\">网络连接超时，请稍后重试</div>\r\n</div>");});