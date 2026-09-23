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
            console.log('Adding EFlow view');
            Ext.getApplication().addView('Tualo.eflow.lazy.EFlow', {
            });

        },
        before: function (action) {
            action.resume();
        }

    }
});