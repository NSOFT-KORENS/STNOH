(function () {
    'use strict';
    angular.module('NSOFT.STNOH.AndonOccurrenceStatusandMeasures').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$q', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $q, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.AndonOccurrenceStatusandMeasures.AndonOccurrenceStatusandMeasures');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_AndonOccurrenceStatusandMeasures_AndonOccurrenceStatusandMeasures';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];

        }

        function initGridOptions() {
            self.viewerOptions = {
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc'
                },
                image: 'fa-cube',
                groupField: 'Groups',
                groupFields: [
                    {
                        field: 'Groups',
                        displayName: 'Group'
                    }
                ],
                userPrefId: 'AndonView',
                filterBarOptions: 'sqgf',
                filterFields: [
                    {
                        field: 'NId',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.NId'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'Context',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Context'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'Severity',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Severity'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'Defect',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Defect'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'Machine',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Machine'),
                        type: 'string',
                        default: false
                    },
                    {
                        field: 'StartDate',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.StartDate'),
                        widget: 'sit-datepicker',
                        type: 'date',
                        default: true,
                    },
                    {
                        field: 'EndDate',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.EndDate'),
                        type: 'date',
                        widget: 'sit-datepicker',
                        default: true
                    },
                    {
                        field: 'Status',
                        displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Status'),
                        type: 'string',
                        default: false
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
                    field: 'Equipment'
                },
                quickSearchType: 'contains',
                gridConfig: {
                    groupsCollapsedByDefault: false,
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'Groups', displayName: 'Groups', visible: false },
                        { field: 'NId', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.NId') },
                        { field: 'Context', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Context') },
                        { field: 'Severity', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Severity') },
                        { field: 'StartDate', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.StartDate'), cellFilter: 'date:"yyyy-MM-dd HH:MM:ss"' },
                        { field: 'Defect', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Defect') },
                        { field: 'Material', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Material'), visible: false },
                        { field: 'Equipment', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Machine') },
                        { field: 'EndDate', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.EndDate'), cellFilter: 'date:"yyyy-MM-dd HH:MM:ss"' },
                        { field: 'Status', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Status') },
                        { field: 'Note', displayName: $translate.instant('NSOFT_STNOH_AndonOccurrenStatusandMeasures.Note') }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function initGridData() {

            $q.all(
                [
                    getNonConformance(),
                    getNonConformanceHistory(),
                    getDefect()
                ]).then(function (result) {
                    var nonConformance = result[0].value;
                    var nonConformanceHistory = result[1].value;

                    var data = [];

                    for (var i = 0; i < nonConformance.length; i++) {

                        if (nonConformance[i].Context == "Machine") {
                            for (var j = 0; j < nonConformance[i].NonConformanceItems.length; j++) {
                                data.push({
                                    "Id": nonConformance[i].Id,
                                    "NId": nonConformance[i].NId,
                                    "Context": nonConformance[i].Context,
                                    "Severity": nonConformance[i].Severity,
                                    "StartDate": nonConformance[i].StartDate,
                                    "Defect": "",
                                    "Equipment": nonConformance[i].NonConformanceItems[j].Equipment,
                                    "Material": "",
                                    "EndDate": nonConformance[i].EndDate,
                                    "Status": nonConformance[i].Status,
                                    "Note": nonConformance[i].Notes,
                                    "Groups": nonConformance[i].NId + " [" + nonConformance[i].Context + "]"
                                });
                                var defects = nonConformanceHistory.filter(x => x.NonConformance.Id == nonConformance[i].Id);
                                defects = defects.filter(x => x.Action == 'ADD DEFECT' || x.Action == 'ADD FAILURE');

                                if (defects.length == 0)
                                    continue;

                                var defect = defects[defects.length - 1];
                                if (defect.Action == "ADD DEFECT") {

                                    data[data.length - 1].Defect = result[2].value.find(x => x.Id == defect.Defect_Id).NId;
                                }
                                else {
                                    data[data.length - 1].Defect = defect.FailureNId
                                }
                            }

                        }
                        // Material 필요할 때 추가
                        // else if (nonConformance[i].Context == "MaterialItem") {
                        //     for (var j = 0; j < nonConformance[i].NonConformanceItems.length; j++) {
                        //         data.push({
                        //             "Id": nonConformance[i].Id,
                        //             "NId": nonConformance[i].NId,
                        //             "Context": nonConformance[i].Context,
                        //             "Severity": nonConformance[i].Severity,
                        //             "StartDate": nonConformance[i].StartDate,
                        //             "Defect": "",
                        //             "Equipment": "",
                        //             "Material": "",
                        //             "EndDate": nonConformance[i].EndDate,
                        //             "Status": nonConformance[i].Status,
                        //             "Note": nonConformance[i].Notes,
                        //             "Groups": nonConformance[i].NId + " [" + nonConformance[i].Context + "]"
                        //         });
                        //     }
                        // }
                    }


                    self.viewerData = data;

                });

        }

        function getNonConformance() {
            //($expand=DM_MaterialTrackingUnit($exapnd=MaterialTrackingUnit),Tool)
            return dataService.getAll("$expand=NonConformanceItems", "NonConformance");
        }

        function getNonConformanceHistory() {
            return dataService.getAll("$expand=NonConformance", "NonConformanceHistory");
        }

        function getDefect() {
            return dataService.getAll("", "DefectType");
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
        var moduleStateName = 'home.NSOFT_STNOH_AndonOccurrenceStatusandMeasures';
        var moduleStateUrl = 'NSOFT_STNOH_AndonOccurrenceStatusandMeasures';
        var moduleFolder = 'NSOFT.STNOH/modules/AndonOccurrenceStatusandMeasures';

        var state = {
            name: moduleStateName + '_AndonOccurrenceStatusandMeasures',
            url: '/' + moduleStateUrl + '_AndonOccurrenceStatusandMeasures',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/AndonOccurrenceStatusandMeasures-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_AndonOccurrenStatusandMeasures.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
