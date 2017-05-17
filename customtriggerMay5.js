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
var lastModifiedDate;

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
    myCustomPage(); //now setup the page
}
function onRequestFailed(sender, args) {
    console.log('unable to load client context' + sender + args);
}

function getProfile(user) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var filterUrl = "?$select=Title,Program,ID&$filter=Title eq '" + user + "'";
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
        $("#usrProgram").text(" |  " + programtext);


    });



} //end of success
function errorGetProfilerHandler(data) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}




function myCustomPage() {
    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("EMD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("Production P&D"));
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

              var diaIssuePhase = filter;
              $(".modal-body #taIssuePhas").val(diaIssuePhase);


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
    //  LoadIssuesDataTable();

    //EVENTS
    $("#triggers tbody")
        .on("click", "tr", function () {



            var rowtriggerdata = dataTableTriggers.row(this).data().TriggerDescription;
            console.log("processing triggers tbody " + rowtriggerdata);
            showTriggerDescription(rowtriggerdata);
            $("#issueTriggerDescription").val(rowtriggerdata);



            var triggerfilter = dataTableTriggers.row(this).data().Title;
            $("#dialogTriggerTitle").val(triggerfilter);

            var diaTriggerTitle = triggerfilter;
            var daiIssueTitle = rowtriggerdata;

            var diaIssueDescription = rowtriggerdata;
            console.log("my_id_value : " + diaTriggerTitle);
            $(".modal-body #tbIssueTitle").val(daiIssueTitle);

            $(".modal-body #tbIssueDescription").val(diaIssueDescription);
            //redraw issues with just the associated trigger

            //dataTableIssues
            //.columns(3)
            // .search(rowtrigger)
            // .draw();

            //var y = dataTableTriggers.row(this).data().Title;

            // $("#Issues >tbody:last-child").after("<tr><td>" + row(this).data().Title + "<td></tr>");

            LoadIssuesDataTable(triggerfilter);

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
                var mit60ddata = dataTableIssues.row(this).data().Mitigation60d;
                var mit66data = dataTableIssues.row(this).data().Mitigation66;
                var mit67data = dataTableIssues.row(this).data().Mitigation67;
                var mit68data = dataTableIssues.row(this).data().Mitigation68;

                console.log("Issue Description is " + rowissuedata);
                showIssueDescription(rowissuedata);
                showMitigationDescription(mit60ddata, mit66data, mit67data, mit68data);

                var diaIssueDescription = rowissuedata;
                console.log("diaIssueDescription : " + diaIssueDescription);
                $(".modal-body #tbIssueDescription").val(diaIssueDescription);
                $(".modal-body #taIssueMitigation60d").val(mit60ddata);
                $(".modal-body #taIssueMitigation66").val(mit66data);
                $(".modal-body #taIssueMitigation67").val(mit67data);
                $(".modal-body #taIssueMitigation68").val(mit68data);



            });

    $("#btnAddTrigger")
       .on("click",
           function () {
               AddTrigger();
           });


    GetDigest();

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
    if (dataTableTriggers != "undefined") {
        dataTableTriggers.destroy();
    }


    var requestHeaders = { "accept": "application/json;odata=verbose" };
    var listname = "Triggers";
    var usrProgram = $('#userProgram').val();
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;
    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
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
            "bDestroy": true,
            select: { style: "single" },
            dom: 'Bfrtip',
            buttons: true,// ['copy', 'excel', 'pdf', 'print']
            "aaData": data.d.results,
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
                { name: "Title" },
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
            "info": false
        });



}

function TriggersErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function LoadIssuesDataTable(filter) {
    if (dataTableIssues != "undefined") {
        dataTableIssues.destroy();
    }

    var listname = "ProgramIssuesAndRisks";
    var usrProgram = $('#userProgram').val();
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;
    $.ajax({
        url: fullUrl,
        type: "GET",
        dataType: "json",
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
            "bDestroy": true,
            select: { style: "single" },
            "aaData": data.d.results,
            "aoColumns": [
                { "mData": "Title" },
                { "mData": "IssueDescription" },
                { "mData": "Trigger" },
                 { "mData": "Mitigation60d" },
                { "mData": "Mitigation66" },
                { "mData": "Mitigation67" },
                 { "mData": "Mitigation68" }
            ],
            dom: 'Bfrtip',
            //buttons: ['copy', 'excel', 'pdf', 'print'],
            buttons: true,
            fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            columnDefs: [
                {
                    //Title issue
                    "targets": [0],
                    "visible": true,
                    "searchable": true
                },

                {
                    //Issue description
                    "targets": [1],
                    "visible": false,
                    "searchable": false
                },
                 {
                     //trigger
                     "targets": [2],
                     "visible": false,
                     "searchable": false
                 },
                     {
                         //Mitigation 6.0d
                         "targets": [3],
                         "visible": false,
                         "searchable": true
                     },

                {
                    //Mitigation 6.6
                    "targets": [4],
                    "visible": false,
                    "searchable": true
                },
                 {
                     //Mitigation 6.7
                     "targets": [5],
                     "visible": false,
                     "searchable": true
                 },
                {
                    //Mitigation 6.8
                    "targets": [6],
                    "visible": false,
                    "searchable": true
                }


            ],
            columns: [
                { title: "Title" },
                { title: "IssueDescription*" },
                { title: "Trigger" },
                { title: "Mitigation 60d" },
                { title: "Mitigation 66" },
                { title: "Mitigation 67" },
                { title: "Mitigation 68" }


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
    var oTable2 = $("#IssueDescription").DataTable({
        scrollY: 400,
        scrollX: true
    });
    oTable2
       .clear()
        .destroy();
}

function clearMitigationDescriptionTable() {

    var oTable3 = $("#MitigationDescription").DataTable({
        scrollY: 200
    });
    oTable3
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

function showMitigationDescription(mit60ddata, mit66data, mit67data, mit68data) {
    var oTable3 = $("#MitigationDescription").DataTable({});
    oTable3
       .clear()
       .destroy();

    console.log(mit60ddata, mit66data, mit67data, mit68data);
    if (mit60ddata) {
        $("#MitigationDescription").append("<tr class='added'><td>Mitigation 6.0d: " + mit60ddata + "</td>/tr>");
        $("#MitigationDescription").append("<tr class='added'><td>----------------------------</td></tr>");
    }
    if (mit66data) {
        $("#MitigationDescription").append("<tr class='added'><td>Mitigation 6.6" + mit66data + "</td>/tr>");
        $("#MitigationDescription").append("<tr class='added'><td>----------------------------</td></tr>");
    }
    if (mit67data) {
        $("#MitigationDescription").append("<tr class='added'><td>Mitigation 6.7d" + mit67data + "</td>/tr>");
        $("#MitigationDescription").append("<tr class='added'><td>----------------------------</td></tr>");
    }
    if (mit68data) {
        $("#MitigationDescription").append("<tr class='added'><td>Mitigation 6.8d" + mit68data + "</td>/tr>");
        $("#MitigationDescription").append("<tr class='added'><td>----------------------------</td></tr>");
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


function CopySelectedIssueDialog() {
    $('#CopyIssue').modal();
}

function ShowAddTriggerDialog() {
    $('#AddTriggerDialog').modal();
}

function AddTrigger() {
    $("#tbAddDialogStatus").hide();

    var dialogtriggertitle;
    var dialogtriggerdescription;
    var dialogtriggercbdevepment;
    var dialogtriggercbtest;
    var dialogtriggercbproduction;
    var dialogtriggercbpostproduction;
    var dialogtriggercbfleet;
    var dialogtriggercbsustainment;
    

    dialogtriggertitle = $("#tbAddDialogTriggerTitle").val();
    dialogtriggerdescription = $("#tbAddDialogTriggerDescription").val();

    if ($("#cbDevelopment").is(':checked')) {
        dialogtriggercbdevepment = "True";
    } else {
        dialogtriggercbdevepment = "False";
    }

    if ($("#cbTest").is(':checked')) {
        dialogtriggercbtest = "True";
    } else {
        dialogtriggercbtest = "False";
    }

    if ($("#cbProduction").is(':checked')) {
        dialogtriggercbproduction = "True";
    } else {
        dialogtriggercbproduction = "False";
    }

    if ($("#cbPostProduction").is(':checked')) {
        dialogtriggercbpostproduction = "True";
    } else {
        dialogtriggercbpostproduction = "False";
    }

    if ($("#cbFleetIntroduction").is(':checked')) {
        dialogtriggercbfleet = "True";
    } else {
        dialogtriggercbfleet = "False";
    }

    if ($("#cbSustainment").is(':checked')) {
        dialogtriggercbsustainment = "True";
    } else {
        dialogtriggercbsustainment = "False";
    }

    var listname = "Triggers";

    var executor = new SP.RequestExecutor(appweburl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': dialogtriggertitle,
        'TriggerDescription': dialogtriggerdescription,
        'Development': dialogtriggercbdevepment,
        'Test': dialogtriggercbtest,
        'Production': dialogtriggercbproduction,
        'FleetIntroduction': dialogtriggercbfleet,
        'PostProduction': dialogtriggercbpostproduction,
        'Sustainment': dialogtriggercbsustainment
    });

    var requestHeaders = {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "X-HTTP-METHOD": "POST",
        "content-length": requestBody.length,
        "Content-Type": "application/json;odata=verbose"
    };

    executor.executeAsync({
        url: fullUrl,
        method: "POST",
        body: requestBody,
        headers: requestHeaders,
        success: successItemAddedHandler,
        error: errorItemAddedHandler
    });
}

function successItemAddedHandler() {
    $("#tbAddDialogStatus").show();
    $("#tbAddDialogStatus").val("Trigger Added");

}

function errorItemAddedHandler(data, errorCode, errorMessage) {
    alert("Fialed to add Trigger : " + errorCode + errorMessage);
}

function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}



