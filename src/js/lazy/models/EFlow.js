Ext.define('Tualo.eflow.lazy.models.EFlow', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.eflow_import',
    data: {
        record: null,
        hasRecord: false,
        import_id: null
    },
    formulas: {
        canEdit: function (get) {
            return get('hasRecord') !== false;
        }
    },
    stores: {
        /*time_mat_entry: {
            type: 'view_staff_time_mat_entry_store',
            autoLoad: false,
            autoSync: false,
            pageSize: 100000
        },*/
        eflow_data: {
            type: 'eflow_data_store',
            autoLoad: false,
            autoSync: true,

            pageSize: 100000
        }
    }
});