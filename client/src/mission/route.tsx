import React from 'react';
import { useEffect, useState } from 'react';
import { Source } from 'react-map-gl';
import { Layer } from 'react-map-gl';
import { Mission } from '../models/mission';
import { Utils } from '../utils';

interface Props {
    mission: Mission | null
    type: string
    color: string
    width: number
}

const RouteComponent = React.memo(function RouteComponent(props: Props) {

    const [route, setRoute] = useState<GeoJSON.FeatureCollection<GeoJSON.LineString>>(Utils.initGeoJson);

    useEffect(() => {

        const route = (): GeoJSON.FeatureCollection<GeoJSON.LineString> => {
            if (props.mission != null) {
                const pos: GeoJSON.Position[] = [];
                let foundWayPoint = false;
                for (let step of props.mission.route.route.entries()) {
                    if (foundWayPoint && props.type === 'deliver') {
                        pos.push([step.lon, step.lat]);
                    } else if (!foundWayPoint && props.type === 'pickup') {
                        pos.push([step.lon, step.lat]);
                    }
                    if (step.wayPoint) {
                        foundWayPoint = true;
                    }
                };
                const r = Utils.initGeoJson();
                r.features[0].geometry.coordinates = pos;
                return r;
            } else {
                return Utils.initGeoJson();
            }
        }

        setRoute(route());

    }, [props.mission, props.type]);

    return (
        <Source id={props.type} type='geojson' data={route}>
            <Layer
                type='line'
                paint={{ 'line-color': props.color, 'line-width': props.width }}
            ></Layer>
        </Source>
    );

});

export default RouteComponent;