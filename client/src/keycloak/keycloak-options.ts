export interface KeycloakOptions {
    /**
     * Configs to init the keycloak-js library. If undefined, will look for a keycloak.json file
     * at root of the project.
     * If not undefined, can be a string meaning the url to the keycloak.json file or an object
     * of {@link Keycloak.KeycloakConfig}. Use this configuration if you want to specify the keycloak server,
     * realm, clientId. This is usefull if you have different configurations for production, stage
     * and development environments. Hint: Make use of Angular environment configuration.
     */
    config?: string | Keycloak.KeycloakConfig;
    /**
     * Options to initialize the Keycloak adapter, matches the options as provided by Keycloak itself.
     */
    initOptions?: Keycloak.KeycloakInitOptions;

    /**
     * Forces the execution of loadUserProfile after the keycloak initialization considering that the
     * user logged in.
     * This option is recommended if is desirable to have the user details at the beginning,
     * so after the login, the loadUserProfile function will be called and it's value cached.
     *
     * The default value is true.
     */
    loadUserProfileAtStartUp?: boolean;
}