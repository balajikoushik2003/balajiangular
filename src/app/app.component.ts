import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showLogoutButton = false;
  todayDate: Date = new Date();
  sampleText: string = 'type here';
  isLoggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showLogoutButton = !(this.router.url.includes('/home') || this.router.url.includes('/login') || this.router.url.includes('/register'));
    });
  }

  navigateToLogin(): void {
    this.isLoggedIn = false;
    this.router.navigate(['']);
  }

  loginUser(): void {
    this.isLoggedIn = true;
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
  updateSampleText(): void {
    this.sampleText = 'Good';
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
