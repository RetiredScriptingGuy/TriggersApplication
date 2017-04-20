function showDialog( /* string */ url) {

    // Do some argument checking.
    if (typeof url != "string")
        throw new Error.argument("url", "Expected a string.");

    // Define dialog box options.
    var options = {};
    options.title = "Atlas Feedback";
    options.url = url;
    options.dialogReturnValueCallback =

         function (dialogResult, returnValue) {

             // If the user clicked the Finish button (equivalent to OK)
             if (dialogResult) {

                 // Use an Ajax shortcut method to modify the DIV element.
                 //$get('displayDiv').innerHTML = "<h1>Thank you for participating!</h1>";
                 /* Notify User */
                 //SP.UI.Status.removeAllStatus(true);
                 //var sId = SP.UI.Status.addStatus("Feedback successfully submitted. Thanks!");
                 //SP.UI.Status.setStatusPriColor(sId, 'green');
                 alert("Your feedback has been successfully submitted. Thanks!");

             }
         };

    // Display the dialog box.
    //SP.UI.ModalDialog.showModalDialog(options);
    SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', options);
}
