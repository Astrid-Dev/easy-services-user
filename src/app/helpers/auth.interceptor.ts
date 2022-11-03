import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { TokenService } from "../services/token.service";
import {from, lastValueFrom } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // const accessToken = this.tokenService.currentToken;
    //
    // req = req.clone({
    //   setHeaders: {
    //     Authorization: "Bearer " + accessToken
    //   }
    // });
    // return next.handle(req);

    return from(this.handle(req, next));

  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    let token = await this.tokenService.getToken();

    const authReq = req.clone({
      setHeaders: {
        Authorization: "Bearer " + token?.value
      }
    })

    return await lastValueFrom(next.handle(authReq));
  }
}
