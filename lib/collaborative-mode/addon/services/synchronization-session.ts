import Service, { inject as service } from '@ember/service';
import LocalUser from './local-user';
import CollaborationSession from './collaboration-session';
import * as THREE from 'three';
import { DEG2RAD, RAD2DEG } from 'three/src/math/MathUtils';

export type YawPitchRoll = {
  yaw: number;
  pitch: number;
  roll: number;
};

export type ProjectorQuaternion = {
  quaternion: THREE.Quaternion;
};

export type ProjectorAngles = {
  left: number;
  right: number;
  up: number;
  down: number;
};

export type ProjectorConfigurations = {
  id: string;
  yawPitchRoll: YawPitchRoll;
  projectorAngles: ProjectorAngles;
};

export type ProjectorAngles2 = {
  angles: ProjectorAngles[];
};

export type ProjectorQuaternions = {
  quaternions: THREE.Quaternion[];
};

export default class SynchronizationSession extends Service {
  @service('local-user')
  private localUser!: LocalUser;

  @service('collaboration-session')
  private collaborationSession!: CollaborationSession;

  // The id of the connected device
  deviceId!: number;

  roomId!: string;

  projectorAngles!: ProjectorAngles;
  projectorQuaternion!: ProjectorQuaternion;

  // domeTilt for moving the projection into center of dome
  private domeTilt: number = 21;

  /** ###########################################################################
   *  ############### SYNCHRONIZATION START: SERVICE SET UP 
   *  ###########################################################################
  */
  /* Sets up important Ids: Essentially manages and starts synchronization behaviour
  1) deviceId: Detection of device to request correct (a) projector angle and (b) yaw/pitch/roll angles.
  2) roomId: Sets the room name to this and impacts which room is hosted or joined by synchronization user.
  3) userId & userName: Sets user identification to choose the correct instance which gets synchronized or will be synchronized to the main.
  */
  setUpIds(dId: number, rId: string) {
    this.deviceId = dId;
    this.roomId = rId;
    this.localUser.userId = dId === 0 ? 'Main' : 'Projector ' + dId;
    this.localUser.userName = dId === 0 ? 'Main' : 'Projector ' + dId;
  }

  setProjectorConfigurations(projectorConfiguration: ProjectorConfigurations) {
    this.setProjectorYawPitchRoll(projectorConfiguration.yawPitchRoll);
    this.setProjectorAngle(projectorConfiguration.projectorAngles);
  }



  /** ###########################################################################
   *  ############### DURING SYNCHRONIZATION: PROJECTION MANIPULATION
   *  ###########################################################################
  */
  // Considers dome tilt and shifts the projection to the dome center
  getDomeTiltQuaternion() {
    // 360° whole globe, 180° half globe after horizontal cut, 90° half of half globe with vertical cut.
    // Horizontal cut, then vertical cut of half globe = angle from border to dometop center
    const shiftedAngle = ((360 / 2) / 2) - this.domeTilt;

    // after setting up rotation axes via synchronisation, 
    // we can use positive pitch to shift synchronized projection to the center of the globe.
    const domeTiltQuaternion = new THREE.Quaternion(0, 0, 0, 0).setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      shiftedAngle * THREE.MathUtils.DEG2RAD
    );

    return domeTiltQuaternion;
  }

  // Sets the projector angles of the device: Detection of device via payload at start of synchronization
  // Could implement a test case for this, but need to save the mpcdi informations for that in frontend?!
  setProjectorAngle(projectorAngles: any) {
    this.projectorAngles = {
      left: projectorAngles.left,
      right: projectorAngles.right,
      up: projectorAngles.up,
      down: projectorAngles.down,
    };
  }

  // Sets projector yaw, pitch and roll angles of the device.
  // Device detection same as projector angle
  setProjectorYawPitchRoll(yawPitchRoll: YawPitchRoll) {
    this.projectorQuaternion = {
      quaternion: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          -yawPitchRoll.pitch * DEG2RAD, // NEGATIVE Pitch
          yawPitchRoll.yaw * DEG2RAD, // Yaw
          yawPitchRoll.roll * DEG2RAD, // Roll
          'ZXY'
        )
      ),
    };
  }

  /**
   * CALCULATE FOV AND ASPECT CONSIDERING PROJECTOR ANGLES
   */
  setUpCamera() {
          // Set up fov and aspect
          this.localUser.camera.projectionMatrix.copy(
            new THREE.Matrix4().makePerspective(
              -Math.tan(
                this.projectorAngles.left * DEG2RAD
              ) 
            * this.localUser.camera.near
              ,
              Math.tan(
                this.projectorAngles.right * DEG2RAD
              ) 
              * this.localUser.camera.near
              ,
              Math.tan(
                (this.projectorAngles.down) * DEG2RAD 
              ) 
              * this.localUser.camera.near
              ,
              -Math.tan(
                (this.projectorAngles.up) * DEG2RAD 
              ) 
              * this.localUser.camera.near
              ,
              this.localUser.camera.near,
              this.localUser.camera.far
            )
          );
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'synchronization-session': SynchronizationSession;
  }
}
