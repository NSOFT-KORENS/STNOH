(function () {
    'use strict';
    angular.module('NSOFT.STNOH.MailManagement')
        .constant('NSOFT.STNOH.MailManagement.ContentManagement.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.MailManagement.ContentManagement.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'TrainingAPP',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module
                entityName: 'MailContent',
                createPublicName: 'CreateMailContent',
                updatePublicName: 'UpdateMailContent'

            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.MailManagement.ContentManagement.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.MailManagement.ContentManagement.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
            self.getAll2 = getAll2;
            self.getMailContent = getMailContent;
            self.create = createMailContent;
            self.update = updateMailContent;
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function getAll2(options, entityName, appName) {
            return execGetAll(options, entityName, appName);
        }


        function execGetAll(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': context.data.entityName,
                'options': options
            });
        }

        function createMailContent(data) {
            var obj = {
                Content: data.Content,
                NId: data.NId,
                Title: data.Title,
                MailType: data.MailType,
                Conditions: data.Conditions,
                IsActive: data.IsActive
            }
            return execCommand(context.data.createPublicName, obj);
        }

        function updateMailContent(data) {
            var obj = {
                Content: data.Content,
                Id: data.Id,
                Title: data.Title,
                Conditions: data.Conditions,
                IsActive: data.IsActive
            }
            return execCommand(context.data.updatePublicName, obj);
        }

        function execGetAll(options, entityName, appName) {
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

        function getMailContent(options) {
            return backendService.findAll({
                'appName': 'STNOH',
                'entityName': 'MailContent',
                'options': options
            });
        }
    }

    ScreenServiceRun.$inject = ['NSOFT.STNOH.MailManagement.ContentManagement.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
    }
}());
