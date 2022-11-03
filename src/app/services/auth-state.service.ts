import { Injectable } from '@angular/core'
import {BehaviorSubject} from "rxjs";
import {TokenService} from "./token.service";
import { Preferences } from '@capacitor/preferences';
import {User} from "../models/User";

const USER_DATA_KEY = "USER_DATA";

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private userState = null;

  userAuthState = null;

  constructor(public token: TokenService) {
    this.token.isLoggedIn()
      .then((res) =>{
        this.userState = new BehaviorSubject(res!);
        this.userAuthState = this.userState.asObservable()
      })
      .catch((err) =>{
        this.userState = new BehaviorSubject(false);
        this.userAuthState = this.userState.asObservable();
      });
  }
  setAuthState(value: any) {
    this.userState.next(value);
  }

  setUserData(value: User)
  {
    Preferences.set({
      key: USER_DATA_KEY,
      value: JSON.stringify(value),
    });
  }

  getUserData()
  {
    return new Promise<User>((resolve, reject) => {
      Preferences.get({key: USER_DATA_KEY})
        .then((data: any) =>{
          if(!data?.value){
            reject("no user found !");
          }
          resolve(JSON.parse(data.value));
        })
        .catch((err) =>{
          reject(err);
        });
    })
  }
}
