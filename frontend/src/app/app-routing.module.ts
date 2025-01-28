import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { AuthsGuard } from './core/guard/auths.guard';
import { DashGuard } from './core/dash.guard';
// import { CanActivate } from '@angular/router';
// import canActivate from './core/guard/auths.guard'
const routes: Routes = [
  { path: '', redirectTo: 'auth/signup', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.model').then((m) => m.AuthModule),
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboards/dashboard.module').then(
        (m) => m.DashBoardModule
      ),
    canActivate: [AuthsGuard],
  },
  {
    path: '**',
    redirectTo: 'auth/signup',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
