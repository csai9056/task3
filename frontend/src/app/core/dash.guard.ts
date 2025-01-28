import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
// import { Router } from 'express';
// Router
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (sessionStorage) {
      if (sessionStorage.getItem('access_token')) {
        this.router.navigateByUrl('/dashboard/dash');
        return false;
      }
    }

    return true;
  }
}
