import { inject as service } from '@ember/service';
import GlimmerComponent from "@glimmer/component";
import { action } from "@ember/object";
import debugLogger from "ember-debug-logger";
import THREEPerformance from 'explorviz-frontend/utils/threejs-performance';
import $ from 'jquery';
import THREE from 'three';
import Landscape from 'explorviz-frontend/models/landscape';
import RenderingService from "explorviz-frontend/services/rendering-service";
import LandscapeRepository from 'explorviz-frontend/services/repos/landscape-repository';
import Configuration from 'explorviz-frontend/services/configuration';
import ReloadHandler from 'explorviz-frontend/services/reload-handler';
import CurrentUser from 'explorviz-frontend/services/current-user';

import applyKlayLayout from
  'explorviz-frontend/utils/landscape-rendering/klay-layouter';
import Interaction, { Position2D } from
  'explorviz-frontend/utils/application-rendering/interaction';
import Labeler from
  'explorviz-frontend/utils/landscape-rendering/labeler';
import * as CalcCenterAndZoom from
  'explorviz-frontend/utils/landscape-rendering/center-and-zoom-calculator';
import * as EntityRendering from
  'explorviz-frontend/utils/landscape-rendering/entity-rendering'
import * as CommunicationRendering from
  'explorviz-frontend/utils/landscape-rendering/communication-rendering'
import ImageLoader from 'explorviz-frontend/utils/three-image-loader';
import Application from 'explorviz-frontend/models/application';
import AlertifyHandler from 'explorviz-frontend/utils/alertify-handler';
import NodeGroup from 'explorviz-frontend/models/nodegroup';
import System from 'explorviz-frontend/models/system';
import HoverEffectHandler from 'explorviz-frontend/utils/hover-effect-handler';


interface Args {
  id: string,
  landscape: Landscape
}

/**
* Renderer for landscape visualization.
*
* @class Landscape-Rendering-Component
* @extends GlimmerComponent
*
* @module explorviz
* @submodule visualization.rendering
*/
export default class LandscapeRendering extends GlimmerComponent<Args> {

  @service('repos/landscape-repository')
  landscapeRepo!: LandscapeRepository;

  @service('configuration')
  configuration!: Configuration;

  @service('reload-handler')
  reloadHandler!: ReloadHandler;

  @service('rendering-service')
  renderingService!: RenderingService;

  @service('current-user')
  currentUser!: CurrentUser;

  scene!: THREE.Scene;
  webglrenderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;

  canvas!: HTMLCanvasElement;

  debug = debugLogger('LandscapeRendering');

  font!: THREE.Font;
  animationFrameId = 0;

  initDone: Boolean;

  threePerformance!: any;

  interaction!: Interaction;

  labeler!: any;
  imageLoader!: any;

  meshIdToModel: Map<number, any> = new Map();

  hoverHandler: HoverEffectHandler = new HoverEffectHandler();
/*   popUpHandler: PopupHandler = new PopupHandler(); */

  constructor(owner: any, args: Args) {
    super(owner, args);
    this.initDone = false;
    this.debug("Constructor called");
  }


  @action
  outerDivInserted(outerDiv: HTMLElement) {
    this.debug("Outer Div inserted");
    this.canvas.height = outerDiv.clientHeight;
    this.canvas.width = outerDiv.clientWidth;
    this.canvas.style.width = "";
    this.canvas.style.height = "";
    this.initRendering();
  }


  @action
  canvasInserted(canvas: HTMLCanvasElement) {
    this.debug("Canvas inserted");

    this.canvas = canvas;

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };
  }


  // @Override
  /**
   * This overridden Ember Component lifecycle hook enables calling
   * ExplorViz's custom cleanup code.
   *
   * @method willDestroyElement
   */
  willDestroy() {
    cancelAnimationFrame(this.animationFrameId);

    // Clean up WebGL rendering context by forcing context loss
    let gl = this.canvas.getContext('webgl');
    if (!gl) {
      return;
    }
    let glExtension = gl.getExtension('WEBGL_lose_context');
    if (!glExtension) return;
    glExtension.loseContext();

    if (this.threePerformance) {
      this.threePerformance.removePerformanceMeasurement();
    }

    this.debug("cleanup landscape rendering");

    this.imageLoader.logos = {};

    this.interaction.removeHandlers();
  }


  /**
   * This function is called once on the didRender event. Inherit this function
   * to call other important function, e.g. "initInteraction" as shown in
   * {{#crossLink "Landscape-Rendering/initInteraction:method"}}{{/crossLink}}.
   *
   * @method initRenderings
   */
  initRendering() {
    let self = this;

    // Get size if outer ember div
    let height = $('#rendering').innerHeight();
    let width = $('#rendering').innerWidth();

    if (!height || !width) {
      return;
    }

    this.scene = new THREE.Scene();
    let backgroundColor = this.configuration.landscapeColors.background;
    this.scene.background = new THREE.Color(backgroundColor);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    this.webglrenderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.canvas
    });

    this.webglrenderer.setPixelRatio(window.devicePixelRatio);
    this.webglrenderer.setSize(width, height);

    let showFpsCounter = this.currentUser.getPreferenceOrDefaultValue('flagsetting', 'showFpsCounter');

    if (showFpsCounter) {
      this.threePerformance = new THREEPerformance();
    }

    this.debug("init landscape-rendering");

    this.imageLoader = new ImageLoader();

    if (!this.labeler) {
      this.labeler = Labeler.create();
    }

    this.initInteraction();

    let dirLight = new THREE.DirectionalLight();
    dirLight.position.set(30, 10, 20);
    this.scene.add(dirLight);

    // Rendering loop //
    function render() {
      if (self.isDestroyed) {
        return;
      }

      let animationId = requestAnimationFrame(render);
      self.animationFrameId = animationId;

      if (showFpsCounter) {
        self.threePerformance.threexStats.update(self.webglrenderer);
        self.threePerformance.stats.begin();
      }

      self.webglrenderer.render(self.scene, self.camera);

      if (showFpsCounter) {
        self.threePerformance.stats.end();
      }
    }

    render();

    ////////////////////

    // Load font for labels and synchronously proceed with populating the scene
    new THREE.FontLoader().load(
      // Resource URL
      '/three.js/fonts/roboto_mono_bold_typeface.json',

      // onLoad callback
      function (font) {

        if (self.isDestroyed)
          return;

        self.font = font;
        self.debug("(THREE.js) font sucessfully loaded.");
        self.initDone = true;
        self.populateScene();
      }
    );

  }


  @action
  updateCanvasSize() {
    let outerDiv = $('#vizspace')[0];

    if (outerDiv) {
      if (!this.camera || !this.webglrenderer)
        return;

      $('#threeCanvas').hide();

      let renderingHeight = $('#rendering').innerHeight();
      let renderingWidth = $('#rendering').innerWidth();

      if (renderingHeight && renderingWidth) {
        let height = Math.round(renderingHeight);
        let width = Math.round(renderingWidth);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.webglrenderer.setSize(width, height);

        this.onResized();

        $('#threeCanvas').show();
      }
    }
  }


  /**
   * Inherit this function to update the scene with a new renderingModel. It
   * automatically removes every mesh from the scene and finally calls
   * the (overridden) "populateScene" function. Add your custom code
   * as shown in landscape-rendering.
   *
   * @method cleanAndUpdateScene
   */
  @action
  cleanAndUpdateScene() {
    let scene = this.scene;

    removeAllChildren(scene);

    function removeAllChildren(entity: THREE.Object3D | THREE.Mesh) {
      for (let i = entity.children.length - 1; i >= 0; i--) {
        let child = entity.children[i];

        removeAllChildren(child);

        if (!(child instanceof THREE.Light)) {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            } else {
              for (let material of child.material)
                material.dispose();
            }
          }
          entity.remove(child);
        }
      }
    }
    this.populateScene();

    this.debug("clean and populate landscape-rendering");
  }


  // Listener-Callbacks. Override in extending components
  @action
  onReSetupScene() {
    this.camera.position.set(0, 0, 0);
    this.cleanAndUpdateScene();
  }

  @action
  onUpdated() {
    if (this.initDone) {
      this.cleanAndUpdateScene();
    }
  }

  onResized() {
    this.cleanAndUpdateScene();
  }


  // @Override
  /**
   * TODO
   *
   * @method populateScene
   */
  populateScene() {
    this.debug("populate landscape-rendering");

    let emberLandscape = this.args.landscape;

    if (!emberLandscape || !this.font) {
      return;
    }

    applyKlayLayout(emberLandscape);

    let centerPoint = CalcCenterAndZoom.
      getCenterAndZoom(emberLandscape, this.camera, this.webglrenderer);
    let systems = emberLandscape.systems;

    if (systems) {
      // Draw boxes for systems
      systems.forEach((system) => {

        let systemMesh = EntityRendering.renderSystem(system, centerPoint,
          this.configuration, this.labeler, this.font);
        this.scene.add(systemMesh);
        this.meshIdToModel.set(systemMesh.id, system);

        let nodegroups = system.nodegroups;

        // Draw boxes for nodegroups
        nodegroups.forEach((nodegroup) => {

          if (!nodegroup.get('visible')) {
            return;
          }

          let nodegroupMesh = EntityRendering.renderNodeGroup(nodegroup, centerPoint,
            this.configuration, this.labeler, this.font);
          if (nodegroupMesh) {
            this.scene.add(nodegroupMesh);
            this.meshIdToModel.set(nodegroupMesh.id, system);
          }

          let nodes = nodegroup.get('nodes');

          // Draw boxes for nodes
          nodes.forEach((node) => {

            if (!node.get('visible')) {
              return;
            }

            let nodeMesh = EntityRendering.renderNode(node, centerPoint,
              this.configuration, this.labeler, this.font);
            this.scene.add(nodeMesh);
            this.meshIdToModel.set(nodeMesh.id, node);

            let applications = node.get('applications');

            // Draw boxes for applications
            applications.forEach((application) => {

              let applicationMesh = EntityRendering.renderApplication(application, centerPoint,
                this.imageLoader, this.configuration, this.labeler, this.font);
              this.scene.add(applicationMesh);
              this.meshIdToModel.set(applicationMesh.id, application);
            });

          });

        });

      });
    }

    let appCommunications = emberLandscape.get('totalApplicationCommunications');

    if (appCommunications) {
      let color = this.configuration.landscapeColors.communication;
      let tiles = CommunicationRendering.computeCommunicationTiles(appCommunications, color);

      CommunicationRendering.addCommunicationLineDrawing(tiles, this.scene, centerPoint);
    }

    this.debug("Landscape loaded");
  }


  @action
  showApplication(emberModel: Application) {
    this.landscapeRepo.set('latestApplication', emberModel);
    this.landscapeRepo.set('replayApplication', emberModel);
  }

  @action
  handleDoubleClick(mesh?: THREE.Mesh) {
    if(mesh) {
      // hide tooltip
      // this.get('popUpHandler').hideTooltip();

      let emberModel = this.meshIdToModel.get(mesh.id);

      if(emberModel instanceof Application){
        if(emberModel.get('components').get('length') === 0) {
          // no data => show message
          const message = "Sorry, there is no information for application <b>" + emberModel.get('name') +
            "</b> available.";

          AlertifyHandler.showAlertifyMessage(message);
        } else {
          // data available => open application-rendering
          AlertifyHandler.closeAlertifyMessages();
          this.showApplication(emberModel);
        }
      } else if (emberModel instanceof NodeGroup){
        emberModel.setOpened(!emberModel.get('opened'));
        this.cleanAndUpdateScene();
      } else if(emberModel instanceof System) {
        emberModel.setOpened(!emberModel.get('opened'));
        this.cleanAndUpdateScene();
      }
    }
  }

  @action
  handlePanning(delta: {x:number,y:number}, button: 1|2|3) {
    if(button === 1) {
      const distanceXInPercent = (delta.x / this.canvas.clientWidth) * 100.0;
      const distanceYInPercent = (delta.y / this.canvas.clientHeight) * 100.0;

      const xVal = this.camera.position.x + distanceXInPercent * 6.0 * 0.015 * -(Math.abs(this.camera.position.z) / 4.0);
      const yVal = this.camera.position.y + distanceYInPercent * 4.0 * 0.01 * (Math.abs(this.camera.position.z) / 4.0);
      this.camera.position.x = xVal;
      this.camera.position.y = yVal;
    }
  }

  @action
  handleMouseWheel(delta: number) {
    // Hide (old) tooltip
/*     this.popUpHandler.hideTooltip(); */

    const scrollVector = new THREE.Vector3(0, 0, delta * 1.5);

    let landscapeVisible = this.camera.position.z + scrollVector.z > 0.2; 
    // apply zoom, prevent to zoom behind 2D-Landscape (z-direction)
    if (landscapeVisible){
      this.camera.position.addVectors(this.camera.position, scrollVector);
    }
  }

  @action
  handleMouseMove(_mesh?: any) {
/*     this.hoverHandler.handleHoverEffect(mesh); */
  }

  @action
  handleMouseOut() {
/*     this.popUpHandler.hideTooltip(); */
  }

  @action
  handleMouseEnter() {
  }

  @action
  handleMouseStop(_mesh: THREE.Mesh|undefined, _mouseOnCanvas: Position2D) {
/*     this.popUpHandler.showTooltip(
      mouseOnCanvas,
      mesh
    ); */
  }

  initInteraction() {
    this.interaction = new Interaction(this.canvas, this.camera, this.webglrenderer, this.scene, {
      doubleClick: this.handleDoubleClick,
      mouseMove: this.handleMouseMove,
      mouseWheel: this.handleMouseWheel,
      mouseOut: this.handleMouseOut,
      mouseEnter: this.handleMouseEnter,
      mouseStop: this.handleMouseStop,
      panning: this.handlePanning
    });
  }

}