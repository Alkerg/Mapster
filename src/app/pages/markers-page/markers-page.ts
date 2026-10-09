import { AfterViewInit, Component, ElementRef, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { LngLatLike } from 'mapbox-gl';
import { environment } from '../../../environments/environment.development';
import {v4 as UUIDv4} from 'uuid';
import { JsonPipe } from '@angular/common';

declare const mapboxgl: typeof mapboxglType;
mapboxgl.accessToken = environment.mapboxKey;

interface Marker{
  id: string;
  mapboxMarker: mapboxgl.Marker;
}

@Component({
  imports: [JsonPipe],
  selector: 'app-markers-page',
  templateUrl: './markers-page.html',
})
export class MarkersPage implements AfterViewInit{

  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map|null>(null);
  markers = signal<Marker[]>([]);

  async ngAfterViewInit() {

    if (!this.divElement()?.nativeElement) return;

    await new Promise( resolve => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;

    const map = new mapboxgl.Map({
      container: element, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [-71.06776, 42.35816], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 14 // starting zoom
    });

    /* const marker = new mapboxgl.Marker(
      {
        draggable: false
      }
    )
      .setLngLat([-71.06776, 42.35816])
      .addTo(map); */

    this.mapListeners(map);

  }

  mapListeners(map: mapboxgl.Map) {

    map.on('click', (event) => this.mapClick(event));


    this.map.set(map);
  }


  mapClick(event: mapboxgl.MapMouseEvent) {

    if(!this.map()) return;


    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );
    


    const mapboxMarker = new mapboxgl.Marker(
      {
        color: color
      }
    )
    .setLngLat(event.lngLat)
    .addTo(this.map()!);

    const newMarker: Marker = {
      id: UUIDv4(), 
      mapboxMarker: mapboxMarker
    };

    this.markers.update((markers) => [...markers, newMarker]);
    console.log(this.markers());
  }


  flyToMarker(lngLat: LngLatLike){
    if(!this.map()) return;

    this.map()?.flyTo({
      center: lngLat
    })
  }


  deleteMarker(marker: Marker){
    if(!this.map()) return;

    const map = this.map()!;

    marker.mapboxMarker.remove();

    this.markers.set(this.markers().filter(m => m.id !== marker.id));

  }

}
