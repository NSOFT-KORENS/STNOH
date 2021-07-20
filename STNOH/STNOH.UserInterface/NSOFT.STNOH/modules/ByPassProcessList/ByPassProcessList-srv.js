(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ByPassProcessList')
        .constant('NSOFT.STNOH.ByPassProcessList.ByPassProcessList.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.ByPassProcessList.ByPassProcessList.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.ByPassProcessList.ByPassProcessList.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ByPassProcessList.ByPassProcessList.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
        }

        function getAll(appName, entityName, options) {
            return execGetAll(appName, entityName, options);
        }

        function execGetAll(appName, entityName, options) {
            return backendService.findAll({
                'appName': appName,
                'entityName': entityName,
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

    ScreenServiceRun.$inject = ['NSOFT.STNOH.ByPassProcessList.ByPassProcessList.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
    }
}());
