Ext.define('Tualo.eflow.Loader', {
    singleton: true,

    constructor: function () {
        Ext.Loader.setPath('Tualo.eflow.lazy', './jseflow');
    }
});
Ext.Loader.setPath('Tualo.eflow.lazy', './jseflow');