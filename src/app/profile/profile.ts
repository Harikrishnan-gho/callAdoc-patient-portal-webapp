import { Component, inject, TemplateRef } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { GHOService } from '../services/ghosrvs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../app';
import { catchError } from 'rxjs';
import { ghoresult, tags } from '../model/ghomodel';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile',
  imports: [CommonModule, MatIcon, MatDividerModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private srv = inject(GHOService);
  res: ghoresult = new ghoresult()
  dialogRef!: MatDialogRef<any>
  previewImage: string | ArrayBuffer | null = null;
  router = inject(Router)
  private dialog = inject(MatDialog);
  tv: tags[] = []
  deleteAccounts: any;
  patientId = this.srv.getsession('id');
  personalDetails: any[];
  selectedFileName = '';
  selectedFile: File | null = null;
  fileType = '';
  fileId = '';
  fileUploadId = '';
  isUploading = false;
  isLoadingFileUpload = false;


  ngOnInit() {
    this.getDetails()
  }

  openSettings() {
    this.router.navigate(['profile/settings'])
  }
  linkedAccount() {
    this.router.navigate(['profile/linked-account'])
  }

  // personal info
  goToPersonalInfo() {
    this.router.navigate(['profile/personalInfo'])
  }

  // logout
  logout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: { title: 'Logout', message: 'Are you sure you want to logout?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.srv.logout();
      }
    });
  }
  openDialog(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      width: '550px',
      panelClass: 'custom-dialog',
    });
  }

  // get details of profile
  getDetails() {
    this.tv = [
      { T: "dk1", V: this.patientId },
      { T: "c10", V: "3" }
    ];
    this.srv.getdata("patient", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog('Emergency Contacts', "e", 'Error while loading emergency contacts');
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.personalDetails = [...r.Data[0]];
      }
    });
  }


  // delete account
  deleteAccount(): void {
    const patientId = this.srv.getsession('id');

    if (!patientId || patientId === '0') {
      console.error('Cannot delete account: User not logged in');
      return;
    }

    const tv = [
      { T: 'dk1', V: patientId },
      { T: 'c10', V: '13' }
    ];

    this.srv.getdata('patient', tv).subscribe((r) => {
      this.res = r;

      if (r.Status === 1) {
        this.srv.openDialog(
          'Account Deleted Successfully',
          's',
          this.res.Info
        );

        this.dialogRef.close();

        // logout user
        this.srv.logout();
      } else {
        this.srv.openDialog('No account found', 'w', this.res.Info);
      }
    });
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.srv.openDialog('Error', 'e', 'Only image files are allowed');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.fileType = file.type;

    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result);
    reader.readAsDataURL(file);

    this.isUploading = true;
    this.uploadFileWithRecordId();
  }


  private uploadFileWithRecordId() {
    if (!this.selectedFile) return;

    const tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: '' },
      { T: 'c1', V: '1' },
      { T: 'c2', V: this.selectedFileName },
      { T: 'c3', V: this.selectedFile.size.toString() },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('fileupload', tv).subscribe({
      next: (fileRes: any) => {
        if (fileRes.Status !== 1) {
          this.srv.openDialog('Error', 'e', 'Failed to save file info');
          return;
        }

        this.fileId = fileRes.Data[0][0].FileID;
        this.fileType = fileRes.Data[0][0].FileType;
        this.fileUploadId = fileRes.Data[0][0].id;

        this.uploadActualFile();
      },
      error: () => {
        this.isUploading = false;
        this.srv.openDialog('Error', 'e', 'Error saving file info');
      }
    });
  }

  private uploadActualFile() {
    this.srv.uploadFile(this.fileId, this.fileType, this.selectedFile!)
      .then(status => {

        if (status === 2) {
          const tv = [
            { T: 'dk1', V: this.patientId },
            { T: 'dk2', V: '1' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '2' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isUploading = false;
            }
          });
        } else {
          this.isUploading = false;
        }
        this.srv.openDialog('Success', 's', 'Profile picture uploaded successfully');
        this.getDetails()
      })
      .catch(() => {
        this.isUploading = false;
        this.srv.openDialog('Error', 'e', 'Profile picture upload failed');
      });
  }
}


