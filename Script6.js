var hostweburl = _spPageContextInfo.siteAbsoluteUrl;;
var appweburl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;;
var eTag;
var formDigestValue = "";
var scriptbase = "";
$(document).ready(function () {
    //var scriptbase = hostweburl + "/_layouts/15/";
    //$.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);

    $("#btnSubmit").on("click", function () {
        prepareItem();
        addItem();

    });
});

function prepareItem() {
    var scriptbase = hostweburl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);
}

function execCrossDomainRequest() {
    //  var scriptbase = hostweburl + "/_layouts/15/";
    //  $.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);

    var executor = new SP.RequestExecutor(appweburl);
    var fullUrl = hostweburl + appweburl + "/_api/web/lists/getbytitle('Feedback')/items";
    alert(fullUrl);
    var listname = "Feedback";
    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': "kristest",
        'Category': "General Feedback",
        'Description': "hello"
    });

    executor.executeAsync(
        {
            url: fullUrl,
            method: "POST",
            body: requestBody,
            headers: {
                "content-length": requestBody.length,
                "Content-Type": "application/json;odata=verbose"
            },
            success: function (successData) {
                var dataMsg = "insert successful";
                alert("good here " + dataMsg);
                $('#digest').text(dataMsg);
            },
            error: function (errorData, errorCode, errorMessage) {
                var errMsg = "Error retrieving the form digest value: " + errorMessage;
                $("#error").text(errMsg);
            }
        }); //executeAsync
}


function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}


//notes

function retrieveFormDigest() {
    var contextInfoUri = appweburl + "/_api/contextinfo";
    var executor = new SP.RequestExecutor(appweburl)
    executor.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            var jsonObject = JSON.parse(data.body);
            formDigestValue = jsonObject.d.GetContextWebInformation.FormDigestValue;
            $('#digest').text(formDigestValue);
        },
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: "
            + errorMessage;
            $("#error").text(errMsg);
        }
    });
}


//METHOD 2 FORBIDDEN
/*
function execCrossDomainRequest() {
    // executor: The RequestExecutor object
    // Initialize the RequestExecutor with the app web URL.
    var executor = new SP.RequestExecutor(appweburl);
    var fullUrl = appweburl + "/_api/web/lists/getbytitle('Feedback')/items";

    // Issue the call against the app web.
    // To get the title using REST we can hit the endpoint:
    //      addinweburl/_api/web/lists/getbytitle('listname')/items
    // The response formats the data in the JSON format.
    // The functions successHandler and errorHandler attend the
    //      sucess and error events respectively.
    var listname = "Feedback";
    var itemType = GetItemTypeForListName(listname);
    var item = {
        '__metadata': { 'type': itemType },
        'Title': "kristest",
        'Category': "General Feedback",
        'Description': "hello"
    };

    executor.executeAsync(
        {
            url: fullUrl,
            method: "POST",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(item),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            headers: {
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": $('#digest').val()
            },
            success: function (data) {
                var jsonObject = JSON.parse(data.body);
                formDigestValue = jsonObject.d.GetContextWebInformation.FormDigestValue;
                $('#digest').text(formDigestValue);
            },
            error: function (data, errorCode, errorMessage) {
                var errMsg = "Error retrieving the form digest value: " + errorMessage;
                $("#error").text(errMsg);
            }
        }); //executeAsync
}


*/

