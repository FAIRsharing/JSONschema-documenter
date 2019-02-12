(function(){

    var my_app = angular.module('generatorApp',
        ['ngRoute', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages'])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('altTheme')
                .primaryPalette('blue');
            $mdThemingProvider.theme('greenTheme')
                .primaryPalette('green');
        });

    my_app.controller('documenterController', ['$scope','$location','$http','$templateCache','SchemaLoader',
        function($scope, $location, $http, $templateCache, SchemaLoader) {
            $templateCache.removeAll();

            let json_schema = this;
            this.loaded = false;
            this.errors = [];
            this.displayedSpec = null;
            this.next_target = null;
            this.next_mapping = null;
            this.menu_on = false;
            this.subset = ['oneOf', 'anyOf', 'allOf'];
            this.main_schema = "";
            this.trigger_tour = false;


            try{
                json_schema.target = "https://w3id.org/dats/schema/study_schema.json#";

                json_schema.mapping_target = null;
                let query = location.search.substr(1);
                if (query!==""){
                    let result = {};
                    query.split("&").forEach(function(part) {
                        let item = part.split("=");
                        result[item[0]] = decodeURIComponent(item[1]);
                    });
                    if (result.hasOwnProperty('schema_url')){
                        json_schema.target = result['schema_url'];
                    }
                    if (result.hasOwnProperty('context_mapping_url')) {
                        json_schema.mapping_target = result['context_mapping_url']
                    }
                    if (result.hasOwnProperty('parameters')){
                        let params = JSON.parse(result['parameters']);
                        let redirect_URL = window.location.origin + window.location.pathname + '?schema_url=' + params['target'];
                        json_schema.errors.push({'Old parameters used': 'you are using an old version of URL parameters so the default schema has been loaded for you, if you want to access your schema, use ' + redirect_URL});
                    }

                }
                else{
                    json_schema.target = "https://w3id.org/dats/schema/study_schema.json#";
                }
                json_schema.next_target = json_schema.target;
                json_schema.next_mapping = json_schema.mapping_target;

                if (json_schema.target === "https://w3id.org/dats/schema/study_schema.json#"){
                    json_schema.trigger_tour = true;
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

                    /* IMPLEMENTING CONTEXT VALUES */
                    if (json_schema.mapping_target != null){
                        $http.get(json_schema.mapping_target).then(
                            function(res){
                                json_schema.contexts = {};
                                let contexts = res.data['contexts'];
                                for (let context in contexts) {
                                    if (contexts.hasOwnProperty(context)){
                                        $http.get(contexts[context]).then(
                                            function(response){
                                                json_schema.contexts[context.replace(".json", "")] = response.data;
                                            }
                                        ).catch(function(e){
                                            json_schema.errors.push({'404': (e.config.url + ' ' + e.statusText).toString()});
                                        })
                                    }
                                }
                                json_schema.labels = res.data["labels"]
                            }

                        ).catch(function(e){
                            json_schema.errors.push({'404': (e.config.url + ' ' + e.statusText).toString()});
                        })
                    }
                }
            ).catch(function(e){
                json_schema.errors.push({'404': (e.config.url + ' ' + e.statusText).toString()});
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
                if (json_schema.next_target != null && json_schema.next_mapping != null){
                    window.location.href = window.location.origin + window.location.pathname + '?schema_url=' +
                        json_schema.next_target + '&context_mapping_url=' + json_schema.next_mapping;
                }
                else if (json_schema.next_target != null && json_schema.next_mapping === null) {
                    window.location.href = window.location.origin + window.location.pathname + '?schema_url=' + json_schema.next_target;
                }
            };

            this.create_href = function(context, fieldName) {

                function isURL(str) {
                    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
                }

                let url = "";
                if (context != null){
                    if (context.hasOwnProperty(fieldName) && context[fieldName].hasOwnProperty("@id")){
                        url = context[fieldName]["@id"];
                    }
                    else {
                        url = context[fieldName];
                    }
                    if (!isURL(url) && url !== ""){
                        let URLArray = url.split(':');
                        let urlBase = context[URLArray[0]];
                        url = urlBase + URLArray[1];
                    }

                    return url;

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
                contextValues: '=',
                innerLink: '=',
                functionController: '='
            },
            link: function($scope){
                $scope.$watch('schemaFields', function(schemaFields){
                    if(schemaFields){
                        if ($scope.schemaFields.hasOwnProperty('properties')){
                            $scope.fields = $scope.schemaFields['properties'];
                            if ($scope.schemaFields.hasOwnProperty('required')){
                                $scope.requiredFields = $scope.schemaFields['required'];
                            }
                            else{
                                $scope.requiredFields = null;
                            }
                        }
                        $scope.ctrl = $scope.functionController;
                        $scope.parent = $scope.parentKey;
                        $scope.context = $scope.contextValues;
                        $scope.backLink = $scope.innerLink;
                        $scope.labels = $scope.functionController['labels']
                    }
                });
                $scope.$watch('contextValues', function(contextValues){
                    if(contextValues){
                        $scope.context = $scope.contextValues;
                    }
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
                buttonLink: '=',
                isRequired: "="
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
        return function(input) {
            if (input) {
                let returned_value = input.split('/').slice(-1)[0];
                return returned_value.replace('#', '').replace('.json', '').replace(/:/g, '_');
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
    }]);

    /* bootstrap tooltip */
    my_app.directive('tooltip', function(){
        return {
            restrict: 'A',
            scope: {
              fieldName: '='
            },
            link: function($scope, element){
                $scope.$watch(element,
                    function(){
                        if(element){
                            if ($scope.fieldName){
                                try {
                                    let context_data = JSON.parse(element[0]['title']);
                                    let title = context_data[$scope.fieldName];
                                    if (title.hasOwnProperty('@id')){
                                        title = title['@id'];
                                    }
                                    // TODO: only split if not already an URL
                                    // TODO: handle multiple semantic values with different types 'eg: obo/sdo')
                                    let title_base = title.split(':');
                                    let title_base_url = context_data[title_base[0]];
                                    title = title_base_url + title_base[1];
                                    element[0]['title'] = "<label>Semantic Value:</label> " +title + "<br> <i style='color:black;'>(Click icon to open label)</i>";
                                }
                                catch(error){
                                    element[0]['title'] = "<label>Semantic Value:</label> " +element[0]['title'] + "<br> <i style='color:black;'>(Click icon to open label)</i>" ;
                                }
                            }
                            element.hover(function(){
                                // on mouseenter
                                element.tooltip('show');
                            }, function(){
                                // on mouseleave
                                element.tooltip('hide');
                            });
                        }
                    }
                );


            }
        };
    })

})();