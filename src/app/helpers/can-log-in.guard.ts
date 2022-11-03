import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthStateService} from "../services/auth-state.service";
import {Injectable} from "@angular/core";
import {TokenService} from "../services/token.service";

@Injectable({
  providedIn: 'root'
})
export class CanLogInGuard implements CanActivate{
  constructor(private authState: AuthStateService, private token: TokenService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
                    state: RouterStateSnapshot):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.token.isLoggedIn()
        .then((res) =>{
          if(res)
          {
            this.router.navigate(["home"])
          }
          resolve(!res);
        })
        .catch((err) =>{
          resolve(false);
          console.error(err);
        })
    })
  }
}
