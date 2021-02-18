'use strict';

(function(){
    $(document).ready(function(){
        tableau.extensions.initializeAsync().then(function(){
            const dashboard=tableau.extensions.dashboardContent.dashboard;
            var selectedValues=[];
            try{
                var worksheet=dashboard.worksheets.find(w=> w.name === 'Hoja 1')
                
                worksheet.getDataSourcesAsync().then(datasources => {
                    dataSource = datasources.find(datasource => datasource.name === "FUENTE_CONSOLIDADA_COMPRAS (copia local)");
                    //fields = dataSource.fields;
                    //Comentario de debug
                    document.body.appendChild(document.createElement('p').appendChild(document.createTextNode('Tengo algo: ')));
                    fields.forEach(function (field){
                        if(!field.isCalculatedField && !field.isGenerated){
                            var checkbox = document.createElement('input');
                            checkbox.type='checkbox';
                            checkbox.name='cb'+field.name;
                            // Each checkbox holds the string value to be selected
                            checkbox.value=field.formattedValue;
                            checkbox.id='cb'+field.id;
                            checkbox.className='css-checkbox';
                            checkbox.addEventListener('change', (event)=>{
                                if(event.target.checked && selectedValues.length<9){
                                    selectedValues.push(checkbox.value);
                                }else if(!event.target.checked){
                                    var pastLength =selectedValues.length;
                                    selectedValues.splice(selectedValues.indexOf(checkbox.value), 1);
                                }else{
                                    checkbox.checked=false;
                                }
                                dashboard.getParametersAsync().then(function(parameters){
                                    for (let i = 0; i < selectedValues.length; i++) {
                                        const element = selectedValues[i];
                                        parameters.find(p=>p.parameterImpl.name==='Dimension '+(i+1)).changeValueAsync(element);
                                    }
                                    // Clearing the last parameter in the list
                                    parameters.find(p=>p.parameterImpl.name=='Dimension '+pastLength).changeValueAsync('Seleccione una dimensión');
                                })
                            })

                            var label = document.createElement('label');
                            label.className='css-label'
                            label.htmlFor='cb'+field.name;
                            label.appendChild(document.createTextNode(field.formattedValue));
    
                            var container=document.getElementById('Dimensiones');
                            container.appendChild(checkbox);
                            container.appendChild(label);
                            container.appendChild(document.createElement('br'));
                        }
                    })
                });

            }catch(e){
                document.body.appendChild(document.createElement('p').appendChild(document.createTextNode('Oops!'+e)));
            }
        });
    });
})();