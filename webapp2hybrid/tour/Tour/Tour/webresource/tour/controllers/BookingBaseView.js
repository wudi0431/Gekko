//汉字
define(['VaBaseView'], function (TourBaseView) {
    return TourBaseView.extend({
        events: {
            // tip 折叠/展开
            'click .js-tip-wrapper .js-tip-title': 'onTipTitleClick'
        },
        // tip title click
        onTipTitleClick: function (e) {
            var titleNode = $(e.currentTarget), contentNode = titleNode.siblings('.js-tip-content');
            var isNowOpen = titleNode.hasClass('open');
            if (isNowOpen) {
                titleNode.removeClass('open');
                contentNode.addClass('hidden');
            }
            else {
                titleNode.addClass('open');
                contentNode.removeClass('hidden');
            }
        }
    });
});