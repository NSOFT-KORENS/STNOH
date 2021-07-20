//@ts-check
(function () {
    'use strict';
    var controllerName = 'document_download_Training_Ctrl';
    angular.module('NSOFT.STNOH.document')
        .controller(controllerName,
            [
                '$state',
                '$scope',
                'u4dm.services.file',
                'common.services.modelDriven.runtimeService',

                function ($state, $scope, serviceFile, mdRuntimeSvc) {
                    var vm = this;
                    init();

                    function init() {
                        vm.selectedDocument = $state.params.alreadyAttachedDocument;

                        var file = {
                            File_Id_Id: vm.selectedDocument.File_Id_Id,
                            MIMEType: vm.selectedDocument.MIMEType,
                            FileName: vm.selectedDocument.FileName
                        }
                        serviceFile.downloadRawFile(file);

                        $state.go('^');
                    }
                }
            ]);
}());
