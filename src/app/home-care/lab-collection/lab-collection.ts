import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GHOService } from '../../services/ghosrvs';
import { ghoresult, tags } from '../../model/ghomodel';
import { GHOUtitity } from '../../services/utilities';
import { catchError } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-lab-collection',
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './lab-collection.html',
  styleUrl: './lab-collection.css',
})
export class LabCollection {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  userId = "";

  patientDetails = {
    tests: '',
    date: null as Date | null,
    hour: '09',
    minute: '00',
    ampm: 'AM',
    name: '',
    phone: '',
    address: ''
  };
  selectedFileName = '';
  selectedFile: File | null = null;
  fileType = '';
  fileId = '';
  fileUploadId = '';
  isLoadingFileUpload = false;
  labPrescriptionID = '';
  private bookingFormRef!: NgForm;


  hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  ngOnInit(): void {
    this.userId = this.service.getsession("id");
  }

  private service = inject(GHOService);
  @Output() close = new EventEmitter<void>()

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

    let formattedDate = '';
    if (this.patientDetails.date) {
      const d = this.patientDetails.date;
      formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')
        }/${d.getFullYear()}`;
    }

    const time = `${this.patientDetails.hour}:${this.patientDetails.minute} ${this.patientDetails.ampm}`;

    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.patientDetails.tests },
      { T: 'c1', V: formattedDate },
      { T: 'c2', V: time },
      { T: 'c3', V: this.patientDetails.name },
      { T: 'c5', V: this.patientDetails.phone },
      { T: 'c5', V: this.patientDetails.address },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('labcollection', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          const data = r.Data[0][0];
          this.labPrescriptionID = data.id;
          const msg = data.msg;
          if (this.selectedFile) {
            this.isLoadingFileUpload = true;
            this.uploadFileWithRecordId()
          } else {
            this.srv.openDialog('Booking Request', 's', msg);
            this.close.emit();
            form.resetForm({
              hour: '09',
              minute: '00',
              ampm: 'AM'
            });
          }
        } else {
          this.srv.openDialog('Booking Request', 'w', r.Info);
        }
      });
  }

  closePopup() {
    this.close.emit();
  }

  private uploadFileWithRecordId() {
    if (!this.labPrescriptionID || !this.selectedFile) return;
    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.labPrescriptionID },
      { T: 'c1', V: '11' },
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
            { T: 'dk2', V: '11' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '2' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
              this.srv.openDialog(
                'Booking Request',
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
