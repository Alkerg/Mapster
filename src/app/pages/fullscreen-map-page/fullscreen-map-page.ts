import { AfterViewInit, Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { MapboxSearchBox } from '@mapbox/search-js-web';
import { environment } from '../../../environments/environment';
import { DecimalPipe, JsonPipe, TitleCasePipe } from '@angular/common';
import { SearchBox } from '../../maps/components/search-box/search-box';

declare const mapboxgl: typeof mapboxglType;
mapboxgl.accessToken = environment.mapboxKey;

export interface LocationDetail {
  id: string;
  name: string;
  address?: string;
  coordinates: Coordinate;
  categories?: string[];
}

export interface Coordinate {
  lng: number;
  lat: number;
}

interface RouteStep {
  distance?: number;
  duration?: number;
  instruction: string;
}

@Component({
  imports: [DecimalPipe, JsonPipe, TitleCasePipe, SearchBox],
  selector: 'app-fullscreen-map-page',
  templateUrl: './fullscreen-map-page.html',
  styleUrl: './fullscreen-map-page.css'
})
export class FullscreenMapPage implements AfterViewInit {

  map = signal<mapboxgl.Map|null>(null);
  divElement = viewChild<ElementRef>('map');
  searchBoxContainer = viewChild<ElementRef>('searchBoxContainer');
  locationDetailContainer = viewChild<ElementRef>('locationDetailContainer');
  directionsContainer = viewChild<ElementRef>('directionsContainer');

  zoom = signal(10);
  coordinates = signal({lng: -77.0098, lat: -12.0300});
  locationDetail = signal<LocationDetail|null>(null);
  originCoords = signal<Coordinate|null>(null);
  destinyCoords = signal<Coordinate|null>(null);
  transportType = signal<'driving'|'walking'|'cycling'|'driving-traffic'>('driving-traffic');
  distanceBetweenPoints = signal<number|null>(null); //Km
  durationBetweenPoints = signal<number|null>(null); //Minutes
  steps = signal<RouteStep[]>([]);
  points = signal<Map<string, Coordinate>>(new Map());

  zoomEffect = effect(() => {
    if (!this.map) return;

    this.map()?.setZoom(this.zoom());
  })

  async ngAfterViewInit() {

    if (!this.divElement()?.nativeElement) return;

    await new Promise( resolve => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;
    const { lng, lat } = this.coordinates();

    const map = new mapboxgl.Map({
      container: element,
      center: [lng, lat],
      zoom: this.zoom()
    });

    this.mapListeners(map);

  }

  onLocationDetail(newLocation: LocationDetail) {
    this.locationDetail.set(newLocation);
    this.points.update((points) => {
      const updatedPoints = new Map(points);
      updatedPoints.set(newLocation.id, newLocation.coordinates);
      return updatedPoints;
    });
    this.locationDetailContainer()?.nativeElement.classList.add('active');
  }

  onClear = (locationId: string) => {
    this.points.update((points) => {
      const updatedPoints = new Map(points);
      updatedPoints.delete(locationId);
      return updatedPoints;
    });

    // Hide detail panel
    this.locationDetailContainer()?.nativeElement.classList.remove('active');
    this.directionsContainer()?.nativeElement.classList.remove('active');
    const map = this.map();
    if (map?.getLayer('route-line')) {
      map.removeLayer('route-line');
    }
    if (map?.getSource('route')) {
      map.removeSource('route');
    }
    
    // Clear distance and duration
    this.distanceBetweenPoints.set(null);
    this.durationBetweenPoints.set(null);
    this.locationDetail.set(null);
  };
  
  mapListeners(map: mapboxgl.Map) {

    map.on('zoomend', (event) => {
      const newZoom = event.target.getZoom();
      this.zoom.set(newZoom);
    });
    

    map.on('moveend', () => {
      const center = map.getCenter();
      this.coordinates.set(center);
    })

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
    }));
 
    this.map.set(map);
    
  }

  async getDirections(){
    // First elemento of the set of points is the origin, the last element is the destiny
    const selectedPoints = Array.from(this.points().values());
    const origin = selectedPoints[0];
    const destiny = selectedPoints[selectedPoints.length - 1];

    if (!origin || !destiny || selectedPoints.length < 2) return;

    const urlRequest =`https://api.mapbox.com/directions/v5/mapbox/${this.transportType()}/${origin.lng},${origin.lat};${destiny.lng},${destiny.lat}?alternatives=false&geometries=geojson&language=es&overview=full&steps=true&access_token=${environment.mapboxKey}`;
    
    const response = await fetch(urlRequest);
    const routeData = await response.json();

    // Set steps

    const steps = routeData.routes[0].legs[0].steps.map((step: any) => {
      return {
        distance: step.distance,
        duration: step.duration,
        instruction: step.maneuver.instruction
      }
    });

    this.steps.set(steps);

    // Set distance and duration

    const distanceInKm = routeData.routes[0].distance / 1000;
    const durationInSeconds = Math.round(routeData.routes[0].duration / 60);

    this.distanceBetweenPoints.set(distanceInKm);
    this.durationBetweenPoints.set(durationInSeconds);

    // Add route to the map
    const routeFeature = {
      type: 'Feature',
      properties: {},
      geometry: routeData.routes[0].geometry
    }
  
    const map = this.map();
    if (!map) return;

    const source = map.getSource('route') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(routeFeature);
    } else {
      map.addSource('route', {
        type: 'geojson',
        data: routeFeature
      });
    }

    if (!map.getLayer('route-line')) {
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#1d4ed8', 'line-width': 4 }
      });
    }

    this.directionsContainer()?.nativeElement.classList.add('active');

  }

}
