import React, { Component } from 'react';
import Keycloak from 'keycloak-js';
import './App.css';

interface MyProps {};
interface MyState {
  keycloak: Keycloak.KeycloakInstance | null,
  authenticated: boolean
}

class App extends React.Component<MyProps, MyState> {

  constructor(props: any) {
    super(props);
    this.state = { keycloak: null, authenticated: false };
  }

  // Fetch passwords after first mount
  componentDidMount() {
    console.log((window as any)['_env'].url);
    const url = (window as any)['_env'].url;
    const realm = (window as any)['_env'].realm;
    const clientId = (window as any)['_env'].clientId;
    const keycloak = Keycloak({
      url: url,
      realm: realm,
      clientId: clientId
    });
    keycloak.init({onLoad: 'login-required'}).then(authenticated => {
      this.setState({ keycloak: keycloak, authenticated: authenticated })
    })
  }

  render() {
    if (this.state.keycloak) {
      if (this.state.authenticated) {
        return (
          <div>
            <p>This is a Keycloak-secured component of your application. You shouldn't be able
            to see this unless you've authenticated with Keycloak.</p>
          </div>
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
