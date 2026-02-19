import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GHOService } from '../../services/ghosrvs';
import { GHOUtitity } from '../../services/utilities';
import { ghoresult, Lists, tags, user } from '../../model/ghomodel';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

interface oj {
  [key: string]: string;
}

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);

  userid: string = '';
  pw: string = '';

  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  ds: Object[][] = [];
  obj?: oj;
  data: [][] = [];

  cntrys: Lists[] = [];
  mode: string = 'S';
  step: number = 1;
  usr: user = new user();

  timer: number = 30;
  otp: string[] = Array(6).fill('');
  intervalId: any;
  dbmsg: string = '';

  hide: boolean = true;
  hideConfirmPassword: boolean = true;

  selectedGovFile: File | null = null;
  selectedPassFile: File | null = null;

  selectedGovFileName: string = "";
  selectedPassFileName: string = "";

  selectedUAEPass: File | null = null;
  selectedUAEPassFile: File | null = null;

  selectedUAEPassName: string = "";
  selectedUAEPassFileName: string = "";

  router = inject(Router)
  private service = inject(GHOService);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  isLoadingFileUpload: boolean;
  patientId: any;
  recordID: any;
  fileId: '';
  fileType: '';
  fileUploadId: '';

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').charAt(0);
    input.value = value;
    this.otp[index] = value;

    if (value && index < this.otp.length - 1) {
      this.otpInputs.toArray()[index + 1]?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.otpInputs.toArray()[index - 1]?.nativeElement.focus();
    }
  }

  startTimer(): void {
    clearInterval(this.intervalId);
    this.timer = 30;
    this.intervalId = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.intervalId);
    }, 1000);
  }

  onGovtFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedGovFile = file;
      this.selectedGovFileName = file.name;
    }
    else{
      this.selectedGovFile=null;
    }
  }

  onPassFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedUAEPass = file;
      this.selectedUAEPassName = file.name;
    }
  }


  resendOtp(): void {
    this.otp = Array(6).fill('');
    this.otpInputs?.first?.nativeElement.focus();
    this.startTimer();
  }
  moveToNext(event: any, index: number) {

    const input = event.target.value;


    if (!/^[0-9]$/.test(input)) {
      this.otp[index] = '';
      return;
    }

    if (input && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  clearuser(): void {
    this.usr = new user();
  }

  openalert(): void {
    this.srv.openDialog('Login', 'success', 'this is message');
  }

  goToLogin() {
    this.router.navigate(['/login'])
  }

  nextStep(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.tv = [
      { T: 'c1', V: this.usr.fullname },
      { T: 'c2', V: this.usr.phone },
      { T: 'c3', V: this.usr.email },
      { T: 'c4', V: this.usr.pwd },
      { T: 'c10', V: '8' },
    ];

    this.srv.getdata('patient', this.tv).pipe(
      catchError(err => { throw err; })
    ).subscribe(r => {
      if (r.Status === 1) {
        console.log(r)
        const u = r.Data[0][0];
        this.srv.setsession('id', u['Id']);

        this.step = 2;
      } else {
        this.srv.openDialog('OTP', 'e', r.Info);
      }
    });
  }

  prevStep() {
    this.step = 1;
  }

  // upload files

  isImage(fileName: string): boolean {
    return /\.(jpg|jpeg|png)$/i.test(fileName);
  }

 uploadGovtFile(){
  if(!this.selectedGovFile){
    this.srv.openDialog('Warning', 'w', 'Please select a file first');
      return;
  }

  this.isLoadingFileUpload=true;
  this.patientId = this.service.getsession("id")

  const tv =[
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: "" },
      { T: 'c1', V: "3" },
      { T: 'c2', V: this.selectedGovFileName },
      { T: 'c3', V: this.selectedGovFile.size.toString() },
      { T: 'c10', V: '1' }
  ]
 this.srv.getdata('fileupload',tv).subscribe({
      next: (fileRes: any) =>{
        if (fileRes.Status !==1) {
          this.srv.openDialog('Error','e','Filed to save the file info');
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

 uploadUAEPass(){
  if(!this.selectedUAEPass){
    this.srv.openDialog('Warning', 'w', 'Please select a file first');
      return;
  }

  this.isLoadingFileUpload=true;
  this.patientId = this.service.getsession("id")

  const tv =[
    { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: "" },
      { T: 'c1', V: "3" },
      { T: 'c2', V: this.selectedUAEPassFileName },
      { T: 'c3', V: this.selectedUAEPass.size.toString() },
      { T: 'c10', V: '1' }
  ]
 this.srv.getdata('fileupload',tv).subscribe({
      next: (fileRes: any) =>{
        if (fileRes.Status !==1) {
          this.srv.openDialog('Error','e','Filed to save the file info');
          return;
        }

        this.fileId = fileRes.Data[0][0].FileID;
        this.fileType = fileRes.Data[0][0].FileType;
        this.fileUploadId = fileRes.Data[0][0].id;

       this.uploadActualUAEFile();

      },
      error: () => {
        this.srv.openDialog('Error', 'e', 'Error saving file info');
      }
    });
 }

//  private uploadFileWithRecordId(){

//   if(!this.recordID || !this.selectedGovFile) return;

//    const tv = [
//       { T: 'dk1', V: this.patientId},
//       { T: 'dk2', V: this.recordID },
//       { T: 'c1', V: '2' },
//       { T: 'c2', V: this.selectedGovFileName },
//       { T: 'c3', V: this.selectedGovFile.size.toString() },
//       { T: 'c10', V: '1' }
//     ];
//     this.srv.getdata('fileupload',tv).subscribe({
//       next: (fileRes: any) =>{
//         if (fileRes.Status !==1) {
//           this.srv.openDialog('Error','e','Filed to save the file info');
//           return;
//         }
//         this.fileId = fileRes.Data[0][0].FileID;
//         this.fileType = fileRes.Data[0][0].FileType;
//         this.fileUploadId = fileRes.Data[0][0].id;

//        this.uploadActualFile();

//       },
//       error: () => {
//         this.srv.openDialog('Error', 'e', 'Error saving file info');
//       }
//     });
//  }

 private uploadActualFile(){
   this.srv.uploadFile(this.fileId, this.fileType, this.selectedGovFile!)
      .then(status => {

        if (status === 2) {
          const tv = [
            { T: 'dk1', V:this.srv.getsession('id') },
            { T: 'dk2', V: '3' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '4' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
            }
          });
          this.srv.openDialog('Success', 's', 'UAE Pass uploaded successfully!');
        } else {
          this.isLoadingFileUpload = false;
        }

        // this.srv.openDialog('Success', 's', 'ID uploaded successfully!');
        // this.getUserMedicalRecords()
      })
      .catch(() => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'File upload failed');
      });
  }

  private uploadActualUAEFile(){
   this.srv.uploadFile(this.fileId, this.fileType, this.selectedUAEPass!)
      .then(status => {

        if (status === 2) {
          const tv = [
            { T: 'dk1', V:this.srv.getsession('id') },
            { T: 'dk2', V: '3' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '4' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
            }
          });
          this.srv.openDialog('Success', 's', 'ID uploaded successfully!');
        } else {
          this.isLoadingFileUpload = false;
        }

        // this.srv.openDialog('Success', 's', 'ID uploaded successfully!');
        // this.getUserMedicalRecords()
      })
      .catch(() => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'File upload failed');
      });
  }

  signUp(){
    if(!this.selectedGovFile || !this.selectedPassFile ){
      this.srv.openDialog('Warning', 'w', 'Please upload documents');
    }
    this.router.navigate(['/dash'])
  }

 }


