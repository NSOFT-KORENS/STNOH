(function () {
    'use strict';

    var controllerName = 'mdui_LaborTrainingMgt_Add_Ctrl';
    var backendService;

    var laborDocumentModule = angular.module('NSOFT.STNOH.laborTraining');


    laborDocumentModule.controller(controllerName,
        ['NSOFT.STNOH.laborTraining.laborTraining.service',
            '$state', '$stateParams', 'common.base', '$filter', '$scope',
            'u4dm.constants',
            'u4dm.services',
            '$translate',
            '$q',
            AddScreenController]);



    function AddScreenController(dataService, $state, $stateParams, common, $filter, $scope, u4dmConstants, u4dmSvc, $translate, $q) {
        var nowLang = common.services.globalization.globalizationService.getLocale();

        var vm = this;

        var pgFields = {};

        vm.currentItem = {};

        var icon = u4dmSvc.icons.icon;
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.disableButton = false;
        vm.createInProgess = false;
        vm.inputItem = {};
        vm.TrainingType = [];
        vm.StatusList = [];
        vm.CommonCode = [];
        vm.certData = [];
        var cnt = 0;
        vm.mode = $state.params.selectedItem ? 'edit' : 'add';

        if ($state.toState.name == "home.NSOFT_STNOH_LaborTraining_LaborTrainingDetail.SetLaborTrainingStatus")
            vm.mode = 'change';

        if (vm.mode != 'add') {
            vm.currentItem = $state.params.selectedItem;
        }

        vm.onCustomActionComplete = null;
        vm.validInputs = true;


        vm.save = save;
        vm.update = update;
        vm.change = change;
        vm.cancel = cancel;

        function init() {

            // initialize the side panel
            u4dmSvc.ui.sidePanel.setTitle('sit.u4dm.add');
            u4dmSvc.ui.sidePanel.open('e');

            if (vm.mode != 'change')
                initTrainingType();
            else
                initStatus();


            vm.validInputs = false;
        }

        init();

        function initStatus() {

            dataService.getAll2("$expand=Statuses&$filter=NId eq " + "'EducationStateMachine'", "StateMachine", "AppU4DM").then(function (data) {
                if (data) {

                    for (var i = 0; i < data.value[0].Statuses.length; i++) {
                        vm.StatusList.push({
                            "NId": data.value[0].Statuses[i].NId,
                            "Id": data.value[0].Statuses[i].Id
                        });
                    }
                    configureSidePanel();
                    configurePropertyGrid();
                }
            })
        }


        function getCertifications() {
            return dataService.getCommonCode("");
        }

        function getCommonCode() {
            return dataService.getCommonCode("");
        }


        function initTrainingType() {
            $q.all(
                [
                    getCertifications(),
                    getCommonCode()
                ]).then(function (result) {

                    vm.certData = result[0].value;
                    vm.CommonCode = result[1].value;

                    for (var i = 0; i < vm.CommonCode.length; i++) {
                        vm.TrainingType.push({
                            "Code": vm.CommonCode[i].Description,
                            "Name": vm.CommonCode[i].Description
                        })
                    }

                    configureSidePanel();
                    configurePropertyGrid();

                });


        }

        function configureSidePanel(mode) {

            if (vm.mode == 'add') {
                vm.sidepanelConfig = {
                    title: $translate.instant('NSOFT_STNOH_LaborTraining.addTitle'),
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
            else if (vm.mode == 'edit') {
                vm.sidepanelConfig = {
                    title: $translate.instant('NSOFT_STNOH_LaborTraining.editTitle'),
                    messages: [],
                    actionButtons: [
                        {
                            label: u4dmSvc.globalization.translate('sit.u4dm.save'),
                            onClick: vm.update,
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
            else {
                vm.sidepanelConfig = {
                    title: $translate.instant('NSOFT_STNOH_LaborTraining.SetLaborTrainingStatus'),
                    messages: [],
                    actionButtons: [
                        {
                            label: u4dmSvc.globalization.translate('sit.u4dm.save'),
                            onClick: vm.change,
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

        }

        u4dmSvc.messaging.subscribe($scope, 'sit-property-grid.validity-changed', function (event, params) {
            vm.validInputs = params.validity;
            configureSidePanel();
        });


        function configurePropertyGrid() {
            propGridMgr.clear();

            if (vm.mode == 'add') {
                pgFields.nid = propGridMgr.createTextProperty({
                    id: 'nid',
                    labelKey: 'sit.u4dm.nid',
                    value: vm.inputItem.NId,
                    read_only: false,
                    required: true,
                    checkSpecialChars: true
                });

                pgFields.name = propGridMgr.createTextProperty({
                    id: 'name',
                    labelKey: 'sit.u4dm.name',
                    value: vm.inputItem.Name,
                    read_only: false,
                    required: true
                });

                pgFields.description = propGridMgr.createTextProperty({
                    id: 'description',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.description'),
                    value: vm.inputItem.Description,
                    read_only: false,
                    required: false
                });

                pgFields.TrainingType = propGridMgr.createComboBoxProperty({
                    id: 'TrainingType',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.TrainingType'),
                    value: typeof vm.inputItem.TrainingType != 'undefined' ? vm.TrainingType[0] : vm.inputItem.TrainingType,
                    required: true,
                    read_only: false,
                    dataSource: vm.TrainingType,
                    displayProperty: "Name",
                    valueProperty: "Code"
                });

                pgFields.FromTrainingDate = propGridMgr.createDateTimePickerProperty({
                    id: 'FromTrainingDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.FromTrainingDate'),
                    required: true,
                    value: typeof vm.inputItem.FromTrainingDate != 'undefined' && vm.inputItem.FromTrainingDate != null
                        ? new Date(vm.inputItem.FromTrainingDate) : null,
                    format: 'yyyy-MM-dd'
                    //     validationCallback: validateFromDate
                });

                pgFields.ToTrainingDate = propGridMgr.createDateTimePickerProperty({
                    id: 'ToTrainingDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.ToTrainingDate'),
                    required: false,
                    format: 'yyyy-MM-dd',
                    value: typeof vm.inputItem.ToTrainingDate != 'undefined' && vm.inputItem.ToTrainingDate != null
                        ? new Date(vm.inputItem.ToTrainingDate) : null
                    //      validationCallback: validateToDate
                });


                var certOptions = u4dmSvc.icv.configureIcvByEntity4EPServer('CertificationSpecification', getCertifications);
                certOptions.gridConfig.columnDefs = certOptions.gridConfig.columnDefs.filter(x => x.type != 'number');

                pgFields.Certificate = propGridMgr.createEntityPickerProperty({
                    id: 'Certificate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.Certificate'),
                    value: vm.currentItem.Certificate,
                    read_only: false,
                    displayProperty: "NId",
                    pickerOptions: certOptions,
                    dataSource: {
                        getAll: getCertifications,
                        searchField: 'NId'
                    },
                    onChange: CertificateChange
                });

                pgFields.ExpirationDate = propGridMgr.createDateProperty({
                    id: 'ExpirationDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.ExpirationDate'),
                    invisible: !(vm.currentItem.Certificate),
                    required: vm.currentItem.Certificate ? true : false,
                    value: vm.currentItem != null ? vm.currentItem.ExpirationDate : null
                });

                var standardGridData = [
                    pgFields.nid,
                    pgFields.name,
                    pgFields.description,
                    pgFields.TrainingType,
                    pgFields.FromTrainingDate,
                    pgFields.ToTrainingDate,
                    pgFields.Certificate,
                    pgFields.ExpirationDate
                ];


                propGridMgr.data = standardGridData;

                propGridMgr.getValues = getStandardPropertyGridValues;
                vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
            }
            else if (vm.mode == 'edit') {

                pgFields.nid = propGridMgr.createTextProperty({
                    id: 'nid',
                    labelKey: 'sit.u4dm.nid',
                    value: typeof vm.currentItem != 'undefined' ? vm.currentItem.NId : '',
                    read_only: true,
                    required: true,
                    checkSpecialChars: true
                });

                pgFields.name = propGridMgr.createTextProperty({
                    id: 'name',
                    labelKey: 'sit.u4dm.name',
                    value: typeof vm.currentItem != 'undefined' ? vm.currentItem.Name : '',
                    read_only: false,
                    required: true
                });

                pgFields.description = propGridMgr.createTextProperty({
                    id: 'description',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.description'),
                    value: typeof vm.currentItem != 'undefined' ? vm.currentItem.Description : '',
                    read_only: false,
                    required: false
                });

                pgFields.TrainingType = propGridMgr.createComboBoxProperty({
                    id: 'TrainingType',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.TrainingType'),
                    value: typeof vm.currentItem != 'undefined' ? vm.TrainingType.find(x => x.Code == vm.currentItem.TrainingType) : vm.TrainingType[0],
                    required: true,
                    read_only: false,
                    dataSource: vm.TrainingType,
                    displayProperty: "Name",
                    valueProperty: "Code"
                });


                pgFields.FromTrainingDate = propGridMgr.createDateTimePickerProperty({
                    id: 'FromTrainingDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.FromTrainingDate'),
                    required: true,
                    value: vm.currentItem != null ? vm.currentItem.FromTrainingDate != null ? new Date(vm.currentItem.FromTrainingDate) : '' : '',
                    format: 'yyyy-MM-dd',
                    //      validationCallback: validateFromDate
                });

                pgFields.ToTrainingDate = propGridMgr.createDateTimePickerProperty({
                    id: 'ToTrainingDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.ToTrainingDate'),
                    required: false,
                    format: 'yyyy-MM-dd',
                    value: vm.currentItem != null ? vm.currentItem.ToTrainingDate != null ? new Date(vm.currentItem.ToTrainingDate) : '' : ''
                    //     validationCallback: validateToDate
                });

                var certOptions = u4dmSvc.icv.configureIcvByEntity4EPServer('CertificationSpecification', getCertifications);
                certOptions.gridConfig.columnDefs = certOptions.gridConfig.columnDefs.filter(x => x.type != 'number');

                pgFields.Certificate = propGridMgr.createEntityPickerProperty({
                    id: 'Certificate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.Certificate'),
                    value: vm.certData.find(x => x.Id == vm.currentItem.Certification_Id),
                    read_only: false,
                    displayProperty: "NId",
                    pickerOptions: certOptions,
                    dataSource: {
                        getAll: getCertifications,
                        searchField: 'NId'
                    },
                    onChange: CertificateChange
                });

                pgFields.ExpirationDate = propGridMgr.createDateProperty({
                    id: 'ExpirationDate',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.ExpirationDate'),
                    invisible: !(vm.currentItem.Certificate),
                    required: vm.currentItem.Certificate ? true : false,
                    value: vm.currentItem != null ? vm.currentItem.ExpirationDate : ''
                    //  validationCallback: validateToDate
                });


                // pgFields.Certificate = propGridMgr.createTextProperty({
                //     id: 'Certificate',
                //     label: $translate.instant('NSOFT_Labor_LaborTraining.Certificate'),
                //     value: typeof vm.currentItem != 'undefined' ? vm.currentItem.Certificate : '',
                //     read_only: false,
                //     required: false
                // });

                // pgFields.CertificateLevel = propGridMgr.createTextProperty({
                //     id: 'CertificateLevel',
                //     label: $translate.instant('NSOFT_Labor_LaborTraining.CertificateLevel'),
                //     value: typeof vm.currentItem != 'undefined' ? vm.currentItem.CertificateLevel : '',
                //     read_only: false,
                //     required: false
                // });

                // ,
                // onChange: function (oldVal, newVal, form) {
                //     getStandardPropertyGridValues();
                // }

                var standardGridData = [
                    pgFields.nid,
                    pgFields.name,
                    pgFields.description,
                    pgFields.TrainingType,
                    pgFields.FromTrainingDate,
                    pgFields.ToTrainingDate,
                    pgFields.Certificate,
                    pgFields.ExpirationDate
                ];


                propGridMgr.data = standardGridData;

                propGridMgr.getValues = getStandardPropertyGridValues;
                vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
            }
            else {
                pgFields.status = propGridMgr.createComboBoxProperty({
                    id: 'status',
                    label: $translate.instant('NSOFT_STNOH_LaborTraining.Status'),
                    value: typeof vm.currentItem != 'undefined' ? vm.StatusList.find(x => x.NId == vm.currentItem.Status.StatusNId) : vm.StatusList[0],
                    required: true,
                    read_only: false,
                    dataSource: vm.StatusList,
                    displayProperty: "NId",
                    valueProperty: "Id"
                });

                // typeof vm.currentItem != 'undefined' ? vm.TrainingType.find(x => x.Code == vm.currentItem.TrainingType) : vm.TrainingType[0],

                var standardGridData = [
                    pgFields.status
                ];

                propGridMgr.data = standardGridData;

                propGridMgr.getValues = getStandardPropertyGridValues;
                vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
            }
        }

        function CertificateChange(oldVal, newVal, form) {
            vm.currentItem.Certificate = newVal;
            vm.currentItem.ExpirationDate = null;

            vm.inputItem.NId = pgFields.nid.value;
            vm.inputItem.Name = pgFields.name.value;
            vm.inputItem.Description = pgFields.description.value;
            vm.inputItem.TrainingType = pgFields.TrainingType.value;
            vm.inputItem.FromTrainingDate = pgFields.FromTrainingDate.value;
            vm.inputItem.ToTrainingDate = pgFields.ToTrainingDate.value;

            getPropertyGridValues();
            configurePropertyGrid();

        }

        function getPropertyGridValues() {
            return vm.propertyGrid.getValues(vm.currentItem, getStandardPropertyGridValues);
        }


        function getCertifications(options) {
            return dataService.getCertifications(options).then(function (result) {

                return result;
            });
        }


        function getStandardPropertyGridValues(item) {
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }

        function validateFromDate(date) {
            var toDate = new Date(pgFields.ToTrainingDate.value);

            if (toDate !== null && (date >= toDate)) {
                var message = $translate.instant('NSOFT_STNOH_LaborTraining.validFromMsg');
                pgFields.FromTrainingDate.setValidationMessage(message);
                pgFields.ToTrainingDate.setValidationMessage(message);
                pgFields.ToTrainingDate.setValidity(false);
                return false;
            }
            else {
                if (cnt == 0) {
                    cnt = 1;
                    return true;
                }
                pgFields.ToTrainingDate.setValidity(true);
                return true;

            }
            return true;
        }


        function validateToDate(date) {
            var fromDate = new Date(pgFields.FromTrainingDate.value);
            var current = new Date();

            if (fromDate !== null && (date <= fromDate)) {
                var message = $translate.instant('NSOFT_STNOH_LaborTraining.validToMsg');
                pgFields.ToTrainingDate.setValidationMessage(message);
                pgFields.FromTrainingDate.setValidationMessage(message);
                pgFields.FromTrainingDate.setValidity(false);
                return false;
            }
            else {
                pgFields.ToTrainingDate.setValidity(true);
                pgFields.FromTrainingDate.setValidity(true);
                return true;
            }
            return true;
        }

        function save() {

            var inputItem = {
                'NId': pgFields.nid.value,
                'Name': pgFields.name.value,
                'Description': pgFields.description.value,
                'TrainingType': pgFields.TrainingType.selectedObject.Code,
                'FromTrainingDate': pgFields.FromTrainingDate.value,
                'ToTrainingDate': pgFields.ToTrainingDate.value == "" ? null : pgFields.ToTrainingDate.value,
                'ExpirationDate': pgFields.ExpirationDate.value == "" ? null : pgFields.ExpirationDate.value
                //'CertificateLevel': pgFields.CertificateLevel.value
            };

            if (pgFields.Certificate.hasOwnProperty('_valueObj')) {
                inputItem.Certificate = pgFields.Certificate._valueObj.NId;
                inputItem.Certification = pgFields.Certificate._valueObj.Id
            }

            dataService.create(inputItem).then(onSaveSuccess);
        }

        function update() {
            var inputItem = {
                'Id': vm.currentItem.Id,
                'Name': pgFields.name.value,
                'Description': pgFields.description.value,
                'TrainingType': pgFields.TrainingType.selectedObject.Code,
                'FromTrainingDate': pgFields.FromTrainingDate.value,
                'ToTrainingDate': pgFields.ToTrainingDate.value == "" ? null : pgFields.ToTrainingDate.value,
                'ExpirationDate': pgFields.ExpirationDate.value == "" ? null : pgFields.ExpirationDate.value
                //'CertificateLevel': pgFields.CertificateLevel.value
            };

            if (pgFields.Certificate.hasOwnProperty('_valueObj')) {
                inputItem.Certificate = pgFields.Certificate._valueObj.NId;
                inputItem.Certification = pgFields.Certificate._valueObj.Id
            }

            dataService.update(inputItem).then(onSaveSuccess);
        }


        function change() {

            var inputItem = {
                'Id': vm.currentItem.Id,
                'Status': pgFields.status.value.Id
            };

            dataService.change(inputItem).then(onSaveSuccess);
        }


        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

    }


    laborDocumentModule.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var moduleStateName = 'home.NSOFT_STNOH_laborTraining';
        var moduleStateUrl = 'NSOFT_STNOH_laborTraining';
        var moduleFolder = 'NSOFT.STNOH/blueprints/laborTraining';

        var state = {
            name: moduleStateName + '_laborTraining',
            url: '/' + moduleStateUrl + '_laborTraining',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/laborTraining-add.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_laborTraining.addTitle'
            },
            params: {
                mode: null
            }
        };
        $stateProvider.state(state);

    }
}());