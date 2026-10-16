import { AfterViewInit, Component, effect, ElementRef, EventEmitter, input, Output, signal, viewChild } from '@angular/core';
import type mapboxglType from 'mapbox-gl';
import { MapboxSearchBox } from '@mapbox/search-js-web';
import { environment } from '../../../../environments/environment.development';
import { Coordinate, LocationDetail } from '../../../pages/fullscreen-map-page/fullscreen-map-page';

declare const mapboxgl: typeof mapboxglType;

@Component({
  imports: [],
  selector: 'search-box',
  styleUrl: './search-box.css',
  templateUrl: './search-box.html',
})
export class SearchBox implements AfterViewInit {

  map = input<mapboxgl.Map|null>();
  placeholder = input<string>();
  color = input<{color: string}>();
  @Output() locationDetail = new EventEmitter<LocationDetail>();
  @Output() clear = new EventEmitter<string>();
  searchBoxDiv = viewChild.required<ElementRef<HTMLDivElement>>('searchBoxDiv');
  private searchBox?: MapboxSearchBox;
  private selectedLocationId?: string;

  mapBindingEffect = effect(() => {
    const map = this.map();
    if (this.searchBox && map) {
      this.searchBox.bindMap(map);
    }
  });

  setLocationDetail(info: any){
    const longitude = info?.features[0].geometry.coordinates[0];
    const latitude = info?.features[0].geometry.coordinates[1];
    const locationId = String(
      info?.features[0].properties?.mapbox_id
      ?? info?.features[0].id
      ?? `${longitude},${latitude}`
    );

    this.selectedLocationId = locationId;

    this.locationDetail.emit({
      id: locationId,
      name: info.features[0].properties.name,
      address: info?.features[0].properties.full_address,
      coordinates: {
        lng: longitude,
        lat: latitude
      },
      categories: info?.features[0].properties.poi_category
    });
  }

  ngAfterViewInit(): void {
    const searchBox = new MapboxSearchBox();
    this.searchBox = searchBox;
    searchBox.accessToken = environment.mapboxKey;
    searchBox.mapboxgl = mapboxgl;
    searchBox.marker = this.color() ?? { color: 'blue' };
    searchBox.options = {
      language: 'es',
      country: 'PE',
    }

    searchBox.placeholder = this.placeholder() ?? 'Buscar ubicación...';

    const map = this.map();

    if (map) {
      searchBox.bindMap(map);
    }

    searchBox.addEventListener('retrieve', (event) => {

      const result = event.detail;

      const longitude = result?.features[0].geometry.coordinates[0];
      const latitude = result?.features[0].geometry.coordinates[1];

      this.setLocationDetail(result);

      const coordinates = {
        lng: longitude,
        lat: latitude
      };

    });

    searchBox.addEventListener('clear', () => {
      if (!this.selectedLocationId) {
        return;
      }

      this.clear.emit(this.selectedLocationId);
      this.selectedLocationId = undefined;
    });

    this.searchBoxDiv().nativeElement.appendChild(searchBox as unknown as Node);

  }
}
