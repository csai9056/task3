import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { ResetComponent } from './components/reset/reset.component';
import { DashGuard } from 'src/app/core/dash.guard';

const routes: Routes = [
  { path: 'signup', component: SignupComponent, canActivate: [DashGuard] },
  { path: 'login', component: LoginComponent, canActivate: [DashGuard] },
  { path: 'forgot', component: ForgotComponent, canActivate: [DashGuard] },
  { path: 'reset/:id', component: ResetComponent, canActivate: [DashGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
