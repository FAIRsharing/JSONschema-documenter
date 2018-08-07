angular.module('generatorApp').factory('SchemaLoader',
    function($q, $http) {

        function SchemaLoader(){

            let specLoader = this;

            // temp array to store the loaded specs
            this.loaded_specs = {};
            this.main_spec = {};
            this.references = {};

            // async load function
            this.load = function(urlToFile, currentLvl, parent) {
                let deferred = $q.defer();

                if (currentLvl === 0){
                    $http.get(urlToFile).then(function(response) {
                        deferred.resolve(response);
                        specLoader.main_spec = response.data;
                        seekSubSpecs(response, currentLvl);
                    })
                }

                // Beurk ! Make something for this piece of code !
                 else{
                    if(urlToFile!=='https://w3id.org/dats/schema/#/definitions/position'){
                        if (!specLoader.loaded_specs.hasOwnProperty(parent.schemaRef)){
                            specLoader.loaded_specs[parent.schemaRef] = {};
                            $http.get(urlToFile).then(function(response) {
                                deferred.resolve(response);
                                if (!specLoader.loaded_specs[parent.schemaRef].hasOwnProperty('referencedFrom')){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'] = {};
                                    if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = []
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                    else{
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                }
                                else{
                                    if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = []
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                    else{
                                        specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                    }
                                }

                                specLoader.loaded_specs[parent.schemaRef] = response.data;
                                seekSubSpecs(response, currentLvl);
                            })
                        }
                        else{
                            if (!specLoader.loaded_specs[parent.schemaRef].hasOwnProperty('referencedFrom')){
                                specLoader.loaded_specs[parent.schemaRef]['referencedFrom'] = {};
                                if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = []
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                                else{
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                            }
                            else{
                                if (!specLoader.loaded_specs[parent.schemaRef]['referencedFrom'].hasOwnProperty(parent.parentName)){
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName] = []
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                                else{
                                    specLoader.loaded_specs[parent.schemaRef]['referencedFrom'][parent.parentName].push(parent.parentField);
                                }
                            }

                        }
                    }
                }

                // Return the promise
                return deferred.promise;

            };

            let seekSubSpecs = function(response, currentLvl){
                let properties = response.data.properties;
                for (let fieldName in properties){

                    let field = properties[fieldName];
                    let baseURL = response.data.hasOwnProperty('id') ? response.data['id'] : '';
                    baseURL = baseURL.substr(0, baseURL.lastIndexOf('/'));

                    if (field.hasOwnProperty('items')){
                        if (field['items'].hasOwnProperty('$ref')){
                            let path = loadSubSpec(field['items']['$ref'], baseURL);
                            if (path){
                                let parentDict = {
                                    'parentName':response.data.title,
                                    'parentField': fieldName,
                                    'schemaRef':path.pathName,
                                };
                                specLoader.load(path.fullPath, currentLvl+1, parentDict);
                            }

                        }
                        if (field['items'].hasOwnProperty('oneOf')){
                            for (let item in field['items']['oneOf']){
                                if (field['items']['oneOf'][item].hasOwnProperty('$ref')){
                                    let path = loadSubSpec(field['items']['oneOf'][item]['$ref'], baseURL);
                                    if (path){
                                        let parentDict = {
                                            'parentName':response.data.title,
                                            'parentField': fieldName,
                                            'schemaRef':path.pathName
                                        };
                                        specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                    }
                                }
                            }
                        }
                        if (field['items'].hasOwnProperty('anyOf')){
                            for (let item in field['items']['anyOf']){
                                if (field['items']['anyOf'][item].hasOwnProperty('$ref')){
                                    let path = loadSubSpec(field['items']['anyOf'][item]['$ref'], baseURL);
                                    if (path){
                                        let parentDict = {
                                            'parentName':response.data.title,
                                            'parentField': fieldName,
                                            'schemaRef':path.pathName
                                        };
                                        specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                    }
                                }
                            }
                        }
                    }
                    if (field.hasOwnProperty('$ref')){
                        let path = loadSubSpec(field['$ref'], baseURL);
                        if (path){
                            let parentDict = {
                                'parentName':response.data.title,
                                'parentField': fieldName,
                                'schemaRef':path.pathName
                            };
                            specLoader.load(path.fullPath, currentLvl+1, parentDict);
                        }
                    }
                    if (field.hasOwnProperty('oneOf')){
                        for (let item in field['oneOf']){
                            if (field['oneOf'][item].hasOwnProperty('$ref')){
                                let path = loadSubSpec(field['oneOf'][item]['$ref'], baseURL);
                                if (path){
                                    let parentDict = {
                                        'parentName':response.data.title,
                                        'parentField': fieldName,
                                        'schemaRef':path.pathName
                                    };
                                    specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                }
                            }
                        }
                    }
                    if (field.hasOwnProperty('anyOf')){
                        for (let item in field['anyOf']){
                            if (field['anyOf'][item].hasOwnProperty('$ref')){
                                let path = loadSubSpec(field['anyOf'][item]['$ref'], baseURL);
                                if (path){
                                    let parentDict = {
                                        'parentName':response.data.title,
                                        'parentField': fieldName,
                                        'schemaRef':path.pathName
                                    };
                                    specLoader.load(path.fullPath, currentLvl+1, parentDict);
                                }
                            }
                        }
                    }

                }
            };


            let loadSubSpec = function(subSpecPath, baseURL){
                if (subSpecPath!=='https://w3id.org/dats/schema/#/definitions/position'){
                    let subSpecSubPath = subSpecPath.replace('#', '');
                    subSpecSubPath = subSpecSubPath.replace(".json", '');
                    let composedURL = baseURL + '/' + subSpecPath;
                    return {
                        "fullPath": composedURL,
                        "pathName": subSpecSubPath
                    };
                }
                else{
                    return false;
                }
            };

        }

        return SchemaLoader;
    }
);