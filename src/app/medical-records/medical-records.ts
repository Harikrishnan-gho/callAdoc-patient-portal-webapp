import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { GHOService } from '../services/ghosrvs';
import { GHOUtitity } from '../services/utilities';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CustomDialog } from '../shared/custom-dialog/custom-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-medical-records',
  imports: [CommonModule, MatTabsModule, FormsModule,
    MatFormFieldModule, CustomDialog, MatProgressSpinnerModule,
    MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './medical-records.html',
  styleUrl: './medical-records.css',
})
export class MedicalRecords {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  tbidx: number = 0;
  medicalRecordList: any = []
  userId = "";
  showEditMedicalRecordPopup = false;
  fileName: string = ''
  medicalRecordId: string = ''
  filteredmedicalRecords: any[] = [];
  selectedFileName = '';
  selectedFile: File | null = null;
  fileType = '';
  fileId = '';
  fileUploadId = '';
  recordID = '';
  isLoadingFileUpload = false;

  private service = inject(GHOService);

  openMedicalRecord(record: any) {
    this.fileName = record.DocumentName
    this.medicalRecordId = record.ID
    this.showEditMedicalRecordPopup = true;
  }
  closeMedicalRecord() {
    this.showEditMedicalRecordPopup = false;
  }

  ngOnInit(): void {
    this.userId = this.service.getsession("id");
    this.getUserMedicalRecords()
  }

  getUserMedicalRecords() {
    const tv = [
      { T: 'dk1', V: '0' },
      { T: 'dk2', V: this.userId },
      { T: 'c10', V: '3' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          this.medicalRecordList = r.Data[0]
          this.filteredmedicalRecords = [...this.medicalRecordList];
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  onSearchUploadedMedicalRecords(event: Event) {
    const value = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();

    if (!value) {
      this.filteredmedicalRecords = [...this.medicalRecordList];
      return;
    }

    this.filteredmedicalRecords = this.medicalRecordList.filter(record =>
      record.DocumentName.toLowerCase().includes(value)
    );
  }

  isImage(fileName: string): boolean {
    return /\.(jpg|jpeg|png)$/i.test(fileName);
  }

  isPdf(fileName: string): boolean {
    return /\.pdf$/i.test(fileName);
  }

  isDcm(fileName: string): boolean {
    return /\.dcm$/i.test(fileName);
  }

  openRecord(record: any) {
    if (record?._url) {
      window.open(record._url, '_blank', 'noopener');
    }
  }

  editRecord() {
    const tv = [
      { T: 'dk1', V: this.medicalRecordId },
      { T: 'dk2', V: this.userId },
      { T: 'c1', V: this.fileName },
      { T: 'c10', V: '2' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg
          this.closeMedicalRecord()
          this.srv.openDialog('Medical Records', 's', msg);
          this.getUserMedicalRecords()
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  deleteRecord(medicalRecordId: string) {
    const tv = [
      { T: 'dk1', V: medicalRecordId },
      { T: 'dk2', V: this.userId },
      { T: 'c10', V: '4' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg
          this.srv.openDialog('Medical Records', 's', msg);
          this.getUserMedicalRecords()
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  uploadMedicalRecord() {
    if (!this.selectedFile) {
      this.srv.openDialog('Warning', 'w', 'Please select a file first');
      return;
    }
    this.isLoadingFileUpload = true;
    const tv = [
      { T: 'dk1', V: '' },
      { T: 'dk2', V: this.userId },
      { T: 'c1', V: this.selectedFileName },
      { T: 'c10', V: '1' }
    ];
    this.srv.getdata('patientmedicalrecord', tv).subscribe({
      next: (r: any) => {
        if (r.Status !== 1 || !r.Data?.[0]?.[0]?.id) {
          this.srv.openDialog('Medical Records', 'w', r.Info || 'Failed to create record');
          return;
        }
        this.recordID = r.Data[0][0].id;

        this.uploadFileWithRecordId();
      },
      error: () => {
        this.srv.openDialog('Error', 'e', 'Error creating medical record');
      }
    });
  }

  private uploadFileWithRecordId() {
    if (!this.recordID || !this.selectedFile) return;

    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.recordID },
      { T: 'c1', V: '2' },
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
        this.srv.openDialog('Error', 'e', 'Error saving file info');
      }
    });
  }

  private uploadActualFile() {
    this.srv.uploadFile(this.fileId, this.fileType, this.selectedFile!)
      .then(status => {

        if (status === 2) {
          const tv = [
            { T: 'dk1', V: this.srv.getsession('id') },
            { T: 'dk2', V: '6' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '2' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
            }
          });
        } else {
          this.isLoadingFileUpload = false;
        }

        this.srv.openDialog('Success', 's', 'Medical record file uploaded successfully!');
        this.getUserMedicalRecords()
      })
      .catch(() => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'File upload failed');
      });
  }





}
