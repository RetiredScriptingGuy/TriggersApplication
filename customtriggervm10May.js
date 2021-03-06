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
    var filterUrl = "?$select=Title,Program,Phase,ID&$filter=Title eq '" + user + "'";
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
        var uPhase = results.Phase;
        $("#userPhase").val(uPhase);
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

              var dialogCopyPhase = filter;
              $(".modal-body #tbCopyIssuePhase").val(dialogCopyPhase);


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
            $("#tbCopyIssueDescriptionTitle").val(rowtriggerdata);



            var triggerfilter = dataTableTriggers.row(this).data().Title;
            $("#tbCopyTriggerTitle").val(triggerfilter);

            var diaTriggerTitle = triggerfilter;
            var daiIssueTitle = rowtriggerdata;

            var diaIssueDescription = rowtriggerdata;
            console.log("my_id_value : " + diaTriggerTitle);
            $(".modal-body #tbCopyIssueTitle").val(daiIssueTitle);

            $(".modal-body #tbCopyIssueDescription").val(diaIssueDescription);

            var copyPhase = $("#userPhase").val()
            $(".modal-body #tbCopyIssuePhase").val(copyPhase);
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
                $(".modal-body #taCopyMitigation60d").val(mit60ddata);
                $(".modal-body #taCopyMitigation66").val(mit66data);
                $(".modal-body #taCopyMitigation67").val(mit67data);
                $(".modal-body #taCopyMitigation68").val(mit68data);



            });

    $("#btnAddTrigger")
       .on("click",
           function () {
               AddTrigger();
           });

    $("#btnAddTo")
      .on("click",
          function () {
              AddTo();
          });

    $("#btnSaveAndContinue")
      .on("click",
          function () {
              //for the copy form
              SaveAndContinue();
          });


    $("#btnAddSaveAndContinue")
      .on("click",
          function () {
              //for a blank form
              AddSaveAndContinue();
          });

    $("#btnAddIssue")
     .on("click",
         function () {
             AddTo();
         });

    $("#btnAddCancel")
   .on("click",
       function () {
           window.location.replace("Triggers.aspx");

       });




    GetDigest();

    //  $("#tbMitigationStart").datepicker();
    $('#tbMitigationStart').datepicker();
    $('#tbMitigationEnd').datepicker();
    $('#tbAddMitigationStart').datepicker();
    $('#tbAddMitigationEnd').datepicker();



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
                    "searchable": true
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
    userPhase = results[0].Phase;

    $("#userProgram").val(userProgram);
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


function CopySelectedIssueDialog() {
    $('#CopyIssue').modal();
    $("#btnNotFinished").hide();
    $("#btnFinished").hide();

}

function ShowAddTriggerDialog() {
    $('#AddTriggerDialog').modal();
}

function AddTrigger() {


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

    var executor = new SP.RequestExecutor(appWebUrl);
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
        success: successAddedTriggerHandler,
        error: errorAddedTriggerHandler
    });
}
function successAddedTriggerHandler() {

    $("#tbAddDialogStatus").val("Trigger Added");

}
function errorAddedTriggerHandler(data, errorCode, errorMessage) {
    $("#tbAddDialogStatus").val("Fialed to add Trigger : " + errorCode + errorMessage);
}

function AddTo() {
    $("#CopyStatusPanel").show();
    // $("#btnNotFinished").show();
    // $("#btnFinished").show();
    var list = $("#ddlCopyTo").val();
    if (list == "Risk") {
        list = "MyProgramRisks";
        AddToRisks(list);
    }
    if (list == "Issue") {
        list = "MyProgramIssues";
        AddToIssues(list);
    }


    $("#tbCopyStatus").val("Successfully Added! Are you finished adding items?");
}



//Add to Risk from pefilled dialog
function AddToRisks(list) {
    var listname = list;
    var action = "copy";
    //var listname = "MyProgramRisks";
    var trigger = $('#tbCopyTriggerTitle').val();
    var issue = $('#tbCopyIssueTitle').val();
    var phase = $('#tbCopyIssuePhase').val();
    var type = $('#tbCopyIssueType option:selected').val();
    var description = $('#tbCopyIssueDescription').val();
    var mitigation60d = $('#taCopyMitigation60d').val();
    var mitigation66 = $('#taCopyMitigation66').val();
    var mitigation67 = $('#taCopyMitigation67').val();
    var mitigation68 = $('#taCopyMitigation68').val();
    var mitigationStartDate = $('#tbCopyMitigationStart').val();
    var mitigationEndDate = $('#tbCopyMitigationEnd').val();
    var status = $('#tbCopyStatus').val();
    var likelihood = $('#tbCopyLikelihood option:selected').val();
    var consequence = $('#tbCopyConsequence option:selected').val();




    var executor = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";

    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': issue,
        'Trigger': trigger,
        'Phase': phase,
        'Description': description,
        'Type1': type,
        'Mitigation60d': mitigation60d,
        'Mitigation66': mitigation66,
        'Mitigation67': mitigation67,
        'Mitigation68': mitigation68,
        'MitigationStart': mitigationStartDate,
        'MitigationEnd': mitigationEndDate,
        'Status': status,
        'Likelihood': likelihood,
        'Consequence': consequence
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
        success: successAddToRiskHandler,
        error: errorAddToRiskHandler
    });
}
function successAddToRiskHandler() {
    $("#tbCopyStatus").val("My Program Risk updated");
    alert("all done");
}
function errorAddToRiskHandler(data, errorCode, errorMessage) {
    $("#tbCopyStatus").val("My Program Risk failed " + errorCode + errorMessage);
    console.log(errorCode + errorMessage);
}

//Add to Issues from pefilled dialog
function AddToIssues(list) {
    var listname = list;
    var action = "copy";
    //  var listname = "MyProgramIssues";
    var trigger = $('#tbCopyTriggerTitle').val();
    var issue = $('#tbCopyIssueTitle').val();
    var phase = $('#tbCopyIssuePhase').val();
    var type = $('#tbCopyIssueType option:selected').val();
    var description = $('#tbCopyIssueDescription').val();
    var mitigation60d = $('#taCopyMitigation60d').val();
    var mitigation66 = $('#taCopyMitigation66').val();
    var mitigation67 = $('#taCopyMitigation67').val();
    var mitigation68 = $('#taCopyMitigation68').val();
    var mitigationStartDate = $('#tbCopyMitigationStart').val();
    var mitigationEndDate = $('#tbCopyMitigationEnd').val();
    var status = $('#tbCopyStatus').val();
    var likelihood = $('#tbCopyLikelihood option:selected').val();
    var consequence = $('#tbCopyConsequence option:selected').val();



    var executor = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";

    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': issue,
        'Trigger': trigger,
        'Phase': phase,
        'Description': description,
        'Type1': type,
        'Mitigation60d': mitigation60d,
        'Mitigation66': mitigation66,
        'Mitigation67': mitigation67,
        'Mitigation68': mitigation68,
        'MitigationStart': mitigationStartDate,
        'MitigationEnd': mitigationEndDate,
        'Status': status,
        'Likelihood': likelihood,
        'Consequence': consequence
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
        success: successAddToIssuesHandler,
        error: errorAddToIssuesHandler
    });
}
function successAddToIssuesHandler() {
    $("#tbAddStatus").val("My Program Issues updated");
}
function errorAddToIssuesHandler(data, errorCode, errorMessage) {
    $("#tbCopyStatus").val("My Program Issues failed " + errorCode + errorMessage);
    console.log(errorCode + errorMessage);
}


//Add to Risk from empty dialog
function AddToRisks(list) {
    var listname = list;
    var action = "add";
    //var listname = "MyProgramRisks";
    var trigger = $('#tbAddTriggerTitle').val();
    var issue = $('#tbAddIssueTitle').val();
    var phase = $('#tbAddIssuePhase').val();
    var type = $('#tbAddIssueType option:selected').val();
    var description = $('#tbAddIssueDescription').val();
    var mitigation60d = $('#taAddMitigation60d').val();
    var mitigation66 = $('#taAddMitigation66').val();
    var mitigation67 = $('#taAddMitigation67').val();
    var mitigation68 = $('#taAddMitigation68').val();
    var mitigationStartDate = $('#tbAddMitigationStart').val();
    var mitigationEndDate = $('#tbAddMitigationEnd').val();
    var status = $('#tbAddStatus').val();
    var likelihood = $('#tbAddLikelihood option:selected').val();
    var consequence = $('#tbAddConsequence option:selected').val();




    var executor = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";

    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': issue,
        'Trigger': trigger,
        'Phase': phase,
        'Description': description,
        'Type1': type,
        'Mitigation60d': mitigation60d,
        'Mitigation66': mitigation66,
        'Mitigation67': mitigation67,
        'Mitigation68': mitigation68,
        'MitigationStart': mitigationStartDate,
        'MitigationEnd': mitigationEndDate,
        'Status': status,
        'Likelihood': likelihood,
        'Consequence': consequence
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
        success: successAddToRiskHandler,
        error: errorAddToRiskHandler
    });
}
function successAddToRiskHandler() {
    $("#tbCopyStatus").val("My Program Risk updated");
    alert("all done");
}
function errorAddToRiskHandler(data, errorCode, errorMessage) {
    $("#tbCopyStatus").val("My Program Risk failed " + errorCode + errorMessage);
    console.log(errorCode + errorMessage);
}

//Add to Issues from empty dialog
function AddToIssues(list) {
    var listname = list;
    var action = "add";
    //  var listname = "MyProgramIssues";
    var trigger = $('#tbAddTriggerTitle').val();
    var issue = $('#tbAddIssueTitle').val();
    var phase = $('#tbAddIssuePhase').val();
    var type = $('#tbAddIssueType option:selected').val();
    var description = $('#tbAddIssueDescription').val();
    var mitigation60d = $('#taAddMitigation60d').val();
    var mitigation66 = $('#taAddMitigation66').val();
    var mitigation67 = $('#taAddMitigation67').val();
    var mitigation68 = $('#taAddMitigation68').val();
    var mitigationStartDate = $('#tbAddMitigationStart').val();
    var mitigationEndDate = $('#tbAddMitigationEnd').val();
    var status = $('#tbAddStatus').val();
    var likelihood = $('#tbAddLikelihood option:selected').val();
    var consequence = $('#tbAddConsequence option:selected').val();



    var executor = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";

    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': issue,
        'Trigger': trigger,
        'Phase': phase,
        'Description': description,
        'Type1': type,
        'Mitigation60d': mitigation60d,
        'Mitigation66': mitigation66,
        'Mitigation67': mitigation67,
        'Mitigation68': mitigation68,
        'MitigationStart': mitigationStartDate,
        'MitigationEnd': mitigationEndDate,
        'Status': status,
        'Likelihood': likelihood,
        'Consequence': consequence
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
        success: successAddToIssuesHandler,
        error: errorAddToIssuesHandler
    });
}
function successAddToIssuesHandler() {
    $("#tbAddStatus").val("My Program Issues updated");
}
function errorAddToIssuesHandler(data, errorCode, errorMessage) {
    $("#tbCopyStatus").val("My Program Issues failed " + errorCode + errorMessage);
    console.log(errorCode + errorMessage);
}

function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}

//Add to Both Issues and Risks to Drafts from dialog
function SaveToDrafts(dtype, action) {
     var listname = "";
    var trigger = "";
    var issue = "";
    var phase = "";
    var type = "";
    var description = "";
    var mitigation60d = "";
    var mitigation66 = "";
    var mitigation67 = "";
    var mitigation68 = "";
    var mitigationStartDate = "";
    var mitigationEndDate = "";
    var status = "";
    var likelihood = "";
    var consequence = "";


     if (action == "add") {
         // Read contents of the Add Dialog
         trigger = $('#tbAddTriggerTitle').val();
         issue = $('#tbAddIssueTitle').val();
         phase = $('#tbAddIssuePhase').val();
         type = $('#tbAddIssueType option:selected').val();
         description = $('#tbAddIssueDescription').val();
         mitigation60d = $('#taAddMitigation60d').val();
         mitigation66 = $('#taAddMitigation66').val();
         mitigation67 = $('#taAddMitigation67').val();
         mitigation68 = $('#taAddMitigation68').val();
         mitigationStartDate = $('#tbAddMitigationStart').val();
         mitigationEndDate = $('#tbAddMitigationEnd').val();
         status = $('#tbAddStatus').val();
         likelihood = $('#tbAddLikelihood option:selected').val();
         consequence = $('#tbAddConsequence option:selected').val();
    }
     if (action == "copy") {
         //Read contents of the Copy Dialog
         trigger = $('#tbCopyTriggerTitle').val();
         issue = $('#tbCopyIssueTitle').val();
         phase = $('#tbCopyIssuePhase').val();
         type = $('#tbCopyIssueType option:selected').val();
         description = $('#tbCopyIssueDescription').val();
         mitigation60d = $('#taCopyMitigation60d').val();
         mitigation66 = $('#taCopyMitigation66').val();
         mitigation67 = $('#taCopyMitigation67').val();
         mitigation68 = $('#taCopyMitigation68').val();
         mitigationStartDate = $('#tbCopyMitigationStart').val();
         mitigationEndDate = $('#tbCopyMitigationEnd').val();
         status = $('#tbCopyStatus').val();
         likelihood = $('#tbCopyLikelihood option:selected').val();
         consequence = $('#tbCopyConsequence option:selected').val();
    }


    var executor = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";

    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': issue,
        'Trigger': trigger,
        'Phase': phase,
        'Description': description,
        'Type1': type,
        'Mitigation60d': mitigation60d,
        'Mitigation66': mitigation66,
        'Mitigation67': mitigation67,
        'Mitigation68': mitigation68,
        'MitigationStart': mitigationStartDate,
        'MitigationEnd': mitigationEndDate,
        'Status': status,
        'Likelihood': likelihood,
        'Consequence': consequence
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
        success: successSaveToDraftsHandler,
        error: errorSaveToDraftsHandler
    });
}
function successSaveToDraftsHandler() {
    $("#tbAddStatus").val("My Drafts updated");
}
function errorSaveToDraftsHandler(data, errorCode, errorMessage) {
    $("#tbCopyStatus").val("My Drafts was not updated " + errorCode + errorMessage);
    console.log(errorCode + errorMessage);
}

//Save to Drafts either Risk or Issues
function SaveAndContinue() {
    var drafttype = $("#ddlCopyTo option:selected").text();
    SaveToDrafts(drafttype, "copy");
}

function AddSaveAndContinue() {
    var drafttype = $("#ddlCopyTo option:selected").text();
    SaveToDrafts(drafttype, "add");
}



