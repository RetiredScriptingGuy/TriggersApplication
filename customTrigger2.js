//global variables
var dataTableTriggers = "undefined";
var dataTableIssues = "undefined";
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var digest = "";

var listName = "Triggers";
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var eTag;
var clientContext;
var website;
var currentUser;

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
    if (thisUser = "system") {
        thisUser = "kris.white";
        console.log("user is system, but changing to Kris.white for testing");
    }

    getProfile(thisUser);
    currentUser = thisUser;

    console.log("onRequestSucceeded processing login for " + currentUser);
    myCustomPage(); //now setup the page
}
function onRequestFailed(sender, args) {
    console.log('unable to load client context' + sender + args);
}

function getProfile(user) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var basellUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var filterUrl = "?$select=Title,Program,ID&$filter=Title eq '" + user + "'";
    var fullUrl = basellUrl + filterUrl;
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
        console.log("processing login js GetProfile... for " + uName);
        currentUser = uName;
        //UPDATE UI
        var $element = $("#login");
        if ($element) {
            $element.attr('href', "../SitePages/Profile.aspx?Name=" + uName +
                                                      "&ProfileId=" + uID +
                                                        "&program=" + uProgram);
        }

        $("#userName").val(currentUser);
        $("#userID").val(uID);
        $("#userProgram").val(uProgram);
        var programtext = $("#userProgram").val();
        $("#usrProgram").text(" |  " + uProgram);


    });


    if (jsonObject.d.results.length === 0) {
        $('#overlay').show();

        if (window.confirm("No profile found for : " + currentUser + ". Please click OK to setup a profile or cancel to return to the home page")) {
            alert("Setup a profile now?");
            $('#overlay').hide();
            window.location = appWebUrl + "/SitePages/NewProfile.aspx?Name=" + currentUser;
        }
        else {
            window.location = "http://www.google.com";
        }
    }
} //end of success
function errorGetProfilerHandler(data) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}




function myCustomPage() {
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("Test TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("EMD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production post fleet").text(" P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("O&S"));

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

    console.log(currentUser);

    GetUserInfo(currentUser);



    $("#userName").val(currentUser);
    $("#digestmsg").val(digest);


    LoadTriggersDataTable();
    LoadIssuesDataTable();

    //EVENTS
    $("#triggers tbody")
        .on("click", "tr", function () {

            var rowtriggerdata = dataTableTriggers.row(this).data().TriggerDescription;
            console.log("processing triggers tbody " + rowtriggerdata);
            showTriggerDescription(rowtriggerdata);

            alert(dataTableTriggers.row(this).data().Title);

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
    lastModifiedDate = jsonObject.d.LastItemModifiedDate.substring(0, 10);
    console.log("Last Modified date: " + lastModifiedDate);
    $("#lastUpdated").text(" | " + "Last Updated: " + lastModifiedDate);
}

function LoadTriggersDataTable() {
    var executor = new SP.RequestExecutor(appWebUrl);
    var requestHeaders = { "accept": "application/json;odata=verbose" };
    var listname = "Triggers";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;


    
}

function TriggersSuccHandler(data) {
    if (dataTableTriggers != "undefined") {
        dataTableTriggers.destroy();
    }
    dataTableTriggers = $("#triggers")
        .DataTable({
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,// ['copy', 'excel', 'pdf', 'print']
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
                {   //trigger title
                    "targets": [0],
                    "visible": true,
                    "searchable": false
                    
                }
                
                ,
                {   //trigger description
                    "targets": [1],
                    "visible": false,
                    "searchable": false
                }
                
                ,
                {   //dev
                    "targets": [2],
                    "visible": false,
                    "searchable": true
                },
                
                {    //test
                    "targets": [3],
                    "visible": false,                  
                    "searchable": true
                },
                {   //production
                    "targets": [4],
                    "visible": false,               
                    "searchable": true
                },
                {   //fleet introduction
                    "targets": [5],
                    "visible": false,                  
                    "searchable": true
                },
                {   //postproduction
                    "targets": [6],
                    "visible": false,                  
                    "searchable": true
                },
                {   //sustainment
                    "targets": [7],
                    "visible": false,               
                    "searchable": true
                }
                

            ],
            columns: [
                { name: "Title" }
                /*
                { name: "TriggerDescription" },
                { name: "Development" },
                { name: "Test" },
                { name: "Production" },
                { name: "FleetIntroduction" },
                { name: "PostProduction" },
                { name: "Sustainment" }
                */
            ],
            "searching": true,
            "paging": false,
            "info": false
        });

}

function TriggersErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function LoadIssuesDataTable() {
    var executor = new SP.RequestExecutor(appWebUrl);
    var requestHeaders = { "accept": "application/json;odata=verbose" };
    var listname = "ProgramIssuesAndRisks";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "'')/items";
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

            "aaData": data.d,
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
            "info": false
        });
}
function IssuesErrHandler(data, errCode, errMessage) {
    console.log("Error: " + errMessage);
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

}

function showIssueDescription(issdesc) {
    var oTable2 = $("#IssueDescription").DataTable({});
    oTable2
       .clear()
        .destroy();
    $("#IssueDescription").append("<tr class='added'><td>" + issdesc + "</td>/tr>");
    $("#IssueDescription").append("<tr class='added'><td>----------------------------</td></tr>");

}


function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var basellUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbytitle('" + listname + "')/items?";
    var filterUrl = "&$filter=Title eq '" + username + "'";
    var fullUrl = basellUrl + selectUrl + filterUrl;
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

    $("#userID").val(userID);
    $("#ddlUser").text(currentUser);

    userLeadership = jsonObject.d.IsLeadership;

    $("#userAdmin").val(userLeadership);
    userProgram = jsonObject.d.Program;

    $("#userProgram").val(userProgram);

    //UPDATE UI  

    var $element = $("#login");
    if ($element) {
        $element.attr('href', "../SitePages/Profile.aspx?Name=" + currentUser + "&id=" + userID + "&program=" + userProgram);
    }

}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    console.log("login failed: " + data.errorCode + data.errorMessage);
}
