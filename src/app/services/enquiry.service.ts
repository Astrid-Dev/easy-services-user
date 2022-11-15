import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Enquiry } from '../models/Enquiry';

const ENQUIRIES_URL = `${environment.BACKEND_API_URL}enquiries`;
const QUESTIONS_URL = `${environment.BACKEND_API_URL}questions`;
const ANSWERS_URL = `${environment.BACKEND_API_URL}answers`;

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  constructor(private http: HttpClient) { }

  // Questions

  getAServiceQuestions(serviceId: number){
    return new Promise((resolve, reject) =>{
      this.http.get(QUESTIONS_URL+'?service_id='+serviceId)
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

  // Answers

  getAnEnquiryAnswer(enquiryId: number){
    return new Promise((resolve, reject) =>{
      this.http.get(ANSWERS_URL+'?enquiry_id='+enquiryId)
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


  // Enquiries

  getAllUserEnquiries(userId: number, otherParams: string = ''){
    const params = otherParams === '' ? '' : (otherParams);
    return new Promise((resolve, reject) =>{
      this.http.get(ENQUIRIES_URL+'?user_id='+userId+params)
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

  createAnEnquiry(enquiry: Enquiry){
    return new Promise((resolve, reject) =>{
      this.http.post(ENQUIRIES_URL, enquiry)
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

  getAnEnquiryWithCode(requestCode: string)
  {
    return new Promise(((resolve, reject) => {
      if(requestCode === '') {
        reject('No code provide!!!');
      }
      this.http.get(ENQUIRIES_URL+'/'+requestCode+'?is_code=true')
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

  updateAnEnquiry(enquiryId: number, newEnquiryData: any){
    return new Promise((resolve, reject) =>{
      this.http.put(ENQUIRIES_URL+'/'+enquiryId, {...newEnquiryData, is_provider: false})
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

  deleteAnEnquiry(enquiryId: number){
    return new Promise((resolve, reject) =>{
      this.http.delete(ENQUIRIES_URL+'/'+enquiryId)
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
}
