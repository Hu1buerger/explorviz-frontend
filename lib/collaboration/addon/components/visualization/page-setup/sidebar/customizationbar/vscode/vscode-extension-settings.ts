import Component from '@glimmer/component';
import { action } from '@ember/object';
import ToastHandlerService from 'explorviz-frontend/services/toast-handler';
import { sendMonitoringData } from 'explorviz-frontend/ide/ide-websocket';
import { inject as service } from '@ember/service';
import IdeWebsocketFacade from 'explorviz-frontend/services/ide-websocket-facade';
import debugLogger from 'ember-debug-logger';

//const { vsCodeService } = ENV.backendAddresses;

export default class VscodeExtensionSettings extends Component {
  @service('ide-websocket-facade')
  ideWebsocketFacade!: IdeWebsocketFacade;

  @service('toast-handler')
  toastHandlerService!: ToastHandlerService;

  debug = debugLogger('VscodeExtensionSettings');

  constructor(owner: unknown, args: any) {
    super(owner, args);
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  onRoomNameCopied() {
    this.toastHandlerService.showSuccessToastMessage(
      'Room name copied to clipboard'
    );
  }

  @action
  monitoring() {
    const payload = {
      fqn: 'org.springframework.samples.petclinic.model.Person',
      description: 'Test by akr',
    };

    sendMonitoringData([payload]);
    this.toastHandlerService.showSuccessToastMessage('Show Monitoring mockup');
  }

  @action
  connectToIDE() {
    this.debug('connectToIDE');
    this.toastHandlerService.showInfoToastMessage('Connect to IDE');
    this.ideWebsocketFacade.restartConnection();
  }
}
