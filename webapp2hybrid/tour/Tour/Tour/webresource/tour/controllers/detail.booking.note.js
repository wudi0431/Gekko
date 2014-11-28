define(['libs', 'c', 'TourModel', 'VaBaseView', 'text!DetailBookingNote'], function (libs, c, VacationModel, BasePageView, bookingNoteHtml) {
    var View = BasePageView.extend({
        detailBookingNoteModel: VacationModel.DetailBookingNoteModel.getInstance(),
        render: function(html) {
            this.$el.html(html);
        },
        events: {
        },
        onCreate: function () {
            //this.injectHeaderView();
            this.render();
        },
        vaOnLoad: function (data) {
            this.vaShowLoading();
            this.detailBookingNoteModel.param = data.detail_request_param;
            this.detailBookingNoteModel.setParam({reqType:[4]});
            this.detailBookingNoteModel.excute(function (json) {
                if (json.errno == 0) {
                    var renderData = json.data;
                    this.render(_.template(bookingNoteHtml)(renderData.orderKnow));
                }
                else {
                    this.showToast(json.errmsg)
                }
                this.setHead();
                this.headerview.show();
                this.vaHideLoading();
                //this.turning();
            }, function () {
                this.showToast('网络错误，请稍候重试。');
                this.vaHideLoading();
            }, false, this);
        },
        setHead: function () {
            this.headerview.set({
                title: '预订须知',
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
        }
    });
    return View;
});
