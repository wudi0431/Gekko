define(function(){return ("<div class=\"body\">\r\n    <div class=\"fixed_top\" <%if(isInApp){ %>=\"\" style=\"top:0\" <%} %>=\"\">\r\n        <div class=\"select_num_box basefix\">\r\n            <div class=\"man_box\">\r\n                <div class=\"room_num\">\r\n                    <i class=\"list_num_dec\">-</i>\r\n                    <span class=\"list_num\"><%= adult_num %></span>\r\n                    <i class=\"list_num_inc num_invalid\">+</i>\r\n                </div>成人\r\n            </div>\r\n            <% if(ischildbook){ %>\r\n            <div class=\"child_box\">\r\n                <div class=\"room_num\">\r\n                    <i class=\"list_num_dec\">-</i>\r\n                    <span class=\"list_num\"><%= child_num %></span>\r\n                    <i class=\"list_num_inc num_invalid\">+</i>\r\n                </div>儿童<i class=\"child_notice js-notice-step1\"></i>\r\n                <div class=\"child_notice_pop js-notice-pop-step1\" style=\"display:none;\">儿童标准：2-12岁</div>\r\n            </div>\r\n            <% } %>\r\n        </div>\r\n    </div>\r\n    <div class=\"price_calendar\">\r\n        <div class=\"calendar_title\">\r\n            <h2>请选择出发日期</h2>\r\n            <span>代表已成团</span>\r\n        </div>\r\n        <div id=\"js-calendar-wrapper\"></div>\r\n    </div>\r\n</div>\r\n<footer class=\"book_next\">\r\n    <div class=\"next_col\">\r\n        <span class=\"js-price-step1\" style=\"display: none;\">订单总额：<dfn>¥</dfn><span>--</span></span>\r\n        <i class=\"loading_ico js-loading-step1\" style=\"display:none\"></i>\r\n        <em class=\"price_detail js-price-detail\" style=\"display:none\">费用明细</em>\r\n        <a href=\"javascript:;\" class=\"btn_next\">下一步</a>\r\n    </div>\r\n</footer>");});