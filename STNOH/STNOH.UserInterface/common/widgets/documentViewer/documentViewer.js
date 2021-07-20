/* SIMATIC IT Unified Architecture Foundation V4.1 | Copyright (C) Siemens AG 2020. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.documentViewer
    * @description
    * This module provides functionalities related to document viewer.
    */
    angular.module('siemens.simaticit.common.widgets.documentViewer', []);
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitImageViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: ImageViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/image/image-viewer.html'
        });

    ImageViewerController.$inject = ['$scope', '$element', '$timeout'];

    function ImageViewerController($scope, element, $timeout) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            registerEvents();
        };

        function showFullScreen() {
            vm.isImageFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-image').appendTo("body");
            }, 0, false);
        }

        function closeFullScreen() {
            $('#document-viewer-full-screen-image').on('click', function () {
                $(this).remove();
            });
            vm.isImageFullScreenMode = false;
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('imageMaximise', showFullScreen);
        }

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitPdfViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '<sitConfig'
            },
            controller: PdfViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/pdf/pdf-viewer.html'
        });

    PdfViewerController.$inject = ['$scope', '$element', '$timeout', 'common.services.swac.SwacUiModuleManager'];

    function PdfViewerController($scope, element, $timeout, swacUiModuleManager) {

        var vm = this;
        var BASE64_MARKER = ';base64,';
        var timer;
        var fullscreenTimeout;
        var script;
        var options = {
            isSinglePage: false
        };

        var pdfViewerPromise;
        if (swacUiModuleManager.enabled) {
            swacUiModuleManager.eventBusServicePromise.promise.then(function (service) {
                pdfViewerPromise = service;
                //service.event.subscribe(function (event) {
                //    if (event.data.topic === 'mom.swac.navigation.queryStringChanged') {
                //        closeFullScreen();
                //        $('#pdf-full-screen').remove();
                //    }
                //});
            });
        }

        vm.$onInit = function () {
            vm.pdfReference = window.PDFJS;
            vm.pdfDocument = null;
            vm.pageNumPending = null;
            vm.eventListner = [];
            vm.DEFAULT_SCALE = 1;
            vm.getPdfDocument = getPdfDocument;
            vm.setPdfLayout = setPdfLayout;
            vm.setLayout = setLayout;
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            vm.isFullScreenMode = false;
            vm.viewerName = "viewer_" + $scope.$id;
            vm.viewerEvents = {
                loaded: 'pdf-fullscreen-viewer-loaded' + vm.viewerName,
                closed: 'pdf-full-screen-closed' + vm.viewerName,
                open: 'pdf-fullscreen-viewer-open' + vm.viewerName
            }
            registerEvents();

            if (vm.config.plugins) {
                var index = _.findIndex(vm.config.plugins, {
                    'format': 'pdf'
                });
                if (vm.config.plugins[index].options) {
                    options = $.extend(options, vm.config.plugins[index].options);
                }
            }
        }

        vm.$postLink = function () {
            vm.setPdfLayout();
        };

        function getPdfDocument() {
            vm.sourceUrl = convertDataURIToBinary(vm.source);
            //clearing the canvas to display new requested pdf files
            vm.pdfReference.getDocument(vm.sourceUrl).then(function (pdfDocs) {
                var parentViewer = element.find('.pdf-viewer')[0];
                while (parentViewer.hasChildNodes()) {
                    parentViewer.removeChild(parentViewer.firstChild);
                }
                if (!parentViewer.hasChildNodes()) {
                    vm.pdfDocument = pdfDocs;
                    for (var i = 1; i <= vm.pdfDocument.numPages; i++) {
                        renderPage(i);
                    }
                }
            });
        }

        function renderPage(num) {
            // Using promise to fetch the page
            vm.pdfDocument.getPage(num).then(function (page) {
                var canvasId = 'pdf-viewer-' + num;
                var canvas = document.getElementById(canvasId);
                element.find('.pdf-viewer').append($('<canvas/>', { 'id': canvasId }));
                canvas = element.find('#' + canvasId)[0];
                if (options.isSinglePage) {
                    fitSinglePage(canvas, page);
                } else {
                    fitMultiPage(canvas, page);
                }
                var renderTask = page.render(vm.renderContext);
                // Wait for rendering to finish
                renderTask.promise.then(function () {
                    if (vm.pageNumPending !== null) {
                        // New page rendering is pending
                        renderPage(vm.pageNumPending);
                        vm.pageNumPending = null;
                    }
                });
            });
        }

        // Fitting multiple pdf pages in container
        function fitMultiPage(canvas, page) {
            var V_PADDING = 5;
            var docViewerContainer = element.parents().find('.doc-content')[0];
            var pageWidthScale = (docViewerContainer.clientWidth) / page.pageInfo.view[2] * vm.DEFAULT_SCALE;
            var pageHeightScale = (docViewerContainer.clientHeight - V_PADDING) / page.pageInfo.view[3] * vm.DEFAULT_SCALE;
            var calculateScale = Math.min(pageWidthScale, pageHeightScale);
            var viewport = page.getViewport(calculateScale);

            canvas.height = viewport.height;
            canvas.width = viewport.width - 20;
            vm.renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
        }

        // Fitting single pdf page in container
        function fitSinglePage(canvas, page) {
            var V_PADDING = 5;
            var docViewerContainer = element.parents().find('.doc-content')[0];
            var pageWidthScale = docViewerContainer.clientWidth;
            var pageHeightScale = (docViewerContainer.clientHeight - V_PADDING) / page.pageInfo.view[3] * vm.DEFAULT_SCALE;
            var calculateScale = Math.min(pageWidthScale, pageHeightScale);
            var viewport = page.getViewport(calculateScale);

            var pdfViewer = element.find('.pdf-viewer');
            pdfViewer.css('width', viewport.width + 'px');

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            vm.renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
        }

        function setPdfLayout() {
            if (vm.isFullScreenMode) {
                return;
            }
            timer = $timeout(function () {
                vm.setLayout();
                vm.getPdfDocument();
            }, 0, false);
        }

        function setLayout() {
            var pdfCanvas = element.find('.pdf-canvas');
            var docViewerContainer = element[0];
            if (docViewerContainer) {
                pdfCanvas.css('height', docViewerContainer.clientHeight + 'px');
                pdfCanvas.css('width', docViewerContainer.clientWidth + 'px');
            }
        }

        function convertDataURIToBinary(dataURI) {
            var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
            var base64 = dataURI.substring(base64Index);
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new window.Uint8Array(new window.ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        }

        //$scope.$id
        function onPDFFullScreenLoaded() {
            window.setTimeout(function () {
                window.document.dispatchEvent(new CustomEvent(vm.viewerEvents.open, {
                    detail: {
                        source: vm.sourceUrl
                    }
                }, false));
            }, 500);
        }

        function showFullScreen() {
            vm.isFullScreenMode = true;
            if (swacUiModuleManager.enabled) {
                pdfViewerPromise && pdfViewerPromise.publish('modal.overlay.show', {
                    style: {
                        'z-index': 99,
                        'background': "rgba(0, 0, 0, 0.25) 50% 50% no-repeat"
                    },
                    animationWaitTime: 0
                });
            }
        }

        function closeFullScreen() {
            $timeout(function () {
                vm.isFullScreenMode = false;
                if (swacUiModuleManager.enabled) {
                    pdfViewerPromise && pdfViewerPromise.publish('modal.overlay.hide');
                }
            }, 0);
        }


        vm.$onChanges = function (changes) {
            if (changes.source && !changes.source.isFirstChange()) {
                vm.setPdfLayout();
            }
        };

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('sit-layout-change', setPdfLayout);
            vm.eventListner[vm.eventListner.length] = $scope.$on('pdfMaximise', showFullScreen);
            window.document.addEventListener(vm.viewerEvents.closed, closeFullScreen, false);
            window.document.addEventListener(vm.viewerEvents.loaded, onPDFFullScreenLoaded);
        }

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            $timeout.cancel(timer);
            $timeout.cancel(fullscreenTimeout);
            window.document.removeEventListener(vm.viewerEvents.closed, closeFullScreen, true);
            window.document.removeEventListener(vm.viewerEvents.loaded, onPDFFullScreenLoaded);
            vm.pdfDocument.destroy();
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitTextViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: TextViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/text/text-viewer.html'
        });

    TextViewerController.$inject = ['$scope', '$element', '$timeout'];

    function TextViewerController($scope, element, $timeout) {

        var vm = this;
        var timer;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            registerEvents();
            dataToText(vm.source);
        };

        function dataToText(data) {
            vm.textContent = data.replace('data:text/plain;base64,', '');
            vm.textData = base64DecodeUnicode(vm.textContent);
        }

        function base64DecodeUnicode(string) {
            // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
            var percentEncodedString = atob(string).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('');

            return decodeURIComponent(percentEncodedString);
        }

        function showFullScreen() {
            vm.istextFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-text').appendTo("body");
            }, 0, false);
        }

        function closeFullScreen() {
            $('#document-viewer-full-screen-text').on('click', function () {
                $(this).remove();
            });
            vm.istextFullScreenMode = false;
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on("textMaximise", showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    dataToText(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
            $timeout.cancel(timer);
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').filter('textLineBreak', function () {
        return function (input) {
            return input.replace(/\n/g, '<br />');
        };
    });

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitVectorViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: VectorViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/vector/vector-viewer.html'
        });

    VectorViewerController.$inject = ['$scope', '$element', '$sce', '$timeout'];

    function VectorViewerController($scope, element, $sce, $timeout) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.isVectorFullScreenMode = false;
            vm.showFullScreen = showFullScreen;
            vm.closeFullScreen = closeFullScreen;
            registerEvents();
            dataToSvg(vm.source);
        };

        function dataToSvg(data) {
            vm.svgContent = data.replace('data:image/svg+xml;base64,', '');
            vm.svgData = atob(vm.svgContent);
            vm.finalSVG = $sce.trustAsHtml(vm.svgData);
        }

        function showFullScreen() {
            vm.isVectorFullScreenMode = true;
            $timeout(function () {
                $('#document-viewer-full-screen-svg').appendTo("body");
            }, 0, false);
        }
        function closeFullScreen() {
            $('#document-viewer-full-screen-svg').remove();
            vm.isVectorFullScreenMode = false;

        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('svgMaximise', showFullScreen);
        }

        $scope.$watch(
            function () {
                return vm.source;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    dataToSvg(newValue);
                }
            }
        );

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitVideoViewer', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                source: '<sitSource',
                config: '@sitConfig'
            },
            controller: VideoViewerController,
            templateUrl: 'common/widgets/documentViewer/plugins/video/video-viewer.html'
        });

    VideoViewerController.$inject = ['$scope', '$element'];

    function VideoViewerController($scope, element) {

        var vm = this;

        vm.$onInit = function () {
            vm.eventListner = [];
            vm.showFullScreen = showFullScreen;
            registerEvents();
        };

        function showFullScreen() {
            var videoElement = document.getElementById("video-element");
            var isInFullScreen;
            document.fullscreenElement !== undefined && (isInFullScreen = document.fullscreenElement === null ? false : true);
            document.msFullscreenElement !== undefined && (isInFullScreen = document.msFullscreenElement);
            if (videoElement && !isInFullScreen) {
                videoElement.requestFullscreen && videoElement.requestFullscreen();
                videoElement.msRequestFullscreen && videoElement.msRequestFullscreen();
            } else {
                document.exitFullscreen && document.exitFullscreen();
                document.msExitFullscreen && document.msExitFullscreen();
            }
        }

        function registerEvents() {
            vm.eventListner[vm.eventListner.length] = $scope.$on('videoMaximise', showFullScreen);
        }

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        };
    }
})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitDocumentCarousel', {
            transclude: true,
            require: {
                parent: '^sitDocumentViewer'
            },
            bindings: {
                data: '<sitData',
                config: '=sitConfig'
            },
            controller: DocumentCarouselController,
            templateUrl: 'common/widgets/documentViewer/document-carousel.html'
        });

    DocumentCarouselController.$inject = ['$scope', '$element'];

    function DocumentCarouselController($scope, element) {

        var vm = this;

        vm.$onInit = function () {
            vm.page = 1;
            vm.eventListner = [];
            vm.registerEvents();
        }

        vm.onThumbnailClick = function (document) {
            vm.parent.setDocument(document);
        }

        vm.nextItems = function () {
            vm.page += 1;
            vm.carouselData = vm.data.slice(vm.showItems * vm.page - vm.showItems, vm.showItems * vm.page);
            return vm.carouselData;
        }

        vm.prevItems = function () {
            vm.page -= 1;
            vm.carouselData = vm.data.slice(vm.showItems * vm.page - vm.showItems, vm.showItems * vm.page);
            return vm.carouselData;
        }

        function setCarouselLayout() {
            vm.carouselContainer = element.parents().find('.doc-list .tab-content')[0];
            var TOTAL_ARROW_WIDTH = 64;
            var THUMBNAIL_WIDTH = 50;
            if (vm.carouselContainer) {
                vm.showItems = (vm.carouselContainer.clientWidth - TOTAL_ARROW_WIDTH) / THUMBNAIL_WIDTH;
                vm.last = Math.ceil(vm.data.length / vm.showItems);
                vm.carouselData = vm.data.slice(0, vm.showItems);
            }
        }

        vm.$onChanges = function (changes) {
            if (changes.data && !changes.data.isFirstChange()) {
                vm.carouselData = changes.data.currentValue;
                vm.page = 1;
                setCarouselLayout();
            }
        };

        vm.registerEvents = function () {
            vm.eventListner[vm.eventListner.length] = $scope.$on('sit-layout-change', setCarouselLayout);
        }

        vm.$onDestroy = function () {
            vm.eventListner.forEach(function (listner) {
                listner();
            });
        };
    }
})();

(function () {
    'use strict';

    function DocumentPluginController() {
        var vm = this;

        function activate() {
            init();
            initPlugins();
        }

        function init() {
            vm.supportedPlugins = [];
        }

        function getSupportedPlugins() {
            var allPlugins = vm.plugins ? vm.plugins.concat(vm.defaultDocumentViewerPlugins) : vm.defaultDocumentViewerPlugins;
            vm.supportedPlugins = _.uniq(allPlugins, 'format');
        }

        function initPlugins() {
            vm.defaultDocumentViewerPlugins = [
                {
                    "format": "pdf",
                    "viewer": "sit-pdf-viewer"
                },
                {
                    "format": "image",
                    "viewer": "sit-image-viewer"
                },
                {
                    "format": "video",
                    "viewer": "sit-video-viewer"
                },
                {
                    "format": "text",
                    "viewer": "sit-text-viewer"
                }
            ];

            getSupportedPlugins();
        }

        activate();
    }

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        directive('sitDocumentPlugin', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                controller: DocumentPluginController,
                bindToController: {
                    plugins: '=?sitPlugins'
                },
                link: function (scope, element, attr, ctrl) {
                    var pluginTemplate = '';
                    if (typeof ctrl.supportedPlugins != 'undefined' && ctrl.supportedPlugins.length > 0) {
                        angular.forEach(ctrl.supportedPlugins, function (plugin) {
                            pluginTemplate += '<' + plugin.viewer + ' ng-if="$ctrl.documentFormat === \'' + plugin.format +
                                '\'" sit-source="$ctrl.documentSource" sit-config="$ctrl.config"></' + plugin.viewer + '>';
                        });
                    }
                    element.append($compile(pluginTemplate)(scope));
                }
            };
        }]);
})();

(function () {
    'use strict';
    /**
    * @ngdoc type
    * @name DocumentConfig
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object having the data related to the documents to be displayed.
    * @property {String} [name] The name of the document (used as tooltip). It should always contain the filename extension of the document (Ex.: .png, .mp4, .pdf).
    * @property {String} [source] **Base64** content corresponding to the document to be displayed. **URL** can be configurable for image, video and svg files.
    * @property {String} [thumbnail] **Base64** content or **URL** corresponding to the document to be displayed as preview within **Category Tab** in document carousel section.
    * @property {String} [format=image] The format of the document. The corresponding plugin will be loaded from the default supported ones.
    * The following file formats are currently supported by the widget:-
    * * **image** : It is used to display image in the document viewer.
    * * **pdf** : It is used to display pdf file in the document viewer.
    * * **video** : It is used to display video file in the document viewer.
    * * **text** : It is used to display text file in the document viewer.
    * * **svg** : It is used to display svg file in the document viewer.
    * @property {String} [category] The ID of the category within which the document has to be displayed.
    */

    /**
    * @ngdoc type
    * @name DocumentCategory
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object having data about a category that has to be displayed as a tab in the document viewer footer.
    * @property {String} [id] The ID of the category.
    * @property {String} [label] The label of the category.
    */

    /**
    * @ngdoc type
    * @name DocumentAction
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object corresponding to the custom action to be included in the document viewer header bar.
    * @property {String} [label] A label for the action (used as a tooltip).
    * @property {String} icon A valid fa- or sit- class corresponding to an icon to display. [Deprecated]
    * @property {String} svgIcon A valid SVG icon to display.
    * @property {String} cmdIcon A valid command icon to display.

    * @property {function()} [action] A JavaScript function to be called when the action button is clicked.
    */

    /**
    * @ngdoc type
    * @name DocumentViewerConfig
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description An object to configure document viewer.
    * @property {String} [title=Documents] A title of the document viewer to be displayed.
    * @property {function} [onDocumentSelection=onDocumentSelection] A method to get the details of the selected document.
    * @property {String} [mode=display] Sets the viewer in a specific mode.
    * It can be set to one of the following:
    * * **display** : It will display category tabset field and viewer.
    * * **details** : It will only display tabs in expanded mode.
    * @property {String} [fullScreenMode=viewer] Configures how to toggle full screen previews.
    * It can be set to one of the following:
    * * **viewer** : The document will be displayed in fullscreen mode when the user will click on the document from the viewer.
    * * **toolbar** : A dedicated fullscreen action button will be shown in the sit-document-viewer toolbar to trigger full screen mode.
    * @property {Array<object>} [plugins] To support different formats of documents in the widget, a custom plugin can be created. The external viewer to be used in the document viewer to load the document of corresponding format.
    * The user can also override the default viewer by specifying below properties:-
    * * **format** : The format of the document.
    * * **viewer** : The external viewer.
    *
    * For Ex., To display the svg file, the framework supports **sit-vector-viewer** can be configured as below:-
    * ```
    * "plugins": [
    *               {
    *                   "format": "svg",
    *                   "viewer": "sit-vector-viewer"
    *               }
    *           ]
    * ```
    *
    * @example
    * Example of vector viewer directive to be used inside the document viewer widget as a plugin
    * ```
    * (function () {
    *   'use strict';
    *   angular.module('siemens.simaticit.common.widgets.documentViewer').
    *       component('sitVectorViewer', {
    *           transclude: true,
    *           require: {
    *               parent: '^sitDocumentViewer'
    *           },
    *           bindings: {
    *               source: '<sitSource', //object corresponding to the document to render
    *               config: '@sitConfig' //object used to further configure this plugin
    *           },
    *           controller: VectorViewerController,
    *           templateUrl: 'common/widgets/documentViewer/plugins/vector/vector-viewer.html' //Contains the HTML content of the vector viewer widget
    *       });
    *
    *   VectorViewerController.$inject = ['$scope', '$timeout'];
    *
    *   function VectorViewerController($scope, $timeout) {
    *       var vm = this;
    *
    *       vm.$onInit = function () {
    *           vm.eventListner = [];
    *           vm.isVectorFullScreenMode = false;
    *           vm.showFullScreen = showFullScreen;
    *           vm.closeFullScreen = closeFullScreen;
    *           registerEvents();
    *       };
    *
    *       function showFullScreen() { //method used to render the document at full-screen
    *           vm.isVectorFullScreenMode = true;
    *           $timeout(function () {
    *               $('#document-viewer-full-screen-svg').appendTo("body");
    *           }, 0, false);
    *       }
    *
    *       function closeFullScreen() { //method used to close the full-screen mode
    *           $('#document-viewer-full-screen-svg').remove();
    *           vm.isVectorFullScreenMode = false;
    *       }
    *
    *       function registerEvents() {
    *           vm.eventListner[vm.eventListner.length] = $scope.$on('svgMaximise', showFullScreen);
    *       }
    *
    *       vm.$onDestroy = function () {
    *           vm.eventListner.forEach(function (listner) {
    *               listner();
    *           });
    *       };
    *   }
    * })();
    * ```
    */

    /**
    * @ngdoc directive
    * @name sitDocumentViewer
    * @module siemens.simaticit.common.widgets.documentViewer
    * @description
    * Displays the document viewer control.
    *
    * @usage
    * As an element:
    * ```
    * <sit-document-viewer
    *       sit-document="documentObject"
    *       sit-data="dataArray"
    *       sit-categories="categoriesArray"
    *       sit-actions="actionsArray">
    *       sit-config="configObject">
    * </sit-document-viewer>
    * ```
    * @restrict E
    *
    * @param {Object} [sitDocument] An object corresponding to the document that is currently displayed in the document viewer.
    * For a description of this object see {@link DocumentConfig}
    *
    * @param {Array<Object>} [sitData] An array of objects corresponding to the documents that are available in the widget to be displayed.
    * For a description of this object see {@link DocumentConfig}
    *
    * @param {Array<Object>} [sitCategories] An array of objects corresponding to the categories to be displayed as tabs in the document viewer footer.
    * For a description of this object see {@link DocumentCategory}
    *
    * @param {Array<Object>} [sitActions] An array of objects corresponding to the custom actions to be displayed in the header bar.
    * For a description of this object see {@link DocumentAction}
    *
    * @param {Object} [sitConfig] An object to configure document viewer.
    * For a description of this object see {@link DocumentViewerConfig}
    *
    * @example
    * In a view template, you can use the **sit-document-viewer** as follows:
    *  ```
    * <div style="height:75%; width:50%">
    *       <sit-document-viewer sit-document="documentViewerCtrl.document"
    *                            sit-data="documentViewerCtrl.data"
    *                            sit-categories="documentViewerCtrl.categories"
    *                            sit-actions="documentViewerCtrl.actions"
    *                            sit-config="documentViewerCtrl.config">
    *       </sit-document-viewer>
    * </div>
    * ```
    *
    * The following example shows how to configure a sit-document-viewer widget:
    *
    * In Controller:
    * ```
    *
    * (function () {
    * 'use strict';
    *      angular.module('siemens.simaticit.common.examples').controller('documentViewerController', DocumentViewerController);
    *
    *      function DocumentViewerController() {
    *          var vm = this;
    *          vm.document = {
    *              "name": "Image1.jpg",
    *              "source": "data:image/png;base64,iV.....",
    *              "thumbnail":"data:image/png;base64,iV....",
    *              "format": "image",
    *              "category": "SampleCategory"
    *          };
    *          vm.data = [
    *              {
    *                   "name": "testPdfData.pdf",
    *                   "source": "data:application/pdf;base64,J..",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "pdf",
    *                   "category": "Tools"
    *              },
    *              {
	*                   "name": "text1.txt",
	*                   "source": "data:text/plain;base64,iV.....",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "text",
	*                   "category": "Material"
    *              },
    *              {
	*                   "name": "siemensVideo.mp4",
    *                   "source": "data:video/mp4;base64,iV.....",
    *                   "thumbnail":"data:image/png;base64,iV....",
    *                   "format": "video",
    *                   "category": "Tools"
    *              }
    *          ];
    *
    *          vm.categories = [
    *              {
    *                  "id": "Material",
    *                  "label": "Tools",
    *              },
    *              {
    *                  "id": "Tools",
    *                  "label": "Operation",
    *              }
    *          ];
    *
    *          vm.actions = [
    *              {
    *                  "label": "Edit",
    *                  "icon": "fa-edit",
    *                  "svgIcon":"common/icons/cmdRefresh24.svg",
    *                  "cmdIcon":"Open",
    *                  "action": "method"
    *              }
    *          ];
    *          vm.config =
    *              {
    *                  "title": "Document viewer",
    *                  "showFirstDocument": false,
    *                  "onDocumentSelection": onDocumentSelection,
    *                  "mode":"display",
    *                  "fullScreenMode": "toolbar",
    *                  "plugins": [
    *                      {
    *                          "format": "svg",
    *                          "viewer": "sit-vector-viewer"
    *                      }
    *                   ]
    *              }
    *      }
    * })();
    *
    * ```
    *
    */

    angular.module('siemens.simaticit.common.widgets.documentViewer').
        component('sitDocumentViewer', {
            transclude: true,
            bindings: {
                document: '<sitDocument',
                data: '=sitData',
                categories: '=sitCategories',
                actions: '=sitActions',
                config: '=sitConfig'
            },
            controller: DocumentViewerController,
            templateUrl: 'common/widgets/documentViewer/document-viewer.html'
        });

    DocumentViewerController.$inject = ['$scope', '$translate', '$q', 'common.widgets.messageOverlay.service'];

    function DocumentViewerController($scope, $translate, $q, overlayService) {
        var vm = this;

        vm.$onInit = function () {
            vm.selectedTab = '';
            vm.tabContent = '';
            vm.docContent = false;
            vm.tileType = 'item';
            vm.selectStyle = 'standard';
            vm.useCustomColors = false;
            vm.title = typeof vm.config.title === 'string' ? vm.config.title : $translate.instant('documentViewer.defaultTitle');
            vm.defaultDocumentSelection = vm.document ? vm.document : '';
            vm.selectedMode = vm.config.mode === 'details' ? 'details' : 'display';
            vm.fullScreenMode = vm.config.fullScreenMode === 'toolbar' ? 'toolbar' : 'viewer';
            vm.config.selectCategory = selectCategory;
            vm.config.setMode = setMode;
            vm.downloadDocument = downloadDocument;
            vm.docTemplate = '';
            vm.onInitTiles();
            vm.populateData();
            vm.setMode();
            vm.items = [];
            setDisplayIcons();
        };

        function setDisplayIcons() {
            for (var i = 0; i < vm.actions.length; i++) {
                vm.actions[i].displayIcon = null;
                if (vm.actions[i].svgIcon) {
                    vm.actions[i].displayIcon = { path: vm.actions[i].svgIcon, size: '24px' };
                } else if (vm.actions[i].cmdIcon) {
                    vm.actions[i].displayIcon = {
                        prefix: "cmd", name: vm.actions[i].cmdIcon, suffix: "24", size: "24px"
                    };
                }
            }
        }

        vm.onInitTiles = function () {
            var customColors = {
                color: 'black',
                bgColor: 'orange',
                colorSelected: '#647887',
                bgColorSelected: 'blue'
            };

            vm.options = {
                containerID: 'tile-view-container',
                bgColor: customColors.bgColor,
                bgColorSelected: customColors.bgColorSelected,
                color: customColors.color,
                colorSelected: customColors.colorSelected,
                propertyFields: [
                    {
                        field: 'name',
                        displayName: 'Name'
                    }
                ],
                tileViewMode: "wide",
                selectStyle: vm.selectStyle,
                tileType: vm.tileType,
                useCustomColors: vm.useCustomColors,
                debug: true,
                enableResponsiveBehaviour: true,
                multiSelect: false,
                commands: [{
                        onClick: vm.downloadDocument
                }],
                tileTemplate:
                    '<div style="position:relative;" class="custom-large">' +
                        '<div style="float:left; padding: 0 9px 0 9px;">' +
                            '<div data-internal-type="image-vcenter" style="width: 54px;height: 68px; box-sizing: border-box;' +
                            'align-items: center; justify-content: center; display: flex; vertical-align: middle;">' +
                                '<img ng-if="itemTileCtrl.tileContent.thumbnail && itemTileCtrl.tileContent.thumbnail!==undefined"' +
                                'ng-src="{{itemTileCtrl.tileContent.thumbnail}}" style="max-height: 68px;width: 100%;height: auto;"/>' +
                                '<div ng-if="!itemTileCtrl.tileContent.thumbnail || itemTileCtrl.tileContent.thumbnail===undefined"' +
                                'class="doc-tile-thumbnail" ng-switch="itemTileCtrl.tileContent.format" >' +
                                    '<em ng-switch-when="image" sit-mom-icon="{\'path\': \'common/icons/typeJpg48.svg\'}"> </em>' +
                                    '<em ng-switch-when="pdf" sit-mom-icon="{\'path\': \'common/icons/typePdf48.svg\'}"></em>' +
                                    '<em ng-switch-when="video" sit-mom-icon="{\'path\': \'common/icons/typeMp448.svg\'}"> </em>' +
                                    '<em ng-switch-when="text" sit-mom-icon="{\'path\': \'common/icons/typeTxt48.svg\'}"></em>' +
                                    '<em ng-switch-default sit-mom-icon="{\'path\': \'common/icons/typeFile48.svg\'}"> </em>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div style="float:left; padding: 15px 0 15px 8px; width: 192px;">' +
                            '<div ng-attr-title="{{itemTileCtrl.displayProp1.value}}" style="text-overflow: ellipsis; overflow: hidden;' +
                            'white-space: nowrap; color: #1e1e1e; font-size: 10.5pt; font-weight: 600;" data-internal-type="description">' +
                            '{{itemTileCtrl.displayProp1.value}}</div>' +
                                '<div style="color: #197fa2; font-size: 9pt; font-weight: 400;" data-internal-type="size">' +
                                '{{(itemTileCtrl.tileContent.source.length*0.75)/1024 | number:0}} KB</div>' +
                        '</div>' +

                        '<div style="float: right; width: 62px; padding: 6px 16px 0 8px; height: 68px; text-align: right;">' +
                            '<div style="transition: all .2s ease-in-out" onMouseOver="this.style.transform=\'scale(1.1)\'"' +
                            'onMouseOut="this.style.transform=\'scale(1)\'" ng-attr-title="Download {{itemTileCtrl.tileContent.name}}"' +
                            'ng-click="itemTileCtrl.tileOptions.commands[0].onClick($event, itemTileCtrl.tileContent.source, itemTileCtrl.tileContent.name)">' +
                                '<em sit-mom-icon="{\'path\': \'common/icons/cmdDownload24.svg\'}"></em>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
            };
        };

        //Populating the sit-document data if it's not there sit-data and sit-categories
        vm.populateData = function () {
            var index = '';
            if (vm.data !== undefined && vm.data.length) {
                index = _.findIndex(vm.data, vm.document);
                if (index < 0) {
                    vm.data[vm.data.length] = vm.document;
                }
            }
            else {
                vm.data = [];
                vm.data[0] = vm.document;
            }

            if (vm.categories !== undefined && vm.categories.length) {
                index = _.findIndex(vm.categories, {
                    'id': vm.document.category
                });

                if (index < 0) {
                    vm.categories[vm.categories.length] = {
                        'id': vm.document.category,
                        'label': vm.document.category,
                        'uploadEnabled': false,
                        'deleteEnabled': false
                    };
                }
            }
            else {
                vm.categories = [];
                vm.categories[0] = {
                    'id': vm.document.category,
                    'label': vm.document.category,
                    'uploadEnabled': false,
                    'deleteEnabled': false
                };
            }
        };

        vm.setDocument = function (document) {
            vm.document = document;

            angular.forEach(vm.tabContent, function (item) {
                item.selected = false;
                if (item.name === document.name) {
                    item.selected = true;
                }
            });

            var deferred = $q.defer();
            if (document._resolvedSource !== undefined && document._resolvedSource !== null) {
                deferred.resolve(document._resolvedSource);
                vm.binarySourcePromise = deferred.promise;
            }
            else if (typeof document.source === 'function') {
                vm.binarySourcePromise = document.source();
            } else {
                deferred.resolve(document.source);
                vm.binarySourcePromise = deferred.promise;
            }
            vm.binarySourcePromise.then(function (data) {
                vm.documentSource = data;
                vm.documentFormat = document.format;
                document._resolvedSource = data;
                //callback to get the selected document data
                window.$UIF.Function.safeCall(vm.config, 'onDocumentSelection', document);
            }, function (error) {
                vm.documentSource = null;

                //display promise failure in an overlay
                var overlay = {
                    text: $translate.instant('documentViewer.promiseError'),
                    buttons: [{
                        id: 'DocViewerOk',
                        displayName: "Ok",
                        onClickCallback: function () {
                            overlayService.hide();
                        }
                    }]
                };
                overlayService.set(overlay);
                overlayService.show();
            });
        };

        vm.showDocument = function (value) {
            angular.forEach(vm.data,
                function (item) {
                    if (item.category === value) {
                        vm.tabContent.push(item);
                    }
                }
            );

            vm.items = vm.tabContent;

            //selecting default document
            if (vm.defaultDocumentSelection !== '') {
                var index = _.findIndex(vm.items, vm.defaultDocumentSelection);
                vm.defaultDocumentSelection = '';
                vm.setDocument(vm.items[index]);
                return;
            }

            vm.setDocument(vm.items[0]);
        };

        vm.enableTabs = function (value) {
            //selecting default document tab
            if (vm.defaultDocumentSelection !== '') {
                vm.selectedTab = vm.document.category;
                var index = _.findIndex(vm.categories, {
                    'id': vm.selectedTab
                });
                vm.categories[index].tabActive = true;
                return;
            }
            vm.selectedTab = value;
        };

        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.documentViewer
       * @name DocumentViewerConfig#selectCategory
       *
       * @description
       * An API method to select the tab from tab categories.
       * @param {String} [Id] Id of the tab to be selected.
       *
       */
        function selectCategory(id) {
            _.each(vm.categories, function (element, index) {
                if (element.id === id) {
                    vm.categories[index].tabActive = true;
                }
                else {
                    vm.categories[index].tabActive = false;
                }
            });
            vm.enableTabs(id);
        }

        /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.documentViewer
       * @name DocumentViewerConfig#setMode
       *
       * @description
       * An API method to select the mode of the document viewer.
       * @param {String} [mode] The name of the mode in which document viewer should be displayed.
       *
       */
        function setMode(mode) {
            if (mode !== vm.selectedMode) {
                vm.toggleViewer();
            }
        }

        vm.maximizeClicked = function (document) {
            if (document.format) {
                $scope.$broadcast(document.format + 'Maximise');
            }
        };

         /**
       * @ngdoc method
       * @module siemens.simaticit.common.widgets.documentViewer
       * @name DocumentViewerConfig#downloadDocument
       *
       * @description
       * An API method to download a document from the document viewer.
       * @param {String} [url] The url of the document to be downloaded from the document viewer.
       * @param {String} [name] The name of the document to be downloaded from the document viewer.
       *
       */
        function downloadDocument(evt, url, name) {
            evt.stopPropagation();
            dataURItoBlob(url, name);
        }

        function dataURItoBlob(dataURI, fileName) {
            var byteString = atob(dataURI.split(',')[1]);
            var toArrayBuffer = new window.ArrayBuffer(byteString.length);
            var toIntArray = new window.Uint8Array(toArrayBuffer);
            for (var i = 0; i < byteString.length; i++) {
                toIntArray[i] = byteString.charCodeAt(i);
            }
            var finalBlob = new Blob([toArrayBuffer]);

            //If ther is no extension present in the fileName
            if (fileName.indexOf('.') === -1) {
                var extString = dataURI.split(';')[0].split('/')[1];
                switch (extString) {
                    case 'plain':
                        extString = 'txt';
                        break;
                    case 'svg+xml':
                        extString = 'svg';
                        break;
                }
                fileName+='.'+extString;
            }

            //For Internet Explorer
            if ((navigator.userAgent.indexOf('MSIE') !== -1) || (!!document.documentMode)) {
                window.navigator.msSaveBlob(finalBlob, fileName);
            } else {
                var link = document.createElement('a');
                link.download = fileName;
                link.innerHTML = 'download';
                link.href = URL.createObjectURL(finalBlob);
                link.click();
                link.removeAttribute('href');
            }
        }

        $scope.$watch(
            function () {
                return vm.selectedTab;
            },
            function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    vm.tabContent = [];
                    vm.showDocument(newValue);
                }
            }
        );

        $scope.$on('sit-item-selection-changed', function (event, arg) {
            vm.docContent = false;
            vm.setDocument(arg[0]);
        });

        vm.setMode = function () {
            if (vm.selectedMode === 'details') {
                vm.docContent = true;
            } else {
                vm.docContent = false;
            }
        };

        vm.toggleViewer = function () {
            vm.docContent = !vm.docContent;
            vm.selectedMode = !vm.docContent ? 'display' : 'details';
        };
    }
})();
