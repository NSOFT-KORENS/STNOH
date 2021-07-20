(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ByPassProcessStatus')
        .constant('NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT.STNOH'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;

        }

        function getAll(appName, entituName, options) {
            return execGetAll(appName, entituName, options);
        }



        function execGetAll(appName, entituName, options) {
            return backendService.findAll({
                'appName': appName,
                'entityName': entituName,
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

    ScreenServiceRun.$inject = ['NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.constants', 'common.base'];
    function ScreenServiceRun(context, common) {

    }
}());
