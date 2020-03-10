import THREE from "three";
import { BoxLayout } from "explorviz-frontend/components/visualization/rendering/application-rendering";
import CommunicationLayout from "../../view-objects/layout-models/communication-layout";
import FoundationMesh from "../../view-objects/3d/application/foundation-mesh";
import Application from "explorviz-frontend/models/application";
import Component from "explorviz-frontend/models/component";
import Clazz from "explorviz-frontend/models/clazz";
import ComponentMesh from "../../view-objects/3d/application/component-mesh";
import DrawableClazzCommunication from "explorviz-frontend/models/drawableclazzcommunication";

// Communication Layouting //
export function applyCommunicationLayout(application: Application,
  boxLayoutMap: Map<string, BoxLayout>, modelIdToMesh: Map<string, THREE.Mesh>) {

  let layoutMap: Map<string, CommunicationLayout> = new Map();

  layoutEdges(application);

  const drawableClazzCommunications = application.get('drawableClazzCommunications');

  drawableClazzCommunications.forEach((clazzcommunication) => {
    if (layoutMap.has(clazzcommunication.get('id'))) {
      layoutDrawableCommunication(clazzcommunication, application);
    }
  });

  return layoutMap;

  // HELPER FUNCTIONS

  function layoutEdges(application: Application) {

    const drawableClazzCommunications = application.hasMany('drawableClazzCommunications').value();

    if(!drawableClazzCommunications)
      return;

    for(let i = 0; i < drawableClazzCommunications.length; i++) {
      const clazzCommunication: DrawableClazzCommunication = drawableClazzCommunications.objectAt(i);

      let parentComponent = clazzCommunication.get('parentComponent');

      let parentMesh;

      if(parentComponent === null) {
        // common ancestor must be the foundation
        parentMesh = modelIdToMesh.get(application.get('id'));
      } else {
        parentMesh = modelIdToMesh.get(parentComponent.get('id'));
      }

      if ((parentMesh instanceof ComponentMesh && parentMesh.opened) || parentMesh instanceof FoundationMesh) {
        layoutMap.set(clazzCommunication.get('id'), new CommunicationLayout(clazzCommunication));

        let sourceEntity: any = null;
        let targetEntity: any = null;

        let sourceClazz = clazzCommunication.belongsTo('sourceClazz').value() as Clazz|null;

        if(sourceClazz === null) {
          continue;
        }

        let sourceParent = sourceClazz.belongsTo('parent').value() as Component;
        let sourceParentMesh = modelIdToMesh.get(sourceParent.get('id'));

        // Determine where the communication should begin (clazz or component - based upon their visiblity)
        if (sourceParentMesh instanceof ComponentMesh && sourceParentMesh.opened) {
          sourceEntity = clazzCommunication.get('sourceClazz');
        } else {
          sourceEntity = findFirstParentOpenComponent(sourceParent);
        }


        let targetClazz = clazzCommunication.belongsTo('targetClazz').value() as Clazz|null;

        if(targetClazz === null) {
          continue;
        }

        let targetParent = targetClazz.belongsTo('parent').value() as Component;
        let targetParentMesh = modelIdToMesh.get(targetParent.get('id'));

        // Determine where the communication should end (clazz or component - based upon their visiblity)
        if (targetParentMesh instanceof ComponentMesh && targetParentMesh.opened) {
          targetEntity = clazzCommunication.get('targetClazz');
        } else {
          targetEntity = findFirstParentOpenComponent(targetParent);
        }

        if (sourceEntity && targetEntity) {
          let commLayout = layoutMap.get(clazzCommunication.get('id'));
          let sourceLayout = boxLayoutMap.get(sourceEntity.get('id'));
          let targetLayout = boxLayoutMap.get(targetEntity.get('id'));

          if (commLayout && sourceLayout && targetLayout) {
            commLayout.startX = sourceLayout.positionX + sourceLayout.width / 2.0;
            commLayout.startY = sourceLayout.positionY;
            commLayout.startZ = sourceLayout.positionZ + sourceLayout.depth / 2.0;

            commLayout.endX = targetLayout.positionX + targetLayout.width / 2.0;
            commLayout.endY = targetLayout.positionY + 0.05;
            commLayout.endZ = targetLayout.positionZ + targetLayout.depth / 2.0;
          }
        }
      }

      calculatePipeSizeFromQuantiles(application);
    }

    // Calculates the size of the pipes regarding the number of requests
    function calculatePipeSizeFromQuantiles(application: Application) {

      // Constant factors for rendering communication lines (pipes)
      const PIPE_SIZE_EACH_STEP = 0.15;
      const PIPE_SIZE_DEFAULT = 0.1;

      const requestsList = gatherRequestsIntoList(application);
      const categories = calculateCategories(requestsList);
      const drawableClazzCommunications = application.get('drawableClazzCommunications');

      drawableClazzCommunications.forEach((clazzCommunication) => {
        if (layoutMap.has(clazzCommunication.get('id'))) {
          // Contains a number from 0 to 3 depending on the number of requests
          const calculatedCategory = getMatchingCategory(clazzCommunication.get('requests'), categories);

          let communicationData = layoutMap.get(clazzCommunication.get('id'));
          if (communicationData) {
            communicationData.lineThickness = (calculatedCategory * PIPE_SIZE_EACH_STEP) + PIPE_SIZE_DEFAULT;
          }
        }
      });

      // Generates four default categories for rendering (thickness of communication lines)
      function calculateCategories(requestsList: number[]) {
        const MIN = Math.min(...requestsList);
        const AVERAGE = requestsList.reduce((a, b) => a + b) / requestsList.length;
        const MAX = Math.max(...requestsList);
        const categories = [0, MIN, AVERAGE, MAX];

        return categories;
      }

      // Retrieves a matching category for a specific clazzCommunication
      function getMatchingCategory(numOfRequests: number, categories: number[]) {

        // default category = lowest category
        let calculatedCategory = 0;

        for (let i = 0; i < categories.length; i++) {
          if (numOfRequests >= categories[i]) {
            calculatedCategory = i;
          }
          else {
            break;
          }
        }

        return calculatedCategory;
      }

      // Retrieves all requests and pushes them to a list for further processing
      function gatherRequestsIntoList(application: Application) {

        let requestsList: number[] = [];
        const drawableClazzCommunications = application.get('drawableClazzCommunications');

        drawableClazzCommunications.forEach((clazzCommunication) => {
          if ((clazzCommunication.get('sourceClazz') !== clazzCommunication.get('targetClazz'))) {
            requestsList.push(clazzCommunication.get('requests'));
          }
        });

        return requestsList;
      }

    } // END calculatePipeSizeFromQuantiles

    function findFirstParentOpenComponent(entity: Component): Component|null {
      let parentComponent: Component = entity.getParentComponent();

      if(!parentComponent)
        return entity;

      let parentMesh = modelIdToMesh.get(parentComponent.get('id'));
      if (parentMesh instanceof ComponentMesh && parentMesh.opened) {
        return entity;
      } else {
        return findFirstParentOpenComponent(parentComponent);
      }
    }

  } // END layoutEdges

  function layoutDrawableCommunication(commu: DrawableClazzCommunication, foundation: Application) {

    const externalPortsExtension = new THREE.Vector3(3.0, 3.5, 3.0);

    let foundationLayout = boxLayoutMap.get(foundation.id);

    if(!foundationLayout)
      return;

    const centerCommuIcon =
      new THREE.Vector3(foundationLayout.positionX + foundationLayout.width * 2.0 +
        externalPortsExtension.x * 4.0, foundationLayout.positionY -
        foundationLayout.height + externalPortsExtension.y,
        foundationLayout.positionZ + foundationLayout.depth * 2.0 -
        externalPortsExtension.z - 12.0);

    layoutInAndOutCommunication(commu, commu.get('sourceClazz'), centerCommuIcon);
  }

  function layoutInAndOutCommunication(commu: DrawableClazzCommunication, internalClazz: Clazz, centerCommuIcon: THREE.Vector3) {
    let communicationData = layoutMap.get(commu.get('id'));
    if (!communicationData) {
      return;
    }

    communicationData.pointsFor3D = [];
    communicationData.pointsFor3D.push(centerCommuIcon);

    if (internalClazz !== null) {
      const end = new THREE.Vector3();

      let clazzBoxLayout = boxLayoutMap.get(internalClazz.get('id'));
      if(clazzBoxLayout === undefined)
        return;

      const centerPoint =
        new THREE.Vector3(clazzBoxLayout.positionX +
          clazzBoxLayout.width / 2.0,
          clazzBoxLayout.positionY + clazzBoxLayout.height / 2.0,
          clazzBoxLayout.positionZ + clazzBoxLayout.depth / 2.0);

      end.x = clazzBoxLayout.positionX + clazzBoxLayout.width / 2.0;
      end.y = centerPoint.y;
      end.z = clazzBoxLayout.positionZ + clazzBoxLayout.depth / 2.0;
      communicationData.pointsFor3D.push(end);
    }
  }

}
