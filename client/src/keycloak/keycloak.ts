import { KeycloakOptions } from './keycloak-options';

import Keycloak from 'keycloak-js';

export class KeycloakService {

    /**
     * Keycloak-js instance.
     */
    private _instance: Keycloak.KeycloakInstance;

    /**
     * User profile as KeycloakProfile interface.
     */
    private _userProfile: Keycloak.KeycloakProfile;

    /**
     * Indicates that the user profile should be loaded at the keycloak initialization,
     * just after the login.
     */
    private _loadUserProfileAtStartUp: boolean;

    public async init(options: KeycloakOptions = {}) {
        this.initServiceValues(options);
        const { config, initOptions } = options;

        this._instance = Keycloak(config);

        const authenticated = await this._instance.init(initOptions!);

        if (authenticated && this._loadUserProfileAtStartUp) {
            await this.loadUserProfile();
        }

        return authenticated;
    }

    private initServiceValues({
        loadUserProfileAtStartUp = false,
        initOptions,
    }: KeycloakOptions): void {
        this._loadUserProfileAtStartUp = loadUserProfileAtStartUp;
    }

    public async loadUserProfile(forceReload = false) {
        if (this._userProfile && !forceReload) {
            return this._userProfile;
        }

        if (!this._instance.authenticated) {
            throw new Error(
                'The user profile was not loaded as the user is not logged in.'
            );
        }

        return this._userProfile = await this._instance.loadUserProfile();
    }

    public async updateToken(minValidity = 5) {
        if (!this._instance) {
            throw new Error('Keycloak is not initialized.');
        }
        return this._instance.updateToken(minValidity);
    }

    public async getToken() {
        await this.updateToken(10);
        return this._instance.token;
    }

    public async getTokenParsed() {
        await this.updateToken(10);
        return this._instance.tokenParsed;
    }

    public getUserProfile() {
        if (!this._userProfile) {
            throw new Error('User not logged in or user profile was not loaded.');
        }

        return this._userProfile;
    }

}

