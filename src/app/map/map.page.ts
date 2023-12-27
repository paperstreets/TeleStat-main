import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';



@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit{
  private mymap: L.Map | null;
  private carIcons: any[] = []; // Array of car icons
  private carMarkers: any[] = []; // Array of car markers
  private routeCoordinates: any[][] = [];
  private zones: L.Layer[] = []; // Array of draw zones
  private carZoneEntryTime: { [carIndex: number]: number | undefined } = {};

  private animationStarted: boolean[] = [false, false, false, false, false]; // To prevent multiple animations for each car

  constructor() {
    this.routeCoordinates[0] = [
      [50.4501, 30.5234], // Kyiv
      // ... other intermediate coordinates along the M05
      [50.329378, 30.400118], [50.260871, 30.334178], [50.207286, 30.241481], [50.154999, 30.228916],
      [46.482526, 30.7233095] // Odessa
    ];
    this.routeCoordinates[1] = [
      [50.4501, 30.5234], // Kyiv
      // ... other intermediate coordinates along the M05
      [50.329378, 30.400118], [50.260871, 30.334178], [50.207286, 30.241481], [50.154999, 30.228916],
      [46.482526, 30.7233095] // Odessa
    ];
    this.routeCoordinates[2] = [
      [50.4501, 30.5234], // Kyiv
      // ... other intermediate coordinates along the M05
      [50.329378, 30.400118], [50.260871, 30.334178], [50.207286, 30.241481], [50.154999, 30.228916],
      [46.482526, 30.7233095] // Odessa
    ];
    this.routeCoordinates[3] = [
      [50.4501, 30.5234], // Kyiv
      // ... other intermediate coordinates along the M05
      [50.329378, 30.400118], [50.260871, 30.334178], [50.207286, 30.241481], [50.154999, 30.228916],
      [46.482526, 30.7233095] // Odessa
    ];
    this.routeCoordinates[4] = [
      [50.4501, 30.5234], // Kyiv
      // ... other intermediate coordinates along the M05
      [50.329378, 30.400118], [50.260871, 30.334178], [50.207286, 30.241481], [50.154999, 30.228916],
      [46.482526, 30.7233095] // Odessa
    ];
    // Initialize car icons and markers
    for (let i = 0; i < 5; i++) {
      this.carIcons[i] = L.icon({
        iconUrl: `assets/icon/car1.png`, // Ensure you have car0.png, car1.png, etc.
        iconSize: [32, 32]
      });
    }
    this.mymap = null;
  }

  startAnimation(carIndex: number) {
    if (!this.animationStarted[carIndex]) {
      this.animationStarted[carIndex] = true;
      this.animateCar(carIndex, 0);
    }
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    setTimeout(() => this.initMap(), 300);
  }

  
initMap() {
  this.mymap = L.map('mapid', {
    center: [50.4501, 30.5234],
    zoom: 6,
    
    maxBounds: [
      [44.3866, 22.1372],
      [52.3795, 40.2286]
    ]
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.mymap);

  // Initialize and add car markers
  for (let i = 0; i < 5; i++) {
    if (this.routeCoordinates[i] && this.routeCoordinates[i][0]) {
      this.carMarkers[i] = L.marker(this.routeCoordinates[i][0], {icon: this.carIcons[i]}).addTo(this.mymap);
    }
  }
  
  const drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      circle: false,
      circlemarker: false,
      marker: false,
      rectangle: false,
      polygon: {
        shapeOptions: {
          color: 'red'
        }
      }
    }
  });
  this.mymap.addControl(drawControl);

  this.mymap.on(L.Draw.Event.CREATED, (e: any) => {
    const layer = e.layer;
    this.zones.push(layer);
    if (this.mymap) {
      this.mymap.addLayer(layer);
    }
  });
}

showAlert(message: string) {
  const alertBox = document.getElementById('alertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.classList.add('show');

    setTimeout(() => {
      alertBox.classList.remove('show');
    }, 5000);
  }
}


animateCar(carIndex: number, routeIndex: number) {
  if (routeIndex < this.routeCoordinates[carIndex].length) {
    let nextCoord = this.routeCoordinates[carIndex][routeIndex];
    if (nextCoord) {
      this.carMarkers[carIndex].setLatLng(nextCoord);
      
   // Перевірка на перетин з кожною зоною
   this.zones.forEach(zone => {
    if ('getBounds' in zone) {
      const bounds = (zone as L.Polygon | L.Rectangle).getBounds();
      if (bounds.contains(nextCoord)) {
        if (this.carZoneEntryTime[carIndex] === undefined) { // Якщо авто тільки що увійшло в зону
          this.carZoneEntryTime[carIndex] = Date.now();
          this.showAlert(`Авто ${carIndex} увійшло в зону!`);
        }
      } else {
        if (this.carZoneEntryTime[carIndex] !== undefined) { // Якщо авто зараз покидає зону
          const entryTime = this.carZoneEntryTime[carIndex];
          if (entryTime !== undefined) { // Додаткова перевірка перед обчисленням
            const timeInZone = Date.now() - entryTime;
            this.showAlert(`Авто ${carIndex} провело в зоні ${timeInZone / 1000} хвилин`);
            this.carZoneEntryTime[carIndex] = undefined;
          }
        }
      }
    }
  })

      routeIndex++;
      setTimeout(() => {
        this.animateCar(carIndex, routeIndex);
      }, 1000 + 200 * carIndex);
    }
  }
}
}
