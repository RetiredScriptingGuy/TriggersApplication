//global variables
var dataTableEvents = 'undefined';
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


    $("#ddlfilter").append($("<option></option>").attr("value", "selectall").text("Select All"));
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("E&MD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("O&S"));

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
    var results = jsonObject.d.results;

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



    $("#btnEditEvent").on(
       'click', function () {
           showEditDialog();

       });

    $("#btnAddProgram").on(
     'click', function () {
         showEditDialog();

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

    //   LoadEventsDataTable(filter);


    // alert("select a phase from the filter in the upper left");


    //var clientContext;
    //var web;
    //var currentUser;

    //clientContext = SP.ClientContext.get_current();
    //web = clientContext.get_web();
    //clientContext.load(web);
    //currentUser = web.get_currentUser();
    //clientContext.load(currentUser);


    //clientContext.executeQueryAsync(
    //    function () {
    //        currentUser = web.get_currentUser();
    //        var longUserName = currentUser.get_loginName();
    //        var startIndex = longUserName.lastIndexOf('\\');
    //        var thisUser = longUserName.substr(startIndex + 1);
    //        var $element = $("#login");
    //        if ($element) {
    //            $element.attr("href", "../SitePages/Profile.aspx?Name=" + thisUser);
    //        }
    //    },
    //    function () { alert("Request failed") }
    //);

    //GetUserInfo(currentUser);
    // var filter = $("#userPhase").val();
    //  $('#ddlfilter').val(filter);

    LoadEventsDataTable();
    LoadMyProgramEventsDataTable();


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
              { "mData": "MajorProgramKeyEventsProducts" },
              { "mData": "Development" },
              { "mData": "Test" },
              { "mData": "Production" },
              { "mData": "FleetIntroduction" },
              { "mData": "PostProduction" },
              { "mData": "Sustainment" },
              { "mData": "ID" }
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
    var executor8 = new SP.RequestExecutor(appweburl);
    var baseUrl = appweburl + "/_api/web/lists/getbytitle('" + listname + "')/items?";
    var filterUrl = "&$filter = ID eq '" + eventID + "'";
    var fullUrl = baseUrl + filterUrl;
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
    var results = jsonObject.d.results;

    $.each(jsonObject.d.results, function (index, results) {
        eventID = results.ID;
        eventTitle = results.Title;
        eventPMO = results.PMO;
        eventPMA = results.PMA;
        eventProgram = results.Program;
        eventILA = results.ILA;
        eventReqDocs = results.RequiredDocuments;
        eventDev = results.Development;
        eventTest = results.Development;
        eventProduction = results.Development;
        eventPostProduction = results.Development;
        eventFleetIntroduction = results.Development;
        eventSustainment = results.Development;

    });

}
function errorGetEventHandler(data, errorCode, errorMessage) {
    console.log("Event not loaded");
}

function CopyEvent() {
    var selectedeventID = $("#selectedrow");

    GetEvent(selectedeventID);
    AddEventToMyProgramEvents();
}

function AddEventToMyProgramEvents() {

}

function LoadMyProramEventsDataTable() {
    if (myProgramEventsDataTable !== 'undefined') {
        myProgramEventsDataTable.destroy();
    }
    // var selectedfilter = $('#ddlfilter option:selected').val();
    var listname = "MyProgramEvents";
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

    var listname = "MyProgramEvents";
    var executor9 = new SP.RequestExecutor(appweburl);
    var fullUrl = appweburl + "/_api/web/lists/getbytitle('" + listname + "')/items?";
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor9.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successGetEventHandler,
        error: errorGetEventHandler
    });
}

function EventsSuccHandler(data) {
    if (dataTableEvents !== 'undefined') {
        dataTableEvents.destroy();
    }

    dataTableEvents = $("#myProgramEvents")
        .DataTable({
            "bDestroy": true,
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,
            "aaData": data.d.results,
            "aoColumns": [
              { "mData": "MajorProgramKeyEventsProducts" },
              { "mData": "Development" },
              { "mData": "Test" },
              { "mData": "Production" },
              { "mData": "FleetIntroduction" },
              { "mData": "PostProduction" },
              { "mData": "Sustainment" },
              { "mData": "ID" }
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

function showEditDialog() {
    $('#EditEventDialog').modal();
}

function showProgramDialog() {
    $('#AddProgramDialog').modal();
}
