import React from "react";
import { Marker } from 'react-map-gl';
import { Shelter } from "../models/shelter";

interface Props {
    shelters: Shelter[]
}

const ShelterComponent = React.memo(function ShelterComponent(props: Props) {

    return (
        <div>
            {props.shelters.map((shelter) => {
                return (
                    <React.Fragment key={shelter.id}>
                        <Marker
                            latitude={shelter.lat}
                            longitude={shelter.lon}
                        >
                            <div className="shelter" style={{ backgroundImage: 'url(/assets/img/circle-shelter-hospital-colored.svg)' }}></div>
                        </Marker>
                    </React.Fragment>
                );
            })}
        </div>
    );
});

export default ShelterComponent;