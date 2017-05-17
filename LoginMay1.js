(function initialize() {
    var appWebUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
    var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
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
        if (thisUser == "system") {
            thisUser = "kris.white";
            console.log("user is system, but changing to Kris.white for testing");
        }

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
            var uID = results.Id;
            var uName = results.Title;
            var uAdmin = results.IsLeadership;
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
            $("#usrProgram").text(" |  " + uProgram);
            $("#userAdmin").val(uAdmin);
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
        console.log("login failed: " + data.errorCode + data.errorMessage);
    }

})();
