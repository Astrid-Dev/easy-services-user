import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { PushNotificationsService } from "../services/push-notifications.service";
@Injectable()
export class FcmTokenInterceptor implements HttpInterceptor {
  constructor(private pushNotificationsService: PushNotificationsService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const deviceToken = this.pushNotificationsService.deviceToken;
    if(deviceToken)
    {
      req = req.clone({
        setParams: {
          device_token: deviceToken
        }
      });
    }
    return next.handle(req);
  }
}
