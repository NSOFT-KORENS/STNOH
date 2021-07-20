(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ByPassProcessList').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.ByPassProcessList.ByPassProcessList.service', '$state', '$stateParams',
        '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;
        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ByPassProcessList.ByPassProcessList');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_ByPassProcessList_ByPassProcessList';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];
            self.OperationDependency = [];
            self.ProcessToOperation = [];
            self.ByPassProcessList = [];

            //Expose Model Methods
            self.addButtonHandler = addButtonHandler;
            self.editButtonHandler = editButtonHandler;
            self.selectButtonHandler = selectButtonHandler;
            self.deleteButtonHandler = deleteButtonHandler;
        }

        function initGridOptions() {
            self.viewerOptions = {
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',
                filterBarOptions: 'sqgf',
                filterFields: [
                    {
                        field: 'MaterialNId',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialNId'),
                        type: 'string',
                        default: true
                    },
                    {
                        field: 'MaterialName',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialName'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'MainOperationNo',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperationNo'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'MainOperation',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperation'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'MainOperationMachine',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperationMachine'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'ByPassOperationNo',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperationNo'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'ByPassOperation',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperation'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'ByPassOperationMachine',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperationMachine'),
                        type: 'string',
                        default: false
                    },
                ],
                // TODO: Put here the properties of the entity managed by the service
                userPrefId: 'ByPassProcessList',
                quickSearchOptions: { enabled: true, field: 'MainOperationMachine', placeholderText: $translate.instant('NSOFT_STNOH_ByPassProcessList.QuickSearchPlaceholder') },
                quickSearchType: 'contains',
                sortInfo: {
                    field: 'MaterialNId',
                    direction: 'asc',
                    fields: [
                        { field: 'MaterialNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialNId') },
                        { field: 'MaterialName', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialName') },
                        { field: 'MainOperationNo', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperationNo') }
                    ]
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'Id'
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'MaterialNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialNId') },
                        { field: 'MaterialName', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MaterialName') },
                        { field: 'MainOperationNo', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperationNo') },
                        { field: 'MainOperation', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperation') },
                        { field: 'MainOperationMachine', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MainOperationMachine') },
                        { field: 'MTTR', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MTTR') },
                        { field: 'MTBF', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.MTBF') },
                        { field: 'ByPassOperationNo', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperationNo') },
                        { field: 'ByPassOperation', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperation') },
                        { field: 'ByPassOperationMachine', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessList.ByPassOperationMachine') },
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function initGridData() {
            dataService.getAll('AppU4DM', 'ProcessToOpLinkDependencyNavigation', '$expand=OperationDependency&$filter=ParentNavigation eq null').then(function (data) {
                if ((data) && (data.succeeded)) {

                    var json = [];

                    for (var i = 0; i < data.value.length; i++) {
                        json.push(
                            {
                                "AsPlannedBoP_Id": data.value[i].OperationDependency.AsPlannedBoP_Id,
                                "LinkFrom_Id": data.value[i].OperationDependency.LinkFrom_Id,
                                "LinkTo_Id": data.value[i].OperationDependency.LinkTo_Id,
                                "IsPreferred": data.value[i].IsPreferred
                            }
                        )
                    }

                    self.OperationDependency = json;

                    dataService.getAll('AppU4DM', 'ProcessToOperationLink', '$expand=ChildOperation').then(function (data2) {
                        if ((data2) && (data2.succeeded)) {
                            var groupArr = [];
                            var json = [];
                            for (var i = 0; i < self.OperationDependency.length; i++) {
                                var operation = data2.value.find(x => x.Id == self.OperationDependency[i].LinkTo_Id && x.aAsPlannedBOP_Id == self.OperationDependency[i].AsPlanned_BoP_Id).ChildOperation;

                                if (typeof json.find(x => x.AsPlannedBoP_Id == self.OperationDependency[i].AsPlannedBoP_Id
                                    && x.LinkFrom_Id == self.OperationDependency[i].LinkFrom_Id) == 'undefined') {
                                    groupArr.push({
                                        "AsPlannedBoP_Id": self.OperationDependency[i].AsPlannedBoP_Id,
                                        "LinkFrom_Id": self.OperationDependency[i].LinkFrom_Id
                                    });
                                }

                                if (self.OperationDependency[i].IsPreferred == true) {
                                    groupArr.find(x => x.AsPlannedBoP_Id == self.OperationDependency[i].AsPlannedBoP_Id && x.LinkFrom_Id == self.OperationDependency[i].LinkFrom_Id).MainOperation = self.OperationDependency[i].LinkTo_Id;
                                }

                                json.push(
                                    {
                                        "AsPlannedBoP_Id": self.OperationDependency[i].AsPlannedBoP_Id,
                                        "LinkFrom_Id": self.OperationDependency[i].LinkFrom_Id,
                                        "MainOperationId": "",
                                        "MainPTO_Id": "",
                                        "MainOperationNo": "",
                                        "MainOperation": "",
                                        "ByPassOperationId": self.OperationDependency[i].LinkTo_Id,
                                        "ByPassPTO_Id": operation.Id,
                                        "ByPassOperationNo": operation.NId,
                                        "ByPassOperation": operation.Name,
                                        "isMain": self.OperationDependency[i].IsPreferred
                                    }
                                );
                            }

                            for (var i = 0; i < groupArr.length; i++) {
                                var filterArr = json.filter(x => x.AsPlannedBoP_Id == groupArr[i].AsPlannedBoP_Id && x.LinkFrom_Id == groupArr[i].LinkFrom_Id);

                                for (var j = 0; j < filterArr.length; j++) {
                                    if (filterArr[j].isMain) {

                                        json.splice(json.findIndex(x => x == filterArr[j]), 1)
                                    }

                                    var jsonTemp = json.filter(x => x.AsPlannedBoP_Id == groupArr[i].AsPlannedBoP_Id && x.LinkFrom_Id == groupArr[i].LinkFrom_Id);
                                    if (typeof jsonTemp != 'undefined') {
                                        for (var k = 0; k < jsonTemp.length; k++) {
                                            var op = data2.value.find(x => x.Id == groupArr[i].MainOperation && x.aAsPlannedBOP_Id == self.OperationDependency[i].AsPlanned_BoP_Id).ChildOperation;
                                            jsonTemp[k].MainOperationId = groupArr[i].MainOperation;
                                            jsonTemp[k].MainPTO_Id = op.Id;
                                            jsonTemp[k].MainOperationNo = op.NId;
                                            jsonTemp[k].MainOperation = op.Name;
                                        }
                                    }
                                }
                            }

                            self.ProcessToOperation = json;

                            dataService.getAll('AppU4DM', 'EquipmentSpecification', '').then(function (data3) {
                                if ((data3) && (data3.succeeded)) {

                                    var json = [];
                                    for (var i = 0; i < self.ProcessToOperation.length; i++) {
                                        var main = data3.value.find(x => x.AsPlannedBOP_Id == self.ProcessToOperation[i].AsPlannedBoP_Id && x.ParentOperation_Id == self.ProcessToOperation[i].MainPTO_Id);
                                        var byPass = data3.value.find(x => x.AsPlannedBOP_Id == self.ProcessToOperation[i].AsPlannedBoP_Id && x.ParentOperation_Id == self.ProcessToOperation[i].ByPassPTO_Id);
                                        json.push(
                                            {
                                                "AsPlannedBoP_Id": self.ProcessToOperation[i].AsPlannedBoP_Id,
                                                "MainOperationId": self.ProcessToOperation[i].MainOperationId,
                                                "MainOperationNo": self.ProcessToOperation[i].MainOperationNo,
                                                "MainOperation": self.ProcessToOperation[i].MainOperation,
                                                "MainOperationMachine": typeof main != 'undefined' ? (main.Type == "'Equipment Type'" ? main.EquipmentTypeNId : main.EquipmentNId) : '',
                                                "MainOperationMachineType": typeof main != 'undefined' ? main.Type : '',
                                                "ByPassOperationId": self.ProcessToOperation[i].ByPassOperationId,
                                                "ByPassOperationNo": self.ProcessToOperation[i].ByPassOperationNo,
                                                "ByPassOperation": self.ProcessToOperation[i].ByPassOperation,
                                                "ByPassOperationMachine": typeof byPass != 'undefined' ? (byPass.Type == "'Equipment Type'" ? byPass.EquipmentTypeNId : byPass.EquipmentNId) : '',
                                                "ByPassOperationMachineType": typeof byPass != 'undefined' ? byPass.Type : ''
                                            }
                                        )
                                    }

                                    self.ByPassProcessList = json;

                                    dataService.getAll('AppU4DM', 'Process', '$expand=AsPlannedBOP').then(function (data4) {
                                        if ((data4) && (data4.succeeded)) {

                                            for (var i = 0; i < self.ByPassProcessList.length; i++) {
                                                self.ByPassProcessList[i].FinalMaterialId = data4.value.find(x => x.AsPlannedBOP.find(c => c.Id == self.ByPassProcessList[i].AsPlannedBoP_Id)).FinalMaterialId_Id;
                                            }

                                            dataService.getAll('AppU4DM', 'DM_Material', '$expand=Material').then(function (data5) {
                                                if ((data5) && (data5.succeeded)) {

                                                    for (var i = 0; i < self.ByPassProcessList.length; i++) {
                                                        self.ByPassProcessList[i].MaterialNId = data5.value.find(x => x.Id == self.ByPassProcessList[i].FinalMaterialId).Material.NId;
                                                        self.ByPassProcessList[i].MaterialName = data5.value.find(x => x.Id == self.ByPassProcessList[i].FinalMaterialId).Material.Name;
                                                    }

                                                    dataService.getAll('AppU4DM', 'EquipmentConfiguration', '').then(function (data6) {
                                                        if ((data6) && (data6.succeeded)) {

                                                            for (var i = 0; i < self.ByPassProcessList.length; i++) {
                                                                if (self.ByPassProcessList[i].MainOperationMachineType != "'Equipment Type'")
                                                                    self.ByPassProcessList[i].MainOperationMachine = typeof data6.value.find(x => x.NId == self.ByPassProcessList[i].MainOperationMachine) != 'undefined'
                                                                        ? data6.value.find(x => x.NId == self.ByPassProcessList[i].MainOperationMachine).Name : self.ByPassProcessList[i].MainOperationMachine;
                                                                if (self.ByPassProcessList[i].ByPassOperationMachineType != "'Equipment Type'")
                                                                    self.ByPassProcessList[i].ByPassOperationMachine = typeof data6.value.find(x => x.NId == self.ByPassProcessList[i].ByPassOperationMachine) != 'undefined'
                                                                        ? data6.value.find(x => x.NId == self.ByPassProcessList[i].ByPassOperationMachine).Name : self.ByPassProcessList[i].ByPassOperationMachine;
                                                            }

                                                            self.viewerData = self.ByPassProcessList;
                                                        }
                                                        else {
                                                            self.viewerData = [];
                                                        }
                                                    }, backendService.backendError)
                                                }
                                                else {
                                                    self.viewerData = [];
                                                }
                                            }, backendService.backendError)
                                        }
                                        else {
                                            self.viewerData = [];
                                        }
                                    }, backendService.backendError)
                                }
                                else {
                                    self.viewerData = [];
                                }
                            }, backendService.backendError)
                        }
                        else {
                            self.viewerData = [];
                        }
                    }, backendService.backendError)
                } else {
                    self.viewerData = [];
                }
            }, backendService.backendError);
        }

        function addButtonHandler(clickedCommand) {
            $state.go(rootstate + '.add');
        }

        function editButtonHandler(clickedCommand) {
            // TODO: Put here the properties of the entity managed by the service
            $state.go(rootstate + '.edit', { id: self.selectedItem.Id, selectedItem: self.selectedItem });
        }

        function selectButtonHandler(clickedCommand) {
            // TODO: Put here the properties of the entity managed by the service
            $state.go(rootstate + '.select', { id: self.selectedItem.Id, selectedItem: self.selectedItem });
        }

        function deleteButtonHandler(clickedCommand) {
            var title = "Delete";
            // TODO: Put here the properties of the entity managed by the service
            var text = "Do you want to delete '" + self.selectedItem.Id + "'?";

            backendService.confirm(text, function () {
                dataService.delete(self.selectedItem).then(function () {
                    $state.go(rootstate, {}, { reload: true });
                }, backendService.backendError);
            }, title);
        }

        function onGridItemSelectionChanged(items, item) {
            if (item && item.selected == true) {
                self.selectedItem = item;
                setButtonsVisibility(true);
            } else {
                self.selectedItem = null;
                setButtonsVisibility(false);
            }
        }

        // Internal function to make item-specific buttons visible
        function setButtonsVisibility(visible) {
            self.isButtonVisible = visible;
        }
    }

    ListScreenRouteConfig.$inject = ['$stateProvider'];
    function ListScreenRouteConfig($stateProvider) {
        var moduleStateName = 'home.NSOFT_STNOH_ByPassProcessList';
        var moduleStateUrl = 'NSOFT.STNOH_ByPassProcessList';
        var moduleFolder = 'NSOFT.STNOH/modules/ByPassProcessList';

        var state = {
            name: moduleStateName + '_ByPassProcessList',
            url: '/' + moduleStateUrl + '_ByPassProcessList',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/ByPassProcessList-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_ByPassProcessList.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
