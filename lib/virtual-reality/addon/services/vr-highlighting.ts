import Service, { inject as service } from '@ember/service';
import Configuration from "explorviz-frontend/services/configuration";
import * as Highlighting from 'explorviz-frontend/utils/application-rendering/highlighting';
import ApplicationObject3D from 'explorviz-frontend/view-objects/3d/application/application-object-3d';
import ClazzCommunicationMesh from "explorviz-frontend/view-objects/3d/application/clazz-communication-mesh";
import ClazzMesh from "explorviz-frontend/view-objects/3d/application/clazz-mesh";
import ComponentMesh from "explorviz-frontend/view-objects/3d/application/component-mesh";
import VrApplicationRenderer from "./vr-application-renderer";
import LocalVrUser from "./local-vr-user";
import VrMessageSender from "./vr-message-sender";

export type HightlightComponentArgs = {
  entityType: string,
  entityID: string,
  color?: THREE.Color
};

type HighlightableMesh = ComponentMesh | ClazzMesh | ClazzCommunicationMesh;

function isHightlightableMesh(object: THREE.Object3D): object is HighlightableMesh {
  return object instanceof ComponentMesh ||
    object instanceof ClazzMesh ||
    object instanceof ClazzCommunicationMesh;
}

export default class VrHighlightingService extends Service {
  @service('configuration') private configuration!: Configuration;
  @service('local-vr-user') private localUser!: LocalVrUser;
  @service('vr-application-renderer') private vrApplicationRenderer!: VrApplicationRenderer;
  @service('vr-message-sender') private sender!: VrMessageSender;

  highlightComponent(application: ApplicationObject3D, object: THREE.Object3D) {
    if (isHightlightableMesh(object)) {
      this.hightlightMesh(application, object, this.localUser.color);

      const appId = application.dataModel.instanceId;
      const entityType = this.getEntityType(object);
      const entityId = this.getEntityId(object);
      this.sender.sendHighlightingUpdate(appId, entityType, entityId, object.highlighted);
    }
  }

  removeHighlightingLocally(application: ApplicationObject3D) {
    Highlighting.removeHighlighting(application);
  }

  hightlightComponentLocallyByTypeAndId(application: ApplicationObject3D, {
    entityType, entityID, color
  }: HightlightComponentArgs) {
    const meshes = this.findMeshesByTypeAndId(application, entityType, entityID);
    for (const mesh of meshes) this.hightlightMesh(application, mesh, color);
  }

  private hightlightMesh(
    application: ApplicationObject3D,
    mesh: ComponentMesh | ClazzMesh | ClazzCommunicationMesh,
    color?: THREE.Color
  ) {
    const drawableComm = this.vrApplicationRenderer.drawableClassCommunications.get(application.dataModel.instanceId);
    if (drawableComm) {
      application.setHighlightingColor(color || this.configuration.applicationColors.highlightedEntity);
      Highlighting.highlight(mesh, application, drawableComm);
    }
  }

  private getEntityType(mesh: HighlightableMesh): string {
    return mesh.constructor.name;
  }

  private getEntityId(mesh: HighlightableMesh): string {
    if (mesh instanceof ClazzCommunicationMesh) {
      // This is necessary, since drawable class communications are created on
      // client side, thus their ids do not match, since they are uuids.
      const classIds = [mesh.dataModel.sourceClass.id, mesh.dataModel.targetClass.id];
      return classIds.sort().join('###');
    }

    return mesh.dataModel.id;
  }

  private *findMeshesByTypeAndId(
    application: ApplicationObject3D,
    entityType: string,
    entityID: string
  ): Generator<HighlightableMesh> {
    if (entityType === 'ComponentMesh' || entityType === 'ClazzMesh') {
      const mesh = application.getBoxMeshbyModelId(entityID);
      if (mesh instanceof ComponentMesh || mesh instanceof ClazzMesh) {
        yield mesh;
      }
    }

    if (entityType === 'ClazzCommunicationMesh') {
      const classIds = new Set(entityID.split('###'));
      for (let mesh of application.getCommMeshes()) {
        if (classIds.has(mesh.dataModel.sourceClass.id)
          && classIds.has(mesh.dataModel.targetClass.id)) {
          yield mesh;
        }
      }
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'vr-highlighting': VrHighlightingService;
  }
}
