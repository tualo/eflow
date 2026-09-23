Ext.define('Tualo.eflow.lazy.controller.EFlow', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.eflow_import',

    renderJob: function (v, meta) {
        console.log('renderJob called with value:', v);
        if (this.getView().jobs[v] == null) {
            console.log(this.getView().jobs);
            meta.tdStyle = 'background-color: rgba(255,0,0,0.5);';

            if (this.getView().jobs[v.toLowerCase().replace(/[^0-9a-z]/g, '')] != null) {
                console.log(this.getView().jobs);
                meta.tdStyle = 'background-color: rgba(0,255,0,0.5);';
            }

        }


        return v;
    },

    renderTos: function (v, meta) {
        if (this.getView().tos[v] == null) {
            console.log(this.getView().tos);
            meta.tdStyle = 'background-color: rgba(255,0,0,0.5);';
        }
        return v;
    },

    uuidV4: function () {
        const uuid = new Array(36);
        for (let i = 0; i < 36; i++) {
            uuid[i] = Math.floor(Math.random() * 16);
        }
        uuid[14] = 4; // set bits 12-15 of time-high-and-version to 0100
        uuid[19] = uuid[19] &= ~(1 << 2); // set bit 6 of clock-seq-and-reserved to zero
        uuid[19] = uuid[19] |= (1 << 3); // set bit 7 of clock-seq-and-reserved to one
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        return uuid.map((x) => x.toString(16)).join('');
    },

    renderCompany: function (v, meta) {
        if (this.getView().kadressen[v] == null) {
            console.log(this.getView().kadressen);
            meta.tdStyle = 'background-color: rgba(255,0,0,0.5);';

            if (this.getView().kadressen[(v + "").replace('11000', '')] != null) {
                console.log(this.getView().kadressen);
                meta.tdStyle = 'background-color: rgba(0,255,0,0.5);';
            }

        }
        return v;
    },


    ready: function () {
        var me = this;

        // me.callParent(arguments);
        console.log('onBoxReady called');
        this.asyncInitialation();


    },

    asyncInitialation: async function () {
        var me = this, v = me.getView();

        let res = await fetch('./ds/tualo_job/read?limit=1000000', {});
        res = await res.json();
        v.jobs = {};
        res.data.forEach((row) => {
            v.jobs[row.job_number] = row;
            v.jobs[row.job_number.toLowerCase().replace(/[^0-9a-z]/g, '')] = row;

        });

        res = await fetch('./ds/type_of_service/read?limit=1000000', {});
        res = await res.json();

        v.tos = {};
        res.data.forEach((row) => {
            v.tos[row.shortcut] = row;
        });
        res = await fetch('./ds/view_eflow_kadressen/read?limit=1000000', {});
        res = await res.json();

        v.kadressen = {};
        res.data.forEach((row) => {
            v.kadressen[row.kundenkonto] = row;
        });



        const formData = new FormData();
        let filter = [{ "property": "processed", "value": false, "operator": "eq" }]
        formData.append("filter", JSON.stringify(filter));

        res = await fetch('./ds/eflow_data/read?limit=10000', {
            method: "POST",
            body: formData,
        })
        res = await res.json();
        if (res.success && res.data.length > 0) {
            let store = this.getView().getComponent('card-2').getComponent('daten').getStore();
            store.add(res.data);
            this.doCardNavigation(2);
        } else {
            this.doCardNavigation(1);
        }

    },


    readData: async function () {
        var me = this;

        const inputElement = this.getView().getComponent('card-1').getComponent('excel').button.fileInputEl.dom; //document.getElementById(item.id+"-inputEl");
        const fileList = inputElement.files;

        let uuid = this.uuidV4();

        console.log('readData', fileList);

        let chunks = [];
        let maxJunkSize = 8;

        if (fileList.length > 0) {
            const file = fileList[0];

            let rows = await readXlsxFile(file);
            rows.forEach((row, index) => {
                if ((row[4] == null) && (row[4] == null)) {
                    rows[index][4] = 'WVD-DM_08_016';
                    rows[index][9] = 'INT20';
                }
            })
            rows = rows.filter((row) => {
                if (Ext.isEmpty(row[0])) return false;
                return true;
            })
            console.log('Filtered rows:', rows);

            console.log('Adding rows to store:', uuid, rows);
            chunks = [];
            for (let i = 0; i < rows.length; i += maxJunkSize) {
                chunks.push(rows.slice(i, i + maxJunkSize));
            }


            /*
            for (const chunk of chunks) {
                store.add(chunk.map((row) => {
                    let obj = {};
                    fieldNames.forEach((field, index) => {
                        obj[field] = row[index];
                    });
                   
                    obj['import_id'] = uuid
                    return obj;
                }));
            }*/

            me.postProcessChunks(chunks, uuid);

        }

    },
    postProcessChunks: async function (chunks, uuid) {
        var me = this;
        let rowIndex = 0;
        let store = this.getView().getComponent('card-2').getComponent('daten').getStore();
        let fieldNames = ['kennung', 'fremdbeleg', 'typ', 'belegnummer', 'job', 'gruppe', 'freitext', 'kreditor', 'ist_job', 'type_of_service', 'datum', 'faellig', 'wert', 'row_index'];
        let processedChunks = [];
        for (const chunk of chunks) {

            let processedChunk = [];
            for (const row of chunk) {
                let obj = {};
                fieldNames.forEach((field, index) => {
                    obj[field] = row[index];
                });

                obj['import_id'] = uuid;
                obj['row_index'] = rowIndex++;

                let md5Data = '';
                fieldNames.forEach((f) => {
                    md5Data += obj[f];
                });
                obj['uid'] = await me.calculateSHA1(md5Data)

                processedChunk.push(obj);

            }

            console.log('Processed chunk:', processedChunk);
            store.add(processedChunk);

            /*
            processedChunks.push(chunk.map((row) => {
                let obj = {};
                fieldNames.forEach((field, index) => {
                    obj[field] = row[index];
                });
                obj['import_id'] = uuid;
                return obj;
            }));
            */
            processedChunks.push(processedChunk);
        }
    },
    showNext: async function () {
        var me = this,
            v = me.getView(),
            l = v.getLayout(),
            i = l.activeItem.itemId.split('card-')[1],
            next = parseInt(i, 10);
        console.log(next);
        if (next == 1) {
            await this.readData();
        }
        if (next == 2) {
            // alert(123);

            me.currentImportPosition = 0;
            me.importReports();
        }
        this.doCardNavigation(1);
    },

    calculateSHA1: async function (text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    importReports: async function () {
        let me = this,
            v = me.getView(),
            store = v.getComponent('card-2').getComponent('daten').getStore(),
            data = store.getRange(),
            progressbar = v.getComponent('card-3').getComponent('progressbar-card-2'),
            fields = ['kennung', 'fremdbeleg', 'typ', 'belegnummer', 'job', 'gruppe', 'freitext', 'kreditor', 'ist_job', 'type_of_service', 'datum', 'faellig', 'wert'],
            total = data.length;

        window.me = v;

        let currentObject = data[me.currentImportPosition],
            md5Data = '';
        fields.forEach((f) => {
            md5Data += currentObject.get(f);
        });




        progressbar.updateProgress(me.currentImportPosition / total, 'Verarbeiten', true);

        let res = await fetch('./eflow/report?uid=' + currentObject.get('uid'), {
            method: 'get',
        });
        res = await res.json();

        await new Promise(resolve => setTimeout(resolve, 200));
        me.currentImportPosition++;
        if (me.currentImportPosition < total) {
            me.importReports.bind(me)();
        } else {
            Ext.MessageBox.alert('Import', 'Die Daten wurden verarbeitet');
            store.load();
            me.asyncInitialation();
        }

    },
    importData: async function () {
        let me = this,
            v = me.getView(),
            store = v.getComponent('card-2').getComponent('daten').getStore(),
            data = store.getRange(),
            progressbar = v.getComponent('card-3').getComponent('progressbar-card-2'),
            fields = ['kennung', 'fremdbeleg', 'typ', 'belegnummer', 'job', 'gruppe', 'freitext', 'kreditor', 'ist_job', 'type_of_service', 'datum', 'faellig', 'wert'],
            total = data.length;

        window.me = v;

        let currentObject = data[me.currentImportPosition],
            md5Data = '';
        fields.forEach((f) => {
            md5Data += currentObject.get(f);
        });

        let route = 'update';
        if (Ext.isEmpty(currentObject.get('uid'))) {
            currentObject.set('uid', await me.calculateSHA1(md5Data));
            console.log(currentObject, md5Data);
            route = 'create';
        }


        progressbar.updateProgress(me.currentImportPosition / total, 'Importieren', true);

        let res = await fetch('./ds/eflow_data/' + route, {
            method: 'post',
            body: JSON.stringify(currentObject.data)
        });
        res = await res.json();

        await new Promise(resolve => setTimeout(resolve, 200));
        me.currentImportPosition++;
        if (me.currentImportPosition < total) {
            me.importData();
        } else {
            // alert('done');
            if (route == 'create') {
                Ext.MessageBox.alert('Import', 'Die Daten wurden importiert');
            } else {
                Ext.MessageBox.alert('Import', 'Die Daten wurden geändert');
            }
        }

    },

    showPrevious: function (btn) {
        this.doCardNavigation(-1);
    },

    doCardNavigation: function (incr) {
        var me = this,
            v = me.getView(),
            l = v.getLayout(),
            i = l.activeItem.itemId.split('card-')[1],
            next = parseInt(i, 10) + incr;

        l.setActiveItem(next);

        v.down('#card-prev').setDisabled(next === 0);
        v.down('#card-next').setDisabled(next === 3);
    }
});