
//global variables
var dataTableEvents = 'undefined';
var dtMyEvents = 'undefined';
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var digest = "";
var currentUser;
var eTag;
var clientContext;
var website;
var currentUser;
var lastmodifieddate = "";
var eventID = "";
var eventTitle = "";
var eventPMO = "";
var eventPMA = "";
var eventProgram = "";
var eventILA = "";
var eventReqDocs = "";
var eventDev = "";
var eventTest = "";
var eventProduction = "";
var eventPostProduction = "";
var eventFleetIntroduction = "";
var eventSustainment = "";

$('#TriggerDetailsDialog').hide();
$('#overlay').hide();

SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);

function sharePointReady() {
    clientContext = SP.ClientContext.get_current();
    website = clientContext.get_web();
    clientContext.load(website);
    currentUser = website.get_currentUser();
    clientContext.load(currentUser);
    clientContext.executeQueryAsync(onRequestSucceeded, onRequestFailed);
}
function onRequestSucceeded() {
    var longUserName = currentUser.get_loginName();
    var startIndex = longUserName.lastIndexOf('\\');
    var thisUser = longUserName.substr(startIndex + 1);
    if (thisUser == "system") {
        thisUser = "kris.white";
        console.log("user is system, but changing to Kris.white for testing");
    }


    getProfile(thisUser);
    currentUser = thisUser;

    console.log("onRequestSucceeded processing login for " + currentUser);
    GetDigest();
    myCustomPage();
}
function onRequestFailed(sender, args) {
    console.log('unable to load client context' + sender + args);
}

function getProfile(user) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var filterUrl = "?$select=Title,Program,ID,Phase&$filter=Title eq '" + user + "'";
    var fullUrl = baseUrl + filterUrl;
    console.log(fullUrl);
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor2.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successGetProfilerHandler,
        error: errorGetProfilerHandler
    });
}
function successGetProfilerHandler(data) {
    var jsonObject = JSON.parse(data.body);
    //var results = jsonObject.d.results;

    $.each(jsonObject.d.results, function (index, results) {
        var uProgram = results.Program;
        var uID = results.ID;
        var uName = results.Title;
        var uPhase = results.Phase;
        console.log("processing login js GetProfile... for " + uName);
        currentUser = uName;
        //UPDATE UI
        var $element = $("#login");
        if ($element) {
            $element.attr('href', "../SitePages/Profile.aspx?Name=" + uName +
                                                      "&ProfileId=" + uID +
                                                        "&program=" + uProgram);
        }
        //profile box info
        $("#userID").val(uID);
        $("#userName").val(currentUser);
        $("#userProgram").val(uProgram);
        $("#userPhase").val(uPhase);
        //update upper right info
        $("#usrProgram").text(" |  " + uProgram);
    });
} //end of success
function errorGetProfilerHandler(data) {
    console.log("login failed: " + data.errorCode + data.errorMessage);
}



function myCustomPage() {
    $("#ddlfilter").append($("<option></option>").attr("value", "all").text("Select All"));
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("E&MD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "postproduction").text("Post Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "fleetintroduction").text("Fleet Introduction P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("Sustainment O&S"));

    $('#ddlfilter')
         .on('change',
             function () {
                 var filter = $(this).val();
                 dataTableEvents.destroy();
                 LoadEventsDataTable(filter);
             });

    $("#btnAdd").on(
    	'click', function () {
    	    CopyEvent();

    	});



    $("#btEditEvent").on(
       'click', function () {
           showEditDialog();

       });

    $("#btnAddProgram").on(
     'click', function () {
         showAddProgramDialog();
         $("#tbAddDialogStatus").val("Program Saved");

     });

    $("#btnSaveEvent").on(
   'click', function () {
       alert("Event saved to My Program Events on Dashboard");
       $("#tbEventStatus").val("Event Saved");

   });


    $("#events").on(
    		'draw.dt', function () {
    		    var seen = {};
    		    $('table tr').each(function () {
    		        var txt = $(this).text();
    		        if (seen[txt])
    		            $(this).remove();
    		        else
    		            seen[txt] = true;
    		    });
    		});


    LoadEventsDataTable();
    LoadMyProgramEventsDataTable();

    $("#tbEventDueDate").datepicker();
    $("#tbProgramDueDate").datepicker();


    $('#events tbody')
        .on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            }
            else {
                dataTableEvents.$('tr selected').removeClass('selected');
                $(this).addClass('selected');
            }

            var eventID = dataTableEvents.row(this).data().ID;
            $('#selectedRow').val(eventID);

        });

    $('#myProgramEvents tbody')
    .on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            dtMyEvents.$('tr selected').removeClass('selected');
            $(this).addClass('selected');
        }

        var programTitle = dtMyEvents.row(this).data().Title;
        $('#tbProgramTitle').val(programTitle);
        $("#tbEventTitle").val(programTitle);
    });

}

function LoadEventsDataTable(selectedfilter) {
    if (dataTableEvents !== 'undefined') {
        dataTableEvents.destroy();
    }
    // var selectedfilter = $('#ddlfilter option:selected').val();
    var listname = "ProgramEvents";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = "";
    if (selectedfilter === "development") {
        filterUrl = "$filter=Development eq 'Y'";
    }
    else if (selectedfilter === "sustainment") {
        filterUrl = "$filter=Sustainment eq 'Y'";
    }
    else if (selectedfilter === "test") {
        filterUrl = "$filter=Test eq 'Y'";
    }
    else if (selectedfilter === "production") {
        filterUrl = "$filter=Production eq 'Y'";
    }
    else if (selectedfilter === "productionfleetpost") {
        filterUrl = "$filter=(FleetIntroduction eq 'Y') and (Production eq 'Y') and (PostProduction eq 'Y')";
    }

    var fullUrl = baseUrl + selectUrl + filterUrl;

    var fullUrl = baseUrl + selectUrl;
    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: EventsSuccHandler,
        error: EventsErrHandler
    });
}

function EventsSuccHandler(data) {
    if (dataTableEvents !== 'undefined') {
        dataTableEvents.destroy();
    }

    dataTableEvents = $("#events")
        .DataTable({
            "bDestroy": true,
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,
            "aaData": data.d.results,
            "aoColumns": [
              { "mData": "Title" },
              { "mData": "Development" },
              { "mData": "Test" },
              { "mData": "Production" },
              { "mData": "FleetIntroduction" },
              { "mData": "PostProduction" },
              { "mData": "Sustainment" },
              { "mData": "ID" },
              { "mData": "Status" },

            ],

            fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            columnDefs: [
                {
                    //MajorProgramKeyEventsProducts
                    "targets": [0],
                    "visible": true,
                    "searchable": true
                },
                {
                    //Development
                    "targets": [1],
                    "visible": false,
                    "searchable": true
                },
                 {
                     "targets": [2],
                     "visible": false,
                     "searchable": true
                 },
                 {
                     "targets": [3],
                     "visible": false,
                     "searchable": true
                 },
                 {  //Fleet Intro
                     "targets": [4],
                     "visible": false,
                     "searchable": true
                 },
                 {  //Post Prod
                     "targets": [5],
                     "visible": false,
                     "searchable": true
                 },
                 {
                     //Sustainment
                     "targets": [6],
                     "visible": false,
                     "searchable": true
                 },
                    {
                        //ID
                        "targets": [7],
                        "visible": false,
                        "searchable": false
                    },
                    {
                        //Status
                        "targets": [8],
                        "visible": false,
                        "searchable": false
                    }

            ],
            columns: [
                { name: "MajorProgramKeyEventsProducts" }
               // { name: "Development" },
               // { name: "Test" },
               // { name: "Production" },
               // { name: "FleetIntroduction" },
              //  { name: "PostProduction" },
               // { name: "Sustainment" }  
            ],
            "searching": true,
            "paging": false,
            "info": false
        });
}

function EventsErrHandler(data, errCode, errMessage) {
    console.log("Error: " + errMessage);
}
function showDescription(x) {
    // $('#TriggerDescription').text(x);
}

function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbytitle('" + listname + "')/items?";
    var filterUrl = "&$filter=Title eq '" + username + "'";
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor2.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successGetUserInfoHandler,
        error: errorGetUserInfoHandler
    });
}
function successGetUserInfoHandler(data) {
    var userID = "";
    var userDisplayName = "";
    var userLeadership = "";
    var userProgram = "";
    var userPhase = "";
    //load the select option for ddlProgram 
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    userID = results[0].ProfileID;

    $("#userID").val(userID);
    $("#ddlUser").text(currentUser);

    userLeadership = results[0].IsLeadership;

    $("#userAdmin").val(userLeadership);
    userProgram = results[0].Program;

    $("#userProgram").val(userProgram);
    userProgram = results[0].Phase;
    $("#userPhase").val(userPhase);

    //UPDATE UI  

    var $element = $("#login");
    if ($element) {
        $element.attr('href', "../SitePages/Profile.aspx?Name=" + currentUser + "&id=" + userID + "&program=" + userProgram);
    }

}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    console.log("login failed: " + data.errorCode + data.errorMessage);
}

function AddEvent() {
    var eventTitle = $('#selectedRow').val();
    SaveEventByName(eventTitle);
}

function SaveEventByName(eventTitle) {
}

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
            $("#error").val(errMsg);
        }
    });
}
function PrepareForm(data) {
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
    lastmodifieddate = jsonObject.d.LastItemModifiedDate.substring(0, 10);
    console.log("Last Modified date: " + lastmodifieddate);
    $("#lastUpdated").text(" | " + "Last Updated: " + lastmodifieddate);
}

function GetEvent(eventID) {
    var listname = "ProgramEvents";
    var executor8 = new SP.RequestExecutor(appWebUrl);
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items(" + eventID + ")";

    var fullUrl = baseUrl;
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor8.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successGetEventHandler,
        error: errorGetEventHandler
    });
}
function successGetEventHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d;

    eventTitle = results.Title;
    $("#tbEventTitle").val(eventTitle);
    eventPMO = results.PMO;
    eventPMA = results.PMA;
    eventProgram = results.Program;
    eventILA = results.ILA;
    eventReqDocs = results.RequiredDocuments;
    eventDev = results.Development;
    eventTest = results.Test;
    eventProduction = results.Production;
    eventPostProduction = results.PostProduction;
    eventFleetIntroduction = results.FleetIntroduction;
    eventSustainment = results.Sustainment;
    console.log(eventID, eventTitle, eventPMO, eventProgram);


}
function errorGetEventHandler(data, errorCode, errorMessage) {
    console.log("Event not loaded");
}


function LoadMyProgramEventsDataTable() {
    if (dtMyEvents != 'undefined') {
        dtMyEvents.destroy();
    }
    // var selectedfilter = $('#ddlfilter option:selected').val();
    var listname = "MyProgramEvents";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    /*
  var filterUrl = "";
     if (selectedfilter == "development") {
         filterUrl = "$filter=Development eq 'Y'";
     }
     else if (selectedfilter == "sustainment") {
         filterUrl = "$filter=Sustainment eq 'Y'";
     }
     else if (selectedfilter == "test") {
         filterUrl = "$filter=Test eq 'Y'";
     }
     else if (selectedfilter == "production") {
         filterUrl = "$filter=Production eq 'Y'";
     }
     else if (selectedfilter == "productionfleetpost") {
         filterUrl = "$filter=(FleetIntroduction eq 'Y') and (Production eq 'Y') and (PostProduction eq 'Y')";
     }
 */
    // var listname = "MyProgramEvents";
    var executor11 = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items?";
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor11.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successGetMyEventHandler,
        error: errorGetMyEventHandlercol
    });
}

function successGetMyEventHandler(data) {
    if (dtMyEvents != 'undefined') {
        dtMyEvents.destroy();
    }

    dtMyEvents = $("#myProgramEvents")

        .DataTable({
            "bDestroy": true,
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,
            // "aaData": data.d,
            // "aoColumns": [
            //   { "mData": "Title" },
            //    { "mData": "Development" },
            //   { "mData": "Test" },
            //    { "mData": "Production" },
            //    { "mData": "FleetIntroduction" },
            //   { "mData": "PostProduction" },
            //    { "mData": "Sustainment" },
            //    { "mData": "ID" }
            //   ],

            fixedHeader: true,
            scrollY: 400,
            scrollX: true
            /*
               columnDefs: [
                     {
                         //MajorProgramKeyEventsProducts
                         "targets": [0],
                         "visible": true,
                         "searchable": true
                     },
                     {
                         //Due Date
                         "targets": [1],
                         "visible": true,
                         "searchable": true
                     },
                      {   //status
                          "targets": [2],
                          "visible": true,
                          "searchable": true
                      },
                      {   //date completed
                          "targets": [3],
                          "visible": true,
                          "searchable": true
                      }
                     
                 ]
              //   columns: [
                //     { name: "Event" }
                 //    { name: "Due Date" },
                 //    { name: "Status" },
                  //   { name: "Date Completed" }
                    // { name: "FleetIntroduction" },
                   //  { name: "PostProduction" },
                    // { name: "Sustainment" }  
              //   ],
                 
                // "searching": true,
                // "paging": false,
                // "info": false
               */
        });


}

function errorGetMyEventHandler(data, errCode, errMessage) {
    console.log("Error: " + errMessage);
}

function showEditDialog() {
    $('#EditEventDialog').modal();
}

function showAddProgramDialog() {
    $('#AddProgramDialog').modal();
}

function CopyEvent() {
    var selectedeventID = $("#selectedRow").val();

    GetEvent(selectedeventID);
    AddEventToMyProgramEvents();
}

function AddEventToMyProgramEvents() {
    dtMyEvents.row.add([eventTitle]).draw();
}

function LoadEventsDataTable(selectedfilter) {
    if (dataTableEvents !== 'undefined') {
        dataTableEvents.destroy();
    }
    // var selectedfilter = $('#ddlfilter option:selected').val();
    var listname = "ProgramEvents";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = "";
    if (selectedfilter == "development") {
        filterUrl = "$filter=Development eq 'Y'";
    }
    else if (selectedfilter == "sustainment") {
        filterUrl = "$filter=Sustainment eq 'Y'";
    }
    else if (selectedfilter == "test") {
        filterUrl = "$filter=Test eq 'Y'";
    }
    else if (selectedfilter == "production") {
        filterUrl = "$filter=Production eq 'Y'";
    }
    else if (selectedfilter == "productionfleetpost") {
        filterUrl = "$filter=(FleetIntroduction eq 'Y') and (Production eq 'Y') and (PostProduction eq 'Y')";
    }

    var fullUrl = baseUrl + selectUrl + filterUrl;

    var fullUrl = baseUrl + selectUrl;
    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: EventsSuccHandler,
        error: EventsErrHandler
    });
}

function EventsSuccHandler(data) {
    if (dataTableEvents !== 'undefined') {
        dataTableEvents.destroy();
    }

    dataTableEvents = $("#events")
        .DataTable({
            "bDestroy": true,
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,
            "aaData": data.d.results,
            "aoColumns": [
              { "mData": "Title" },
              { "mData": "Development" },
              { "mData": "Test" },
              { "mData": "Production" },
              { "mData": "FleetIntroduction" },
              { "mData": "PostProduction" },
              { "mData": "Sustainment" },
              { "mData": "ID" },
              { "mData": "Status" },

            ],

            fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            columnDefs: [
                {
                    //MajorProgramKeyEventsProducts
                    "targets": [0],
                    "visible": true,
                    "searchable": true
                },
                {
                    //Development
                    "targets": [1],
                    "visible": false,
                    "searchable": true
                },
                 {
                     "targets": [2],
                     "visible": false,
                     "searchable": true
                 },
                 {
                     "targets": [3],
                     "visible": false,
                     "searchable": true
                 },
                 {  //Fleet Intro
                     "targets": [4],
                     "visible": false,
                     "searchable": true
                 },
                 {  //Post Prod
                     "targets": [5],
                     "visible": false,
                     "searchable": true
                 },
                 {
                     //Sustainment
                     "targets": [6],
                     "visible": false,
                     "searchable": true
                 },
                    {
                        //ID
                        "targets": [7],
                        "visible": false,
                        "searchable": false
                    },
                    {
                        //Status
                        "targets": [8],
                        "visible": false,
                        "searchable": false
                    }

            ],
            columns: [
                { name: "MajorProgramKeyEventsProducts" }
               // { name: "Development" },
               // { name: "Test" },
               // { name: "Production" },
               // { name: "FleetIntroduction" },
              //  { name: "PostProduction" },
               // { name: "Sustainment" }  
            ],
            "searching": true,
            "paging": false,
            "info": false
        });
}

function EventsErrHandler(data, errCode, errMessage) {
    console.log("Error: " + errMessage);
}


