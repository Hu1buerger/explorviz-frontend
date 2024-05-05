import Service, { inject as service } from '@ember/service';
import Auth from './auth';
import ToastHandlerService from './toast-handler';
import ENV from 'explorviz-frontend/config/environment';
// import { action } from '@ember/object';

export type User = {
  uId: string;
  name: string;
  token: [
    { name: string; apiToken: string; createdAt: number; expires: number },
  ];
};

export type ApiToken = {
  name: string;
  apiToken: string;
  createdAt: number;
  expires: number;
};

export default class UserApiTokenService extends Service {
  @service('auth')
  private auth!: Auth;

  @service('toast-handler')
  toastHandler!: ToastHandlerService;

  /**
   * TODO: actual DB call
   * @returns
   */
  retrieveApiTokens(): ApiToken[] {
    if (ENV.auth0.enabled === 'false') {
      // make api call to DB, but not authorished, give a standard uId to Johnny?
      return [
        {
          name: 'GitLab Api Token',
          apiToken: 'apiToken123',
          createdAt: 1714940718,
          expires: 1770323118,
        },
        {
          name: 'GitHub Api Token',
          apiToken: 'apiToken1234',
          createdAt: 19071647189,
          expires: 1938787198,
        },
      ];
    } else {
      // make api call to DB but authorized
      return [
        {
          name: 'GitLab Api Token',
          apiToken: 'apiToken123',
          createdAt: 1234,
          expires: 123456,
        },
      ];
    }
  }
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:user-api-token')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('user-api-token') declare altName: UserApiTokenService;`.
declare module '@ember/service' {
  interface Registry {
    'user-api-token': UserApiTokenService;
  }
}
