import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ToastProvider } from '@agney/ir-toast';
import { KeycloakOptions } from './keycloak/keycloak-options';
import { KeycloakService } from './keycloak/keycloak';
import MissionComponent from './mission/mission';
import './App.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

interface MyProps { };
interface MyState {
    keycloak: KeycloakService | null,
    authenticated: boolean
}

class App extends React.Component<MyProps, MyState> {

    constructor(props: any) {
        super(props);
        this.state = { keycloak: null, authenticated: false };
    }

    async componentDidMount() {
        const url = (window as any)['_env'].url;
        const realm = (window as any)['_env'].realm;
        const clientId = (window as any)['_env'].clientId;
        const options: KeycloakOptions = {
            config: {
                realm: realm,
                url: url,
                clientId: clientId
            },
            initOptions: {
                onLoad: 'login-required',
                checkLoginIframe: false
            },
            loadUserProfileAtStartUp: true
        }
        const keycloak = new KeycloakService();

        let authenticated = await keycloak.init(options);
        this.setState({ keycloak: keycloak, authenticated: authenticated })
    }

    render() {
        if (this.state.keycloak) {
            if (this.state.authenticated) {
                return (
                    <IonApp>
                        <ToastProvider value={{ position: 'top', duration: 3000 }}>
                            <IonReactRouter>
                                <IonRouterOutlet>
                                    <Route exact path="/mission">
                                        <MissionComponent
                                            userProfile={this.state.keycloak.getUserProfile()}
                                            accessToken={(window as any)['_env'].accessToken}
                                            simulationDistanceBase={Number((window as any)['_env'].simulationDistanceBase)}
                                            simulationDistanceVariation={Number((window as any)['_env'].simulationDistanceVariation)}
                                            simulationDelay={Number((window as any)['_env'].simulationDelay)}
                                            hostname={(window as any).location.hostname}
                                        />
                                    </Route>
                                    <Route exact path="/">
                                        <Redirect to="/mission" />
                                    </Route>
                                </IonRouterOutlet>
                            </IonReactRouter>
                        </ToastProvider>
                    </IonApp>
                );
            } else {
                return (
                    <IonApp>
                        <div>Unable to authenticate!</div>
                    </IonApp>
                );
            }
        }
        return (
            <IonApp>
                <div>Initializing...</div>
            </IonApp>
        );
    }

}

export default App;
