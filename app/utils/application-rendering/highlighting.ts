import BaseMesh from 'explorviz-frontend/view-objects/3d/base-mesh';
import ClazzCommunicationMesh from 'explorviz-frontend/view-objects/3d/application/clazz-communication-mesh';
import ComponentMesh from 'explorviz-frontend/view-objects/3d/application/component-mesh';
import ClazzMesh from 'explorviz-frontend/view-objects/3d/application/clazz-mesh';
import DS from 'ember-data';
import Trace from 'explorviz-frontend/models/trace';
import TraceStep from 'explorviz-frontend/models/tracestep';
import ApplicationObject3D from 'explorviz-frontend/view-objects/3d/application/application-object-3d';
import { tracked } from '@glimmer/tracking';
import {
  Application, Class, isClass, isPackage, Package,
} from '../landscape-schemes/structure-data';
import { DrawableClassCommunication, isDrawableClassCommunication } from '../landscape-rendering/class-communication-computer';

export default class Highlighting {
  applicationObject3D: ApplicationObject3D;

  @tracked
  highlightedEntity: BaseMesh | Trace | null = null;

  constructor(applicationObject3D: ApplicationObject3D) {
    this.applicationObject3D = applicationObject3D;
  }

  /**
   * Highlights a given mesh
   *
   * @param mesh Either component, clazz or clazz communication mesh which shall be highlighted
   * @param toggleHighlighting Determines whether highlighting a already highlighted entity
   *                           causes removal of all highlighting
   */
  highlight(mesh: ComponentMesh | ClazzMesh | ClazzCommunicationMesh,
    communication: DrawableClassCommunication[], toggleHighlighting = true): void {
    // Reset highlighting if highlighted mesh is clicked
    if (mesh.highlighted && toggleHighlighting) {
      this.removeHighlighting();
      return;
    }

    // Reset highlighting
    this.removeHighlighting();
    const model = mesh.dataModel;

    // Highlight the entity itself
    mesh.highlight();
    this.highlightedEntity = mesh;

    // All clazzes in application
    const application = this.applicationObject3D.dataModel;
    const allClazzesAsArray = Highlighting.getAllClazzes(application);
    const allClazzes = new Set<Class>(allClazzesAsArray);

    // Get all clazzes in current component
    const containedClazzes = new Set<Class>();

    // Add all clazzes which are contained in a component
    if (isPackage(model)) {
      Highlighting.getContainedClazzes(model, containedClazzes);
    // Add clazz itself
    } else if (isClass(model)) {
      containedClazzes.add(model);
    // Add source and target clazz of communication
    } else if (isDrawableClassCommunication(model)) {
      containedClazzes.add(model.sourceClass);
      containedClazzes.add(model.targetClass);
    // Given model is not supported
    } else {
      return;
    }

    const allInvolvedClazzes = new Set<Class>(containedClazzes);

    communication.forEach((comm) => {
      const { sourceClass, targetClass, id } = comm;

      // Add clazzes which communicate directly with highlighted entity
      // For a highlighted communication all involved clazzes are already known
      if (containedClazzes.has(sourceClass)
          && !(isDrawableClassCommunication(model))) {
        allInvolvedClazzes.add(targetClass);
      } else if (containedClazzes.has(targetClass)
          && !(isDrawableClassCommunication(model))) {
        allInvolvedClazzes.add(sourceClass);
        // Hide communication which is not directly connected to highlighted entity
      } else if (!containedClazzes.has(sourceClass) || !containedClazzes.has(targetClass)) {
        const commMesh = this.applicationObject3D.getCommMeshByModelId(id);
        if (commMesh) {
          commMesh.turnTransparent();
        }
        // communication is self-looped and not equal to the highlighted one, i.e. model
      } else if (isDrawableClassCommunication(model) && sourceClass === targetClass
        && model !== comm) {
        const commMesh = this.applicationObject3D.getCommMeshByModelId(id);
        if (commMesh) {
          commMesh.turnTransparent();
        }
      }
    });

    const nonInvolvedClazzes = new Set([...allClazzes].filter((x) => !allInvolvedClazzes.has(x)));

    const componentSet = new Set<Package>();

    allInvolvedClazzes.forEach((clazz) => {
      Highlighting.getAllAncestorComponents(clazz.parent, componentSet);
    });

    // Turn non involved clazzes transparent
    nonInvolvedClazzes.forEach((clazz) => {
      const clazzMesh = this.applicationObject3D.getBoxMeshbyModelId(clazz.id);
      const componentMesh = this.applicationObject3D.getBoxMeshbyModelId(clazz.parent.id);
      if (clazzMesh instanceof ClazzMesh && componentMesh instanceof ComponentMesh
            && componentMesh.opened) {
        clazzMesh.turnTransparent();
      }
      this.turnComponentAndAncestorsTransparent(clazz.parent, componentSet);
    });
  }

  /**
   * Highlights the mesh which belongs to a given data model
   *
   * @param entity Component or clazz of which the corresponding mesh shall be highlighted
   */
  highlightModel(entity: Package|Class, communication: DrawableClassCommunication[]) {
    const mesh = this.applicationObject3D.getBoxMeshbyModelId(entity.id);
    if (mesh instanceof ComponentMesh || mesh instanceof ClazzMesh) {
      this.highlight(mesh, communication);
    }
  }

  /**
   * Highlights a trace.
   *
   * @param trace Trace which shall be highlighted
   * @param step Step of the trace which shall be highlighted. Default is 1
   * @param application Application which belongs to the trace
   */
  highlightTrace(trace: Trace, step = 1, application: Application) {
    this.removeHighlighting();

    this.highlightedEntity = trace;

    const drawableComms = application.hasMany('drawableClazzCommunications').value() as DS.ManyArray<DrawableClazzCommunication>|null;

    if (!drawableComms) {
      return;
    }

    // All clazzes in application
    const allClazzesAsArray = Highlighting.getAllClazzes(application);
    const allClazzes = new Set<Class>(allClazzesAsArray);

    const involvedClazzes = new Set<Class>();

    let highlightedTraceStep: TraceStep;

    trace.get('traceSteps').forEach((traceStep) => {
      if (traceStep.tracePosition === step) {
        highlightedTraceStep = traceStep;
      }
    });

    drawableComms.forEach((comm) => {
      const commMesh = this.applicationObject3D.getCommMeshByModelId(comm.get('id'));

      if (comm.containedTraces.has(trace)) {
        const sourceClazz = comm.belongsTo('sourceClazz').value() as Clazz;
        const targetClazz = comm.belongsTo('targetClazz').value() as Clazz;
        involvedClazzes.add(sourceClazz);
        involvedClazzes.add(targetClazz);
        if (comm.containedTraceSteps.has(highlightedTraceStep)) {
              commMesh?.highlight();
        }
      } else {
            commMesh?.turnTransparent();
      }
    });

    const nonInvolvedClazzes = new Set([...allClazzes].filter((x) => !involvedClazzes.has(x)));

    const componentSet = new Set<Package>();
    involvedClazzes.forEach((clazz) => {
      Highlighting.getAllAncestorComponents(clazz.parent, componentSet);
    });

    nonInvolvedClazzes.forEach((clazz) => {
      const clazzMesh = this.applicationObject3D.getBoxMeshbyModelId(clazz.id);
      const componentMesh = this.applicationObject3D.getBoxMeshbyModelId(clazz.parent.id);
      if (clazzMesh instanceof ClazzMesh && componentMesh instanceof ComponentMesh
            && componentMesh.opened) {
        clazzMesh.turnTransparent();
      }
      this.turnComponentAndAncestorsTransparent(clazz.parent, componentSet);
    });
  }

  /**
   * Highlights the stored highlighted entity again.
   */
  updateHighlighting() {
    const { highlightedEntity } = this;

    if (!highlightedEntity) {
      return;
    }

    // Re-run highlighting for entity
    if (highlightedEntity instanceof ClazzMesh
        || highlightedEntity instanceof ComponentMesh
        || highlightedEntity instanceof ClazzCommunicationMesh) {
      this.highlight(highlightedEntity, false);
    }
  }

  /**
   * Restores default color and transparency for all application meshes
   */
  removeHighlighting() {
    const meshes = this.applicationObject3D.getAllMeshes();
    meshes.forEach((mesh) => {
      mesh.unhighlight();
    });
    this.highlightedEntity = null;
  }

  /**
   * Turns the mesh which belongs to a component and all its child meshes if
   * they are not part of the ignorableComponents set.
   *
   * @param component Component which shall be turned transparent
   * @param ignorableComponents Set of components which shall not be turned transparent
   */
  turnComponentAndAncestorsTransparent(component: Package, ignorableComponents: Set<Package>) {
    if (ignorableComponents.has(component)) { return; }

    ignorableComponents.add(component);

    const { parent } = component;

    const componentMesh = this.applicationObject3D.getBoxMeshbyModelId(component.id);

    if (parent === undefined) {
      if (componentMesh instanceof ComponentMesh) {
        componentMesh.turnTransparent();
      }
      return;
    }

    const parentMesh = this.applicationObject3D.getBoxMeshbyModelId(parent.id);
    if (componentMesh instanceof ComponentMesh
          && parentMesh instanceof ComponentMesh && parentMesh.opened) {
      componentMesh.turnTransparent();
    }
    this.turnComponentAndAncestorsTransparent(parent, ignorableComponents);
  }

  static getAllClazzes(application: Application) {
    let clazzes: Class[] = [];

    function getAllClazzesFromComponent(component: Package) {
      clazzes = clazzes.concat(component.classes);
      component.subPackages.forEach((subComponent) => {
        getAllClazzesFromComponent(subComponent);
      });
    }

    application.packages.forEach((component) => {
      getAllClazzesFromComponent(component);
    });

    return clazzes;
  }

  static getAllAncestorComponents(component: Package, componentSet: Set<Package> = new Set()) {
    function getAncestors(comp: Package, set: Set<Package>) {
      if (set.has(comp)) { return; }

      set.add(comp);

      const { parent } = comp;
      if (parent === undefined) {
        return;
      }

      getAncestors(parent, set);
    }

    getAncestors(component, componentSet);

    return componentSet;
  }

  static getContainedClazzes(component: Package, containedClazzes: Set<Class>) {
    const clazzes = component.classes;

    clazzes.forEach((clazz) => {
      containedClazzes.add(clazz);
    });

    const children = component.subPackages;

    children.forEach((child) => {
      Highlighting.getContainedClazzes(child, containedClazzes);
    });
  }
}
