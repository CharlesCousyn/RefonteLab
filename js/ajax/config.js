var Editor;

$(document).ready(()=>
{
    let url = './js/ajax/example.json';
    processConfigurationJSON(url)
        .then((json)=>
        {
            Editor = new ConfigEditor(json,"mainContainer");
        });
});

let processConfigurationJSON = function (url)
{
    return new Promise((resolve, reject) =>
    {
        $.ajax(
            {
                url : url,
                type : 'GET',
                dataType : 'json',
                success :
                    (json, status)=>
                    {
                        console.info(status);
                        resolve(json);
                    },

                error : function(resultat, statut, erreur)
                {
                    console.error(statut);
                    console.error(erreur);
                    reject(erreur);
                }
            });
    });
};
