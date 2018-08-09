(function(){

    var my_app = angular.module('generatorApp',
        ['ngRoute', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages'])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('altTheme')
                .primaryPalette('blue');

        });

    my_app.controller('documenterController', ['$scope','$location','$http','$templateCache','SchemaLoader',
        function($scope, $location, $http, $templateCache, SchemaLoader) {
            $templateCache.removeAll();

            let json_schema = this;
            this.loaded = false;
            this.errors = [];
            this.displayedSpec = null;

            if (getParamsFromURL()["parameters"]){
                try{
                    var params = JSON.parse(getParamsFromURL()["parameters"]);
                }
                catch(e){
                    let error = {"jsonParseError": "Please verify the parameter JSON provided to the URL"};
                    json_schema.errors.push(error);
                    console.log(error);
                }
            }
            this.target = "https://w3id.org/dats/schema/study_schema.json";
            this.display = "grid";
            if (params){
                if(params.hasOwnProperty('target')){
                    json_schema.target = params.target
                }
                if(params.hasOwnProperty('display')){
                    json_schema.display = params.display
                }
            }

            function getParamsFromURL() {
                let query = location.search.substr(1);
                let result = {};
                query.split("&").forEach(function(part) {
                    let item = part.split("=");
                    result[item[0]] = decodeURIComponent(item[1]);
                });
                return result;
            }

            let schemaLoader = new SchemaLoader();


            schemaLoader.load(json_schema.target, 0, null).then(
                function(){
                    json_schema.main_spec=schemaLoader.main_spec;
                    json_schema.loaded_specs=schemaLoader.loaded_specs;
                    json_schema.loaded = true;
                }
            ).catch(function(e){
                json_schema.errors.push(e);
            });

            this.displayItem = function(itemName, itemValue){

                let specToDisplay = angular.copy(itemValue);
                delete specToDisplay['referencedFrom'];

                if (json_schema.displayedSpec != null){
                    if (itemName === json_schema.displayedSpec[0]){
                        json_schema.displayedSpec = null;
                    }
                    else{
                        json_schema.displayedSpec = [itemName, specToDisplay]
                    }
                }
                else{
                    json_schema.displayedSpec = [itemName, specToDisplay]
                }
            }

        }
    ]);


    my_app.directive('schemaLoader', function() {
        return {
            restrict: 'A',
            templateUrl: 'include/schema.html',
            scope: {
                schemaLoader: '=',
                parentKey: '=',
                containerCtrl: "="
            },
            link: function($scope, element, attr) {
                $scope.$watch('schemaLoader', function(schemaLoader){
                    if(schemaLoader)
                        $scope.json_source = $scope.schemaLoader;
                        $scope.parent = $scope.parentKey;
                        $scope.ctrl = $scope.containerCtrl;
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
                displayType: '='
            },
            link: function($scope, element, attr){
                $scope.$watch('schemaFields', function(schemaFields){
                    if(schemaFields)
                        $scope.fields = $scope.schemaFields;
                    $scope.parent = $scope.parentKey;
                    $scope.display = $scope.displayType;

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
    my_app.directive('buttonLink', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/objectLink.html',
            scope: {
                buttonLink: '='
            },
            link: function($scope, element, attr){
                $scope.$watch('buttonLink',
                    function(buttonLink){
                    if(buttonLink)
                        $scope.link = $scope.buttonLink;
                    }
                );
            }
        }
    });
    my_app.directive('innerReference', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/innerRef.html',
            scope: {
                innerReference: '='
            },
            link: function($scope, element, attr){
                $scope.$watch('innerReference',
                    function(innerReference){
                        if(innerReference)
                            $scope.link = $scope.innerReference;
                    }
                );
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