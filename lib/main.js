/*global require*/
'use strict';

require.config({
    paths: {
        jquery:['jquery.min'],
        bootstrap: ['bootstrap.min'],
        ajv: ['node_modules/ajv/dist/ajv.min'],
        hopscotch: ['hopscotch_tour/js/hopscotch'],
        tour: ['myTour'],
        angular: ['angular'],
        ngAnimate  : ['angular-animate.min'],
        ngAria	   : ['angular-aria.min'],
        ngMessages : ['angular-messages.min'],
        ngRoute    : ['angular-route.min'],
        ngMaterial: ['angular-material'],
        ngBootstrap : ['ui-bootstrap.min'],
        generatorApp: ['myapp'],
        SchemaLoader: ['loaderFactory']
    },
    shim: {
        jquery: {
            exports: '$'
        },
        angular: {
            exports: 'angular',
        },
        ngMaterial: {
            exports: 'ngMaterial',
            deps: ['angular']
        },
        ngAnimate: {
            exports: 'ngAnimate',
            deps: ['angular']
        },
        ngAria: {
            exports: 'ngAria',
            deps: ['angular']
        },
        ngMessages: {
            exports: 'ngMessages',
            deps: ['angular']
        },
        ngRoute: {
            exports: 'ngRoute',
            deps: ['angular']
        },
        ngBootstrap: {
            exports: 'ngBootstrap',
            deps: ['angular']
        },
        generatorApp: {
            deps: ['angular']
        },
        SchemaLoader: {
            deps: ['angular', 'generatorApp']
        },
        ajv : {
            deps: ['draft04']
        }
    }
});

define('draft04', ['ajv/lib/refs/json-schema-draft-04!json'], function(){});


require(
    [
        // Dependencies from lib
        'angular',
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        'ngAria',
        'ngMessages',
        'ngRoute',
        'ngBootstrap',
        'generatorApp',
        'SchemaLoader',
    ],
    function (angular) {
        var AppRoot = angular.element(document.getElementById('ng-app'));
        AppRoot.attr('ng-controller','documenterController as documenter');
        angular.bootstrap(document, ['generatorApp']);
    }
);