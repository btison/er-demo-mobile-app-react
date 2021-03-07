import React, { useEffect, useState, useMemo } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonToast, IonButton } from '@ionic/react';
import ReactMapGL, { WebMercatorViewport, Marker } from 'react-map-gl';
import { Responder } from '../models/responder';
import { Location } from '../models/location';
import { DisasterCenter } from '../models/disaster-center';
import { Shelter } from '../models/shelter';
import { ResponderService } from '../services/responder-service';
import { DisasterSimulatorService } from '../services/disaster-simulator-service';
import { MessageService, Toast } from '../services/message-service'
import { DisasterService } from '../services/disaster-service';

import './mission.css';

interface MyProps {
    userProfile: Keycloak.KeycloakProfile
}

const Mission = (props: MyProps) => {

    const BUTTON_AVAILABLE = 'available';
    const BUTTON_PICKED_UP = 'picked up';

    const DEFAULT_CENTER = useMemo(() => new DisasterCenter('default', 34.158808, -77.886765, 10.5), []);

    const [responder, setResponder] = useState<Responder>(new Responder());
    const [toast, setToast] = useState<Toast>(new Toast());
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [button, setButton] = useState<String>('available');
    const [viewport, setViewport] = useState<WebMercatorViewport>(new WebMercatorViewport({ width: 0, height: 0, latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lon, zoom: DEFAULT_CENTER.zoom }));

    const accessToken = (window as any)['_env'].accessToken;

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

        const getDisasterCenter = async (): Promise<DisasterCenter> => {
            try {
                return disasterService.getDisasterCenter();
            } catch (e) {
                if (e instanceof Error) {
                    setToast(new Toast());
                    setToast(MessageService.error(e.message));
                    return Promise.resolve(DEFAULT_CENTER);
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

        getDisasterCenter().then((center) => {
            setViewport(new WebMercatorViewport({ width: 0, height: 0, latitude: center.lat, longitude: center.lon, zoom: center.zoom }));
        });
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
    }, [props.userProfile, DEFAULT_CENTER]);

    const buttonDisabled = (): boolean => {
        if (button === BUTTON_AVAILABLE) {
            return (responder.latitude === null || responder.latitude === 0)
        }
        return false;
    }

    const shelterMarkers = useMemo(() =>
        shelters.map((shelter) => (
            <Marker
                latitude={shelter.lat}
                longitude={shelter.lon}
            >
                <div className="shelter" style={{ backgroundImage: 'url(/assets/img/circle-shelter-hospital-colored.svg)' }}></div>
            </Marker>
        )
        ), [shelters]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mission</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <ReactMapGL
                    mapboxApiAccessToken={accessToken}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    latitude={viewport.latitude}
                    longitude={viewport.longitude}
                    zoom={viewport.zoom}
                    width='100vw'
                    height='100vh'
                    onViewportChange={(viewport: WebMercatorViewport) => setViewport(viewport)}
                >
                    {shelterMarkers}
                </ReactMapGL>
            </IonContent>
            <IonButton
                expand="block"
                color="primary"
                fill="solid"
                disabled={buttonDisabled()}
            >
                {button}
            </IonButton>
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