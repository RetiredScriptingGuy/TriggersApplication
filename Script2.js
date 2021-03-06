// JavaScript source code
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
    $('#TriggerDetailsDialog').hide();
    $('#overlay').hide();
    GetDigest();

    LoadEventsDataTable(all);
    LoadRisksDataTable();
    LoadReviewsDataTable();


    $('#events')
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

    $('#events')
        .on('click',
            'tr',
            function () {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                    var y = dataTableEvents.row(this).data().Likelihood;
                    var x = dataTableEvents.row(this).data().Consequence;
                    console.log("update cube with :" + x + "and" + y);
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


    $("#ddlfilter")
        .on("change",
            function () {
                var filter = $(this).val();
                //LoadEventsDataTable(filter);
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
        success: PrepareForm,
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").html(errMsg);
        }
    });
}

function PrepareForm(data) {
    console.log("digest is " + digest);
    $('#digestmsg').html(digest);
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
            $("#error").html(errMsg);
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


function GetUserInfo() {
    var listname = "Profiles";
    var username = currentUser;
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?$select=Title,IsLeadership,Program";
    var filterUrl = "$filter=Title eq '" + username + "'";

    var fullUrl = baseUrl + selectUrl + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        async: false,
        headers: { "ACCEPT": "application/json;odata=verbose;charset=utf-8" },
        success: userSuccHandler,
        error: userErrHandler
    });
}

function userSuccHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var userID = jsonObject.d.ID;
    console.log("mydashboard js " + userID);
    $("#userID").text(userID);
    var userDisplayName = jsonObject.d.DisplayName;
    console.log(userDisplayName);

    var usrName = $("#userName").textContent;
    var usrID = $("#userID").textContent;
    var usrProg = $("#userProgram").textContent;
    $("#userName").text(userDisplayName);
    var userleadership = jsonObject.d.IsLeadership;
    console.log(userleadership);
    var userPEO = jsonObject.d.PEO;
    console.log(userPEO);
    var userCompetency = jsonObject.d.Competency;
    console.log(userCompetency);
    var userPMA = jsonObject.d.PMA;
    console.log(userPMA);
    var userACAT = jsonObject.d.ACAT;
    console.log(userACAT);
    var userProgram = jsonObject.d.Program;
    console.log(userProgram);
    $("#userProgram").text(userProgram);
    //upper right label
    $("#usrProgram").text(" |  " + userProgram);
    var userPhase = jsonObject.d.Phase;
    console.log(userPhase);
    var $element = $("#login");
    if ($element) {
        $element.attr('href', "../SitePages/Profile.aspx?Name=" + usrName + "&id=" + usrID + "&program=" + usrProg);
    }

    console.log("finish processing userSuccHandler");
}

function userErrHandler(data, errCode, errMessage) {
    alert("Error: Processing GetUserInfo() on mydashboard. Unable to load profile from SharePoint list " + errMessage);
}

//LOAD DATATABLES
//myevents
function LoadEventsDataTable(x) {

    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').text();
    console.log("LoadEventsDataTable usrProgram is " + usrProgram);

    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = "";
    /*
    if (selectedfilter == "Select Value") {
        filterUrl = "$filter=Status eq 'In Progress'";
    }

    if (selectedfilter == "Development") {
        filterUrl = "$filter=(Status eq 'In Progress') and (Phase eq 'Development')";
    }
    else if (selectedfilter == "Sustainment") {
        filterUrl = "$filter=(Status eq 'In Progress') and (Phase eq 'Sustainment')";
    }
    else if (selectedfilter == "Test") {
        filterUrl = "$filter=(Status eq 'In Progress') and (Phase eq 'Test')";
    }
    else if (selectedfilter == "Production") {
        filterUrl = "$filter=(Status eq 'In Progress') and (Phase eq 'Production')";
    }
    else if (selectedfilter == "FleetIntroduction") {
        filterUrl = "$filter=(Status eq 'In Progress') and (Phase eq 'FleetIntroduction')";
    }
    */


    var fullUrl = baseUrl + selectUrl + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: mySuccEventsHandler,
        error: myErrEventsHandler
    });
}

function mySuccEventsHandler(data) {
    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    dataTableEvents = $('#events')
        .DataTable({
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    var select = $("<select><option value=''></option></select>")
                                        .appendTo($(column.footer()).empty())
                                        .on('change',
                                            function () {
                                                var val = $.fn.dataTable.util.escapeRegex(
                                                    $(this).val()
                                                );
                                                column
                                                 .search(val ? '^' + val + '$' : '', true, false)
                                                     .draw();
                                            });

                    column.data().unique().sort().each(function (d, j) {
                        select.append("<option value='" + d + "'>" + d + "</option>")
                    });
                });
                $("#events tfoot tr").insertBefore($('#events thead tr'))
            },

            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [
                 { "mData": "Trigger" },
                 { "mData": "Issue" },   //display name is issue                               
                 { "mData": "Type" },
                 { "mData": "Likelihood" },
                 { "mData": "Consequence" },
                 { "mData": "Phase" },
                 { "mData": "Status" }
            ],
            dom: 'Bfrtip',
            buttons: true, // ['copy', 'excel', 'pdf', 'print']
            //  fixedHeader: false,
            scrollY: 280,
            //scrollX: true,
            autoWidth: true,
            columnDefs: [
                       {
                           "targets": [0],
                           "visible": true
                       },
                       {

                           "targets": [1],
                           "visible": true
                       },
                       {

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
                           "searchable": false
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
function myErrEventsHandler(data, errCode, errMessage) {
    alert("Error: myErrEventsHandler " + errMessage);
    console.log(errMessage);
}

//myrisks
function LoadRisksDataTable() {
    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').text();
    console.log("LoadRisksDataTable usrProgram is " + usrProgram);

    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    // var filterUrl = "$filter=Program eq '" + usrProgram + "'";
    var fullUrl = baseUrl + selectUrl; // + filterUrl;

    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: mySuccRisksHandler,
        error: myErrRisksHandler
    });
}
function mySuccRisksHandler(data) {
    if (dataTableRisks != 'undefined') {
        dataTableRisks.destroy();
    }
    console.log(data.d.results);
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
                { "mData": "Status" }
            ],
            //  dom: 'Bfrtip',
            //  buttons: ['copy', 'excel', 'pdf', 'print'],
            // fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            //  autoWidth: true,
            columnDefs: [
                { //trigger
                    "targets": [0],
                    "width": "35%"

                },
                { //issue
                    "targets": [1],
                    "width": "15%"
                },
                {
                    //type
                    "targets": [2],
                    "width": "20%"

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
                    "width": "10%",
                    "data": null,
                    "render": function (data, type, row) {
                        return "" + data.Likelihood + data.Consequence;
                    }
                }
                /*
                 {   //Severity   
                    "targets": [6],
                    "width": "10%",
                    "data": null,
                    "render": function (data, type, row) {		                   
                        
                    }		                
                },
                   {  //Status   
                    "targets": [7],
                    "width": "10%",
                    "data": Status,	
                    "visible": false	                               
                }
                */
            ],
            columns: [
                //filter out any data column completed. All others are used for reports
                //       { name: 'Trigger' }, //displayed in column 2
                //      { name: 'Issue' }, //index 0    //displayed in column 1             
                //     { title: 'Issue Description*' },
                //     { title: 'Category' },
                 //    { name: 'Type' }, //displayed in column 3
                //     { name: 'Phase' },                   ///index 5  //displated in column 4
                //{ name: 'Likelihood' },
                //{ name: 'Consequence' },
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
                //       { name: 'Risk' } //displayed in column 5
                //       { name: 'Status' },               //filter out completed status
                //      { name: 'ID' }
            ],
            "searching": true,
            "paging": false,
            "info": true
            // "autoWidth": true
        });
}
function myErrRisksHandler(data, errCode, errMessage) {
    alert("Error: myErrRiskHandler " + errMessage);
}

//myreviews

function LoadReviewsDataTable() {
    var listname = "ProgramIssueAndRisks";
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
        success: mySuccReviewsHandler,
        error: myErrReviewsHandler
    });
}

function mySuccReviewsHandler(data) {
    if (dataTableReviews != 'undefined') {
        dataTableReviews.destroy();
    }
    dataTableReviews = $('#reviews')
        .DataTable({
            "bDestroy": true,
            "aaData": data.d.results,
            "aoColumns": [

                 { "mData": "Title" }   //display name is issue
                // { "mData": "MitigationDate" },  //need to add duedate
               //  { "mData": "Status" },
               //  { "mData": "AdminApprovalDate" }
            ],
            //   dom: 'Bfrtip',
            //    buttons: ['copy', 'excel', 'pdf', 'print'],
            // fixedHeader: true,
            //     scrollY: 300,
            //    scrollX: true,
            autoWidth: true,
            columnDefs: [
                       {
                           //event
                           "targets": [0],
                           "visible": true

                       }
                   /*    {
                           //DueDate
                           "targets": [1],
                           
                       },
                       {
                           //Status
                           "targets": [2],
                           "width": "20%"
                       },
                       {   //MitigationDate
                           "targets": [3],
                           "width": "20%"
                       }
                       */
            ],

            columns: [
                       //filter out any data column completed. All others are used for reports
                       //   { name: 'Title' } //filter out completed status                //index 0    //displayed in column 1
                        //  { name: 'Mitigation Date' },
                       //   { name: 'Status' },
                    //    { name: 'Trigger' },                            //displayed in column 2

                   //     { title: 'Issue Description*' },
                   //     { title: 'Category' },
                   //       { name: 'Type' },                                //displayed in column 3

                    //      { name: 'Phase' },                   ///index 5  //displated in column 4

                   //     { name: 'Likelihood' },
                   //     { name: 'Consequence' },

                   //     { title: 'Mitigation 6.0d' },
                   //     { title: 'Mitigation 6.6' },          //index 10
                   //     { title: 'Mitigation 6.7' },
                   //     { title: 'Mitigation 6.8' },

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
                   //       { name: 'Risk' }                                //displayed in column 5
            ],
            "searching": true,
            "paging": true,
            "info": true

        });
}
function myErrReviewsHandler(data, errCode, errMessage) {
    alert("Error myErrReviewsHandler " + errMessage);
}


//FUNCTIONS ON PAGE
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



//SETUP DIALOGS
function loadTriggerDetails(id) {
    var executor = new SP.RequestExecutor(appWebUrl);
    var listname = "ProgramIssuesAndRisks";
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('ProgramIssuesAndRisks')/items(1)";
    var requestHeaders = {
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





