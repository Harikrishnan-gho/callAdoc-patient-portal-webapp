import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { GHOService } from '../../services/ghosrvs';
import { catchError, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-emergency',
  standalone: true, 
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './edit-emergency.html',
  styleUrls: ['./edit-emergency.css'], 
})
export class EditEmergency implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditEmergency>,
  ) {}
     private srv = inject(GHOService);

  name = '';
  phone = '';
  address = '';
  email = '';
  relation = '';

  contactId = '';
  patientId = this.srv.getsession('id');

  ngOnInit(): void {

    console.log('Received Data:', this.data);

    if (this.data) {
      this.contactId = this.data.ID;

      this.name = this.data.FirstName ?? '';
      this.phone = this.data.Phone ?? '';
      this.email = this.data.Email ?? '';
      this.address = this.data.Address1 ?? '';
      this.relation = this.data.Relationship ?? '';
    }
  }


  updateProfile(form: any) {

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!this.contactId) {
      console.error('Contact ID missing');
      return;
    }

    const updatePayload = {
      FirstName: this.name,
      Phone: this.phone,
      Address1: this.address,
      Email: this.email,
      Relationship: this.relation,
    };

    const payload = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: this.contactId },
      { T: 'c1', V: JSON.stringify(updatePayload) },
      { T: 'c10', V: '2' }
    ];

    this.srv.getdata('patientcontact', payload).pipe(

      catchError(err => {
        this.srv.openDialog(
          'Profile',
          'e',
          'Error while updating contact'
        );
        return throwError(() => err);
      })

    ).subscribe(res => {

      if (res.Status === 1) {
        const msg = res.Data[0][0].msg;
        this.srv.openDialog('Profile', 's', msg);
        this.dialogRef.close(true);
      } else {
        console.error('Update failed:', res);
      }
    });
  }

  
  close() {
    this.dialogRef.close(false);
  }
}
