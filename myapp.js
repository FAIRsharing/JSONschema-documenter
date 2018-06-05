(function(){

    var my_app = angular.module('generatorApp', ['ngRoute']);

    my_app.controller('documenterController', ['$scope','$location',
        function($scope, $location) {
            let base_url = 'schemas/';
            let schema_file = getUrlFromUrl()["url"];
            let fetch_url = "";
            if (typeof schema_file != 'undefined'){
                fetch_url = base_url + schema_file + '.json';
            }
            else{
                fetch_url = base_url+'study_schema.json';
            }
            var json_schema = this;
            json_schema.loaded_specs = {};
            loadJSON(fetch_url, 0, 'none');

            console.log(json_schema);

            function loadJSON(json_file, lvl, field){
                json_file = json_file.replace("#", "");
                let spec_name = json_file.replace('schemas/', '').replace(".json", "");

                /* Level is 0: main spec */
                if (lvl == 0){
                    json_schema.main_spec = parseJson(json_file);
                    for (let key in json_schema.main_spec.properties){
                        if (typeof json_schema.main_spec.properties[key]['$ref'] != 'undefined'){
                            loadJSON(base_url+json_schema.main_spec.properties[key]['$ref'], lvl+1, key);
                        }
                        if (typeof json_schema.main_spec.properties[key].items != 'undefined'){
                            loadJSON(base_url+json_schema.main_spec.properties[key].items['$ref'], lvl+1, key);
                            if (typeof json_schema.main_spec.properties[key].items['$ref'] != 'undefined'){
                                loadJSON(base_url+json_schema.main_spec.properties[key].items['$ref'], lvl+1, key);
                            }
                            else{
                                if (json_schema.main_spec.properties[key].items.anyOf != 'undefined'){
                                    for (let sub_item in json_schema.main_spec.properties[key].items.anyOf){
                                        let new_spec = json_schema.main_spec.properties[key].items.anyOf[sub_item]['$ref'];
                                        loadJSON(base_url+new_spec, lvl+1, key);
                                    }
                                }
                            }
                        }
                    }
                }

                /* Subspecs */
                else{

                    if (typeof json_schema.loaded_specs[spec_name] == 'undefined'){
                        json_schema.loaded_specs[spec_name] = parseJson(json_file);
                        if (json_schema.loaded_specs[spec_name]){
                            if (typeof json_schema.loaded_specs[spec_name]['referencedFrom'] == 'undefined'){
                                json_schema.loaded_specs[spec_name]['referencedFrom'] = [];
                            }
                            if (json_schema.loaded_specs[spec_name]['referencedFrom'].indexOf(field) == -1){
                                json_schema.loaded_specs[spec_name]['referencedFrom'].push(field);
                            }
                        }

                        for (let key in json_schema.loaded_specs[spec_name]){

                            if (typeof json_schema.loaded_specs[spec_name][key]['$ref'] != 'undefined'){
                                loadJSON(base_url+json_schema.loaded_specs[spec_name][key]['$ref'], lvl+1, key);
                            }
                            if (typeof json_schema.loaded_specs[spec_name][key].items != 'undefined'){
                                if (typeof json_schema.loaded_specs[spec_name][key].items['$ref'] != 'undefined'){
                                    loadJSON(base_url+json_schema.loaded_specs[spec_name][key].items['$ref'], lvl+1, key);
                                }
                                if (typeof json_schema.loaded_specs[spec_name][key].items['anyOf'] != 'undefined'){
                                    console.log(json_schema.loaded_specs[spec_name][key].items);
                                }
                            }
                        }
                    }
                    else{
                        if (spec_name != "undefined"){
                            if (json_schema.loaded_specs[spec_name]['referencedFrom'].indexOf(field) == -1){
                                json_schema.loaded_specs[spec_name]['referencedFrom'].push(field);
                            }
                        }
                    }
                }
            }

            function parseJson(src){
                let request = new XMLHttpRequest();
                request.open("GET", src, false);
                try{
                    request.send(null);
                    return JSON.parse(request.responseText);
                }
                catch(e){
                    return false;
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
                $scope.json_source = $scope.schemaLoader;
                $scope.parent = $scope.parentKey;
            }
        }
    });

    my_app.directive('schemaFields', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/fields.html',
            scope: {
                schemaFields: '=',
                parentKey: '='
            },
            link: function($scope, element, attr){
                $scope.fields = $scope.schemaFields;
                $scope.parent = $scope.parentKey;

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
                $scope.field = $scope.fieldType;
            }
        }
    });

    my_app.filter('removeExtraStr', function() {

        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function(input) {
            let output = input.replace('#', '').replace('.json', '');
            return output;
        }

    });



})();