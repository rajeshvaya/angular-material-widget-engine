# Widget Engine

## Introduction
A widget engine to create beautiful and interactive dashboards, reports, widgets containing HTML content, videos, canvas, what have you to display almost anything in the form of widgets, which can be dragged and dropped, maxmized and customizable look and feel for each widget. 

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
- Everything configured through single JSON ([sample](https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/example/data/engine.json))
- Callbacks for any change in the widget engine

## Demo
![Demo GIF](https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/demo.gif)

## Dependencies

- Angular
- Angular Material
- Angular Material Icons

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

## Widget Configuration

Key | Value | Description
--------- | ------- | ------- |
name | widget-report-1 | Any descriptive name for the widget
title | Report One | Title displayed in the toolbar for each widget
type | `include` or `iframe` | The content of widget can be fetched through `ng-include` or any external content through iFrame
resize | true | It allows the content to be resized vertically by the user
minHeight | 300 | Minimum height of the widget during resizing
maxHeight | 500 | Maximum heigh of th widget possible during resizing
sticky | true | Set it to true if widget should not be replaced or moved by another widget
sitckyControl | true | Set it to true to allow the lock icon to show up on tool bar so user can toggle the sticky feature

## Theming

Widget engine follows the guidelines set by the `$mdThemingProvider`



