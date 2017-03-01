function getListItem(url, listname, id, complete, failure) {

    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')/items(" + id + ")",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {

            complete(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

function getListItems(url, listname, query, complete, failure) {

    // Executing our items via an ajax request
    $.ajax({
        url: url + "/_api/web/lists/getbytitle('" + listname + "')/items" + query,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            complete(data); // Returns JSON collection of the results
        },
        error: function (data) {
            failure(data);
        }
    });

}