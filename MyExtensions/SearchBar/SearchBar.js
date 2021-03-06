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
                
                async function makeAutocomplete (){
                    let list =await buildContentTable(dashboardDataSources);
                    document.getElementById('SearchBar').setAttribute('hidden', false);
                    let searchBar=document.getElementById('txtSearch');
                    autocomplete(searchBar, list);
                }
                makeAutocomplete();
                // buildContentTable(dashboardDataSources);
                // let searchBar = document.getElementById('txtSearch');
                // autocomplete(searchBar, list);
            });

        });
    });
    function buildContentTable(dataSources){
        return new Promise((resolve, reject)=>{
            for (let dataSourceId in dataSources) {
                const dataSource = dataSources[dataSourceId];
                dataSource.getLogicalTablesAsync().then(function (logicalTables) {
                    logicalTables.forEach(function(table){
                        dataSource.getLogicalTableDataAsync(table.id, 100000).then(function (dataTable){
                            console.log(dataTable);
                            // lista de los valores para el autocompletado
                            let list = [];
                            // patrón en RegEx para algunas columnas irrelevantes
                            let patt = /[0-9]/
                            
                            dataTable.columns.forEach(function (field){
                                // Filtra columnas que no competen (Probablemente se puede simplificar un poco)
                                if (!field.fieldName.startsWith("Cod") && field.dataType =="string"
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
                            resolve(list);
                        })
                    });
                    
                });
            }
        })
        
    }
    function autocomplete(inp, arr){
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        // Array for the filtervalues
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            var a, b, c, content, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i].value.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                // first a div for columns with the matching element
                if (document.getElementById("div-"+arr[i].column)===null){
                    c = document.createElement("button");
                    c.className="collapsible";
                    c.id = "div-"+arr[i].column;
                    c.innerHTML = arr[i].column;
                    content=document.createElement("div");
                    content.className="content";
                    
                    c.addEventListener("click", function(){
                        this.classList.toggle("active");
                        var content = this.nextElementSibling;
                        if (content.style.display === "block") {
                            content.style.display = "none";
                        } else {
                            content.style.display = "block";
                        }
                    });
                    a.appendChild(c);
                    a.appendChild(content);
                }
                // Then a div for each element of each column
                b = document.createElement("DIV");
                b.setAttribute("class", "autocomplete-match")
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].value.substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].value.substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i].value + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    // Esto filtra realmente el libro
                    const dashboard = tableau.extensions.dashboardContent.dashboard;
                    const worksheet = dashboard.worksheets.find(w=>w.name==='Hoja 2')
                    let values=[this.textContent]
                    worksheet.applyFilterAsync(this.parentNode.previousSibling.textContent,values,"add", false )
                    // Lista con los filtros aplicados
                    let filterContainer=document.getElementById('ActiveFilters');
                    // Objeto representante del nuevo filtro
                    let newFilter = document.createElement('input');
                    newFilter.type='checkbox';
                    newFilter.className='css-checkbox';
                    newFilter.id='cb-'+this.textContent+'-'+this.parentNode.previousSibling.textContent
                    newFilter.checked=true
                    newFilter.value=this.textContent;
                    newFilter.addEventListener('click', (event)=>{
                        console.log('Clickitty-Click')
                        // worksheet.applyFilterAsync(this.id.split('-')[2],[this.value],"remove", false)
                    })
                    var label = document.createElement('label');
                    label.className='css-label'
                    label.htmlFor='cb'+this.textContent+'-'+this.parentNode.previousSibling.textContent;
                    label.appendChild(document.createTextNode(this.textContent+'-'+this.parentNode.previousSibling.textContent));

                    // Agrega el objeto a la interfaz
                    filterContainer.appendChild(newFilter);
                    filterContainer.appendChild(label);
                    filterContainer.appendChild(document.createElement('br'));
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                
                content.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            if(x[currentFocus].classList.includes("autocomplete-match")){x[currentFocus].classList.add("autocomplete-active");}
            
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        /*execute a function when someone clicks in the document:*/
        // document.addEventListener("click", function (e) {
        //     closeAllLists(e.target);
        // });
    }
})();