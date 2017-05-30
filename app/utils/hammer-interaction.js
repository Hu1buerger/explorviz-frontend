import Ember from 'ember';
import Hammer from "npm:hammerjs";

export default Ember.Object.extend(Ember.Evented, {

  hammerManager: null,

  setupHammer(canvas) {

    const self = this;

    let mouseDeltaX, mouseDeltaY = 0;

    registerRightClickWithPan();

    const hammer = new Hammer.Manager(canvas, {});
    this.set('hammerManager', hammer);

    const singleTap = new Hammer.Tap({
      event: 'singletap',
      interval: 250
    });

    const doubleTap = new Hammer.Tap({
      event: 'doubletap',
      taps: 2,
      interval: 250
    });

    const pan = new Hammer.Pan({
      event: 'pan'
    });

    hammer.add([doubleTap, singleTap, pan]);

    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure(doubleTap);


    hammer.on('doubletap', (evt) => {
      if(evt.button !== 1) {
        return;
      }

      var mouse = {};

      mouse.x = evt.srcEvent.clientX;
      mouse.y = evt.srcEvent.clientY;

      self.trigger('doubleClick', mouse);
    });


    hammer.on('panstart', (evt) => {
      if(evt.button !== 1 && evt.button !== 3) {
        return;
      }

      const event = evt.srcEvent;

      mouseDeltaX = event.clientX;
      mouseDeltaY = event.clientY;
    });


    hammer.on('panmove', (evt) => {
      if(evt.button !== 1 && evt.button !== 3) {
        return;
      }

      const delta = {};

      delta.x = evt.srcEvent.clientX - mouseDeltaX;
      delta.y = evt.srcEvent.clientY - mouseDeltaY;

      mouseDeltaX = evt.srcEvent.clientX;
      mouseDeltaY = evt.srcEvent.clientY;

      self.trigger('panning', delta, evt);
    });


    hammer.on('singletap', function(evt){
      if(evt.button !== 1) {
        return;
      }

      var mouse = {};

      mouse.x = evt.srcEvent.clientX;
      mouse.y = evt.srcEvent.clientY;

      self.trigger('singleClick', mouse);      
    });


    // Fire Panning-Event with right click as well
    
    function registerRightClickWithPan() {

      const POINTER_INPUT_MAP = {
        pointerdown: Hammer.INPUT_START,
        pointermove: Hammer.INPUT_MOVE,
        pointerup: Hammer.INPUT_END,
        pointercancel: Hammer.INPUT_CANCEL,
        pointerout: Hammer.INPUT_CANCEL
      };

      Hammer.inherit(Hammer.PointerEventInput, Hammer.Input, {

        handler: function PEhandler(ev) {

          var store = this.store;
          var removePointer = false;

          var eventTypeNormalized = ev.type.toLowerCase();
          var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
          var pointerType = ev.pointerType;

          //modified to handle all buttons
          //left=0, middle=1, right=2
          if (eventType & Hammer.INPUT_START) {
              //firefox sends button 0 for mousemove, so store it here
              this.button = ev.button;
          }

          var isTouch = (pointerType === Hammer.INPUT_TYPE_TOUCH);

          function isCorrectPointerId(element) {
            return element.pointerId === ev.pointerId;
          }

          // get index of the event in the store
          var storeIndex = store.findIndex(isCorrectPointerId);

          // start and mouse must be down
          if (eventType & Hammer.INPUT_START && (ev.button === 0 || ev.button === 1 || ev.button === 2 || isTouch)) {
              if (storeIndex < 0) {
                  store.push(ev);
                  storeIndex = store.length - 1;
              }
          } else if (eventType & (Hammer.INPUT_END | Hammer.INPUT_CANCEL)) {
              removePointer = true;
          }

          // it not found, so the pointer hasn't been down (so it's probably a hover)
          if (storeIndex < 0) {
              return;
          }

          // update the event in the store
          store[storeIndex] = ev;

          this.callback(this.manager, eventType, {
              button: this.button +1,
              pointers: store,
              changedPointers: [ev],
              pointerType: pointerType,
              srcEvent: ev
          });

          if (removePointer) {
              // remove from the store
              store.splice(storeIndex, 1);
          }
        }
      });

    }
  }

});