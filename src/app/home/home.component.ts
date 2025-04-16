import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private router: Router) {}


  navigateToStudentList(): void {
    this.router.navigate(['/students']);
  }
  navigateToTeachersList(): void {
    this.router.navigate(['/teachers']);
  }

  navigateToStudentDetails(studentId: number): void {
    this.router.navigate([`/students/${studentId}`]);
  }
}
