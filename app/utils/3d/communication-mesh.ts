import THREE, { TubeGeometry } from 'three';
import DrawableClazzCommunication from 'explorviz-frontend/models/drawableclazzcommunication';
import CommunicationLayout from '../layout-models/communication-layout';

export default class CommunicationMesh extends THREE.Mesh {

  dataModel: DrawableClazzCommunication;
  layout: CommunicationLayout;

  highlighted: boolean = false;
  defaultColor: THREE.Color;
  highlightingColor: THREE.Color;

  constructor(layout: CommunicationLayout, dataModel: DrawableClazzCommunication,
    defaultColor: THREE.Color, highlightingColor: THREE.Color) {
    super();
    this.layout = layout;
    this.dataModel = dataModel;
    this.defaultColor = defaultColor;
    this.highlightingColor = highlightingColor;

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(defaultColor)
    });
  }


  highlight() {
    this.highlighted = true;
    if (this.material instanceof THREE.MeshBasicMaterial) {
      this.material.color = this.highlightingColor;
    }
  }


  unhighlight() {
    this.highlighted = false;
    if (this.material instanceof THREE.MeshBasicMaterial) {
      this.material.color = this.defaultColor;
      this.material.transparent = false;
      this.material.opacity = 1.0;
    }
  }

  renderAsLine(viewCenterPoint: THREE.Vector3, startPoint = this.layout.startPoint, endPoint = this.layout.endPoint) {
    let commLayout = this.layout;

    const start = new THREE.Vector3();
    start.subVectors(startPoint, viewCenterPoint);

    const end = new THREE.Vector3();
    end.subVectors(endPoint, viewCenterPoint);

    const direction = new THREE.Vector3().subVectors(end, start);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(start, end, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1,
      0, 0, -1, 0, 0, 0, 0, 0, 1));

    let lineThickness = commLayout.lineThickness;
    const edgeGeometry = new THREE.CylinderGeometry(lineThickness, lineThickness,
      direction.length(), 20, 1);
    this.geometry = edgeGeometry;
    this.applyMatrix(orientation);

    // Set position to center of pipe
    this.position.copy(end.add(start).divideScalar(2));
  }

  renderAsCurve(viewCenterPoint = new THREE.Vector3(), curveHeight = 5, curveSegments = 20) {
    let layout = this.layout;

    let start = new THREE.Vector3();
    start.subVectors(layout.startPoint, viewCenterPoint);

    let end = new THREE.Vector3();
    end.subVectors(layout.endPoint, viewCenterPoint);

    // Determine middle
    let dir = end.clone().sub(start);
    let length = dir.length();
    let halfVector = dir.normalize().multiplyScalar(length * 0.5);
    let middle = start.clone().add(halfVector);
    middle.y += curveHeight;

    let curve = new THREE.QuadraticBezierCurve3(
      start,
      middle,
      end
    );

    this.geometry = new TubeGeometry(curve, curveSegments, layout.lineThickness);
  }

  delete() {
    if (this.parent) {
      this.parent.remove(this);
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material instanceof THREE.Material) {
      this.material.dispose();
    }
  }

}