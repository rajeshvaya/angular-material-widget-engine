# Widget Engine

## Introduction
A widget engine to create beautiful and interactive dashboards, reports, widgets containing HTML content, videos, canvas, what have you to display almost anything in the form of widgets, which can be dragged and dropped, maxmized. Customizable look and feel for each widget. 

## Features
- Configurable number of columns
- Configurable default widgets
- Resize columns
- Dynamic adding and removing of columns
- Sticky widgets
- Fullscreen widget
- Dynamic adding and removing of widgets
- Drag and drop widgets
- Add custom widget controls 
- Events on custom widget controls
- Everything configured through single JSON ([sample](https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/example/data/engine.json))
- Callbacks for any change in the widget engine

## Demo ([Simple](https://rajeshvaya.github.io/angular-material-widget-engine/demo/multiple_columns), [Dashboard](https://rajeshvaya.github.io/angular-material-widget-engine/demo/simple_dashboard))

![Demo GIF](https://github.com/rajeshvaya/angular-material-widget-engine/raw/master/demo.gif)

## Dependencies

- Angular
- Angular Material
- Material Icons Fonts

## Usage

```bash
npm install angular-material-widget-engine
```

```HTML
<body ng-app="MyApp">
    <div ng-controller="sampleCtrl">
        <md-widget-engine configuration='data.WEconfiguration' callback="data.WEcallback"></md-widget-engine>
    </div>
</body>
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

## Engine Configuration
Key | Value | Description
--------- | ------- | ------- |
dynamicColumns | boolean | Enable / disable the feature of allowing user to add more remove empty columns (default is true)
resizeableColumns | boolean | Enable / disable the feature of allowing user to adjust the width of each column

## Column Configuration
Key | Value | Description
--------- | ------- | ------- |
name | column-1 | Any descriptive name for the column
background | #FFFFFF | Any hex color code as the background color of the column
size | 50 | A numeric value less than 100 for the width of the column with respective to with widget engine width (min. is 15)
widgets | [...] | List of widgets in the column (with the below Widget Configurations) 

## Widget Configuration

Key | Value | Description
--------- | ------- | ------- |
name | widget-1 | Any descriptive name for the widget
title | Report One | Title displayed in the toolbar for each widget
type | `include` or `iframe` or `html` | The content of widget can be fetched through `ng-include` or any external content through iFrame or simple HTML content string through HTML
resize | true | It allows the content to be resized vertically by the user
minHeight | 300 | Minimum height of the widget during resizing
maxHeight | 500 | Maximum height of the widget possible during resizing
sticky | true | Set it to true if widget should not be replaced or moved by another widget
sitckyControl | true | Set it to true to allow the lock icon to show up on tool bar so user can toggle the sticky feature (default is false)
fullscreenControl | true | Show the button control for fullscreen toggle or not in the widget toolbar (default is true)
closeControl | true | Show the button control for removing widget or not in the widget toolbar (default is true)
controlsLayout | `default` or `menu` or `fab` | View the widget controls in different layouts in the toolbar
customActions | ```[{"name": "android", "icon": "android", "event": "show_me_android", "tooltip": "A custom action"}]``` | Add any number of custom controls to the widget toolbar and widget engine will fire an event through the callback function specified in `WECallback`


## Theming

Widget engine follows the guidelines set by the `$mdThemingProvider`



