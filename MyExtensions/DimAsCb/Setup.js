'use strict';

(function(){
    $(document).ready(function () {
        tableau.extensions.initializeDialogAsync().then(function (openPayload) {
            console.log(openPayload);
            $('#btnSave').click(closeDialog);
        });
    });

    function closeDialog () {
      tableau.extensions.ui.closeDialog("yay");      
    }
})
