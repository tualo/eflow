Ext.define('Tualo.eflow.lazy.EFlow', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.layout.container.Card',
        'Tualo.eflow.lazy.controller.EFlow',
        'Tualo.eflow.lazy.models.EFlow'
    ],
    xtype: 'layout-card',
    layout: 'card',
    alias: 'widget.eflow_import',
    controller: 'eflow_import',
    viewModel: {
        type: 'eflow_import'
    },
    cls: Ext.baseCSSPrefix + 'shadow',

    itemId: 'wizzard',
    bodyPadding: 15,

    defaults: {
        border: false
    },

    filterParams: function () {
        let formValues = this.getValues();

        formValues.so = JSON.stringify(this.down('grid').getStore().getRange().filter((r) => r.get('status')).map((r) => r.get('urno')))
        let s = new URLSearchParams(formValues).toString();
        return s;
    },

    defaultListenerScope: true,

    bbar: ['->',
        {
            itemId: 'card-prev',
            text: '&laquo; Zurück',
            handler: 'showPrevious',
            disabled: true
        },
        {
            itemId: 'card-next',
            text: 'Weiter &raquo;',
            handler: function () {
                this.up('form').getController().showNext();
            }
        }
    ],

    items: [{
        itemId: 'card-0',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'container',
                height: 100,
                html: '<h2>E-Flow Rechnungsimport</h2><p> Bitte warten ... </p><p> </p>'
            }
        ]
    },
    {
        itemId: 'card-1',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'container',
                height: 100,
                html: '<h2>E-Flow Rechnungsimport</h2><p>Schritt 1 von 3</p><p> </p>'
            },

            {
                xtype: 'filefield',
                itemId: 'excel',
                name: 'excel',
                fieldLabel: 'Excel',
                labelWidth: 50,
                anchor: '100%',
                msgTarget: 'side',
                allowBlank: false,
                anchor: '100%',
                buttonText: 'Datei auswählen...',

            }
        ]
    },
    {
        itemId: 'card-2',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'container',
                height: 100,
                html: '<h2>E-Flow Rechnungsimport</h2><p>Schritt 2 von 3</p><p></p>'
            },
            {
                flex: 1,
                minHeight: 300,
                border: true,
                fieldLabel: 'Daten',
                itemId: 'daten',
                xtype: 'grid',
                /*
                store: {
                    type: 'array',
                    fields: ['kennung', 'fremdbeleg', 'typ', 'belegnummer', 'job', 'gruppe', 'freitext', 'kreditor', 'ist_job', 'type_of_service', 'datum', 'faellig', 'wert'],
                    autoLoad: true
                },
                */
                bind: {
                    store: '{eflow_data}'
                },
                selModel: 'cellmodel',
                plugins: {
                    /*groupingpanel: {

                    },*/
                    cellediting: {
                        clicksToEdit: 1
                    }
                },
                columns: [
                    {
                        align: 'start',
                        header: "Kennung",
                        xtype: 'gridcolumn',
                        width: 80,
                        dataIndex: 'kennung'
                    },
                    {
                        header: "Fremdbeleg",
                        dataIndex: 'fremdbeleg',
                        width: 120,
                    },
                    {
                        header: "Typ",
                        dataIndex: 'typ',
                        width: 40,
                    },
                    {
                        header: "Belegnummer",
                        dataIndex: 'belegnummer',
                        width: 120,
                    },
                    {
                        header: "Job",
                        dataIndex: 'job',
                        editor: 'linkedcombobox_job_jobno',
                        width: 180,
                        renderer: function (v, meta) {
                            // meta
                            // console.log();
                            return this.up('eflow_import').getController().renderJob(v, meta);
                        }
                    },
                    {
                        header: "Gruppe",
                        dataIndex: 'gruppe',
                        width: 40,
                    },
                    {
                        header: "Freitext",
                        dataIndex: 'freitext',
                        width: 120,
                    },
                    {
                        header: "Lieferant",
                        dataIndex: 'kreditor',
                        width: 90,
                        renderer: function (v, meta) {
                            // meta
                            // console.log();
                            return this.up('eflow_import').getController().renderCompany(v, meta);
                        },
                        editor: 'combobox_view_eflow_kadressen_kundenkonto',
                    },
                    {
                        header: "ist Job",
                        dataIndex: 'ist_job',
                        hidden: true,
                        width: 30,
                    },
                    {
                        header: "Leistungsart",
                        dataIndex: 'type_of_service',
                        width: 80,
                        renderer: function (v, meta) {
                            // meta
                            // console.log();
                            return this.up('eflow_import').getController().renderTos(v, meta);
                        },// DS ComboBox Artikelgruppen-gruppen_id_kurz (artikelgruppen gruppen_id_kurz) (combobox_artikelgruppen_gruppen_id_kurz - Tualo DS) 
                        editor: 'combobox_artikelgruppen_kurztext'
                    },
                    {
                        header: "Datum",
                        dataIndex: 'datum',
                        xtype: 'datecolumn',
                        format: 'd.m.Y',
                        width: 80,
                    },
                    {
                        header: "Fällg",
                        dataIndex: 'faellig',
                        xtype: 'datecolumn',
                        format: 'd.m.Y',
                        width: 80,
                    },
                    {
                        header: "Wert",
                        dataIndex: 'wert',
                        align: 'end',
                        xtype: 'numbercolumn',
                        width: 80,
                    }
                ]
            }
        ]
    },
    {
        itemId: 'card-3',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'container',
                html: '<h2>E-Flow Rechnungsimport</h2><p>Schritt 3 von 3</p><p></p>'
            },
            {
                itemId: 'progressbar-card-2',
                anchor: '100%',
                xtype: 'progressbar'
            },
        ]
    }
    ],

    listeners: {
        boxready: function () {
            this.getController().ready.bind(this.getController())();
        }
    }

});


