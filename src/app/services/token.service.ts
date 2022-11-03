import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import { Preferences } from '@capacitor/preferences';

const BACKEND_URL = environment.BACKEND_API_URL;
const TOKEN_KEY = "AUTH_TOKEN";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private issuer = {
    login: BACKEND_URL+'auth/login',
    register: BACKEND_URL+'auth/register',
  };

  token = '';

  constructor() {}

  handleData(token: any) {
    Preferences.set({
      key: TOKEN_KEY,
      value: token
    });
  }

  getToken() {
    return Preferences.get({key: TOKEN_KEY});
  }

  // Verify the token
  isValidToken() {
    return new Promise<boolean>(((resolve, reject) => {
      this.getToken()
        .then((result) =>{
          const token = result?.value;
          if (token) {
            const payload = this.payload(token);
            this.token = token;
            // console.log(payload);
            if (payload) {
              // console.log(Object.values(this.issuer))
              // console.log(payload.iss)
              // console.log(Object.values(this.issuer).indexOf(payload.iss))
              resolve(Object.values(this.issuer).indexOf(payload.iss) > -1);
            }
          } else {
            resolve(false);
          }
        })
    }));

  }
  payload(token: any) {
    const jwtPayload = token.split('.')[1];
    return JSON.parse(atob(jwtPayload));
  }

  // User state based on valid token
  async isLoggedIn() {
    return await this.isValidToken();
  }

  // Remove token
  removeToken() {
    Preferences.remove({key: TOKEN_KEY});
    // localStorage.removeItem(TOKEN_KEY);
  }

  get currentToken(){
    return this.token;
  }
}
