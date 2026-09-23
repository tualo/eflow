Ext.define('Tualo.Eflow.lazy.ImportPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'eflowImportLazyPanel',

    title: 'EFlow Import',
    html: 'Die Zeit wird geladen...',

    initComponent: function () {
        this.callParent(arguments);
        this.loadTime();
    },

    loadTime: function () {
        Ext.Ajax.request({
            url: '/eflow/time',
            success: function (response) {
                var data = Ext.decode(response.responseText);
                this.update('<div><strong>Zeit:</strong> ' + data.datetime + '<br/>' +
                    '<strong>Zeitzone:</strong> ' + data.timezone + '</div>');
            },
            scope: this
        });
    }
});
