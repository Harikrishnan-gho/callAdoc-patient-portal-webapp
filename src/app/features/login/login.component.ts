import {
  Component,
  inject,
  signal,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';

import { GHOService } from '../../services/ghosrvs';
import { GHOUtitity } from '../../services/utilities';
import { tags, ghoresult, Lists, user } from '../../model/ghomodel';

interface oj {
  [key: string]: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit {
  protected readonly title = signal('Global Second Opinion Network');
  newPatientId: any;
  patientId: any;
  petientDetails: any[];
  password: string;
  msg: any;

  constructor(private router: Router, private rt: ActivatedRoute) { }


  utl = inject(GHOUtitity);
  patientDetails: any[];
  private service = inject(GHOService);
  private srv = inject(GHOService);


  userid: string = '';
  pw: string = '';

  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  ds: Object[][] = [];
  obj?: oj;
  data: [][] = [];

  cntrys: Lists[] = [];
  mode: string = 'L';
  usr: user = new user();

  timer: number = 30;
  otp: string[] = Array(6).fill('');
  intervalId: any;
  dbmsg: string = '';

  hide: boolean = true;
  hideConfirmPassword: boolean = true;

  otpLogin: boolean = false;
  loginData = ''


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

  ngOnInit(): void {
    this.srv.clearsession();
    this.rt.queryParamMap.subscribe(params => {
      this.clearuser();
      this.usr.id = params.get('id') || '';
      this.patientId = this.service.getsession("id")

      if (this.usr.id) this.mode = 'P';
    });
    this.getcntry();
  }

  startTimer(): void {
    clearInterval(this.intervalId);
    this.timer = 30;
    this.intervalId = setInterval(() => {
      if (this.timer > 0) this.timer--;
      else clearInterval(this.intervalId);
    }, 1000);
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

    // Move to next box
    if (input && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }



  // submitOtp(): void {
  //   const enteredOtp = this.otp.join('');
  //   if (!/^\d{6}$/.test(enteredOtp)) {
  //     this.srv.openDialog('OTP', 'i', 'Please enter a valid 6-digit OTP');
  //     return;
  //   }

  //   this.tv = [
  //     { T: 'dk1', V: this.usr.id },
  //     { T: 'dk2', V: enteredOtp },
  //     { T: 'c1', V: 'P' },
  //     { T: 'c10', V: '93' },
  //   ];

  //   this.srv.getdata('reviewer', this.tv).pipe(
  //     catchError(err => { throw err; })
  //   ).subscribe(r => {
  //     if (r.Status === 1) {
  //       const u = r.Data[0][0];
  //       this.srv.setsession('tkn', u['Token']);
  //       this.srv.setsession('id', u['id']);
  //       this.router.navigate(['/dash']);
  //     } else {
  //       this.srv.openDialog('OTP', 'e', r.Info);
  //     }
  //   });
  // }


  clearuser(): void {
    this.usr = new user();
  }

  openalert(): void {
    this.srv.openDialog('Login', 'success', 'this is message');
  }

  goToSignUp() {
    this.router.navigate(['/signup'])
  }


  // submitnewpwd(): void {
  //   if (this.usr.pwd !== this.usr.fname) {
  //     this.srv.openDialog(
  //       'New Password',
  //       's',
  //       'Password and confirm password should be same'
  //     );
  //     return;
  //   }

  //   this.tv = [
  //     { T: 'dk1', V: this.usr.id },
  //     { T: 'dk2', V: this.usr.pwd },
  //     { T: 'c1', V: 'P' },
  //     { T: 'c10', V: '95' },
  //   ];

  //   this.srv.getdata('reviewer', this.tv).pipe(
  //     catchError(err => { throw err; })
  //   ).subscribe(r => {
  //     if (r.Status === 1) {
  //       this.srv.openDialog('New Password', 's', r.Info);
  //       this.mode = 'L';
  //       this.clearuser();
  //     }
  //   });
  // }

  onOtpChange(event: any) {
    this.otpLogin = event.target.checked;
  }

  onForgotPassword(event: Event) {

    event.preventDefault();

    if (this.otpLogin) {
      return;
    }

    this.mode = 'F';
  }



  loginclick(form: any) {

    // Validate form
    if (form.invalid && !this.otpLogin) {
      form.control.markAllAsTouched();
      return;
    }


    if (this.otpLogin) {
      const emailOrPhone = this.loginData?.trim();
      if (!emailOrPhone) {
        this.srv.openDialog(
          'Login',
          'w',
          'Please enter Email'
        );
        return;
      }

      this.tv = [
        { T: 'dk1', V: emailOrPhone },
        { T: 'dk2', V: 'OTP' },
        { T: 'c10', V: '9' }
      ];

      this.srv.getdata('patient', this.tv)
        .pipe(
          catchError(err => {

            console.error('Login API Error:', err);

            this.srv.openDialog(
              'Login Error',
              'e',
              'Unable to login. Please try again later.'
            );

            throw err;
          })
        )
        .subscribe((r: any) => {

          console.log('Login Response:', r);
          // console.log('patientid',this.patientId);

          if (r?.Status === 1 && r?.Data?.length) {
            this.patientDetails = [...r.Data[0]];
            this.msg = r.Data[0][0].msg;
            this.patientId = r.Data[0][0].id;
            const u = r.Data[0][0];
            this.srv.setsession('tkn', u['Token']);
            this.srv.setsession('id', u['id']);


            this.mode = 'O';
          }

          else {

            this.srv.openDialog(
              'Login Failed',
              'w',
              'Invalid Email / Phone or Password'
            );

          }

        });


      return;
    }


    //  normal login

    if (form.invalid) {
      return;
    }


    const emailOrPhone = this.loginData?.trim();
    const pwd = this.password?.trim();

    if (!emailOrPhone || !pwd) {
      this.srv.openDialog(
        'Login',
        'w',
        'Please enter Email and Password'
      );
      return;
    }


    this.tv = [
      { T: 'dk1', V: emailOrPhone },
      { T: 'dk2', V: pwd },
      { T: 'c10', V: '9' }
    ];

    this.srv.getdata('patient', this.tv)
      .pipe(
        catchError(err => {

          console.error('Login API Error:', err);

          this.srv.openDialog(
            'Login Error',
            'e',
            'Unable to login. Please try again later.'
          );

          throw err;
        })
      )
      .subscribe((r: any) => {

        console.log('Login Response:', r);
        if (r?.Status === 1 && r?.Data?.length) {
          this.patientDetails = [...r.Data[0]];
          const u = r.Data[0][0];
          this.srv.setsession('tkn', u['Token']);
          this.srv.setsession('id', u['id']);

          this.password = '';
          const msg = r.Data[0][0].msg;
          this.srv.openDialog('Success', 's', msg);

          this.router.navigate(['/dash'])
        }
        else {

          this.srv.openDialog(
            'Login Failed',
            'w',
            'Invalid Email / Phone or Password'
          );

        }

      });
  }

  // verify otp section

  verifyOtp() {
    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'dk2', V: this.otp.join('') },
      { T: 'c10', V: '10' }
    ];

    this.srv.getdata('patient', this.tv)
      .pipe(
        catchError(err => {

          console.error('Login API Error:', err);

          this.srv.openDialog(
            'Login Error',
            'e',
            'Unable to login. Please try again later.'
          );

          throw err;
        })
      )
      .subscribe((r: any) => {

        if (r?.Status === 1 && r?.Data?.length) {
          this.petientDetails = [...r.Data[0]];
          const msg = r.Data[0][0].msg;
          this.srv.openDialog('Success', 's', msg);

          this.router.navigate(['/dash'])
        }

        // ---------- FAILED ----------
        else {

          this.srv.openDialog(
            'Login Failed',
            'w',
            'Invalid OTP'
          );

        }

      });
  }


  goBacktoLogin() {
    this.mode = 'L'
  }

  signupclick(): void {
    this.tv = [
      { T: 'c1', V: this.usr.fullname },
      { T: 'c2', V: this.usr.dob },
      { T: 'c3', V: this.usr.gender },
      { T: 'c4', V: this.usr.ph },
      { T: 'c5', V: this.usr.pwd },
      { T: 'c10', V: '8' },
    ];

    this.srv.getdata('patient', this.tv).pipe(
      catchError(err => { throw err; })
    ).subscribe(r => {
      if (r.Status === 1) {
        const msg = r.Data[0][0]?.msg;
        this.srv.openDialog('Signup', 's', msg);
        this.mode = 'L';
      } else {
        this.srv.openDialog('Signup', 'w', r.Info);
      }
    });
  }

  forgot(): void {
    this.tv = [
      { T: 'dk1', V: this.usr.id },
      { T: 'dk2', V: this.usr.ph },
      { T: 'c1', V: this.usr.cntry },
      { T: 'c10', V: '94' },
    ];

    this.srv.getdata('reviewer', this.tv).pipe(
      catchError(err => { throw err; })
    ).subscribe(r => {
      if (r.Status === 1) {
        const message = r.Data?.[0]?.[0]?.msg;
        this.srv.openDialog('New Password', 'success', message);
        this.mode = 'L';
      } else {
        this.srv.openDialog('New Password', 'warning', r.Info);
      }
    });
  }

  actn(a: number): void {
    this.clearuser();
    if (a === 1) this.mode = 'S';
    if (a === 2) this.mode = 'L';
    if (a === 3) this.mode = 'F';
  }


  getcntry(): void {
    this.tv = [{ T: 'c10', V: '100' }];
    this.srv.getdata('lists', this.tv).pipe(
      catchError(err => { throw err; })
    ).subscribe(r => {
      if (r.Status === 1) this.cntrys = r.Data[0];
    });
  }



  ngAfterViewInit(): void {
    if (this.mode === 'O' && this.otpInputs?.length) {
      this.otpInputs.first.nativeElement.focus();
      this.startTimer();
    }
  }
}
