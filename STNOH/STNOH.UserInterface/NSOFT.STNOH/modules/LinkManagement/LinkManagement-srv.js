(function () {
    'use strict';
    angular.module('NSOFT.STNOH.LinkManagement')
        .constant('NSOFT.STNOH.LinkManagement.LinkManagement.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.LinkManagement.LinkManagement.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'LinkMgt',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module
                entityName: 'LinkManage',
                createPublicName: 'CreateLinkManage',
                updatePublicName: 'UpdateLinkManage',
                deletePublicName: 'DeleteLinkManage',
                createParameterName: 'CreateLinkParameter',
                updateParameterName: 'UpdateLinkParameter',
                deleteParameterName: 'DeleteLinkParameter'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.LinkManagement.LinkManagement.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.LinkManagement.LinkManagement.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
            self.create = createEntity;
            self.update = updateEntity;
            self.delete = deleteEntity;

            self.createParameterEntity = createParameterEntity;
            self.updateParameterEntity = updateParameterEntity;
            self.deleteParameterEntity = deleteParameterEntity;
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function createEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'LinkName': data.LinkName,
                'LinkUrl': data.LinkUrl
            };
            return execCommand(context.data.createPublicName, obj);
        }

        function updateEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create
            var obj = {
                'LinkName': data.LinkName,
                'LinkUrl': data.LinkUrl,
                'Id': data.Id
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

        function createParameterEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'LinkParam': data.LinkParam,
                'LinkValue': data.LinkValue,
                'Manage': data.Manage,
            };
            return execCommand(context.data.createParameterName, obj);
        }

        function updateParameterEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create
            var obj = {
                'Id': data.ID,
                'LinkParam': data.LinkParam,
                'LinkValue': data.LinkValue
            };
            return execCommand(context.data.updateParameterName, obj);
        }

        function deleteParameterEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will delete
            var obj = {
                'Id': data.Id
            };
            return execCommand(context.data.deleteParameterName, obj);
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

    ScreenServiceRun.$inject = ['NSOFT.STNOH.LinkManagement.LinkManagement.constants', 'common.base'];
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
