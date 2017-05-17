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


    $("#ddlfilter").append($("<option></option>").attr("value", "test").text("TMRR"));
    $("#ddlfilter").append($("<option></option>").attr("value", "development").text("EMD"));
    $("#ddlfilter").append($("<option></option>").attr("value", "production").text("Production P&D"));
    $("#ddlfilter").append($("<option></option>").attr("value", "sustainment").text("Sustainment O&S"));


    getProfile(thisUser);
    currentUser = thisUser;

    console.log("onRequestSucceeded processing login for " + currentUser);
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
        var uProgram = results.Program.toString();
        var uID = results.ID;
        var uName = results.Title;
        console.log("processing login js GetProfile... for + " + uName);
        currentUser = uName;
        //UPDATE UI
        var $element = $("#login");
        if ($element) {
            $element.attr('href', "../SitePages/Profile.aspx?Name=" + uName +
                                                      "&ProfileId=" + uID +
                                                        "&program=" + uProgram);
        }

        $("#userName").val(currentUser);
        console.log(currentUser);
        $("#userID").val(uID);
        console.log(uID);
        $("#userProgram").val(uProgram);
        var programtext = $("#userProgram").val();
        console.log("line 71 login.js user program text is " + programtext);
        console.log(uProgram + "written to user profile div");
        $("#usrProgram").text(" |  " + uProgram);

        console.log(uProgram);
        console.log("currentUser is " + currentUser);
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
    $('#ddlfilter').on('change', function () {
        var filter = $(this).val();
        //alert(filter);
        // dataTableEvents.destroy(); 
        LoadEventsDataTable(filter);
    });


    // alert("select a phase from the filter in the upper left");


    var clientContext;
    var web;
    var currentUser;

    clientContext = SP.ClientContext.get_current();
    web = clientContext.get_web();
    clientContext.load(web);
    currentUser = web.get_currentUser();
    clientContext.load(currentUser);


    clientContext.executeQueryAsync(
        function () {
            currentUser = web.get_currentUser();
            var longUserName = currentUser.get_loginName();
            var startIndex = longUserName.lastIndexOf('\\');
            var thisUser = longUserName.substr(startIndex + 1);
            var $element = $("#login");
            if ($element) {
                $element.attr("href", "../SitePages/Profile.aspx?Name=" + thisUser);
            }
        },
        function () { alert("Request failed") }
    );

    GetUserInfo(currentUser);



    $("#userName").val(currentUser);
    $("#digestmsg").val(digest);


    LoadTriggersDataTable();
    LoadIssuesDataTable();



    LoadEventsDataTable();




    var table1 = $('#events tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table1.$('tr selected').removeClass('selected');
            $(this).addClass('selected');
        }

        var rowdata = table1.row(this).data();

    });


    // table1.buttons().container()
    //          .insertBefore( '#triggers_filter' );



    //   var table2=  $('#Issues')
    //          .DataTable({
    // data: dataSet2,
    //             buttons:true,
    //             "columnDefs": [{	"targets":[1],"visible":false,"searchable":false}],
    //             "columns": [
    //                 { title: "Trigger" },
    //                 { title: "TriggerDescription" }
    //             ],
    //              "searching": false,
    //              "paging": false,
    ///              "info": true
    //         });





    //table2.buttons().container()
    //        .insertBefore( '#Issues_filter' );

}

function LoadEventsDataTable(selectedfilter) {
    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }
    var selectedfilter = $('#ddlfilter option:selected').val();
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
    $.ajax({
        url: eventurl,
        type: "GET",
        dataType: "json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: EventsSuccHandler,
        error: EventsErrHandler
    });
}

function EventsSuccHandler(data) {
    if (dataTableEvents != 'undefined') {
        dataTableEvents.destroy();
    }

    dataTableEvents = $("#events")
        .DataTable({
            "aaData": data.d.results,
            "aoColumns": [
              { "mData": "MajorProgramKeyEventsProducts" },
              { "mData": "TriggerDescription" },
              { "mData": "Development" },
              { "mData": "Test" },
              { "mData": "Production" },
              { "mData": "FleetIntroduction" },
              { "mData": "PostProduction" },
              { "mData": "Sustainment" }
            ],
            buttons: true,
            dDestroy: true,
            fixedHeader: true,
            scrollY: 300,
            scrollX: true,
            columnDefs: [
                {
                    "targets": [0],

                    "visible": true,
                    "searchable": false
                },
                {
                    "targets": [1],

                    "visible": false,
                    "searchable": false
                },
                  {
                      "targets": [2],

                      "visible": false
                  },
                 {
                     "targets": [3],
                     "visible": false,
                     "data": "Test"
                 },
                   {
                       "targets": [4],
                       "visible": false,
                       "data": "Production"
                   },
                    {
                        "targets": [5],
                        "visible": false,
                        "data": "FleetIntroduction"
                    },
                    {
                        "targets": [6],
                        "visible": false,
                        "data": "PostProduction"
                    },
                    {
                        "targets": [7],
                        "visible": false,
                        "data": "Sustainment"
                    }
            ],
            columns: [
                { name: "MajorProgramKeyEventsProducts" },
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

function EventsErrHandler(data, errCode, errMessage) {
    alert("Error: " + errMessage);
}

function showDescription(x) {
    // $('#TriggerDescription').text(x);

}



