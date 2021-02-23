'use strict';

(function(){
    $(document).ready(function(){
        tableau.extensions.initializeAsync().then(function(){
            const dashboard = tableau.extensions.dashboardContent.dashboard;

            //This allows for multiple promises to wait for each other
            let dataSourceFetchPromises=[];

            //This stores the actual dataSources in the dashboard
            let dashboardDataSources = {};
            
            dashboard.worksheets.forEach(function (worksheet) {
                dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
            });
            Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
                fetchResults.forEach(function (dataSourcesForWorksheet) {
                  dataSourcesForWorksheet.forEach(function (dataSource) {
                    console.log(dataSource.id);
                    if (!dashboardDataSources[dataSource.id]) { // We've already seen it, skip it.
                        dashboardDataSources[dataSource.id] = dataSource;
                    }
                  });
                });
                buildContentTable(dashboardDataSources);
            });

        });
    });
    function buildContentTable(dataSources){
        for (let dataSourceId in dataSources) {
            const dataSource = dataSources[dataSourceId];
            dataSource.getLogicalTablesAsync().then(function (logicalTables) {
                logicalTables.forEach(function(table){
                    dataSource.getLogicalTableDataAsync(table.id).then(function (dataTable){
                        console.log(dataTable);
                        // lista de los valores para el autocompletado
                        let list = [];
                        // patrón en RegEx para algunas columnas irrelevantes
                        let patt = /[0-9]/
                        dataTable.columns.forEach(function (field){
                            // Filtra columnas que no competen (Probablemente se puede simplificar un poco)
                            if (!field.fieldName.startsWith("Inv") && !field.fieldName.startsWith("Venta")
                            && !field.fieldName.startsWith("Cod") && field.dataType =="string"
                            && !field.fieldName.startsWith("Estilo") && !patt.test(field.fieldName)){
                                // Ciclo para los datos
                                for (let row of dataTable.data) {
                                    // Evita duplicados
                                    if(list.find(o=>o.value===row[field.index].value && o.column===field.fieldName)===undefined){
                                        const option={
                                            value:row[field.index].value,
                                            column:field.fieldName
                                        }
                                        list.push(option);
                                    }
                                    
                                }
                            }
                            
                        })
                        console.log(list)
                    })
                });
                
            });
        }
    }
})();