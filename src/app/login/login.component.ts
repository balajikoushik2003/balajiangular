import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      this.http.post('http://localhost:3000/login', { email, password }).subscribe({
        next: (response: any) => {
          if (response.message && response.token) {
            alert(response.message);
            const encryptedPassword = CryptoJS.AES.encrypt(password, 'your-secret-key').toString();
            localStorage.setItem('encryptedPassword', encryptedPassword);
            localStorage.setItem('email', email);
            sessionStorage.setItem('token', response.token);
            sessionStorage.setItem('encryptedPassword', encryptedPassword);
            sessionStorage.setItem('email', email)
            localStorage.setItem('token', response.token);
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigateByUrl(returnUrl);
          } else {
            this.errorMessage = 'Unexpected response from the server. Please try again.';
          }
        },
        error: (error) => {
          alert(error.error?.error || 'Invalid login');

          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Invalid login. Please try again.';
        },
      });
    }
  }
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
