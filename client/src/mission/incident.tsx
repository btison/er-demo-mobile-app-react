import React from "react";
import { Marker } from "react-map-gl";
import { Mission } from "../models/mission";

interface Props {
    mission: Mission | null
    pickedup: boolean
}

const IncidentComponent = React.memo(function IncidentComponent(props: Props) {

    const incidentMarker = (): any => {
        if (!(props.mission === null)) {
            return (
                <Marker
                    latitude={props.mission.incidentLocation.lat}
                    longitude={props.mission.incidentLocation.lon}
                >
                    {props.pickedup &&
                        <div className="incidentMarker" style={{ backgroundImage: 'url(/assets/img/marker-incident-pickedup-colored2.svg)' }}></div>}
                    {!props.pickedup &&
                        <div className="incidentMarker" style={{ backgroundImage: 'url(/assets/img/marker-incident-helpassigned-colored2.svg)' }}></div>}
                </Marker>
            )
        } else {
            return null;
        }
    };

    return incidentMarker();

});

export default IncidentComponent;