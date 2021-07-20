(function () {
    'use strict';
    angular.module('NSOFT.STNOH.FirstArticleInspectionManagement')
        .constant('NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'FirstArticleInspection',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module
                entityName: 'FirstArticleInspection',
                createPublicName: 'CreateFirstArticleInspection',
                updatePublicName: 'UpdateFirstArticleInspection',
                deletePublicName: 'DeleteFirstArticleInspection'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
            self.create = createEntity;
            self.update = updateEntity;
            self.delete = deleteEntity;
            self.getMaterials = getMaterials;
            self.getAsPlannedBOP = getAsPlannedBOP;
            self.getProcess = getProcess;
            self.getOperation = getOperation;
            self.getOperations = getOperations;
            self.getChildProcess = getChildProcess;
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function createEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'NId': data.NId,
                'MaterialId': data.MaterialId,
                'BoPId': data.BoPId,
                'OperationId': data.OperationId,
                'StartDate': data.StartDate,
                'EndDate': data.EndDate
            };
            return execCommand(context.data.createPublicName, obj);
        }

        function updateEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create
            var obj = {
                'Id': data.Id,
                'StartDate': data.StartDate,
                'EndDate': data.EndDate
            };
            return execCommand(context.data.updatePublicName, obj);
        }

        function deleteEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will delete
            var obj = {
                'Id': data.Id
            };
            return execCommand(context.data.deletePublicName, obj);
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

        function getMaterials(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'Material',
                'options': ''
            });
        }

        function getAsPlannedBOP(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'AsPlannedBOP',
                'options': options
            });
        }



        function getProcess(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'Process',
                'options': options
            });
        }

        function getOperation(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'ProcessToOperationLink',
                'options': options
            });
        }

        function getOperations(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'Operation',
                'options': options
            });
        }

        function getChildProcess(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'ProcessToProcessLink',
                'options': options
            });
        }
    }

    ScreenServiceRun.$inject = ['NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
        if (!context.data.entityName) {
            common.services.logger.service.logWarning('Configure the entityName');
        };
        if (!context.data.createPublicName) {
            common.services.logger.service.logWarning('Configure the createPublicName');
        };
        if (!context.data.deletePublicName) {
            common.services.logger.service.logWarning('Configure the deletePublicName');
        };
        if (!context.data.updatePublicName) {
            common.services.logger.service.logWarning('Configure the updatePublicName');
        };
    }
}());
