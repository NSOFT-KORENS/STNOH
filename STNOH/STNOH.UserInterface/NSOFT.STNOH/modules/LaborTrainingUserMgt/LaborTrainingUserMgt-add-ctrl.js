//@ts-check
(function () {

    'use strict';
    var controllerName = 'mdui_LaborTrainingUserMgt_selectUsersAdd_Ctrl';
    angular.module('NSOFT.STNOH.LaborTrainingUserMgt')
        .controller(controllerName, [
            '$state',
            'u4dm.services',
            'LaborTrainingUserMgt_Svc',
            'common.services.modelDriven.runtimeService',
            '$translate',
            'common.base',
            '$q',
            LaborTrainingUserMgtUserAddController
        ]);

    function LaborTrainingUserMgtUserAddController(
        $state,
        u4dmSvc,
        LaborTrainingUserMgtSvc,
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
        vm.laborTraining = {};
        vm.UserList = [];
        vm.alreadyAssociationUser = [];


        vm.radioOptions = [
            { label: $translate.instant('NSOFT_STNOH_LaborTraining.Pass'), value: "True" },
            { label: $translate.instant('NSOFT_STNOH_LaborTraining.Fail'), value: "False", checked: "True" }
        ];
        vm.rdValue = "False";

        vm.selectionChanged = selectionChanged;

        vm.sidepanelConfig = {
            title: $translate.instant('NSOFT_STNOH_LaborTraining.AddUser'),
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
            vm.sidePanelManager.setTitle('Add Users');


            configureIcv();

            $q.all(
                [
                    getLabor()
                ]).then(function (result) {
                    vm.laborTraining = result[0].value;
                    if (vm.laborTraining[0].Certification != null) {
                        LaborTrainingUserMgtSvc.getAll2("$expand=UserList&$filter=Id eq " + vm.laborTraining[0].Certification_Id, "Certification", "AppU4DM").then(function (data) {
                            if (data) {
                                vm.UserList = data.value[0].UserList;
                            }
                        });
                    }

                });

            loadUsers('');

            vm.sidePanelManager.open({ mode: 'e', size: 'wide' });
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

        function getLabor() {
            return LaborTrainingUserMgtSvc.getAll2("$expand=Certification&$filter=Id eq " + $state.params.LaborTrainingId, "LaborTraining", "STNOH");
        }

        function associate() {
            var userIds = vm.icvConfig.getSelectedItems().map(function (usr) { return usr.Name; });

            var text = $translate.instant('NSOFT_STNOH_LaborTraining.AddConfirmMsg01');

            backendService.confirm(text, function () {

                if (vm.laborTraining[0].Certification_Id != null) {

                    var delparams = {
                        'CertificationId': vm.laborTraining[0].Certification_Id,
                        'Users': userIds,
                        'ExpiryDate': vm.laborTraining[0].ExpirationDate,
                        'Pass': vm.rdValue == 'True' ? true : false
                    };

                    removeAndassignUserList(delparams);
                }

                for (var i = 0; i < userIds.length; i++) {
                    var params = {
                        'LaborTrainingId': $state.params.LaborTrainingId,
                        'Users': userIds[i],
                        'Pass': vm.rdValue == 'True' ? true : false
                    };

                    LaborTrainingUserMgtSvc.assoicateUser(params).then(function (data) {
                        vm.onCustomActionComplete();
                    }, u4dmSvc.ui.overlay.showBackendError);
                }
            });
        }

        function removeAndassignUserList(params) {
            return LaborTrainingUserMgtSvc.removeAndassignUserList(params);
        }


        function cancel() {
            vm.sidePanelManager.close();
            $state.go('^');
        }

        function loadUsers(options) {
            u4dmSvc.ui.overlay.showBusy('sit.u4dm.loading-users');
            LaborTrainingUserMgtSvc.getAll2("$filter=LaborTraining_Id eq " + $state.params.LaborTrainingId, "UserLaborTrainingAssociation", "STNOH").then(function (data) {
                vm.alreadyAssociationUser = data.value;
                LaborTrainingUserMgtSvc.getUsers(options).then(function (resUsers) {

                    resUsers.value.forEach(function (user) {
                        if (typeof vm.alreadyAssociationUser.find(x => x.UserId == user.Name) == 'undefined')
                            vm.users.push(user);
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