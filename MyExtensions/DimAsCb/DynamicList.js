'use strict';

(function(){
    $(document).ready(function(){
        tableau.extensions.initializeAsync().then(function(){
            const dashboard=tableau.extensions.dashboardContent.dashboard;
            var selectedValues=[];
            try{
                dashboard.getParametersAsync().then(function(parameters){
                    // Create checkbox with each option from the parameter values
                    parameters.find(p=>p.parameterImpl.name=='Dimension 1').allowableValues.allowableValues.forEach(function(field){
                        try {
                            if(!(field.formattedValue=='Seleccione una dimensión')){
                                var checkbox = document.createElement('input');
                                checkbox.type='checkbox';
                                checkbox.name='cb'+field.value;
                                // Each checkbox holds the string value to be selected
                                checkbox.value=field.formattedValue;
                                checkbox.id='cb'+field.value;
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

                                //This loop remembers the selected values
                                /* parameters.forEach(function(parameter){
                                    if(parameter.currentValue.formattedValue==checkbox.value){
                                        checkbox.checked=true;
                                        selectedValues.splice(parameter.name.slice(-1),0,checkbox.value)
                                    }
                                }) */
                                var label = document.createElement('label');
                                label.className='css-label'
                                label.htmlFor='cb'+field.value;
                                label.appendChild(document.createTextNode(field.formattedValue));
        
                                var container=document.getElementById('Dimensiones');
                                container.appendChild(checkbox);
                                container.appendChild(label);
                                container.appendChild(document.createElement('br'));
                            }
                        } catch (error) {
                            document.body.appendChild(document.createElement('p').appendChild(document.createTextNode('Oops!'+error)));
                        }
                    })
                }) 

            }catch(e){
                document.body.appendChild(document.createElement('p').appendChild(document.createTextNode('Oops!'+e)));
            }
        });
    });
})();