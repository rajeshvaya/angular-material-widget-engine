angular
    .module('ngMdWidgetEngine', ['ngMaterial']);

// app
angular
    .module('ngMdWidgetEngine')
    .directive('mdWidgetEngineWidgetDragger', mdWidgetEngineWidgetTileDragger)
    .directive('mdWidgetEngineWidgetTileContentHtml', mdWidgetEngineWidgetTileContentHtml)
    .directive('mdWidgetEngineWidgetTile', mdWidgetEngineWidgetTileDirective)
    .directive('mdWidgetEngineColumn', mdWidgetEngineColumnDirective)
    .directive('mdWidgetEngine', mdWidgetEngineDirective);


// Every widget engine has X columns
function mdWidgetEngineColumnDirective(){
    return {
        scope: false,
        templateUrl: "/src/components/widgetEngine/templates/widgetEngineColumn.html",
        controller: function($scope, $element, $attrs, $transclude, $document, $timeout){
            $scope.widgetEngineClientRect = {};

            var mouseMove = function(e){
                // console.log("mouse moving", e);
                var newX = e.clientX - $scope.widgetEngineClientRect.left + 16;
                var differenceXPercentage =  ((newX - $element[0].children[0].offsetLeft) / $scope.widgetEngineClientRect.width) * 100;
                // don't allow doing anything the affected column is 15% already now
                
                if($scope.configuration.columns[$scope.columnIndex + 1].size - (differenceXPercentage - $scope.column.size) <=15)
                    return;
                if($scope.configuration.columns[$scope.columnIndex].size <= 15 && differenceXPercentage <= 15)
                    return;
                if($scope.configuration.columns[$scope.columnIndex + 1])
                    $scope.configuration.columns[$scope.columnIndex + 1].size -= differenceXPercentage - $scope.column.size;

                $scope.column.size = differenceXPercentage;
                $timeout(function(){
                    
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
                $scope.widgetEngineClientRect = $element.parent().parent()[0].getBoundingClientRect();
                
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
                if($scope.configuration.columns[$scope.columnIndex + 1] && $scope.configuration.columns[$scope.columnIndex -1]){
                    $scope.configuration.columns[$scope.columnIndex + 1].size += $scope.column.size / 2;
                    $scope.configuration.columns[$scope.columnIndex - 1].size += $scope.column.size / 2;
                }else if($scope.configuration.columns[$scope.columnIndex + 1]){
                    $scope.configuration.columns[$scope.columnIndex + 1].size += $scope.column.size;
                }else if($scope.configuration.columns[$scope.columnIndex - 1].size){
                    $scope.configuration.columns[$scope.columnIndex - 1].size += $scope.column.size;
                }

                var removedColumn = $scope.configuration.columns.splice($scope.columnIndex, 1);
                // check if the total width is less than 100% due to resizing of last column and deleting an empty column
                var totalWidth = 0;
                $scope.configuration.columns.forEach(function(c){
                    totalWidth+= c.size;
                });

                /*
                if(totalWidth < 100){
                    // increase the width of columns after the deleted one, equally
                    var currentDeletedColumn = $scope.columnIndex;
                    var totalColumns = $scope.configuration.columns.length;
                    var affectedColumns = totalColumns - currentDeletedColumn;
                    var distributeWidth = (100 - totalWidth) / affectedColumns;
                    for(var i=currentDeletedColumn-1; i<totalColumns; i++){
                        $scope.configuration.columns[i].size += distributeWidth;
                    }
                }
                */
            };

            // this is only needed when ther are 2 widget engines on the same page; the scope of parent is shared
            $scope.isAnyWidgetMoving = function(){
                var isMoving = false;
                $scope.configuration.columns.forEach(function(c){
                    c.widgets.forEach(function(w){
                        if(w._internalSettings.isMoving) isMoving = true;
                    });
                });
                return isMoving;
            };

            $element.on('dragenter', function(event){
                if(!$scope.isAnyWidgetMoving()) return false;
                $element.addClass("md-widget-engine-column-dashed");
                event.stopPropagation();
            });

            $element.on('dragover', function(event){
                if(!$scope.isAnyWidgetMoving()) return false;
                $element.addClass("md-widget-engine-column-dashed");
                event.stopPropagation();
                if(event.preventDefault) event.preventDefault();
            });

            $element.on('dragleave', function(event){
                if(!$scope.isAnyWidgetMoving()) return false;
                $element.removeClass("md-widget-engine-column-dashed");
                event.stopPropagation();
            });

            $element.on('drop', function(event){
                if(!$scope.isAnyWidgetMoving()) return false;
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
        templateUrl: "/src/components/widgetEngine/templates/widgetEngineWidgetTile.html",
        controller: mdWidgetEngineWidgetTileDirectiveController(),
        link: function($scope, iElm, iAttrs, controller) {}
    };
}

// Every widget can be dragged by a handler who is plays the role of a dragger
function mdWidgetEngineWidgetTileDragger(){
    return function($scope, $element, $attrs, $transclude){
        $element.attr('draggable', 'true');
        $element.on('dragstart dragend', function(event){
            if($scope.widget.sticky) return;
            event = event.originalEvent || event;
            event._initiatedByDragger = true; // this is to inform the parent widget that dragging is started by dragging the child element i.e. the dragger
        });
    };
}

// To pass custom directives dyamically it needs to be compiled first
function mdWidgetEngineWidgetTileContentHtml(){
    return {
        transclude: true,
        controller: function($scope, $element, $attrs, $transclude, $timeout, $compile){
            var el = $compile($scope.widget.content)($scope);
            $element.parent().append(el);
        },
        link: function($scope, iElm, iAttrs, controller) {}
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
        templateUrl: "/src/components/widgetEngine/templates/widgetEngine.html",
        controller: function($scope, $element, $attrs, $transclude, $timeout){
            $timeout(function(){
                $scope.configuration =  $scope.configuration || {};
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
        $scope.widget._internalSettings.trustedHTML = $sce.trustAsHtml($scope.widget.content);
        $scope.widget._internalSettings.isFabControlOpen = false;
        $scope.widget._internalSettings.isMoving = false;
        $scope.toggleFullscreen = function(){
            $scope.fullscreen = !$scope.fullscreen;
            $scope.callback("toggleFullscreen", $scope.widget);
        };

        $scope.toggleSticky = function(){
            $scope.widget.sticky = !$scope.widget.sticky;
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
                    $scope.callback("removeWidget", removedWidget[0]);
                    $scope.callback("update", $scope.configuration);
                }, 200);
            }, function(){});
        };

        $scope.customActionCallback = function(cAction){
            $scope.callback(cAction.event, $scope.widget);
        };

        $scope.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
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
            $scope.widget._internalSettings.isMoving = true;
            // console.log($scope.columnIndex, $scope.widgetIndex);
        });

        $element.on('dragenter', function(event){
            event.stopPropagation();
            if($scope.widget.sticky) return false;
            if(!$scope.isAnyWidgetMoving()) return false;
            if($element.hasClass('md-widget-engine-widget-moving')) return;
            $element.addClass("md-widget-engine-widget-dashed");
        });

        $element.on('dragover', function(event){
            event.stopPropagation();
            if($scope.widget.sticky) return false;
            if(!$scope.isAnyWidgetMoving()) return false;
            if($element.hasClass('md-widget-engine-widget-moving')) return;
            $element.addClass("md-widget-engine-widget-dashed");
            if(event.preventDefault) event.preventDefault();
        });

        $element.on('dragleave', function(event){
            event.stopPropagation();
            if($scope.widget.sticky) return false;
            if(!$scope.isAnyWidgetMoving()) return false;
            $element.removeClass("md-widget-engine-widget-dashed");
        });

        $element.on('dragend', function(event){
            event.stopPropagation();
            if($scope.widget.sticky) return false;
            if(!$scope.isAnyWidgetMoving()) return false;
            event = event.originalEvent || event;
            $element.removeClass("md-widget-engine-widget-moving");
            $scope.widget._internalSettings.isMoving = false;
        });

        $element.on('drop', function(event){
            event.stopPropagation();
            if($scope.widget.sticky) return false;
            if(!$scope.isAnyWidgetMoving()) return false;

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



angular.module('ngMdWidgetEngine').run(['$templateCache', function($templateCache) {$templateCache.put('/src/components/widgetEngine/templates/widgetEngine.html','<div class="md-widget-engine-container" ng-if="configuration.columns">\n    <div class="md-widget-engine">\n        <div layout="row" flex style="height: 100%">\n            <md-widget-engine-column \n                ng-repeat="(columnIndex, column) in configuration.columns" \n                column="column" \n                style="background-color: {{column.background}}; width: {{column.size}}%; min-width: 15%;"\n            ></md-widget-engine-column>\n        </div>\n    </div>\n</div><!-- md-widget-engine-container -->');
$templateCache.put('/src/components/widgetEngine/templates/widgetEngineColumn.html','<div class="md-widget-engine-column" style="height:100%; position:relative">\n    \n    <span class="md-widget-engine-column-resizer" ng-mousedown="setupColumnResizing($event)" ng-show="configuration.columns.length-1 > columnIndex && configuration.resizeableColumns !== false">\n    </span>\n    <div class="md-widget-engine-new-column-handler {{configuration.columns.length==1 ? \'single-column-only\' : \'\'}}" ng-show="configuration.columns.length-1 > columnIndex || configuration.columns.length==1 || column.widgets.length==0">\n        <div ng-click="addNewColumn()" ng-show="column.widgets.length > 0 && configuration.columns.length < 6 && configuration.dynamicColumns !== false" style="outline: none; border: 0px;">\n            <md-icon class="material-icons md-dark md-24" style="outline: none">add_circle</md-icon>\n            <md-tooltip md-direction="{{columnIndex == configuration.columns.length-1 ? \'left\': \'right\'}}">Add new column here</md-tooltip>\n        </div>\n        <div ng-click="removeEmptyColumn()" ng-show="column.widgets.length == 0 && configuration.dynamicColumns !== false" style="outline: none; border: 0px;">\n            <md-icon class="material-icons md-dark md-24">remove_circle</md-icon>\n            <md-tooltip md-direction="left">Remove this column</md-tooltip>\n        </div>\n    </div>\n\n    <div class="md-widget-engine-widget-tiles-container">\n        <md-widget-engine-widget-tile ng-repeat="(widgetIndex, widget) in column.widgets" widget="widget" widgetIndex="widgetIndex"></md-widget-engine-widget-tile>\n    </div>\n</div><!-- md-widget-engine-column -->');
$templateCache.put('/src/components/widgetEngine/templates/widgetEngineWidgetTile.html','<div class="md-widget-engine-widget-tile-container {{fullscreen ? \'md-widget-engine-widget-fullscreen\' : \'\'}} md-widget-engine-widget-{{widget.name}}">\n    <div class="md-widget-engine-widget-tile md-whiteframe-2dp">\n\n        <div class="md-widget-engine-widget-tile-title-container md-widget-engine-widget-{{widget.name}}">\n            <md-toolbar class="md-whiteframe-2dp md-widget-engine-title-control-type-{{widget.controlsLayout || \'default\'}}" style="z-index: {{(configuration.columns[columnIndex].widgets.length - widgetIndex) * 10}}">\n                <div class="md-toolbar-tools" style="cursor: pointer" md-widget-engine-widget-dragger>\n                    <div class="md-widget-engine-widget-tile-title" flex>\n                        <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 80%">{{widget.title || \'Widget\'}}</div>\n                    </div>\n                    <span ></span>\n                    <div class="md-widget-engine-widget-tile-controls-container" style="position:relative">\n                        <div ng-switch on="widget.controlsLayout">\n\n                            <div ng-switch-default class="md-widget-engine-widget-title-default-controls">\n                                <div class="md-widget-engine-widget-tile-control" ng-mouseup="removeWidget($event)" ng-show="widget.closeControl !== false">\n                                    <span class="md-widget-engine-widget-close-control">\n                                        <md-icon class="material-icons md-light md-24">\n                                            close\n                                            <md-tooltip md-direction="bottom">Remove this widget</md-tooltip>\n                                        </md-icon>\n                                    </span>\n                                </div>\n                                <div class="md-widget-engine-widget-tile-control" ng-click="toggleSticky()" ng-show="widget.stickyControl">\n                                    <span class="md-widget-engine-widget-sticky-control">\n                                        <md-icon class="material-icons md-light md-24" ng-if="!widget.sticky">\n                                            lock_open\n                                            <md-tooltip md-direction="bottom">Make this widget sticky</md-tooltip>\n                                        </md-icon>\n                                        <md-icon class="material-icons md-light md-24" ng-if="widget.sticky">\n                                            lock\n                                            <md-tooltip md-direction="bottom">Make this widget non-sticky</md-tooltip>\n                                        </md-icon>\n                                    </span>\n                                </div>\n                                <div class="md-widget-engine-widget-tile-control" ng-click="toggleFullscreen()" ng-show="widget.fullscreenControl !== false">\n                                    <span class="md-widget-engine-widget-fullscreen-control">\n                                        <md-icon class="material-icons md-light md-24">\n                                            fullscreen\n                                            <md-tooltip md-direction="bottom">Toggle fullscreen mode</md-tooltip>\n                                        </md-icon>\n                                    </span>\n                                </div>\n\n                                <div class="md-widget-engine-widget-tile-control" ng-repeat="cAction in widget.customActions" class="md-fab md-mini md-raised" ng-click="customActionCallback(cAction)">\n                                    <span class="md-widget-engine-widget-custom-control">\n                                        <md-icon class="material-icons md-light md-24">\n                                            {{cAction.icon}}\n                                            <md-tooltip md-direction="bottom">{{cAction.tooltip}}</md-tooltip>\n                                        </md-icon>\n                                    </span>\n                                </div>\n                            </div><!-- default layout -->\n\n\n                            <div ng-switch-when="fab" class="md-widget-engine-widget-title-fab-controls">\n                                <md-fab-speed-dial md-direction="down" class="md-scale" ng-show="widget.closeControl !== false || widget.fullscreenControl !== false || widget.stickyControl !== false || widget.customActions.length ">\n                                    <md-fab-trigger>\n                                        <md-button aria-label="menu" class="md-fab md-mini md-raised md-button">\n                                            <md-icon class="material-icons md-light md-24">more_vert</md-icon>\n                                        </md-button>\n                                    </md-fab-trigger>\n\n                                    <md-fab-actions>\n                                        <md-button class="md-fab md-mini md-raised" ng-mouseup="removeWidget($event)" ng-show="widget.closeControl !== false">\n                                            <md-icon class="material-icons md-light md-24">\n                                                close\n                                                <md-tooltip md-direction="bottom">Remove this widget</md-tooltip>\n                                            </md-icon>\n                                        </md-button>\n\n                                        <md-button class="md-fab md-mini md-raised" ng-click="toggleSticky()" ng-show="widget.stickyControl">\n                                            <md-icon class="material-icons md-light md-24" ng-if="!widget.sticky">\n                                                lock_open\n                                                <md-tooltip md-direction="bottom">Make this widget sticky</md-tooltip>\n                                            </md-icon>\n                                            <md-icon class="material-icons md-light md-24" ng-if="widget.sticky">\n                                              lock\n                                              <md-tooltip md-direction="bottom">Make this widget non-sticky</md-tooltip>\n                                            </md-icon>\n                                        </md-button>\n\n                                        <md-button class="md-fab md-mini md-raised" ng-click="toggleFullscreen()" ng-show="widget.fullscreenControl !== false">\n                                            <md-icon class="material-icons md-light md-24">\n                                                fullscreen\n                                                <md-tooltip md-direction="bottom">Toggle fullscreen mode</md-tooltip>\n                                            </md-icon>\n                                        </md-button>\n\n                                        <md-button ng-repeat="cAction in widget.customActions" class="md-fab md-mini md-raised " ng-click="customActionCallback(cAction)">\n                                            <md-icon class="material-icons md-light md-24">\n                                                {{cAction.icon}}\n                                                <md-tooltip md-direction="bottom">{{cAction.tooltip}}</md-tooltip>\n                                            </md-icon>\n                                        </md-button>\n\n                                    </md-fab-actions>\n                                </md-fab-speed-dial>\n                            </div><!-- fab-controls layout -->\n\n\n                            <div ng-switch-when="menu" class="md-widget-engine-widget-title-menu-controls">\n                                    <md-menu ng-show="widget.closeControl !== false || widget.fullscreenControl !== false || widget.stickyControl !== false || widget.customActions.length ">\n                                      <md-button aria-label="Open menu" class="md-icon-button" ng-click="openMenu($mdOpenMenu, $event)">\n                                        <md-icon md-menu-origin>more_vert</md-icon>\n                                      </md-button>\n                                      <md-menu-content width="2">\n                                        <md-menu-item>\n                                          <md-button ng-mouseup="removeWidget($event)" ng-show="widget.closeControl !== false">\n                                            <md-icon class="material-icons md-light md-24" md-menu-align-target>close</md-icon>\n                                            Remove this widget\n                                          </md-button>\n                                        </md-menu-item>\n\n                                        <md-menu-item ng-show="widget.stickyControl">\n                                          <md-button ng-click="toggleSticky()" ng-if="!widget.sticky">\n                                            <md-icon class="material-icons md-light md-24" md-menu-align-target>lock_open</md-icon>\n                                            Make this widget sticky\n                                          </md-button>\n                                          <md-button ng-click="toggleSticky()" ng-if="widget.sticky">\n                                            <md-icon class="material-icons md-light md-24" md-menu-align-target>lock</md-icon>\n                                            Make this widget non-sticky\n                                          </md-button>\n                                        </md-menu-item>\n\n                                        <md-menu-item>\n                                          <md-button ng-click="toggleFullscreen()" ng-show="widget.fullscreenControl !== false">\n                                            <md-icon class="material-icons md-light md-24" md-menu-align-target>fullscreen</md-icon>\n                                            Toggle fullscreen\n                                          </md-button>\n                                        </md-menu-item>\n\n                                        <md-menu-divider ng-if="widget.customActions.length"></md-menu-divider>\n\n                                        <md-menu-item ng-repeat="cAction in widget.customActions">\n                                          <md-button ng-click="customActionCallback(cAction)">\n                                            <md-icon class="material-icons md-light md-24" md-menu-align-target>{{cAction.icon}}</md-icon>\n                                            {{cAction.tooltip}}\n                                          </md-button>\n                                        </md-menu-item>\n                                        \n                                      </md-menu-content>\n                                    </md-menu>\n                            </div><!-- menu layout -->\n\n\n\n                        </div><!-- ng-switch-->\n                    </div><!-- md-widget-engine-widget-tile-controls-container -->\n                </div><!-- md-toolbar-tools -->\n            </md-toolbar>\n        </div>\n\n        <div class="md-widget-engine-widget-tile-content-container md-widget-engine-widget-{{widget.name}}">\n            <md-content>\n                <div class="md-widget-engine-widget-tile-content {{widget.resize ? \'resize-vertical\' : \'\'}}" style="min-height:{{fullscreen ? \'100%\' : widget.minHeight + \'px\'}}; height:{{fullscreen ? \'100%\' : widget.minHeight + \'px\'}}; max-height:{{fullscreen ? \'100%\' : widget.maxHeight + \'px\'}}; position:relative;">\n                    <div ng-switch on="widget.type" style="height: inherit">\n                        <div ng-switch-when="include" style="height: inherit">\n                            <ng-include src="widget.content"></ng-include>\n                        </div><!-- ng-switch-when -->\n\n                        <div ng-switch-when="iframe" style="height: inherit">\n                            <iframe ng-src="{{widget._internalSettings.trustedURL}}" frameborder=0 style="border:0px; width:100%; height:100%"></iframe>\n                        </div><!-- ng-switch-when -->\n\n                        <div ng-switch-when="html" style="height: inherit">\n                            <md-widget-engine-widget-tile-content-html>\n                                {{widget._internalSettings.trustedHTML}}\n                            </md-widget-engine-widget-tile-content-html>\n                        </div><!-- ng-switch-when -->\n\n                    </div> <!-- ng-switch -->\n                </div>\n            </md-content>    \n        </div>\n\n    </div><!-- md-widget-engine-widget-tile -->\n</div><!-- md-widget-engine-widget-tile-container -->\n');}]);