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
        str += "<select class='w3-select w3-border w3-light-grey' name='chooseProvider' id='chooseProvider' style='margin-bottom:20px;'>";
            str += "<option value='' disabled selected>Choisissez votre provider</option>";
            this.json.forEach(
                (providerConfig)=>
                {
                    str += "<option value='"+providerConfig.Name+"'>"+providerConfig.Name+"</option>";
                }
            );
        str += "</select>";

        //Place the selector and the options
        $("#"+this.id).append(str);



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
        str+="<form id='formProvider' data-providerName='"+providerName+"' method='POST' action='#' style='padding:3%;'>";
        str+="<h1 class='w3-margin w3-jumbo' id='nameProvider'></h1>";
        str+="<p class='w3-margin' id='descriptionProvider'></p>";
        str+="<div class='w3-panel w3-pale-blue w3-leftbar w3-rightbar w3-border-blue'>";
        str+="<p>Path to execute</p>";
        str+="<p id='pathProvider'></p>";
        str+="</div>";
        str+="<h2 class='w3-margin w3-jumbo'>Configuration</h2>";
        str+="<ul class='w3-ul' id='listFields' class='w3-border'>";
        str+="</ul>";
        str+="<input type='submit' class='w3-btn w3-padding w3-teal' id='idValidateButton' value='Modifier' style='margin:auto;width:100px;'/>";
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

            if(type === "object")
            {
                //If it's an element of array, format is slightly different
                let brotherDistance = 1;

                if(!isNaN(key))
                {
                    format = objFormat[0];
                    brotherDistance++;
                }

                let onClickCode = "toggleNextElement($(this), "+brotherDistance+")";

                treeString += "<li class=''>";

                    //Element Button
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

                    //Delete button if it's an element of array
                    if(!isNaN(key))
                    {
                        let onDeleteCode ="deleteElement($(this))";
                        treeString += "<div class='w3-button w3-border w3-right'  onclick='"+onDeleteCode+"'>";
                        treeString +="<i class='fa fa-close' style='display:inline'></i>";
                        treeString +="</div>"
                    }

                    treeString += "<ul class='w3-ul w3-border w3-leftbar hide' style='display: none;'>";
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
                let deleteButtonSimpleElement = "";
                if(!isNaN(key))
                {
                    format = objFormat[0];
                    deleteButtonSimpleElement += "<div class='w3-button w3-border w3-right' onclick='deleteElement($(this))'>";
                    deleteButtonSimpleElement += "<i class='fa fa-close' style='display:inline'></i>";
                    deleteButtonSimpleElement += "</div>"
                }

                //Is the field required?
                let required = false;
                if(format.required !== undefined && format.required)
                {
                    required = true;
                }

                //Generate id of simple attribute
                let idSimpleAttribute = name + "_" + key;

                //For adding button
                if(displayIndex !== -1)
                {
                    key = displayIndex;
                }

                if(type === "boolean")
                {
                    let onchange="$(this).next().val(this.checked);";

                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3-col s5 m4 l3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-check fromFormProvider' onchange='"+onchange+"' id='" + idSimpleAttribute + "' type='checkbox' "+(value ? "checked":"")+"/>";
                    treeString += "<input type='hidden' name='"+key+"' value='"+value+"'/>";
                    treeString += deleteButtonSimpleElement;
                    treeString += "</li>";

                }
                else if(type === "number")
                {
                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3-col s5 m4 l3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-input w3-border w3-col m4 l4 fromFormProvider' name='"+key+"' id='" + idSimpleAttribute + "' type='number' value='"+value+"'"+ (required ? "required":"");

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
                    treeString += deleteButtonSimpleElement;
                    treeString += "</li>";
                }
                else if(type === "string")
                {
                    //Generate the field
                    treeString += "<li class='w3-row w3-padding-large'>";
                    treeString += "<label class='w3-col s5 m4 l3'>" + key + "</label>";
                    treeString += "<input type='hidden' name='type' value='"+format.type+"'/>";
                    treeString += "<input class='w3-input w3-border w3-col m4 l4 fromFormProvider' name='"+key+"' id='" + idSimpleAttribute + "' type='text' value='"+value+"'"+ (required ? "required":"");

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
                    treeString += deleteButtonSimpleElement;
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
        str += "<li>";
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

                $("#alertSuccess").attr("style", "display:none;");
                $("#alertError").attr("style", "display:;");

            }
        });

        //Handle classic submission
        $("#formProvider").submit( (evt) =>
        {
            evt.preventDefault();
            let myForm = $(evt.target);
            let formArray = myForm.serializeArray();
            console.log(formArray);

            let newJson = this.parseFormArray(formArray, providerConfig);

            //Fusion providerConfigJSON with array of providerConfigs
            let indexProviderConfig = this.json.findIndex((elem)=> newJson.Name === elem.Name);
            this.json[indexProviderConfig] = newJson;

            $("#alertSuccess").attr("style", "display:;");
            $("#alertError").attr("style", "display:none;");
            //Animation when succeed!
            let speed = 750; // Durée de l'animation (en ms)
            $('html, body').animate( { scrollTop: 0 }, speed );

            console.log(this.json);
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
                        if(STRING)
                        {
                            jsonString += "\""+value+"\",";
                        }
                        else if(NUMBER || BOOLEAN)
                        {
                            jsonString += value+",";
                        }
                        else
                        {
                            jsonString += value+"\",";
                        }
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

        console.log(jsonString);

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
                //For list of objects
                if(elem2.is("ul"))
                {
                    allIndexes.push(parseInt(elem2.find(":first-child").val()));
                }
                //For list of simple attributes
                else if(elem2.is("label"))
                {
                    allIndexes.push(parseInt(elem2.text()));
                }
            });
        }
    });

    let newIndex;
    if(allIndexes.length === 0)
    {
        newIndex = 0;
    }
    else
    {
        newIndex = 1 + Math.max.apply(null, allIndexes);
    }


    let emptyObj = generateEmptyObjFromFormat(format, newIndex);

    let str= "";

    str += Editor.generateConfigTreeString(newIndex, emptyObj, format, false, newIndex);

    $(str).insertBefore(button.parent().prev());
};

let deleteElement = function(button)
{
    let idElement = button.prev().text();
    if(confirm("Etes vous sûr de supprimer l'élément "+idElement+" ?"))
    {
        button.parent().remove();
    }
};



let generateEmptyObjFromFormat = function(format, index)
{
    let emptyObj = {};
    if(Array.isArray(format))
    {
        emptyObj = [];
    }
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
                else if(value.type === "NUMBER")
                {
                    emptyObj[key] = 0;
                }
                else
                {
                    emptyObj[key] = "";
                }
            }
            else
            {
                if(Array.isArray(value))
                {
                    emptyObj[key] = [];
                    emptyObj[key].push(generateEmptyObjFromFormat(value[0], index));
                }
                else
                {
                    emptyObj[key] = generateEmptyObjFromFormat(value, index);
                }
            }
        }
        else
        {
            //format is already the good format
            if(format.type === "BOOLEAN")
            {
                emptyObj = false;
            }
            else if(format.type === "NUMBER")
            {
                emptyObj = 0;
            }
            else
            {
                emptyObj = "";
            }
        }
    });
    return emptyObj;
};

let toggleNextElement = function(element, distance)
{
    let nextElement = element;
    let i = 0;
    while(i < distance)
    {
        nextElement = nextElement.next();
        i++;
    }

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