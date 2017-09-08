import DS from 'ember-data';
import BaseEntity from './baseentity';

const { attr, hasMany } = DS;


/**
* Ember model for a landscape.
* 
* @class Landscape-Model
* @extends BaseEntity-Model
*
* @module explorviz
* @submodule model.meta
*/
export default BaseEntity.extend({
  hash: attr('number'),
  timestamp: attr('number'),
  activities: attr('number'),
  systems: hasMany('system', {
    inverse: 'parent'
  }),
  applicationCommunication: hasMany('communication', {
    inverse: 'parent'
  })
});
