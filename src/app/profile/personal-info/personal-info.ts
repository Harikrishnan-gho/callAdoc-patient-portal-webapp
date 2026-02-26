import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { GHOService } from '../../services/ghosrvs';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioGroup,
    MatRadioButton
  ],
  templateUrl: './personal-info.html',
  styleUrls: ['./personal-info.css'], 
})
export class PersonalInfo implements OnInit {

  private router = inject(Router);
  private srv = inject(GHOService);

  name = '';
  phone = '';
  gender = '';
  bloodGroup = '';
  dob = '';
  maritalStatus = '';
  job = '';
  address = '';
  photo = '';
  email = '';

  defaultImage =
    'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg';

  previewImage: string | ArrayBuffer | null = null;

  patientId = this.srv.getsession('id');
  tv: { T: string; V: string }[] = [];


  ngOnInit(): void {
    this.getDetails();
  }

  account() {
    this.router.navigate(['profile']);
  }

  getDetails() {
    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'c10', V: '3' }
    ];

    this.srv.getdata('patient', this.tv).pipe(
      catchError(err => {
        this.srv.openDialog(
          'Personal Info',
          'e',
          'Error while loading personal details'
        );
        return throwError(() => err);
      })
    ).subscribe(r => {
      if (r.Status === 1 && r.Data?.length) {
        const details = r.Data[0][0];

        this.name = details.FirstName ?? '';
        this.phone = details.Phone ?? '';
        this.gender = (details.Gender ?? '').toLowerCase();
        this.bloodGroup = details.BloodGroup ?? '';
        this.dob = details.DOB ?? '';
        this.maritalStatus = details.MaritalStatus ?? '';
        this.job = details.Occupation ?? '';
        this.address = details.Address ?? '';
        this.photo = details._url || this.defaultImage;
        this.email = details.Email ?? '';
      }
    });
  }

  updateProfile() {
    
    const updatePayload = {
      FirstName: this.name,
      Phone: this.phone,
      Gender: this.gender
        ? this.gender.charAt(0).toUpperCase() + this.gender.slice(1)
        : '',
      BirthDate: this.dob ? this.dob : null,
      BloodGroup: this.bloodGroup,
      Occupation: this.job,
      MaritalStatus: this.maritalStatus,
      Address: this.address,
      City: '',
      State: ''
    };
    // const updatePayload = {
    //   FirstName: this.name,
    //   Phone: this.phone,
    //   Gender: this.gender
    //     ? this.gender.charAt(0).toUpperCase() + this.gender.slice(1)
    //     : '',
    //   BirthDate: this.dob ? this.dob : null,
    //   BloodGroup: this.bloodGroup,
    //   Occupation: this.job,
    //   MaritalStatus: this.maritalStatus,
    //   Address: this.address,
    //   City: '',
    //   State: ''
    // };

    const payload = [
      { T: 'dk1', V: this.patientId },
      { T: 'c1', V: JSON.stringify(updatePayload) },
      { T: 'c10', V: '2' }
    ];

    this.srv.getdata('patient', payload).pipe(
      catchError(err => {
        this.srv.openDialog(
          'Profile',
          'e',
          'Error while saving profile'
        );
        return throwError(() => err);
      })
    ).subscribe(res => {
      if (res.Status === 1) {
        const msg = res.Data[0][0].msg;
        this.srv.openDialog('Profile', 's', msg);
      } else {
        console.error('Update failed:', res);
      }
    });
  }
}