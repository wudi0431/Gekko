define(["cModel", "cBase", 'tourapp/models/vacationStore', 'tourapp/models/vacationModel'], function(cModel, cBase, vStore, vModel) {
    var DetailModel = new cBase.Class(vModel, {
        __propertys__: function() {
            this.url = '/detail.ashx';
            this.param = {};
            this.result = vStore.DetailStore.getInstance();
            this.dataformat = function(data) {

            };
        },
        initialize: function($super, options) {
            $super(options);
        }
    });
    return DetailModel;
});