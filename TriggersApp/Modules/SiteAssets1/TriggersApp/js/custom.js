

//      (function initialize(){
		     
		  		          
//		  var clientContext;
//		  var website;
//		  var appweburl;
 
//            SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);
//			function sharePointReady() {
//			    clientContext = SP.ClientContext.get_current();
//			    website = clientContext.get_web();	
//			    clientContext.load(website);
//			    currentUser = website.get_currentUser();
//			    clientContext.load(currentUser);
//			    clientContext.executeQueryAsync(onRequestSucceeded, onRequestFailed);
//			}
			
//        	function onRequestSucceeded() {
//				var longUserName = currentUser.get_loginName();
//			    var startIndex = longUserName.lastIndexOf('\\');
//			    var thisUser = longUserName.substr(startIndex + 1);
//			    getProfile(thisUser);
//			}
				
//			function onRequestFailed(sender, args) {
//			   console.log('unable to load client context');          
//			}
			
//			function getProfile(username)
//			{
				
//				var query = '?$select=CurrentUser';
//				appweburl = website.get_url();
//				var thisurl = appweburl +  "/_api/lists/getbytitle('Profile')/items?$select=ID&$filter=CurrentUser eq '" + username + "'";
				        
//				$.ajax({
//			        url: thisurl,
//			        type: "GET",
//			        headers: {
//			            "accept": "application/json;odata=verbose",
//			        },
//			        success: function (data) {
//			        			            if(data.d.results.length === 0)
//			            {
//			            	window.location = appweburl + '/Lists/Profile/Item/newifs.aspx';
//			            }
//			        },
//			        error: function (error) {
//			            alert(JSON.stringify(error));
//			        }
//			    });
//			}	

							
//})();


