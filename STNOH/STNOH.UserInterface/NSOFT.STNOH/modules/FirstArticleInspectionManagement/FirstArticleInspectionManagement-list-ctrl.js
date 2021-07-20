(function () {
    'use strict';
    angular.module('NSOFT.STNOH.FirstArticleInspectionManagement').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.FirstArticleInspectionManagement.FirstArticleInspectionManagement');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_FirstArticleInspectionManagement_FirstArticleInspectionManagement';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];
            self.translate = {
                "add": $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.add'),
                "edit": $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.edit'),
                "delete": $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.delete')
            }
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

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    field: 'NId',
                    direction: 'asc',
                    fields: [
                        { field: 'NId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.NId') },
                        { field: 'MaterialNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.MaterialNId') },
                        { field: 'BoPNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.BoPNId') },
                        { field: 'OperationNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.OperationNId') }
                    ]
                },
                image: 'fa-cube',
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'NId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.NId') },
                        { field: 'MaterialNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.MaterialNId') },
                        { field: 'BoPNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.BoPNId') },
                        { field: 'OperationNId', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.OperationNId') },
                        { field: 'StartDate', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.startDate'), cellFilter: 'date:"yyyy-MM-dd"' },
                        { field: 'EndDate', displayName: $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.endDate'), cellFilter: 'date:"yyyy-MM-dd"' }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function initGridData() {
            dataService.getAll().then(function (data) {
                if ((data) && (data.succeeded)) {
                    self.viewerData = data.value;
                    dataService.getMaterials().then(function (data2) {
                        if ((data2) && (data2.succeeded))
                            for (var i = 0; i < self.viewerData.length; i++) {
                                self.viewerData[i].MaterialNId = typeof (data2.value.find(x => x.Id == self.viewerData[i].MaterialId))
                                    == 'undefined' ? 'deleted' : data2.value.find(x => x.Id == self.viewerData[i].MaterialId).NId;
                            }
                        dataService.getProcess().then(function (data3) {
                            if ((data3) && (data3.succeeded)) {
                                for (var i = 0; i < self.viewerData.length; i++) {
                                    self.viewerData[i].BoPNId = typeof (data3.value.find(x => x.Id == self.viewerData[i].BoPId))
                                        == 'undefined' ? 'deleted' : data3.value.find(x => x.Id == self.viewerData[i].BoPId).NId;
                                }
                                dataService.getOperations().then(function (data4) {
                                    if ((data4) && (data4.succeeded)) {
                                        for (var i = 0; i < self.viewerData.length; i++) {
                                            self.viewerData[i].OperationNId = typeof (data4.value.find(x => x.Id == self.viewerData[i].OperationId))
                                                == 'undefined' ? 'deleted' : data4.value.find(x => x.Id == self.viewerData[i].OperationId).NId;
                                        }
                                    }
                                }, backendService.backendError);
                            }

                        }, backendService.backendError);
                    }, backendService.backendError);
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
            var text = $translate.instant('NSOFT_STNOH_FirstArticleInspectionManagement.deleteConfirmMessage');

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
        var moduleStateName = 'home.NSOFT_STNOH_FirstArticleInspectionManagement';
        var moduleStateUrl = 'NSOFT.STNOH_FirstArticleInspectionManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/FirstArticleInspectionManagement';

        var state = {
            name: moduleStateName + '_FirstArticleInspectionManagement',
            url: '/' + moduleStateUrl + '_FirstArticleInspectionManagement',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/FirstArticleInspectionManagement-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_FirstArticleInspectionManagement.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
