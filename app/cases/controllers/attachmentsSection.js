'use strict';
/*jshint camelcase: false */
angular.module('RedhatAccess.cases').controller('AttachmentsSection', [
    '$window',
    '$scope',
    'AlertService',
    'AttachmentsService',
    'CaseService',
    'strataService',
    'TreeViewSelectorUtils',
    'EDIT_CASE_CONFIG',
    'translate',
    function ($window, $scope, AlertService, AttachmentsService, CaseService, strataService, TreeViewSelectorUtils, EDIT_CASE_CONFIG, translate) {
        $scope.rhaDisabled = !EDIT_CASE_CONFIG.showAttachments;
        $scope.showServerSideAttachments = EDIT_CASE_CONFIG.showServerSideAttachments;
        $scope.isPCM = EDIT_CASE_CONFIG.isPCM;
        $scope.ie8 = window.ie8;
        $scope.ie9 = window.ie9;
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.TreeViewSelectorUtils = TreeViewSelectorUtils;
        $scope.ie8Message='We’re unable to accept file attachments from Internet Explorer 8 (IE8) at this time. Please see our instructions for providing files <a href=\"https://access.redhat.com/solutions/2112\" target="_blank\">via FTP </a> in the interim.';
        $scope.doUpdate = function () {
            $scope.updatingAttachments = true;
            AttachmentsService.updateAttachments(CaseService.kase.case_number).then(function () {
                $scope.updatingAttachments = false;
            }, function (error) {
                $scope.updatingAttachments = false;
            });
        };
        $scope.ieUpload = function($event) {
            var uploadingAlert = AlertService.addWarningMessage(translate('Uploading attachment...'));
            var form = document.getElementById('fileUploaderForm');
            var iframeId = document.getElementById('upload_target');
            form.action = 'https://' + window.location.host + '/rs/cases/' + CaseService.kase.case_number + '/attachments';

            var eventHandler = function () {
                if (iframeId.detachEvent){
                    iframeId.detachEvent('onload', eventHandler);
                }
                if (iframeId.removeEventListener){
                    iframeId.removeEventListener('load', eventHandler, false);
                }

                var content;
                if (iframeId.contentDocument) {
                    content = iframeId.contentDocument.body.innerText;
                } else if (iframeId.contentWindow) {
                    content = iframeId.contentWindow.document.body.innerText;
                } else if (iframeId.document) {
                    content = iframeId.document.body.innerText;
                }
                if (content !== undefined && content.length) {
                    var parser = document.createElement('a');
                    parser.href = content;
                    var splitPath = parser.pathname.split('/');
                    if(splitPath !== undefined && splitPath[4] !== undefined){
                        AttachmentsService.clear();
                        strataService.cache.clr('attachments' + CaseService.kase.case_number);
                        strataService.cases.attachments.list(CaseService.kase.case_number).then(function (attachmentsJSON) {
                            AlertService.removeAlert(uploadingAlert);
                            AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                            AlertService.addSuccessMessage(translate('Successfully uploaded attachment.'));
                        }, function (error) {
                            AlertService.addStrataErrorMessage(error);
                        });
                    } else {
                        AlertService.removeAlert(uploadingAlert);
                        AlertService.addDangerMessage(translate('Error: Failed to upload attachment. Message: ' + content));
                        $scope.$apply();
                    }
                } else {
                    AlertService.removeAlert(uploadingAlert);
                    AlertService.addDangerMessage(translate('Error: Failed to upload attachment. Message: ' + content));
                    $scope.$apply();
                }
            };

            if (iframeId.addEventListener){
                iframeId.addEventListener('load', eventHandler, true);
            } else if (iframeId.attachEvent){
                iframeId.attachEvent('onload', eventHandler);
            }
            form.submit();
        };
    }
]);