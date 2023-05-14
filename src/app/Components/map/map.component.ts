import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill } from 'ol/style';
import { transform } from 'ol/proj.js';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';

import { GravesService } from 'src/app/Services/graves.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  map!: Map;
  expiredGravesClicked: boolean = false;
  expiredGravesStyle!: Style;
  gravesLayer: any;

  constructor(private gravesService: GravesService) {}

  ngOnInit(): void {
    this.initializeMap();
    this.loadPolygonData();
  }

  initializeMap(): void {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map',
      view: new View({
        center: transform([3.47662, 45.27958], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12,
        maxZoom: 18,
      }),
    });
  }

  loadPolygonData(): void {
    this.gravesService.getGravesData().subscribe((data) => {
      console.log(data);
      const format = new GeoJSON();
      const features = format.readFeatures(data, {
        featureProjection: 'EPSG:4326', // Desired projection for displaying features on the map
      });

      const source = new VectorSource({
        features: features,
      });

      // const vectorLayer = new VectorLayer({
      //   source: source,
      // });

      this.gravesLayer = new VectorLayer({
        source: source,
      });

      this.map.addLayer(this.gravesLayer);
    });
  }

  handleExpiredGravesButtonClick() {
    this.expiredGravesClicked = true;

    // Create the style for expired graves
    this.expiredGravesStyle = new Style({
      fill: new Fill({ color: 'red' }),
    });

    // Get the features from the graves layer's source
    const features = this.gravesLayer.getSource().getFeatures();

    // Iterate over the features and set the style for expired graves
    for (const feature of features) {
      if (this.isGraveExpired(feature)) {
        feature.setStyle(this.expiredGravesStyle);
      }
    }
  }

  isGraveExpired(feature: Feature): boolean {
    const nutzungsfristende = new Date(feature.get('nutzungsfristende'));
    const today = new Date();
    return nutzungsfristende < today;
  }

  handleGravePlotsButtonClick(): void {
    const gravesWithDeceasedStyle = new Style({
      fill: new Fill({ color: 'green' }),
    });

    // Set the style for each feature based on the presence of deceased persons
    this.gravesLayer.setStyle((feature: Feature) => {
      if (this.hasDeceasedPersons(feature)) {
        return gravesWithDeceasedStyle;
      } else {
        return null;
      }
    });
  }

  hasDeceasedPersons(feature: Feature): boolean {
    const verstorbene = feature.get('verstorbene');
    return verstorbene !== null && verstorbene !== undefined;
  }
}
