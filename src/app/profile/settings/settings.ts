import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { tags } from '../../model/ghomodel';
import { GHOService } from '../../services/ghosrvs';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [MatIcon,MatDivider,MatSlideToggleModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {

  router=inject(Router)
   defaultImage =
    'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg';

  previewImage: string | ArrayBuffer | null = null;
  personalDetails: any[]
  private srv = inject(GHOService);
    tv: tags[] = []
  deleteAccounts: any;
  patientId = this.srv.getsession('id');
  
  ngOnInit(){
    this.getDetails()
  }

account(){
  this.router.navigate(['profile'])
}
viewProfile(){
  this.router.navigate(['profile/personalInfo'])
}

 // get details of profile
  getDetails(){
      this.tv = [
        { T: "dk1", V: this.patientId },
        { T: "c10", V: "3" }
      ];
      this.srv.getdata("patient", this.tv).pipe(
        catchError((err) => {
          this.srv.openDialog('Emergency Contacts', "e", 'Error while loading emergency contacts');
          throw err;
        })
      ).subscribe((r) => {
        if (r.Status === 1) {
          this.personalDetails = [...r.Data[0]];
          
          }
      });
  }

  
ChangePassword(){
  this.router.navigate(['profile/settings/password'])
}
}
