
var root;  //i know, sorry   

$(document).ready(function () {
    
        $//('.MyProgramIssuesTable').DataTable();
        $('.MyProgramIssuesTable').on('click', 'tr', function (e) {
            clearCube();
            var likelihood = $(this).find('td:eq(5)').text();
            var consequence = $(this).find('td:eq(6)').text();
            var $cube = $('.cube');
            var cell = likelihood + consequence;
            var square = $cube.find('#' + cell);
            square.text('X');

        });

        $(".MyProgramIssuesTable").on('dblclick', 'tr', function (e) {
        
            var windowTitle = 'Issue View';
            var id = $(this).find('td:eq(0)').text();
            formPath = '/Lists/ProgramIssuesAndRisks/DispForm.aspx?ID=' + id;
            SP.SOD.executeFunc('sp.js', 'SP.ClientContext', getForm(formPath, 'Issue View'));
        
        });

        getMyIssues();

    });



function getMyIssues(){

}

function getProgramEvents() {

}

function getProgramRisks() {

}

    function clearCube()
    {
        $('.cube').find('td').each(function () {
            if ($(this).text() === 'X')
                $(this).text('');
        });    

    }


    function getForm(path, windowTitle) {
        clientContext = SP.ClientContext.get_current();
        website = clientContext.get_web();
        root = website.get_url()
        clientContext.executeQueryAsync(SPModalWindow(path, windowTitle), console.log('unable to retrieve website'));
        
    }

    function SPModalWindow(path, windowTitle) {

        var formPath = root + path;

        var options = {
            url: formPath,
            width: 1200,
            height: 1200,
            allowMaximize: true,
            showClose: true,
            allowResize: true,
            menubar: true,
            toolbar: true,

            title: windowTitle
        };

        SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', options);
    }

