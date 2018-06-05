(function(){

    var my_app = angular.module('generatorApp', ['ngRoute']);

    my_app.controller('documenterController', ['$scope','$location',
        function($scope, $location, queryJSON) {
            var base_url = 'schemas/';
            var schema_file = getUrlFromUrl()["url"];
            var fetch_url = "";
            if (typeof schema_file != 'undefined'){
                fetch_url = base_url + schema_file + '.json';
            }
            else{
                fetch_url = base_url+'study_schema.json';
            }
            var json_schema = this;
            json_schema.loaded_specs = {};
            loadJSON(fetch_url, 0, 'none');

            function loadJSON(json_file, lvl, field){
                json_file = json_file.replace("#", "");
                if (lvl == 0){
                    json_schema.main_spec = parseJson(json_file);
                    for (let key in json_schema.main_spec.properties){
                        if (typeof json_schema.main_spec.properties[key]['$ref'] != 'undefined'){
                            loadJSON(base_url+json_schema.main_spec.properties[key]['$ref'], lvl+1, key);
                        }
                        if (typeof json_schema.main_spec.properties[key].items != 'undefined'){
                            loadJSON(base_url+json_schema.main_spec.properties[key].items['$ref'], lvl+1, key);
                        }
                    }
                }
                else{
                    if (typeof json_schema.loaded_specs[field] == 'undefined'){
                        json_schema.loaded_specs[field] = parseJson(json_file);
                        for (let key in json_schema.loaded_specs[field]){
                            if (typeof json_schema.loaded_specs[field][key]['$ref'] != 'undefined'){
                                loadJSON(base_url+json_schema.loaded_specs[field][key]['$ref'], lvl+1, key);
                            }
                            if (typeof json_schema.loaded_specs[field][key].items != 'undefined'){
                                loadJSON(base_url+json_schema.loaded_specs[field][key].items['$ref'], lvl+1, key);
                            }
                        }
                    }
                    else{
                        console.warn("Attempt to reload a loaded specification");
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

})();