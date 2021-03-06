import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonToast } from '@ionic/react';
import { Responder } from '../models/responder';
import { Location } from '../models/location';
import { DisasterCenter } from '../models/disaster-center';
import { Shelter } from '../models/shelter';
import { ResponderService } from '../services/responder-service';
import { DisasterSimulatorService } from '../services/disaster-simulator-service';
import { MessageService, Toast } from '../services/message-service'
import { DisasterService } from '../services/disaster-service';

interface MyProps {
    userProfile: Keycloak.KeycloakProfile
}

const Mission = (props: MyProps) => {

    const [responder, setResponder] = useState<Responder>(new Responder());
    const [toast, setToast] = useState<Toast>(new Toast());
    const [center, setCenter] = useState<DisasterCenter | null>(null);
    const [shelters, setShelters] = useState<Shelter[]>([]);

    useEffect(() => {
        const DEFAULT_PHONE_NUMBER = '111-222-333';
        const DEFAULT_BOAT_CAPACITY = 12;
        const DEFAULT_MEDICAL_KIT = true;

        const responderService = new ResponderService();
        const disasterSimulatorService = new DisasterSimulatorService();
        const disasterService = new DisasterService();

        const getResponder = async (): Promise<Responder> => {
            const responderName = `${props.userProfile.firstName} ${props.userProfile.lastName}`;
            try {
                let responder = await responderService.getByName(responderName);
                if (responder.id === "0") {
                    setToast(MessageService.info('Registering as new responder'));
                    responder = await registerResponder(true);
                }
                return Promise.resolve(responder);
            } catch (e) {
                if (e instanceof Error) {
                    setToast(new Toast());
                    setToast(MessageService.error(e.message));
                    return Promise.resolve(new Responder());                    
                } else {
                    throw e;
                }
            }
        };

        const registerResponder = async (getResponder: boolean): Promise<Responder> => {
            const responder = new Responder();
            let profile: any = props.userProfile;
            responder.name = `${props.userProfile.firstName} ${props.userProfile.lastName}`;
            responder.enrolled = false;
            responder.person = true;
            responder.available = true;
            const attrs: any = profile['attributes'];

            if (attrs) {
                if (attrs.phoneNumber && attrs.phoneNumber[0]) {
                    responder.phoneNumber = attrs.phoneNumber[0];
                } else {
                    responder.phoneNumber = DEFAULT_PHONE_NUMBER;
                }
                if (attrs.boatCapacity && attrs.boatCapacity[0]) {
                    // clamp between 2 and 12
                    const boatCapacity = attrs.boatCapacity[0] <= 2 ? 2 : attrs.boatCapacity[0] >= 12 ? 12 : attrs.boatCapacity[0];
                    responder.boatCapacity = boatCapacity;
                } else {
                    responder.boatCapacity = DEFAULT_BOAT_CAPACITY;
                }
                if (attrs.medical && attrs.medical[0]) {
                    responder.medicalKit = attrs.medical[0];
                } else {
                    responder.medicalKit = DEFAULT_MEDICAL_KIT;
                }
            }
            return responderService.create(responder, getResponder);
        };

        const generateLocation = async (): Promise<Location | null> => {
            try {
                return disasterSimulatorService.generateLocation();
            } catch (e) {
                if (e instanceof Error) {
                    setToast(new Toast());
                    setToast(MessageService.error(e.message));
                    return Promise.resolve(null);                    
                } else {
                    throw e;
                }                
            }
        };

        const getDisasterCenter = async (): Promise<DisasterCenter | null> => {
            try {
                return disasterService.getDisasterCenter();
            } catch (e) {
                if (e instanceof Error) {
                    setToast(new Toast());
                    setToast(MessageService.error(e.message));
                    return Promise.resolve(null);
                } else {
                    throw e;
                }
            }
        };

        const getShelters = async (): Promise<Shelter[]> => {
            try {
                return disasterService.getShelters();
            } catch (e) {
                if (e instanceof Error) {
                    setToast(new Toast());
                    setToast(MessageService.error(e.message));
                    return Promise.resolve([]);
                } else {
                    throw e;
                }
            }            
        };

        getDisasterCenter().then((center) => setCenter(center));
        getShelters().then((shelters) => setShelters(shelters));
        getResponder().then((responder) => {
            if (responder.latitude == null || responder.latitude === 0) {
                generateLocation().then((location) => {
                    if (location) {
                        responder.latitude = location.latitude;
                        responder.longitude = location.longitude;
                    }
                    setResponder(responder);
                });
            } else {
                setResponder(responder);
            }
        });

    }, [props.userProfile]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mission</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="container">
                    <pre>{JSON.stringify(props.userProfile, undefined, 2)}</pre>
                    <pre>{JSON.stringify(responder, undefined, 2)}</pre>
                    <pre>{JSON.stringify(center, undefined, 2)}</pre>
                    <pre>{JSON.stringify(shelters, undefined, 2)}</pre>
                </div>
            </IonContent>
            <IonToast
                isOpen={toast.open}
                onDidDismiss={() => setToast(new Toast())}
                message={toast.message}
                duration={toast.duration}
                color={toast.color}
                position={toast.position}
            />
        </IonPage>
    );
}

export default Mission;