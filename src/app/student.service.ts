  //C:\my api project\project\src\app\student.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class StudentService {
    private apiUrl = 'http://localhost:3000/students';

    constructor(private http: HttpClient) { }

    getStudents(): Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl);
    }
    
    getStudentById(studentId: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${studentId}`);
    }

    addStudent(studentData: FormData): Observable<any> {
      return this.http.post<any>(this.apiUrl, studentData);
    }

    updateStudent(studentId: number, studentData: FormData): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${studentId}`, studentData);
    }

    deleteStudent(studentId: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/${studentId}`);
    }
  }