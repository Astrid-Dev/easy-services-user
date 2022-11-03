import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

const SERVICE_PROVIDERS_URL = `${environment.BACKEND_API_URL}service_providers`;
const SERVICE_PROVIDER_APPLICATIONS_URL = `${environment.BACKEND_API_URL}service_provider_applications`;
const SERVICE_PROVIDER_REQUESTS_URL = `${environment.BACKEND_API_URL}enquiries`;
const SERVICE_PROVIDER_STATISTICS_URL = `${environment.BACKEND_API_URL}statistics`;

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  //service provider

  registerAServiceProvider(user_id: number, services: number[]){
    return new Promise((resolve, reject) => {
      let data = {
        user_id: user_id,
        services: services.join(',')
      }
      this.http.post(SERVICE_PROVIDERS_URL, data)
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    });
  }

  getAServiceProviderStatistics(service_provider_id: number){
    return new Promise(((resolve, reject) => {
      this.http.get(SERVICE_PROVIDER_STATISTICS_URL+'?service_provider_id='+service_provider_id)
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    }));
  }


  //service provider applications
  registerAServiceProviderApplications(service_provider_id: number, services: number[]){
    return new Promise((resolve, reject) => {
      let data = {
        service_provider_id: service_provider_id,
        services: services.join(',')
      }
      this.http.post(SERVICE_PROVIDER_APPLICATIONS_URL, data)
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    });
  }

  //requests

  getAServiceProviderRequests(service_provider_id: number, params: {key: string, value: string | number}[] = null){

    let requestParams = '?service_provider_id=' + service_provider_id;
    if(params){
      params.forEach((elt) =>{
        requestParams += '&'+elt.key+'='+elt.value;
      });
    }
    return new Promise(((resolve, reject) => {
      this.http.get(SERVICE_PROVIDER_REQUESTS_URL+requestParams)
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    }));
  }

  getARequestWithCode(requestCode: string)
  {
    return new Promise(((resolve, reject) => {
      if(requestCode === '') {
        reject('No code provide!!!');
      }
      this.http.get(SERVICE_PROVIDER_REQUESTS_URL+'/'+requestCode+'?is_code=true')
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    }));
  }

  updateARequest(requestId: number, newRequestData: any)
  {
    return new Promise(((resolve, reject) => {
      this.http.put(SERVICE_PROVIDER_REQUESTS_URL+'/'+requestId, {...newRequestData, is_provider: true})
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        });
    }));
  }

}
