import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {GoogleMap} from "@capacitor/google-maps";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-enquiry-map-location',
  templateUrl: './enquiry-map-location.component.html',
  styleUrls: ['./enquiry-map-location.component.scss'],
})
export class EnquiryMapLocationComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  @ViewChild('map') mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap;

  ngOnInit() {

  }

  ionViewDidEnter(){
    this.createMap();
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'my-cool-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.GOOGLE_MAPS_API_KEY,
      config: {
        center: {
          lat: 33.6,
          lng: -117.9,
        },
        zoom: 8,
      },
    });
  }

}
