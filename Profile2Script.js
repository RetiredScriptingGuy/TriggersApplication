// JavaScript source code
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var programitem, peoitem, pmaitem, acatitem;
var currentUser = "";


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
    // var thisUser = longUserName.substr(startIndex + 1);
    var $element = $("#login");
    if ($element) {
        $element.attr('href', '../SitePages/Profile.aspx?Name=' + thisUser);
    }
    var element1 = $('#currentUserLabel span');
    if (element1) {
        element1.text("Logged in as : " + thisUser);
    }
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


//LOAD USER DATA

function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var basellUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var selectUrl = "?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
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
    //load the select option for ddlProgram       
    $.each(data.d.results, function (i, result) {
        var userID = result.ID;
        var userDisplayName = result.Title;
        var userLeadership = result.IsLeadership;
        var userPEO = result.PEO;
        var userCompetency = result.Competency;
        var userPMA = result.PMA;
        var userACAT = result.ACAT;
        var userProgram = result.Program;
        var userPhase = result.Phase;
        //populate the drop downs with the values, make them the top values and selected

        var userelement = $('#ddlUser');
        $('#ddlUser').append("<option value='-1' selected='selected' >" + userDisplayName + "</option>");

        var leadershipelement = $('#ddlLeadership');
        $('#ddlLeadership').append("<option value='-1' selected='selected' >" + userLeadership + "</option>");

        var peoCompetencyelement = $('#ddlCompetency');
        $('#ddlCompetency').append("<option value='-1' selected='selected' >" + userCompetency + "</option>");

        var peoelement = $('#ddlPEO');
        $('#ddlPEO').append("<option value='-1' selected='selected' >" + userPEO + "</option>");

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
    });
    var userProgram = data.d.results[0].Program;
    var userID = data.d.results[0].ID;
    var userName = data.d.results[0].Title;
    $("#userName span").text(userName);
    $("#userID span").text(userID);
    $("#userProgram span").text(userProgram);
}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}


//function GetUserInfo(username) {
//    var oDataUrl = _spPageContextInfo.webAbsoluteUrl +
//    "/_api/web/Lists/getbyTitle('Profiles')/items?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT&$filter=Title eq '" + username + "'";
//    $.ajax({
//        url: oDataUrl,
//        type: "GET",
//        dataType: "json",
//        async: false,
//        headers: { "ACCEPT": "application/json;odata=verbose;charset=utf-8" },
//        success: userSuccHandler,
//        error: userErrHandler
//    });
//}

//function userSuccHandler(data) {
//    //load the select option for ddlProgram       
//    $.each(data.d.results, function (i, result) {
//        var userID = result.ID;
//        var userDisplayName = result.DisplayName;
//        var userleadership = result.IsLeadership;
//        var userPEO = result.PEO;
//        var userCompetency = result.Competency;
//        var userPMA = result.PMA;
//        var userACAT = result.ACAT;
//        var userProgram = result.Program;
//        var userPhase = result.Phase;
//        var userelement = $('#ddlUser');
//        $('#ddlUser').append("<option value='-1' selected='selected' >" + userDisplayName + "</option>");

//        var peoelement = $('#ddlPEO');
//        $('#ddlPEO').append("<option value='-1' selected='selected' >" + userPEO + "</option>");

//        var pmaelement = $('#ddlPMA');
//        $('#ddlPMA').append("<option value='-1' selected='selected'>" + userPMA + "</option>");

//        var programelement = $('#ddlProgram');
//        $('#ddlProgram').append("<option value='-1' selected='selected' >" + userProgram + "</option>");

//        var acatelement = $('#ddlACAT');
//        $('#ddlACAT').append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

//        var phase = $('#ddlPhase');
//        $('#ddlPhase').append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");

//        //  store ID in hidden DIV for updates
//        $('#userID').innerHTML(userID);
//    });

//}

//function userErrHandler(data, errCode, errMessage) {
//    alert("Error: Unable to load profile from table " + errMessage);
//}

//LOAD FORM 

//Load Programs ddl
function LoadPrograms() {
    var executor3 = new SP.RequestExecutor(appWebUrl);
    var listname = "Programs";
    var basellUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = basellUrl;
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
    //load the select option for ddlProgram       
    $.each(data.d.results, function (i, result) {
        programitem = result.Title;
        $('#ddlProgram').append("<option value='" + programitem + "'>" + programitem + "</option>");
    });

    //eliminate duplicate programs in listing
    var usedPrograms = {};
    $("#ddlProgam > option").each(function () {
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
    var listname = "PEO";
    var basellUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = basellUrl;
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
    //load the select option for ddlPEO             
    $.each(data.d.results, function (i, result) {
        peoitem = result.Title;
        $('#ddlPEO').append("<option value='" + peoitem + "'>" + peoitem + "</option>");

    });

    //eliminate duplicate PEOs in listing
    var usedPEOs = {};
    $("#ddlPEO > option").each(function () {
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
    var listname = "PMA";
    var basellUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = basellUrl;
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
    //load the select option for ddlPMA
    $.each(data.d.results, function (i, result) {
        pmaitem = result.Title;
        $("#ddlPMA").append("<option value='" + pmaitem + "'>" + pmaitem + "</option>");
    });

    //eliminate duplicate pma in listing
    var usedPMAs = {};
    $("#ddlPMA > option").each(function () {
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
    var listname = "ACAT";
    var basellUrl = appWebUrl + "/_api/web/lists/getbyTitle('" + listname + "')/items";
    var fullUrl = basellUrl;
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
    //load the select option for ddlPEO             
    $.each(data.d.results, function (i, result) {
        acatitem = result.Title;
        $('#ddlACAT').append("<option value='" + acatitem + "'>" + acatitem + "</option>");
    });

    //eliminate duplicate PEOs in listing
    var usedACATs = {};
    $("#ddlACAT > option").each(function () {
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

function updateFieldInfo() {
}

function CancelProfile() {
    alert("Your changes have been cancelled");
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
}// JavaScript source code















