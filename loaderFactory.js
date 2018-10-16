angular.module('generatorApp').factory('SchemaLoader',
    function($q, $http) {

        function SchemaLoader(){

            let specLoader = this;

            // temp array to store the loaded specs
            this.loaded_specs = {};
            this.main_spec = {};
            this.references = {};
            this.errors = [];

            // async load function
            this.load = function(urlToFile, currentLvl, parent) {
                let deferred = $q.defer();

                // PARENT ITEM
                if (currentLvl === 0){
                    $http.get(urlToFile).then(function(response) {
                        deferred.resolve(response);
                        specLoader.main_spec = response.data;
                        seekSubSpecs(response, currentLvl);
                    },
                    function(error){
                        let localError = {"schema404": "main schema couldn't be loaded, " +
                            "verify your URL (provided URL is "+urlToFile+")"};
                        console.log(localError);
                        specLoader.errors.push(localError);
                        return deferred.reject(localError);
                    })
                }

                // SUB ITEMS
                // Beurk ! Make something for this piece of code !
                 else{
                    if (!specLoader.loaded_specs.hasOwnProperty(parent.schemaRef)){
                        $http.get(urlToFile).then(function(response) {
                            specLoader.loaded_specs[parent.schemaRef] = {};
                            deferred.resolve(response);
                            specLoader.loaded_specs[parent.schemaRef] = response.data;

                            if (!specLoader.loaded_specs[parent.schemaRef].hasOwnProperty('referencedFrom')){
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'] = {};
                                if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = [];
                                    if(specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].indexOf(parent.parentField) === -1){
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                }
                                else{
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                            }
                            else{
                                if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = [];
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                                else{
                                    if(specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].indexOf(parent.parentField) === -1){
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                }
                            }

                            seekSubSpecs(response, currentLvl);
                        },
                        function(error){
                            let local_error = {"schema404": "a sub schema wasn't loaded, verify your URL (provided URL is "+ urlToFile +")"};
                            specLoader.errors.push(local_error);
                            return ;
                        })
                    }
                    else{
                        if (!specLoader.loaded_specs[parent.schemaRef].hasOwnProperty('referencedFrom')){
                            specLoader.loaded_specs[parent.schemaRef]['referencedFrom'] = {};
                            if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = [];
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                            }
                            else{
                                if(specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].indexOf(parent.parentField) === -1){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                            }
                        }
                        else{
                            if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = [];
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                            }
                            else{
                                if(specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].indexOf(parent.parentField) === -1){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                            }
                        }

                    }
                }

                // Return the promise
                return deferred.promise;


            };

            var seekSubSpecs = function(response, currentLvl){
                let properties = response.data.properties;
                for (let fieldName in properties){

                    let field = properties[fieldName];
                    let baseURL = response.data.hasOwnProperty('id') ? response.data['id'] : '';
                    baseURL = baseURL.substr(0, baseURL.lastIndexOf('/'));

                    let object_found = false;

                    if (field.hasOwnProperty('items')){
                        if (field['items'].hasOwnProperty('$ref')){
                            object_found = true;
                            let path = loadSubSpec(field['items']['$ref'], baseURL);
                            if (path.load === true){
                                let parentDict = {
                                    'parentName':response.data.title,
                                    'parentField': fieldName,
                                    'schemaRef':path.pathName,
                                };
                                specLoader.load(path.fullPath, currentLvl+1, parentDict);
                            }
                            else{
                                field['items']['referencing'] = buildProps(path.lookFor, response.data);
                            }

                        }
                        else if (field['items'].hasOwnProperty('oneOf')){
                            object_found = true;
                            for (let item in field['items']['oneOf']){
                                if (field['items']['oneOf'][item].hasOwnProperty('$ref')){
                                    let path = loadSubSpec(field['items']['oneOf'][item]['$ref'], baseURL);
                                    if (path.load === true){
                                        let parentDict = {
                                            'parentName':response.data.title,
                                            'parentField': fieldName,
                                            'schemaRef':path.pathName
                                        };
                                        specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                    }
                                    else{
                                        field['items']['oneOf'][item]['referencing'] = buildProps(path.lookFor, response.data);
                                    }
                                }
                            }
                        }
                        else if  (field['items'].hasOwnProperty('anyOf')){
                            object_found = true;
                            for (let item in field['items']['anyOf']){
                                if (field['items']['anyOf'][item].hasOwnProperty('$ref')){
                                    let path = loadSubSpec(field['items']['anyOf'][item]['$ref'], baseURL);
                                    if (path.load === true){
                                        let parentDict = {
                                            'parentName':response.data.title,
                                            'parentField': fieldName,
                                            'schemaRef':path.pathName
                                        };
                                        specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                    }
                                    else{
                                        field['items']['anyOf'][item]['referencing'] = buildProps(path.lookFor, response.data);
                                    }
                                }
                            }
                        }
                        else if  (field['items'].hasOwnProperty('allOf')){
                            object_found = true;
                            for (let item in field['items']['allOf']){
                                if (field['items']['allOf'][item].hasOwnProperty('$ref')){
                                    let path = loadSubSpec(field['items']['allOf'][item]['$ref'], baseURL);
                                    if (path.load === true){
                                        let parentDict = {
                                            'parentName':response.data.title,
                                            'parentField': fieldName,
                                            'schemaRef':path.pathName
                                        };
                                        specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                    }
                                    else{
                                        field['items']['allOf'][item]['referencing'] = buildProps(path.lookFor, response.data);
                                    }
                                }
                            }
                        }

                        //
                        else if (field['items'].hasOwnProperty('type')
                            && object_found === false
                            && field["items"]["type"] !== 'string'
                            && field["items"]["type"] !== 'integer'
                            && field["items"]["type"] !== 'boolean'
                            && field["items"]["type"] !== 'number') {
                            object_found = true;
                            let newSchemaName = fieldName + "_schema";
                            if (!specLoader.hasOwnProperty(newSchemaName)){
                                specLoader.loaded_specs[newSchemaName] = field['items'];
                                specLoader.loaded_specs[newSchemaName]['title'] = fieldName;
                                if (!specLoader.loaded_specs[newSchemaName].hasOwnProperty('referencedFrom')){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'] = {};
                                }
                                if (!specLoader.loaded_specs[newSchemaName]['referencedFrom'].hasOwnProperty(response.data.title)){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title] = []
                                }

                                if (specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].indexOf(fieldName) === -1){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].push(fieldName);
                                }

                            }
                            else{
                                if (!specLoader.loaded_specs[newSchemaName].hasOwnProperty('referencedFrom')){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'] = {};
                                }
                                if (!specLoader.loaded_specs[newSchemaName]['referencedFrom'].hasOwnProperty(response.data.title)){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title] = []
                                }

                                if (specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].indexOf(fieldName) === -1){
                                    specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].push(fieldName);
                                }
                            }

                            let data = {
                                "data":{
                                    "properties": field["items"]["properties"],
                                    "id": baseURL+'/...'
                                }
                            };
                            seekSubSpecs(data, currentLvl+1);


                        }
                    }

                    else if (field.hasOwnProperty('$ref')){
                        object_found = true;
                        let path = loadSubSpec(field['$ref'], baseURL);
                        if (path.load === true){
                            let parentDict = {
                                'parentName':response.data.title,
                                'parentField': fieldName,
                                'schemaRef':path.pathName
                            };
                            specLoader.load(path.fullPath, currentLvl+1, parentDict);
                        }
                        else{
                            field['$ref']['referencing'] = buildProps(path.lookFor, response.data);
                        }
                    }

                    else if (field.hasOwnProperty('oneOf')){
                        object_found = true;
                        for (let item in field['oneOf']){
                            if (field['oneOf'][item].hasOwnProperty('$ref')){
                                let path = loadSubSpec(field['oneOf'][item]['$ref'], baseURL);
                                if (path.load === true){
                                    let parentDict = {
                                        'parentName':response.data.title,
                                        'parentField': fieldName,
                                        'schemaRef':path.pathName
                                    };
                                    specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                }
                                else{
                                    field['oneOf'][item]['referencing'] = {};
                                    field['oneOf'][item]['referencing'][path.lookFor[1]] = buildProps(path.lookFor, response.data)[item];
                                }
                            }
                        }
                    }

                    else if (field.hasOwnProperty('anyOf')){
                        object_found = true;
                        for (let item in field['anyOf']){
                            if (field['anyOf'][item].hasOwnProperty('$ref')){
                                let path = loadSubSpec(field['anyOf'][item]['$ref'], baseURL);
                                if (path.load === true){
                                    let parentDict = {
                                        'parentName':response.data.title,
                                        'parentField': fieldName,
                                        'schemaRef':path.pathName
                                    };
                                    specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                }
                                else{
                                    field['anyOf'][item]['referencing'] = {};
                                    field['anyOf'][item]['referencing'][path.lookFor[1]] = buildProps(path.lookFor, response.data)[item];
                                }
                            }
                        }
                    }

                    else if (field.hasOwnProperty('allOf')){
                        object_found = true;
                        for (let item in field['allOf']){
                            if (field['allOf'][item].hasOwnProperty('$ref')){
                                let path = loadSubSpec(field['allOf'][item]['$ref'], baseURL);
                                if (path.load === true){
                                    let parentDict = {
                                        'parentName':response.data.title,
                                        'parentField': fieldName,
                                        'schemaRef':path.pathName
                                    };
                                    specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                }
                                else{
                                    field['allOf'][item]['referencing'] = {};
                                    field['allOf'][item]['referencing'][path.lookFor[1]] = buildProps(path.lookFor, response.data)[item];
                                }
                            }
                        }
                    }

                    else if (object_found === false
                             && field.hasOwnProperty('type')
                             && field["type"] === 'object'){
                        let newSchemaName = fieldName + "_schema";

                        if (!specLoader.hasOwnProperty(newSchemaName)){
                            specLoader.loaded_specs[newSchemaName] = field;
                            specLoader.loaded_specs[newSchemaName]['title'] = fieldName;
                            if (!specLoader.loaded_specs[newSchemaName].hasOwnProperty('referencedFrom')){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'] = {};
                            }
                            if (!specLoader.loaded_specs[newSchemaName]['referencedFrom'].hasOwnProperty(response.data.title)){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title] = []
                            }

                            if (specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].indexOf(fieldName) === -1){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].push(fieldName);
                            }

                        }
                        else {
                            if (!specLoader.loaded_specs[newSchemaName].hasOwnProperty('referencedFrom')){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'] = {};
                            }
                            if (!specLoader.loaded_specs[newSchemaName]['referencedFrom'].hasOwnProperty(response.data.title)){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title] = []
                            }

                            if (specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].indexOf(fieldName) === -1){
                                specLoader.loaded_specs[newSchemaName]['referencedFrom'][response.data.title].push(fieldName);
                            }
                        }

                        let data = {
                            "data": {
                                "properties": field["properties"],
                                "id": baseURL + '/...',
                                "title": fieldName
                            }
                        };
                        seekSubSpecs(data, currentLvl+1);
                    }


                }
            };

            let loadSubSpec = function(subSpecPath, baseURL){

                if (baseURL === ''){
                    baseURL = "schemas"
                }

                let pathArray = subSpecPath.split("#");
                let subSpecFullPath = pathArray[0];
                let targetProperty = pathArray[1];
                subSpecFullPath = subSpecFullPath.replace(".json", '');
                let composedURL = baseURL + '/' + subSpecPath;

                if (pathArray[0]!==""){
                    return {
                        "load": true,
                        "fullPath": composedURL,
                        "pathName": subSpecFullPath
                    };
                }

                if (pathArray[1]!==""){

                    if (targetProperty.substr(targetProperty.length-1) === '/'){
                        targetProperty = targetProperty.substring(0, targetProperty.length - 1);
                    }
                    let targetPath = targetProperty.split("/");
                    targetPath.splice(0, 1);

                    return {
                        "load": false,
                        "lookFor": targetPath
                    };
                }
            };

            let buildProps = function(pathArray, schema){
                let path = angular.copy(pathArray);
                let props;
                if (schema.hasOwnProperty(path[0])){
                    props = schema[pathArray[0]];
                    path.splice(0,1);
                    if (path.length>1){
                        props = buildProps(path, props);
                    }
                }
                return props;
            }






            /** ************ *************************************************************************** *********** **/
            /** ************                        REFACTORING HERE                                     *********** **/
            /** ************ *************************************************************************** *********** **/
            specLoader.raw_schemas = {}; // the raw schemas as loaded from given URL
            specLoader.main_schema = {}; // the main schema
            specLoader.sub_schemas = {}; // sub schemas once processed (with added variables)
            specLoader.schema_errors = []; // loading errors
            specLoader.ignored_keys = ["@type", "@id", "@context"];
            specLoader.ignored_types = ["string", "number", "null", "integer", "boolean"];

            let possible_references = ["allOf", "oneOf", "anyOf"];


            // The method to load a schema from given URL (recursive)
            specLoader.load_schema = function(fileURL, nesting_level, referencingParent){
                let deferred = $q.defer();

                // The http request as a deferred promise
                $http.get(fileURL).then(function(response) {

                    // Resolve the response once triggered
                    deferred.resolve(response);

                    // search for sub schemas that need to be loaded
                    searchSubSpecs(response.data, nesting_level);
                },
                // Error handling
                function(error){
                    console.log(error);
                    return deferred.reject(error);
                });
                return deferred.promise;
            };

            // Method to look for sub schemas (located into nested $ref)
            let searchSubSpecs = function(schema, nested_level){

                // if schema has ID then ID is the base URL, else it's empty
                let baseURL = schema.hasOwnProperty('id') ? schema['id'] : '';
                let properties = schema.properties;

                // For each property
                for (let propertyName in properties){

                    // Verify that it exists and that it's not ignored
                    if (properties.hasOwnProperty(propertyName) && specLoader.ignored_keys.indexOf(propertyName) === -1){
                        let propertyValues = properties[propertyName];

                        // If there is no type or type is array or object
                        if (!propertyValues.hasOwnProperty('type') ||
                            (propertyValues.hasOwnProperty('type') && (propertyValues['type'] ==='object' || propertyValues['type'] ==='array')) ){


                            // First, is there an available $ref at this level
                            if (propertyValues.hasOwnProperty('$ref')){
                                console.log(propertyName)
                            }

                            // There's no available $ref at this level, we will look for them in other structures
                            else{

                                // type is not an array
                                let object_found = false;
                                if (propertyValues['type'] !== 'array'){
                                    for (let index in possible_references){
                                        let reference = possible_references[index];

                                        if (propertyValues.hasOwnProperty(reference)){
                                            object_found = true;
                                            console.log(propertyName);
                                        }

                                        if (!object_found){
                                            console.log("Direct object for "+propertyName)
                                        }
                                    }
                                }

                                // type is an array and things will be located into ['items']
                                else if (propertyValues['type'] === 'array'){

                                    // There is an available $ref at this level
                                    if (propertyValues['items'].hasOwnProperty('$ref')){
                                        console.log(propertyName)
                                    }

                                    // There is no $ref at this level, look into other structures
                                    else{
                                        for (let index in possible_references){
                                            let reference = possible_references[index];

                                            if (propertyValues['items'].hasOwnProperty(reference)){
                                                console.log(propertyName);
                                            }
                                        }
                                    }


                                }

                            }
                        }

                        /*
                        if (propertyValues.hasOwnProperty('$ref')){
                            console.log("REFERENCE HERE "+propertyName)
                        }

                        else{
                            for (let index in possible_references){
                                let reference = possible_references[index];
                                if (propertyValues.hasOwnProperty(reference)) {
                                    console.log(propertyName + " may have ref with "+reference)
                                }
                                else if (propertyValues.hasOwnProperty('items') && propertyValues['items'].hasOwnProperty(reference)){
                                    console.log(propertyName + " may have ref with "+reference + " through items")
                                }
                            }
                        }*/
                    }
                }
            }
        }
        return SchemaLoader;
    }
);