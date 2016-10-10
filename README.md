# Widget Engine

## Introduction
A widget engine to create beautiful and interactive dashboards, reports, videos, HTML content to display almost anything in the form of widgets, which can be dragged and dropped, maxmized, customized look and feel for each widget. 

## Features
- Configurable number of columns
- Configurable default default widgets
- Resize columns
- Dynamic adding and removing of columns
- Sticky widgets
- Fullscreen widget
- Add dynamic widgets
- Remove widgets dynamically
- Drag and drop widgets
- Everything configured through single JSON ([sample]((https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/example/data/engine.json)))
- Callbacks for any change in the widget engine

## Demo
![Demo GIF](https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/demo.gif)

## Dependencies

- Angular
- Angular Material

## Usage

```bash
npm install angular-material-widget-engine
```

```HTML
<div ng-app="MyApp">
    <md-widget-engine configuration='data.WEconfiguration' callback="data.WEcallback"></md-widget-engine>
</div>
```

```Javascript
angular.module('MyApp', ['ngMaterial', 'ngMdWidgetEngine']);

angular.module('MyApp').controller('sampleCtrl', sampleCtrl);

// get your widget configuration from your API
function sampleCtrl($scope, $http){
    $http.get("/example/data/engine.json").success(function(data){
        $scope.data = {};
        $scope.data.WEconfiguration = data;
        $scope.data.WEcallback = function(e, configuration){
            console.log(e, configuration);
        };
        
    });
}
```