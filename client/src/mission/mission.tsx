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

    static DEFAULT_PHONE_NUMBER = '111-222-333';
    static DEFAULT_BOAT_CAPACITY = 12;
    static DEFAULT_MEDICAL_KIT = true;

    private responderService = new ResponderService();

    constructor(props: MyProps) {
        super(props);
        this.state = { responder: null };
    }

    async componentWillMount() {
        const responderName = `${this.props.userProfile.firstName} ${this.props.userProfile.lastName}`;
        let responder = await this.responderService.getByName(responderName);
        if (responder.id === 0) {
            responder = await this.registerResponder(true);
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

    async registerResponder(getResponder: boolean): Promise<Responder> {
        //TODO toast
        const responder = new Responder();
        let profile: any = this.props.userProfile;
        responder.name = `${this.props.userProfile.firstName} ${this.props.userProfile.lastName}`;
        responder.enrolled = false;
        responder.person = true;
        responder.available = true;
        const attrs: any = profile['attributes'];

        if (attrs) {
            if (attrs.phoneNumber && attrs.phoneNumber[0]) {
                responder.phoneNumber = attrs.phoneNumber[0];
            } else {
                responder.phoneNumber = Mission.DEFAULT_PHONE_NUMBER;
            }
            if (attrs.boatCapacity && attrs.boatCapacity[0]) {
                // clamp between 2 and 12
                const boatCapacity = attrs.boatCapacity[0] <= 2 ? 2 : attrs.boatCapacity[0] >= 12 ? 12 : attrs.boatCapacity[0];
                responder.boatCapacity = boatCapacity;
            } else {
                responder.boatCapacity = Mission.DEFAULT_BOAT_CAPACITY;
            }
            if (attrs.medical && attrs.medical[0]) {
                responder.medicalKit = attrs.medical[0];
            } else {
                responder.medicalKit = Mission.DEFAULT_MEDICAL_KIT;
            }
        }
        return this.responderService.create(responder, getResponder);
    }

}

export default Mission;