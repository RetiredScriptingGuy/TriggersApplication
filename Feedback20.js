var targetSiteUrl = _spPageContextInfo.siteAbsoluteUrl;
var appweburl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.webServerRelativeUrl;
var eTag;
var digest = "";
var itemTitle = "";

_spBodyOnLoadFunctionNames.push("myCustomPage");


function myCustomPage(){   
    $("#btnSubmit").on("click", function () {
        prepareItem();
        addItem();
        addAttachment();
    });
}

function prepareItem() {
    var scriptbase = targetSiteUrl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", retrieveFormDigest);
}

function retrieveFormDigest() {
    digest = $("#__REQUESTDIGEST").val();
    var contextInfoUri = appweburl + "/_api/contextinfo";
    var executor = new SP.RequestExecutor(appweburl)
    executor.executeAsync({
        url: contextInfoUri,
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: addItem,
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the form digest value: " + errorMessage;
            $("#error").text(errMsg);
        }
    });
}

function addItem(data) {
   
    itemTitle = $('#tbTitle').val();          
    var itemCategory = $('#feedbackselect option:selected').val();
    var itemDescription = $('#taFeedback').val();    
    var listname = "Feedback";   
    var executor = new SP.RequestExecutor(appweburl);
    var fullUrl = appweburl + "/_api/web/lists/getbytitle('"+listname+"')/items";   
   
    var itemType = GetItemTypeForListName(listname);
    var requestBody = JSON.stringify({
        '__metadata': { 'type': itemType },
        'Title': itemTitle ,
        'Category': itemCategory,
        'Description': itemDescription 
    });
    
    var requestHeaders = {
        "accept":"application/json;odata=verbose",
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

function addFile(){
    var fileCountCheck = 0;
    $("#btnSubmit").click(function () {
        var data = [];
        var fileArray = [];
        $("#attachFilesContainer input:file").each(function () {
            if ($(this)[0].files[0]) {                    
                fileArray.push({ "Attachment": $(this)[0].files[0] });                    
            }
        });
        data.push({"FirstName": $("#txtFirstName").val().trim(), "LastName": $("#txtLastName").val().trim(), "Files": fileArray});            
        createItemWithAttachments("MyList", data).then(
            function(){
                alert('Item created with Multiple attachments');
            },
            function(sender, args){
                console.log('Error occured' + args.get_message());
            }
        )
	        
    });
		
    var createItemWithAttachments = function(listName, listValues){			
        var fileCountCheck = 0;
        var fileNames;			
        var context = new SP.ClientContext.get_current();
        var dfd = $.Deferred();
        var targetList = context.get_web().get_lists().getByTitle(listName);
        context.load(targetList);
        var itemCreateInfo = new SP.ListItemCreationInformation();
        var listItem = targetList.addItem(itemCreateInfo);	 
        listItem.set_item("FirstName", listValues[0].FirstName);
        listItem.set_item("LastName", listValues[0].LastName); 
        listItem.update();
        context.executeQueryAsync(
            function () {
                var id = listItem.get_id();
                if (listValues[0].Files.length != 0) {
                    if (fileCountCheck <= listValues[0].Files.length - 1) {
                        loopFileUpload(listName, id, listValues, fileCountCheck).then(
                            function () {
                            },
                            function (sender, args) {
                                console.log("Error uploading");
                                dfd.reject(sender, args);
                            }
                        );
                    }
                }
                else {
                    dfd.resolve(fileCountCheck);
                }
            },   
            function(sender, args){
                console.log('Error occured' + args.get_message());	        	
            }
        );
        return dfd.promise();			
    }
		
    function loopFileUpload(listName, id, listValues, fileCountCheck) {
        var dfd = $.Deferred();
        uploadFile(listName, id, listValues[0].Files[fileCountCheck].Attachment).then(
            function (data) {	                   
                var objcontext = new SP.ClientContext();
                var targetList = objcontext.get_web().get_lists().getByTitle(listName);
                var listItem = targetList.getItemById(id);
                objcontext.load(listItem);
                objcontext.executeQueryAsync(function () {
                    console.log("Reload List Item- Success");	                                     
                    fileCountCheck++;
                    if (fileCountCheck <= listValues[0].Files.length - 1) {
                        loopFileUpload(listName, id, listValues, fileCountCheck);
                    } else {
                        console.log(fileCountCheck + ": Files uploaded");
                        alert('Item created with Multiple attachments');	                        
                    }
                },
                function (sender, args) {
                    console.log("Reload List Item- Fail" + args.get_message());
                });	                 
	                
            },
            function (sender, args) {
                console.log("Not uploaded");
                dfd.reject(sender, args);
            }
       );
        return dfd.promise();
    }
    	
    function uploadFile(listName, id, file) {
        var deferred = $.Deferred();
        var fileName = file.name;
        getFileBuffer(file).then(
            function (buffer) {
                var bytes = new Uint8Array(buffer);
                var binary = '';
                for (var b = 0; b < bytes.length; b++) {
                    binary += String.fromCharCode(bytes[b]);
                }
                var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
                console.log(' File size:' + bytes.length);
                $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
                    var createitem = new SP.RequestExecutor(_spPageContextInfo.webServerRelativeUrl);
                    createitem.executeAsync({
                        url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.name + "')",
                        method: "POST",
                        binaryStringRequestBody: true,
                        body: binary,
                        success: fsucc,
                        error: ferr,
                        state: "Update"
                    });
                    function fsucc(data) {
                        console.log(data + ' uploaded successfully');
                        deferred.resolve(data);
                    }
                    function ferr(data) {
                        console.log(fileName + "not uploaded error");
                        deferred.reject(data);
                    }
                });
	
            },
            function (err) {
                deferred.reject(err);
            }
        );
        return deferred.promise();
    }
    function getFileBuffer(file) {
        var deferred = $.Deferred();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(file);
        return deferred.promise();
    }
});	
</script>
}

function successItemAddedHandler(){
    alert("Thank you");
}

function errorItemAddedHandler(data, errorCode, errorMessage){
    alert("failed : " + errorCode + errorMessage);
}

function GetItemTypeForListName(list) {
    return "SP.Data." + list.charAt(0).toUpperCase() + list.split(" ").join(" ").slice(1) + "ListItem";
}

