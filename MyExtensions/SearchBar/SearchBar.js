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
                        let field = dataTable.columns.find(column => column.fieldName === "Div Consolidada");
                        let list = [];
                        for (let row of dataTable.data) {
                            list.push(row[field.index].value);
                        }
                        let values = list.filter((el, i, arr) => arr.indexOf(el) === i);
                        console.log(values)
                    })
                });
                
            });
        }
        //return content
    }
})();