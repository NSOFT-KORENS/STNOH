//@ts-check
(function () {
    'use strict';
    var serviceName = 'UserManagement_Svc';

    angular.module('NSOFT.STNOH.UserManagement')
        .factory(serviceName, [
            '$q',
            'u4dm.services',
            'common.base',
            UserMgtService
        ]);



    function UserMgtService($q, u4dmSvc, base) {
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
            'assoicateUser': assoicateUser
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
                'Content': data.Content,
                'Person': data.Person
            };

            return execCommand(obj);

        }

        function execCommand(params) {
            return backendService.invoke({
                'appName': 'STNOH',
                'commandName': 'CreateMailContentPersonAssociation',
                'params': params
            });
        }
    }
}());


