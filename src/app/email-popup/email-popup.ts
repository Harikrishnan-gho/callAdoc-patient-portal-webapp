import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-email-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './email-popup.html',
  styleUrl: './email-popup.css',
})
export class EmailPopup {

  showEmailPopup = false;
  srv = inject(GHOService);
  userid: string = "";
  pw: string = "";
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  doctorInfo: any = [];
  reviewerId = "";
  sendEmailResponse: any = [];
  private service = inject(GHOService);


  ngOnInit(): void {
    this.reviewerId = this.service.getsession("id");
    if (this.reviewerId) {
      this.getDoctorDetails()
    }
  }

  getDoctorDetails() {
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.reviewerId });
    this.tv.push({ T: "c10", V: "7" });
    this.srv.getdata("reviewer", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Doctor Info", "e", "error while loading doctor info");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.doctorInfo = r.Data[0][0];
        this.email.from = this.doctorInfo.Email;
      }
    });
  }

  sendEmail() {

    if (!this.email.subject || !this.email.body) {
      this.srv.openDialog("Missing Details", "e", "Subject and message are required.");
      return;
    }
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.reviewerId });
    this.tv.push({ T: "dk2", V: this.email.body })
    this.tv.push({ T: "c1", V: this.email.from });
    this.tv.push({ T: "c2", V: this.email.to });
    this.tv.push({ T: "c3", V: this.email.subject });
    this.tv.push({ T: "c10", V: "12" });
    this.srv.getdata("reviewercase", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Doctor Info", "e", "error while loading doctor info");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.sendEmailResponse = r.Data[0][0];
        this.closePopup();
        this.email = {
          to: 'admin@gho.care',
          from: this.doctorInfo.Email,
          subject: '',
          body: ''
        };
        this.srv.openDialog("Success", "s", this.sendEmailResponse.msg);
      }
    });
  }

  email = {
    to: 'admin@gho.care',
    from: '',
    subject: '',
    body: ''
  };

  openPopup() {
    this.showEmailPopup = true;
  }

  closePopup() {
    this.showEmailPopup = false;
  }


}



