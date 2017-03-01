'use strict';

$(document)
      .ready(function() {

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
                  var startIndex = longUserName.lastIndexOf('\\');
                  var thisUser = longUserName.substr(startIndex + 1);
                  var $element = $("#login");
                  if ($element) {
                      $element.html(thisUser);
                      $element.attr('href', '../SitePages/Profile.html?Name=' + longUserName);
                  }
              },
              function() { alert("Request failed") }
          );


          //  getAllEvents();

          function getAllEvents() {

              var call = $.ajax({

                  //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                  url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('events')/items",
                  type: "GET",

                  dataType: "json",

                  headers: {
                      Accept: "application/json;odata=verbose"

                  }

              });

              call.done(function(data, textStatus, jqXHR) {

                  $('#events')
                      .dataTable({
                          "bDestroy": true,

                          "bProcessing": true,

                          "aaData": data.d.results,

                          "aoColumns": [
                              { "mData": "Title" },
                              { "mData": "Program" },
                              { "mData": "POA" },
                              { "mData": "DueDate" }
                          ]

                      });

              });

              call.fail(function(jqXHR, textStatus, errorThrown) {

                  alert("Error retrieving Tasks: " + jqXHR.responseText);

              });

          }


          function getAllRisks() {

              var call = $.ajax({

                  //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                  url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('risks')/items",
                  type: "GET",

                  dataType: "json",

                  headers: {
                      Accept: "application/json;odata=verbose"

                  }

              });

              call.done(function(data, textStatus, jqXHR) {

                  $('#risks')
                      .dataTable({
                          "bDestroy": true,

                          "bProcessing": true,

                          "aaData": data.d.results,

                          "aoColumns": [
                              { "mData": "Trigger" },
                              { "mData": "Issue" },
                              { "mData": "Severity" },
                              { "mData": "Type" }
                          ]

                      });

              });

              call.fail(function(jqXHR, textStatus, errorThrown) {

                  alert("Error retrieving Tasks: " + jqXHR.responseText);

              });

          }

          function getAllReviews(){

              var call = $.ajax({

                  //url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('events')/items",
                  url: "http://dev/sites/Trigger/_api/web/lists/getByTitle('risks')/items",
                  type: "GET",

                  dataType: "json",

                  headers: {
                      Accept: "application/json;odata=verbose"

                  }

              });

              call.done(function(data, textStatus, jqXHR) {

                  $('#reviews')
                      .dataTable({
                          "bDestroy": true,

                          "bProcessing": true,

                          "aaData": data.d.results,

                          "aoColumns": [
                              { "mData": "Trigger" },
                              { "mData": "Issue" },
                              { "mData": "Severity" },
                              { "mData": "Type" }
                          ]

                      });

              });

              call.fail(function(jqXHR, textStatus, errorThrown) {

                  alert("Error retrieving Tasks: " + jqXHR.responseText);

              });

          }


          //#region SampleData

          //       var dataSet1 = [
          //        ["Over-Flying", "Spares Shortfall", "High", "Cost"],
          //        ["Over-Flying", "Depot Throughput", "High", "Schedule"],
          //       ["Over-Flying", "SLEP", "High", "Performance"]


          //];

          var dataSet2 = [
              ["Over-Flying", "Spares Shortfall", "High", "Cost"],
              ["Over-Flying", "Depot Throughput", "High", "Schedule"],
              ["Over-Flying", "SLEP", "High", "Performance"]
          ];

          var dataSet3 = [
              ["ILA", "1-16-17", "Complete", "1-2-2017"],
              ["DAB", "1-16-17", "Complete", "1-2-2017"],
              ["SRR", "1-16-17", "Complete", "1-2-2017"]
          ];

          function onGetEventsComplete(data) {
              var events = data.d.results;
              $("eventslabel").text("Events count:" + events.length);

          }

          function onError(error) {
              alert("Error:" + JSON.stringify(error));
          }


          $('#events')
              .DataTable({
                  columns: [
                      { title: "Title" },
                      { title: "Program" },
                      { title: "POA" },
                      { title: "Due Date" }
                  ],
                  "searching": true,
                  "paging": false,
                  "info": false

              }); //end of datatable

          var table1 = $('#events').DataTable();


          $('#events tbody')
              .on('click',
                  'tr',
                  function() {
                      if ($(this).hasClass('selected')) {
                          $(this).removeClass('selected');
                      } else {
                          table1.$('tr selected').removeClass('selected');
                          $(this).addClass('selected');
                      }

                  });


          $('#risks')
              .DataTable({
                  data: dataSet2,
                  columns: [
                      { title: "Trigger" },
                      { title: "Issue" },
                      { title: "Severity" },
                      { title: "Type" }
                  ],
                  "searching": true,
                  "paging": false,
                  "info": false

              });

          $('#risks tbody')
              .on('click',
                  'tr',
                  function() {
                      if ($(this).hasClass('selected')) {
                          $(this).removeClass('selected');
                      } else {
                          table1.$('tr selected').removeClass('selected');
                          $(this).addClass('selected');
                      }

                  });


          $('#reviews')
              .DataTable({
                  data: dataSet3,
                  columns: [
                      { title: "Event Review" },
                      { title: "Due Date" },
                      { title: "Status" },
                      { title: "Date Completed" }
                  ],
                  "searching": true,
                  "paging": false,
                  "info": false

              });

          $('#reviews tbody')
              .on('click',
                  'tr',
                  function() {
                      if ($(this).hasClass('selected')) {
                          $(this).removeClass('selected');
                      } else {
                          table1.$('tr selected').removeClass('selected');
                          $(this).addClass('selected');
                      }

                  });


          //getMyIssues();
          //getRisks();
          //getEvents();

      }); //end of document.ready()


function getCurrentUser() {

    var clientContext;
    var website;
    var appweburl;

    SP.SOD.executeFunc('sp.js', 'SP.ClientContext',sharePointReady);
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
        $('#login').html(thisUser);
    }

    function onRequestFailed(sender, args) {
        console.log('unable to load client context');
    }

    			function getProfile(username)
    			{

    				var query = '?$select=CurrentUser';
    				appweburl = website.get_url();
    				var thisurl = appweburl +  "/_api/lists/getbytitle('Profile')/items?$select=ID&$filter=CurrentUser eq '" + username + "'";

    				$.ajax({
    			        url: thisurl,
    			        type: "GET",
    			        headers: {
    			            "accept": "application/json;odata=verbose",
    			        },
    			        success: function (data) {
    			        			            if(data.d.results.length === 0)
    			            {
    			            	window.location = appweburl + '/Lists/Profile/Item/newifs.aspx';
    			            }
    			        },
    			        error: function (error) {
    			            alert(JSON.stringify(error));
    			        }
    			    });
    			}


}

