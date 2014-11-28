define(function(){return ("<div class=\"pure_txt_wrap\">\r\n    <h2><%=contractDesc %></h2>\r\n    <% if(knows) { %>\r\n    <% _.each(knows, function (v, k) { %>\r\n        <% if(v.descs) { %>\r\n            <h2><%=v.title %></h2>\r\n            <% _.each(v.descs, function (m, n) { %>\r\n            <div><%=m.detail %></div>\r\n            <% }) %>\r\n        <% } %>\r\n    <% }) %>\r\n    <% } %>\r\n    <% if(safety) { %>\r\n        <h2>安全指南</h2>\r\n        <div><%=safety %><% if(safetyUrl) { %><a href=\"<%=safetyUrl %>\">查看详情</a><% } %></div>\r\n    <% } %>\r\n    <% if(pays) { %>\r\n        <% _.each(pays, function (v, k) { %>\r\n            <h2><%=v.type %></h2>\r\n            <div><%=v.desc %></div>\r\n        <% }) %>\r\n    <% } %>\r\n</div>\r\n");});