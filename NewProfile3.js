var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var programitem, peoitem, pmaitem, acatitem, competencyitem;
var currentUser = "";
var eTag;
var digest = "";

_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    LoadPrograms();
    loadPEO();
    loadPMA();
    loadACAT();

    //Get Name of New User
    var thisUser = getQueryStringParameter("Name");

    GetUserInfo(thisUser);

    currentUser = thisUser;

    //UPDATE UI  

    var $element = $("#login");
    if ($element) {
        $element.attr("href", "../SitePages/Profile.aspx?Name=" + currentUser);
    }
    var element1 = $("#currentUserLabel");
    if (element1) {
        element1.html("Logged in as : " + currentUser);
    }

    $("#ddlUser").text(currentUser);
    $("#userName").val(currentUser);
    $("#digestmsg").val(digest);
    
    AddChangeEvents();
}

//LOAD USER DATA
function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbytitle('" + listname + "')/items";
    var filterUrl = "?&" + "$filter=Title eq '" + username + "'";
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
    //load the select option for ddlProgram 
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    var userID, userDisplayName, userLeadership, userPEO, userCompetency, userPMA, userACAT, userProgram, userPhase;


    userID = results[0].ID;
 
    $("#userID").val(userID);
    userDisplayName = results[0].Title;
  
    userLeadership = results[0].IsLeadership;
   
    userPEO = results[0].PEO;
  
    userCompetency = results.Competency;
 
    userPMA = results[0].PMA;
  
    userACAT = results[0].ACAT;
 
    userProgram = results[0].Program;

    $("#userProgram").val(userProgram);
    userPhase = results[0].Phase;
  
    //populate the drop downs with the values, make them the top values and selected
    if (userLeadership = ! null) {
        var leadershipelement = $('#ddlLeadership');
        $('#ddlLeadership').append("<option value='-1' selected='selected' >" + userLeadership + "</option>");
    }
    if (userCompetency = ! null) {
        var peoCompetencyelement = $('#ddlCompetency');
        $('#ddlCompetency').append("<option value='-1' selected='selected' >" + userCompetency + "</option>");
    }
    if (userPEO = ! null) {
        var peoelement = $('#ddlPEO');
        $('#ddlPEO').append("<option value='-1' selected='selected' >" + userPEO + "</option>");
    }
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


}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}

function AddChangeEvents() {

    $("#ddlLeadership")
        .on("change",
            function() {
                if ($(this).val() === "PEO") {
                    $("#peocontrols").show();
                    $('#ddlPEO').prop('disabled', false);
                    $('#ddlPSM').prop('disabled', true);
                    $('#ddlPMA').prop('disabled', true);
                    $('#ddlProgram').prop('disabled', true);
                    $('#ddlACAT').prop('disabled', true);
                    $('#ddlPhase').prop('disabled', true);
                } else {
                    $("#leadershipcontrols").show();
                    $("#ddlTier3").prop('disabled', true);
                    $("#ddlTD").prop('disabled', true);
                    $("#ddlCompetency").prop('disabled', false);
                }
            });

    $("#ddlCompetency")
        .on("change",
            function() {
                var competencyitem = this.value;
                if (this.value == "Competency") {
                    $("#ddlTD").prop('disabled', false);
                    LoadTier3(this.value);
                }
            });


    $("#ddlTD")
        .on("change",
            function() {
                if (this.value == "No") {
                    $("#ddlTier3").prop('disabled', false);
                }
            });

    $("#ddlPSM")
        .on("change",
            function() {
                if (this.value == "Yes") {
                    $('#ddlPMA').hide();
                    $('#ddlProgram').hide();
                    $('#ddlACAT').hide();
                    $('#ddlPhase').hide();
                } else {
                    $('#ddlPMA').prop('disabled', false);
                    loadPMA(peoitem);
                }
            });

    $("#ddlProgram")
        .on("change",
            function() {
                $('#ddlACAT').prop('disabled', false);
                var programitem = (this.value);
                loadACAT(peoitem, programitem);
            });

    $("#ddlACAT")
        .on("change",
            function() {
                $('#ddlPhase').prop('disabled', false);
                var acatitem = (this.value);
                loadPhase(peoitem, programitem, acatitem);
            });
}

function LoadTier3(x) {
    var competency = x; // between 1 and 4
    if (competency == "1") {
        //value of 1 is 6.0D
        $("#ddlTier3").append($("<option></option>").attr("value", "611").text("6.1.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "612").text("6.1.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "613").text("6.1.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "621").text("6.2.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "622").text("6.2.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "623").text("6.2.3"));
        $("#ddlTier3").append($("<option></option>").attr("value", "631").text("6.3.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "633").text("6.3.3"));
        $("#ddlTier3").append($("<option></option>").attr("value", "634").text("6.3.4"));
        $("#ddlTier3").append($("<option></option>").attr("value", "635").text("6.3.5"));
        $("#ddlTier3").append($("<option></option>").attr("value", "641").text("6.4.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "642").text("6.4.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "643").text("6.4.3"));

    } else if (competency == "2") { //6.6.1(A)
        //value of 2 is 6.6
        $("#ddlTier3").append($("<option></option>").attr("value", "661a").text("6.6.1(A)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "661b").text("6.6.1(B)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "662a").text("6.6.2(A)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "662b").text("6.6.2(B)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "663u").text("6.6.3(U)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "663w").text("6.6.3(W)"));
        $("#ddlTier3").append($("<option></option>").attr("value", "664").text("6.6.4"));
        $("#ddlTier3").append($("<option></option>").attr("value", "665").text("6.6.5"));
        $("#ddlTier3").append($("<option></option>").attr("value", "66F").text("6.6F"));

    } else if (competency == "3") {
        //value of 3 is 6.7
        $("#ddlTier3").append($("<option></option>").attr("value", "671").text("6.7.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "672").text("6.7.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "675").text("6.7.5"));
        $("#ddlTier3").append($("<option></option>").attr("value", "676").text("6.7.6"));
        $("#ddlTier3").append($("<option></option>").attr("value", "677").text("6.7.7"));
        $("#ddlTier3").append($("<option></option>").attr("value", "678").text("6.7.8"));

    } else if (competency == "4") {
        //value of 4 is 6.8
        $("#ddlTier3").append($("<option></option>").attr("value", "681").text("6.8.1"));
        $("#ddlTier3").append($("<option></option>").attr("value", "682").text("6.8.2"));
        $("#ddlTier3").append($("<option></option>").attr("value", "683").text("6.8.3"));
        $("#ddlTier3").append($("<option></option>").attr("value", "684").text("6.8.4"));
        $("#ddlTier3").append($("<option></option>").attr("value", "685").text("6.8.5"));


    }
} // JavaScript source code

//LOAD FORM 
//Load Programs ddl
function LoadPrograms() {
    var executor3 = new SP.RequestExecutor(appWebUrl);
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;
    var requestHeaders = { "ACCEPT": "application/json;odata=verbose;charset=utf-8" };

    executor3.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successLoadProgramsHandler,
        error: errorLoadProgramsHandler
    });
}

function successLoadProgramsHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.Program + '">' + results.Program + "</option>";
            $("#ddlProgram").append(optionhtml);
        });
    //eliminate duplicate programs in listing
    var usedPrograms = {};
    $("#ddlProgam > option")
        .each(function() {
            if (usedPrograms[this.value]) {
                $(this).remove();
            } else {
                usedPrograms[this.value] = this.value;
            }
        });
}
function errorLoadProgramsHandler(data, errCode, errMessage) {
    alert("Error: Unable to load user program. " + data.errorCode + data.errorMessage);
}

//Load PEO ddl
function loadPEO() {
    var executor4 = new SP.RequestExecutor(appWebUrl);
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;
    var requestHeaders = { "ACCEPT": "application/json;odata=verbose;charset=utf-8" };
    executor4.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: peoSuccHandler,
        error: peoErrHandler
    });
}
function peoSuccHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.Title + '">' + results.Title + "</option>";
            $("#ddlPEO").append(optionhtml);
        });
    //eliminate duplicate PEOs in listing
    var usedPEOs = {};
    $("#ddlPEO > option")
        .each(function() {
            if (usedPEOs[this.value]) {
                $(this).remove();
            } else {
                usedPEOs[this.value] = this.value;
            }
        });
}
function peoErrHandler(data, errCode, errMessage) {
    alert("Error: Unable to load user PEO. " + errMessage);
}

//Load PMA ddl
function loadPMA() {
    var executor5 = new SP.RequestExecutor(appWebUrl);
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl;
    var requestHeaders = { "ACCEPT": "application/json;odata=verbose;charset=utf-8" };
    executor5.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: pmaSuccHandler,
        error: pmaErrHandler
    });
}
function pmaSuccHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.PMA + '">' + results.PMA + "</option>";
            $("#ddlPMA").append(optionhtml);
        });
    //eliminate duplicate pma in listing
    var usedPMAs = {};
    $("#ddlPMA > option")
        .each(function() {
            if (usedPMAs[this.value]) {
                $(this).remove();
            } else {
                usedPMAs[this.value] = this.value;
            }
        });
}
function pmaErrHandler(data, errCode, errMessage) {
    alert("Error: Unable to load user PMA. " + errMessage);
}

//Load acat ddl
function loadACAT() {
    var executor6 = new SP.RequestExecutor(appWebUrl);
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl;
    var requestHeaders = { "ACCEPT": "application/json;odata=verbose;charset=utf-8" };
    executor6.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: acatSuccHandler,
        error: acatErrHandler
    });
}
function acatSuccHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' +
                results.ACAT_x0020_Designation +
                '">' +
                results.ACAT_x0020_Designation +
                "</option>";
            $("#ddlACAT").append(optionhtml);
        });
    //eliminate duplicate PEOs in listing
    var usedACATs = {};
    $("#ddlACAT > option")
        .each(function() {
            if (usedACATs[this.value]) {
                $(this).remove();
            } else {
                usedACATs[this.value] = this.value;
            }
        });
}
function acatErrHandler(data, errCode, errMessage) {
    alert("Error: Unable to load user ACAT. " + errMessage);
}

//UPDATE PROFILE
function UpdateProfile() {
    //read all the text values in the form
    var usertext = $('#ddlUser').find("option:selected").text();
    var leadership = $('#ddlLeadership').find("option:selected").text();
    var competency = $('#ddlCompetency').find("option:selected").text();
    var peo = $('#ddlPEO').find("option:selected").text();
    var pma = $('#ddlPMA').find("option:selected").text();
    var program = $('#ddlProgram').find("option:selected").text();
    var acat = $('#ddlACAT').find("option:selected").text();
    var phase = $('#ddlPhase').find("option:selected").text();
}

function CancelProfile() {
    alert("Your changes have been cancelled");
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

