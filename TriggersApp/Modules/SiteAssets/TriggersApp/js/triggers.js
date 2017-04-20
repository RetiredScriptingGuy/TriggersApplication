"use strict";

$(document)
    .ready(function() {
    
          

         getUser()
         
      
   var sourcetable =     $("#Triggers")
            .DataTable({
                columns: [
                    { title: "Title" }
                ],
                "searching": true,
                "paging": false,
                "info": false

            }); //end of datatable

       $("#Triggers tbody")
            .on("click",
                "tr",
                function() {
                    if ($(this).hasClass("selected")) {
                        $(this).removeClass("selected");
                    } else {
                        $("tr selected").removeClass("selected");
                        $(this).addClass("selected");
                    }

                });

//       $('#copybutton').click(function(){
       
           //var data = table.rows('.selected').data();
    //       var anSelected = fnGetSelected( table );
 //                 });
                  
       var destination =   $("#MyList")
            .DataTable({
                columns: [
                    { title: "Title" }
                ],
                "searching": true,
                "paging": false,
                "info": false

            }); //end of datatable


        getTriggers();
        getIssues(); 
        
        
       $('#copybutton').click( function() {
       var selected_entries = fnGetSelected(sourcetable);
       var selected_Len = selected_entries.length;      
  
    } ); 
        
        
               
   function fnGetSelected( oTableLocal )
    {
      return oTableLocal.$('tr.row_selected');
    } 
     
     
     
     
// clone
//  $('#copybutton').click(function(){
//       var anSelected = fnGetSelected( sourcetable );
        
//        anSelected.clone().insertAfter( $("table").find("tr").last());
//        $("table").find("tr").last().removeClass("row_selected");
 //   });
     

    /* Init the table */
   // oTable = $('#example').dataTable( );

 
 
/* Get the rows which are currently selected */
//function fnGetSelected( oTableLocal )
//{
//    return oTableLocal.$('tr.row_selected');
//}
     
    }); //end of document.ready()
    
function getTriggers() {
            var call = $.ajax({

                //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                 
                 //works but does not display trigger lookup field
                 url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('Triggers')/items?$select=Title",
               
                 //works but returns object object for trigger title
                // url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('ProfilesIssuesAndRisks')/items?$select=Title,IssueRiskType,Severity,Triggers/Title&$expand=Triggers/Title",
                 
                 //works but returns object object for triggers title
                //   url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('ProfilesIssuesAndRisks')/items?$select=Title,IssueRiskType,Severity,Triggers/LinkTitle&$expand=Triggers",
               
                type: "GET",
                dataType: "json",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                }
            });

            call.done(function(data, textStatus, jqXHR) {
                $("#Triggers")
                    .dataTable({
                        "bDestroy": true,
                        "bProcessing": true,
                        "aaData": data.d.results,
                        "aoColumns": [
                            { "mData": "Title" }                           
                        ]
                    });
            });
            
            call.fail(function(jqXHR, textStatus, errorThrown){
                alert("Error retrieving Trigger List: Here is the errorThrown, textStatus, and request text" + errorThrown +" "+ textStatus +" "+ jqXHR.responseText);
            });  //end of call.fail
} //getTriggers


function getIssues() {
            var call = $.ajax({
                //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                //url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('risks')/items",
                url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('Issues')/items?$select=Title",
                type: "GET",
                dataType: "json",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",    
                }
            });

            call.done(function(data, textStatus, jqXHR) {
                $("#Issues")
                    .dataTable({
                        "bDestroy": true,
                        "bProcessing": true,
                        "aaData": data.d.results,
                        "aoColumns": [
                            { "mData": "Title" }                           
                        ]
                    });
            });

            call.fail(function(jqXHR, textStatus, errorThrown) {
                alert("Error retrieving Tasks: Here is the errorThrown, textStatus, and request text" + errorThrown +" "+ textStatus +" "+ jqXHR.responseText);
            });
}   //getIssues

function getTriggerDescription(){
            var call = $.ajax({
                //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                 url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('Triggers')/item(id)/?select=Description",
               
              //  url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('risks')/items",
                type: "GET",
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            });

            call.done(function(data, textStatus, jqXHR) {
                $("#TriggerDescription")
                    .dataTable({
                        "bDestroy": true,
                        "bProcessing": true,
                        "aaData": data.d.results,
                        "aoColumns": [
                            { "mData": "Description" }
                          ]
                    });
            });

            call.fail(function(jqXHR, textStatus, errorThrown) {
                alert("Error retrieving Tasks: " + jqXHR.responseText);
            });
}   //getTriggerDescription



function getUser(){
        var clientContext;
        var web;
        var currentUser;

        clientContext = SP.ClientContext.get_current();
        web = clientContext.get_web();
        clientContext.load(web);
        currentUser = web.get_currentUser();
        clientContext.load(currentUser);

        clientContext.executeQueryAsync(
            function() {
                currentUser = web.get_currentUser();
                var longUserName = currentUser.get_loginName();
                var startIndex = longUserName.lastIndexOf("\\");
                var thisUser = longUserName.substr(startIndex + 1);
                var $element = $("#login");
                if ($element) {
                    $element.html(thisUser);
                    $element.attr("href", "../SitePages/Profile.html?Name=" + longUserName);
                }
            },
            function() { alert("Request failed") }
        );





}

function getCurrentUser() {

    var clientContext;
    var website;
    var appweburl;

    SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

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
        var startIndex = longUserName.lastIndexOf("\\");
        var thisUser = longUserName.substr(startIndex + 1);
        $("#login").html(thisUser);
    }

    function onRequestFailed(sender, args) {
        console.log("unable to load client context");
    }

    function getProfile(username) {

        var query = "?$select=CurrentUser";
        appweburl = website.get_url();
        var thisurl = appweburl +
            "/_api/lists/getbytitle('Profile')/items?$select=ID&$filter=CurrentUser eq '" +
            username +
            "'";

        $.ajax({
            url: thisurl,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: function(data) {
                if (data.d.results.length === 0) {
                    window.location = appweburl + "/Lists/Profile/Item/newifs.aspx";
                }
            },
            error: function(error) {
                alert(JSON.stringify(error));
            }
        });
    }

} // end of getCurrenntUser

function CopySelectedIssue(){
   var selecteditems = getSelectedItems();
  alert("your list has been updated with " + selecteditems );
}

function AddNewIssue(){   
   var opener = "http://dev/sites/Trigger/_layouts/15/start.aspx#/Lists/Issues/NewForm.aspx";

 var redirectWindow = window.open(opener, '_blank');
    redirectWindow.location; 

}

//function getSelectedItems(){
 //   var context = SP.ClientContext.get_current();
 //   var siteUrl = 'http://dev/sites/Trigger';
 //   var clientContext = new SP.ClientContext(siteUrl);
 //   var web = context.get_web();
 //   context.load(web);

//    var sourceId = SP.ListOperation.Selection.getSelectedList('Triggers');
 //    var source = web.get_lists().getById(sourceId);
 

 //   var oList = context.get_web().get_lists().getByTitle('MyList');
 //   context.load(oList);

 //   var selectedItems = SP.ListOperation.Selection.getSelectedItems(context);
 //       alert(selecteditems);
 //  for(var i in selectedItems)
///{
 //   var currentItem = source.getItemById(selectedItems[i].id);
 //   context.load(currentItem);
 //   context.executeQueryAsync(Function.createDelegate(this,test),Function.createDelegate(this,error));
//}

  //  function test(sender, args){
   // var itemCreateInfo = new SP.ListItemCreationInformation();
   // var oListItem = oList.addItem(itemCreateInfo);
   // oListItem.set_item('Title', currentItem.get_item('Title'));
   // oListItem.update();
   // oList.update();
   // alert('done');
//}
//function error(sender, args){ alert('error');}""

//}