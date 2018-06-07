let listsOfFormats;
let formatIndex;

class ConfigEditor
{
    constructor(json, id)
    {
        this.json = json;
        this.id = id;
        this.providerConfig ={};

        this.generateSelectProvider((providerName)=>
        {
            listsOfFormats= [];
            formatIndex = 0;
            this.createForm(providerName)
        });
    }

    generateSelectProvider(callback)
    {
        let str = "";
        str += "<select class='w3-select w3-border' name='chooseProvider' id='chooseProvider'>";
            str += "<option value='' disabled selected>Choisissez votre provider</option>";
            this.json.forEach(
                (providerConfig)=>
                {
                    str += "<option value='"+providerConfig.Name+"'>"+providerConfig.Name+"</option>";
                }
            );
        str += "</select>";

        //Place the selector and the options
        $("#"+this.id).html("").append(str);



        //Handle Event when we choose a provider
        $("#chooseProvider").on('change',  (event) =>
        {
            let providerName = event.target[event.target.selectedIndex].value;
            callback(providerName);
        });
    }

    createForm(providerName)
    {
        //We delete existing providerContainer
        $("#providerContainer").remove();

        //We add the providerContainer
        let str = "";
        str += "<section id='providerContainer' class='w3-border'></section>";
        $("#"+this.id).append(str);

        //We find the good config object
        this.providerConfig = this.json.find((elem)=> providerName === elem.Name);

        //Generate empty form
        this.generateEmptyForm(this.providerConfig.Name);//Form id: formProvider

        //Fill the form
        this.fillFormProvider(this.providerConfig);

        //Handle the submission
        this.handleSubmission(this.providerConfig);
    }

    generateEmptyForm(providerName)
    {
        //We put the form
        let str="";
        str+="<form id='formProvider' data-providerName='"+providerName+"' method='POST' action='#'>";
        str+="<h1 class='w3-margin w3-jumbo' id='nameProvider'></h1>";
        str+="<p class='w3-margin' id='descriptionProvider'></p>";
        str+="<div class='w3-panel w3-pale-blue w3-leftbar w3-rightbar w3-border-blue'>";
        str+="<p>Path to execute</p>";
        str+="<p id='pathProvider'></p>";
        str+="</div>";
        str+="<h2 class='w3-margin w3-jumbo'>Configuration</h2>";
        str+="<ul class='w3-ul' id='listFields' class='w3-border'>";
        str+="</ul>";
        str+="<input type='submit' class='w3-btn w3-padding w3-teal' id='idValidateButton' value='Modifier'/>";
        str+="</form>";


        $("#providerContainer").append(str);
    }

    fillFormProvider(providerConfig)
    {
        //General attributes
        $("#nameProvider").html(providerConfig.Name);
        $("#descriptionProvider").html(providerConfig.Description);
        $("#pathProvider").html(providerConfig.Path);
        $("#listFields").html("");

        //Deal with all json
        let config = providerConfig.config;
        let formatConfig = providerConfig.entities;
        this.generateAllSubObjects("listFields", config, formatConfig);
    }

    generateAllSubObjects(id, config, formatConfig)
    {
        let str = "";
        str += this.generateConfigTreeString("Configuration", config, formatConfig, true, -1);//true and -1 = comportement normal
        $("#"+id).append(str);
    }

    generateConfigTreeString(name, obj, objFormat, boolCreateHidden, displayIndex)
    {
        let treeString = "";

        if(boolCreateHidden)
        {
            if(Array.isArray(obj))
            {
                treeString += '<input type="hidden" name="array-in" value="'+name+'"/>';
            }
            else
            {
                treeString += '<input type="hidden" name="separation-in" value="'+name+'"/>';
            }
        }


        Object.keys(obj).forEach((key)=>
        {
            let value = obj[key];
            let type = typeof(value);
            let format = objFormat[key];
/*
            console.log("Key: "+key);
            console.log(value);
            console.log(format);*/

            if(type === "object")
            {
                //If it's an element of array, format is slightly different
                if(!isNaN(key))
                {
                    format = objFormat[0];
                }

                let onClickCode = "toggleNextElement(this)";

                treeString += "<li class='w3-border'>";
                    treeString += "<div class='w3-button w3-border'  onclick='"+onClickCode+"'>";
                    if(displayIndex !== -1)
                    {
                        treeString += displayIndex;
                    }
                    else
                    {
                        treeString += key;
                    }
                    treeString +="<i class='fa fa-caret-down w3-hide w3-show' style='display:inline'></i>";
                    treeString +="<i class='fa fa-caret-up  w3-hide' style='display:inline'></i>";
                    treeString +="</div>";
                    treeString += "<ul class='w3-ul w3-border hide' style='display: none;'>";
                    //treeString += "<button class='w3-button w3-border' id='"+idDeleteButton+"' onclick='deleteElement(\""+idDeleteButton+"\")'><i class='fa fa-close' style='display:inline'></i></button>";
                    if(displayIndex !== -1)
                    {
                        treeString += this.generateConfigTreeString(displayIndex, value, format, true, -1);
                    }
                    else
                    {
                        treeString += this.generateConfigTreeString(key, value, format, true, -1);
                    }
                    if(Array.isArray(value))
                    {
                        treeString += this.generateAddingButton(formatIndex);
                    }
                    treeString += "</ul>";
                treeString += "</li>";
            }
            //It's a simple attribute
            else
            {
                //Is the field required?
                let required = false;
                if(format.required !== undefined && format.required)
                {
                    required = true;
                }

                //Generate id of simple attribute
                let idSimpleAttribute = name + "_" + key;

                if(type === "boolean")
                {
                    let onchange="$(this).next().val(this.checked);";

                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-check fromFormProvider' onchange='"+onchange+"' id='" + idSimpleAttribute + "' type='checkbox' "+(value ? "checked":"")+"/>";
                    treeString += "<input type='hidden' name='"+key+"' value='"+value+"'/>";
                    treeString += "</li>";

                }
                else if(type === "number")
                {

                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3-col m4 l3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' name='"+key+"' id='" + idSimpleAttribute + "' type='number' value='"+value+"'"+ (required ? "required":"");

                    //Create the regular expression for the field
                    let valuesRegExp = "";
                    if(format.values !== undefined)
                    {
                        format.values.forEach((elem)=>
                        {
                            valuesRegExp += elem+"|";
                        });
                        valuesRegExp = valuesRegExp.substring(0, valuesRegExp.length - 1);
                    }
                    if(valuesRegExp !== "")
                    {
                        treeString += " pattern = '"+valuesRegExp+"' title='La valeur doit être dans la liste suivante: "+format.values.toString()+"'";
                    }

                    treeString += "/>";
                    treeString += "</li>";
                }
                else if(type === "string")
                {
                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3-col m4 l3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-input w3-border w3-col m4 l3 fromFormProvider' name='"+key+"' id='" + idSimpleAttribute + "' type='text' value='"+value+"'"+ (required ? "required":"");

                    //Create the regular expression for the field
                    let valuesRegExp = "";
                    if(format.values !== undefined)
                    {
                        format.values.forEach((elem)=>
                        {
                            valuesRegExp += elem+"|";
                        });
                        valuesRegExp = valuesRegExp.substring(0, valuesRegExp.length - 1);
                    }
                    if(valuesRegExp !== "")
                    {
                        treeString += " pattern = '"+valuesRegExp+"' title='La valeur doit être dans la liste suivante: "+format.values.toString()+"'";
                    }

                    treeString += "/>";
                    treeString += "</li>";
                }
            }

            //We add a new format to the list if different from the las (prevent elements of array...)
            if(listsOfFormats === 0 ||(listsOfFormats !==0 && listsOfFormats[listsOfFormats.length-1] !== format))
            {
                listsOfFormats.push(format);
                formatIndex++;
            }
        });

        if(boolCreateHidden)
        {
            if(Array.isArray(obj))
            {
                treeString += '<input type="hidden" name="array-out" value="'+name+'"/>';
            }
            else
            {
                treeString += '<input type="hidden" name="separation-out" value="'+name+'"/>';
            }
        }

        return treeString;
    }

    generateAddingButton(formatIndex)
    {
        let str= "";
        str += "<li class='w3-border'>";
            str += "<div class='w3-button w3-border' onclick='addElementToUl($(this), "+formatIndex+")'>+</div>";
        str += "</li>";
        return str;
    }

    handleSubmission(providerConfig)
    {
        //Handle errors
        let submitButton = $("#idValidateButton");
        submitButton.click(()=>
        {
            let myForm = submitButton.parent();
            let inputElements = myForm.find("input");
            let badElements = [];
            $.each(inputElements, (index, elem)=>
            {
                if(!elem.checkValidity())
                {
                    badElements.push(elem);
                }
            });

            if(badElements.length !== 0)
            {
                badElements.forEach((elem)=>
                {
                    let ancestors = $(elem).parents(".hide");
                    $.each(ancestors, (index, element)=>
                        {
                            showElement($(element));
                        }
                    );
                });
            }
        });

        //Handle classic submission
        $("#formProvider").submit( (evt) =>
        {
            console.log("coucou");
            evt.preventDefault();
            let myForm = $(evt.target);
            let formArray = myForm.serializeArray();
            console.log(formArray);

            let newJson = this.parseFormArray(formArray, providerConfig);

            console.log(newJson);
            console.log(JSON.stringify(newJson));
            return false;
        });
    }

    parseFormArray(formArray, providerConfig)
    {
        let newConfig = providerConfig;
        let jsonString = "{";

        let NUMBER = false;
        let STRING = false;
        let BOOLEAN = false;

        formArray.forEach(
            (elem)=>
            {
                let name = elem.name;
                let value = elem.value;
                if(name === "separation-in")
                {
                    if(!isNaN(value))
                    {
                        jsonString += "{";
                    }
                    else
                    {
                        jsonString += "\""+value+"\":{";
                    }
                }
                else if(name === "separation-out")
                {
                    jsonString += "},";
                }
                else if(name === "array-in")
                {
                    jsonString += "\""+value+"\":[";
                }
                else if(name === "array-out")
                {
                    jsonString += "],";
                }
                else if(name === "type")
                {
                    NUMBER = (value === "NUMBER");
                    STRING = (value === "STRING");
                    BOOLEAN = (value === "BOOLEAN");
                }
                else
                {
                    if(!isNaN(name))
                    {
                        jsonString += value+"\",";
                    }
                    else
                    {
                        if(NUMBER || BOOLEAN)
                        {
                            jsonString += "\""+name+"\":"+value+",";
                        }
                        else
                        {
                            jsonString += "\""+name+"\":\""+value+"\",";
                        }
                    }
                }
            }
        );

        jsonString += "}";

        //Traitement contre bad commas
        jsonString = jsonString.replace(/,}/g,"}");
        jsonString = jsonString.replace(/,]/g,"]");

        newConfig.config = JSON.parse(jsonString).Configuration;

        return newConfig;
    }
}



let addElementToUl = function(button, formatIndex)
{
    let format = listsOfFormats[formatIndex];

    //Compute good index
    let allIndexes = [];
    $.each(button.parent().parent().children(), (index, elem)=>
    {
        elem = $(elem);
        if(elem.is("li"))
        {
            $.each(elem.children(), (index2, elem2)=>
            {
                elem2 = $(elem2);
                if(elem2.is("ul"))
                {
                    allIndexes.push(parseInt(elem2.find(":first-child").val()));
                }
            });
        }
    });

    console.log(allIndexes);
    let newIndex;
    if(allIndexes.length === 0)
    {
        newIndex = 0;
    }
    else
    {
        newIndex = 1 + Math.max.apply(null, allIndexes);
    }

    let obj = generateEmptyObjFromFormat(format, newIndex);

    console.log(obj);

    let str= "";
    str += Editor.generateConfigTreeString(newIndex, obj, format, false, newIndex);

    $(str).insertBefore(button.parent().prev());
};



let generateEmptyObjFromFormat = function(format, index)
{
    let emptyObj = {};
    Object.keys(format).forEach((key)=>
    {
        let value = format[key];

        if(typeof value === "object")
        {
            //It's a simple attribute
            if(value.type !== undefined && value.required !== undefined)
            {
                if(value.type === "BOOLEAN")
                {
                    emptyObj[key] = false;
                }
                else
                {
                    emptyObj[key] = "";
                }
            }
            else
            {
                emptyObj[key] = generateEmptyObjFromFormat(value, index);
            }
        }
    });
    return emptyObj;
};

let toggleNextElement = function(element)
{
    let nextElement = $(element).next();
    if(nextElement.hasClass("show"))
    {
        nextElement.slideUp();
        nextElement.removeClass("show");
        nextElement.addClass("hide");
    }
    else if(nextElement.hasClass("hide"))
    {
        nextElement.slideDown();
        nextElement.removeClass("hide");
        nextElement.addClass("show");
    }
};

let showElement= function(element)
{
    if(!element.hasClass("show"))
    {
        element.slideDown();
        element.removeClass("hide");
        element.addClass("show");
    }
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

                    let idDeleteButton = idUlAttribute+"_deleteButton";

                    let list = $("<li></li>")
                        .append("<button class='w3-button w3-border' onclick='toggleShowHide(\""+idUlAttribute+"\")'>"+index+"" +
                            "<i class='fa fa-caret-down w3-hide w3-show' style='display:inline'></i>" +
                            "<i class='fa fa-caret-up  w3-hide' style='display:inline'></i>" +
                            "</button>" +
                            "<button class='w3-button w3-border' " +
                            "id='"+idDeleteButton+"' " +
                            "onclick='deleteElement(\""+idDeleteButton+"\")'>" +
                            "<i class='fa fa-close' style='display:inline'></i></button>")
                        .append("<ul class='w3-ul w3-border w3-hide' id='"+idUlAttribute+"'></ul>");

                    list.insertBefore(myAddingButton.parent());
                    addElementToArray(idAddingButton, formatToAdd[key], idUlAttribute);
                }
            }
        }
    });
};

let deleteElement = function(idDeleteButton)
{
    console.log("deleteElement("+idDeleteButton+")");
    //Delete effectively
    let grandFather = $("#"+idDeleteButton).parent().parent();
    console.log("grandFather");
    console.log(grandFather);
    //$("#"+idDeleteButton).parent().remove();

    //Get index of the child to delete
    let indexChildToDelete = $("#"+idDeleteButton).parent().children().first().text();
    console.log("indexChildToDelete");
    console.log(indexChildToDelete);

    //Update num in children
    grandFather.children().forEach(
        (li, index) =>
        {
            //It's an element of array and it's after the child
            if(li.children().length === 2 && index > indexChildToDelete)
            {
                //grandFather[index].children().first().
            }
        }
    );

};