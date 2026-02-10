import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { GHOService } from '../../../services/ghosrvs';

/* 👇 Custom Error Matcher */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {

  router = inject(Router);

 currentPasswordControl = new FormControl('', [
  Validators.required,
  Validators.minLength(8)
]);
 newPasswordControl = new FormControl('', [
  Validators.required,
  Validators.minLength(8)
]);
 confirmPasswordControl = new FormControl('', [
  Validators.required,
  Validators.minLength(8)
]);

hideCurrentPassword = true;
hideNewPassword = true;
hideConfirmPassword = true;
currentPassword: string = ''
newPassword: string = ''
confirmPassword: string = ''
matcher = new MyErrorStateMatcher();
  patientId: any;
  private srv = inject(GHOService);
  tv: { T: string; V: any; }[];
  res: any;

ngOnInit(){
  this.patientId = this.srv.getsession('id');
}

  // To change and update password
 changePassword(): void {
  const current = this.currentPasswordControl.value;
  const newPwd = this.newPasswordControl.value;
  const confirm = this.confirmPasswordControl.value;

  if (!current || !newPwd || !confirm) {
    this.srv.openDialog("Error", "w", "All fields are required");
    return;
  }

  if (newPwd !== confirm) {
    this.srv.openDialog("Error", "w", "New password and confirm password must match");
    return;
  }

  this.tv = [
    { T: "dk1", V: this.patientId },
    { T: 'dk2', V: current },
    { T: 'c1', V: newPwd },
    { T: 'c2', V: confirm },
    { T: "c10", V: "12" }
  ];

  this.srv.getdata('patient', this.tv).subscribe((r) => {
    this.res = r;
    if (r.Status === 1) {
      this.currentPasswordControl.reset();
      this.newPasswordControl.reset();
      this.confirmPasswordControl.reset();
      this.srv.openDialog("Success", "s", "Password Updated Successfully");
       this.router.navigate(['/profile/settings'])
    } else {
      this.srv.openDialog('Error', 'w', this.res.Info || 'API call failed');
    }
  });
}


  settings() {
    this.router.navigate(['profile/settings']);
  }
}