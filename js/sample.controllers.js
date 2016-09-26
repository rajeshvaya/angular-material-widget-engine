angular
  .module('MyApp')
  .controller('sampleCtrl', sampleCtrl);


function sampleCtrl($scope, $http){

    // prepare the widget data
    $http.get("/data/engine.json").success(function(data){
        $scope.data = {};
        $scope.data.WEconfiguration = data;
        $scope.data.WEcallback = function(e, configuration){
            console.log(e, configuration);
        };
        
    });


}