//Global variables
var dataTableEvents = 'undefined';
var dataTableReviews = 'undefined';
var dataTableRisks = 'undefined';
var triggerdetailId = "";
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var digest = "";
var currentUser = "";
var listName = "Profiles";
var lastModifiedDate = "";
var all = "Select Value";


_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    $('#IssuesDetailsDialog').hide();
    $('#overlay').hide();

    LoadPhaseFilterDropdown();

    GetDigest();
    LoadPageProfile();


    LoadEventsDataTable(all);
    LoadRisksDataTable();
    LoadReviewsDataTable();

    LoadPageEvents();

    ShowCube();



} //end of MyCustomPage---------------------------------------------------------------------------------------

//SETUP PAGE
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
        success: UpdateLastModified,
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").html(errMsg);
        }
    });
}
function UpdateLastModified(data) {
    console.log("digest is " + digest);
    $('#digestmsg').val(digest);
    retrieveLastModifiedDate();

}
function retrieveLastModifiedDate() {

    var contextInfoUri = appWebUrl + "/_api/web/lastItemModifiedDate";
    var executor = new SP.RequestExecutor(appWebUrl);
    executor.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: succRetrieveLastModifiedDate,
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the last modified date: " + errorMessage;
            $("#error").val(errMsg);
        }
    });
}
function succRetrieveLastModifiedDate(data) {
    var month = "";
    var jsonObject = JSON.parse(data.body);
    lastModifiedDate = jsonObject.d.LastItemModifiedDate.substring(0, 10);
    console.log("Last Modified date: " + lastModifiedDate);
    $("#lastUpdated").text(" | " + "Last Updated: " + lastModifiedDate);
}


//LOAD DATATABLES

//myevents
function LoadEventsDataTable(x) {

    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').text();
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: LoadEventsDataTableSuccHandler,
        error: LoadEventsDataTableErrsHandler
    });
}
function LoadEventsDataTableSuccHandler(data) {
    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    dataTableEvents = $('#events')
        .DataTable({
            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [
                 { "mData": "Title" }, //display name is issue 
                 { "mData": "Trigger" },
                 { "mData": "Type1" },
                 { "mData": "Likelihood" },
                 { "mData": "Consequence" },
                 { "mData": "Phase" },
                 { "mData": "Status" }
            ],
            dom: 'Bfrtip',
            buttons: true, // ['copy', 'excel', 'pdf', 'print']
            //  fixedHeader: false,
            scrollY: 280,
            scrollX: false,
            //autoWidth: true,
            columnDefs: [
                       {    //Issue
                           "targets": [0],
                           "visible": true
                       },
                       {
                           // Trigger
                           "targets": [1],
                           "visible": true
                       },
                       {
                           //Type1 
                           "targets": [2],
                           "visible": true
                       },
                       {

                           "targets": [3],
                           "data": "Likelihood",
                           "visible": false,
                           "searchable": false
                       },
                       {
                           "targets": [4],
                           "data": "Consequence",
                           "visible": false,
                           "searchable": false
                       },
                       {

                           "targets": [5],
                           "visible": false,
                           "searchable": true
                       },
                       {
                           "targets": [6],
                           "data": "Status",
                           "visible": false,
                           "searchable": false
                       },
                       {
                           "targets": [7],
                           "data": "ID",
                           "visible": false,
                           "searchable": false
                       },
                       {

                           "targets": [8],
                           "visible": true,
                           "render": function (data, type, row) {
                               return "" + row.Likelihood + row.Consequence;
                           }
                       },
                       {

                           "targets": [9],
                           "visible": true,
                           "render": function (data, type, row) {
                               if (row.Consequence == "5") {
                                   return "High";
                               }
                               else if (row.Consequence == "4") {
                                   return "Medium";
                               }
                               else if (row.Consequence == "3") {
                                   return "Medium";
                               }
                               else if (row.Consequence == "2") {
                                   return "Low";
                               }
                               else if (row.Consequence == "1") {
                                   return "Low";
                               }
                           }
                       }

            ],

            columns: [
                         //filter out any data column completed. All others are used for reports
                    //      { name: 'Trigger' },
                    //      { name: 'Issue' },                 //index 0    //displayed in column 1
                   //     { title: 'Issue Description*' },
                   //     { title: 'Category' },
                    //      { name: 'Type' }, //displated in column 4 
                    //      { name: 'Phase' },  ///index 5                               //displayed in column 3  
                   //       { name: 'Likelihood' },
                   //       { name: 'Consequence' },

                  //        { name: 'Risk' },
                  //        { name: 'Status' },                 //filter out completed status
                   //       { name: 'ID' }
                   //     { title: 'Mitigation 6.0d' },
                   //     { title: 'Mitigation 6.6' },          //index 10
                   //     { title: 'Mitigation 6.7' },
                   //     { title: 'Mitigation 6.8' },
                   //     { title: 'Mitigation Date' },
                   //     { title: 'PEO' },
                   //     { title: 'PMA' }, //index 15
                   //     { title: 'Program' },
                   //       { name: 'Phase' }
                   //     { title: 'PM Approver' },
                   //     { title: 'PM Approval Date' },
                   //     { title: 'Competency Approver ' },     //index 20
                   //     { title: 'Competency Approval Date' },
                   //     { title: 'Admin Approver' },
                   //     { title: 'Admin Approval Date' },
                                                   //displayed in column 5
            ],
            "searching": true,
            "paging": false,
            "info": true

        });
}
function LoadEventsDataTableErrsHandler(data, errCode, errMessage) {
    console.log("Error: myErrEventsHandler " + errMessage);

}

//myrisks
function LoadRisksDataTable() {
    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').val();

    console.log("LoadRisksDataTable usrProgram is " + usrProgram);

    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    // var filterUrl = "?$filter=Program eq '" + usrProgram + "'";
    var fullUrl = baseUrl + selectUrl; // + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: LoadRisksDataTableSuccRisksHandler,
        error: LoadRisksDataTableErrRisksHandler
    });
}
function LoadRisksDataTableSuccRisksHandler(data) {
    if (dataTableRisks != 'undefined') {
        dataTableRisks.destroy();
    }
    var myseverity = "High";
    dataTableRisks = $("#risks")
        .DataTable({
            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [
                { "mData": "Title" }, //display name is issue
                { "mData": "Trigger" },
                { "mData": "Type" },
                { "mData": "Likelihood" },
                { "mData": "Consequence" },
                { "mData": "Status" },
                { "mData": "Id" }

            ],
            dom: 'Bfrtip',
            buttons: true, // ['copy', 'excel', 'pdf', 'print']
            // fixedHeader: true,
            scrollY: 300,
            // scrollX: true,
            autoWidth: false,
            columnDefs: [
                { //issue
                    "targets": [0],
                    "visible": true
                },
                { //trigger
                    "targets": [1],
                    "visible": true

                },
                {
                    //type
                    "targets": [2],
                    "visible": true


                },
                { //likelihood
                    "targets": [3],
                    "data": "Likelihood",
                    "visible": false,
                    "searchable": false
                },
                { //consequence
                    "targets": [4],
                    "data": "Consequence",
                    "visible": false,
                    "searchable": false
                },
                { //risk   
                    "targets": [5],
                    "data": null,
                    "render": function (data, type, row) {
                        return "" + row.Likelihood + row.Consequence;
                    }
                },

                 {   //Severity   
                     "targets": [6],
                     "width": "10%",
                     "data": null,
                     "render": function (data, type, row) {
                         if (row.Consequence == "5") {
                             return "High";
                         }
                         else if (row.Consequence == "4") {
                             return "Medium";
                         }
                         else if (row.Consequence == "3") {
                             return "Medium";
                         }
                         else if (row.Consequence == "2") {
                             return "Low";
                         }
                         else if (row.Consequence == "1") {
                             return "Low";
                         }
                     }
                 },
                   {  //Status   
                       "targets": [7],
                       "visible": false
                   }
                   ,
                   {  //ID   
                       "targets": [8],
                       "visible": false
                   }


            ],
            columns: [
                //filter out any data column completed. All others are used for reports
                //must be in the order they are displayed in the HTML

                       { name: 'Issue' }, //displayed in column 2      
                       { name: 'Trigger' }, //index 0    //displayed in column 1 

                //     { title: 'Issue Description*' },
                //     { title: 'Category' },
                       { name: 'Type' }, //displayed in column 3
                //     { name: 'Phase' },                   ///index 5  //displated in column 4
                       { name: 'Likelihood' },
                       { name: 'Consequence' },
                //     { title: 'Mitigation 6.0d' },
                //     { title: 'Mitigation 6.6' },          //index 10
                //     { title: 'Mitigation 6.7' },
                //     { title: 'Mitigation 6.8' },
                //     { title: 'Mitigation Date' },
                //     { title: 'PEO' },
                //     { title: 'PMA' }, //index 15
                //     { title: 'Program' },
                //     { title: 'Phase' },
                //     { title: 'PM Approver' },
                //     { title: 'PM Approval Date' }
                //     { title: 'Competency Approver ' },     //index 20
                //     { title: 'Competency Approval Date' },
                //     { title: 'Admin Approver' },
                //     { title: 'Admin Approval Date' },
                       { name: 'Risk' },//displayed in column 5
                       { name: 'Status' },             //filter out completed status
                       { name: 'ID' }
            ],
            "searching": true,
            "paging": false,
            "info": true
            // "autoWidth": true
        });
}
function LoadRisksDataTableErrRisksHandler(data, errCode, errMessage) {
    console.log("Error: myErrRiskHandler line 712 " + data + errCode + errMessage);
}

//myreviews

function LoadReviewsDataTable() {
    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').text();
    console.log("LoadReviewsDataTable usrProgram is " + usrProgram);


    var ddlstatus = "Completed";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = ""; //"$filter=Program eq '" + usrProgram + "'";
    var fullUrl = baseUrl + selectUrl + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: LoadReviewsDataTableSuccHandler,
        error: LoadReviewsDataTableErrHandler
    });
}
function LoadReviewsDataTableSuccHandler(data) {
    if (dataTableReviews != 'undefined') {
        dataTableReviews.destroy();
    }
    dataTableReviews = $('#reviews')
        .DataTable({
            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [

                 { "mData": "Title" },   //display name is issue
                 { "mData": "MitigationDate" },  //need to add duedate
                 { "mData": "Status" },
                 { "mData": "AdminApprovalDate" }
            ],
            dom: 'Bfrtip',
            buttons: ['copy', 'excel', 'pdf', 'print'],
            // fixedHeader: true,
            scrollY: 300,
            //    scrollX: true,
            //  autoWidth: true,
            columnDefs: [
                       {
                           //event
                           "targets": [0],
                           "visible": true
                       },
                       {
                           //DueDate
                           "targets": [1]
                       },
                       {
                           //Status
                           "targets": [2]

                       },
                       {   //MitigationDate
                           "targets": [3]

                       }

            ],
            columns: [
                   //filter out any data column completed. All others are used for reports
                   //     { name: 'Title' } //filter out completed status                
                   //     { name: 'Mitigation Date' },
                   //     { name: 'Status' },
                   //     { name: 'Trigger' },                           
                   //     { title: 'Issue Description*' },
                   //     { title: 'Category' },
                   //     { name: 'Type' },                                
                   //     { name: 'Phase' },                  
                   //     { name: 'Likelihood' },
                   //     { name: 'Consequence' },
                   //     { title: 'Mitigation 6.0d' },
                   //     { title: 'Mitigation 6.6' },          
                   //     { title: 'Mitigation 6.7' },
                   //     { title: 'Mitigation 6.8' },
                   //     { title: 'PEO' },
                   //     { title: 'PMA' }, //index 15
                   //     { title: 'Program' },
                   //     { title: 'Phase' },
                   //     { title: 'PM Approver' },
                   //     { title: 'PM Approval Date' }
                   //     { title: 'Competency Approver ' },    
                   //     { title: 'Competency Approval Date' },
                   //     { title: 'Admin Approver' },
                   //     { title: 'Admin Approval Date' },
                 //       { name: 'Risk' }                               
            ],
            "searching": true,
            "paging": false,
            "info": false

        });
}
function LoadReviewsDataTableErrHandler(data, errCode, errMessage) {
    console.log("Error myErrReviewsHandler line 818 " + errMessage);
}


//FUNCTIONS ON PAGE

function LoadPhaseFilterDropdown() {
    $("#ddlfilter").append($("<option></option>").attr("value", "selectall").text("Select All"));
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("Test TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("Development EMD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "post production").text("Post Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "fleet introduction").text("Fleet Introduction P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("Sustainment O&S"));
}
function updateCube(labeltext, x, y) {
    var id = "" + "#" + x + y;
    if ($(id).prop('title') === "") {
        $(id).text("X");
    } else {
        updateTooltip(labeltext);
    }
}
function RemoveCubeX(x, y) {
    var id = "" + "#" + x + y;
    $(id).text("");
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

    //var table = $('events').DataTable();
    dataTableEvents.rows('.selected')
      .nodes()
      .to$()
      .removeClass('selected');
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
function ShowCube() {
    document.getElementById('dashboardquadrant2').style.visibility = 'visible';
}
function LoadPageEvents() {

    $('#events')
        .on('dblclick',
            'tr',
            ShowIssueDetailsDialog()
         //           function(){
         //               //   function (triggerIssue, triggerID, triggerType, triggerDescription, triggerMitigation, mitigationDate, mitigationEnd, status) {
         //               /*
         //                var triggerId =  dataTableEvents.row(this).data().Id;
         //                var triggerType =  dataTableEvents.row(this).data().Type;
         //                var triggerDescription =   dataTableEvents.row(this).data().Description;
         //                var triggerMitigation = dataTableEvents.row(this).data().Phase;
         //                var mitigationDate =  dataTableEvents.row(this).data().Status;

         //args: {"TriggerID":triggerId,
         //                            "Type":triggerType,
         //                            "Description":triggerDescription,
         //                            "Mitigation":triggerMitigation,
         //                            "MitigationDate":mitigationDate,
         //                            "MitigationEnd":mitigationEnd,
         //                            "Status":status    
         //                           } ,      
         //                var tri

         //                 */

         //               var dialogOptions = {
         //                   url: "TriggerDetailsDialog.aspx",
         //                   title: "Edit Issue",
         //                   autoSize:true,



         //                   dialogReturnValueCallback: 
         //                        function (dialogResult) {
         //                            SP.UI.ModalDialog.RefreshPage(dialogResult);
         //                        }
         //               };

         //               // SP.UI.ModalDialog.get_childDialog().get_args()['SomeVarName'];
         //               SP.UI.ModalDialog.showModalDialog(options);

         //               //var itemid = dataTableEvents.row(this).data().Trigger;
         //               // var itemName = dataTableEvents.row(this).data().ID;
         //               // alert("Open edit dialog or page for item: " + itemName + " and " + itemid);
         //               //  OpenPopUpPageWithDialogOptions(dialogOptions);

         //           }


                    );



    $('#risks')
      .on('dblclick',
          'tr',
          function () {

              var dialogOptions = {
                  title: "Edit Trigger",
                  width: 900,

                  height: 600,
                  url: "TriggerDetailsDialog.aspx",
                  dialogReturnValueCallback: function (dialogResult) {
                      SP.UI.ModalDialog.RefreshPage(dialogResult);
                  }
              };

              //  SP.UI.ModalDialog.showModalDialog(options);

              //var itemid = dataTableEvents.row(this).data().Trigger;
              // var itemName = dataTableEvents.row(this).data().ID;
              // alert("Open edit dialog or page for item: " + itemName + " and " + itemid);
              OpenPopUpPageWithDialogOptions(dialogOptions);
          });

    $('#reviews')
       .on('dblclick',
           'tr',
           function () {
               var triggerId = $("#userID").val();
               var dialogOptions = {
                   title: "Edit Trigger",
                   width: 900,
                   args: {
                       "TriggerID": triggerId,
                       "Type": triggerType,
                       "Description": triggerDescription,
                       "Mitigation": triggerMitigation,
                       "MitigationDate": mitigationDate,
                       "MitigationEnd": mitigationEnd,
                       "Status": status
                   },

                   height: 600,
                   url: "TriggerDetailsDialog.aspx",
                   dialogReturnValueCallback: function (dialogResult) {
                       SP.UI.ModalDialog.RefreshPage(dialogResult);
                   }
               };

               //  SP.UI.ModalDialog.showModalDialog(options);

               //var itemid = dataTableEvents.row(this).data().Trigger;
               // var itemName = dataTableEvents.row(this).data().ID;
               // alert("Open edit dialog or page for item: " + itemName + " and " + itemid);
               OpenPopUpPageWithDialogOptions(dialogOptions);
           });

    $('#events')
        .on('click',
            'tr',
            function () {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                    var y = dataTableEvents.row(this).data().Likelihood;
                    var x = dataTableEvents.row(this).data().Consequence;
                    $("#risks >tbody:last-child").after("<tr>" +
                                                 " <td>row(this).data().Title<td>" +
                                                 " <td>row(this).data().Trigger<td>" +
                                                 " <td>row(this).data().Likilihood<td>" +
                                                "  <td>row(this).data().Type<td>" +
                                             " </tr>");





                    //var selectedtextid = dataTableEvents.row(this).data().Trigger;
                    RemoveCubeX(y, x);



                } else {
                    dataTableEvents.$('tr selected').removeClass('selected');
                    $(this).addClass('selected');
                }

                var likelihooddata = dataTableEvents.row(this).data().Likelihood;
                var consequencedata = dataTableEvents.row(this).data().Consequence;
                var textid = dataTableEvents.row(this).data().Trigger;

                updateCube(textid, likelihooddata, consequencedata);
                AddTooltip(textid, likelihooddata, consequencedata);
            });

    $('#events')
        .on('error.dt',
            function (e, settings, techNote, message) {
                console.log("An error has been reported by DataTables: ", message);
            });


    $('#clearclube')
        .on('click',
            function () {
                clearcube();
                // redrawDataTable();
            });

    $('reloadDataTable')
    .on('click',
      function () {
          location.reload();
      });



    $("#ddlfilter")
        .on('change',
                 function () {
                     var selectedPhase = this.value;  //if doesnt work use .val()
                     //dataTableEvents.destroy();
                     var oTable = $('#events').DataTable({});
                     oTable.columns(5)
                       .search(selectedPhase)
                       .draw();
                 });





    //TABLE EVENTS 
    $('#reviews')
          .on('click',
              'tr',
              function () {
                  if ($(this).hasClass('selected')) {
                      $(this).removeClass('selected');
                  } else {
                      dataTableReviews.$('tr selected').removeClass('selected');
                      $(this).addClass('selected');
                  }
              });


    $('#risks')
         .on('click',
          'tr',
            function () {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    dataTableRisks.$('tr selected').removeClass('selected');
                    $(this).addClass('selected');
                }
            });


    //BUTTON ROWS - working  dataTableEvents, dataTableRisks, dataTableReviews
    // dataTableReviews.buttons()
    //.container()
    // .insertBefore('#reviews_filter');

    // dataTableRisks.buttons()
    //  .container()
    // .insertBefore('#risks_filter');

    //  $('#info').tooltip();



}
function LoadPageProfile() {
    //  GetUserInfo();
}


//SETUP DIALOGS
function LoadIssueDetailsDialog(id) {
    var executor = new SP.RequestExecutor(appWebUrl);
    var listname = "ProgramIssuesAndRisks";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbytitle('"+listname+"')/items("+id+")";
    var fullUrl = +baseUrl + selectUrl;
    console.log("LoadIssueDetailsDialog with " + fullUrl);

    var requestHeaders = {
        "accept": "application/json;odata=verbose"
    };

    executor.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: LoadIssueDetailsDialogSuccHandler,
        error: LoadIssueDetailsDialogErrHandler
    });
}

function LoadIssueDetailsDialogSuccHandler() {
    var jsonObject = JSON.parse(data.body);
    var issueTitle = jsonObject.d.Title;
    alert("process loading dialog to page" + issueTitle);
}


function LoadIssueDetailsDialogErrHandler(data, errorCode, errorMessage) {
    alert("failed : " + errorCode + errorMessage);
}

function savemodal() {
    alert("record saved");
}

function closemodal() {
    //var redirectWindow = window.open("MyDashboard.aspx", '_blank');
    //  redirectWindow.location;
    // jQuery('#TextDialog').hide();
    // jQuery('#overlay').hide();
}

function GetUserInfo() {
    var listname = "Profiles";
    var username = currentUser;
    alert(currentUser);
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var filterUrl = "?$filter=Title eq '" + username + "'";

    var fullUrl = baseUrl + selectUrl + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        async: false,
        headers: { "ACCEPT": "application/json;odata=verbose;" },
        success: GetUserInfoSuccHandler,
        error: GetUserInfoErrHandler
    });
}
function GetUserInfoSuccHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var userID = jsonObject.d.Id;
    var userName = jsonObject.d.CurrentUser;
    var userleadership = jsonObject.d.IsLeadership;
    var userProgram = jsonObject.d.Program;


    //Update Page links
   // var $element = $("#login");
    //if ($element) { $element.attr('href', "../SitePages/Profile.aspx?Name=" + userName + "&id=" + usrID + "&program=" + usrProg); }


    //Update UI
    $("#userID").val(userID);
    $("#userName").val(userName);
    $("#userProgram").val(userProgram);
    $("#userAdmin").val(userleadership);

    //upper right program label last modified date
    $("#usrProgram").text(" |  " + userProgram);



}
function GetUserInfoErrHandler(data, errCode, errMessage) {
    alert("Error: Processing GetUserInfo() on mydashboard. Unable to load profile from SharePoint list " + errMessage);
}


function ShowIssueDetailsDialog() {
    $('#IssuesDetailsDialog').modal();
}


