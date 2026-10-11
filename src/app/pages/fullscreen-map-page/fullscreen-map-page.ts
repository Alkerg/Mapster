import { AfterViewInit, Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { MapboxSearchBox } from '@mapbox/search-js-web';
import { environment } from '../../../environments/environment';
import { DecimalPipe, JsonPipe, TitleCasePipe } from '@angular/common';

declare const mapboxgl: typeof mapboxglType;
mapboxgl.accessToken = environment.mapboxKey;

interface LocationDetail {
  name: string;
  address?: string;
  coordinates: { lng: number; lat: number };
  categories?: string[];
}

@Component({
  imports: [DecimalPipe, JsonPipe, TitleCasePipe],
  selector: 'app-fullscreen-map-page',
  templateUrl: './fullscreen-map-page.html',
  styleUrl: './fullscreen-map-page.css'
})
export class FullscreenMapPage implements AfterViewInit {

  map = signal<mapboxgl.Map|null>(null);
  divElement = viewChild<ElementRef>('map');
  searchBoxContainer = viewChild<ElementRef>('searchBoxContainer');
  locationDetailContainer = viewChild<ElementRef>('locationDetailContainer');

  zoom = signal(10);
  coordinates = signal({lng: -77.0098, lat: -12.0300});
  locationDetail = signal<LocationDetail|null>(null);

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

    // Search Box Control configuration
    const searchBox = new MapboxSearchBox();
    searchBox.accessToken = environment.mapboxKey;
    searchBox.mapboxgl = mapboxgl;
    searchBox.marker = true;
    searchBox.options = {
      language: 'es',
      country: 'PE',
    }
    searchBox.placeholder = 'Buscar ubicación...';
    searchBox.bindMap(map)

    searchBox.addEventListener('retrieve', (event) => {

      // Show detail panel
      this.locationDetailContainer()?.nativeElement.classList.add('active');

      const result = event.detail;
      console.log('Search result:', result);
      this.locationDetail.set({

        name: result.features[0].properties.name,
        address: result?.features[0].properties.full_address,
        coordinates: {
          lng: result?.features[0].geometry.coordinates[0],
          lat: result?.features[0].geometry.coordinates[1]
        },
        categories: result?.features[0].properties.poi_category

      })
    });

    searchBox.addEventListener('clear', () => {
      // Hide detail panel
      this.locationDetailContainer()?.nativeElement.classList.remove('active');
      this.locationDetail.set(null);
    });

    this.searchBoxContainer()?.nativeElement.appendChild(searchBox);

    //map.addControl(searchBox, 'top-left');

    this.map.set(map);
    
  }

}
