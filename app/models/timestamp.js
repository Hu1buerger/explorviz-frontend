import DS from 'ember-data';

const {Model, attr} = DS;

/**
* Ember model for a Timestamp.
* 
* @class Timestamp-Model
* @extends DS.Model
*
* @module explorviz
* @submodule model.timeshift
*/
export default Model.extend({
  timestamp: attr('number'),
  calls: attr('number')
});
