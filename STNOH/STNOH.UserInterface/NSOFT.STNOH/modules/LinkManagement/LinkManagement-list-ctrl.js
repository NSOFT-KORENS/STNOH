(function () {
    'use strict';
    angular.module('NSOFT.STNOH.LinkManagement').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.LinkManagement.LinkManagement.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.LinkManagement.LinkManagement');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_LinkManagement_LinkManagement';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;

            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];

            //Expose Model Methods
            self.addButtonHandler = addButtonHandler;
            self.editButtonHandler = editButtonHandler;
            self.selectButtonHandler = selectButtonHandler;
            self.deleteButtonHandler = deleteButtonHandler;
            self.parameterButtonHandler = parameterButtonHandler;
        }

        function initGridOptions() {
            self.viewerOptions = {
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'LinkName' },
                sortInfo: {
                    field: 'LinkName',
                    direction: 'asc',
                    fields: [
                        { field: 'LinkName', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkName') },
                        { field: 'LinkUrl', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkUrl') }
                    ]
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'LinkName'
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'LinkName', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkName') },
                        { field: 'LinkUrl', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkUrl') }
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
            var text = $translate.instant('NSOFT_STNOH_LinkManagement.deleteConfirmMessage');

            backendService.confirm(text, function () {
                dataService.delete(self.selectedItem).then(function () {
                    $state.go(rootstate, {}, { reload: true });
                }, backendService.backendError);
            }, title);
        }

        function parameterButtonHandler(clickedCommand) {
            $state.go(rootstate + '.parameter', { selectedLink: self.selectedItem });
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
        var moduleStateName = 'home.NSOFT_STNOH_LinkManagement';
        var moduleStateUrl = 'NSOFT_STNOH_LinkManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/LinkManagement';

        var state = {
            name: moduleStateName + '_LinkManagement',
            url: '/' + moduleStateUrl + '_LinkManagement',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/LinkManagement-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_LinkManagement.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
