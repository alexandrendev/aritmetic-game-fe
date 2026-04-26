import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { LoginPageComponent } from './features/auth/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page.component';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginPageComponent,
		canActivate: [guestGuard]
	},
	{
		path: 'register',
		component: RegisterPageComponent,
		canActivate: [guestGuard]
	},
	{
		path: 'dashboard',
		component: DashboardPageComponent,
		canActivate: [authGuard]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
