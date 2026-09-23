Ext.define('Tualo.Eflow.Loader', {
    singleton: true,

    constructor: function () {
        Ext.Loader.setPath('Tualo.Eflow.lazy', './jseflow');
    }
});
