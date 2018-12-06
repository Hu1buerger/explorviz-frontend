import Draw3DNodeEntity from './draw3dnodeentity';
import DS from 'ember-data';
import { computed } from '@ember/object';

const { attr, belongsTo, hasMany } = DS;

/**
* Ember model for a Component, e.g. a Java package.
*
* @class Component-Model
* @extends Draw3DNodeEntity-Model
*
* @module explorviz
* @submodule model.meta
*/
export default Draw3DNodeEntity.extend({

  name: attr('string'),
  fullQualifiedName: attr('string'),

  synthetic: attr('boolean', {defaultValue: false}),
  foundation: attr('boolean', {defaultValue: false}),

  children: hasMany('component', {
    inverse: 'parentComponent'
  }),

  clazzes: hasMany('clazz', {
    inverse: 'parent'
  }),

  parentComponent: belongsTo('component', {
    inverse: 'children'
  }),

  // why is this overriden here?
  //opened: false,

  // breaks Ember, maybe because of circle ?

  /*belongingApplication: belongsTo('application', {
    inverse: 'components'
  }),*/

  setOpenedStatus(status) {

    this.get('children').forEach((child) => {
      child.set('highlighted', false);
      child.setOpenedStatus(false);
    });

    this.set('opened', status);
  },

  unhighlight() {
    this.set('highlighted', false);
    this.set('state', "NORMAL");

    this.get('children').forEach((child) => {
      child.unhighlight();
    });

    this.get('clazzes').forEach((clazz) => {
      clazz.unhighlight();
    });
  },

  contains(possibleElem) {

    let found = false;

    this.get('clazzes').forEach((clazz) => {
      if(clazz === possibleElem) {
        found = true;
      }
    });

    if(!found) {
      this.get('children').forEach((child) => {
        if(child === possibleElem) {
          found = true;
        } else {
          const tempResult = child.contains(possibleElem);
          if(tempResult) {
            found = true;
          }
        }
      });
    }

    return found;

  },

  openParents: function() {
    let parentModel = this.belongsTo('parentComponent').value();

    if(parentModel !== null) {
      parentModel.set('opened', true);
      parentModel.openParents();
    }
  },

  getAllComponents() {
    let components = [];

    this.get('children').forEach((child) => {      
      components.push(child);
      components = components.concat(child.getAllComponents());
    });

    return components;
  },

  getAllClazzes() {
    let clazzes = [];

    this.get('clazzes').forEach((clazz) => {
      clazzes.push(clazz);
    });

    this.get('children').forEach((child) => {      
      clazzes = clazzes.concat(child.getAllClazzes());
    });

    return clazzes;
  },

  // adds all clazzes of the component or underlying components to a Set
  getContainedClazzes(containedClazzes){
    const clazzes = this.get('clazzes');

    clazzes.forEach((clazz) => {
      containedClazzes.add(clazz);
    });

    const children = this.get('children');

    children.forEach((child) => {
      child.getContainedClazzes(containedClazzes);
    });
  },

  filterClazzes(attributeString, predicateValue) {
    const filteredClazzes = [];

    const allClazzes = new Set();
    this.getContainedClazzes(allClazzes);

    allClazzes.forEach((clazz) => {
      if(clazz.get(attributeString) === predicateValue) {
        filteredClazzes.push(clazz);
      }
    });

    return filteredClazzes;
  },

  filterChildComponents(attributeString, predicateValue) {
    const filteredComponents = [];

    this.get('children').forEach((component) => {
      if(component.get(attributeString) === predicateValue) {
        filteredComponents.push(component);
      }
      component.filterChildComponents(attributeString, predicateValue);
    });

    return filteredComponents;
  },

  hasOnlyOneChildComponent: computed('children', function() {
    return this.hasMany('children').ids().length < 2;
  }),

  applyDefaultOpenLayout() {
    // opens all nested components until at least two entities are on the same level

    if(this.get('opened') && !this.get('foundation')) {
      // package already open,
      // therefore users must have opened it
      // Do not change the user's state
      return;
    }

    this.set('opened', true);

    const components = this.get('children');
    const clazzes = this.get('clazzes');

    if(components.length + clazzes.length > 1) {
      // there are two entities on this level
      // therefore, here is nothing to do
      return;
    }

    if(components.objectAt(0)) {
      components.objectAt(0).applyDefaultOpenLayout();
    }
  },

  isVisible() {
    return this.get('parentComponent.opened');
  }

});
