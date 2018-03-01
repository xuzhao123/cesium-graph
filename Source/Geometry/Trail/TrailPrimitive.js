import Cesium from "Cesium";
import RectangularSensorVS from "./shaders/RectangularSensorVS.glsl";
import RectangularSensorFS from "./shaders/RectangularSensorFS.glsl";

var BoundingSphere = Cesium.BoundingSphere;
var Cartesian3 = Cesium.Cartesian3;
var Color = Cesium.Color;
var combine = Cesium.combine;
var ComponentDatatype = Cesium.ComponentDatatype;
var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
var defineProperties = Cesium.defineProperties;
var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var Matrix4 = Cesium.Matrix4;
var PrimitiveType = Cesium.PrimitiveType;
var Buffer = Cesium.Buffer;
var BufferUsage = Cesium.BufferUsage;
var DrawCommand = Cesium.DrawCommand;
var Pass = Cesium.Pass;
var RenderState = Cesium.RenderState;
var ShaderProgram = Cesium.ShaderProgram;
var ShaderSource = Cesium.ShaderSource;
var VertexArray = Cesium.VertexArray;
var BlendingState = Cesium.BlendingState;
var CullFace = Cesium.CullFace;
var Material = Cesium.Material;
var SceneMode = Cesium.SceneMode;
var VertexFormat = Cesium.VertexFormat;
var CesiumMath = Cesium.Math;
var Matrix3 = Cesium.Matrix3;
var Matrix4 = Cesium.Matrix4;
var JulianDate = Cesium.JulianDate;

var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var atan = Math.atan;
var asin = Math.asin;

var attributeLocations = {
    position: 0,
    normal: 1
};

function TrailPrimitive(options) {

    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    this.show = defaultValue(options.show, true);

    this.color = defaultValue(options.color, Color.WHITE);

    this.modelMatrix = Matrix4.clone(options.modelMatrix, new Matrix4());
    this._modelMatrix = new Matrix4();

    this.material = defined(options.material) ? options.material : Material.fromType(Material.ColorType);
    this._material = undefined;

    this.positions = defaultValue(options.positions, []);
    this._positions = undefined;

    this._boundingSphere = new BoundingSphere();
    this._boundingSphereWC = new BoundingSphere();

    this._verticalFrontCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });

    this._verticalBackCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });

    this._colorCommands = [];

    this._frontFaceRS = undefined;
    this._backFaceRS = undefined;
    this._sp = undefined;

    this._va = undefined;

    this._uniforms = {};
}

TrailPrimitive.prototype.update = function (frameState) {
    var mode = frameState.mode;
    if (!this.show || mode !== SceneMode.SCENE3D) {
        return;
    }

    var modelMatrixChanged = !Matrix4.equals(this.modelMatrix, this._modelMatrix);
    if (modelMatrixChanged) {
        Matrix4.clone(this.modelMatrix, this._modelMatrix);
        BoundingSphere.transform(this._boundingSphere, this.modelMatrix, this._boundingSphereWC);
    }

    var material = this.material;
    var positions = this.positions;

    if (positions.length <= 1) {
        return;
    }

    if (this._positions !== positions) {
        this._positions = positions;
        createVertexArray(this, positions);
    }
    if (!this._backFaceRS) {
        createRenderState(this, frameState);
    }
    if (this._sp) {
        createShaderProgram(this, frameState, material);
        createCommands(this, translucent);
    }

    var commandList = frameState.commandList;
    var passes = frameState.passes;
    var colorCommands = this._colorCommands;

    if (passes.render) {
        for (var i = 0, len = colorCommands.length; i < len; i++) {
            var colorCommand = colorCommands[i];
            commandList.push(colorCommand);
        }
    }
};

function createVertexArray(primitive, positions) {
    var planeLength = Array.prototype.concat.apply([], positions).length - positions.length;
    var vertices = new Float32Array(2 * 3 * 3 * planeLength);

    var k = 0;
    for (var i = 0, len = positions.length - 1; i < len; i++) {
        vertices[k++] = 0.0;
        vertices[k++] = -1000.0;
        vertices[k++] = 0.0;

        vertices[k++] = 0.0;
        vertices[k++] = 1000.0;
        vertices[k++] = 0.0;
    }

    if (!primitive._va) {
        var vertexBuffer = Buffer.createVertexBuffer({
            context: context,
            typedArray: vertices,
            usage: BufferUsage.STREAM_DRAW
        });
        primitive._va = vertexBuffer;
    } else {
        primitive._va.copyFromArrayView(vertices, 0)
    }
}

function createShaderProgram(primitive, frameState, material) {
    var context = frameState.context;
    var fs = new ShaderSource({
        sources: [material.shaderSource, RectangularSensorFS]
    });

    primitive._sp = ShaderProgram.replaceCache({
        context: context,
        shaderProgram: primitive._sp,
        vertexShaderSource: vs,
        fragmentShaderSource: fs,
        attributeLocations: attributeLocations
    });
}

function createRenderState(primitive) {
    primitive._frontFaceRS = RenderState.fromCache({
        depthTest: {
            enabled: false
        },
        depthMask: false,
        blending: BlendingState.ALPHA_BLEND,
        cull: {
            enabled: true,
            face: CullFace.BACK
        }
    });

    primitive._backFaceRS = RenderState.fromCache({
        depthTest: {
            enabled: false
        },
        depthMask: false,
        blending: BlendingState.ALPHA_BLEND,
        cull: {
            enabled: true,
            face: CullFace.FRONT
        }
    });
}

function createCommand(primitive, frontCommand, backCommand, va) {
    backCommand.vertexArray = va;
    backCommand.renderState = primitive._backFaceRS;
    backCommand.shaderProgram = primitive._sp;
    backCommand.uniformMap = combine(primitive._uniforms, primitive._material._uniforms);
    backCommand.uniformMap.u_normalDirection = function () {
        return -1.0;
    };
    backCommand.pass = Pass.TRANSLUCENT;
    backCommand.modelMatrix = primitive.modelMatrix;
    primitive._colorCommands.push(backCommand);


    frontCommand.vertexArray = va;
    frontCommand.renderState = primitive._frontFaceRS;
    frontCommand.shaderProgram = primitive._sp;
    frontCommand.uniformMap = combine(primitive._uniforms, primitive._material._uniforms);
    frontCommand.pass = Pass.TRANSLUCENT;
    frontCommand.modelMatrix = primitive.modelMatrix;
    primitive._colorCommands.push(frontCommand);
}

function createCommands(primitive) {
    primitive._colorCommands.length = 0;
    createCommand(primitive, primitive._verticalFrontCommand, primitive._verticalBackCommand, primitive._va);
}

//endregion

export {TrailPrimitive};
