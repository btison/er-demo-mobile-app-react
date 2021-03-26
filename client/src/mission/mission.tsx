import React, { useEffect, useState, useMemo } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonToast, IonButton, IonSpinner } from '@ionic/react';
import ReactMapGL, { WebMercatorViewport, Marker, Source, Layer } from 'react-map-gl';
import { Responder } from '../models/responder';
import { Location } from '../models/location';
import { DisasterCenter } from '../models/disaster-center';
import { Shelter } from '../models/shelter';
import { Mission, Route } from '../models/mission';
import { ResponderService } from '../services/responder-service';
import { DisasterSimulatorService } from '../services/disaster-simulator-service';
import { MissionService } from '../services/mission-service';
import { MessageService, Toast } from '../services/message-service'
import { DisasterService } from '../services/disaster-service';
import { IntervalHookResult, useInterval } from "react-interval-hook";
import { Utils } from "../utils";

import './mission.css';

interface MyProps {
    userProfile: Keycloak.KeycloakProfile
    accessToken: string
    simulationDistanceBase: number
    simulationDelay: number
    simulationDistanceVariation: number
}

const MissionComponent = (props: MyProps) => {

    const BUTTON_AVAILABLE = 'available';
    const BUTTON_PICKED_UP = 'picked up';

    const DEFAULT_CENTER = useMemo(() => new DisasterCenter('default', 34.158808, -77.886765, 10.5), []);

    const [responder, setResponder] = useState<Responder>(new Responder());
    const [toast, setToast] = useState<Toast>(new Toast());
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [button, setButton] = useState<String>(BUTTON_AVAILABLE);
    const [viewport, setViewport] = useState<WebMercatorViewport>(new WebMercatorViewport({ width: 0, height: 0, latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lon, zoom: DEFAULT_CENTER.zoom }));
    const [responderLocation, setResponderLocation] = useState<Location>(Location.of(0, 0));
    const [waitingOnMission, setWaitingOnMission] = useState<boolean>(false);
    const [pickedup, setPickedup] = useState<boolean>(false);
    const [mission, setMission] = useState<Mission | null>(null);
    const [pickupData, setPickupData] = useState<GeoJSON.FeatureCollection<GeoJSON.LineString>>(Utils.initGeoJson());
    const [deliverData, setDeliverData] = useState<GeoJSON.FeatureCollection<GeoJSON.LineString>>(Utils.initGeoJson);

    const responderService = new ResponderService();
    const missionService = new MissionService();

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
        });
    }, [props.userProfile, DEFAULT_CENTER, props.simulationDistanceBase, props.simulationDistanceVariation]);

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
                setRoutes(mission);
                setWaitingOnMission(false);
                setToast(new Toast());
                setToast(MessageService.success('You have been assigned a mission'));
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
            setDeliverData(Utils.initGeoJson());
            setPickupData(Utils.initGeoJson());
        }
    }, props.simulationDelay, { autoStart: false });

    const setRoutes = (mission: Mission) => {
        const pickup: GeoJSON.Position[] = [];
        const deliver: GeoJSON.Position[] = [];
        let foundWayPoint = false;
        for (let step of mission!.route.route.entries()) {
            if (foundWayPoint) {
                deliver.push([step.lon, step.lat]);
            } else {
                pickup.push([step.lon, step.lat]);
            }
            if (step.wayPoint) {
                foundWayPoint = true;
            }
        };
        const dd = Utils.initGeoJson();
        dd.features[0].geometry.coordinates = deliver;
        setDeliverData(dd);
        const pd = Utils.initGeoJson();
        pd.features[0].geometry.coordinates = pickup;
        setPickupData(pd);
    };

    const waitOnMission = () => {
        setWaitingOnMission(true);
        setToast(new Toast());
        setToast(MessageService.info('Waiting to receive a rescue mission'));
        getMissionInterval.start();
    };

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

    const responderMarker = (): any => {
        if (!(responderLocation.lat === 0)) {
            return (
                <Marker
                    latitude={responderLocation.lat}
                    longitude={responderLocation.lon}
                >
                    {!pickedup &&
                        <div className="responderMarker" style={{ backgroundImage: 'url(/assets/img/circle-responder-boat-colored.svg)' }}></div>}
                    {pickedup &&
                        <div className="responderMarker" style={{ backgroundImage: 'url(/assets/img/circle-responder-boat-colored-pickedup.svg)' }}></div>}
                </Marker>
            )
        }
    };

    const incidentMarker = (): any => {
        if (!(mission === null)) {
            return (
                <Marker
                    latitude={mission.incidentLocation.lat}
                    longitude={mission.incidentLocation.lon}
                >
                    {pickedup &&
                        <div className="incidentMarker" style={{ backgroundImage: 'url(/assets/img/marker-incident-pickedup-colored2.svg)' }}></div>}
                    {!pickedup &&
                        <div className="incidentMarker" style={{ backgroundImage: 'url(/assets/img/marker-incident-helpassigned-colored2.svg)' }}></div>}
                </Marker>
            )
        }
    };

    const pickupLayer = (): any => {
        if (!(mission === null)) {
            return (
                <Source id='pickupData' type='geojson' data={pickupData}>
                    <Layer
                        id='pickup'
                        type='line'
                        paint={{ 'line-color': '#ffc107', 'line-width': 8 }}
                    ></Layer>
                </Source>
            )
        }
    };

    const deliverLayer = (): any => {
        if (!(mission === null)) {
            return (
                <Source id='deliverData' type='geojson' data={deliverData}>
                    <Layer
                        id='deliver'
                        type='line'
                        paint={{ 'line-color': '#20a8d8', 'line-width': 8 }}
                    ></Layer>
                </Source>
            )
        }
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
                    {shelterMarkers}
                    {responderMarker()}
                    {incidentMarker()}
                    {pickupLayer()}
                    {deliverLayer()}
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

export default MissionComponent;