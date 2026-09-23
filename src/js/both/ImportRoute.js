Ext.define('Tualo.routes.eflow.Import', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'EFlow Import',
                    path: '#eflow-import'
                }
            ]
        }
    },
    url: 'eflow-import',
    handler: {
        action: function () {

            Ext.getApplication().addView('Tualo.Eflow.lazy.ImportPanel', {
                type: type,
                reportnumber: reportnumber
            });

        },
        before: function (action) {
            action.resume();
        }

    }
});