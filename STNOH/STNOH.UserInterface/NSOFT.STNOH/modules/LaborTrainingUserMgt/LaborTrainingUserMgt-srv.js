//@ts-check
(function () {
    'use strict';
    var serviceName = 'LaborTrainingUserMgt_Svc';

    angular.module('NSOFT.STNOH.LaborTrainingUserMgt')
        .factory(serviceName, [
            '$q',
            'u4dm.services',
            'common.base',
            LaborTrainingUserMgtService
        ]);



    function LaborTrainingUserMgtService($q, u4dmSvc, base) {
        var logger, backendService;
        backendService = base.services.runtime.backendService;
        var cacheProperties = [
            'Team_CurrentTeam',
            {
                name: 'Team_CurrentTeams',
                entity: u4dmSvc.api.entityList.Team,
                keyField: 'Id',
                odataOptions: ''
            }
        ];
        u4dmSvc.data.cache.addPropertyAccessors(cacheProperties);

        var svc = {

            'getAll': getAll,
            'getAll2': getAll2,
            'getUsers': getUsers,
            'assoicateUser': assoicateUser,
            'assignUserList': assignUserList,
            'removeUserList': removeUserList,
            'removeAndassignUserList': removeAndassignUserList
        };

        return svc;

        function getAll2(options, entityName, appName) {
            return execGetAll(options, entityName, appName);
        }

        function execGetAll(options, entityName, appName) {
            return backendService.findAll({
                'appName': appName,
                'entityName': entityName,
                'options': options
            });
        }


        //support customization
        function customize(fncName, callback) {
            return u4dmSvc.customizator.customizeServiceMethod(serviceName, fncName, callback);
        }

        function getAll(options) {
            function standardMethod(options) {
                options += "&$expand=TeamSkill";
                var com = u4dmSvc.utility.combineFilters(options);
                return u4dmSvc.api.teams.getAll(com.$resultquery);
            }
            return customize('getAll', standardMethod)(options);
        }



        function getUsers(options) {
            return customize('getUsers', function (options) {
                return u4dmSvc.engData.getAll("PublicUser", options);
            })(options);
        }

        function assoicateUser(data) {
            // TODO: Customize the mapping between "UI entity" and the "DB entity" that will create 
            var obj = {
                'UserId': data.Users,
                'LaborTrainingId': data.LaborTrainingId,
                'Pass': data.Pass
            };

            return execCommand(obj);

        }

        function execCommand(params) {
            return backendService.invoke({
                'appName': 'STNOH',
                'commandName': 'CreateUserLaborTrainingAssociation',
                'params': params
            });
        }
        function assignUserList(params) {
            return backendService.invoke({
                'appName': 'AppU4DM',
                'commandName': 'AssignCertificationToUserList',
                'params': params
            });
        }
        function removeUserList(params) {
            return backendService.invoke({
                'appName': 'AppU4DM',
                'commandName': 'RemoveCertificationToUserList',
                'params': params
            });
        }

        function removeAndassignUserList(params) {
            return backendService.invoke({
                'appName': 'STNOH',
                'commandName': 'DeleteAndCreateUserLaborTrainingAssociation',
                'params': params
            });
        }


    }
}());


