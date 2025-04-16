  import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { HomeComponent } from './home/home.component';
  import { LoginComponent } from './login/login.component';
  import { RegisterComponent } from './register/register.component';
  import { StudentListComponent } from './student-list/student-list.component';
  import { TeachersListComponent } from './teachers-list/teachers-list.component';
  import { StudentDetailsComponent } from './student-detail/student-detail.component';
  import { AboutUsComponent } from './about-us/about-us.component';
  import { AcademicsComponent } from './academics/academics.component';
  import { AdmissionsComponent } from './admissions/admissions.component';
  import { ContactComponent } from './contact/contact.component';
  import { AuthGuard } from './auth.guard';  

  const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'teachers', component: TeachersListComponent, canActivate: [AuthGuard] },  
    { path: 'students', component: StudentListComponent, canActivate: [AuthGuard] },  
    { path: 'students/:studentid', component: StudentDetailsComponent, canActivate: [AuthGuard] },
    { path: 'about', component: AboutUsComponent },
    { path: 'academics', component: AcademicsComponent },
    { path: 'admissions', component: AdmissionsComponent },
    { path: 'contact', component: ContactComponent },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
  ];


  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { } 
