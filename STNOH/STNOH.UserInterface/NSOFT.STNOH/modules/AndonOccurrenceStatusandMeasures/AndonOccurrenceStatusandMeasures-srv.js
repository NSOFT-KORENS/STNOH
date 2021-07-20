(function () {
    'use strict';
    angular.module('NSOFT.STNOH.AndonOccurrenceStatusandMeasures')
        .constant('NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'AndonView',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT'
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module           
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;

        }

        function getAll(options, entityName) {
            return execGetAll(options, entityName);
        }

        function execGetAll(options, entityName) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': entityName,
                'options': options
            });
        }
    }

    ScreenServiceRun.$inject = ['NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
    }
}());
