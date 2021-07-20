(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ProductionResult')
        .constant('NSOFT.STNOH.ProductionResult.ProductionResult.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.ProductionResult.ProductionResult.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'InterfaceView',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module
                entityName: 'Interface_View'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.ProductionResult.ProductionResult.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ProductionResult.ProductionResult.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
        }

        function getAll(options) {
            return execGetAll(options);
        }


        function execGetAll(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': context.data.entityName,
                'options': options
            });
        }

        function execCommand(publicName, params) {
            logger.logDebug('Executing command.......', publicName);
            return backendService.invoke({
                'appName': context.data.appName,
                'commandName': publicName,
                'params': params
            });
        }
    }

    ScreenServiceRun.$inject = ['NSOFT.STNOH.ProductionResult.ProductionResult.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
    }
}());
