import React from "react";
import { Marker } from "react-map-gl";
import { Location } from '../models/location';

interface Props {
    location: Location
    pickedup: boolean
}

const ResponderComponent = React.memo(function ResponderComponent(props: Props) {

    const responderMarker = (): any => {
        if (!(props.location.lat === 0)) {
            return (
                <Marker
                    latitude={props.location.lat}
                    longitude={props.location.lon}
                >
                    {!props.pickedup &&
                        <div className="responderMarker" style={{ backgroundImage: 'url(/assets/img/circle-responder-boat-colored.svg)' }}></div>}
                    {props.pickedup &&
                        <div className="responderMarker" style={{ backgroundImage: 'url(/assets/img/circle-responder-boat-colored-pickedup.svg)' }}></div>}
                </Marker>
            )
        } else {
            return null;
        }
    }

    return responderMarker();

});

export default ResponderComponent;