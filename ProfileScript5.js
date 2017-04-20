var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var programitem, peoitem, pmaitem, acatitem, competencyitem ;
var currentUser = "";
var eTag;
var digest = "";

_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    loadProrams();
    loadPEO();
    loadPMA();
    loadACAT();


    //Get Name of New User
    var thisUser = getQueryStringParameter("Name");
    var thisUserID = getQueryStringParameter("ProfileId");
    var thisUserProgram = getQueryStringParameter("program");

    if (thisUser == "System") {
        thisUser = "Kris.White";
    }

    GetUserInfo(thisUser);

    currentUser = thisUser;

    //UPDATE UI  
    var $element = $("#login");
    if ($element) {
        $element.attr("href",
            "../SitePages/Profile.aspx?Name='" +
            thisUser +
            "'" +
            "&Id='" +
            thisUserID +
            "'" +
            "&program='" +
            thisUserProgram +
            "'");
    }
    var element1 = $("#currentUserLabel");
    if (element1) {
        element1.text("Logged in as : " + thisUser);
    }

    $("#userName").val(thisUser);
    console.log("Processing UPDATE UI in profile.js for " + thisUser);
    $("#userID").val(thisUserID);
    console.log(thisUserID);
    $("#userProgram").val(thisUserProgram);
    console.log(thisUserProgram);

    AddChangeEvents();


    DisableUI();
}

//HELPER FUNCTIONS
function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
        console.log(singleParam[1] + "is the current username");
    }
}

//LOAD USER DATA
function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var selectUrl = "?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
    console.log("Processing GetUserInfo for " + username);
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
    console.log("jsonObject is " + jsonObject);
    var results = jsonObject.d.results;
    console.log("result is " + results[0]);
    var userID = results[0].Id;
    console.log(userID);
    var userName = results[0].Title;
    console.log(userName);
    var userLeadership = results[0].IsLeadership;//either PEO or Competency
    console.log(results[0].IsLeadership);
    var userPEO = results[0].PEO;
    console.log(userPEO);
    var userCompetency = results[0].Competency;
    var userPMA = results[0].PMA;
    var userACAT = results[0].ACAT;
    var userProgram = results[0].Program;
    var userPhase = results[0].Phase;
    //populate the drop downs with the values, make them the top values and selected

    var userelement = $("#ddlUser");
    $("#ddlUser").append("<option value='-1' selected='selected' >" + userName + "</option>");

    var leadershipelement = $("#ddlLeadership");
    $("#ddlLeadership").append("<option value='-1' selected='selected' >" + userLeadership + "</option>");
    
    if(userleadership == "Competency"){
        $('#leadershipcontrols').show();
        $('#peocontrols').hide();
    }

    var peoCompetencyelement = $("#ddlCompetency");
    $("#ddlCompetency").append("<option value='-1' selected='selected' >" + userCompetency + "</option>");


    var peoelement = $("#ddlPEO");
    $("#ddlPEO").append("<option value='-1' selected='selected' >" + userPEO + "</option>");

    var pmaelement = $("#ddlPMA");
    $("#ddlPMA").append("<option value='-1' selected='selected'>" + userPMA + "</option>");

    var programelement = $("#ddlProgram");
    $("#ddlProgram").append("<option value='-1' selected='selected' >" + userProgram + "</option>");

    var acatelement = $("#ddlACAT");
    $("#ddlACAT").append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

    var phase = $("#ddlPhase");
    $("#ddlPhase").append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");
}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}

//LOAD FORM 

//Load Programs ddl
function loadProrams() {
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

function updateFieldInfo() {
}
function CancelProfile() {
    alert("Your changes have been cancelled");
}
function UpdateItem(usertext, leadership, competency, peo, pma, program, acat, phase) {
    prepareItem();
    retrieveFormDigest();

}
function prepareItem() {
    var scriptbase = targetSiteUrl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);
}
function retrieveFormDigest() {
    digest = $("#__REQUESTDIGEST").val();
    var contextInfoUri = appWebUrl + "/_api/contextinfo";
    var executor7 = new SP.RequestExecutor(appWebUrl);
    executor7.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: addedDigest,
        error: function(data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").text(errMsg);
        }
    });
}
function addedDigest() {
    console.log("digest added");
}
function UpdateProfile() {
    retrieveFormDigest();
    console.log(digest);
    //read all the text values in the form
    var usrID = $("#userID").text();
    var username = $("#ddlUser").find("option:selected").text();
    var leadership = $("#ddlLeadership").find("option:selected").text();
    var competency = $("#ddlCompetency").find("option:selected").text();
    var peo = $("#ddlPEO").find("option:selected").text();
    var pma = $("#ddlPMA").find("option:selected").text();
    var program = $("#ddlProgram").find("option:selected").text();
    var acat = $("#ddlACAT").find("option:selected").text();
    var phase = $("#ddlPhase").find("option:selected").text();

    var listname = "Profiles";
    var itemType = GetItemTypeForListName(listname);
    var executor8 = new SP.RequestExecutor(appWebUrl);
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/GetByTitle('Profiles')/" + "Items(" + usrID + ")";
    var filterUrl = ""; //"?@target='" + hostweburl + "'";
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var bodyContent = JSON.stringify({
        '__metadata': { 'type': itemType },
        'IsLeadership': leadership,
        'Competency': competency,
        'PEO': peo,
        'PMA': pma,
        'Program': program,
        'ACAT': acat,
        'Phase': phase

    });
    // Retrieve the ETag value 
    executor8.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function succEtagHandler(data) {
            console.log("success function ETag: " + data.headers["ETAG"]);
            eTag = data.headers["ETAG"]; // Invoke the real update operation 
            console.log(eTag);
            executor8.executeAsync({
                url: fullUrl,
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "content-length": bodyContent.length,
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": eTag
                },
                body: bodyContent,
                success: function(data) {
                    console.log("Updated completed successfully!");
                },
                error: function(data, errorCode, errorMessage) {
                    var jsonObject = JSON.parse(data.body);
                    var errMsg = "Error: " + jsonObject.error.message.value;
                    console.log(errMsg);
                }
            });
        },
        error: function succEtagHandler(data) {
            console.log("success function ETag: " + data.headers["ETAG"]);
            eTag = data.headers["ETAG"]; // Invoke the real update operation 
            console.log(eTag);
            executor8.executeAsync({
                url: fullUrl,
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "content-length": bodyContent.length,
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": eTag
                },
                body: bodyContent,
                success: function(data) {
                    console.log("Updated completed successfully!");
                    alert("Profile updated");
                },
                error: function(data, errorCode, errorMessage) {
                    var jsonObject = JSON.parse(data.body);
                    var errMsg = "Error: " + jsonObject.error.message.value;
                    console.log(errMsg);
                }
            });
        }
    });

    ReloadUser();
}
function successItemAddedHandler() {
    alert("Thank you");
}
function errorItemAddedHandler(data, errorCode, errorMessage) {
    alert("failed : " + errorCode + errorMessage);
}
function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}

//reload user data
function ReloadUser() {

    var username = currentUser;
    var executor12 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var selectUrl = "?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
    console.log("Processing GetUserInfo for " + username);
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor12.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successReadUserInfoHandler,
        error: errorReadUserInfoHandler
    });
}
function successReadUserInfoHandler(data) {
    //load the select option for ddlProgram 
    var jsonObject = JSON.parse(data.body);
    console.log("jsonObject is " + jsonObject);
    var results = jsonObject.d.results;
    console.log("result is " + results[0]);
    var userID = results[0].Id;
    console.log(userID);
    var userName = results[0].Title;
    console.log(userName);
    var userLeadership = results[0].IsLeadership;
    console.log(results[0].IsLeadership);
    var userPEO = results[0].PEO;
    console.log(userPEO);
    var userCompetency = results[0].Competency;
    var userPMA = results[0].PMA;
    var userACAT = results[0].ACAT;
    var userProgram = results[0].Program;
    var userPhase = results[0].Phase;
    //populate the drop downs with the values, make them the top values and selected

    var userelement = $("#ddlUser");
    $("#ddlUser").append("<option value='-1' selected='selected' >" + userName + "</option>");

    var leadershipelement = $("#ddlLeadership");
    $("#ddlLeadership").append("<option value='-1' selected='selected' >" + userLeadership + "</option>");

    var peoCompetencyelement = $("#ddlCompetency");
    $("#ddlCompetency").append("<option value='-1' selected='selected' >" + userCompetency + "</option>");

    var peoelement = $("#ddlPEO");
    $("#ddlPEO").append("<option value='-1' selected='selected' >" + userPEO + "</option>");

    var pmaelement = $("#ddlPMA");
    $("#ddlPMA").append("<option value='-1' selected='selected'>" + userPMA + "</option>");

    var programelement = $("#ddlProgram");
    $("#ddlProgram").append("<option value='-1' selected='selected' >" + userProgram + "</option>");

    var acatelement = $("#ddlACAT");
    $("#ddlACAT").append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

    var phase = $("#ddlPhase");
    $("#ddlPhase").append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");
}
function errorReadUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}
function DisableUI() {
    $("peocontrols").hide();
}
function AddChangeEvents() {

    $("#ddlLeadership")
        .on("change",
            function() {
                if ($(this).val() === "PEO") {
                    $("#peocontrols").show();
                    $("#ddlPEO").prop("disabled", false);
                    $("#ddlProgram").prop("disabled", false);
                    $("#ddlACAT").prop("disabled", false);
                    $("#ddlPhase").prop("disabled", false);
                } else {
                    $("#leadershipcontrols").show();
                    $("#peocontrols").hide();
                    $("#ddlCompetency").prop("disabled", false);

                }
            });

    $("#ddlCompetency")
        .on("change",
            function() {
                //var filter = $(this).val();
                //$('#ddlTD').prop('disabled',false);
                //if (filter === "1") {
                //    loadTier3(filter);
                //} else if (filter === "1") {

                //} else if (filter === "1") {

                //}else if (filter === "1") {

                //}


                //$('#ddlCompetency').prop('disabled', false);
                //    $('#ddlPEO').hide();
                //    $('#ddlProgram').hide();
                //    $('#ddlACAT').hide();
                //    $('#ddlPhase').hide();
            }
        );

    //   $('#ddlPMA').attr('data-toggle');
    //  $('#ddlProgram').attr('data-toggle');
    //  $('#ddlACAT').attr('data-toggle');
    //  $('#ddlPhase').attr('data-toggle');
}


//LOAD USER DATA
function GetUserInfo(username) {
    var executor2 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var selectUrl = "?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
    console.log("Processing GetUserInfo for " + username);
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
    console.log("jsonObject is " + jsonObject);
    var results = jsonObject.d.results;
    console.log("result is " + results[0]);
    var userID = results[0].Id;
    console.log(userID);
    var userName = results[0].Title;
    console.log(userName);
    var userLeadership = results[0].IsLeadership;
    console.log(results[0].IsLeadership);
    var userPEO = results[0].PEO;
    console.log(userPEO);
    var userCompetency = results[0].Competency;
    var userPMA = results[0].PMA;
    var userACAT = results[0].ACAT;
    var userProgram = results[0].Program;
    var userPhase = results[0].Phase;
    //populate the drop downs with the values, make them the top values and selected

    var userelement = $("#ddlUser");
    $("#ddlUser").append("<option value='-1' selected='selected' >" + userName + "</option>");

    var leadershipelement = $("#ddlLeadership");
    $("#ddlLeadership").append("<option value='-1' selected='selected' >" + userLeadership + "</option>");

    var peoCompetencyelement = $("#ddlCompetency");
    $("#ddlCompetency").append("<option value='-1' selected='selected' >" + userCompetency + "</option>");


    var peoelement = $("#ddlPEO");
    $("#ddlPEO").append("<option value='-1' selected='selected' >" + userPEO + "</option>");

    var pmaelement = $("#ddlPMA");
    $("#ddlPMA").append("<option value='-1' selected='selected'>" + userPMA + "</option>");

    var programelement = $("#ddlProgram");
    $("#ddlProgram").append("<option value='-1' selected='selected' >" + userProgram + "</option>");

    var acatelement = $("#ddlACAT");
    $("#ddlACAT").append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

    var phase = $("#ddlPhase");
    $("#ddlPhase").append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");
}
function errorGetUserInfoHandler(data, errCode, errMessage) {
    console.log("login failed: " + data.errorCode + data.errorMessage);
}

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
function updateFieldInfo() {
}
function CancelProfile() {
    alert("Your changes have been cancelled");
}
function UpdateItem(usertext, leadership, competency, peo, pma, program, acat, phase) {
    prepareItem();
    retrieveFormDigest();

}
function prepareItem() {
    var scriptbase = targetSiteUrl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);
}
function retrieveFormDigest() {
    digest = $("#__REQUESTDIGEST").val();
    var contextInfoUri = appWebUrl + "/_api/contextinfo";
    var executor7 = new SP.RequestExecutor(appWebUrl);
    executor7.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: addedDigest,
        error: function(data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").text(errMsg);
        }
    });
}
function addedDigest() {
    console.log("digest added");
}
function UpdateProfile() {
    retrieveFormDigest();
    console.log(digest);
    //read all the text values in the form
    var usrID = $("#userID").text();
    var username = $("#ddlUser").find("option:selected").text();
    var leadership = $("#ddlLeadership").find("option:selected").text();
    var competency = $("#ddlCompetency").find("option:selected").text();
    var peo = $("#ddlPEO").find("option:selected").text();
    var pma = $("#ddlPMA").find("option:selected").text();
    var program = $("#ddlProgram").find("option:selected").text();
    var acat = $("#ddlACAT").find("option:selected").text();
    var phase = $("#ddlPhase").find("option:selected").text();

    var listname = "Profiles";
    var itemType = GetItemTypeForListName(listname);
    var executor8 = new SP.RequestExecutor(appWebUrl);
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/GetByTitle('Profiles')/" + "Items(" + usrID + ")";
    var filterUrl = ""; //"?@target='" + hostweburl + "'";
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var bodyContent = JSON.stringify({
        '__metadata': { 'type': itemType },
        'IsLeadership': leadership,
        'Competency': competency,
        'PEO': peo,
        'PMA': pma,
        'Program': program,
        'ACAT': acat,
        'Phase': phase

    });
    // Retrieve the ETag value 
    executor8.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function succEtagHandler(data) {
            console.log("success function ETag: " + data.headers["ETAG"]);
            eTag = data.headers["ETAG"]; // Invoke the real update operation 
            console.log(eTag);
            executor8.executeAsync({
                url: fullUrl,
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "content-length": bodyContent.length,
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": eTag
                },
                body: bodyContent,
                success: function(data) {
                    console.log("Updated completed successfully!");
                },
                error: function(data, errorCode, errorMessage) {
                    var jsonObject = JSON.parse(data.body);
                    var errMsg = "Error: " + jsonObject.error.message.value;
                    console.log(errMsg);
                }
            });
        },
        error: function succEtagHandler(data) {
            console.log("success function ETag: " + data.headers["ETAG"]);
            eTag = data.headers["ETAG"]; // Invoke the real update operation 
            console.log(eTag);
            executor8.executeAsync({
                url: fullUrl,
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "content-length": bodyContent.length,
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": eTag
                },
                body: bodyContent,
                success: function(data) {
                    console.log("Updated completed successfully!");
                    alert("Profile updated");
                },
                error: function(data, errorCode, errorMessage) {
                    var jsonObject = JSON.parse(data.body);
                    var errMsg = "Error: " + jsonObject.error.message.value;
                    console.log(errMsg);
                }
            });
        }
    });

    ReloadUser();
}
function successItemAddedHandler() {
    alert("Thank you");
}
function errorItemAddedHandler(data, errorCode, errorMessage) {
    alert("failed : " + errorCode + errorMessage);
}
function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}


//reload user data
function ReloadUser() {

    var username = currentUser;
    var executor12 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl + "/_api/web/lists/getbytitle('" + listname + "')/items";
    var selectUrl = "?$select=Title,IsLeadership,PEO,PMA,Program,DisplayName,Competency,Phase,ACAT";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
    console.log("Processing GetUserInfo for " + username);
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var requestHeaders = { "accept": "application/json;odata=verbose" };

    executor12.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: requestHeaders,
        success: successReadUserInfoHandler,
        error: errorReadUserInfoHandler
    });
}
function successReadUserInfoHandler(data) {
    //load the select option for ddlProgram 
    var jsonObject = JSON.parse(data.body);
    console.log("jsonObject is " + jsonObject);
    var results = jsonObject.d.results;
    console.log("result is " + results[0]);
    var userID = results[0].Id;
    console.log(userID);
    var userName = results[0].Title;
    console.log(userName);
    var userLeadership = results[0].IsLeadership;
    console.log(results[0].IsLeadership);
    var userPEO = results[0].PEO;
    console.log(userPEO);
    var userCompetency = results[0].Competency;
    var userPMA = results[0].PMA;
    var userACAT = results[0].ACAT;
    var userProgram = results[0].Program;
    var userPhase = results[0].Phase;
    //populate the drop downs with the values, make them the top values and selected

    var userelement = $("#ddlUser");
    $("#ddlUser").append("<option value='-1' selected='selected' >" + userName + "</option>");

    var leadershipelement = $("#ddlLeadership");
    $("#ddlLeadership").append("<option value='-1' selected='selected' >" + userLeadership + "</option>");

    var peoCompetencyelement = $("#ddlCompetency");
    $("#ddlCompetency").append("<option value='-1' selected='selected' >" + userCompetency + "</option>");

    var peoelement = $("#ddlPEO");
    $("#ddlPEO").append("<option value='-1' selected='selected' >" + userPEO + "</option>");

    var pmaelement = $("#ddlPMA");
    $("#ddlPMA").append("<option value='-1' selected='selected'>" + userPMA + "</option>");

    var programelement = $("#ddlProgram");
    $("#ddlProgram").append("<option value='-1' selected='selected' >" + userProgram + "</option>");

    var acatelement = $("#ddlACAT");
    $("#ddlACAT").append("<option value='-1' selected='selcted' >" + userACAT + "</option>");

    var phase = $("#ddlPhase");
    $("#ddlPhase").append("<option value='-1'  selected='selcted' >" + userPhase + "</option>");
}
function errorReadUserInfoHandler(data, errCode, errMessage) {
    alert("login failed: " + data.errorCode + data.errorMessage);
}
function DisableUI() {
    $("#ddlPEO").prop("disabled", true);
    $("#ddlPMA").prop("disabled", true);
    $("#ddlProgram").prop("disabled", true);
    $("#ddlACAT").prop("disabled", true);
    $("#ddlPhase").prop("disabled", true);
}
function AddChangeEvents() {

    $("#ddlLeadership")
        .on("change",
            function() {
                if ($(this).val() === "PEO") {
                    $("#peocontrols").show(); 
                    $('#ddlPEO').prop('disabled',false);
                    $('#ddlPSM').prop('disabled',true);
                    $('#ddlPMA').prop('disabled',true);
                    $('#ddlProgram').prop('disabled',true);
                    $('#ddlACAT').prop('disabled',true);
                    $('#ddlPhase').prop('disabled',true);    
                } else {
                    $("#leadershipcontrols").show();
                    $("#ddlTier3").prop('disabled',true);
                    $("#ddlTD").prop('disabled',true);
                    $("#ddlCompetency").prop('disabled',false);
                }
            });
            
    $("#ddlCompetency")
       .on("change",
           function() { 
               var competencyitem = this.value;
               if(this.value == "Competency"){                                 
                   $("#ddlTD").prop('disabled',false);
                   LoadTier3(this.value);             
               }
           });


      
    $("#ddlTD")
        .on("change",
            function() {                                  
                if(this.value == "No"){
                    $("#ddlTier3").prop('disabled',false); 
                }
            });
           
    $("#ddlPSM")
      .on("change",
          function() { 
                                            
              if(this.value == "Yes"){
                  $('#ddlPMA').hide();
                  $('#ddlProgram').hide();
                  $('#ddlACAT').hide();
                  $('#ddlPhase').hide();
              }
              else {
                  $('#ddlPMA').prop('disabled',false);
                  loadPMA(peoitem);
              }
          });
           
    $("#ddlProgram")
      .on("change",
          function(){  
              $('#ddlACAT').prop('disabled',false);                                         
              var programitem = (this.value );
              loadACAT(peoitem,programitem);
       });

$("#ddlACAT")
   .on("change",
       function(){  
           $('#ddlPhase').prop('disabled',false);                                         
           var acatitem = (this.value );
           loadPhase(peoitem,programitem,acatitem);
     });
   
}
function LoadTier3(x) {
    var competency = x ; // between 1 and 4
    if (competency == "1") {
        //value of 1 is 6.0D
        $("#ddlTier3").append($("<option></option>").attr("value","611").text("6.1.1"));
    } 
    else if (competency == "2") {//6.6.1(A)
        //value of 2 is 6.6
        $("#ddlTier3").append($("<option></option>").attr("value","6661a").text("6.6.1(A)"));

    }
    else if (competency == "3") {
        //value of 3 is 6.7
        $("#ddlTier3").append($("<option></option>").attr("value","671").text("6.7.1"));
        
    }
    else if (competency == "4") {
        //value of 4 is 6.8
        $("#ddlTier3").append($("<option></option>").attr("value","681").text("6.8.1"));

  
        
        /*
        $("#ddlTier3").append("<option  >" + 6&#46;1&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;1&#46;3 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;2&#46;1 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;2&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;2&#46;3 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;3&#46;1 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;3&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;3&#46;3 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;3&#46;4 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;3&#46;5 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;4&#46;1 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;4&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;4&#46;3 + </option>");
    } else if (competency == "2") { //value 2 
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;1(A) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;1(B) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;2(A) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;2(B) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;3(U) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;3(W) + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;4 +    </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6&#46;5 +     </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;6F       +    </option>");
    } else if (competency == "3") { //value 3 is 6&#46;7

        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;1 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;5 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;6 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;7 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;7&#46;8 + </option>");
    } else if (competency == "4") { //value 4 is 6&#46;8

        $("#ddlTier3").append("<option  >" + 6&#46;8&#46;1 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;8&#46;2 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;8&#46;3 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;8&#46;4 + </option>");
        $("#ddlTier3").append("<option  >" + 6&#46;8&#46;5 + </option>");
      */
    }
}

