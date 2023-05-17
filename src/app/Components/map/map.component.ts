import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';
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
  gravePlotsClicked: boolean = false;
  gravesLayer: any;
  showLoader!: boolean;

  constructor(private gravesService: GravesService) {}

  ngOnInit(): void {
    this.initializeMap();
    this.loadPolygonData();
  }

  //* Initialization of openlayers map with WGS48 projection transformation
  initializeMap(): void {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map',
      view: new View({
        center: transform([3.47662, 45.27958], 'EPSG:4326', 'EPSG:3857'), //! Center the map and projection conversion
        zoom: 12,
        maxZoom: 22,
      }),
    });
  }

  //* Loading the graves data from API through grave service
  loadPolygonData(): void {
    this.showLoader = true;
    this.gravesService.getGravesData().subscribe((gravesData) => {
      this.showLoader = false;
      console.log(gravesData);
      const format = new GeoJSON();
      const features = format.readFeatures(gravesData, {
        featureProjection: 'EPSG:4326', //! Desired projection for displaying features on the map
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

  //* Toggle button to show the expired graves
  handleExpiredGravesButtonClick() {
    this.expiredGravesClicked = !this.expiredGravesClicked;

    if (this.expiredGravesClicked) {
      // Create the style for expired graves
      this.expiredGravesStyle = new Style({
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'black' }),
      });

      // Get the features from the graves layer's source
      const features = this.gravesLayer.getSource().getFeatures();

      // Iterate over the features and set the style for expired graves
      for (const feature of features) {
        if (this.isGraveExpired(feature)) {
          feature.setStyle(this.expiredGravesStyle);
        }
      }
    } else {
      // Reset the style of all features to null
      const features = this.gravesLayer.getSource().getFeatures();
      for (const feature of features) {
        feature.setStyle(null);
      }
    }
  }

  //* Condition getting the expired graves wrt current date
  isGraveExpired(feature: Feature): boolean {
    const nutzungsfristende = new Date(feature.get('nutzungsfristende'));
    const today = new Date();
    return nutzungsfristende < today;
  }

  //* Handling grave plots with atleast one deceased person with color green
  handleGravePlotsButtonClick(): void {
    this.gravePlotsClicked = !this.gravePlotsClicked;

    if (this.gravePlotsClicked) {
      const gravesWithDeceasedStyle = new Style({
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'black' }),
      });

      // Set the style for each feature based on the presence of deceased persons
      this.gravesLayer.setStyle((feature: Feature) => {
        //console.log(feature);
        if (this.hasDeceasedPersons(feature)) {
          return gravesWithDeceasedStyle;
        } else {
          return new Style({
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color: 'blue' }),
          });
        }
      });
    } else {
      // Reset the style of all features by creating a new layer with the default style
      const defaultStyle = new Style({
        fill: new Fill({ color: 'white' }),
        stroke: new Stroke({ color: 'blue' }),
      });

      const source = this.gravesLayer.getSource();
      const newGravesLayer = new VectorLayer({
        source: source,
        style: defaultStyle,
      });

      // Replace the existing layer on the map with the new layer
      this.map.removeLayer(this.gravesLayer);
      this.map.addLayer(newGravesLayer);
      this.gravesLayer = newGravesLayer;
    }
  }

  //* checking the grave plots with no deceased person
  hasDeceasedPersons(feature: Feature): boolean {
    const verstorbene = feature.get('verstorbene');
    return verstorbene !== null && verstorbene !== undefined;
  }
}
