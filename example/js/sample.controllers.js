angular
  .module('MyApp')
  .controller('sampleCtrl', sampleCtrl);

function sampleCtrl($scope, $http) {
   // prepare the widget data
   var set_data = function(data) {
      $scope.data = {};
      $scope.data.WEconfiguration = data;
      $scope.data.WEcallback = function(e, configuration){
         console.log(e, configuration);
      };
   }
   var promise = $http.get("example/data/engine.json");
   if (promise.success) {
      promise.success(function(data) {
         set_data(data);
      });
   } else {
      promise.then(function(response) {
         set_data(response.data);
      });
   }


}
