(function () {
    'use strict';

    var controllerName = 'mdui_LaborTrainingMgt_Document_Ctrl';

    var docModule = angular.module('NSOFT.STNOH.document');


    docModule.controller(controllerName,
        ['NSOFT.STNOH.document.document.service', '$state',
            '$stateParams', 'common.base', '$filter', '$scope',
            '$translate', '$q', '$timeout', 'common.widgets.messageOverlay.service',
            'common.services.modelDriven.runtimeService',
            ViewScreenController]);

    function ViewScreenController(dataService, $state, $stateParams, common, $filter, $scope, $translate, $q, $timeout, overlay, mdRuntimeSvc) {
        var self = this;
        var sidePanelManager, backendService, propertyGridHandler;
        var pickerControl = attachFilePicker('.fb-ewidocs.add', onFileRead);
        self.onCustomActionComplete = null;

        var initObj = mdRuntimeSvc.initCustomAction();
        self.onCustomActionComplete = initObj && initObj.onExit ? initObj.onExit : null;

        function attachFilePicker(containerSelector, onFileLoadedCallback, extensionsList) {
            var picker = $("<input type='file' style='display:none;'  accept='" + extensionsList + "'/>");
            picker.appendTo($(containerSelector));
            return new FilePicker(new FileReader(), picker, onFileLoadedCallback);
        }

        function displayMessage(title, message) {
            $timeout(function () {
                $scope.$apply(function () {
                    showMessage(title, message);
                });
            }, 0);
        }

        function showMessage(title, text, okCallback) {
            showOverlay(title, text, [
                { translationId: 'common.ok', callback: okCallback }
            ]);
        }

        function dynamicTranslate(arg) {
            if (typeof (arg) === "string")
                return $translate.instant(arg);
            else if (Array.isArray(arg)) {
                return $translate.instant(arg[0], arg[1]);
            } else
                throw "dynamicTranslate: Argument type [Object] is not supported";
        }

        function showOverlay(title, text, buttons, skipTranslate, isWarning) {
            if (isWarning === undefined) isWarning = false;
            var internalButtons = buttons.map(function (button, index) {
                return {
                    id: 'button-' + index,
                    displayName: $translate.instant(button.translationId),
                    onClickCallback: function () {
                        if (button.callback)
                            button.callback();

                        overlay.hide();
                    }
                };
            });

            var overlaySettings = {
                buttons: internalButtons,
                title: skipTranslate ? title : dynamicTranslate(title),
                text: skipTranslate ? text : dynamicTranslate(text)
            };
            //commonBase.widgets.messageOverlay.service.set(overlaySettings);
            //commonBase.widgets.messageOverlay.service.show();
            overlay.set(overlaySettings);
            if (!isWarning) overlay.show();
            else overlay.show({ type: "warning" });
        }

        function ValidateFile(fileData, fileAttrs) {
            if (fileData == null || fileAttrs.size === 0) {
                displayMessage('sit.exds.common.invalid-file.title', 'sit.exds.common.invalid-file.message-size-0');
                return false;
            }

            if (fileAttrs.type == 'application/x-msdownload') {
                displayMessage('sit.exds.common.invalid-file.title', 'sit.exds.common.invalid-file.message-type-not-supported');
                return false;
            }

            return true;
        }

        function onFileRead(fileData, fileAttrs) {
            if (ValidateFile(fileData, fileAttrs)) {
                self.fileData = {
                    FileData: fileData,
                    NId: fileAttrs.name,
                    FileName: fileAttrs.name,
                    Type: fileAttrs.type,
                    Size: fileAttrs.size
                };
                $scope.$apply(function () {
                    self.documentListOptions.selectAll(false);
                    self.selectedDocuments = [];
                    self.editGridVisible = true;
                    setSidePanelMode();
                });
            }
        }

        function isValid(val, model, prop, required) {
            if (!val && required) {
                //prop.patternInfo = $translate.instant('sit.exds.common.mandatory-error');
                model.$setValidity('', false);

            } else if (!isTextValid(val)) {
                //prop.patternInfo = $translate.instant('sit.exds.common.invalid-chars-error');
                model.$setDirty();
                model.$setValidity('', false);
            } else {
                model.$setValidity('', true);
            }
        }

        function isTextValid(val) {
            return /^[a-zA-Z0-9!@%\^\&*\)\(+=._-]+$/g.test(val);
        }

        function FilePicker(reader, picker, onFileLoadedCallback) {
            var selectedFileAttrs = null;

            reader.onloadend = function () {
                var data = reader.result;
                if (data != null)
                    data = data.substr(data.indexOf(',') + 1);
                onFileLoadedCallback(data, selectedFileAttrs);
                selectedFileAttrs = null;
            };

            picker.on('change', function (event) {
                if (event.target.files.length === 0)
                    return;
                var file = event.target.files[0];

                selectedFileAttrs = {
                    type: file.type == "" ? "application/octet-stream" : file.type,
                    name: file.name,
                    size: file.size
                };

                reader.readAsDataURL(file);

                this.value = '';
            });

            this.open = function () {
                // The timeout mitigates a digest error...
                setTimeout(function () {
                    picker.click();
                }, 500);
            };
        }

        activate();
        function activate() {
            init();

            sidePanelManager.setTitle('Select');
            sidePanelManager.open({ mode: 'e', size: 'wide' });

            configureSidePanel();
            registerEvents();
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            backendService = common.services.runtime.backendService;

            self.editGridVisible = false;

            self.fileValidation = { required: true, custom: isValid };

            initGridOptions();
            initGridData();
        }

        function initGridOptions() {
            self.documentListOptions = {
                containerID: 'itemList',
                viewMode: "m",
                viewOptions: "gm",

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'NId' },
                sortInfo: {
                    direction: "asc",
                    field: "NId",
                    fields: [
                        { field: "NId", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.Identifier") },
                        { field: "FileName", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.Name") }
                    ]
                },
                gridConfig: {
                    columnDefs: [
                        { field: "NId", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.Identifier") },
                        { field: "FileName", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.Name") },
                        { field: "MIMEType", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.MIMEType") },
                        { field: "Type", type: "string", displayName: $translate.instant("NSOFT_NoticeBoard.Type") }
                    ]
                },
                selectionMode: "multi",
                svgIcon: "common/icons/typeFile48.svg",
                tileConfig: {
                    descriptionField: "FileName",
                    propertyFields: [
                        { displayName: $translate.instant("NSOFT_NoticeBoard.MIMEType"), field: "MIMEType" },
                        { displayName: $translate.instant("NSOFT_NoticeBoard.Type"), field: "Type" }
                    ],
                    titleField: "NId"
                },
                filterBarOptions: "sqf",
                filterFields: [
                    {
                        displayName: $translate.instant("NSOFT_NoticeBoard.Identifier"),
                        field: "NId",
                        type: "string"
                    },
                    {
                        displayName: $translate.instant("NSOFT_NoticeBoard.Name"),
                        field: "FileName",
                        type: "string"
                    },
                    {
                        displayName: $translate.instant("NSOFT_NoticeBoard.MIMEType"),
                        field: "MIMEType",
                        type: "string"
                    }
                ],
                tagField: { field: "SegregationTags", displayName: $translate.instant("NSOFT_NoticeBoard.SegregationTags") },
                onSelectionChangeCallback: onGridItemSelectionChanged
            }
        }

        function onGridItemSelectionChanged(items, item) {
            self.selectedDocuments = items;

            if (self.selectedDocuments && self.selectedDocuments.length > 0) {
                self.sidepanelConfig.actionButtons[1].enabled = true;
            } else {
                self.sidepanelConfig.actionButtons[1].enabled = false;
            }
        }

        function setSidePanelMode() {
            if (self.editGridVisible) {
                self.sidepanelConfig.actionButtons[0].visible = false;
                self.sidepanelConfig.actionButtons[0].enabled = false;
            } else {
                self.sidepanelConfig.actionButtons[0].visible = true;
                self.sidepanelConfig.actionButtons[0].enabled = true;
            }
        }

        function configureSidePanel() {
            self.sidepanelConfig = {
                title: $translate.instant("NSOFT_NoticeBoard.LinkDocument"),
                messages: [],
                open: function () { return self.sidePanelManager.open({ mode: 'e', size: 'wide' }); },
                actionButtons: [
                    {
                        label: $translate.instant('NSOFT_NoticeBoard.Import'),
                        tooltip: $translate.instant('NSOFT_NoticeBoard.Import'),
                        onClick: function () {
                            self.import();
                        },
                        enabled: true,
                        visible: true
                    },
                    {
                        label: $translate.instant('NSOFT_NoticeBoard.Link'),
                        tooltip: $translate.instant('NSOFT_NoticeBoard.Link'),
                        onClick: function () {
                            self.add();
                        },
                        enabled: false,
                        visible: true
                    },
                    {
                        label: $translate.instant('NSOFT_NoticeBoard.Cancel'),
                        tooltip: $translate.instant('NSOFT_NoticeBoard.Cancel'),
                        onClick: function () {
                            self.cancel();
                        },
                        enabled: true,
                        visible: true
                    }
                ],
                closeButton: {
                    showClose: true,
                    tooltip: $translate.instant('NSOFT_NoticeBoard.Close'),
                    onClick: function () {
                        self.cancel();
                    }
                }
            };
        }

        self.import = function () {
            pickerControl.open();
        }

        self.add = function () {
            if (self.editGridVisible) {
                dataService.CreateDocument(self.fileData).then(function (data) {
                    self.cancel();
                    initGridData();
                }, backendService.backendError);
            } else {
                var command = [];

                for (var i = 0; i < self.selectedDocuments.length; i++) {
                    if ($state.params.contentName == "LaborTrainingResultDocument") {
                        command.push(dataService.CreateResultDocument({
                            LaborTrainingId: $state.params.Id,
                            DocumentId: self.selectedDocuments[i].Id
                        }));
                    } else {
                        command.push(dataService.CreatePlanDocument({
                            LaborTrainingId: $state.params.Id,
                            DocumentId: self.selectedDocuments[i].Id
                        }));
                    }
                }

                $q.all(command).then(function (data) {
                    self.onCustomActionComplete();
                });
            }
        }

        self.cancel = function () {
            if (self.editGridVisible) {
                self.editGridVisible = false;
                self.fileData = null;
                setSidePanelMode();
            } else {
                sidePanelManager.close();
                $state.go('^');
            }
        }

        function onSaveSuccess(data) {
            sidePanelManager.close();
            $state.go('^', {}, { reload: true });
        }

        function initGridData() {
            self.selectedDocuments = [];

            if (self.documentListOptions && self.documentListOptions.selectAll) {
                self.documentListOptions.selectAll(false);
            }

            var filter = "$filter= Type eq 'Labor'";

            dataService.getDocAll(filter).then(function (data) {
                if ((data) && (data.succeeded)) {
                    data.value.forEach(function (doc) {
                        doc.image = getFAIconOnMIMEType(doc.MIMEType);
                    });

                    self.documentListData = data.value;
                } else {
                    self.documentListData = [];
                }
            }, backendService.backendError);
        }

        function getFAIconOnMIMEType(type) {
            var icon;
            switch (type) {
                case 'application/pdf':
                    icon = 'fa-file-pdf-o';
                    break;
                case 'application/doc':
                    icon = 'fa-file-word-o';
                    break;
                case 'application/vnd.ms-excel':
                case 'text/csv':
                    icon = 'fa-file-excel-o';
                    break;
                case 'application/x-zip-compressed':
                    icon = 'fa-file-archive-o';
                    break;
                case 'image/png':
                    icon = 'fa-file-image-o';
                    break;
                case 'text/plain':
                    icon = 'fa-file-text';
                    break;
                case 'text/xml':
                    icon = 'fa-file-code-o';
                    break;
                case 'video/mp4':
                    icon = 'fa-file-video-o';
                    break;
                default:
                    icon = 'fa-file';
            }
            return icon;
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function onPropertyGridValidityChange(event, params) {
            if (self.editGridVisible) {
                self.sidepanelConfig.actionButtons[1].enabled = params.validity;
            } else {
                self.sidepanelConfig.actionButtons[1].enabled = false;
            }
        }
    }

    docModule.config(['$stateProvider', 'u4dm.constants', 'u4dm.stateAliasProvider', configFunction]);

    function configFunction($stateProvider, u4dmConstants, aliasProvider) {
        var screenStateName = 'home.NSOFT_STNOH_document_document';
        var moduleFolder = 'NSOFT.STNOH/blueprints/document';

        var state = {
            name: screenStateName + '.document.add',
            url: '/document.add/:id',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/document-add.html',
                    controller: ViewScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Select'
            },
            params: {
                selectedItem: null,
            }
        };
        $stateProvider.state(state);
    }
}());
