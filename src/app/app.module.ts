import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomDatePipe } from './custom-date.pipe';
import { HighlightDirective } from './highlight.directive';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AcademicsComponent } from './academics/academics.component';
import { AdmissionsComponent } from './admissions/admissions.component';
import { ContactComponent } from './contact/contact.component';
import { TeachersListComponent } from './teachers-list/teachers-list.component';
import { StudentListComponent } from './student-list/student-list.component';
import { CapitalizePipe } from './capitalize.pipe';
import { StudentDetailsComponent } from './student-detail/student-detail.component'; // add this line

@NgModule({
  declarations: [
    AppComponent,
    StudentListComponent,
    StudentDetailsComponent,
    CapitalizePipe,
    CustomDatePipe,
    HighlightDirective,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    AboutUsComponent,
    AcademicsComponent,
    AdmissionsComponent,
    ContactComponent,
    TeachersListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }