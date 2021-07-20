(function () {
    'use strict';
    angular.module('NSOFT.STNOH.laborTraining')
        .constant('NSOFT.STNOH.laborTraining.laborTraining.constants', ScreenServiceConstants())
        .service('NSOFT.STNOH.laborTraining.laborTraining.service', ScreenService)
        .run(ScreenServiceRun);

    function ScreenServiceConstants() {
        return {
            data: {
                //appName: 'TrainingAPP',
                appName: 'STNOH', // The name of App: in case of extended app, it is the name of AppBase
                appPrefix: 'NSOFT',
                // TODO: Customize the entityName with the name of the entity defined in the App you want to manage within the UI Module.
                //       Customize the command name with the name of the command defined in the App you want to manage within the UI Module
                entityName: 'LaborTraining',
                createPublicName: 'CreateLaborTraining',
                updatePublicName: 'UpdateLaborTraining'
            }
        };
    }

    ScreenService.$inject = ['$q', '$state', 'common.base', 'NSOFT.STNOH.laborTraining.laborTraining.constants', 'common.services.logger.service'];
    function ScreenService($q, $state, base, context, loggerService) {
        var self = this;
        var logger, backendService;

        activate();
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.laborTraining.laborTraining.service');
            backendService = base.services.runtime.backendService;
            exposeApi();
        }

        function exposeApi() {
            self.getAll = getAll;
            self.getAll2 = getAll2;
            self.create = createEntity;
            self.update = updateEntity;
            self.change = changeStatus;
            self.getCertifications = getCertifications;
            self.getCommonCode = getCommonCode;
        }

        function getAll(options) {
            return execGetAll(options);
        }

        function getAll2(options, entityName, appName) {
            return execGetAll(options, entityName, appName);
        }

        function createEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'NId': data.NId,
                'Name': data.Name,
                'Description': data.Description,
                'TrainingType': data.TrainingType,
                'FromTrainingDate': data.FromTrainingDate,
                'ToTrainingDate': data.ToTrainingDate,
                'ExpirationDate': data.ExpirationDate,
                'Certificate': data.Certificate,
                'Certification': data.Certification

                //'CertificateLevel': data.CertificateLevel
            };

            return execCommand(context.data.createPublicName, obj);
        }

        function updateEntity(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'Id': data.Id,
                'Name': data.Name,
                'Description': data.Description,
                'TrainingType': data.TrainingType,
                'FromTrainingDate': data.FromTrainingDate,
                'ToTrainingDate': data.ToTrainingDate,
                'ExpirationDate': data.ExpirationDate,
                'Certificate': data.Certificate,
                'Certification': data.Certification
                //'CertificateLevel': data.CertificateLevel
            };

            return execCommand(context.data.updatePublicName, obj);
        }

        function changeStatus(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'Id': data.Id,
                'Status': data.Status
            };

            return execCommand("SetLaborTrainingStatus", obj);
        }

        function getCertifications(options) {
            return backendService.findAll({
                'appName': 'AppU4DM',
                'entityName': 'Certification',
                'options': ''
            });
        }

        function getCommonCode(options) {
            return backendService.findAll({
                'appName': 'Labor',
                'entityName': 'Code',
                'options': "$expand=GCode&$filter=GCode/NId eq 'A001'"
            });
        }

        function execGetAll(options) {
            return backendService.findAll({
                'appName': context.data.appName,
                'entityName': context.data.entityName,
                'options': options
            });
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
    }

    ScreenServiceRun.$inject = ['NSOFT.STNOH.laborTraining.laborTraining.constants', 'common.base'];
    function ScreenServiceRun(context, common) {
    }
}());
