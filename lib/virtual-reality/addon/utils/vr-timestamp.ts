import debugLogger from "ember-debug-logger";
import Auth from "explorviz-frontend/services/auth";
import LandscapeTokenService from "explorviz-frontend/services/landscape-token";
import ReloadHandler from "explorviz-frontend/services/reload-handler";
import LocalVrUser from "virtual-reality/services/local-vr-user";
import VrMessageSender from "virtual-reality/services/vr-message-sender";
import DetachedMenuGroupContainer from "./vr-menus/detached-menu-group-container";
import VrApplicationRenderer from "./vr-rendering/vr-application-renderer";
import VrLandscapeRenderer from "./vr-rendering/vr-landscape-renderer";

type VrtTimestampServiceArgs = {
    timestamp: number, 
    timestampInterval: number, 
    localUser: LocalVrUser, 
    auth: Auth,
    sender: VrMessageSender, 
    reloadHandler: ReloadHandler,
    landscapeTokenService: LandscapeTokenService,
    vrLandscapeRenderer: VrLandscapeRenderer,
    vrApplicationRenderer: VrApplicationRenderer,
    detachedMenuGroups: DetachedMenuGroupContainer
};

export default class VrTimestampService {

    private debug = debugLogger('VrTimestampService');

    private localUser: LocalVrUser;
    private sender: VrMessageSender;
    private auth: Auth;
    private reloadHandler: ReloadHandler;
    private landscapeTokenService: LandscapeTokenService;
    private vrLandscapeRenderer: VrLandscapeRenderer;
    private vrApplicationRenderer: VrApplicationRenderer;
    private detachedMenuGroups: DetachedMenuGroupContainer;
    
    timestamp: number;
    timestampInterval: number;

    constructor({
        timestamp, 
        timestampInterval, 
        localUser, 
        sender, 
        auth,
        reloadHandler, 
        landscapeTokenService, 
        vrLandscapeRenderer, 
        vrApplicationRenderer, 
        detachedMenuGroups
    }: VrtTimestampServiceArgs) {
        this.localUser = localUser;
        this.sender = sender;
        this.auth = auth;
        this.reloadHandler = reloadHandler;
        this.landscapeTokenService = landscapeTokenService;
        this.vrLandscapeRenderer = vrLandscapeRenderer;
        this.vrApplicationRenderer = vrApplicationRenderer;
        this.detachedMenuGroups = detachedMenuGroups;
        
        this.timestamp = timestamp;
        this.timestampInterval = timestampInterval;
    }

    async updateLandscapeToken(landscapeToken: string, timestamp: number): Promise<void> {
        // While changing the timestamp, we overwrite the landscape token temporarily sucht
        // that the given landscape is loaded instead.
        let originalToken = this.landscapeTokenService.token;
        this.landscapeTokenService.setToken({
            alias: 'Temporary VR Token',
            created: new Date().getTime(),
            ownerId: this.auth.user?.sub || '',
            value: landscapeToken,
        });

        await this.updateTimestampLocally(timestamp);

        // Reset to original landscape token. When there was no token before the landscape was
        // changed, just remove the temporary token.
        if (originalToken) {
            this.landscapeTokenService.setToken(originalToken);
        } else {
            this.landscapeTokenService.removeToken();
        }
    }

    updateTimestamp(timestamp: number): Promise<void> {
        if (this.localUser.isOnline) {
            this.sender.sendTimestampUpdate(timestamp)
        }
        return this.updateTimestampLocally(timestamp);
    }

    async updateTimestampLocally(timestamp: number): Promise<void> {
        try {
            // reset 
            this.detachedMenuGroups.forceRemoveAllDetachedMenus();
            this.vrApplicationRenderer.applicationGroup.clear();
            this.vrLandscapeRenderer.cleanUpLandscape();

            // update model
            this.timestamp = timestamp;
            const [structureData, dynamicData] = await this.reloadHandler.loadLandscapeByTimestamp(timestamp);
            
            await Promise.all([
                this.vrLandscapeRenderer.updateLandscapeData(structureData, dynamicData),
                this.vrApplicationRenderer.updateLandscapeData(structureData, dynamicData)
            ]);
        } catch (e) {
            this.debug('Landscape couldn\'t be requested!', e);
        }
    }
}

