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
        scope: { column: "=" },
        templateUrl: "components/widgetEngine/views/widgetEngineColumn.html",
        controller: function($scope, $element, $attrs, $transclude){},
        link: function($scope, iElm, iAttrs, controller) {}
    };
}

// Every widget column has X widget tiles
function mdWidgetEngineWidgetTileDirective(){
    return {
        scope: { widget: "=" },
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
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        scope: {
            configuration: "=configuration"
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
            if(!event._initiatedByDragger){
                if(!(event.dataTransfer.types && event.dataTransfer.types.length)){
                    event.preventDefault();
                }
                event.stopPropagation();
                return;
            }
            $element.addClass("md-widget-engine-widget-moving");
            event.dataTransfer.setData("Text", angular.toJson($scope.$eval(true)));
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setDragImage($element[0], 20, 20);
            _obj._draggedTile = this;
        });

        $element.on('dragenter', function(event){
            if($element.hasClass('md-widget-engine-widget-moving')) return;
            $element.addClass("md-widget-engine-widget-dashed");
        });

        $element.on('dragleave', function(event){
            $element.removeClass("md-widget-engine-widget-dashed");
        });

        $element.on('drop', function(event){
            console.log("hiiiiii");
            // if source and destination are same, well then move on :P
        });

        $element.on('dragend', function(event){
            event = event.originalEvent || event;
            $element.removeClass("md-widget-engine-widget-moving");
            return event.stopPropagation();
        });

    };

    return _obj.controller;
}


