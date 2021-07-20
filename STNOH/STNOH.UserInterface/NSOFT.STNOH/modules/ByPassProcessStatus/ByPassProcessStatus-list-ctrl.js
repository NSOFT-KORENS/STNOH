(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ByPassProcessStatus').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus.service', '$state', '$stateParams', '$rootScope',
        '$scope', 'common.base', 'common.services.logger.service', '$translate', 'common.services.filterPersonalization.filterPersonalizationService', '$q'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate, personalizeService, $q) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ByPassProcessStatus.ByPassProcessStatus');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_ByPassProcessStatus_ByPassProcessStatus';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];
            self.afterFilterData = [];
            self.selectViewerOptions = {};
            self.selectViewerData = [];

            self.userPreferences = null;
            self.filterClauses = null;

            self.jsonData = [];


        }

        function getSavedFilters(widget, preferenceId) {
            return personalizeService.retrieveFilterClauses(widget, preferenceId);
        }

        function initGridOptions() {
            self.viewerOptions = {
                userPrefId: 'ByPassProcessStatus',
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',
                filterEnabled: true,
                filterBarOptions: 'sqgf',
                filterFields: [
                    {
                        field: 'FinalMaterialNId',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialNId'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'FinalMaterialName',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialName'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassOperationNId',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperationNo'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassOperationName',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperation'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassOperationEquipment',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperationMachine'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassProducingQty',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ProducingQuantity'),
                        type: 'number',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassProducedQty',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ProducedQuantity'),
                        type: 'number',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'ByPassStartDate',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassStartDate'),
                        widget: 'sit-datepicker',
                        type: 'date',
                        default: true,
                    },
                    {
                        field: 'ByPassEndDate',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassEndDate'),
                        type: 'date',
                        widget: 'sit-datepicker',
                        default: true
                    }
                ],
                filterOptions: {
                    "showDefaultClause": true,
                    "showMatchCase": false,
                    "allowedOperators": "andOr,or,and",
                    "groupEnabled": true
                },
                quickSearchOptions: {
                    enabled: true,
                    field: 'ByPassOperationEquipment',
                    placeholderText: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.QuickSearchPlaceholder')
                },
                quickSearchType: 'contains',
                sortInfo: {
                    field: 'MaterialNId',
                    direction: 'asc',
                    fields: [
                        { field: 'FinalMaterialNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialNId') },
                        { field: 'FinalMaterialName', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialName') },
                        { field: 'ByPassOperationNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperationNo') }
                    ]
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'FinalMaterialNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialNId'), width: '10%' },
                        { field: 'FinalMaterialName', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.MaterialName'), width: '10%' },
                        { field: 'ByPassOperationNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperationNo'), width: '12%' },
                        { field: 'ByPassOperationName', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperation'), width: '12%' },
                        { field: 'ByPassOperationEquipment', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassOperationMachine'), width: '12%' },
                        { field: 'ByPassProducingQty', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ProducingQuantity'), width: '9%' },
                        { field: 'ByPassProducedQty', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ProducedQuantity'), width: '9%' },
                        { field: 'ByPassStartDate', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassStartDate'), width: '13%', cellFilter: 'date:"yyyy-MM-dd hh:mm:ss a"' },
                        { field: 'ByPassEndDate', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.ByPassEndDate'), width: '13%', cellFilter: 'date:"yyyy-MM-dd hh:mm:ss a"' }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }


            self.selectViewerOptions = {
                containerID: 'itemlist',
                selectionMode: 'none',
                viewOptions: 'g',
                filterBarOptions: 'sqgf',
                filterFields: [
                    {
                        field: 'Code.CodeNId',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Type'),
                        type: 'string',
                        default: true
                    },
                    {
                        field: 'SnagAndNote.Message',
                        displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Note'),
                        type: 'string',
                        default: false
                    }
                ],
                // TODO: Put here the properties of the entity managed by the service             
                quickSearchOptions: { enabled: true, field: 'SnagAndNote.Message', placeholderText: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.QuickSearchPlaceholder2') },
                quickSearchType: 'contains',
                sortInfo: {
                    field: 'Code.CodeNId',
                    direction: 'asc',
                    fields: [
                        { field: 'Code.CodeNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Type') },
                        { field: 'SnagAndNote.Message', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Note') }
                    ]
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'Code.CodeNId'
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'Code.CodeNId', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Type'), width: '25%' },
                        { field: 'SnagAndNote.Message', displayName: $translate.instant('NSOFT_STNOH_ByPassProcessStatus.Note'), widht: '75%' }
                    ]
                }
            }
        }

        function initGridData() {
            var hasFilter = getSavedFilters('sit-filter', 'ByPassProcessStatus');
            if (hasFilter != null) {
                hasFilter = hasFilter.find(x => x.default == true);
                if (hasFilter != null)
                    self.viewerOptions.filterClauses = hasFilter.filterClauses;
            }

            $q.all(
                [
                    getMain(),
                    getMaterial(),
                    getEquipment()
                ]).then(function (result) {
                    if (result.filter(x => x.succeeded == true).length == 3) {
                        for (var i = 0; i < result[0].value.length; i++) {
                            self.jsonData.push({
                                "WorkOperationId": result[0].value[i].WorkOOperationDependency.ToWOO.Id,
                                "FinalMaterialNId": result[0].value[i].WorkOOperationDependency.ToWOO.WorkOrder.FinalMaterial_Id,
                                "FinalMaterialName": "",
                                "ByPassOperationId": result[0].value[i].WorkOOperationDependency.ToWOO.Operation_Id,
                                "ByPassOperationNId": result[0].value[i].WorkOOperationDependency.ToWOO.Operation.NId,
                                "ByPassOperationName": result[0].value[i].WorkOOperationDependency.ToWOO.Operation.Name,
                                "ByPassOperationEquipment": result[0].value[i].WorkOOperationDependency.ToWOO.ActualUsedMachines.length > 0 ? result[0].value[i].WorkOOperationDependency.ToWOO.ActualUsedMachines[0].Machine : "",
                                "ByPassProducingQty": result[0].value[i].WorkOOperationDependency.ToWOO.PartialWorkedQuantity == null ? 0 : result[0].value[i].WorkOOperationDependency.ToWOO.PartialWorkedQuantity,
                                "ByPassProducedQty": result[0].value[i].WorkOOperationDependency.ToWOO.ProducedQuantity == null ? 0 : result[0].value[i].WorkOOperationDependency.ToWOO.ProducedQuantity,
                                "ByPassStartDate": result[0].value[i].WorkOOperationDependency.ToWOO.ActualStartTime,
                                "ByPassEndDate": result[0].value[i].WorkOOperationDependency.ToWOO.ActualEndTime
                            });
                        }

                        for (var i = 0; i < self.jsonData.length; i++) {
                            var dm_material = result[1].value.find(x => x.Id == self.jsonData[i].FinalMaterialNId);
                            var equipment = result[2].value.find(x => x.NId == self.jsonData[i].ByPassOperationEquipment);

                            self.jsonData[i].FinalMaterialNId = dm_material.Material.NId;
                            self.jsonData[i].FinalMaterialName = dm_material.Material.Name;
                            self.jsonData[i].ByPassOperationEquipment = equipment == null ? "" : equipment.Name;
                        }

                        self.viewerData = self.jsonData;
                    }
                    else {
                        self.viewerData = [];
                    }
                });
        }

        function getMain() {
            return dataService.getAll('AppU4DM', 'WOOpDependencyNavigation',
                "$expand=WorkOOperationDependency" +
                "($expand=ToWOO($expand=WorkOrder($select=FinalMaterial_Id;$expand=ProducedMaterialItems),Operation($select=Id,NId,Name),ActualUsedMachines($select=Machine);$select=ActualUsedMachines,ActualStartTime,ActualEndTime,Status,WorkOrder,Operation,PartialWorkedQuantity,ProducedQuantity,Id);$select=Id)" +
                "&$filter=IsPreferred eq false and AlternativeGroup ne null " +
                "and (WorkOOperationDependency/ToWOO/Status/StatusNId eq 'Active' or WorkOOperationDependency/ToWOO/Status/StatusNId eq 'Partial' or WorkOOperationDependency/ToWOO/Status/StatusNId eq 'Complete')" +
                "&$select=WorkOOperationDependency,IsPreferred,AlternativeGroup");
        }

        function getMaterial() {
            return dataService.getAll('AppU4DM', 'DM_Material', '$expand=Material($select=NId,Name)&$select=Id,Material');
        }

        function getEquipment() {
            return dataService.getAll('AppU4DM', 'EquipmentConfiguration', '$select=NId,Name');
        }

        function initGridData2() {
            if (self.selectedItem == null) {
                self.selectViewerData = [];
                return;
            }
            dataService.getAll('AppU4DM', 'U4dmNote_SnagAndNoteAssociation',
                '$expand=SnagAndNote,WorkOrderOperation($select=OperationNId,WorkOrder;$expand=WorkOrder($select=NId))&$filter=WorkOrderOperation/Id eq ' + self.selectedItem.WorkOperationId).then(function (data) {
                    if ((data) && (data.succeeded)) {
                        self.selectViewerData = data.value;
                    } else {
                        self.selectViewerData = [];
                    }
                }, backendService.backendError);
        }


        function onGridItemSelectionChanged(items, item) {
            if (item && item.selected == true) {
                self.selectedItem = item;
                setButtonsVisibility(true);
                initGridData2();
            } else {
                self.selectedItem = null;
                setButtonsVisibility(false);
                initGridData2();
            }
        }

        // Internal function to make item-specific buttons visible
        function setButtonsVisibility(visible) {
            self.isButtonVisible = visible;
        }

    }

    ListScreenRouteConfig.$inject = ['$stateProvider'];
    function ListScreenRouteConfig($stateProvider) {
        var moduleStateName = 'home.NSOFT_STNOH_ByPassProcessStatus';
        var moduleStateUrl = 'NSOFT.STNOH_ByPassProcessStatus';
        var moduleFolder = 'NSOFT.STNOH/modules/ByPassProcessStatus';

        var state = {
            name: moduleStateName + '_ByPassProcessStatus',
            url: '/' + moduleStateUrl + '_ByPassProcessStatus',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/ByPassProcessStatus-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_ByPassProcessStatus.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
