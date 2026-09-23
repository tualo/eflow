CREATE  OR REPLACE PROCEDURE `eflow_report`(uid varchar(36))
    COMMENT 'Procedure to convert eflow_sync entries '
BEGIN 
    DECLARE position_object JSON;
    DECLARE report_object JSON;
    DECLARE report_result_object JSON;
    DECLARE report_urno int;

    set @sessionuser = 'thomas.hoffmann@tualo.de';

    for record in (
        select 
            h.belegnummer 
        from 
            eflow_data h 
            join kadressen 
                on (kadressen.kundenkonto = h.kreditor or kadressen.kundenkonto=replace('11000','',h.kreditor) )
            join tualo_job j
                 on j.job_number = h.job
        where h.processed  = 0
            and h.uid = uid
        group by h.belegnummer
        order by belegnummer desc
    ) do




        select 
            json_arrayagg(
                    json_object(
                        "id", UNIX_TIMESTAMP()*1000 + cast(round(rand()*100) as int),
                        "tos_link", artikelgruppen.gruppen_id,
                        "article", artikelgruppen.gruppen_id,
                        "artikel_text", artikelgruppen.langtext,
                        "uid", p.uid,
                        "position", 0,
                        "account", p.kennung,
                        "amount", 1,
                        "vdatum", p.datum,
                        "notes", p.freitext,
                        "additionaltext", "",
                        "singleprice", p.wert,
                        "tax", 0,
                        "net", p.wert,
                        "taxvalue", 0,
                        "gross", p.wert
                    )
            ) position_object
        into position_object
        from 
            eflow_data p
            join artikelgruppen on p.type_of_service = artikelgruppen.kurztext
        where p.belegnummer = record.belegnummer
        group by p.belegnummer
    ;



        select 
            p.belegnummer,
            json_object(

                "id", p.belegnummer,
                
                "job_link", j.id,
                "jobno", j.job_number,
                "jobid", j.job_number,
                "import_uid", p.uid,

                "payuntildate", cast(p.faellig + interval +  3 hour as date),

                "date", cast(p.datum + interval +  3 hour as date),
                "bookingdate",  cast(p.datum  + interval +  3 hour as date),
                "buchungsdatum", cast(p.datum + interval +  3 hour as date),
        
                "service_period_start", cast(p.datum  + interval +  3 hour as date),
                "service_period_stop", cast(p.datum  + interval +  3 hour as date),

                "address", concat(
                    kadressen.name,char(10),
                    kadressen.strasse,char(10),
                    kadressen.plz,' ',kadressen.ort,char(10)
                ),
                "create_timestamp", cast(p.created_at  + interval +  2 hour as datetime),
                
                "time", cast(p.created_at  + interval +  2 hour as time),

                "warehouse", 0,
                "_in_warehouse"  , 0,
                "tabellenzusatz", "rechnung",

                "referencenr", kadressen.kundennummer,
                "reference", p.fremdbeleg,
                "costcenter", 0,

                "companycode", "0000",
                "kindofbill", "netto",
                "texts", json_array(),
                "positions", json_merge('[]',position_object),
                "office", 1 
                
            ) hdr 
        into
            report_urno,
            report_object            
        from
            eflow_data p 
            join kadressen 
                on (kadressen.kundenkonto = p.kreditor or kadressen.kundenkonto=replace('11000','',p.kreditor) )
            join tualo_job j
                 on j.job_number = p.job
        where p.belegnummer = record.belegnummer
        group by p.belegnummer
        ;

        select position_object;
        select report_object,report_urno;

        call setReport('eingangsrechnung', report_object, report_result_object);
        select concat(
            "update eflow_data set processed = 1, reportid = " , json_value(report_result_object, '$.id') , " where belegnummer = " , record.belegnummer , ";"
        );
        update eflow_data set processed = 1, reportid = json_value(report_result_object, '$.id') where belegnummer = record.belegnummer;

    end for;

END