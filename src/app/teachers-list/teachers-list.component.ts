      //C:\my api project\project\src\app\teachers-list\teachers-list.component.ts
      import { Component, OnInit } from '@angular/core';
      import { TeachersService } from '../teachers.service';
      import { ActivatedRoute, Router } from '@angular/router';

      @Component({
        selector: 'app-teachers-list',
        templateUrl: './teachers-list.component.html',
        styleUrls: ['./teachers-list.component.scss']
      })
      export class TeachersListComponent implements OnInit {
        teachers: any[] = [];
        Router: any;

        constructor(  private route: ActivatedRoute,
          private router: Router,
          private teachersService: TeachersService) { }
        
        logout(): void {
          localStorage.removeItem('email');
          localStorage.removeItem('token');
          localStorage.removeItem('encryptedPassword');
          this.Router.navigate(['/login']);
          
        }

        ngOnInit(): void {
          this.teachersService.getTeachers().subscribe(
            (data) => {
              this.teachers = data;
            },
            (error) => {
              console.error('Error fetching teachers data', error);
            }
          );
        }
      }
      