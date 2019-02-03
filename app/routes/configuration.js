import BaseRoute from 'explorviz-frontend/routes/base-route';
import AuthenticatedRouteMixin from 
  'ember-simple-auth/mixins/authenticated-route-mixin';

import {inject as service} from '@ember/service';
import { computed } from '@ember/object';

/**
* TODO
* 
* @class Configuration-Route
* @extends Ember.Route
*/
export default BaseRoute.extend(AuthenticatedRouteMixin, {
  session: service(),

  currentUser: computed(function() {
    return this.get('session.session.content.authenticated.user');
  }),

  actions: {
    didTransition() {
      this.controller.hideTimeline();
    }
  }

});
