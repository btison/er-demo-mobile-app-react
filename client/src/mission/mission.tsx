import React from 'react';
import { Responder } from '../models/responder';
import { ResponderService } from '../services/responder-service'

interface MyProps { 
    userProfile: Keycloak.KeycloakProfile
}

interface MyState { 
    responder: Responder | null
}

class Mission extends React.Component<MyProps, MyState> {

    private responderService = new ResponderService();

    constructor(props: MyProps) {
        super(props);
        this.state = { responder: null };
    }

    async componentWillMount() {
        const responderName = `${this.props.userProfile.firstName} ${this.props.userProfile.lastName}`;
        let responder = await this.responderService.getByName(responderName);
        if (responder.id === 0) {
            // register responder;
        }
        this.setState({responder: responder});    
    }

    render() {
        return(
            <div>Mission
              <pre>{JSON.stringify(this.props.userProfile, undefined, 2)}</pre>
              <pre>{JSON.stringify(this.state.responder, undefined, 2)}</pre>
            </div>
        );
    };

}

export default Mission;