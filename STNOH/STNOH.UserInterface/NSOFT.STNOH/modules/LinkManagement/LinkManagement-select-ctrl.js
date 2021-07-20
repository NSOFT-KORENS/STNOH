(function () {
    'use strict';
    var controllerName = 'LinkManagement_select_Ctrl';
    var mod = angular.module('NSOFT.STNOH.LinkManagement')
        .controller(controllerName, [
            'NSOFT.STNOH.LinkManagement.LinkManagement.service',
            '$q',
            '$state',
            '$scope',
            'u4dm.constants',
            'u4dm.services',
            '$filter',
            'common.base',
            '$translate',
            LinkManagementSelectController
        ]);

    function LinkManagementSelectController(
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
        var sidePanelManager, backendService, propertyGridHandler;

        var pgFields = {};
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.currentItem = {};
        vm.disableButton = false;
        vm.createInProgess = false;
        vm.onCustomActionComplete = null;
        vm.validInputs = true;
        vm.selectedItem = $state.params.selectedItem;

        vm.save = save;
        vm.cancel = cancel;
        init();

        function init() {

            u4dmSvc.ui.sidePanel.setTitle($translate.instant('NSOFT_STNOH_LinkManagement.LinkManage'));
            u4dmSvc.ui.sidePanel.open('e');
            configureSidePanel();
            configurePropertyGrid();
            initGridOptions();
            initGridData();

            vm.validInputs = false;
        }


        function configureSidePanel() {
            vm.sidepanelConfig = {
                title: $translate.instant('NSOFT_STNOH_LinkManagement.LinkManage'),
                messages: [],
                actionButtons: [

                ],
                closeButton: {
                    showClose: true,
                    tooltip: u4dmSvc.globalization.translate('sit.exds.common.close-sidepanel'),
                    onClick: vm.cancel
                }
            };

        }


        function initGridOptions() {
            vm.viewerOptions = {
                containerID: 'itemlist',
                selectionMode: 'single',
                viewOptions: 'g',

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'LinkParam' },
                sortInfo: {
                    field: 'LinkParam',
                    direction: 'asc',
                    fields: [
                        { field: 'LinkParam', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkParam') }
                    ]
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'LinkParam',
                    descriptionField: 'LinkValue'
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'LinkParam', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkParam') },
                        { field: 'LinkValue', displayName: $translate.instant('NSOFT_STNOH_LinkManagement.LinkValue') }
                    ]
                }
            }
        }

        function initGridData() {
            dataService.getAll("$expand=Parameters&$filter=Id eq " + vm.selectedItem.Id).then(function (data) {
                if ((data) && (data.succeeded)) {
                    vm.viewerData = data.value[0].Parameters;
                } else {
                    vm.viewerData = [];
                }
            });
        }

        u4dmSvc.messaging.subscribe($scope, 'sit-property-grid.validity-changed', function (event, params) {
            vm.validInputs = params.validity;
            configureSidePanel();
        });


        function configurePropertyGrid() {
            vm.currentItem.LinkName = vm.selectedItem.LinkName;
            vm.currentItem.LinkUrl = vm.selectedItem.LinkUrl;

            propGridMgr.clear();

            //pgFields.nid = propGridMgr.createDateTimePickerProperty({
            //    id: 'startDate',
            //    label: 'StartDate',
            //    value: vm.currentItem.startDate,
            //    validationCallback: validateFromDate
            //});

            pgFields.LinkName = propGridMgr.createTextProperty({
                id: 'LinkName',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkName'),
                value: vm.currentItem.LinkName,
                read_only: true
            });

            pgFields.LinkUrl = propGridMgr.createTextProperty({
                id: 'LinkUrl',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkUrl'),
                value: vm.currentItem.LinkUrl,
                read_only: true
            });


            var standardGridData = [
                pgFields.LinkName,
                pgFields.LinkUrl,

            ];


            propGridMgr.data = standardGridData;

            propGridMgr.getValues = getStandardPropertyGridValues;
            vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function getStandardPropertyGridValues(item) {

        }

        function save() {
            var saveData = {
                'Id': vm.selectedItem.Id,
                'LinkName': pgFields.LinkName.value,
                'LinkUrl': pgFields.LinkUrl.value
            };

            dataService.update(saveData).then(onSaveSuccess);
        }

        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }

        function onPropertyGridValidityChange(event, params) {
            vm.validInputs = params.validity;
        }
    }


    mod.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_LinkManagement_LinkManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/LinkManagement';

        var state = {
            name: screenStateName + '.select',
            url: '/select',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/LinkManagement-select.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_LinkManagement.LinkManage'
            },
            params: {
                selectedItem: null
            }
        };


        $stateProvider.state(state);
        aliasProvider.register(state);


    }
}());