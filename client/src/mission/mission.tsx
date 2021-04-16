import React, { useEffect, useState, useMemo } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonSpinner } from '@ionic/react';
import ReactMapGL, { WebMercatorViewport } from 'react-map-gl';
import { useToast } from '@agney/ir-toast';
import { Responder } from '../models/responder';
import { Location } from '../models/location';
import { DisasterCenter } from '../models/disaster-center';
import { Shelter } from '../models/shelter';
import { Mission, Route } from '../models/mission';
import { ResponderService } from '../services/responder-service';
import { DisasterSimulatorService } from '../services/disaster-simulator-service';
import { MissionService } from '../services/mission-service';
import { DisasterService } from '../services/disaster-service';
import { IntervalHookResult, useInterval } from "react-interval-hook";
import { Utils } from "../utils";
import RouteComponent from './route';
import ShelterComponent from './shelters';
import IncidentComponent from './incident';
import ResponderComponent from './responder';
import './mission.css';
import { Dispatcher, SocketService } from '../socket-service';

interface Props {
    userProfile: Keycloak.KeycloakProfile
    accessToken: string
    simulationDistanceBase: number
    simulationDelay: number
    simulationDistanceVariation: number
    hostname: string
}

const MissionComponent = (props: Props) => {

    const BUTTON_AVAILABLE = 'available';
    const BUTTON_PICKED_UP = 'picked up';

    const DEFAULT_CENTER = useMemo(() => new DisasterCenter('default', 34.158808, -77.886765, 10.5), []);

    const [responder, setResponder] = useState<Responder>(new Responder());
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [button, setButton] = useState<String>(BUTTON_AVAILABLE);
    const [viewport, setViewport] = useState<WebMercatorViewport>(new WebMercatorViewport({ width: 0, height: 0, latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lon, zoom: DEFAULT_CENTER.zoom }));
    const [responderLocation, setResponderLocation] = useState<Location>(Location.of(0, 0));
    const [waitingOnMission, setWaitingOnMission] = useState<boolean>(false);
    const [pickedup, setPickedup] = useState<boolean>(false);
    const [mission, setMission] = useState<Mission | null>(null);

    const responderService = new ResponderService();
    const missionService = new MissionService();

    const Toast = useToast();

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
                    Toast.create({ message: 'Registering as new responder', color: 'primary' }).present();
                    responder = await registerResponder(true);
                }
                return Promise.resolve(responder);
            } catch (e) {
                if (e instanceof Error) {
                    Toast.error(e.message).present();
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
                    Toast.error(e.message).present();
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
                    Toast.error(e.message).present();
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
                    Toast.error(e.message).present();
                    return Promise.resolve([]);
                } else {
                    throw e;
                }
            }
        };

        const dispatcher: Dispatcher = {
            dispatch: (type: string, data: any) => {
                switch (type) {
                    case 'connection-status':
                        break;
                }
            }
        };

        getDisasterCenter().then((center) => {
            setViewport(new WebMercatorViewport({ width: 0, height: 0, latitude: center.lat, longitude: center.lon, zoom: center.zoom }));
        });
        getShelters().then((shelters) => setShelters(shelters));
        getResponder().then((responder) => {
            responder.distanceUnit = Utils.random(props.simulationDistanceBase, props.simulationDistanceBase * (1 + props.simulationDistanceVariation));
            if (responder.latitude == null || responder.latitude === 0) {
                generateLocation().then((location) => {
                    if (location) {
                        responder.latitude = location.lat;
                        responder.longitude = location.lon;
                        setResponderLocation(location);
                    }
                    setResponder(responder);
                });
            } else {
                setResponder(responder);
                setResponderLocation(Location.of(responder.latitude as number, responder.longitude as number));
            }
            SocketService.connect(props.hostname, dispatcher, responder);
        });
    }, [props.userProfile, DEFAULT_CENTER, props.simulationDistanceBase, props.simulationDistanceVariation, props.hostname, Toast]);

    const buttonDisabled = (): boolean => {
        if (button === BUTTON_AVAILABLE) {
            return (responderLocation.lat === 0 || waitingOnMission || (responder.available === true && responder.enrolled === true))
        }
        if (button === BUTTON_PICKED_UP) {
            return (pickedup === true || mission === null);
        }
        return false;
    };

    const buttonClicked = () => {
        if (button === BUTTON_AVAILABLE) {
            responder.enrolled = true;
            responder.available = true;
            responder.latitude = responderLocation.lat;
            responder.longitude = responderLocation.lon;
            responderService.update(responder)
                .then(() => {
                    waitOnMission();
                });
        }
        if (button === BUTTON_PICKED_UP) {
            mission!.route.status = 'PICKEDUP';
            mission!.route.waiting = false;
            setPickedup(true);
            missionService.update(responder.id, mission!.route);
            simulateResponderInterval.start();
        }
    };

    const getMissionInterval: IntervalHookResult = useInterval(() => {
        missionService.get(responder.id).then((mission) => {
            if (mission !== null) {
                mission.route.distanceUnit = responder.distanceUnit!;
                setMission(mission);
                setWaitingOnMission(false);
                Toast.success('You have been assigned a mission').present();
                getMissionInterval.stop();
                simulateResponderInterval.start();
            }
        });
    }, 2000, { autoStart: false });

    const simulateResponderInterval: IntervalHookResult = useInterval(() => {
        Route.nextLocation(mission!.route);
        Route.moveToNextLocation(mission!.route);
        setResponderLocation(Location.of(mission!.route.currentLocation.lat, mission!.route.currentLocation.lon));
        missionService.update(responder.id, mission!.route);
        if (mission?.route.status === 'WAITING') {
            simulateResponderInterval.stop();
            setButton(BUTTON_PICKED_UP);
        }
        if (mission?.route.status === 'DROPPED') {
            simulateResponderInterval.stop();
            setMission(null);
            setPickedup(false);
            responder.enrolled = false;
            responder.available = true;
            setResponder(responder);
            setButton(BUTTON_AVAILABLE);
        }
    }, props.simulationDelay, { autoStart: false });

    const waitOnMission = () => {
        setWaitingOnMission(true);
        Toast.create({ message: 'Waiting to receive a rescue mission', color: 'primary' }).present();
        getMissionInterval.start();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mission</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <ReactMapGL
                    mapboxApiAccessToken={props.accessToken}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    latitude={viewport.latitude}
                    longitude={viewport.longitude}
                    zoom={viewport.zoom}
                    width='100vw'
                    height='100vh'
                    onViewportChange={(viewport: WebMercatorViewport) => setViewport(viewport)}
                >
                    <ShelterComponent
                        shelters={shelters}
                    />
                    <ResponderComponent
                        location={responderLocation}
                        pickedup={pickedup}
                    />
                    <IncidentComponent
                        mission={mission}
                        pickedup={pickedup}
                    />
                    <RouteComponent
                        mission={mission}
                        type='deliver'
                        color='#20a8d8'
                        width={8}
                    />
                    <RouteComponent
                        mission={mission}
                        type='pickup'
                        color='#ffc107'
                        width={8}
                    />
                </ReactMapGL>
            </IonContent>
            <IonButton
                expand="block"
                color="primary"
                fill="solid"
                disabled={buttonDisabled()}
                onClick={() => buttonClicked()}
            >
                {button}
                {waitingOnMission &&
                    <IonSpinner name="crescent" />}
            </IonButton>
        </IonPage>
    );
}

export default MissionComponent;