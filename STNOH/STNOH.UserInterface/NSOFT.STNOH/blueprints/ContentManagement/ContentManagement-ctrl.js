(function () {
    'use strict';

    var controllerName = 'mdui_ContentManagement_Ctrl';
    var backendService;

    var MailContentModule = angular.module('NSOFT.STNOH.MailManagement');


    MailContentModule.controller(controllerName,
        ['NSOFT.STNOH.MailManagement.ContentManagement.service',
            '$state', '$stateParams', 'common.base', '$filter', '$scope',
            'u4dm.constants',
            'u4dm.services',
            '$translate',
            '$q',
            'common.textEditor.textEditorService',
            'Siemens.SimaticIT.WorkInstruction.EditorService',
            ContentScreenController]);



    function ContentScreenController(dataService, $state, $stateParams, common, $filter, $scope, u4dmConstants, u4dmSvc, $translate, $q,
        textEditorService, editorService) {

        var nowLang = common.services.globalization.globalizationService.getLocale();

        var vm = this;
        vm.textEditorService = textEditorService;
        var pgFields = {};

        vm.currentItem = {};

        var icon = u4dmSvc.icons.icon;
        var propGridMgr = new u4dmSvc.propertyGridSvc($scope, this, "edit");
        vm.disableButton = false;
        vm.createInProgess = false;
        vm.inputItem = [];

        vm.parameters = [];

        vm.mode = $state.params.mode;
        vm.currentItem = $state.params.selectedItem;
        vm.binding = true;

        vm.selectedItem = [];
        if (vm.mode == 'edit') {
            vm.selectedItem = $state.params.selectedItem;
        }
        else {
            vm.selectedItem = [];
        }

        vm.onCustomActionComplete = null;
        vm.validInputs = true;
        vm.Conditions = [];
        vm.MailType = [];
        vm.MailTypeSelected = false;
        vm.Associations = [];

        vm.save = save;
        vm.update = update;
        vm.getAll = getAll;
        vm.cancel = cancel;

        function init() {

            // initialize the side panel
            u4dmSvc.ui.sidePanel.setTitle('sit.u4dm.add');
            u4dmSvc.ui.sidePanel.open({ mode: 'e', size: 'wide' });

            initMailData();




            vm.validInputs = false;
        }

        init();

        function getMailContent(options) {
            return dataService.getMailContent(options);
        }

        function getAll(options, entityName) {
            return dataService.getAll2(options, entityName, 'STNOH');
        }

        function initMailData() {
            $q.all(
                [
                    getMailContent("$expand=MailType($expand=ConditionGroups($expand=Conditions))"),
                    getAll("$expand=ConditionGroups($expand=Conditions),Parameters", 'MailType'),
                    getAll("$expand=ContentAssociation,ConditionAssociation($expand=ConditionGroup)", "MailContentAndConditionAssociation")
                ]).then(function (result) {

                    //vm.MailType = result[1].value;
                    vm.Conditions = result[1].value;
                    for (var i = 0; i < result[1].value.length; i++) {
                        vm.MailType.push({
                            "Code": result[1].value[i].Type,
                            "Name": result[1].value[i].Type
                        })
                    }

                    vm.Associations = result[2].value;

                    configureSidePanel();
                    configurePropertyGrid();

                });


        }

        function configureSidePanel(mode) {

            if (vm.mode == 'add') {
                vm.sidepanelConfig = {
                    title: $translate.instant('NSOFT_STNOH_MailManagement.addTitle'),
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
                    title: $translate.instant('NSOFT_STNOH_MailManagement.editTitle'),
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
                    title: $translate.instant('NSOFT_Labor_LaborTraining.SetLaborTrainingStatus'),
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


        function MailTypeChange(oldVal, newVal, form) {
            vm.binding = false;
            vm.MailTypeSelected = true;

            vm.inputItem.NId = pgFields.nid.value;
            vm.inputItem.Title = pgFields.title.value;
            vm.inputItem.MailType = newVal;
            //vm.selectedItem.MailType;

            dataService.getAll2("$expand=ConditionGroups($expand=Conditions),Parameters", 'MailType', 'STNOH').then(function (data) {

                if (data && data.succeeded) {
                    var params = data.value.find(x => x.Type == newVal.Code).Parameters;

                    for (var i = 0; i < params.length; i++) {
                        vm.parameters.push(params[i].Parameter);
                    }

                    vm.binding = true;
                }
            });


            getPropertyGridValues();
            configurePropertyGrid();
        }

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

                pgFields.title = propGridMgr.createTextProperty({
                    id: 'title',
                    label: 'Subject',
                    value: vm.inputItem.Title,
                    read_only: false,
                    required: true,
                    checkSpecialChars: false
                });


                pgFields.MailType = propGridMgr.createComboBoxProperty({
                    id: 'MailType',
                    label: $translate.instant('NSOFT_STNOH_MailManagement.MailType'),
                    value: typeof vm.inputItem.MailType != 'undefined' ? vm.MailType[0] : vm.inputItem.MailType,
                    required: true,
                    read_only: false,
                    dataSource: vm.MailType,
                    displayProperty: "Name",
                    valueProperty: "Code",
                    onChange: MailTypeChange
                });

                if (vm.MailTypeSelected) {
                    var conditions = vm.Conditions.find(x => x.Type == vm.inputItem.MailType.Code).ConditionGroups;

                    for (var i = 0; i < conditions.length; i++) {

                        vm[conditions[i].ConditionGroup] = [];

                        conditions[i].Conditions.sort(function (a, b) {
                            if (a.Sort > b.Sort) {
                                return 1;
                            }
                            if (a.Sort < b.Sort) {
                                return -1;
                            }
                            // a must be equal to b
                            return 0;
                        });

                        for (var j = 0; j < conditions[i].Conditions.length; j++) {


                            vm[conditions[i].ConditionGroup].push({
                                "Code": conditions[i].Conditions[j].Condition,
                                "Name": conditions[i].Conditions[j].Condition
                            });
                        }

                        pgFields[conditions[i].ConditionGroup] = propGridMgr.createComboBoxProperty({
                            id: 'dynamic_' + conditions[i].ConditionGroup,
                            label: conditions[i].ConditionGroup,
                            value: null,
                            required: true,
                            read_only: false,
                            dataSource: vm[conditions[i].ConditionGroup],
                            displayProperty: "Name",
                            valueProperty: "Code"
                        });
                    }
                }

                var standardGridData = [];
                for (var i = 0; i < Object.keys(pgFields).length; i++) {
                    standardGridData.push(
                        pgFields[Object.keys(pgFields)[i]]
                    );
                }

                propGridMgr.data = standardGridData;

                propGridMgr.getValues = getStandardPropertyGridValues;
                vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);

            }
            else if (vm.mode == 'edit') {
                pgFields.nid = propGridMgr.createTextProperty({
                    id: 'nid',
                    labelKey: 'sit.u4dm.nid',
                    value: vm.selectedItem.NId,
                    read_only: true,
                    required: true,
                    checkSpecialChars: true
                });

                pgFields.title = propGridMgr.createTextProperty({
                    id: 'title',
                    label: 'Subject',
                    value: vm.selectedItem.Title,
                    read_only: false,
                    required: true,
                    checkSpecialChars: false
                });


                pgFields.MailType = propGridMgr.createComboBoxProperty({
                    id: 'MailType',
                    label: $translate.instant('NSOFT_STNOH_MailManagement.MailType'),
                    value: vm.MailType.find(x => x.Code == vm.Conditions.find(x => x.Id == vm.selectedItem.MailType_Id).Type),
                    required: true,
                    read_only: true,
                    dataSource: vm.MailType,
                    displayProperty: "Name",
                    valueProperty: "Code",
                    onChange: MailTypeChange
                });


                vm.MailTypeSelected = true;

                if (vm.MailTypeSelected) {
                    var conditions = vm.Conditions.find(x => x.Type == vm.Conditions.find(x => x.Id == vm.selectedItem.MailType_Id).Type).ConditionGroups;

                    for (var i = 0; i < conditions.length; i++) {

                        vm[conditions[i].ConditionGroup] = [];

                        conditions[i].Conditions.sort(function (a, b) {
                            if (a.Sort > b.Sort) {
                                return 1;
                            }
                            if (a.Sort < b.Sort) {
                                return -1;
                            }
                            // a must be equal to b
                            return 0;
                        });

                        for (var j = 0; j < conditions[i].Conditions.length; j++) {


                            vm[conditions[i].ConditionGroup].push({
                                "Code": conditions[i].Conditions[j].Condition,
                                "Name": conditions[i].Conditions[j].Condition
                            });
                        }

                        pgFields[conditions[i].ConditionGroup] = propGridMgr.createComboBoxProperty({
                            id: 'dynamic_' + conditions[i].ConditionGroup,
                            label: conditions[i].ConditionGroup,
                            value: vm[conditions[i].ConditionGroup].find(x => x.Code == vm.Associations.filter(x => x.ContentAssociation_Id == vm.selectedItem.Id).find(x => x.ConditionAssociation.ConditionGroup.ConditionGroup == conditions[i].ConditionGroup).ConditionAssociation.Condition),//vm.Associations.filter(x=>x.ContentAssociation_Id == vm.inputItem.Id).find(x=> x.ConditionAssociation.ConditionGroup.ConditionGroup ==  conditions[i].ConditionGroup).ConditionAssociation.Condition,
                            required: true,
                            read_only: false,
                            dataSource: vm[conditions[i].ConditionGroup],
                            displayProperty: "Name",
                            valueProperty: "Code"
                        });
                    }
                }

                pgFields.IsActive = propGridMgr.createCheckboxProperty({
                    id: 'IsActive',
                    value: vm.selectedItem.IsActive,
                    label: 'IsActive',
                    options: [
                        {
                            labelKey: '',
                            checked: vm.selectedItem.IsActive
                        }]
                });

                var standardGridData = [];
                for (var i = 0; i < Object.keys(pgFields).length; i++) {
                    standardGridData.push(
                        pgFields[Object.keys(pgFields)[i]]
                    );
                }


                propGridMgr.data = standardGridData;

                propGridMgr.getValues = getStandardPropertyGridValues;
                vm.propertyGrid = u4dmSvc.customizator.customizePropertyGrid(controllerName, propGridMgr, vm.currentItem);


                vm.binding = false;
                dataService.getAll2("$expand=ConditionGroups($expand=Conditions),Parameters", 'MailType', 'STNOH').then(function (data) {

                    if (data && data.succeeded) {
                        var params = data.value.find(x => x.Type == vm.Conditions.find(x => x.Id == vm.selectedItem.MailType_Id).Type).Parameters;

                        for (var i = 0; i < params.length; i++) {
                            vm.parameters.push(params[i].Parameter);

                        }

                        vm.binding = true;
                    }
                });
            }
        }


        function getPropertyGridValues() {
            return vm.propertyGrid.getValues(vm.currentItem, getStandardPropertyGridValues);
        }


        function getStandardPropertyGridValues(item) {
        }

        function onSaveSuccess(data) {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^', {}, { reload: true });
        }

        function save() {


            var inputItem = {
                'Content': vm.textEditorService.getEditorContent('mailContent').toString(),
                'NId': pgFields.nid.value,
                'Title': pgFields.title.value,
                'MailType': pgFields.MailType.value.Code,
                'IsActive': true
            };

            var conditions = [];
            for (var i = 0; i < Object.keys(pgFields).length; i++) {
                if (pgFields[Object.keys(pgFields)[i]].id.indexOf("dynamic_") == 0) {
                    var label = pgFields[Object.keys(pgFields)[i]].label.toString();
                    conditions.push(
                        vm.Conditions
                            .find(x => x.Type == pgFields.MailType.value.Code).ConditionGroups
                            .find(x => x.ConditionGroup == pgFields[Object.keys(pgFields)[i]].label).Conditions
                            .find(x => x.Condition == pgFields[Object.keys(pgFields)[i]].value.Code).Id
                    );
                }
            }

            inputItem.Conditions = conditions;

            dataService.create(inputItem).then(onSaveSuccess);
        }

        function update() {
            var inputItem = {
                'Id': vm.selectedItem.Id,
                'Content': vm.textEditorService.getEditorContent('mailContent').toString(),
                'Title': pgFields.title.value,
                'IsActive': pgFields.IsActive.value[0].checked
            };

            var updateconditions = [];
            for (var i = 0; i < Object.keys(pgFields).length; i++) {
                if (pgFields[Object.keys(pgFields)[i]].id.indexOf("dynamic_") == 0) {
                    var label = pgFields[Object.keys(pgFields)[i]].label.toString();
                    updateconditions.push(
                        vm.Conditions
                            .find(x => x.Type == pgFields.MailType.value).ConditionGroups
                            .find(x => x.ConditionGroup == pgFields[Object.keys(pgFields)[i]].label).Conditions
                            .find(x => x.Condition == pgFields[Object.keys(pgFields)[i]].value.Code).Id
                    );
                }
            }

            inputItem.Conditions = updateconditions;
            dataService.update(inputItem).then(onSaveSuccess);
        }



        function cancel() {
            u4dmSvc.ui.sidePanel.close();
            $state.go('^');
        }

    }


    MailContentModule.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var moduleStateName = 'home.NSOFT_STNOH_MailManagement';
        var moduleStateUrl = 'NSOFT_STNOH_MailManagement';
        var moduleFolder = 'NSOFT.STNOH/blueprints/ContentManagment';

        var state = {
            name: moduleStateName + '_ContentManagement',
            url: '/' + moduleStateUrl + '_ContentManagement',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/ContentManagment.html',
                    controller: controllerName,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: ''
            },
            params: {
                mode: null,
                selectedItem: null
            }
        };
        $stateProvider.state(state);

    }



    var values = {};

    MailContentModule.directive('nsTextEditor', sitTextEditor);
    function sitTextEditor() {
        return {
            scope: {},
            restrict: 'E',
            transclude: true,
            bindToController: {
                id: '@sitId',
                value: '=?sitValue',
                data: '=?sitData',
                readOnly: '<sitReadOnly',
                ngReadonly: '=?'
            },
            controller: TextEditorController,
            controllerAs: 'textEditorCtrl',
            template: "<div class=\"sit-text-editor\"><textarea id=\"{{textEditorCtrl.id}}\"></textarea></div>"
        };
    }

    TextEditorController.$inject = ['$rootScope', '$scope', '$window', '$timeout', '$translate', 'common.textEditor.textEditorService',
        'common.widgets.globalDialog.service', 'common.services.swac.SwacUiModuleManager'];
    function TextEditorController($rootScope, $scope, $window, $timeout, $translate, editorService, globalDialogService, swacManager) {
        var vm = this;
        var uploadEvent, params;
        var dialogPromise;
        swacManager.eventBusServicePromise.promise.then(function (eventBusSvc) {
            dialogPromise = eventBusSvc;
        });

        vm.$onInit = function () {
            vm.readOnly = vm.readOnly === undefined ? vm.ngReadonly : vm.readOnly;
            vm.imageData = [{
                value: values,
                widgetAttributes: {
                    'accept': 'image/jpeg,image/png,image/gif',
                    'sit-min-size': '1KB',
                    'sit-max-size': '1MB'
                },
                tabHeadingtext: $translate.instant('textEditor.tabHeading'),
                browseText: $translate.instant('textEditor.browse')
            }];

            vm.enableOkButton = enableOkButton;
            vm.disableOkButton = disableOkButton;
            vm.uploadOk = uploadOk;
            vm.uploadClose = uploadClose;
        };

        var timer = $timeout(function () {
            $window.CKEDITOR.replace(vm.id, {
                allowedContent: true,
                disallowedContent: 'iframe script; *[on*]; *[class]',
                extraAllowedContent: 'img{width}[src,alt,style];',
                extraPlugins: 'placeholder,imageDragResize,sourcedialog',
                removePlugins: 'image,sourcearea',
                qtCellPadding: '0',
                qtCellSpacing: '0',
                toolbarGroups: [
                    { name: 'document', groups: ['mode'] },
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'colors', groups: ['colors'] },
                    { name: 'styles', groups: ['styles'] },
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
                    { name: 'insert', groups: ['links', 'insert'] }
                ],
                removeButtons: 'Underline,Strike,Subscript,Superscript,Styles,JustifyBlock,Unlink,Anchor,SpecialChar,HorizontalRule',
                resize_enabled: false,
                colorButton_enableMore: true,
                removeDialogTabs: 'link:advanced;link:target',
                on: {
                    instanceReady: function (evt) {
                        evt.editor.setReadOnly(vm.readOnly);
                        if (vm.readOnly === true) {
                            evt.editor.document.$.body.style.pointerEvents = 'none';
                        }
                        evt.editor.on('change', function () {
                            vm.contentChanged = true;
                            $rootScope.$emit('sit-editor-content-change', vm.contentChanged);
                        })
                    }
                }
            });

            //$window.CKEDITOR.config.allowedContent = true;​

            editorService.setEditorInstance($window.CKEDITOR, vm.id);
            if (vm.data && vm.data.length) {
                params = [];
                for (var i = 0; i < vm.data.length; i++) {
                    params.push([vm.data[i]]);
                }
                $window.CKEDITOR.instances[vm.id].data = {
                    parameters: params
                };
            }

            if (vm.value) {
                editorService.setEditorContent(vm.value, vm.id);
            }
        });

        function setDialog() {
            $timeout(function () {
                globalDialogService.set({
                    title: $translate.instant('common.imageUpload'),
                    templatedata: vm.imageData,
                    templateuri: 'common/widgets/textEditor/image-upload-dialog-template.html',
                    buttons: [
                        {
                            id: 'btn_ok',
                            displayName: $translate.instant('common.ok'),
                            onClickCallback: uploadOk,
                            disabled: vm.uploadDisabled
                        },
                        {
                            id: 'btn_cancel',
                            displayName: $translate.instant('common.cancel'),
                            onClickCallback: uploadClose
                        }
                    ]
                });
            });
            globalDialogService.show();
        }

        $scope.$on('sit-file-uploader-success', enableOkButton);
        $scope.$on('sit-file-uploader-file-removed', disableOkButton);

        function enableOkButton() {
            if (vm.imageData[0].value) {
                vm.imageSrc = vm.imageData[0].value;
                if (vm.imageSrc !== null) {
                    vm.uploadDisabled = false;
                    setDialog();
                    if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                        $scope.$apply();
                    }
                }
            }
        }

        function disableOkButton() {
            vm.uploadDisabled = true;
            setDialog();
        }

        function uploadOk() {
            if (vm.imageData[0].value.contents) {
                vm.imageSrc = vm.imageData[0].value.contents;
                vm.format = vm.imageData[0].value.type;
                if (vm.imageSrc !== null) {
                    $rootScope.$emit('sit-editor-image-uploaded', vm.format, vm.imageSrc);
                }
            }
            uploadClose();
        }

        function uploadClose() {
            vm.imageData[0].value.name = '';
            vm.imageData[0].value.type = '';
            vm.imageData[0].value.contents = '';
            if (swacManager.enabled) {
                dialogPromise && dialogPromise.publish('modal.overlay.hide');
            }
            globalDialogService.hide();
        }

        vm.$onChanges = function (changes) {
            if (changes.readOnly && !changes.readOnly.isFirstChange()) {
                if ($window.CKEDITOR.instances[vm.id] !== undefined) {
                    $window.CKEDITOR.instances[vm.id].setData($window.CKEDITOR.instances[vm.id].getData(), function () {
                        $window.CKEDITOR.instances[vm.id].setReadOnly(vm.readOnly);
                        if (vm.readOnly === true) {
                            $window.CKEDITOR.instances[vm.id].document.$.body.style.pointerEvents = 'none';
                        } else {
                            $window.CKEDITOR.instances[vm.id].document.$.body.style.pointerEvents = '';
                        }
                    });
                }
            }
        };

        vm.$onDestroy = function () {
            $timeout.cancel(timer);
            timer = null;

            if (uploadEvent) {
                uploadEvent();
            }

            if (this.id !== undefined && window.CKEDITOR !== undefined) {
                window.CKEDITOR.instances[this.id].setData('');
                window.CKEDITOR.instances[this.id].destroy();
            }
        };
    }
}());