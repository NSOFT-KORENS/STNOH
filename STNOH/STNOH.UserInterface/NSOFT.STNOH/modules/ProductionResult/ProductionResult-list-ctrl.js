(function () {
    'use strict';
    angular.module('NSOFT.STNOH.ProductionResult').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.ProductionResult.ProductionResult.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.ProductionResult.ProductionResult');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_ProductionResult_ProductionResult';
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
                userPrefId: 'InterfaceView',
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',
                filterEnabled: true,
                filterBarOptions: 'sqgf',
                filterFields: [
                    {
                        field: 'InterfaceType',
                        displayName: $translate.instant('NSOFT_STNOH_ProductionResult.InterfaceType'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'TransactionStatus',
                        displayName: $translate.instant('NSOFT_STNOH_ProductionResult.InterfaceStatus'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'Direction',
                        displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Direction'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'Id',
                        displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Id'),
                        type: 'string',
                        widget: 'sit-text',
                        default: false
                    },
                    {
                        field: 'CompletedTxnDate',
                        displayName: $translate.instant('NSOFT_STNOH_ProductionResult.CompletedTxnData'),
                        widget: 'sit-datepicker',
                        type: 'date',
                        default: true,
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
                    field: 'InterfaceType',
                    placeholderText: 'Find an Interface Type..'
                },
                quickSearchType: 'contains',
                // TODO: Put here the properties of the entity managed by the service                
                sortInfo: {
                    field: 'InterfaceType',
                    direction: 'asc',
                    fields: [
                        { field: 'TransactionStatus', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.InterfaceStatus') },
                        { field: 'Direction', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Direction') },
                        { field: 'Id', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Id') },
                        { field: 'CompletedTxnDate', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.CompletedTxnDate') }
                    ]
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'Id'
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'InterfaceType', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.InterfaceType') },
                        { field: 'TransactionStatus', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.InterfaceStatus') },
                        { field: 'Direction', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Direction') },
                        { field: 'Id', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.Id') },
                        { field: 'CompletedTxnDate', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.CompletedTxnDate'), cellFilter: 'date:"yyyy-MM-dd hh:mm:ss a"' },
                        { field: 'ResponseMsg', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.ResponseMsg') },
                        { field: 'ErrorMsg', displayName: $translate.instant('NSOFT_STNOH_ProductionResult.ErrorMsg') }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function initGridData() {
            dataService.getAll().then(function (data) {
                if ((data) && (data.succeeded)) {
                    self.viewerData = data.value;
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
        var moduleStateName = 'home.NSOFT_STNOH_ProductionResult';
        var moduleStateUrl = 'NSOFT_STNOH_ProductionResult';
        var moduleFolder = 'NSOFT.STNOH/modules/ProductionResult';

        var state = {
            name: moduleStateName + '_ProductionResult',
            url: '/' + moduleStateUrl + '_ProductionResult',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/ProductionResult-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_ProductionResult.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
