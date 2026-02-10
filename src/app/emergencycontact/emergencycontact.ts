import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomDialog } from '../shared/custom-dialog/custom-dialog';
import { AddEmergencyContact } from './add-emergency-contact/add-emergency-contact';
import { catchError, throwError } from 'rxjs';
import { GHOService } from '../services/ghosrvs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EditEmergency } from './edit-emergency/edit-emergency';


@Component({
  selector: 'app-emergencycontact',
  standalone: true,
  imports: [MatDialogModule, CustomDialog, AddEmergencyContact, CommonModule, MatIcon, MatMenuModule,
    MatIconModule, MatButtonModule],
  templateUrl: './emergencycontact.html',
  styleUrls: ['./emergencycontact.css']
})
export class Emergencycontact implements OnInit {

  showEmergencyContactPopup = false;
  showEditContactPopup = false;

  emergencyContacts: any[] = [];
  patientId: string;
  contactId: string;

  private srv = inject(GHOService);
  tv: { T: string; V: string; }[];
  constructor(private dialog: MatDialog,private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.patientId = this.srv.getsession('id');
    this.getEmergencyContact();
  }

  openEmergencyContact() {
    this.showEmergencyContactPopup = true;
  }
  openEditContact() {
    this.showEmergencyContactPopup = true;
  }

  closeEmergencyContact(refresh = false) {
    this.showEmergencyContactPopup = false;

    if (refresh) {
      this.getEmergencyContact();
    }
  }
  closeEditContact(refresh = false) {
    this.showEmergencyContactPopup = false;

    if (refresh) {
      this.getEmergencyContact();
    }
  }


  // get all emergency contacts
  getEmergencyContact() {
    this.tv = [
      { T: "dk1", V: this.patientId },
      { T: "dk2", V: "0" },
      { T: "c10", V: "3" }
    ];
    this.srv.getdata("patientcontact", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog('Emergency Contacts', "e", 'Error while loading emergency contacts');
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        // this.emergencyContacts = r.Data[0];
        this.emergencyContacts = [...r.Data[0]];
      }
    });

  }
  // add contact
  addEmergencyContact() {
    const dialogRef = this.dialog.open(AddEmergencyContact, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getEmergencyContact();
      }
    }
    );
  }



  // update emergency contacts
editContact(Contacts: any) {
  const dialogRef = this.dialog.open(EditEmergency, {
    width: '600px',
    disableClose: false,
    data: Contacts,
  
  });

  dialogRef.afterClosed().subscribe(result => {
    this.getEmergencyContact();
  });
}


  // delete emergency contacts
  deleteContact(contact: any) {
    if (!contact?.ID) {
      console.error('Contact ID missing');
      return;
    }
    const tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: contact.ID },
      { T: 'c10', V: '4' }
    ];
    this.srv.getdata('patientcontact', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg
          this.srv.openDialog('Medical Records', 's', msg);
          this.getEmergencyContact()
          this.emergencyContacts = this.emergencyContacts.filter(
            c => c.ID !== contact.ID
          );
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  // set as primary contact

  setPrimaryContact(contact: any) {
    if (!contact?.ID) {
      console.error('Contact ID missing');
      return;
    }

    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: contact.ID },
      { T: 'c1', V: '1' },
      { T: 'c10', V: '5' }
    ];

    this.srv.getdata('patientcontact', this.tv)
      .pipe(
        catchError(err => {
          this.srv.openDialog(
            'Emergency Contacts',
            'e',
            'Error while setting primary contact'
          );
          return throwError(() => err);
        })
      )
      .subscribe((r: any) => {
        if (r?.Status === 1) {
          const msg = r?.Data?.[0]?.[0]?.msg ?? 'Contact added successfully';
          this.srv.openDialog('Emergency Contact', 's', msg);
          this.getEmergencyContact()
        } else {
          this.srv.openDialog('Emergency Contact', 'w', r?.Info ?? 'Something went wrong');
        }
      });
  }
}
