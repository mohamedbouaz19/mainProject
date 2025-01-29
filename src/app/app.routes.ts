import { Routes } from '@angular/router';

import { NotfoundComponent } from './component/notfound/notfound.component';
import { HomeComponent } from './component/home/home.component';
import { RegisterComponent } from './component/register/register.component';

export const routes: Routes = [
    {path:'',redirectTo:'register',pathMatch:'full'},
    {path:'register',component: RegisterComponent,title: 'Register'},
    {path:'home',component: HomeComponent,title: 'Home'},
    {path:'**',component:NotfoundComponent,title:' Not found'}
];