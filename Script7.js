//global variables
var dataTableEvents = 'undefined';
var dataTableIssues = 'undefined';
var dataTableRisks = 'undefined';
var triggerdetailId = "";
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var digest = "";
var currentUser;
var listName = "Profiles";

_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    //  $('#TriggerDetailsDialog').hide();
    $('#Overlay').hide();
    // $('#dlg-details').modal({ show: false });

    //   $('#ddlFilter').change(function(event){
    //             	LoadEventsDataTable();
    //             	event.preventDefault();
    //       });
    GetDigest();
    LoadEventsDataTable();

    /*
           $('#events').on('dblclick','.btn-details',
                    function() { 
                      CaptureData(this);              
                       var trigger_dialog = $("#TriggerDetailsDialog");
                        
                        trigger_dialog.dialog({
                          autoOpen:true,
                           title: "Edit Trigger",
                           width: 640,
                           buttons:{
                                "Update": function(){
                                    onEditTrigger();
                                    $(this).dialog("close");                       		
                                },
                                "Cancel":function(){$(this).dialog("close");},                      		
                           }                    
                        });
                       
                     //   $('#TriggerDetailsDialog').show();
                    //    $('#Overlay').show();
                  });
           
    
     $('#events tbody').on('click', 'button', function(){                   
                       var data = dataTableEvents.row($this).parents('tr')).data();
                       alert(data[0] + data[1] + data[2] + data[3] + data[4])
                        var likelihooddata = dataTableEvents.row(this).data().Likelihood;
                        var consequencedata = dataTableEvents.row(this).data().Consequence;
                       var textid = dataTableEvents.row(this).data().Trigger;                    
                        });
                      
                    }); 
    
    
     */
    $('#events tbody').on('click', 'button', function () {
        var dataitem = dataTableEvents.row($(this).parents('tr')).data().ID;
        triggerID = dataitem;
        loadTriggerDetails();

    });

    /*      $('#events').on('click', 'tr', function(){
                     if($(this).hasClass('selected')){
                         $(this).removeClass('selected');
                     }
                     else {
                        dataTableEvents.$('tr selected').removeClass('selected');
                        $(this).addClass('selected');
                     }
  
                      var likelihooddata = dataTableEvents.row(this).data().Likelihood;
                      var consequencedata = dataTableEvents.row(this).data().Consequence;
                      var textid = dataTableEvents.row(this).data().Trigger;                    
  
                     updateCube(textid,likelihooddata,consequencedata);
                     AddTooltip(textid,likelihooddata,consequencedata);
                  }); 
             
           */


    $('#clearclube')
        .on('click',
            function () {
                clearcube();

            });

    //DATASETS

    var dataSet2 = [
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"],
        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
        ["Over-Flying", "SLEP", "High", "Performance"]
    ];

    var dataSet3 = [
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"],
        ["ILA", "1-16-17", "Complete", "1-2-2017"],
        ["DAB", "1-16-17", "Complete", "1-2-2017"],
        ["SRR", "1-16-17", "Complete", "1-2-2017"]
    ];


    //TABLE EVENTS  

    var risktable = $('#risks')
        .DataTable({
            data: dataSet2,
            buttons: true,
            fixedHeader: true,
            scrollY: 300,
            columns: [
                { title: "Trigger" },
                { title: "Issue" },
                { title: "Severity" },
                { title: "Type" }
            ],
            "searching": true,
            "paging": false,
            "info": true
        });

    var reviewstable = $('#reviews')
        .DataTable({
            data: dataSet3,
            buttons: true,
            fixedHeader: true,
            scrollY: 300,
            columns: [
                { title: "Event/Review" },
                { title: "Due Date" },
                { title: "Status" },
                { title: "Date Completed" }
            ],
            "searching": true,
            "paging": false,
            "info": true
        });

    $('#reviews tbody')
        .on('click',
            'tr',
            function () {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    reviewstable.$('tr selected').removeClass('selected');
                    $(this).addClass('selected');
                }
            });


    $('#risks tbody')
     .on('click',
         'tr',
         function () {
             if ($(this).hasClass('selected')) {
                 $(this).removeClass('selected');
             } else {
                 risktable.$('tr selected').removeClass('selected');
                 $(this).addClass('selected');
             }
         });



    //BUTTON ROWS

    //  $('#events').buttons()
    //   .container()
    //   .insertBefore('#events_filter');



    //BUTTON ROWS - working


    reviewstable.buttons()
     .container()
     .insertBefore('#reviews_filter');

    risktable.buttons()
     .container()
     .insertBefore('#risks_filter');


    // $('#riskhelp').tooltip();
    //   $('#12').tooltip();

    // GetDigest();

    //  $("#btnAddProfile").on("click", function () {
    //    AddUser();
    // });
} //end of MyCustomPage

//FUNCTIONS
function GetDigest() {
    var scriptbase = targetSiteUrl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);
}

function retrieveFormDigest() {
    digest = $("#__REQUESTDIGEST").val();
    var contextInfoUri = appWebUrl + "/_api/contextinfo";
    var executor = new SP.RequestExecutor(appWebUrl);
    executor.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: PrepareForm,
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").html(errMsg);
        }
    });
}

function PrepareForm(data) {
    
}


function loadTriggerDetails() {
    var executor = new SP.RequestExecutor(appWebUrl);
    var listname = "ProgramIssuesAndRisks";
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname +"')/items(" + triggerdetailID + ")",
    
    //   var itemType = GetItemTypeForListName(listname);
    /*   var requestBody = JSON.stringify({
           '__metadata': { 'type': itemType },
           'Title': userName,
           'DisplayName': userDisplayName,
           'IsLeadership': "false",
           'ACAT': userACAT,
           'Competency': "none",
           'PEO': userPEO,
           'PMA': userPMA,
           'Program': userProgram,
           'Phase': userPhase,
           'ProfileType': "none"
       });
   */
     requestHeaders = {
        "accept": "application/json;odata=verbose"
    };

    executor.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successTriggerDetailsHandler,
        error: errorTriggerDetailsHandler
    });
}

function successTriggerDetailsHandler(data) {
    var id = data.d.results[0].ID;
    var type = data.d.results[0].Type;
    var phase = data.d.results[0].Phase;
    var description = data.d.results[0].Description;
    var mitigation = data.d.results[0].Mitigation;
    var mitigationStart = data.d.results[0].MitigationStart;
    var mitigationEnd = data.d.results[0].MitigationEnd;
    var status = data.d.results[0].Status;
    var likelihood = data.d.results[0].Likelihood;
    var consequence = data.d.results[0].Consequence;
    alert(id);


}

function errorTriggerDetailsHandler(data, errorCode, errorMessage) {
    alert("failed : " + errorCode + errorMessage);
}



function GetUserInfo(username) {
    var oDataUrl = _spPageContextInfo.webAbsoluteUrl +
    "/_api/web/Lists/getbyTitle('Profiles')/items?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT&$filter=Title eq '" + username + "'";
    $.ajax({
        url: oDataUrl,
        type: "GET",
        dataType: "json",
        async: false,
        headers: { "ACCEPT": "application/json;odata=verbose;charset=utf-8" },
        success: userSuccHandler,
        error: userErrHandler
    });
}

function userSuccHandler(data) {
    //load the select option for ddlProgram       
    $.each(data.d.results, function (i, result) {
        var userID = result.ID;
        var userDisplayName = result.DisplayName;
        var userleadership = result.IsLeadership;
        var userPEO = result.PEO;
        var userCompetency = result.Competency;
        var userPMA = result.PMA;
        var userACAT = result.ACAT;
        var userProgram = result.Program;
        var userPhase = result.Phase;
        var userelement = $('#ddlUser');
        $('#ddlUser').innerHTML("<option value='-1' selected='selected' >" + userDisplayName + "</option>");

        var peoelement = $('#ddlPEO');
        $('#ddlPEO').append("<option value='-1' selected='selected' >" + userPEO + "</option>");

        var pmaelement = $('#ddlPMA');
        $('#ddlPMA').append("<option value='-1' selected='selected'>" + userPMA + "</option>");

        var programelement = $('#ddlProgram');
        $('#ddlProgram').append("<option value='-1' selected='selected' >" + userProgram + "</option>");

        var acatelement = $('#ddlACAT');
        $('#ddlACAT').append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

        var phase = $('#ddlPhase');
        $('#ddlPhase').append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");

        //  store ID in hidden DIV for updates
        $('#userID').innerHTML(userID);
    });

}

function userErrHandler(data, errCode, errMessage) {
    alert("Error: Unable to load profile from table " + errMessage);
}




function LoadEventsDataTable() {
    var ddlstatus = "Completed";
    var oDataUrl = _spPageContextInfo.webAbsoluteUrl +
     //   "/_api/web/getbyTitle('ProgramIssuesAndRisks')/items?$select=Issue,Trigger,Type,Phase,Likelihood,Consequence$filter=Status eq '" + ddlstatus + "'";


            // "/_api/web/Lists/getbyTitle('ProgramIssuesAndRisks')/items?$select=Issue,Trigger,Type,Phase,Likelihood,Consequence&$filter=Status eq '" + ddlstatus  + "'";

       //   "/_api/web/Lists/getbyTitle('ProgramIssuesAndRisks')/items?$select=Issue,Trigger,Type,Phase,Likelihood,Consequence,Status$filter=Status eq '" + ddlstatus + "'";
               "/_api/web/Lists/getbyTitle('ProgramIssuesAndRisks')/items?$filter=Status eq 'In Progress'";




    $.ajax({
        url: oDataUrl,
        type: "GET",
        //dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: mySuccHandler,
        error: myErrHandler
    });
}

function mySuccHandler(data) {
    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    dataTableEvents = $('#events')
        .DataTable({
            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [

                 { "mData": "Issue" },   //display name is issue
                 { "mData": "Trigger" },
                 { "mData": "Type" },
                 { "mData": "Phase" },
                 { "mData": "Likelihood" },
                 { "mData": "Consequence" },
                 { "mData": "ID" }
            ],
            dom: 'Bfrtip',
            buttons: ['copy', 'excel', 'pdf', 'print'],
            //  fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            autoWidth: true,
            columnDefs: [
                       {
                           "targets": [0],
                           "width": "35%"
                       },
                       {
                           "targets": [1],
                           "width": "15%"
                       },
                       {
                           "targets": [2],
                           "width": "10%"
                       },
                       {
                           "targets": [3],
                           "width": "20%"
                       },
                       {
                           "targets": [4],
                           "data": "Likelihood",
                           "visible": false,
                           "searchable": false
                       },
                       {
                           "targets": [5],
                           "data": "Consequence",
                           "visible": false,
                           "searchable": false
                       },
                       {
                           "targets": [6],
                           "data": null,
                           "render": function (data, type, row) {
                               return "" + data.Likelihood + data.Consequence;
                           },
                           "width": "10%"
                       },
                       {
                           "targets": [7],
                           "data": null,
                           //"defaultContent": '<button type="button" class="btn btn primary btn-details">Edit</button>',
                           "defaultContent": "<button>Edit</button>",
                           "width": "10%"

                       },
                       {
                           "targets": [8],
                           "data": "Status",
                           "visible": false,
                           "searchable": false
                       },
                          {
                              "targets": [9],
                              "data": "ID",
                              "visible": false,
                              "searchable": false
                          }


            ],

            columns: [//filter out any data column completed. All others are used for reports
                         { name: 'Issue' },                 //index 0    //displayed in column 1

                         { name: 'Trigger' },                            //displayed in column 2

                   //    { title: 'Issue Description*' },
                   //    { title: 'Category' },
                         { name: 'Type' },                                //displayed in column 3

                         { name: 'Phase' },                   ///index 5  //displated in column 4

                   //      { name: 'Likelihood' },
                  //       { name: 'Consequence' },
                         { name: 'Status' },                 //filter out completed status
                  //     { title: 'Mitigation 6.0d' },
                   //    { title: 'Mitigation 6.6' },          //index 10
                  //     { title: 'Mitigation 6.7' },
                   //    { title: 'Mitigation 6.8' },
                    //   { title: 'Mitigation Date' },
                   //    { title: 'PEO' },
                   //    { title: 'PMA' }, //index 15
                  //     { title: 'Program' },
                   //    { title: 'Phase' },
                   //    { title: 'PM Approver' },
                   //    { title: 'PM Approval Date' },
                   //    { title: 'Competency Approver ' },     //index 20
                  //     { title: 'Competency Approval Date' },
                   //    { title: 'Admin Approver' },
                  //     { title: 'Admin Approval Date' },
                         { name: 'Risk' }                                //displayed in column 5


            ],
            "searching": true,
            "paging": false,
            "info": true,
            "autoWidth": false
        });
}

function myErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function updateCube(labeltext, x, y) {
    var id = "" + "#" + x + y;
    if ($(id).prop('title') === "") {

        $(id).text("X");
    } else {
        updateTooltip(labeltext);
    }
}

function AddTooltip(eventText, x, y) {
    var id = "" + "#" + x + y;
    if ($(id).prop('title') === "") {
        $(id).attr('title', eventText);
    } else {
        var titletext = $(id).prop('title');
        var updatedText = titletext + " " + eventText;
        $(id).attr('title', updatedText);
    }
}

function savemodal() {
    alert("record saved");
}

function closemodal() {
    var redirectWindow = window.open("MyDashboard.aspx", '_blank');
    redirectWindow.location;
    jQuery('#TextDialog').hide();
    jQuery('#overlay').hide();
}

function CaptureData() {
    //var $dlg = $(this);
    //		 var $tr    = $($dlg.data('btn')).closest('tr');
    //	 var $table = $($dlg.data('btn')).closest('table');
    //	 var data   = $table.DataTable().row($tr).data();
    var type = $('#tbType').val();
    var phase = $('#tbType').val();
    var description = $('#tbType').val();
    var mitigation = $('#tbType').val();
    var mitigationStart = $('#tbType').val();
    var mitigationEnd = $('#tbType').val();
    var status = $('#tbType').val();
    var likelihood = $('#tbType').val();
    var consequence = $('#tbType').val();

}

function showModalDialog(elBtn) {
    $('#dlg-details').data('btn', elBtn);
    $('#dlg-details').modal('show');
}

function updateTooltip(updateText, x, y) {
    var id = "" + "#" + x + y;
    var oldTitle = $(id).prop('title');
    var newTitle;
    newTitle.replace(updateText, '');
    alert(newTitle);
    $(id).attr('title', newTitle);
}

function clearcube() {
    $('#11').text("");
    $('#12').text("");
    $('#13').text("");
    $('#14').text("");
    $('#15').text("");
    $('#21').text("");
    $('#22').text("");
    $('#23').html("");
    $('#24').text("");
    $('#25').text("");
    $('#31').text("");
    $('#32').html("");
    $('#33').text("");
    $('#34').text("");
    $('#35').text("");
    $('#41').text("");
    $('#42').text("");
    $('#43').text("");
    $('#44').text("");
    $('#45').text("");
    $('#51').text("");
    $('#52').text("");
    $('#53').text("");
    $('#54').html("");
    $('#55').text("");
}



