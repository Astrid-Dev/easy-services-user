import { Injectable } from '@angular/core';
import {Geolocation, PermissionStatus, Position} from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}

  getCurrentLocation() {
    return new Promise<Position>((resolve, reject) =>{
      Geolocation.getCurrentPosition({enableHighAccuracy: true})
        .then((coordinates) => {
          resolve(coordinates);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  requestLocationPermission() {
    return new Promise<PermissionStatus>((resolve, reject) =>{
      Geolocation.requestPermissions()
        .then((status) => {
          resolve(status);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  checkLocationPermission(){
    return new Promise<PermissionStatus>((resolve, reject) =>{
      Geolocation.checkPermissions()
        .then((status) => {
          resolve(status);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
