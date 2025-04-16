import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface Student {
  studentid: number;
  studentname: string;
  studentdept: string;
  departmentvalue: number; 
}

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss']
})
export class AcademicsComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.subscription.add(
      this.http.get<Student[]>('http://localhost:3000/students-with-department').subscribe(data => {
        this.students = data;
      }, err => {
        console.error('Failed to fetch students', err);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }   
} 