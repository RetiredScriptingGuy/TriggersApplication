//global variables
var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var listName = "Profiles";
var programitem = "";
var peoitem = "";
var pmaitem = "";
var acatitem = "";
var competencyitem = "";
var currentUser = "";
var eTag;
var digest = "";

_spBodyOnLoadFunctionNames.push("myCustomPage");

function myCustomPage() {
    GetDigest();
    $("#btnAddProfile")
        .on("click",
            function() {
                AddUser();
            });

    AddChangeEvents();

} //end of my CustomPage
function AddChangeEvents() {
    $("#ddlLeadership")
        .on("change",
            function() {

                var isLeadership = this.value;


                if (isLeadership == "PEO") {
                    $("#peocontrols").show();
                    $("#leadershipcontrols").hide();
                    $("#ddlPEO").prop("disabled", false);
                    $("#ddlPSM").prop("disabled", true);
                    $("#ddlPMA").prop("disabled", true);
                    $("#ddlProgram").prop("disabled", true);
                    $("#ddlACAT").prop("disabled", true);
                    $("#ddlPhase").prop("disabled", true);
                    LoadPEO();

                } else {
                    $("#ddlCompetency").prop("disabled", false);
                    $("#leadershipcontrols").show();
                    $("#peocontrols").hide();
                    $("#ddlTier3").prop("disabled", true);
                    $("#ddlTD").prop("disabled", true);
                }
            });

    $("#ddlCompetency")
        .on("change",
            function() {
                var competencyitem = this.value;
                if (competencyitem == "1") {
                    $("#ddlTD").prop("disabled", false);
                    LoadTier3(competencyitem);
                    console.log(competencyitem);
                }
                if (competencyitem == "2") {
                    $("#ddlTD").prop("disabled", false);
                    LoadTier3(competencyitem);
                    console.log(competencyitem);
                }

                if (competencyitem == "3") {
                    $("#ddlTD").prop("disabled", false);
                    LoadTier3(competencyitem);
                    console.log(competencyitem);
                }

                if (competencyitem == "4") {
                    $("#ddlTD").prop("disabled", false);
                    LoadTier3(competencyitem);
                    console.log(competencyitem);
                }
            });


    $("#ddlTD")
        .on("change",
            function() {
                if (this.value == "No") {
                    $("#ddlTier3").prop("disabled", false);
                }
            });

    $("#ddlPEO")
        .on("change",
            function() {
                $("#ddlPSM").prop("disabled", false);
                peoitem = (this.value);
                LoadPMA(peoitem);
                alert(peoitem);
            });


    $("#ddlPSM")
        .on("change",
            function() {
                if (this.value == "Yes") {
                    $("#nonpsmcontrols").hide();
                } else {
                    $("#ddlPMA").prop("disabled", false);
                    LoadPMA(peoitem);
                }
            });

    $("#ddlPMA")
        .on("change",
            function() {
                $("#ddlProgram").prop("disabled", false);
                pmaitem = (this.value);
                LoadProgram(peoitem, pmaitem);
            });


    $("#ddlProgram")
        .on("change",
            function() {
                $("#ddlACAT").prop("disabled", false);
                programitem = (this.value);
                LoadACAT(peoitem, pmaitem, programitem);
            });

    $("#ddlACAT")
        .on("change",
            function() {
                $("#ddlPhase").prop("disabled", false);
                acatitem = (this.value);
            });


} // end of on AddChangeEvents function


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
}

//PEO
function LoadPEO() {
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items";
    var fullUrl = baseUrl + selectUrl;
    var executor2 = new SP.RequestExecutor(appWebUrl);
    executor2.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: peoSuccessHandler,
        error: peoErrorHandler
    });
}

function peoSuccessHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.Title + '">' + results.Title + "</option>";
            $("#ddlPEO").append(optionhtml);
        }); //end of each         
    //eliminate duplicate programs in listing
    var usedPEOs = {
    
    };
    $("#ddlPEO > option")
        .each(function() {
            if (usedPEOs[this.value]) {
                $(this).remove();
            } else {
                usedPEOs[this.value] = this.value;
            }
        });
}

function peoErrorHandler(data, errorCode, errorMessage) {
    var errMsg = "Error retrieving the programs: " + errorMessage;
    $("#error").val(errMsg);
    console.log("Error processing peoErrorHandler" + errorCode + errorMessage);
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
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: PrepareForm,
        error: function(data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").val(errMsg);
        }
    });
}

function PrepareForm() {
    currentUser = LoadUser(); //get the name from the query string

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

}

function LoadUser() {
    currentUser = getQueryStringParameter("Name"); //format the name into first and last name  
    userId = getQueryStringParameter("ProfileID");
    userProgram = getQueryStringParameter("userProgram");
    return currentUser;
}

function AddUser() {
    var userIsLeadership = "";
    var userName = $("#ddlUser").text();
    var userDisplayName = currentUser;

    var userACAT = $("#ddlACAT option:selected").val();
    var userCompetency = $("#ddlCompetency option:selected").val();
    var userType = $("#ddlLeadership option:selected").val();
    var userPEO = $("#ddlPEO option:selected").val();
    var userPMA = $("#ddlPMA option:selected").val();
    var userProgram = $("#ddlProgram option:selected").val();
    var userPhase = $("#ddlPhase option:selected").val();
    var userPSM = $("#ddlPSM option:selected").val();
    var userTD = $("#ddlTD option:selected").val();
    var userTier3 = $("#ddlTier3 option:selected").val();
    console.log("adding user:" +
        userName +
        userDisplayName +
        userACAT +
        userCompetency +
        userType +
        userPEO +
        userPMA +
        userProgram +
        userPhase +
        userPSM +
        userTD +
        userTier3);

    if (userTD == "Yes" || userPSM == "Yes") {
        userIsLeadership = "Yes"; //dunno if this business rule is correct? I needed something.
    } else {
        userIsLeadership = "No";
        userCompetency = "No";
        userTD = "No";
    }


    var executor6 = new SP.RequestExecutor(appWebUrl);
    var fullUrl = appWebUrl + "/_api/web/lists/getbytitle('Profiles')/items";
    var listname = "Profiles";
    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': {
            'type': itemType
        },
        'Title': userName,
        'DisplayName': userDisplayName,
        'IsLeadership': userIsLeadership,
        'ACAT': userACAT,
        'Competency': userCompetency,
        'Type': userType,
        'PEO': userPEO,
        'PMA': userPMA,
        'Program': userProgram,
        'Phase': userPhase,
        'PSM': userPSM,
        'TD': userTD,
        'Tier3': userTier3
    });

    var requestHeaders = {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "X-HTTP-METHOD": "POST",
        "content-length": requestBody.length,
        "Content-Type": "application/json;odata=verbose"
    };

    executor6.executeAsync({
        url: fullUrl,
        method: "POST",
        body: requestBody,
        headers: requestHeaders,
        success: successUserAddedHandler,
        error: errorUserAddedHandler
    });
}

function successUserAddedHandler() {
    alert("Your profile has been added successfully. You are being logged in.");
    //wait for 5 seconds to create profile
    var currentTime = new Date().getTime();
    while (currentTime + 5000 >= new Date().getTime()) {
    };
    window.location.replace("MyDashboard.aspx");
}

function sleep(milliseconds) {

}

function errorUserAddedHandler(data, errorCode, errorMessage) {
    alert("failed : " + errorCode + errorMessage);
    console.log("failed to create user : " + errorCode + errorMessage);
}

function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}

//PMAs
function LoadPMA(peoitem) {
    console.log("processing peo " + peoitem);
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = "&$filter=Title eq '" + peoitem + "'";
    var fullUrl = baseUrl + selectUrl + filterUrl;

    var executor3 = new SP.RequestExecutor(appWebUrl);
    executor3.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: pmaSuccessHandler,
        error: pmaErrorHandler
    });
}

function pmaSuccessHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.PMA + '">' + results.PMA + "</option>";
            $("#ddlPMA").append(optionhtml);
        });

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

function pmaErrorHandler(data, errorCode, errorMessage) {
    var errMsg = "Error retrieving the pmaErrorHandler: " + errorMessage;
    $("#error").val(errMsg);
    console.log("Error processing pmaErrorHandler" + errorCode + errorMessage);
}

//Program
function LoadProgram(peo, pma) {
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" + listname + "')/items?";
    var filterUrl = "&$filter=(Title eq '" + peo + "') and (PMA eq '" + pma + "')";
    var fullUrl = baseUrl + selectUrl + filterUrl;
    alert(fullUrl);
    console.log(fullUrl);

    var executor = new SP.RequestExecutor(appWebUrl);
    executor.executeAsync({
        url: fullUrl,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: programSuccessHandler,
        error: programErrorHandler
    });
}

function programSuccessHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
    $.each(results,
        function(index, results) {
            var optionhtml = '<option value="' + results.Program + '">' + results.Program + "</option>";
            $("#ddlProgram").append(optionhtml);
        }); //end of each         
//eliminate duplicate programs in listing
    var usedPrograms = {

    };
    $("#ddlProgam > option")
        .each(function() {
            if (usedPrograms[this.value]) {
                $(this).remove();
            } else {
                usedPrograms[this.value] = this.value;
            }
        });
}

function programErrorHandler(data, errorCode, errorMessage) {
    var errMsg = "Error retrieving the programs: " + errorMessage;
    $("#error").val(errMsg);
}

//ACAT
function LoadACAT(peo, pma, program) {
    var listname = "PEO_PMA_PROGRAM_ACAT";
    var baseUrl = _spPageContextInfo.webAbsoluteUrl;
    var selectUrl = "/_api/web/Lists/getbyTitle('" +listname + "')/items?";
    var filterUrl = "&$filter=(Title eq '" +peo + "') and (PMA eq '" +pma + "') and (Program eq '" +program + "')";
    var fullUrl = baseUrl +selectUrl +filterUrl;
    console.log(fullUrl);
    var executor4 = new SP.RequestExecutor(appWebUrl);
    executor4.executeAsync({
    url: fullUrl,
    method: "GET",
    headers: {
            "Accept": "application/json; odata=verbose"
    },
    success: acatSuccessHandler,
    error: acatErrorHandler
    });
    }

function acatSuccessHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var results = jsonObject.d.results;
  
     $.each(results,
            function(index, results) {
                var optionhtml = "<option value='" + results.ACAT + "'>" + results.ACAT + "</option>";
                $("#ddlACAT").append(optionhtml);
            });
    
     var usedACATS = {};
      $("#ddlACAT > option")
           .each(function() {
               if (usedACATS[this.value]) {
                    $(this).remove();
           } else {
                usedACATS[this.value]= this.value;
            }
        });
    }

function acatErrorHandler(data, errorCode, errorMessage) {
    var errMsg = "Error retrieving the acatErrorHandler: " +errorMessage;
    $("#error").val(errMsg);
    console.log("Error processing acatErrorHandler" +errorCode +errorMessage);
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


function ReloadUser() {

    var username = currentUser;
    var executor12 = new SP.RequestExecutor(appWebUrl);
    var listname = "Profiles";
    var baseUrl = appWebUrl;
    var selectUrl = "/_api/web/lists/getbytitle('" + listname + "')/items";
    var filterUrl = "&" + "$filter=Title eq '" + username + "'";
    console.log("Processing GetUserInfo for " + username);
    var fullUrl = baseUrl + selectUrl + filterUrl;
    var requestHeaders = {
        "accept": "application/json;odata=verbose"
    };

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
    var requestHeaders = {
        "accept": "application/json;odata=verbose"
    };

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
    alert("login failed: " + data.errorCode + data.errorMessage);
}

//LOAD FORM 


//UPDATE PROFILE


function CancelProfile() {
    alert("Your changes have been cancelled");
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
        '__metadata': {
            'type': itemType
        },
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
        headers: {
            "Accept": "application/json; odata=verbose"
        },
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


    function GetItemTypeForListName(list) {
        return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
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
    }
}