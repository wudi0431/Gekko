define(['libs', 'c', 'TourModel', 'TourStore', 'VaBaseView', 'text!DetailVisa', 'Util'], function (libs, c, VacationModel, store, BasePageView, detailVisaHtml, util) {
    var View = BasePageView.extend({
        detailVisaModel: VacationModel.DetailVisaModel.getInstance(),
        render: function (html) {
            this.$el.html(html);
        },
        events: {
            'click .js_visa_detail': 'visaDetail'
        },
        onCreate: function () {
            //this.injectHeaderView();
        },
        vaOnLoad: function (data) {
            this.vaShowLoading();
            this.detailVisaModel.param = data.detail_request_param;
            this.detailVisaModel.setParam({ reqType: [5] });
            this.detailVisaModel.excute(function (json) {
                if (json.errno == 0) {
                    var renderData = json.data;
                    this.render(_.template(detailVisaHtml)(renderData.visa));
                }
                else {
                    this.showToast(json.errmsg || '出现错误');
                    this.back('#detail');
                }
                this.setHead();
                this.headerview.show();
                this.vaHideLoading();
                this.turning();
            }, function () {
                this.showToast('网络错误，请稍候重试。');
                this.vaHideLoading();
            }, false, this);
        },
        setHead: function () {
            this.headerview.set({
                title: '签证签注',
                back: true,
                view: this,
                events: {
                    returnHandler: function () {
                        this.back()
                    }
                }
            });
        },
        
        onHide: function () {
        },
        visaDetail: function (e) {
            var ty = $(e.currentTarget).data('type');
            this.forward('detail.visa.service!' + ty);
        }
    });
    return View;
});