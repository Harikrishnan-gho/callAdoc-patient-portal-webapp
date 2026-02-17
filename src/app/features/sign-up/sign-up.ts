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

  router = inject(Router)

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

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

  onGovFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedGovFile = file;
      this.selectedGovFileName = file.name;
    }
  }

  onPassFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPassFile = file;
      this.selectedPassFileName = file.name;
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
}
