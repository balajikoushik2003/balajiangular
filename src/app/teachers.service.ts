import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeachersService {
  private apiUrl = 'http://localhost:3000/teachers';

  constructor(private http: HttpClient) { }

  getTeachers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}