import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import RoomSerializer from 'collaboration/services/room-serializer';
import { LandscapeData } from 'explorviz-frontend/controllers/visualization';
import PopupData from 'explorviz-frontend/components/visualization/rendering/popups/popup-data';
import Auth from 'explorviz-frontend/services/auth';
import SnapshotTokenService, {
  SnapshotToken,
} from 'explorviz-frontend/services/snapshot-token';
import ToastHandlerService from 'explorviz-frontend/services/toast-handler';
import { LandscapeToken } from 'explorviz-frontend/services/landscape-token';
import LocalUser from 'collaboration/services/local-user';
import TimestampRepository from 'explorviz-frontend/services/repos/timestamp-repository';

interface Args {
  landscapeData: LandscapeData;
  // unnötig da in serializedRoom
  popUpData: PopupData[];
  // unnötig da in serializedRoom
  landscapeToken: LandscapeToken;
}

export default class VisualizationPageSetupSidebarCustomizationbarSnapshotSnapshotComponent extends Component<Args> {
  @service('auth')
  auth!: Auth;

  @service('room-serializer')
  roomSerializer!: RoomSerializer;

  @service('snapshot-token')
  snapshotService!: SnapshotTokenService;

  @service('toast-handler')
  toastHandler!: ToastHandlerService;

  @service('local-user')
  localUser!: LocalUser;

  @service('repos/timestamp-repository')
  timestampRepo!: TimestampRepository;

  @tracked
  saveSnaphotBtnDisabled: boolean = true;

  @tracked
  snapshotName: string = '';

  @action
  canSaveSnapShot() {
    if (this.snapshotName !== '') {
      this.saveSnaphotBtnDisabled = false;
    } else {
      this.saveSnaphotBtnDisabled = true;
    }
  }

  @action
  updateName(event: InputEvent) {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.snapshotName = target.value;
    this.canSaveSnapShot();
  }

  @action
  async saveSnapshot() {
    const createdAt: number = new Date().getTime();
    const saveRoom = this.roomSerializer.serializeRoom(
      this.args.popUpData,
      true
    );

    const timestamps = this.timestampRepo.getTimestamps(
      this.args.landscapeToken.value
    );

    const content: SnapshotToken = {
      owner: this.auth.user!.sub,
      createdAt: createdAt,
      name: this.snapshotName,
      landscapeToken: this.args.landscapeToken,
      structureData: {
        structureLandscapeData: this.args.landscapeData.structureLandscapeData,
        dynamicLandscapeData: this.args.landscapeData.dynamicLandscapeData,
      },
      serializedRoom: saveRoom,
      camera: {},
      annotations: {},
      isShared: false,
      deleteAt: 0,
      julius: { timestamps: timestamps },
    };

    this.snapshotService.saveSnapshot(content);
    this.reset();
  }

  @action
  exportSnapshot() {
    const createdAt: number = new Date().getTime();
    const saveRoom = this.roomSerializer.serializeRoom(
      this.args.popUpData,
      true
    );

    const timestamps = this.timestampRepo.getTimestamps(
      this.args.landscapeToken.value
    );

    const content: SnapshotToken = {
      owner: this.auth.user!.sub,
      createdAt: createdAt,
      name: this.snapshotName,
      landscapeToken: this.args.landscapeToken,
      structureData: {
        structureLandscapeData: this.args.landscapeData.structureLandscapeData,
        dynamicLandscapeData: this.args.landscapeData.dynamicLandscapeData,
      },
      serializedRoom: saveRoom,
      camera: {},
      annotations: {},
      isShared: false,
      deleteAt: 0,
      julius: { timestamps: timestamps },
    };
    this.snapshotService.exportFile(content);
    this.reset();
  }

  reset() {
    this.snapshotName = '';
    this.saveSnaphotBtnDisabled = true;
  }
}
