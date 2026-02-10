import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-insurance',
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule, CommonModule, FormsModule],
  templateUrl: './insurance.html',
  styleUrl: './insurance.css',
})
export class Insurance implements OnInit {

  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();

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

  expiryDay!: number;
  expiryMonth!: number;
  expiryYear!: number;

  providerName = '';
  policyNumber = "";
  insuranceId = '';
  uploadedPreviewUrl: string | null = null;

  isInsuranceEmpty: boolean = true


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

  ngOnInit(): void {
    this.getInsurance()
  }

  setExpiryDate(dateStr: string) {
    const parts = dateStr.replace(',', '').split(' ');

    if (parts.length === 3) {
      this.expiryDay = Number(parts[0]);
      this.expiryYear = Number(parts[2]);

      const month = this.months.find(m => m.label === parts[1]);
      this.expiryMonth = month ? month.value : undefined!;
    }
  }

  getInsurance() {
    this.tv = [
      { T: "dk1", V: this.srv.getsession('id') },
      { T: "dk2", V: "0" },
      { T: "c10", V: "3" }
    ];
    this.srv.getdata("PatientInsurance", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Insurance Info", "e", "Error while loading Insurance");
        throw err;
      })
    ).subscribe((r) => {
      const insuranceData = r.Data?.[0];

      if (!insuranceData || insuranceData.length === 0) {
        this.isInsuranceEmpty = true;
        this.insurance = {};
        this.fileDetails = [];
        return;
      }
      this.isInsuranceEmpty = false;
      this.insurance = insuranceData[0];
      this.fileDetails = r.Data?.[1] || [];
      this.providerName = this.insurance.InsuranceProviderName || '';
      this.policyNumber = this.insurance.PolicyNumber || '';
      if (this.insurance.ExpiryDate) {
        this.setExpiryDate(this.insurance.ExpiryDate);
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
        this.getInsurance()
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
        this.srv.openDialog("Success", "s", "Insurance Deleted successfully");
      }
      this.getInsurance()
    });
  }



  saveInsurance() {
    const expiryDate = this.getFormattedDate(
      this.expiryDay,
      this.expiryMonth,
      this.expiryYear
    );

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

                this.srv.openDialog(
                  'Success',
                  's',
                  'Insurance and file uploaded successfully!'
                );
              });
          },
          error: () => this.srv.openDialog('Error', 'e', 'Error saving file info'),
        });

        this.srv.openDialog("Success", "s", "Insurance Updated Successfully");
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