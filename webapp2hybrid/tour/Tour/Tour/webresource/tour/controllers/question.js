define(['libs', 'c', 'cPageView', 'text!Question', 'TourModel'], function (libs, c, pageview, questionTemplate, model) {
    "use strict"
    var addmoreLoading = 0, onceCount = 10, qasData = {}, showmore, addmoreCompleted, $baseLoad, $noMore;
    var View = pageview.extend({
        questionModel: model.QuestionModel.getInstance(),
        render: function (tpl) {
            this.$el.html(tpl);
        },
        onCreate: function () {
            //this.injectHeaderView();
        },
        events: {
        },
        onShow: function () {
            var self = this;
            addmoreCompleted = undefined; addmoreLoading = undefined;
            var pid = Lizard.P("productId") || Lizard.P("productid") || '';
            var saleCityId = Lizard.P("saleCityId") || Lizard.P("salecityid") || '';
            var departCityId = Lizard.P("departCityId") || Lizard.P("departcityid") || '';
            if (!pid || !saleCityId) { self.showToast("产品ID错误， 请返回上页重新进入", 3, function () { self.back(); }); }
            else {
                self.showLoading();
                this.headerview.set({
                    title: '咨询问答',
                    back: true,
                    home: false,
                    view: self,
                    tel: null,
                    events: {
                        returnHandler: function () {
                            self.back();
                        }
                    }
                });
                self.headerview.show();
                self.questionModel.param.pId = pid;
                self.questionModel.param.scId = saleCityId;
                self.questionModel.param.dcId = departCityId;
                self.questionModel.param.start = 0;
                self.questionModel.param.count = onceCount;
                self.questionModel.excute(function (data) {
                    self.hideLoading();
                    if (data.errno == 0) {
                        qasData = data.data;
                        self.render(_.template(questionTemplate)({ "data": qasData }));
                        self.turning();
                        $(window).bind("scroll", function () { self.onWindowScroll(self); });
                        $baseLoad = self.$el.find(".base_loading");
                        $noMore = self.$el.find(".no_more");
                        if (!qasData || (qasData && !qasData.qas)) { addmoreCompleted = 2; }
                        else if (qasData && qasData.qas && qasData.qas.length < onceCount) { addmoreCompleted = 1; $noMore.show(); }
                    }
                    else {
                        self.turning();
                        self.showToast(data.errmsg, 3, function () { self.back(); });
                    }
                }, function (errorInfo) {
                    self.showToast('网络错误，请稍候重试。', 3, function () { self.back(); });
                    self.hideLoading();
                }, false, this);
            }
        },
        onWindowScroll: function (self) {
            var currentScroll;
            if (!$baseLoad.height() && !addmoreLoading && !addmoreCompleted) {
                $baseLoad.show()
            }
            function showMore() {
                var checkHeight = $("#headerview")[0].clientHeight + $(".question_wrap")[0].clientHeight;

                if (currentScroll + $(window).height() >= checkHeight) {
                    //console.log("scrollDown");
                    !addmoreLoading && self.addmore();
                }
            }
            if (addmoreCompleted) {
                addmoreCompleted < 2 && $noMore.show();
                $(window).unbind("scroll");
            }
            else {
                currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
                // 300毫秒延时，防止连续请求
                clearTimeout(showmore);
                showmore = setTimeout(showMore, 300);
            }
        },
        addmore: function () {
            var self = this;
            //$baseLoad.show(); 
            self.questionModel.param.start += onceCount;
            self.questionModel.excute(function (response) {
                if (response.errno == 0) {
                    var responseData = response.data;
                    addmoreLoading = 1;
                    if (!!responseData.qas && responseData.qas.length) {
                        var tpl = '<%_.each(data.qas,function(v,k){ %>\
                            <li>\
                                <div class="question_product">\
                                    <span><%=v.qDate %></span>***<%=v.uName.substr(3,3) %>\
                                </div>\
                                <dl class="question_detail">\
		                            <dt><%=v.content %></dt>\
		                            <dd><%=v.reply %></dd>\
	                            </dl>\
                            </li>\
                            <%}) %>';
                        var template = _.template(tpl);
                        self.$el.find(".question_wrap").append(template({ data: responseData }));
                        qasData.qas = qasData.qas.concat(responseData.qas);
                        if (responseData.qas.length == onceCount) { addmoreLoading = 0; }
                        else { $noMore.show(); addmoreCompleted = 1; }
                    }
                    else {
                        $noMore.show();
                        addmoreCompleted = 1;
                    }
                    $baseLoad.hide();
                }
            },
            function (errorInfo) {
                //console.info(errorInfo);
            }, false, this);
        },
        
        onHide: function () {
            $(window).unbind("scroll");
        }
    })
    return View;
});