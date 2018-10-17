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

            if (getParamsFromURL()["parameters"]){
                try{
                    var params = JSON.parse(getParamsFromURL()["parameters"]);
                }
                catch(e){
                    let error = {"jsonParseError": "Please verify the parameter JSON provided to the URL"};
                    json_schema.errors.push(error);
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
                    if (schemaLoader.errors.length>0){
                        json_schema.errors.push(schemaLoader.errors);
                    }
                    json_schema.main_spec=schemaLoader.main_spec;
                    //json_schema.loaded_specs=schemaLoader.loaded_specs;
                    json_schema.loaded = true;
                }
            ).catch(function(e){
                json_schema.errors.push(e);
            });

            let test = new SchemaLoader();
            test.load_schema(json_schema.target, 0, null).then(
              function(){
                  json_schema.loaded_specs=test.sub_schemas;
              }
            ).catch(function(e){
                json_schema.errors.push(e);
            });

            this.displayItem = function(itemName, itemValue){

                let specToDisplay = angular.copy(itemValue);
                delete specToDisplay['referencedFrom'];

                for (let item in specToDisplay.properties){
                    if (specToDisplay.properties[item].hasOwnProperty('items')){
                        if (specToDisplay.properties[item]['items'].hasOwnProperty('referencing')){
                            delete specToDisplay.properties[item]['items']['referencing'];
                        }
                        if (specToDisplay.properties[item]['items'].hasOwnProperty('oneOf')){
                            for (let subItem in specToDisplay.properties[item]['items']['oneOf']){
                                if (specToDisplay.properties[item]['items']['oneOf'][subItem].hasOwnProperty('referencing')){
                                    delete specToDisplay.properties[item]['items']['oneOf'][subItem]['referencing']
                                }
                            }

                        }
                        if (specToDisplay.properties[item]['items'].hasOwnProperty('anyOf')){
                            for (let subItem in specToDisplay.properties[item]['items']['anyOf']){
                                if (specToDisplay.properties[item]['items']['anyOf'][subItem].hasOwnProperty('referencing')){
                                    delete specToDisplay.properties[item]['items']['anyOf'][subItem]['referencing']
                                }
                            }
                        }
                        if (specToDisplay.properties[item]['items'].hasOwnProperty('allOf')){
                            for (let subItem in specToDisplay.properties[item]['items'][allOf]){
                                if (specToDisplay.properties[item]['items']['allOf'][subItem].hasOwnProperty('referencing')){
                                    delete specToDisplay.properties[item]['items']['allOf'][subItem]['referencing']
                                }
                            }
                        }
                    }
                    if (specToDisplay.properties[item].hasOwnProperty('referencing')){
                        delete specToDisplay.properties[item].hasOwnProperty('referencing');
                    }
                    if (specToDisplay.properties[item].hasOwnProperty('anyOf')){
                        for (let subItem in specToDisplay.properties[item]['anyOf']){
                            if (specToDisplay.properties[item]['anyOf'][subItem].hasOwnProperty('referencing')){
                                delete specToDisplay.properties[item]['anyOf'][subItem]['referencing']
                            }
                        }
                    }
                    if (specToDisplay.properties[item].hasOwnProperty('oneOf')){
                        for (let subItem in specToDisplay.properties[item]['oneOf']){
                            if (specToDisplay.properties[item]['oneOf'][subItem].hasOwnProperty('referencing')){
                                delete specToDisplay.properties[item]['oneOf'][subItem]['referencing']
                            }
                        }
                    }
                    if (specToDisplay.properties[item].hasOwnProperty('allOf')){
                        for (let subItem in specToDisplay.properties[item]['allOf']){
                            if (specToDisplay.properties[item]['allOf'][subItem].hasOwnProperty('referencing')){
                                delete specToDisplay.properties[item]['allOf'][subItem]['referencing']
                            }
                        }
                    }
                }

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
                innerReference: '=',
                backLink: "="
            },
            link: function($scope){
                $scope.$watch('innerReference',
                    function(innerReference){
                        if(innerReference)
                            $scope.link = $scope.innerReference;
                    }
                );
            }
        }
    });
    my_app.directive('miniObject', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/miniObject.html',
            scope: {
                miniObject: '='
            },
            link: function($scope){
                $scope.$watch('miniObject',
                    function(miniObject){
                        if(miniObject)
                            $scope.link = $scope.miniObject;
                    }
                );
            }
        }
    });
    my_app.directive('fieldName', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/subCard.html',
            scope: {
                fieldName: '='
            },
            link: function($scope){
                $scope.$watch('fieldName',
                    function(fieldName){
                        if(fieldName)
                            $scope.field_name = $scope.fieldName;
                    }
                );
            }
        }
    });
    my_app.directive('buttonInnerLink', function(){
        return{
            restrict: 'A',
            templateUrl: 'include/innerLink.html',
            scope: {
                buttonInnerLink: '=',
                buttonLabel: '='
            },
            link: function($scope){
                $scope.$watch('buttonInnerLink',
                    function(buttonInnerLink){
                        if(buttonInnerLink)
                            $scope.button_link = $scope.buttonInnerLink;
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