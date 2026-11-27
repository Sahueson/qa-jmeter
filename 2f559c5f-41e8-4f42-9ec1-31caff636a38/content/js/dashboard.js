/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9446640316205533, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "setup login admin_foe"], "isController": false}, {"data": [0.95, 500, 1500, "PERF-10 Faltas FOE (jugador FOE)"], "isController": false}, {"data": [0.0, 500, 1500, "setup login superadmin"], "isController": false}, {"data": [0.98, 500, 1500, "PERF-16 Ping keep_alive"], "isController": false}, {"data": [0.97, 500, 1500, "PERF-07 Inscripciones con su partida embebida"], "isController": false}, {"data": [0.93, 500, 1500, "PERF-05 Partidas del super admin"], "isController": false}, {"data": [0.5, 500, 1500, "setup login player_foe"], "isController": false}, {"data": [0.97, 500, 1500, "PERF-11 Excedencias consultadas por un jugador FOE"], "isController": false}, {"data": [0.96, 500, 1500, "PERF-13 Perfiles de la unidad del jugador MAD"], "isController": false}, {"data": [0.93, 500, 1500, "PERF-06 Inscripciones del jugador MAD"], "isController": false}, {"data": [0.98, 500, 1500, "PERF-15 Documentos del equipo (jugador MAD)"], "isController": false}, {"data": [0.95, 500, 1500, "PERF-14 Fechas sin partida del jugador MAD"], "isController": false}, {"data": [0.91, 500, 1500, "PERF-04 Partidas del jugador MAD"], "isController": false}, {"data": [0.5, 500, 1500, "PERF-01 Login por contraseña"], "isController": false}, {"data": [0.97, 500, 1500, "PERF-09 Votaciones de la Junta (admin FOE)"], "isController": false}, {"data": [0.93, 500, 1500, "PERF-03 Partidas visibles para un anónimo (RLS)"], "isController": false}, {"data": [0.96, 500, 1500, "PERF-08 Asistencia consultada por el super admin"], "isController": false}, {"data": [0.91, 500, 1500, "PERF-02 Lectura del propio perfil"], "isController": false}, {"data": [0.5, 500, 1500, "setup login player_mad"], "isController": false}, {"data": [0.97, 500, 1500, "PERF-12 Perfiles vistos por el super admin"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 759, 0, 0.0, 258.59815546772074, 161, 2437, 187.0, 503.0, 537.0, 755.799999999999, 15.829648786185036, 31.49371291555435, 15.667098829721782], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["setup login admin_foe", 1, 0, 0.0, 1917.0, 1917, 1917, 1917.0, 1917.0, 1917.0, 1917.0, 0.5216484089723527, 1.5715677164840898, 0.17982606285863328], "isController": false}, {"data": ["PERF-10 Faltas FOE (jugador FOE)", 50, 0, 0.0, 244.24000000000004, 165, 590, 187.0, 508.9, 562.05, 590.0, 1.463229053876094, 2.1902709900207777, 1.6304144047584208], "isController": false}, {"data": ["setup login superadmin", 1, 0, 0.0, 2437.0, 2437, 2437, 2437.0, 2437.0, 2437.0, 2437.0, 0.4103405826836274, 1.239837659006976, 0.1418560217480509], "isController": false}, {"data": ["PERF-16 Ping keep_alive", 50, 0, 0.0, 212.69999999999996, 162, 558, 182.0, 293.2, 504.5999999999999, 558.0, 1.515564851019975, 1.497389913158134, 0.3862914317541148], "isController": false}, {"data": ["PERF-07 Inscripciones con su partida embebida", 50, 0, 0.0, 243.16000000000003, 168, 538, 187.5, 498.2, 516.8499999999999, 538.0, 1.4347613991793164, 2.67896855003013, 1.6099031715400731], "isController": false}, {"data": ["PERF-05 Partidas del super admin", 50, 0, 0.0, 259.97999999999996, 163, 556, 190.0, 529.3, 548.25, 556.0, 1.4194061204791915, 12.710615472236416, 1.5455447503264634], "isController": false}, {"data": ["setup login player_foe", 1, 0, 0.0, 866.0, 866, 866, 866.0, 866.0, 866.0, 866.0, 1.1547344110854503, 3.489011980369515, 0.3991952944572748], "isController": false}, {"data": ["PERF-11 Excedencias consultadas por un jugador FOE", 50, 0, 0.0, 254.31999999999996, 161, 536, 184.0, 492.09999999999997, 523.8, 536.0, 1.4721903247651855, 2.409273970938963, 1.6533387436327769], "isController": false}, {"data": ["PERF-13 Perfiles de la unidad del jugador MAD", 50, 0, 0.0, 250.84000000000006, 161, 540, 184.0, 496.4, 518.6999999999999, 540.0, 1.4999250037498126, 2.1777915010499473, 1.659584989500525], "isController": false}, {"data": ["PERF-06 Inscripciones del jugador MAD", 50, 0, 0.0, 279.1599999999999, 164, 592, 191.5, 514.0, 540.05, 592.0, 1.4335684385572567, 1.7315098790785022, 1.5973648324158496], "isController": false}, {"data": ["PERF-15 Documentos del equipo (jugador MAD)", 50, 0, 0.0, 213.79999999999998, 163, 532, 179.0, 448.7999999999997, 490.6999999999999, 532.0, 1.5146007512419726, 1.6962640952532413, 1.6846975152974675], "isController": false}, {"data": ["PERF-14 Fechas sin partida del jugador MAD", 50, 0, 0.0, 223.37999999999997, 164, 541, 186.5, 499.79999999999995, 532.5, 541.0, 1.513454611496201, 1.9578841053213065, 1.699680471895148], "isController": false}, {"data": ["PERF-04 Partidas del jugador MAD", 50, 0, 0.0, 279.38000000000005, 166, 579, 190.5, 536.0, 561.55, 579.0, 1.4047311344608642, 2.5320553060206774, 1.5542581790470305], "isController": false}, {"data": ["PERF-01 Login por contraseña", 5, 0, 0.0, 690.6, 609, 781, 681.0, 781.0, 781.0, 781.0, 1.0869565217391304, 3.2840098505434785, 0.37576426630434784], "isController": false}, {"data": ["PERF-09 Votaciones de la Junta (admin FOE)", 50, 0, 0.0, 245.99999999999994, 161, 553, 186.5, 491.9, 525.8, 553.0, 1.4483937313519306, 2.585184787882738, 1.5954962196923612], "isController": false}, {"data": ["PERF-03 Partidas visibles para un anónimo (RLS)", 50, 0, 0.0, 257.7200000000001, 163, 552, 182.5, 523.1, 536.5, 552.0, 1.3912849908175189, 1.3435682633980743, 0.33831051046246313], "isController": false}, {"data": ["PERF-08 Asistencia consultada por el super admin", 50, 0, 0.0, 239.34, 165, 546, 190.5, 491.79999999999995, 539.25, 546.0, 1.4494434137291279, 2.6935584469938543, 1.6263774241941094], "isController": false}, {"data": ["PERF-02 Lectura del propio perfil", 50, 0, 0.0, 313.36, 162, 2375, 188.0, 528.5, 893.699999999997, 2375.0, 1.311028370653941, 1.5413801523414967, 1.4608236044102996], "isController": false}, {"data": ["setup login player_mad", 1, 0, 0.0, 840.0, 840, 840, 840.0, 840.0, 840.0, 840.0, 1.1904761904761907, 3.5970052083333335, 0.4115513392857143], "isController": false}, {"data": ["PERF-12 Perfiles vistos por el super admin", 50, 0, 0.0, 217.88000000000002, 164, 535, 178.5, 453.9, 514.0999999999999, 535.0, 1.484560570071259, 3.04865531287114, 1.6556329795130642], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 759, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
