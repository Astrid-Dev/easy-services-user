import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Service} from "../models/Service";

const SERVICES_URL = `${environment.BACKEND_API_URL}services`;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  hasLoadedServices: boolean = false;
  services: Service[] = [];

  constructor(private http: HttpClient) { }

  getAllServices(retrieveAll: boolean = true, includeTotals: boolean = true){
    return new Promise((resolve, reject) =>{
      if(this.hasLoadedServices){
        resolve(this.services);
      }
      else{
        this.http.get(SERVICES_URL+'?retrieve_all='+retrieveAll + ('&show_totals='+includeTotals))
          .subscribe({
            next: (res: any) =>{
              this.services = res;
              this.syncChildAndParentServices();
              this.hasLoadedServices = true;
              resolve(res);
            },
            error: (err) =>{
              this.hasLoadedServices = false;
              reject(err);
            }
          });
      }
    });
  }

  getOneService(serviceId: number){
    let service = this.services.find(elt => elt.id === serviceId);
    return new Promise((resolve, reject) =>{
      if(service){
        resolve(service);
      }
      else{
        this.http.get(SERVICES_URL+'/'+serviceId)
          .subscribe({
            next: (res) =>{
              resolve(res);
            },
            error: (err) =>{
              reject(err);
            }
          });
      }
    });
  }

  updateAServiceTotal(serviceId: number, newTotal: number){
    this.services.forEach((elt, index, array) =>{
      if(elt.id === serviceId){
        array[index] = {
          ...elt,
          total: newTotal
        }
      }
    });
    this.syncChildAndParentServices();
  }

  private syncChildAndParentServices(){
    this.services.forEach((elt, index, array) =>{
      if(!elt.parent_id){
        let temp = this.services.filter(child => child.parent_id === elt.id).map(child => child.total ?? 0);
        let total = 0;
        temp.forEach((elt) =>{
          total += elt;
        });
        array[index] = {
          ...elt,
          total: total
        }
      }
    });
  }
}
