(function () {
    'use strict';
    var controllerName = 'LinkManagement_edit_Ctrl';
    var mod = angular.module('NSOFT.STNOH.LinkManagement')
        .controller(controllerName, [
            'NSOFT.STNOH.LinkManagement.LinkManagement.service',
            '$q',
            '$state',
            '$scope',
            'u4dm.constants',
            'u4dm.services',
            '$filter',
            'common.base',
            '$translate',
            LinkManagementEditController
        ]);

    function LinkManagementEditController(
        dataService,
        $q,
        $state,
        $scope,
        u4dmConstants,
        u4dmSvc,
        $filter,
        common,
        $translate
    ) {
        var vm = this;
        var sidePanelManager, backendService, propertyGridHandler;

        var pgFields = {};
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.currentItem = {};
        vm.disableButton = false;
        vm.createInProgess = false;
        vm.onCustomActionComplete = null;
        vm.validInputs = true;
        vm.selectedItem = $state.params.selectedItem;

        vm.save = save;
        vm.cancel = cancel;
        init();

        function init() {

            u4dmSvc.ui.sidePanel.setTitle($translate.instant('NSOFT_STNOH_LinkManagement.edit'));
            u4dmSvc.ui.sidePanel.open('e');
            configureSidePanel();
            configurePropertyGrid();

            vm.validInputs = false;
        }


        function configureSidePanel() {
            vm.sidepanelConfig = {
                title: $translate.instant('NSOFT_STNOH_LinkManagement.edit'),
                messages: [],
                actionButtons: [
                    {
                        label: $translate.instant('NSOFT_STNOH_LinkManagement.save'),
                        onClick: vm.save,
                        enabled: vm.validInputs,
                        visible: true
                    },
                    {
                        label: $translate.instant('NSOFT_STNOH_LinkManagement.cancel'),
                        onClick: vm.cancel,
                        enabled: true,
                        visible: true
                    }
                ],
                closeButton: {
                    showClose: true,
                    tooltip: u4dmSvc.globalization.translate('sit.exds.common.close-sidepanel'),
                    onClick: vm.cancel
                }
            };

        }

        u4dmSvc.messaging.subscribe($scope, 'sit-property-grid.validity-changed', function (event, params) {
            vm.validInputs = params.validity;
            configureSidePanel();
        });


        function configurePropertyGrid() {
            vm.currentItem.LinkName = vm.selectedItem.LinkName;
            vm.currentItem.LinkUrl = vm.selectedItem.LinkUrl;

            propGridMgr.clear();

            //pgFields.nid = propGridMgr.createDateTimePickerProperty({
            //    id: 'startDate',
            //    label: 'StartDate',
            //    value: vm.currentItem.startDate,
            //    validationCallback: validateFromDate
            //});

            pgFields.LinkName = propGridMgr.createTextProperty({
                id: 'LinkName',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkName'),
                value: vm.currentItem.LinkName,
                read_only: false,
                required: true
            });

            pgFields.LinkUrl = propGridMgr.createTextProperty({
                id: 'LinkUrl',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkUrl'),
                value: vm.currentItem.LinkUrl,
                read_only: false,
                required: true
            });


            var standardGridData = [
                pgFields.LinkName,
                pgFields.LinkUrl,

            ];


            propGridMgr.data = standardGridData;

            propGridMgr.getValues = getStandardPropertyGridValues;
            vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function getStandardPropertyGridValues(item) {

        }

        function save() {
            var saveData = {
                'Id': vm.selectedItem.Id,
                'LinkName': pgFields.LinkName.value,
                'LinkUrl': pgFields.LinkUrl.value
            };

            dataService.update(saveData).then(onSaveSuccess);
        }

        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }

        function onPropertyGridValidityChange(event, params) {
            vm.validInputs = params.validity;
        }
    }


    mod.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_LinkManagement_LinkManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/LinkManagement';

        var state = {
            name: screenStateName + '.edit',
            url: '/edit',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/LinkManagement-edit.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_LinkManagement.edit'
            },
            params: {
                selectedItem: null
            }
        };


        $stateProvider.state(state);
        aliasProvider.register(state);


    }
}());