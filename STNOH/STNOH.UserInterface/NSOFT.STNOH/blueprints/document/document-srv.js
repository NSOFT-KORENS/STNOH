(function () {
    'use strict';
    angular.module('NSOFT.STNOH.document')
        .constant('NSOFT.STNOH.document.document.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.document.document.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module

                documentEntityName: 'Document',
                CreateDocument: 'CreateDocument',
                CreatePlanDocument: "CreateLaborTrainingPlanDocument",
                CreateResultDocument: "CreateLaborTrainingResultDocument"
            },
            states: {
                document: 'home.NSOFT_STNOH_document_document',
                addDocument: 'home.NSOFT_STNOH_document_document.add'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.document.document.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.document.document.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getDocAll = getDocAll;
            self.CreateDocument = CreateDocument;
            self.CreatePlanDocument = CreatePlanDocument;
            self.CreateResultDocument = CreateResultDocument;

            self.states = context.states;
        }


        function getDocAll(options) {
            return execGetAll(context.data.documentEntityName, options);
        }



        function CreateDocument(data) {
            var obj = {
                'NId': data.NId,
                'FileName': data.FileName,
                'MIMEType': data.Type,
                'File': data.FileData,
                'Type': 'Labor'
            };

            return execCommand(context.data.CreateDocument, obj);
        }

        function CreatePlanDocument(data) {
            var obj = {
                'LaborTrainingId': data.LaborTrainingId,
                'DocumentId': data.DocumentId
            };

            return execCommand(context.data.CreatePlanDocument, obj);
        }

        function CreateResultDocument(data) {
            var obj = {
                'LaborTrainingId': data.LaborTrainingId,
                'DocumentId': data.DocumentId
            };

            return execCommand(context.data.CreateResultDocument, obj);
        }



        function execGetAll(entityName, options) {
            return backendService.findAll({
                'appName': context.data.appName,
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

    ScreenServiceRun.$inject = ['NSOFT.STNOH.document.document.constants', 'common.base'];
    function ScreenServiceRun(context, common) {

    }
}());
