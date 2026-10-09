import { AfterViewInit, Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { DecimalPipe, JsonPipe } from '@angular/common';

declare const mapboxgl: typeof mapboxglType;
mapboxgl.accessToken = environment.mapboxKey;


@Component({
  imports: [DecimalPipe, JsonPipe],
  selector: 'app-fullscreen-map-page',
  templateUrl: './fullscreen-map-page.html',
  styles: `
  
    div {
      width: 100vw;
      height: calc(100vh - 64px);
      background-color: red;
    }

    #controls{
      background-color: white;
      padding: 10px;
      border-radius: 5px;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999;
      box-shadow: 0px 0px 10px rgba(0,0,0,1);
      border: 1px solid #e2e8f0;
      width: 250px;
    }
  
  `
})
export class FullscreenMapPage implements AfterViewInit {

  map = signal<mapboxgl.Map|null>(null);
  divElement = viewChild<ElementRef>('map');
  zoom = signal(10);
  coordinates = signal({lng: -71.06776, lat: 42.35816});


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
      container: element, // container ID
      center: [lng, lat], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: this.zoom() // starting zoom
    });

    this.mapListeners(map);

  }
  
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

    this.map.set(map);
    
  }

}
