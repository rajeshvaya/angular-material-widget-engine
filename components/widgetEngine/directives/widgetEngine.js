// app
angular
    .module('ngMdWidgetEngine', ['ngMaterial'])
    .directive('mdWidgetEngineWidgetDragger', mdWidgetEngineWidgetTileDragger)
    .directive('mdWidgetEngineWidgetTile', mdWidgetEngineWidgetTileDirective)
    .directive('mdWidgetEngineColumn', mdWidgetEngineColumnDirective)
    .directive('mdWidgetEngine', mdWidgetEngineDirective);


// Every widget engine has X columns
function mdWidgetEngineColumnDirective(){
    return {
        scope: false,
        templateUrl: "components/widgetEngine/views/widgetEngineColumn.html",
        controller: function($scope, $element, $attrs, $transclude){},
        link: function($scope, iElm, iAttrs, controller) {}
    };
}

// Every widget column has X widget tiles
function mdWidgetEngineWidgetTileDirective(){
    return {
        scope: false,
        replace: true,
        templateUrl: "components/widgetEngine/views/widgetEngineWidgetTile.html",
        controller: mdWidgetEngineWidgetTileDirectiveController(),
        link: function($scope, iElm, iAttrs, controller) {}
    };
}

// Every widget can be dragged by a handler who is plays the role of a dragger
function mdWidgetEngineWidgetTileDragger(){
    return function($scope, $element, $attrs, $transclude){
        $element.attr('draggable', 'true');
        $element.on('dragstart dragend', function(event){
            event = event.originalEvent || event;
            event._initiatedByDragger = true; // this is to inform the parent widget that dragging is started by dragging the child element i.e. the dragger
        });
    };
}


// The main widget engine directive
function mdWidgetEngineDirective(){
    // Runs during compile
    return {
        scope: {
            configuration: "=configuration",
            callback: "=callback"
        },
        templateUrl: "components/widgetEngine/views/widgetEngine.html",
        controller: function($scope, $element, $attrs, $transclude){},
        link: function($scope, iElm, iAttrs, controller) {}
    };
}



function mdWidgetEngineWidgetTileDirectiveController(){
    var _obj = {};
    _obj._draggedTile = null;

    _obj.controller = function($scope, $element, $attrs, $transclude){
        $element.attr("draggable", "true");
        $element.on('dragstart', function(event){
            // only drag when initiated by child
            event.stopPropagation();
            if(!event._initiatedByDragger){
                if(!(event.dataTransfer.types && event.dataTransfer.types.length)){
                    event.preventDefault();
                }
                event.stopPropagation();
                return;
            }
            $element.addClass("md-widget-engine-widget-moving");
            var draggerPosition = $scope.columnIndex + "::" + $scope.widgetIndex;
            event.dataTransfer.setData("Text", draggerPosition);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage($element[0], 20, 20);
            _obj._draggedTile = $element;
            console.log($scope.columnIndex, $scope.widgetIndex);
        });

        $element.on('dragenter', function(event){
            if($element.hasClass('md-widget-engine-widget-moving')) return;
            $element.addClass("md-widget-engine-widget-dashed");
            event.stopPropagation();
        });

        $element.on('dragover', function(event){
            if($element.hasClass('md-widget-engine-widget-moving')) return;
            $element.addClass("md-widget-engine-widget-dashed");
            event.stopPropagation();
            if(event.preventDefault) event.preventDefault();
        });

        $element.on('dragleave', function(event){
            $element.removeClass("md-widget-engine-widget-dashed");
            event.stopPropagation();
        });

        $element.on('dragend', function(event){
            event = event.originalEvent || event;
            $element.removeClass("md-widget-engine-widget-moving");
            return event.stopPropagation();
        });

        $element.on('drop', function(event){

            var configuration = angular.copy($scope.configuration);
            // get the positions of swappers
            var draggerPosition = (event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain")).split("::");
            var dropeePosition = [$scope.columnIndex, $scope.widgetIndex];
            // get the elements
            var draggerElement = configuration.columns[draggerPosition[0]].widgets[draggerPosition[1]];
            var dropeeElement =  configuration.columns[dropeePosition[0]].widgets[dropeePosition[1]];
            // swap the elements
            configuration.columns[draggerPosition[0]].widgets[draggerPosition[1]] = dropeeElement;
            configuration.columns[dropeePosition[0]].widgets[dropeePosition[1]] = draggerElement;
            // assign configurations
            $scope.configuration.columns = configuration.columns;

            _obj._draggedTile.removeClass("md-widget-engine-widget-dashed");
            $element.removeClass("md-widget-engine-widget-dashed");
            setTimeout(function(){
                $scope.$apply();
                $scope.callback("update", configuration);
            }, 200);
            // if source and destination are same, well then move on :P
        });

    };

    return _obj.controller;
}


