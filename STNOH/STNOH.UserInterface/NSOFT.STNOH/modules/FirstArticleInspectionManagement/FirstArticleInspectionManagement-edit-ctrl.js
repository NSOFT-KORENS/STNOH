(function () {
    'use strict';
    var controllerName = 'FirstArticleInspectionManagement_edit_Ctrl';

    var mod = angular.module('NSOFT.STNOH.FirstArticleInspectionManagement')
        .controller(controllerName, [
            'NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.service',
            '$state', '$stateParams', 'common.base', '$filter', '$scope', 'u4dm.services',
            '$translate',
            FirstArticleInspectionManagementEditController
        ]);


    function FirstArticleInspectionManagementEditController(dataService, $state, $stateParams, common, $filter, $scope, u4dmSvc, $translate) {
        var vm = this;
        var pgFields = {};
        vm.currentItem = angular.copy($stateParams.selectedItem);
        vm.operations = [];
        var icon = u4dmSvc.icons.icon;
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.disableButton = false;
        vm.createInProgess = false;
        var cnt = 0;
        vm.onCustomActionComplete = null;
        vm.validInputs = true;

        vm.save = save;
        vm.cancel = cancel;

        function init() {

            // initialize the side panel
            u4dmSvc.ui.sidePanel.setTitle('sit.u4dm.add');
            u4dmSvc.ui.sidePanel.open('e');
            configureSidePanel();
            configurePropertyGrid();
            // disable the save button

            vm.validInputs = false;
        }

        init();

        function configureSidePanel() {
            vm.sidepanelConfig = {
                title: 'Edit FAI',
                messages: [],
                actionButtons: [
                    {
                        label: u4dmSvc.globalization.translate('sit.u4dm.save'),
                        onClick: vm.save,
                        enabled: vm.validInputs,
                        visible: true
                    },
                    {
                        label: u4dmSvc.globalization.translate('sit.u4dm.cancel'),
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
            propGridMgr.clear();

            //pgFields.nid = propGridMgr.createDateTimePickerProperty({
            //    id: 'startDate',
            //    label: 'StartDate',
            //    value: vm.currentItem.startDate,
            //    validationCallback: validateFromDate
            //});

            pgFields.targetId = propGridMgr.createTextProperty({
                id: 'targetId',
                label: 'Id',
                value: vm.currentItem.Id,
                read_only: false,
                invisible: true,
                required: true,
                checkSpecialChars: true
            });

            pgFields.nid = propGridMgr.createTextProperty({
                id: 'Nid',
                label: 'NId',
                value: vm.currentItem.NId,
                read_only: true,
                required: true
            });

            pgFields.validFrom = propGridMgr.createDateProperty({
                id: 'startDate',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.startDate'),
                required: true,
                read_only: false,
                format: 'yyyy-MM-dd',
                value: new Date(vm.currentItem.StartDate),
                validationCallback: validateFromDate
            }
            );

            pgFields.validTo = propGridMgr.createDateProperty({
                id: 'endDate',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.endDate'),
                required: true,
                read_only: false,
                format: 'yyyy-MM-dd',
                value: new Date(vm.currentItem.EndDate),
                validationCallback: validateToDate
            }
            );

            var standardGridData = [
                pgFields.targetId,
                pgFields.nid,
                pgFields.validFrom,
                pgFields.validTo
            ];


            propGridMgr.data = standardGridData;

            propGridMgr.getValues = getStandardPropertyGridValues;
            vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
        }



        function save() {
            var data = {
                'Id': $stateParams.selectedItem.Id,
                'StartDate': pgFields.validFrom.value,
                'EndDate': pgFields.validTo.value

            }
            dataService.update(data).then(onSaveSuccess);
        }

        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }



        function validateFromDate(date) {
            var toDate = new Date(pgFields.validTo.value);

            if (toDate !== null && (date >= toDate)) {

                pgFields.validTo.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage01'));
                pgFields.validFrom.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage02'));
                pgFields.validTo.setValidity(false);
                return false;
            }
            else {
                if (cnt == 0) {
                    cnt = 1;
                    return true;
                }
                pgFields.validFrom.setValidity(true);
                pgFields.validTo.setValidity(true);
                return true;

            }
            return true;
        }


        function validateToDate(date) {
            var fromDate = new Date(pgFields.validFrom.value);
            var current = new Date();

            if (fromDate !== null && (new Date(date) <= fromDate)) {
                pgFields.validTo.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage01'));
                pgFields.validFrom.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage02'));
                pgFields.validFrom.setValidity(false);
                return false;
            }
            else {
                pgFields.validTo.setValidity(true);
                pgFields.validFrom.setValidity(true);
                return true;
            }
            return true;
        }

        function getPropertyGridValues() {
            return vm.propertyGrid.getValues(vm.currentItem, getStandardPropertyGridValues);
        }

        function getStandardPropertyGridValues(item) {
        }
    }

    mod.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_FirstArticleInspectionManagement_FirstArticleInspectionManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/FirstArticleInspectionManagement';

        var state = {
            name: screenStateName + '.edit',
            url: '/edit/:id',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/FirstArticleInspectionManagement-edit.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Add'
            },
            params: {
                selectedItem: null,
            }
        };


        $stateProvider.state(state);
        aliasProvider.register(state);
    }
}());
