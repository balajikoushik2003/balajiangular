import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../student.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
})
export class StudentDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  studentForm!: FormGroup;
  studentId: number | null = null;
  private routeSub!: Subscription;
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.routeSub = this.route.params.subscribe((params) => {
      this.studentId = params['studentid'] ? Number(params['studentid']) : null;
      if (this.studentId) this.loadStudentData();
    });
  }

  ngAfterViewInit(): void {
    console.log('StudentDetailsComponent view initialized!');
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      studentname: ['', [Validators.required, Validators.minLength(4)]],
      studentdept: ['', Validators.required],
      studentAge: ['', [Validators.required, Validators.min(3), Validators.max(16)]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required],
      studentimage: [''],
      phones: this.fb.array([]),
    });
  }

  get phones(): FormArray {
    return this.studentForm.get('phones') as FormArray;
  }

  createPhoneFormGroup(): FormGroup {
    return this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  loadStudentData(): void {
    if (this.studentId !== null) {
      this.studentService.getStudentById(this.studentId).subscribe({
        next: (data: any) => {
          data.date = new Date(data.date).toISOString().split('T')[0];

          if (data.studentimage?.includes('/uploads/')) {
            data.studentimage = 'http://localhost:3000' + data.studentimage;
          }
          this.studentForm.patchValue({
            studentname: data.studentname,
            studentdept: data.studentdept,
            studentAge: data.studentAge,
            mobile: data.mobile,
            email: data.email,
            date: data.date,
            studentimage: data.studentimage,
          });
          this.imagePreview = data.studentimage;

          const phonesArray = this.phones;
          phonesArray.clear();
          ['phone1', 'phone2'].forEach((phoneKey) => {
            if (data[phoneKey]) {
              const phoneGroup = this.createPhoneFormGroup();
              phoneGroup.patchValue({ mobile: data[phoneKey] });
              phonesArray.push(phoneGroup);
            }
          });
        },
        error: (error: any) => {
          console.error('Failed to fetch student data', error);
          alert('Error loading student data. Please try again later.');
        },
      });
    }
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

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = new FormData();
      Object.entries(this.studentForm.value).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (this.selectedImage) {
        formData.append('studentimage', this.selectedImage);
      }

      const request = this.studentId
        ? this.studentService.updateStudent(this.studentId, formData)
        : this.studentService.addStudent(formData);

      request.subscribe({
        next: () => {
          alert('Student information saved successfully!');
          this.router.navigate(['/students']);
        },
        error: (error: any) => {
          console.error('Failed to save student data', error);
          alert(`Error saving student data: ${error.error?.message || 'Unknown error occurred.'}`);
        },
      });
    } else {
      alert('Please fill out the form correctly before submitting.');
    }
  }

  logout(): void {
    localStorage.removeItem('userEmail'); 
    localStorage.removeItem('token');
    localStorage.removeItem('userPassword');
  
    this.router.navigate(['/login']).then(() => {
      location.reload();
    });
  }
  

  navigateToStudentList(): void {
    this.router.navigate(['/students']);
  }

  ngOnDestroy(): void {
    console.log('StudentDetailsComponent is being destroyed');
    this.routeSub?.unsubscribe();
  }
}
