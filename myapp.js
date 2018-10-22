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
            this.next_target = null;
            this.next_display = null;
            this.menu_on = false;
            this.subset = ['oneOf', 'anyOf', 'allOf'];
            this.main_schema = "";

            try{
                let query = location.search.substr(1);
                if (query!==""){
                    console.log(query);
                    let result = {};
                    query.split("&").forEach(function(part) {
                        let item = part.split("=");
                        result[item[0]] = decodeURIComponent(item[1]);
                    });
                    if (result.hasOwnProperty('source_url')){
                        json_schema.target = result['source_url'];
                    }
                    else {
                        json_schema.target = "https://w3id.org/dats/schema/study_schema.json#";
                    }

                }
                else{
                    json_schema.target = "https://w3id.org/dats/schema/study_schema.json#";
                }

            }
            catch(e){
                console.log(e);
                let error = {"URL parameters error": "Please verify the parameters you provided to the URL"};
                json_schema.errors.push(error);
            }

            let schema_loader = new SchemaLoader();
            schema_loader.load_schema(json_schema.target, 0, null).then(
                function(){
                    json_schema.raw_schemas = schema_loader.raw_schemas;
                    json_schema.loaded_specs=schema_loader.sub_schemas;
                    json_schema.loaded = true;
                    json_schema.main_schema = schema_loader.main_schema;
                }
            ).catch(function(e){
                json_schema.errors.push(e);
            });


            this.displayItem = function(itemName){
                // TODO switch loaded_specs for raw_schemas
                if (json_schema.displayedSpec != null){
                    if (itemName === json_schema.displayedSpec[0]){
                        json_schema.displayedSpec = null;
                    }
                    else{
                        json_schema.displayedSpec = [itemName, json_schema.raw_schemas[itemName]]
                    }
                }
                else{
                    json_schema.displayedSpec = [itemName, json_schema.raw_schemas[itemName]]
                }
            };

            this.display_menu = function(){
                if (json_schema.menu_on === true){
                    json_schema.menu_on = false;
                    document.getElementById("settings").style.display = "none";
                }
                else{
                    json_schema.menu_on = true;
                    document.getElementById("settings").style.display = "block";
                }

            };

            this.reload = function(){
                if (json_schema.next_target != null && json_schema.next_display != null){
                    let url = window.location.origin + window.location.pathname + '?parameters={' +
                        '"target":"' + json_schema.next_target + '",'+
                        '"display":"' + json_schema.next_display + '"' + '}'
                    window.location.href = url;
                }
            }

        }
    ]);

    /* TEMPLATES */
    my_app.directive('schemaLoader', function() {
        return {
            restrict: 'A',
            templateUrl: 'include/schema.html',
            scope: {
                schemaLoader: '=',
                schemaName: '=',
                container: "="
            },
            link: function($scope) {
                $scope.$watch('schemaLoader', function(schemaLoader){
                    if(schemaLoader)
                        $scope.json_source = $scope.schemaLoader;
                    $scope.ctrl = $scope.container;
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
                displayType: '=',
                innerLink: '='
            },
            link: function($scope){
                $scope.$watch('schemaFields', function(schemaFields){
                    if(schemaFields)
                        $scope.fields = $scope.schemaFields;
                    $scope.parent = $scope.parentKey;
                    $scope.display = $scope.displayType;
                    $scope.backLink = $scope.innerLink

                });
            }
        }
    });
    my_app.directive('fieldType', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/field_type.html',
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
            templateUrl: 'include/link_button.html',
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

    /* FILTERS */
    my_app.filter('removeExtraStr', function() {

        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function(input) {
            if (input) {
                let returned_value = input.split('/').slice(-1)[0];
                return returned_value.replace('#', '').replace('.json', '').replace(':', '_');
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
    my_app.filter('typeOf', function() {
        return function (obj) {
            if (typeof obj === 'object'){
                if (Array.isArray(obj)){
                    return 'array'
                }
                else {
                    return typeof obj;
                }
            }
            else{
                return typeof obj;
            }

        };
    });

    /* COPY TO CLIPBOARD FUNCTIONS */
    my_app.service('ngCopy', ['$window', function ($window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'
        });

        return function (toCopy) {
            textarea.val(toCopy);
            body.append(textarea);
            textarea[0].select();

            try {
                var successful = document.execCommand('copy');
                if (!successful) throw successful;
            } catch (err) {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
            }

            textarea.remove();
        }
    }]);
    my_app.directive('ngClickCopy', ['ngCopy', function (ngCopy) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    ngCopy(attrs.ngClickCopy);
                });
            }
        }
    }])



})();