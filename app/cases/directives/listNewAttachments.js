'use strict';

angular.module('RedhatAccess.cases')
  .directive('rhaListnewattachments', function() {
    return {
      templateUrl: 'cases/views/listNewAttachments.html',
      restrict: 'EA',
      controller: 'ListNewAttachments'
    };
  });