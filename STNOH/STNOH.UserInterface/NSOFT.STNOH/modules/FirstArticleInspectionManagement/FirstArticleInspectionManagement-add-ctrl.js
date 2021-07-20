//@ts-check
(function () {

    'use strict';
    var controllerName = 'FirstArticleInspectionManagement_add_Ctrl';
    var mod = angular.module('NSOFT.STNOH.FirstArticleInspectionManagement')
        .controller(controllerName, [
            'NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.service',
            '$q',
            '$state',
            '$scope',
            'u4dm.constants',
            'u4dm.services',
            '$filter',
            'common.base',
            '$translate',
            FirstArticleInspectionManagementAddController
        ]);

    function FirstArticleInspectionManagementAddController(
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

        var pgFields = {};

        vm.parentProcess = {};
        vm.resultProcess = [];

        vm.childProcess = [];
        vm.processes = [];

        vm.currentItem = {};
        vm.operations = [];
        var icon = u4dmSvc.icons.icon;
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.disableButton = false;
        vm.createInProgess = false;

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
            initData();
            // disable the save button

            vm.validInputs = false;
        }

        init();

        function save() {
            var saveData = {
                'NId': pgFields.nid.value,
                'MaterialId': pgFields.material.value.Id,
                'BoPId': pgFields.process.value.Id,
                'OperationId': pgFields.operation.value.Id,
                'StartDate': pgFields.validFrom.value,
                'EndDate': pgFields.validTo.value
            };

            dataService.create(saveData).then(onSaveSuccess);
        }
        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

        function initData() {
            dataService.getProcess("$expand=ParentProcesses").then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.processes = data.value;
                }
                else {
                    vm.processes = [];
                }
            });

            dataService.getChildProcess("$expand=ChildProcess($expand=ParentProcesses)").then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.childProcess = data.value;
                }
                else {
                    vm.childProcess = [];
                }
            });
        }

        function configureSidePanel() {
            vm.sidepanelConfig = {
                title: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.addTitle'),
                messages: [],
                actionButtons: [
                    {
                        label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.save'),
                        onClick: vm.save,
                        enabled: vm.validInputs,
                        visible: true
                    },
                    {
                        label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.cancel'),
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

            pgFields.nid = propGridMgr.createTextProperty({
                id: 'nid',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.identifier'),
                value: vm.currentItem.NId,
                read_only: false,
                required: true,
                checkSpecialChars: true
            });

            pgFields.material = propGridMgr.createEntityPickerProperty({
                id: 'Material',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.Material'),
                required: true,
                value: vm.currentItem.Material,
                read_only: false,
                displayProperty: "NId",
                pickerOptions: u4dmSvc.icv.configureIcvByEntity4EPServer('MaterialItemSmall', getMaterials),
                dataSource: {
                    getAll: getMaterials,
                    searchField: 'NId'
                }
            });

            pgFields.asPlannedBoP = propGridMgr.createEntityPickerProperty({
                id: 'asPlannedBoP',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.asPlannedBoP'),
                required: true,
                value: vm.currentItem.asPlannedBoP,
                read_only: false,
                displayProperty: "BaselineName",
                pickerOptions: u4dmSvc.icv.configureIcvByEntity4EPServer(u4dmSvc.api.entityList.AsPlannedBOP, getAsPlannedBOP),
                dataSource: {
                    getAll: getAsPlannedBOP,
                    searchField: 'BaselineName'
                },
                onChange: AsPlannedBoPChange
            });

            pgFields.process = propGridMgr.createEntityPickerProperty({
                id: 'processAsPlannedBop',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.Process'),
                required: true,
                value: vm.currentItem.Process,
                read_only: false,
                displayProperty: "NId",
                invisible: !(vm.currentItem.asPlannedBoP),
                pickerOptions: u4dmSvc.icv.configureIcvByEntity4EPServer(u4dmSvc.api.entityList.Process, getProcess),
                dataSource: {
                    getAll: getProcess,
                    searchField: 'NId'
                },
                onChange: ProcessChange
            });


            pgFields.operation = propGridMgr.createComboBoxProperty({
                id: 'operation',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.Operation'),
                value: '',
                required: true,
                invisible: !(vm.currentItem.Process),
                dataSource: vm.operations,
                displayProperty: "NId",
                valueProperty: "Id"
            });

            pgFields.validFrom = propGridMgr.createDateProperty({
                id: 'startDate',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.startDate'),
                required: true,
                read_only: false,
                /* Fix for bug 249749 In chin,ese version the default format set in "datePicker.js" (mediumDate) was parsed as Invalid Date and hence an exception was thrown. Setting a more generic format specifically in this case. */
                format: 'yyyy/MM/dd',
                validationCallback: validateFromDate
            }
            );

            pgFields.validTo = propGridMgr.createDateProperty({
                id: 'endDate',
                label: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.endDate'),
                required: true,
                read_only: false,
                //  validationCallback: dateValidation,
                /* Fix for bug 249749 In chinese version the default format set in "datePicker.js" (mediumDate) was parsed as Invalid Date and hence an exception was thrown. Setting a more generic format specifically in this case. */
                format: 'yyyy/MM/dd',
                validationCallback: validateToDate
            }
            );



            var standardGridData = [
                pgFields.nid,
                pgFields.material,
                pgFields.asPlannedBoP,
                pgFields.process,
                pgFields.operation,
                pgFields.validFrom,
                pgFields.validTo
            ];


            propGridMgr.data = standardGridData;

            propGridMgr.getValues = getStandardPropertyGridValues;
            vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);


        }

        function AsPlannedBoPChange(oldVal, newVal, form) {
            vm.currentItem.asPlannedBoP = newVal;
            vm.currentItem.Process = null;
            vm.operations = [];

            getPropertyGridValues();
            configurePropertyGrid();
        }

        function validateFromDate(date) {
            var toDate = pgFields.validTo.value;

            if (toDate !== null && (date >= toDate)) {

                pgFields.validTo.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage01'));
                pgFields.validFrom.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage02'));
                pgFields.validTo.setValidity(false);
                return false;
            }
            else {

                pgFields.validTo.setValidity(true);

            }
            return true;
        }

        function validateToDate(date) {
            var fromDate = pgFields.validFrom.value;
            var current = new Date();

            if (fromDate !== null && (date <= fromDate)) {
                pgFields.validTo.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage01'));
                pgFields.validFrom.setValidationMessage($translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.dateValidMessage02'));
                pgFields.validFrom.setValidity(false);
                return false;
            }
            else {
                pgFields.validTo.setValidity(true);
                pgFields.validFrom.setValidity(true);

            }
            return true;
        }

        function getPropertyGridValues() {
            return vm.propertyGrid.getValues(vm.currentItem, getStandardPropertyGridValues);
        }

        function getStandardPropertyGridValues(item) {
            item.NId = pgFields.nid.value;
            item.Material = pgFields.material.value;
            item.AsPlannedBoP = pgFields.asPlannedBoP.value;
            item.Process = pgFields.process.value;
        }

        function getMaterials(options) {
            return dataService.getMaterials(options).then(function (result) {

                return result;
            });
        }

        function getAsPlannedBOP(options) {
            return dataService.getAsPlannedBOP('$filter=Completed eq true').then(function (result) {

                return result;
            });
        }


        function getProcess(options) {
            initData();

            return dataService.getAsPlannedBOP("$expand=Processes($expand=ParentProcesses)&$filter=Id eq " + pgFields.asPlannedBoP.value.Id).then(function (result) {
                var resultData = [];
                vm.parentProcess = result.value[0];

                var pId = vm.parentProcess.Processes[0].Id;
                var searchArr = vm.childProcess.filter(x => x.ParentProcess_Id == pId && x.AsPlannedBOP_Id == pgFields.asPlannedBoP.value.Id);
                var resultArr = [];

                if (searchArr.length > 0) {
                    var tempArr = [];
                    for (var i = 0; i < searchArr.length; i++) {
                        tempArr.push(searchArr[i]);
                    }
                    resultArr = getLastSubProcess(vm.childProcess, tempArr);
                    vm.resultProcess = resultArr;

                    var data = [];
                    for (var i = 0; i < vm.resultProcess.length; i++) {
                        var findData = vm.processes.find(x => x.Id == vm.resultProcess[i].ChildProcess_Id);
                        data.push(findData);
                    }
                    resultData = data;

                }
                else {
                    resultData = vm.parentProcess.Processes;
                    //return result2;
                }
                result.value = resultData;
                return result;
            });
        }

        function getLastSubProcess(list, arr) {
            var tempArr = [];
            var check = false;
            if (list && arr) {
                for (var i = 0; i < arr.length; i++) {
                    var pId = arr[i].ChildProcess_Id;
                    var searchArr = list.filter(x => x.ParentProcess_Id == pId && x.AsPlannedBOP_Id == pgFields.asPlannedBoP.value.Id);
                    if (searchArr.length == 0) {
                        console.log('lk00');
                    }
                    if (searchArr.length > 0) {
                        for (var j = 0; j < searchArr.length; j++) {
                            tempArr.push(searchArr[j]);
                        }
                    }
                    else {
                        check = true;
                        tempArr = arr;
                        break;
                    }
                }
            }
            if (!check) {
                tempArr = getLastSubProcess(list, tempArr);
            }
            // Process 재귀함수 마무리

            return tempArr;
        }

        function ProcessChange(oldVal, newVal, form) {
            vm.currentItem.Process = newVal;
            if (pgFields.asPlannedBoP.value.Id && pgFields.process.value.Id) {

                dataService.getOperation('$expand=ParentProcess,ChildOperation,AsPlannedBOP&$filter=ParentProcess_Id eq ' + pgFields.process.value.Id + '  and AsPlannedBOP_Id eq ' + pgFields.asPlannedBoP.value.Id).then(function (data) {

                    var OperationData = [];
                    for (var i = 0; i < data.value.length; i++) {
                        OperationData.push({
                            'Id': data.value[i].ChildOperation.Id,
                            'NId': data.value[i].ChildOperation.NId
                        });
                    }

                    vm.operations = OperationData;

                    getPropertyGridValues();
                    configurePropertyGrid();
                });
            }
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }
    }


    mod.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_FirstArticleInspectionManagement_FirstArticleInspectionManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/FirstArticleInspectionManagement';

        var state = {
            name: screenStateName + '.add',
            url: '/add',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/FirstArticleInspectionManagement-add.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Add'
            }
        };


        $stateProvider.state(state);
        aliasProvider.register(state);


    }
}());
