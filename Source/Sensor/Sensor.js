import Cesium from "Cesium";

import {RectangularSensorPrimitive} from "./RectangularSensor/RectangularSensorPrimitive";
import {RectangularSensorGraphics} from "./RectangularSensor/RectangularSensorGraphics";
import {RectangularSensorVisualizer} from './RectangularSensor/RectangularSensorVisualizer';

//conicSensor
import {ConicArcSensorGeometry} from './ConicArcSensor/ConicArcSensorGeometry';
import  {ConicArcSensorOutlineGeometry} from './ConicArcSensor/ConicArcSensorOutlineGeometry';
import {ConicArcSensorGraphics} from './ConicArcSensor/ConicArcSensorGraphics';
import {ConicArcSensorCollection} from './ConicArcSensor/ConicArcSensorCollection';


//rectangularSensor
Cesium.RectangularSensorPrimitive = RectangularSensorPrimitive;
Cesium.RectangularSensorGraphics = RectangularSensorGraphics;
Cesium.RectangularSensorVisualizer = RectangularSensorVisualizer;

//conicSensor
Cesium.ConicArcSensorGeometry = ConicArcSensorGeometry;
Cesium.ConicArcSensorOutlineGeometry = ConicArcSensorOutlineGeometry;
Cesium.ConicArcSensorGraphics = ConicArcSensorGraphics;
Cesium.ConicArcSensorCollection = ConicArcSensorCollection;


var DataSourceDisplay = Cesium.DataSourceDisplay;
var originalDefaultVisualizersCallback = DataSourceDisplay.defaultVisualizersCallback;
DataSourceDisplay.defaultVisualizersCallback = function (scene, entityCluster, dataSource) {
    var entities = dataSource.entities;
    var array = originalDefaultVisualizersCallback(scene, entityCluster, dataSource);
    return array.concat([
        new RectangularSensorVisualizer(scene, entities)
    ]);
};