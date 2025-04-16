import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as crypto from 'crypto-js'; 
import { of, throwError } from 'rxjs';  
import { catchError } from 'rxjs/operators';  

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('token');
    }
  }
  private hashPassword(password: string): string {
    return crypto.SHA256(password).toString(crypto.enc.Base64); 
  }
  login(email: string, password: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = true;
      const token = 'mocked_user_token';  
      const hashedPassword = this.hashPassword(password);
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', hashedPassword);
      return of({ message: 'Login successful', token: token }).pipe(
        catchError(err => throwError(() => new Error('Login failed. Please try again later.')))
      );
    }
    return throwError(() => new Error('Login failed. Platform error.'));
  }
  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
  validateCredentials(email: string, password: string): boolean {
    const storedEmail = localStorage.getItem('userEmail');
    const storedHashedPassword = localStorage.getItem('userPassword');

    if (!storedEmail || !storedHashedPassword) {
      return false;
    }
    const hashedPassword = this.hashPassword(password);
    return storedEmail === email && storedHashedPassword === hashedPassword;
  }
}
