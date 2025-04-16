import { Component, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent implements OnInit, OnDestroy, AfterViewInit {
  students: any[] = [];
  studentForm: FormGroup;
  private subscriptions = new Subscription();
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage: File | null = null;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.studentForm = this.fb.group({
      studentname: ['', [Validators.required, Validators.minLength(4)]],
      studentdept: ['', Validators.required],
      studentAge: ['', [Validators.required, Validators.min(3), Validators.max(16)]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required],
      studentimage: [''],
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const studentNameInput = document.querySelector('#studentname') as HTMLElement;
      studentNameInput?.focus();
    }
  }

  loadStudents(): void {
    const loadSub = this.studentService.getStudents().subscribe(
      (data) => {
        this.students = data.map((student) => {
          if (student.studentimage && student.studentimage.includes('/uploads')) {
            student.studentimage = 'http://localhost:3000' + student.studentimage;
          }
          return student;
        });
      },
      (error) => console.error('Failed to load students:', error)
    );
    this.subscriptions.add(loadSub);
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/students', id]);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  deleteStudent(id: number): void {
    const deleteSub = this.studentService.deleteStudent(id).subscribe(
      () => this.loadStudents(),
      (error) => console.error('Failed to delete student:', error)
    );
    this.subscriptions.add(deleteSub);
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
      this.selectedImage = file;
    } else {
      console.error('Please select a valid image.');
    }
  }

  logout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token'); 
    localStorage.removeItem('userPassword');
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = new FormData();
      Object.entries(this.studentForm.value).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (this.selectedImage) {
        formData.append('studentimage', this.selectedImage);
      }

      const addSub = this.studentService.addStudent(formData).subscribe(
        () => {
          this.loadStudents();
          this.studentForm.reset();
          this.imagePreview = null;
          this.selectedImage = null;
        },
        (error) => console.error('Error adding student:', error)
      );
      this.subscriptions.add(addSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
