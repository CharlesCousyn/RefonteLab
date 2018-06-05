$(document).ready(()=>
{
    let url = './js/ajax/example.json';
    processConfigurationJSON(url);
});

let processConfigurationJSON = function (url) {
    $.ajax(
        {
            url : url,
            type : 'GET',
            dataType : 'json',
            success :
                (result, status)=>
                {
                    console.info(status);
                    handleConfigJSON(result);
                },

            error : function(resultat, statut, erreur)
            {
                console.error(statut);
                console.error(erreur);
            }
        });
};
