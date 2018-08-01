(function(){

    var my_app = angular.module('generatorApp', ['ngRoute', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages']);

    my_app.controller('documenterController', ['$scope','$location','$http',
        function($scope, $location, $http) {
            let base_url = 'https://w3id.org/dats/schema/';
            let schema_file = getUrlFromUrl()["url"];

            let fetch_url = "";

            if (typeof schema_file !== 'undefined'){
                fetch_url = base_url + schema_file + '.json';
            }
            else{
                fetch_url = base_url+'study_schema.json';
            }


            var json_schema = this;
            json_schema.media_type = getUrlFromUrl()["output"];
            if(json_schema.media_type === undefined){
                json_schema.media_type = "table";
            }
            json_schema.loaded_specs = {};
            loadJSON(fetch_url, 0, 'none', null);

            function loadJSON(json_file, lvl, parent_field, parent_type){
                let spec_name = json_file.replace('schemas/', '').replace(".json", "");

                // When lvl = 0 it means we are processing the most upper spec
                if (lvl === 0){

                    $http.get(json_file)
                        .then(function(res){
                            $scope.main_spec = res.data;
                            json_schema.main_spec = res.data;
                            seek_subSpecs(json_schema.main_spec.properties, json_schema.main_spec['title']);
                        });


                    //json_schema.main_spec = parseJson(json_file);
                    //seek_subSpecs(json_schema.main_spec.properties, json_schema.main_spec['title']);
                }

                /* level > 0 means it's a sub spec */
                else{
                    let referencingParent = parent_type+" : "+parent_field;

                    // If the spec hasn't been loaded yet
                    if (typeof json_schema.loaded_specs[spec_name] === 'undefined'){

                        // Parse the json schema
                        //json_schema.loaded_specs[spec_name] = parseJson(json_file);

                        $http.get(json_file).then(function(res){

                            // Remove #/def/pos has it creates a bug
                            if (json_file !== 'https://w3id.org/dats/schema/#/definitions/position'){

                                $scope.main_spec = res.data;
                                json_schema.loaded_specs[spec_name] = res.data;
                                //console.log(res);

                                // If the result isn't false
                                if (json_schema.loaded_specs[spec_name]){

                                    // Create an empty array to display the object the field is referenced from
                                    if (typeof json_schema.loaded_specs[spec_name]['referencedFrom'] === 'undefined'){
                                        json_schema.loaded_specs[spec_name]['referencedFrom'] = [];
                                    }

                                    // Add the object name: field to it
                                    if (json_schema.loaded_specs[spec_name]['referencedFrom'].indexOf(referencingParent) === -1){
                                        json_schema.loaded_specs[spec_name]['referencedFrom'].push(referencingParent);
                                    }
                                }
                                seek_subSpecs(json_schema.loaded_specs[spec_name]['properties'], json_schema.loaded_specs[spec_name]['title']);
                            }
                        }, function(error){
                            console.log(referencingParent);
                        });


                    }

                    // If the spec has already been loaded
                    else{
                        if (spec_name !== "undefined"
                            && typeof json_schema.loaded_specs[spec_name]['referencedFrom'] !== 'undefined'){
                            if (json_schema.loaded_specs[spec_name]['referencedFrom'].indexOf(referencingParent) === -1){
                                json_schema.loaded_specs[spec_name]['referencedFrom'].push(referencingParent);
                            }
                        }
                    }
                }

            }

            function seek_subSpecs(properties, parent_name) {
                // iterate over the loaded spec and try to locate if sub specs need to be loaded
                for (let property in properties) {

                    // Structure is root[key]['$ref']
                    if (typeof properties[property]['$ref'] !== 'undefined'){
                        loadJSON(base_url+properties[property]['$ref'], 1, property, parent_name);
                    }

                    // Structure is root[key]['items']
                    if (typeof properties[property].items !== 'undefined'){

                        // Structure is root[key]['items']['$ref']
                        if (typeof properties[property].items['$ref'] !== 'undefined'){
                            loadJSON(base_url+properties[property].items['$ref'], 1, property, parent_name);
                        }

                        // Structure is root[key]['items']['anyOf']
                        if (properties[property].items['anyOf'] !== 'undefined'){
                            for (let sub_item in properties[property].items['anyOf']){
                                let new_spec = properties[property].items['anyOf'][sub_item]['$ref'];
                                loadJSON(base_url+new_spec, 1, property, parent_name);
                            }
                        }

                        // Structure is root[key]['items']['oneOf']
                        if (properties[property].items.hasOwnProperty('oneOf')){
                            for (let sub_item in properties[property].items['oneOf']){
                                if(properties[property].items['oneOf'][sub_item].hasOwnProperty('$ref')){
                                    let new_spec = properties[property].items['oneOf'][sub_item]['$ref'];
                                    loadJSON(base_url+new_spec, 1, property, parent_name);
                                }
                            }
                        }
                    }

                    // Structure is root[key]['anyOf']
                    if (properties[property].hasOwnProperty('anyOf')){
                        for (let sub_item in properties[property]['anyOf']){
                            if (properties[property]['anyOf'][sub_item].hasOwnProperty('$ref')){
                                let new_spec = properties[property]['anyOf'][sub_item]['$ref'];
                                loadJSON(base_url+new_spec, 1, property, parent_name);
                            }
                        }
                    }

                    // Structure is root[key]['oneOf']
                    if (properties[property].hasOwnProperty('oneOf')){
                        for (let sub_item in properties[property]['oneOf']){
                            if (properties[property]['oneOf'][sub_item].hasOwnProperty('$ref')){
                                let new_spec = properties[property]['oneOf'][sub_item]['$ref'];
                                loadJSON(base_url+new_spec, 1, property, parent_name);
                            }
                        }
                    }
                }
            }

            function getUrlFromUrl() {
                let query = location.search.substr(1);
                let result = {};
                query.split("&").forEach(function(part) {
                    let item = part.split("=");
                    result[item[0]] = decodeURIComponent(item[1]);
                });
                return result;
            }

        }
    ]);


    my_app.directive('schemaLoader', function() {
        return {
            restrict: 'A',
            templateUrl: 'include/schema.html',
            scope: {
                schemaLoader: '=',
                parentKey: '='
            },
            link: function($scope, element, attr) {
                $scope.$watch('schemaLoader', function(schemaLoader){
                    if(schemaLoader)
                        $scope.json_source = $scope.schemaLoader;
                    $scope.parent = $scope.parentKey;
                });
            }
        }
    });

    my_app.directive('schemaFields', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/fields.html',
            scope: {
                schemaFields: '=',
                parentKey: '=',
                requiredProp: '='
            },
            link: function($scope, element, attr){
                $scope.$watch('schemaFields', function(schemaFields){
                    if(schemaFields)
                        $scope.fields = $scope.schemaFields;
                    $scope.parent = $scope.parentKey;
                    $scope.required = $scope.required;
                });
            }
        }
    });

    my_app.directive('fieldType', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/field.html',
            scope: {
                fieldType: '=',
            },
            link: function($scope, element, attr){
                $scope.$watch('fieldType', function(fieldType){
                    if(fieldType)
                        $scope.field = $scope.fieldType;
                });
            }
        }
    });

    my_app.filter('removeExtraStr', function() {

        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function(input) {
            if (input) {
                return input.replace('#', '').replace('.json', '').replace('https://w3id.org/dats/schema/', '');
            }
        }

    });

    my_app.filter('ellipsisFilter', function() {
        return function(input) {
            if (input.length>12) {
                console.log(input);
                return input.substring(0, 12)+"...";
            }
            else{
                return input;
            }
        }

    });



})();