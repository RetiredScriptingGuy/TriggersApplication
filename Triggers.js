//global variables
var dataTableTriggers = "undefined";
var dataTableIssues = "undefined";
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var digest = "";
var currentUser;
var listName = "Triggers";
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var eTag;

_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("Test TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("Development EMD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "fleet introduction").text("Fleet Introduction P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "post production").text("Post Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("Sustainment O&S"));

    $("#ddlfilter")
      .on('change',
          function () {
              var colnumber = 0;
              var filter = this.value;

              if (filter === "selectall") {
                  window.location.reload();
              }
              else if (filter === "sustainment") {
                  colnumber = 7;
              }
              else if (filter === "development") {
                  colnumber = 2;
              }
              else if (filter === "test") {
                  colnumber = 3;
              }
              else if (filter === "production") {
                  colnumber = 4;
              }
              else if (filter === "fleet introduction") {
                  colnumber = 5;
              }
              else if (filter === "post production") {
                  colnumber = 6;
              };

              dataTableTriggers
                      .column(colnumber)
                      .search("Y")
                      .draw();
          });

    //Get Name of New User
    var thisUser = getQueryStringParameter("Name");
    console.log(thisUser);

    GetUserInfo(thisUser);

    currentUser = thisUser;

    $("#userName").val(currentUser);
    $("#digestmsg").val(digest);


    loadTriggersDataTable();
    // loadIssuesDataTable();

    //EVENTS
    $("#triggers tbody")
        .on("click", "tr", function () {

            var rowtriggerdata = dataTableTriggers.row(this).data().TriggerDescription;
            console.log("processing triggers tbody " + rowtriggerdata);
            showTriggerDescription(rowtriggerdata);

            var rowtrigger = dataTableTriggers.row(this).data().Title;

            //redraw issues with just the associated trigger

            dataTableIssues
                  .columns(3)
                  .search(rowtrigger)
                  .draw();

            var y = dataTableTriggers.row(this).data().Title;

            $("#Issues >tbody:last-child").after("<tr><td>" + row(this).data().Title + "<td></tr>");



        });


    $("#TriggerDescription tbody")
        .on("click",
            "tr",
            function () {

                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    dataTableTriggers.$("tr selected").removeClass("selected");
                    $(this).addClass("selected");
                }
            });

    $("#issues tbody")
        .on("click",
            "tr",
            function () {

                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    dataTableIssues.$("tr selected").removeClass("selected");
                    $(this).addClass("selected");
                }

                var rowissuedata = dataTableIssues.row(this).data().IssueDescription;
                console.log("Issue Description is " + rowissuedata);
                showIssueDescription(rowissuedata);
            });

    // GetDigest();
    //$("#ddlfilter")
    //    .on("change",
    //        function () {
    //            var filter = $(this).val();
    //            loadTriggerDataTable(filter);
    //        });

    //  alert("select a phase from the filter in the upper left");

}//end of my custom page

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
            $("#error").val(errMsg);
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


function loadTriggersDataTable() {
    var executor = new SP.RequestExecutor(appWebUrl);
    var requestHeaders = { "accept": "application/json;odata=verbose" };
    if (dataTableTriggers != 'undefined') {
        dataTableTriggers.destroy();
    }
    var listname = "Triggers";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";

    var fullUrl = baseUrl + selectUrl;

    executor.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: TriggersSuccHandler,
        error: TriggersErrHandler
    });
}

function TriggersSuccHandler(data) {
    if (dataTableTriggers != "undefined") {
        dataTableTriggers.destroy();
    }
    dataTableTriggers = $("#triggers")
        .DataTable({
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true, // ['copy', 'excel', 'pdf', 'print']
            "aaData": data.d,
            "aoColumns": [
                { "mData": "Title" },
                { "mData": "TriggerDescription" },
                { "mData": "Development" },
                { "mData": "Test" },
                { "mData": "Production" },
                { "mData": "FleetIntroduction" },
                { "mData": "PostProduction" },
                { "mData": "Sustainment" }
            ],
            scrollY: 300,
            columnDefs: [
                {
                    "targets": [0],
                    "data": null,
                    "visible": true,
                    "searchable": false
                },
                {
                    "targets": [1],
                    "data": null,
                    "visible": true,
                    "searchable": false
                },
                {
                    "targets": [2],
                    "data": "Development",
                    "visible": true,
                    "searchable": true
                },
                {
                    "targets": [3],
                    "visible": true,
                    "data": "Test",
                    "searchable": true
                },
                {
                    "targets": [4],
                    "visible": true,
                    "data": "Production",
                    "searchable": true
                },
                {
                    "targets": [5],
                    "visible": true,
                    "data": "FleetIntroduction",
                    "searchable": true
                },
                {
                    "targets": [6],
                    "visible": true,
                    "data": "PostProduction",
                    "searchable": true
                },
                {
                    "targets": [7],
                    "visible": true,
                    "data": "Sustainment",
                    "searchable": true
                }
            ],
            columns: [
                { name: "Trigger" },
                { name: "TriggerDescription" },
                { name: "Development" },
                { name: "Test" },
                { name: "Production" },
                { name: "FleetIntroduction" },
                { name: "PostProduction" },
                { name: "Sustainment" }
            ],
            "searching": true,
            "paging": false,
            "info": true
        });

}


function TriggersErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function loadIssuesDataTable() {
    var executor = new SP.RequestExecutor(appWebUrl);
    var requestHeaders = { "accept": "application/json;odata=verbose" };
    var listname = "ProgramIssuesAndRisks";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "'')/items?";

    var fullUrl = baseUrl + selectUrl;
    executor.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: IssuesSuccHandler,
        error: IssuesErrHandler
    });
}
function IssuesSuccHandler(data) {
    if (dataTableIssues != "undefined") {
        dataTableIssues.destroy();
    }
    dataTableIssues = $("#issues")
        .DataTable({
            select: { style: "single" },

            "aaData": data.d.results,
            "aoColumns": [
                { "mData": "Title" },
                { "mData": "IssueDescription" },
                { "mData": "Trigger" }

            ],
            dom: 'Bfrtip',
            buttons: ['copy', 'excel', 'pdf', 'print'],
            // buttons: true,
            fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            columnDefs: [
                {
                    "targets": [0],
                    "visible": true,
                    "searchable": true
                },

                {
                    "targets": [1],
                    "visible": true,
                    "searchable": false
                },
                 {
                     "targets": [2],
                     "visible": true,
                     "searchable": true
                 }

            ],
            columns: [
                { title: "IssueTitle" },
                { title: "IssueDescription*" },
                { title: "Trigger" }
            ],
            "searching": true,
            "paging": false,
            "info": true
        });
}
function IssuesErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function clearDescriptionTable() {
    var oTable = $("#TriggerDescription").DataTable({});
    oTable
           .clear()
           .destroy();

}

function clearIssuesDescriptionTable() {
    var oTable2 = $("#IssueDescription").DataTable({});
    oTable2
       .clear()
        .destroy();



}



function showTriggerDescription(trigdesc) {
    var oTable = $("#TriggerDescription").DataTable({});
    oTable
       .clear()
       .destroy();

    $("#TriggerDescription").append("<tr class='added'><td>" + trigdesc + "</td>/tr>");
    $("#TriggerDescription").append("<tr class='added'><td>----------------------------</td></tr>");
    console.log("added item to description area " + trigdesc);
}

function showIssueDescription(issdesc) {
    var oTable2 = $("#IssueDescription").DataTable({});
    oTable2
       .clear()
        .destroy();
    $("#IssueDescription").append("<tr class='added'><td>" + issdesc + "</td>/tr>");
    $("#IssueDescription").append("<tr class='added'><td>----------------------------</td></tr>");
    console.log("added item to issue area " + issdesc);
}

//HELPER FUNCTIONS
function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
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
    //load the select option for ddlProgram 
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    userID = jsonObject.d.ProfileID;
    console.log("userID = " + userID);
    $("#userID").val(userID);
    userDisplayName = jsonObject.d.Title;
    $("#ddlUser").text(currentUser);
    console.log("display name = " + userDisplayName);
    userLeadership = jsonObject.d.IsLeadership;
    console.log("userLeadership  = " + userLeadership);
    $("#userAdmin").val(userLeadership);
    userProgram = jsonObject.d.Program;
    console.log("userProgram  = " + userProgram);
    $("#userProgram").val(userProgram);

    //UPDATE UI  

    var $element = $("#login");
    if ($element) {
        $element.attr('href', "../SitePages/Profile.aspx?Name=" + currentUser + "&id=" + userID + "&program=" + userProgram);
    }

}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}