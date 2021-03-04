import React from 'react';
import { KeycloakOptions } from './keycloak/keycloak-options';
import { KeycloakService } from './keycloak/keycloak';
import './App.css';
import Mission from './mission/mission';

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

    async componentWillMount() {
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
                onLoad: 'login-required'
            },
            loadUserProfileAtStartUp: true
        }
        const keycloak = new KeycloakService();

        let authenticated = await keycloak.init(options);
        this.setState({ keycloak: keycloak, authenticated: authenticated })
    }

    async componentDidMount() {
    }

    render() {
        if (this.state.keycloak) {
            if (this.state.authenticated) {
                return (
                    <Mission
                        userProfile={this.state.keycloak.getUserProfile()} >
                    </Mission>
                );
            } else {
                return (<div>Unable to authenticate!</div>);
            }
        }
        return (
            <div>Initializing Keycloak...</div>
        );
    }

}

export default App;
