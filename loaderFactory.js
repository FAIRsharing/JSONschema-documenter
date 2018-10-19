angular.module('generatorApp').factory('SchemaLoader',
    function($q, $http) {

        function SchemaLoader(){

            let specLoader = this;
            specLoader.raw_schemas = {}; // the raw schemas as loaded from given URL
            specLoader.main_schema = {}; // the main schema
            specLoader.sub_schemas = {}; // sub schemas once processed (with added variables)
            specLoader.schema_errors = []; // loading errors
            specLoader.ignored_keys = ["@type", "@id", "@context"];
            let possible_references = ["allOf", "oneOf", "anyOf"];

            // Method to load a schema from given URL (recursive)
            specLoader.load_schema = function(fileURL, nesting_level, referencingParent){
                let deferred = $q.defer();
                let specName = fileURL.split('/').slice(-1)[0].replace('.json#', '').replace('.json', '');

                if (!specLoader.sub_schemas.hasOwnProperty(specName)){

                    // The http request as a deferred promise
                    $http.get(fileURL).then(function(response) {
                        deferred.resolve(response); // Resolve the response once triggered
                        specLoader.raw_schemas[specName] = angular.copy(response.data); // add the raw response before processing
                        specLoader.sub_schemas[specName] = response.data;

                        // sub schemas
                        if (nesting_level > 0){
                            if (referencingParent !== null){
                                let referenceNames = referencingParent.replace(':', "@$£").split('@$£');
                                let parentName = referenceNames[0].replace(/_/g, " ");
                                if (!specLoader.sub_schemas[specName].hasOwnProperty('referencedFrom')){
                                    specLoader.sub_schemas[specName]['referencedFrom'] = {};
                                }
                                if (!specLoader.sub_schemas[specName]['referencedFrom'].hasOwnProperty(parentName)){
                                    specLoader.sub_schemas[specName]['referencedFrom'][parentName] = [];
                                }
                                specLoader.sub_schemas[specName]['referencedFrom'][parentName].push(referenceNames[1])
                            }
                        }

                        // search for sub schemas that need to be loaded
                        searchSubSpecs(response.data, response.data.properties, specName, nesting_level, 'properties');

                        if (response.data.hasOwnProperty('definitions')){
                            searchSubSpecs(response.data, response.data['definitions'], specName, nesting_level, 'definitions');
                        }
                    },
                    // Error handling
                    function(error){
                        return deferred.reject(error);
                    });
                }

                return deferred.promise;
            };

            // Method to look for sub schemas (located into nested $ref)
            var searchSubSpecs = function(schema, properties, parentName, nested_level, processingType){

                // set base URL based on id attribute
                let baseURL = schema.hasOwnProperty('id') ? schema['id'] : '';
                baseURL = baseURL.substr(0, baseURL.lastIndexOf('/'));

                // For each property
                for (let propertyName in properties){

                    // Verify that it exists and that it's not ignored
                    if (properties.hasOwnProperty(propertyName) && specLoader.ignored_keys.indexOf(propertyName) === -1){
                        let propertyValues = properties[propertyName];
                        let referenceFullName = parentName + ':' + propertyName;

                        // If there is no type or type is array or object
                        if (!propertyValues.hasOwnProperty('type') ||
                            (propertyValues.hasOwnProperty('type')
                                && (propertyValues['type'] ==='object' || propertyValues['type'] ==='array')) ){

                            specLoader.process_reference(propertyValues, referenceFullName, baseURL, nested_level, processingType, '');

                            // type is not an array
                            if (propertyValues['type'] !== 'array'){
                                specLoader.searchDeeper(propertyValues, referenceFullName, baseURL, nested_level, processingType, '');
                            }

                            // type is an array so things will be located into ['items']
                            else if (propertyValues['type'] === 'array' && propertyValues.hasOwnProperty('items')){
                                // There is an available $ref at this level
                                specLoader.process_reference(propertyValues['items'], referenceFullName, baseURL, nested_level, processingType, 'items');
                                specLoader.searchDeeper(propertyValues['items'], referenceFullName, baseURL, nested_level, processingType, 'items');
                            }
                        }
                    }
                }
            };

            // Will search for anyOf, oneOf, allOf
            specLoader.searchDeeper = function(item, parentReference, baseURL, current_level, processingType, targetLocation){
                for (let index in possible_references){
                    let reference = possible_references[index];
                    let target = targetLocation !== '' ? targetLocation+'_'+reference : reference;
                    if (item.hasOwnProperty(reference)){
                        for (let sub_index in item[reference]){
                            if (item[reference].hasOwnProperty(sub_index)){
                                specLoader.process_reference(
                                    item[reference][sub_index],
                                    parentReference,
                                    baseURL,
                                    current_level,
                                    processingType,
                                    target
                                )
                            }

                        }
                    }
                }
            };

            // Will search for $ref and properties
            specLoader.process_reference = function(reference, parentReference, baseURL, current_level, processingType, targetLocation){

                if (reference.hasOwnProperty('$ref')){
                    if (reference['$ref'][0] !== '#'){
                        reference['referenceTo'] = reference['$ref'].replace("#", "").replace(".json", "");
                        specLoader.load_schema(baseURL+'/'+reference['$ref'], current_level+1, parentReference);
                    }
                    else{
                        // TODO split the string, get attributes after # and change '/' for '_'
                        reference['referenceTo'] = parentReference.split(':')[0] + '_definitions_'+ reference['$ref'].split('/').slice(-1)[0];
                    }
                }

                if (reference.hasOwnProperty('properties')){
                    specLoader.sub_schemas[parentReference] = {};
                    specLoader.raw_schemas[parentReference] = reference['properties'];
                    specLoader.sub_schemas[parentReference]['properties'] = reference['properties'];
                    let referenceNames = parentReference.replace(/_/g, " ").split(':');
                    specLoader.sub_schemas[parentReference]['title'] = parentReference.replace(/_/g, " ").replace(':', ', ') + ' field subschema';
                    specLoader.sub_schemas[parentReference]['id'] = baseURL + '/';
                    specLoader.sub_schemas[parentReference]['referencedFrom'] = {};
                    specLoader.sub_schemas[parentReference]['referencedFrom'][referenceNames[0]] = [referenceNames[1]];
                    reference['referenceTo'] = parentReference.replace(/:/g, "_");
                    specLoader.sub_schemas[parentReference]['$subset'] = true;

                    searchSubSpecs(
                        specLoader.sub_schemas[parentReference],
                        specLoader.sub_schemas[parentReference]['properties'],
                        parentReference,
                        current_level+1,
                        processingType
                    );

                }
            }
        }
        return SchemaLoader;
    }
);