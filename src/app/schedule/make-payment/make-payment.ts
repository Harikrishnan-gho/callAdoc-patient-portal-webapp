import {
  Component,
  inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError } from 'rxjs';

import { ghoresult, tags } from '../../model/ghomodel';
import { GHOService } from '../../services/ghosrvs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomDialog } from '../../shared/custom-dialog/custom-dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-make-payment',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, CustomDialog
    , MatFormFieldModule, MatSelectModule, MatInputModule, ],
  templateUrl: './make-payment.html',
  styleUrl: './make-payment.css',
})
export class MakePayment implements OnInit, OnChanges {

  private ghoService = inject(GHOService);
  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  doctorDetails: any;
  patientDetails: any;
  patientId = '';
  paymentMode: 'insurance' | 'cash' | null = null;
  patientInsurance: any;
  showAddInsurancePopup = false;
  files: {
    file: File;
    name: string;
    preview: string;
    isImage: boolean;
    isPdf: boolean;
  }[] = [];

  insurance: any = {};
  fileDetails: any[] = [];
  fileType = '';
  fileId = '';
  uploadUrl = '';
  fileUploadId = '';
  selectedFileName = '';
  selectedFile: File | null = null;
  providerName = '';
  policyNumber = "";
  insuranceId = '';
  uploadedPreviewUrl: string | null = null;
  isInsuranceEmpty: boolean = true
  expiryDay!: number;
  expiryMonth!: number;
  expiryYear!: number;


  getFormattedDate(day: number | null, month: number | null, year: number | null): string | null {
    if (!day || !month || !year) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  months = [
    { label: 'Jan', value: 1 },
    { label: 'Feb', value: 2 },
    { label: 'Mar', value: 3 },
    { label: 'Apr', value: 4 },
    { label: 'May', value: 5 },
    { label: 'Jun', value: 6 },
    { label: 'Jul', value: 7 },
    { label: 'Aug', value: 8 },
    { label: 'Sep', value: 9 },
    { label: 'Oct', value: 10 },
    { label: 'Nov', value: 11 },
    { label: 'Dec', value: 12 }
  ];

  constructor(private router: Router) { }

  @Input() appointmentData!: {
    doctorId: string;
    selectedDate: string;
    selectedTimeId: string;
    selectedTime: string;
  };

  ngOnInit(): void {
    this.patientId = this.ghoService.getsession('id');
    if (!this.patientId) {
      console.warn('Patient ID not found in session');
      return;
    }
    this.getPatientDetails();
    this.getPatientInsurance()
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['appointmentData'] &&
      this.appointmentData?.doctorId
    ) {
      this.getDoctorDetails();
    }
  }

  getDoctorDetails(): void {
    this.tv = [
      { T: 'dk1', V: '' },
      { T: 'dk2', V: this.appointmentData.doctorId },
      { T: 'c10', V: '3' },
    ];

    this.ghoService.getdata('doctors', this.tv)
      .pipe(
        catchError(err => {
          this.ghoService.openDialog('Doctor Info', 'e', 'Error while loading doctor info');
          throw err;
        })
      )
      .subscribe(r => {
        if (r.Status === 1) {
          this.doctorDetails = r.Data[0][0];
        }
      });
  }

  getPatientDetails(): void {
    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'c10', V: '27' },
    ];

    this.ghoService.getdata('patient', this.tv)
      .pipe(
        catchError(err => {
          this.ghoService.openDialog(
            'Patient Info', 'e', 'Error while loading patient info');
          throw err;
        })
      )
      .subscribe(r => {
        if (r.Status === 1) {
          this.patientDetails = r.Data[0][0];
        }
      });
  }

  getPatientInsurance(): void {
    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: '' },
      { T: 'c10', V: '3' },
    ];

    this.ghoService.getdata('PatientInsurance', this.tv)
      .pipe(
        catchError(err => {
          this.ghoService.openDialog(
            'Patient Insurance', 'e', 'Error while loading patient insurance');
          throw err;
        })
      )
      .subscribe(r => {
        if (r.Status === 1) {
          this.patientInsurance = r.Data[0][0];
        }
      });
  }

  bookAppointment(): void {
    if (!this.paymentMode) {
      this.ghoService.openDialog('Payment Required', 'e', 'Please select a payment method');
      return;
    }
    const paymentType = this.paymentMode === 'insurance' ? '1' : '2';

    this.tv = [
      { T: 'dk1', V: this.appointmentData.selectedTimeId },
      { T: 'dk2', V: this.patientId },
      { T: 'c1', V: paymentType },
      { T: 'c2', V: '' },
      { T: 'c3', V: '' },
      { T: 'c10', V: '1' },
    ];

    this.ghoService.getdata('appointment', this.tv)
      .pipe(
        catchError(err => {
          this.ghoService.openDialog('Appointment Booking', 'e', 'Error in booking appointment');
          throw err;
        })
      )
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg;
          this.ghoService.openDialog('Appointment Booking', 's', msg);
          this.router.navigate(['/dash']);
        }
      });
  }

  openScheduleLabPopup() {
    this.showAddInsurancePopup = true;
  }
  closeAddInsurancePopup() {
    this.showAddInsurancePopup = false;
  }

  saveInsurance() {
    const expiryDate = this.getFormattedDate(
      this.expiryDay,
      this.expiryMonth,
      this.expiryYear
    );
    this.deleteInsurance()

    this.tv = [
      { T: 'dk1', V: this.srv.getsession('id') },
      { T: 'dk2', V: this.insurance.ID || '' },
      { T: 'c1', V: this.providerName },
      { T: 'c2', V: this.policyNumber },
      { T: 'c3', V: expiryDate },
      { T: 'c10', V: this.isInsuranceEmpty ? '1' : '2' },
    ];

    this.srv.getdata("PatientInsurance", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Insurance Info", "e", "Error while loading Insurance");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.insuranceId = r.Data[0][0].id
        if (!this.selectedFile) {
          this.srv.openDialog('Success', 's', 'Insurance Updated successfully!');
          this.getPatientInsurance()
          this.closeAddInsurancePopup()
          return;
        }

        this.tv = [
          { T: 'dk1', V: this.srv.getsession('id') },
          { T: 'dk2', V: this.insuranceId },
          { T: 'c1', V: '4' },
          { T: 'c2', V: this.selectedFileName },
          { T: 'c3', V: this.selectedFile.size.toString() },
          { T: 'c10', V: '1' },
        ];
        this.srv.getdata('fileupload', this.tv).subscribe({
          next: (fileRes: any) => {
            if (fileRes.Status !== 1) {
              this.srv.openDialog('Error', 'e', 'Failed to save file info');
              return;
            }

            this.fileId = fileRes.Data[0][0].FileID;
            this.fileType = fileRes.Data[0][0].FileType;
            this.fileUploadId = fileRes.Data[0][0].id;

            this.srv.uploadFile(this.fileId, this.fileType, this.selectedFile!)
              .then((status) => {
                if (status === 2) {
                  this.tv = [
                    { T: 'dk1', V: this.srv.getsession('id') },
                    { T: 'dk2', V: '4' },
                    { T: 'c1', V: this.fileUploadId },
                    { T: 'c2', V: status.toString() },
                    { T: 'c10', V: '2' },
                  ];

                  this.srv.getdata('fileupload', this.tv).subscribe();
                }

                this.srv.openDialog('Success','s','Insurance and file uploaded successfully!');
              });
          },
          error: () => this.srv.openDialog('Error', 'e', 'Error saving file info'),
        });

        this.srv.openDialog("Success", "s", "Insurance Updated Successfully");
        this.getPatientInsurance()
        this.closeAddInsurancePopup()
      }
    });
  }

    removeFile(file: any) {
    this.tv = [
      { T: 'dk1', V: this.srv.getsession('id') },
      { T: 'dk2', V: file?.DocumentTypeID },
      { T: 'c1', V: file?.id },
      { T: 'c3', V: this.insurance?.ID },
      { T: 'c10', V: "4" },
    ];

    this.srv.getdata("fileupload", this.tv).pipe(
      catchError((err) => {
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        // this.getInsurance()
      } else {
      }
    });
  }

    deleteInsurance() {
    this.tv = [
      { T: 'dk1', V: this.srv.getsession('id') },
      { T: 'dk2', V: this.insurance.ID || '' },
      { T: 'c10', V: '4' },
    ];

    this.srv.getdata("PatientInsurance", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Insurance Info", "e", "Error while loading Insurance");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        // this.srv.openDialog("Success", "s", "Insurance Deleted successfully");
      }

    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.uploadedPreviewUrl = URL.createObjectURL(file);
  }


}
