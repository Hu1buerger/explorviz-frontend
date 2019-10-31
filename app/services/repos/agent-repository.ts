import Service from '@ember/service';
import Evented from '@ember/object/evented';
import Agent from 'explorviz-frontend/models/agent';

/**
* TODO
* 
* @class Landscape-Repository-Service
* @extends Ember.Service
*/
export default class AgentRepository extends Service.extend(Evented) {

  agentList:Agent[] = [];

}

declare module "@ember/service" {
  interface Registry {
    "repos/agent-repository": AgentRepository;
  }
}