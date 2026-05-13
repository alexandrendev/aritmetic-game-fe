import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { HomePageComponent } from './features/home/home-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { LoginPageComponent } from './features/auth/login-page.component';
import { RegisterPageComponent } from './features/auth/register-page.component';
import { CreateGameComponent } from './features/game-session/create-game.component';
import { JoinGameComponent } from './features/game-session/join-game.component';
import { GuestProfileComponent } from './features/game-session/guest-profile.component';
import { LobbyComponent } from './features/game-session/lobby.component';
import { GameBoardComponent } from './features/game-session/game-board.component';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: HomePageComponent
	},
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
		path: 'create-game',
		component: CreateGameComponent,
		canActivate: [authGuard]
	},
	{
		path: 'join-game',
		component: JoinGameComponent,
		canActivate: [authGuard]
	},
	{
		path: 'guest-profile',
		component: GuestProfileComponent
	},
	{
		path: 'lobby/:id',
		component: LobbyComponent
	},
	{
		path: 'game/:id',
		component: GameBoardComponent
	},
	{
		path: '**',
		redirectTo: ''
	}
];
