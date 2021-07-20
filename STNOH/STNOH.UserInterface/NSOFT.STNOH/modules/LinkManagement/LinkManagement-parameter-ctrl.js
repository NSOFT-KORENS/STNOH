(function () {
    'use strict';
    var controllerName = 'LinkManagement_parameter_Ctrl';
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
            '$stateParams',
            LinkManagementParameterController
        ]);

    function LinkManagementParameterController(
        dataService,
        $q,
        $state,
        $scope,
        u4dmConstants,
        u4dmSvc,
        $filter,
        common,
        $translate,
        $stateParams
    ) {
        var vm = this;
        var sidePanelManager, backendService, propertyGridHandler;
        backendService = common.services.runtime.backendService;
        var pgFields = {};
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.currentItem = angular.copy($stateParams.selectedLink);
        vm.disableButton = false;
        vm.createInProgess = false;
        vm.onCustomActionComplete = null;
        vm.validInputs = true;
        vm.parameterItem = {
            Id: '',
            LinkParam: '',
            LinkValue: ''
        };
        vm.new = newFunction;
        vm.save = save;
        vm.cancel = cancel;
        vm.delete = deleteFunction;

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
                    {
                        label: 'New',
                        onClick: vm.new,
                        enabled: true,
                        visible: true
                    },
                    {
                        label: 'Delete',
                        onClick: vm.delete,
                        enabled: true,
                        visible: vm.parameterItem.Id.length > 0 ? true : false
                    },
                    {
                        label: $translate.instant('NSOFT_STNOH_LinkManagement.save'),
                        onClick: vm.save,
                        enabled: vm.validInputs,
                        visible: true
                    },
                    {
                        label: $translate.instant('NSOFT_STNOH_LinkManagement.cancel'),
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
                },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function initGridData() {
            dataService.getAll("$expand=Parameters&$filter=Id eq " + vm.currentItem.Id).then(function (data) {
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
                read_only: true,
                required: true
            });

            pgFields.LinkParam = propGridMgr.createTextProperty({
                id: 'LinkParam',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkParam'),
                value: vm.parameterItem.LinkParam,
                read_only: false,
                required: true
            });

            pgFields.LinkValue = propGridMgr.createTextProperty({
                id: 'LinkValue',
                label: $translate.instant('NSOFT_STNOH_LinkManagement.LinkValue'),
                value: vm.parameterItem.LinkValue,
                read_only: false,
                required: true
            });


            var standardGridData = [
                pgFields.LinkName,
                pgFields.LinkParam,
                pgFields.LinkValue
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
            if (vm.parameterItem.Id.length > 0) {
                var param = {
                    LinkParam: vm.parameterItem.LinkParam,
                    LinkValue: vm.parameterItem.LinkValue,
                    ID: vm.parameterItem.Id
                }
                dataService.updateParameterEntity(param).then(onSaveSuccess);
            } else {
                var param = {
                    LinkParam: vm.parameterItem.LinkParam,
                    LinkValue: vm.parameterItem.LinkValue,
                    Manage: vm.currentItem.Id
                }
                dataService.createParameterEntity(param).then(onSaveSuccess);
            }
        }

        function deleteFunction() {
            var title = "Delete";
            // TODO: Put here the properties of the entity managed by the service
            var text = $translate.instant('NSOFT_STNOH_LinkManagement.deleteConfirmMessage');

            backendService.confirm(text, function () {
                dataService.deleteParameterEntity(vm.parameterItem).then(function () {
                    onSaveSuccess(null);
                });
            }, title);
        }

        function newFunction() {
            vm.parameterItem = {
                Id: '',
                LinkParam: '',
                LinkValue: ''
            };
            configureSidePanel();
            configurePropertyGrid();
        }

        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            newFunction();
            initGridData();
        }

        function onPropertyGridValidityChange(event, params) {
            vm.validInputs = params.validity;
        }

        function onGridItemSelectionChanged(items, item) {
            if (item && item.selected == true) {
                vm.parameterItem = {
                    Id: item.Id,
                    LinkParam: item.LinkParam,
                    LinkValue: item.LinkValue
                };
            } else {
                newFunction();
            }
            configureSidePanel();
            configurePropertyGrid();
        }
    }


    mod.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_LinkManagement_LinkManagement';
        var moduleFolder = 'NSOFT.STNOH/modules/LinkManagement';

        var state = {
            name: screenStateName + '.parameter',
            url: '/parameter',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/LinkManagement-parameter.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'NSOFT_STNOH_LinkManagement.LinkManage'
            },
            params: {
                selectedLink: null
            }
        };


        $stateProvider.state(state);
        aliasProvider.register(state);
    }
}());