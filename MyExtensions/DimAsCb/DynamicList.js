'use strict';

(function(){
    $(document).ready(function(){
        tableau.extensions.initializeAsync({'configure': configure}).then(function(){
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
                                checkbox.name=field.value;
                                // Each checkbox holds the string value to be selected
                                checkbox.value=field.formattedValue;
                                checkbox.id='cb'+field.value;
                                checkbox.className='css-checkbox';
                                checkbox.addEventListener('change', (event)=>{
                                    if(event.target.checked){
                                        selectedValues.push(checkbox.name);
                                    }else if(!event.target.checked){
                                        selectedValues.splice(selectedValues.indexOf(checkbox.name), 1);
                                    }else{
                                        checkbox.checked=false;
                                    }
                                })

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
                    //Botón de aplicar para seleccionar más de una dimensión y luego proceder.
                    var button = document.createElement('button');
                    button.className='button';
                    button.textContent='Aplicar';
                    button.addEventListener('click', (event)=>{
                        dashboard.getParametersAsync().then(function(parameters){
                            let selectedString='';
                            selectedValues.forEach(function(val){
                                selectedString+=val +'|';
                            });
                            //Eliminate the last | for formatting
                            selectedString.slice(0,-1);
                            parameters.find(p=>p.name==='Dimensiones Seleccionadas').changeValueAsync(selectedString);
                        })
                    })
                    var container=document.getElementById('Dimensiones');
                    container.appendChild(document.createElement('br'));
                    container.appendChild(button);

                }) 

            }catch(e){
                document.body.appendChild(document.createElement('p').appendChild(document.createTextNode('Oops!'+e)));
            }
        });
    });

    function configure() { 
        const defaultPayload=1;
        const popupUrl = `${window.location.origin}/MyExtensions/DimAsCb/Setup.html`;
        tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height: 500, width: 500 }).then((closePayload) => {
            // This is executed when the dialog is succesfully closed
            console.log(closePayload);
        }).catch((error) => {
            //In case they just click the X to close.
            switch (error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    console.log('Dialog was closed by user');
                    break;
                default:
                    console.error(error.message);
            }
        });
    }
})();