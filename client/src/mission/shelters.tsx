import { Shelter } from "../models/shelter";
import { Marker } from 'react-map-gl';
import React, { useEffect, useState } from "react";

interface Props {
    shelters: Shelter[]
}

const ShelterComponent = React.memo(function ShelterComponent(props: Props) {

    const [shelters, setShelters] = useState<Shelter[]>([]);

    useEffect(() => {
        setShelters(props.shelters);
    }, [props.shelters]);

    return (
        <div>
            {shelters.map((shelter) => {
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