import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['viz'],

  scene : null,
  webglrenderer: null,
  camera: null,

  canvas: null,

  entity: null,

  font: null,

  animationFrameId: null,

  // @Override
  didRender(){
    this._super(...arguments);

    this.initRendering();
  },


  // @Override
  didDestroyElement() {
    this._super(...arguments);
    this.cleanup();    
  },

  /**
   * This function is called once on the didRender event. Inherit this function 
   * to call other important function, e.g. initInteraction as shown in 
   * {@landscape-rendering}.
   *
   * @class Rendering-Core
   */
  initRendering() {

    const self = this;

    // get size if outer ember div
    const height = this.$()[0].clientHeight;
    const width = this.$()[0].clientWidth;
    
    const canvas = this.$('#threeCanvas')[0];

    this.set('canvas', canvas);

    this.set('scene', new THREE.Scene());
    this.set('scene.background', new THREE.Color(0xffffff));

    this.set('camera', new THREE.PerspectiveCamera(70, width / height, 0.1, 200));
    this.get('camera').position.set(13, -2, 10);

    this.set('webglrenderer', new THREE.WebGLRenderer({
      antialias: true,  
      canvas: canvas
    }));
    this.get('webglrenderer').setSize(width, height);

    // Rendering loop //

    function render() {
      const animationId = requestAnimationFrame(render);
      self.set('animationFrameId', animationId);
      self.get('webglrenderer').render(self.get('scene'), self.get('camera'));
    }

    render();

    ////////////////////

    // load font for labels and proceed with populating the scene
    new THREE.FontLoader().load('three.js/fonts/helvetiker_regular.typeface.json', (font) => {

      self.set('font', font);
      self.populateScene(this.get('renderingModel'));

    });    

  },


  /**
   * This function is called once on initRendering. Inherit this function to 
   * insert objects in the Three.js scene. Have a look 
   * at {@landscape-rendering} for an example.
   *
   * @class Rendering-Core
   * @param  {[baseentity]}
   */
  populateScene(renderingModel) {
    this.set('entity', renderingModel);
  },

  /**
   * This function is called when the destroy event is fired. Inherit this 
   * function to cleanup custom properties or unbind listener 
   * as shown in {@landscape-rendering}.
   *
   * @class Rendering-Core
   */
  cleanup() {
    cancelAnimationFrame(this.get('animationFrameId'));

    this.set('scene', null);
    this.set('webglrenderer', null);
    this.set('camera', null);
  },

  /**
   * Inherit this function to update the scene with a new renderingModel. It 
   * automatically removes every mesh from the scene. Add your custom code 
   * as shown in landscape-rendering.
   *
   * @class Rendering-Core
   */
  cleanAndUpdateScene(renderingModel) {
    this.set('entity', renderingModel);
    const scene = this.get('scene');

    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }
  }

});