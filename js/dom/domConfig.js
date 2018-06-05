let configSave = undefined;
let providerConfig = undefined;

let handleConfigJSON = function(json)
{
    configSave = json;
    //console.log(json);

    //Place the selector and the options
    $("#mainContainer")
        .html("")
        .append("<select class='w3-select w3-border' name='chooseProvider' id='chooseProvider'></select>");

    $("#chooseProvider").append("<option value='' disabled selected>Choisissez votre provider</option>");
    configSave.forEach(
        (providerConfig, index)=>
        {
            $("#chooseProvider").append("<option value='"+providerConfig.Name+"'>"+providerConfig.Name+"</option>");
        }
    );

    //Handle Event when we choose a provider
    $("#chooseProvider").on('change',  (event) =>
    {
        let providerName = event.target[event.target.selectedIndex].value;
        processProviderConfig(providerName);
    });

};


let processProviderConfig = function(providerName)
{
    //We delete existing providerContainer
    $("#providerContainer").remove();

    //We add the providerContainer
    $("#mainContainer")
        .append("<section id=\"providerContainer\" class='w3-border'></section>");


    $("#providerContainer")
        .append("<form id='formProvider' providerName='"+providerName+"'>" +
            "<h1 class=\"w3-margin w3-jumbo\" id=\"nameProvider\"></h1>\n" +
            "    <p class=\"w3-margin\" id=\"descriptionProvider\"></p>\n" +
            "    <div class=\"w3-panel w3-pale-blue w3-leftbar w3-rightbar w3-border-blue\">\n" +
            "        <p>Path to execute</p>\n" +
            "        <p id=\"pathProvider\"></p>\n" +
            "    </div>\n" +
            "    <h2 class=\"w3-margin w3-jumbo\">Configuration</h2>\n" +
            "    <ul class=\"w3-ul\" id=\"listFields\" class='w3-border'>\n" +
            "    </ul>" +
            "<button type='button' class='w3-btn w3-padding w3-teal' id='idValidateButton'" +
            "style='width:120px;margin: 0 auto;text-align: center;'>Valider &nbsp; ❯</button>" +
            "</form >");

    //Handle classic submission
    $('#formProvider').submit( (evt) => {
        evt.preventDefault();
    });

    //Handle new submission
    $('#idValidateButton').click(handleSubmission);

    //We find the good config object
    providerConfig = configSave.find((elem)=> providerName === elem.Name);

    //General attributes
    $("#nameProvider").html(providerConfig.Name);
    $("#descriptionProvider").html(providerConfig.Description);
    $("#pathProvider").html(providerConfig.Path);
    $("#listFields").html("");

    //Deal with all json
    let config = providerConfig.config;
    let formatConfig = providerConfig.entities;
    generateSubObject("listFields", config, formatConfig);
};

let generateSubObject = function(idParent, obj, formatConfig)
{
    Object.keys(obj).forEach((key)=>
    {
        let value = obj[key];
        let format = formatConfig[key];

        //console.log(key + ':' + value);

        //It's a simple attribute
        if(typeof value !== "object")
        {
            let field = undefined;

            //Is the field required?
            let required = false;
            if(format.required !== undefined && format.required)
            {
                required = true;
            }

            //Generate id of simple attribute
            let idSimpleAttribute = idParent + "_" + key;

            if(typeof value === "boolean")
            {
                //Generate the field
                field = $("<li class='w3-row w3-padding-large'></li>")
                    .append($("<label class='w3'>" + key + "</label>"))
                    .append($("<input class='w3-check fromFormProvider' " +
                        "id='" + idSimpleAttribute + "' " +
                        "type='checkbox'"+
                        " " +
                        (value ? "checked":"")+
                        " " +
                        ">"));
            }
            else if(typeof value === "number")
            {
                //Generate the field
                field = $("<li class='w3-row w3-padding-large'></li>")
                    .append($("<label class='w3-col m4 l3'>" + key + "</label>"))
                    .append($("<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' " +
                        "id='" + idSimpleAttribute + "' " +
                        "type='number' value='"+value+"' " +
                        (required ? "required":"")+"/>"));
            }
            else
            {
                //Generate the field
                field = $("<li class='w3-row w3-padding-large'></li>")
                    .append($("<label class='w3-col m4 l3'>" + key + "</label>"))
                    .append($("<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' " +
                        "id='" + idSimpleAttribute + "' " +
                        "type='text' value='"+value+"' " +
                        (required ? "required":"")+"/>"));
            }

            $("#"+idParent).append(field);
        }
        //It's an object
        else
        {
            let idNewParent = idParent+"_"+key;

            let field = undefined;

            //Is it an array?
            let idAddingButton = "";
            if(!Array.isArray(value))
            {
                idAddingButton = idParent+ "_addingButton";

                field = $("<li></li>")
                    .append("<button class='w3-button w3-border' onclick='toggleShowHide(\""+idNewParent+"\")'>"+key+"" +
                        "<i class='fa fa-caret-down w3-hide w3-show' style='display:inline'></i>" +
                        "<i class='fa fa-caret-up  w3-hide' style='display:inline'></i>" +
                        "</button>")
                    .append("<ul class='w3-ul w3-border w3-hide' id='"+idNewParent+"'></ul>");


                //Format is slightly different
                format = formatConfig[0];

                //$("#"+idParent).append(field);
                console.log("insertbefore(#"+idAddingButton+")");
                field.insertBefore($("#"+idAddingButton).parent());
            }
            else
            {
                idAddingButton = idNewParent+ "_addingButton";
                field = $("<li></li>")
                    .append("<h3>"+key+"</h3>")
                    .append("<ul class='w3-ul' id='"+idNewParent+"'>" +
                        "<li><button class='w3-button w3-border' id='"+idAddingButton+"'>\+" +
                        "</button></li></ul>");


                $("#"+idParent).append(field);

                //Event for adding buttons
                $("#"+idAddingButton).click((evt)=>
                {
                    evt.preventDefault();
                    console.log(idAddingButton);

                    addElementToArray(idAddingButton, format, $("#"+idAddingButton).parent().parent().attr('id'));
                });
            }



            generateSubObject(idNewParent, value, format);
        }
        /*
        console.log("Key: ");
        console.log(key);
        console.log("Value: ");
        console.log(value);
        console.log("Format: ");
        console.log(format);*/
    });
};

let handleSubmission = function () {
    let inputElements = $(".fromFormProvider");
    let inputs = [];

    //Create inputs array
    inputElements.each((index) =>
    {
        inputs.push(
            {
                path: idToPathArray(inputElements[index].id),
                value: inputElements[index].value
            }
        );
    });

    //Prepare the new config of provider

    //We initiate te new config with old config
    let newConfig = providerConfig.config;
    let configFormat = providerConfig.entities;

    inputs.forEach((input)=>
    {
        let toModified = newConfig;
        input.path.forEach((partPath)=>
        {
            toModified = toModified[partPath];
        });

        toModified = input.value;
    });

    console.log(newConfig);

};

let idToFormatPath = function(id, indexesToZero)
{
    //listFields_lstBox_0_lstSensor_0
    //lstBox_0_lstSensor_0

    let newString = id
        .replace("listFields_", "")
        .replace("listFields", "");

    let split = newString.split("_");

    let path = "";
    split.forEach((elem, index)=>
    {
        if(elem === "")
        {
            path += "";
        }
        else if(!isNaN(elem))
        {
            if(indexesToZero)
            {

                path += "[0]";
            }
            else
            {
                path += "["+elem+"]";
            }
        }
        else
        {
            path += "." + elem;
        }
    });

    if(path.substr(0, 1) === ".")
    {
        path = path.substr(1, path.length-1);
    }

    return path;
};

let idToPathArray = function(id, indexesToZero)
{
    //listFields_lstBox_0_lstSensor_0
    //lstBox_0_lstSensor_0

    let newString = id
        .replace("listFields_", "")
        .replace("listFields", "");

    let split = newString.split("_");

    if(indexesToZero)
    {
        split.forEach(
            (elem, index)=>
            {
                if(!isNaN(elem))
                {
                    split[index] = "0";
                }
            }
        );
    }

    return split;
};

let  toggleShowHide =function(id){
    let x = $("#"+id);
    if (!x.hasClass("w3-show"))
    {
        x.addClass(" w3-show");
    }
    else
    {
        x.removeClass(" w3-show");
    }

    let button=x.parent().find("button");
    let down = button.find("i.fa-caret-down");
    let up = button.find("i.fa-caret-up");

    if (!down.hasClass("w3-show"))
    {
        down.addClass(" w3-show");
        up.removeClass(" w3-show");
    }
    else
    {
        down.removeClass(" w3-show");
        up.addClass(" w3-show");
    }


};

let addElementToArray = function(idAddingButton, formatToAdd, idContainerToFull)
{
    Object.keys(formatToAdd).forEach((key)=>
    {
        let value = formatToAdd[key];
        /*
        console.log("Key: "+key);
        console.log("value");
        console.log(value);*/

        if(typeof value === "object")
        {
            let type = value.type;
            let required = value.required;
            let values = value.values;

            //It's a final object!
            if(type !== undefined && required !== undefined)
            {
                //Create the field
                let field = undefined;

                //Generate id of simple attribute
                let idSimpleAttribute = $("#"+idAddingButton).parent().attr('id') + "_" + key;

                if(type === "STRING")
                {
                    //Generate the field
                    field = $("<li class='w3-row w3-padding-large'></li>")
                        .append($("<label class='w3-col m4 l3'>" + key + "</label>"))
                        .append($("<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' " +
                            "id='" + idSimpleAttribute + "' " +
                            "type='text' value='' " +
                            (required ? "required":"")+"/>"));
                }
                else if(type === "NUMBER")
                {
                    //Generate the field
                    field = $("<li class='w3-row w3-padding-large'></li>")
                        .append($("<label class='w3-col m4 l3'>" + key + "</label>"))
                        .append($("<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' " +
                            "id='" + idSimpleAttribute + "' " +
                            "type='number' value='' " +
                            (required ? "required":"")+"/>"));
                }
                else if(type === "BOOLEAN")
                {
                    //Generate the field
                    field = $("<li class='w3-row w3-padding-large'></li>")
                        .append($("<label class='w3'>" + key + "</label>"))
                        .append($("<input class='w3-check fromFormProvider' " +
                            "id='" + idSimpleAttribute + "' " +
                            "type='checkbox'"+
                            " " +
                            (required ? "required":"") +
                            " " +
                            ">"));
                }

                $("#"+idContainerToFull).append(field);
                //field.insertBefore("#"+idAddingButton);
            }
            //Recursion...
            else
            {
                //It's an array
                if(Array.isArray(value))
                {
                    let idUl = idContainerToFull+"_"+key;
                    let idNewAddingButton = idUl + "_addingButton";

                    let field = $("<li></li>")
                        .append("<h3>"+key+"</h3>")
                        .append("<ul class='w3-ul' id='"+idUl+"'>" +
                            "<li><button class='w3-button w3-border' id='"+idNewAddingButton+"'>\+" +
                            "</button></li></ul>");

                    $("#"+idContainerToFull).append(field);

                    //Event for adding buttons
                    $("#"+idNewAddingButton).click((evt)=>
                    {
                        evt.preventDefault();
                        console.log(idNewAddingButton);
                        addElementToArray(idNewAddingButton, value, $("#"+idNewAddingButton).parent().parent().attr('id'));
                    });
                }
                //It's a real object
                else
                {
                    let myAddingButton = $("#"+idAddingButton);
                    //find the good index
                    let index = myAddingButton.parent().parent().children().length - 1;

                    let idUlAttribute = idContainerToFull + "_" + index;

                    let list = $("<li></li>")
                        .append("<button class='w3-button w3-border' onclick='toggleShowHide(\""+idUlAttribute+"\")'>"+index+"" +
                            "<i class='fa fa-caret-down w3-hide w3-show' style='display:inline'></i>" +
                            "<i class='fa fa-caret-up  w3-hide' style='display:inline'></i>" +
                            "</button>")
                        .append("<ul class='w3-ul w3-border w3-hide' id='"+idUlAttribute+"'></ul>");

                    list.insertBefore(myAddingButton.parent());
                    addElementToArray(idAddingButton, formatToAdd[key], idUlAttribute);
                }
            }
        }
    });
};