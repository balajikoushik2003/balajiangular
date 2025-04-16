  import { Component } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { HttpClient } from '@angular/common/http';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
  })
  export class RegisterComponent {
    registerForm: FormGroup;

    constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
      this.registerForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
      });
    }

    onSubmit(): void {
      if (this.registerForm.valid) {
        this.http.post('http://localhost:3000/register', this.registerForm.value).subscribe({
          next: (response: any) => {
            alert(response.message);
            this.router.navigate(['/']); 
          },
          error: (error) => {
            console.error('Registration Error:', error); 
            alert(error.error?.error || 'Registration Failed');
          },
        });
      }
    }
  }