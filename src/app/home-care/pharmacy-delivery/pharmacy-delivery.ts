import { Component, EventEmitter, inject, Output } from '@angular/core';
import { catchError } from 'rxjs';
import { GHOService } from '../../services/ghosrvs';
import { GHOUtitity } from '../../services/utilities';
import { ghoresult, tags } from '../../model/ghomodel';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pharmacy-delivery',
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
    MatSelectModule, MatIconModule],
  templateUrl: './pharmacy-delivery.html',
  styleUrl: './pharmacy-delivery.css',
})
export class PharmacyDelivery {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  userId = "";
  prescriptionDetails = {
    name: '',
    phone: '',
    address: '',
    additinalNotes: ''
  };

  selectedFileName = '';
  selectedFile: File | null = null;
  fileType = '';
  fileId = '';
  fileUploadId = '';
  isLoadingFileUpload = false;
  prescriptionRecordID = '';
  private bookingFormRef!: NgForm;


  private service = inject(GHOService);
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    this.userId = this.service.getsession("id");
  }

  closePopup() {
    this.close.emit();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  confirmBooking(form: NgForm) {

    this.bookingFormRef = form;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.prescriptionDetails.additinalNotes },
      { T: 'c1', V: this.prescriptionDetails.name },
      { T: 'c2', V: this.prescriptionDetails.phone },
      { T: 'c3', V: this.prescriptionDetails.address },
      { T: 'c4', V: '' },
      { T: 'c5', V: '' },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('pharmacydelivery', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status !== 1) {
          this.srv.openDialog('Booking Request', 'w', r.Info);
          return;
        }

        const data = r.Data[0][0];
        this.prescriptionRecordID = data.id;
        const msg = data.msg;

        if (this.selectedFile) {
          this.isLoadingFileUpload = true;
          this.uploadFileWithRecordId();
        }
        else {
          this.srv.openDialog('Booking Request', 's', msg);
          this.close.emit();
          form.resetForm({});
        }
      });
  }


  private uploadFileWithRecordId() {
    if (!this.prescriptionRecordID || !this.selectedFile) return;
    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.prescriptionRecordID },
      { T: 'c1', V: '10' },
      { T: 'c2', V: this.selectedFileName },
      { T: 'c3', V: this.selectedFile.size.toString() },
      { T: 'c10', V: '1' }
    ];
    this.srv.getdata('fileupload', tv).subscribe({
      next: (fileRes: any) => {
        if (fileRes.Status !== 1) {
          this.isLoadingFileUpload = false;
          this.srv.openDialog('Error', 'e', 'Failed to save file info');
          return;
        }

        this.fileId = fileRes.Data[0][0].FileID;
        this.fileType = fileRes.Data[0][0].FileType;
        this.fileUploadId = fileRes.Data[0][0].id;

        this.uploadActualFile();
      },
      error: () => {
        this.isLoadingFileUpload = false;
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
            { T: 'dk2', V: '10' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '2' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
              this.srv.openDialog(
                'Success',
                's',
                'Booking confirmed and prescription uploaded successfully!'
              );
              this.bookingFormRef?.resetForm({});
              this.selectedFile = null;
              this.selectedFileName = '';
              this.close.emit();
            }
          });
        } else {
          this.isLoadingFileUpload = false;
          this.srv.openDialog('Error', 'e', 'File upload failed');
        }
      })
      .catch(() => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'File upload failed');
      });
  }

}
