//@ts-check
(function () {

    'use strict';
    var controllerName = 'mdui_UserManagement_selectUsersAdd_Ctrl';
    angular.module('NSOFT.STNOH.UserManagement')
        .controller(controllerName, [
            '$state',
            'u4dm.services',
            'UserManagement_Svc',
            'common.services.modelDriven.runtimeService',
            '$translate',
            'common.base',
            '$q',
            UserMgtUserAddController
        ]);

    function UserMgtUserAddController(
        $state,
        u4dmSvc,
        UserManagementSvc,
        mdRuntimeSvc,
        $translate,
        base,
        $q) {

        var vm = this;
        var backendService = base.services.runtime.backendService;
        vm.users = [];
        vm.cachedData = {};
        vm.standardConfig = null;
        vm.sidePanelManager = u4dmSvc.ui.sidePanel;
        vm.team = null;
        vm.usersAlreadyAss = null;
        vm.usersTeamAlreadyAss = null;
        vm.usersListVisible = false;
        vm.onCustomActionComplete = null;
        vm.associate = associate;
        vm.validInputs = false;
        vm.Person = [];
        vm.UserList = [];


        vm.selectionChanged = selectionChanged;

        vm.sidepanelConfig = {
            title: $translate.instant('NSOFT_STNOH_MailManagement.AddUser'),
            actionButtons: [
                {
                    label: u4dmSvc.globalization.translate('sit.u4dm.associate'),
                    onClick: vm.associate,
                    enabled: vm.validInputs,
                    visible: true
                },
                {
                    label: u4dmSvc.globalization.translate('sit.u4dm.cancel'),
                    onClick: cancel,
                    enabled: true,
                    visible: true
                }
            ],
            closeButton: {
                showClose: true,
                tooltip: u4dmSvc.globalization.translate('sit.u4dm.close'),
                onClick: cancel
            }
        };


        function init() {
            var initObj = mdRuntimeSvc.initCustomAction(); //gets the callback function
            vm.onCustomActionComplete = initObj && initObj.onExit ? initObj.onExit : null;
            vm.sidePanelManager.setTitle($translate.instant('NSOFT_STNOH_MailManagement.AddUser'));


            configureIcv();

            $q.all(
                [
                    getPerson()
                ]).then(function (result) {
                    vm.Person = result[0].value;
                    console.log(vm.Person);
                });



            loadUsers('');

            vm.sidePanelManager.open({ mode: 'e', size: 'wide' });
        }

        function getPerson() {
            return UserManagementSvc.getAll2("", "Person", "Mail");
        }

        function selectionChanged(selectedItems, clickedItem) {
            vm.validInputs = selectedItems;
            setButtonVisibility();
        }

        function setButtonVisibility() {

            vm.sidepanelConfig.actionButtons[0].enabled = vm.validInputs;
        }

        function configureIcv() {
            var options = u4dmSvc.icv.configureIcvByEntity('User', 'standard', null, selectionChanged, 'user-list');
            options.selectionMode = "multi";

            vm.icvConfig = u4dmSvc.customizator.customizeICV(controllerName, options);
        }

        function getContent() {
            return UserManagementSvc.getAll2("$expand=Persons&$filter=Id eq " + $state.params.Id, "MailContent", "STNOH");
        }

        function associate() {
            var userIds = vm.icvConfig.getSelectedItems().map(function (usr) { return usr.Name; });

            for (var i = 0; i < userIds.length; i++) {
                var person = vm.Person.find(x => x.UserName == userIds[i]);
                var params = {
                    'Content': $state.params.Id,
                    'Person': person.Id
                };

                UserManagementSvc.assoicateUser(params).then(function (data) {
                    vm.onCustomActionComplete();
                }, u4dmSvc.ui.overlay.showBackendError)

            }
        }


        function cancel() {
            vm.sidePanelManager.close();
            $state.go('^');
        }

        function loadUsers(options) {
            u4dmSvc.ui.overlay.showBusy('sit.u4dm.loading-users');
            UserManagementSvc.getAll2("$filter=Content_Id eq " + $state.params.Id, "MailContentPersonAssociation", "STNOH").then(function (data) {
                vm.alreadyAssociationUser = data.value;
                UserManagementSvc.getUsers(options).then(function (resUsers) {

                    resUsers.value.forEach(function (user) {
                        var person = vm.Person.find(x => x.UserName == user.Name);

                        if (typeof vm.alreadyAssociationUser.find(x => x.UserName == user.Name) == 'undefined' &&
                            typeof person != 'undefined') {
                            if (person.WorkEmail != null && person.WorkEmail != ""
                                && typeof vm.alreadyAssociationUser.find(x => x.Person_Id == person.Id) == 'undefined')
                                vm.users.push(user);
                        }
                    });
                    vm.usersListVisible = true;
                    u4dmSvc.ui.overlay.hideBusy();
                });
            });
        }


        init();

        setTimeout(function () { $(window).trigger('resize'); }, 100);

    }

}());