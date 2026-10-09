import { AfterViewInit, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { DecimalPipe, JsonPipe } from '@angular/common';

declare const mapboxgl: typeof mapboxglType;
mapboxgl.accessToken = environment.mapboxKey;

@Component({
  imports: [],
  selector: 'app-mini-map',
  templateUrl: './mini-map.html',
  styles: `
  
    div {
      width: 100%;
      height: 260px;
    }
  
  `
})
export class MiniMap implements AfterViewInit {

  map = signal<mapboxgl.Map|null>(null);
  divElement = viewChild<ElementRef>('map');

  lngLat = input.required<{lng: number, lat: number}>()
  zoom = input<number>();


  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

      await new Promise( resolve => setTimeout(resolve, 80));

      const element = this.divElement()!.nativeElement;

      const map = new mapboxgl.Map({
        container: element, // container ID
        center: this.lngLat(), // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: this.zoom(), // starting zoom
        interactive: false,
        pitch: 30
      });

        new mapboxgl.Marker().setLngLat(this.lngLat()).addTo(map);

  }


}
