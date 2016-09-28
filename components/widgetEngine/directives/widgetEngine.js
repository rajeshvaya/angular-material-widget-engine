// app
angular
    .module('ngMdWidgetEngine', ['ngMaterial', 'ngMdIcons'])
    .directive('mdWidgetEngineWidgetDragger', mdWidgetEngineWidgetTileDragger)
    .directive('mdWidgetEngineWidgetTile', mdWidgetEngineWidgetTileDirective)
    .directive('mdWidgetEngineColumn', mdWidgetEngineColumnDirective)
    .directive('mdWidgetEngine', mdWidgetEngineDirective);


// Every widget engine has X columns
function mdWidgetEngineColumnDirective(){
    return {
        scope: false,
        templateUrl: "components/widgetEngine/views/widgetEngineColumn.html",
        controller: function($scope, $element, $attrs, $transclude, $document, $timeout){
            var mouseMove = function(e){
                // console.log("mouse moving", e);
                $timeout(function(){
                    var newX = e.clientX;
                    var differenceXPercentage =  ((newX - $element[0].children[0].offsetLeft) / $scope.configuration.width) * 100;
                    if($scope.configuration.columns[$scope.columnIndex + 1]) $scope.configuration.columns[$scope.columnIndex + 1].size -= differenceXPercentage - $scope.column.size;
                    $scope.column.size = differenceXPercentage;
                });
                
            };

            var mouseUp = function(){
                // console.log("mouse up");
                $document.unbind('mouseup', mouseUp);
                $document.unbind('mousemove', mouseMove);
                $scope.callback("resize", $scope.configuration);
            };

            $scope.setupColumnResizing = function(e){
                event.preventDefault();
                // console.log("mouse down", e);
                $document.on('mouseup', mouseUp);
                $document.on('mousemove', mouseMove);
            };

            $scope.addNewColumn = function(){
                var newColumn = angular.copy($scope.configuration.columns[$scope.columnIndex]);
                newColumn.widgets = []; // reset the columns
                newColumn.size = '';
                $timeout(function(){
                    $scope.configuration.columns.splice($scope.columnIndex + 1, 0, newColumn);
                });
            };

            $scope.removeEmptyColumn = function(){
                var removedColumn = $scope.configuration.columns.splice($scope.columnIndex, 1);
            };

            $element.on('dragenter', function(event){
                $element.addClass("md-widget-engine-column-dashed");
                event.stopPropagation();
            });

            $element.on('dragover', function(event){
                $element.addClass("md-widget-engine-column-dashed");
                event.stopPropagation();
                if(event.preventDefault) event.preventDefault();
            });

            $element.on('dragleave', function(event){
                $element.removeClass("md-widget-engine-column-dashed");
                event.stopPropagation();
            });

            $element.on('drop', function(event){

                // get the positions of swappers
                var draggerPosition = (event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain")).split("::");
                if($scope.columnIndex == draggerPosition[0]){
                    $element.removeClass("md-widget-engine-column-dashed");
                    return;  // if dropping in the same column  
                }
                // get the elements
                var draggerElement = $scope.configuration.columns[draggerPosition[0]].widgets[draggerPosition[1]];
                // swap the elements
                var removedWidget = $scope.configuration.columns[draggerPosition[0]].widgets.splice(draggerPosition[1], 1)[0];
                $scope.configuration.columns[$scope.columnIndex].widgets.push(removedWidget);
                // assign configurations
                $element.removeClass("md-widget-engine-column-dashed");
                $document.find(".md-widget-engine-column-dashed").removeClass('md-widget-engine-column-dashed');
                $timeout(function(){
                    $scope.$apply();
                    $scope.callback("update", $scope.configuration);
                }, 150);
                // if source and destination are same, well then move on :P
            });

        },
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
        controller: function($scope, $element, $attrs, $transclude, $timeout){
            $timeout(function(){
                $scope.configuration.width = $element[0].children[0].offsetWidth;
            });
        },
        link: function($scope, iElm, iAttrs, controller) {}
    };
}



function mdWidgetEngineWidgetTileDirectiveController(){
    var _obj = {};
    _obj._draggedTile = null;

    _obj.controller = function($scope, $element, $attrs, $transclude, $mdDialog, $timeout, $sce, $document){
        $scope.fullscreen = false;
        $scope.widget._internalSettings = {};
        $scope.widget._internalSettings.trustedURL = $sce.trustAsResourceUrl($scope.widget.content);
        $scope.toggleFullscreen = function(){
            $scope.fullscreen = !$scope.fullscreen;
        };

        $scope.removeWidget = function(e){
            var confirm = $mdDialog.confirm()
                          .title('Are you sure?')
                          .textContent('Remove the "' + $scope.widget.title + '" widget?')
                          .ariaLabel('Are you sure you want to remove the widget')
                          .targetEvent(e)
                          .ok('Yes')
                          .cancel('Cancel');

            $mdDialog.show(confirm).then(function(){
                $element.addClass('md-widget-engine-widget-remove');
                $timeout(function(){
                    var removedWidget = $scope.configuration.columns[$scope.columnIndex].widgets.splice($scope.widgetIndex, 1);
                }, 200);
            }, function(){});
        };

        // $element.attr("draggable", "true");

        $element.on('dragstart', function(event){
            // only drag when initiated by child
            event.stopPropagation();
            if(!event._initiatedByDragger || $scope.fullscreen){
                if(!(event.dataTransfer.types && event.dataTransfer.types.length)){
                    event.preventDefault();
                }
                event.stopPropagation();
                return;
            }
            // $scope.fullscreen = false; //incase, you know
            $element.addClass("md-widget-engine-widget-moving");
            var draggerPosition = $scope.columnIndex + "::" + $scope.widgetIndex;
            event.dataTransfer.setData("Text", draggerPosition);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setDragImage($element[0], 20, 20);
            _obj._draggedTile = $element;
            // console.log($scope.columnIndex, $scope.widgetIndex);
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
            // event.stopPropagation();
        });

        $element.on('dragend', function(event){
            event = event.originalEvent || event;
            $element.removeClass("md-widget-engine-widget-moving");
            return event.stopPropagation();
        });

        $element.on('drop', function(event){
            event.stopPropagation();
            
            // get the positions of swappers
            var draggerPosition = (event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain")).split("::");
            if($scope.columnIndex == draggerPosition[0] && $scope.widgetIndex == draggerPosition[1]) return; // no need to drop at the same place
            var dropeePosition = [$scope.columnIndex, $scope.widgetIndex];
            // get the elements
            var draggerElement = $scope.configuration.columns[draggerPosition[0]].widgets[draggerPosition[1]];
            var dropeeElement =  $scope.configuration.columns[dropeePosition[0]].widgets[dropeePosition[1]];
            // swap the elements
            $scope.configuration.columns[draggerPosition[0]].widgets[draggerPosition[1]] = dropeeElement;
            $scope.configuration.columns[dropeePosition[0]].widgets[dropeePosition[1]] = draggerElement;
            
            _obj._draggedTile.removeClass("md-widget-engine-widget-dashed");
            $element.removeClass("md-widget-engine-widget-dashed");

            setTimeout(function(){
                $scope.$apply();
                $scope.callback("update", $scope.configuration);
            }, 150);
            // if source and destination are same, well then move on :P
        });

    };

    return _obj.controller;
}


