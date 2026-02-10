import { Component, inject, OnInit } from '@angular/core';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'welcome-section',
  imports: [CommonModule],
  templateUrl: './welcome-section.html',
  styleUrl: './welcome-section.css',
})
export class WelcomeSection implements OnInit {
  srv = inject(GHOService);
  userid: string = "";
  pw: string = "";
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  userInfo: any;

  getUserDetails() {
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.userid });
    this.tv.push({ T: "c10", V: "3" });
    this.srv.getdata("patient", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("User Info", "e", "error while loading User info");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.userInfo = r.Data[0][0];
      }
    });
  }

  ngOnInit(): void {
  this.userid = this.srv.getsession('id');

    this.getUserDetails()
  }
}
