(function () {
    'use strict';
    angular.module('NSOFT.STNOH.LinkSearch').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['NSOFT.STNOH.LinkSearch.LinkSearch.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('NSOFT.STNOH.LinkSearch.LinkSearch');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.NSOFT_STNOH_LinkSearch_LinkSearch';
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
                viewOptions: 'l',
                viewMode: 'l',
                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'LinkName' },
                svgIcon: 'common/icons/cmdUIApplication24.svg',
                sortInfo: {
                    field: 'LinkName',
                    direction: 'asc'
                },
                tileConfig: {
                    isCell: true,
                    titleField: 'LinkName',
                    descriptionField: 'LinkUrl',
                    commands: [
                        {
                            svgIcon: 'common/icons/indicatorCompleted16.svg',
                            onClick: function (item) {
                                var param = "";
                                for (var i = 0; i < item.Parameters.length; i++) {
                                    param += (i == 0 ? "?" : "&") + item.Parameters[i].LinkParam + "=" + item.Parameters[i].LinkValue
                                }
                                window.open(item.LinkUrl + param);
                            },
                            tooltip: $translate.instant('NSOFT_LinkMgt.LinkSearch.OpenPage')
                        }
                    ]
                }
            }
        }

        function initGridData() {
            dataService.getAll("$expand=Parameters").then(function (data) {
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
        var moduleStateName = 'home.NSOFT_STNOH_LinkSearch';
        var moduleStateUrl = 'NSOFT_STNOH_LinkSearch';
        var moduleFolder = 'NSOFT.STNOH/modules/LinkSearch';

        var state = {
            name: moduleStateName + '_LinkSearch',
            url: '/' + moduleStateUrl + '_LinkSearch',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/LinkSearch-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_LinkSearch.Title'
            }
        };
        $stateProvider.state(state);
    }
}());
