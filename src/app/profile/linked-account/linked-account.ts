import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { GHOService } from '../../services/ghosrvs';
import { tags } from '../../model/ghomodel';
import { catchError, throwError } from 'rxjs';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-linked-account',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatMenu
  ],
  templateUrl: './linked-account.html',
  styleUrl: './linked-account.css',
})
export class LinkedAccount {

  router = inject(Router);
  private srv = inject(GHOService);

  defaultImage =
    'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg';

  previewImage: string | ArrayBuffer | null = null;

  personalDetails: any[] = [];
  primaryAccount: any = null;
  secondaryAccounts: any[] = [];

  tv: tags[] = [];

  patientId = this.srv.getsession('id');

  activeId: string = '';
  token: string = '';

  ngOnInit() {
    this.linkedAcc();
  }

  account() {
    this.router.navigate(['profile']);
  }

  // ============================
  // Load Linked Accounts
  // ============================
  linkedAcc() {

    this.tv = [
      { T: 'dk1', V: this.patientId },
      { T: 'c10', V: '25' }
    ];

    this.srv.getdata('patient', this.tv)
      .pipe(
        catchError((err) => {

          this.srv.openDialog(
            'Linked Accounts',
            'e',
            'Error while loading linked account'
          );

          throw err;
        })
      )
      .subscribe((r: any) => {

        console.log('API Response:', r);

        if (r && r.Status === 1 && r.Data?.length) {

          const accounts = r.Data[0];

          // All accounts
          this.personalDetails = [...accounts];

          // Primary account
          this.primaryAccount = accounts.find(
            (acc: any) => acc.AccountPreference === 'Primary'
          );

          // Secondary accounts
          this.secondaryAccounts = accounts.filter(
            (acc: any) => acc.AccountPreference === 'Secondary'
          );

          // Active ID
          this.activeId = this.primaryAccount?.ID || '';

          
          if (this.primaryAccount?.ID) {

            this.srv.setsession('id', this.primaryAccount.ID);
            this.patientId = this.primaryAccount.ID;

          }

          console.log('Primary:', this.primaryAccount);
          console.log('Secondary:', this.secondaryAccounts);

        } else {

          console.error('Invalid response', r);

          this.personalDetails = [];
          this.primaryAccount = null;
          this.secondaryAccounts = [];

        }

      });

  }

  // ============================
  // Switch Account
  // ============================
  switchAccount(item: any) {

    const targetId = item.ID;

    // ✅ Always use latest primary
    const currentPrimary = this.primaryAccount;

    if (!currentPrimary) {
      console.error('No primary found');
      return;
    }

    const tags: tags[] = [
      { T: 'dk1', V: currentPrimary.ID },
      { T: 'dk2', V: targetId },
      { T: 'c10', V: '26' }
    ];

    this.srv.getdata('patient', tags)
      .pipe(
        catchError((err) => {

          this.srv.openDialog(
            'Linked Accounts',
            'e',
            'Error while switching account'
          );

          throw err;
        })
      )
      .subscribe((res: any) => {

        console.log('Switch Response:', res);

        if (res && res.Status === 1) {

          console.log('Switch success. Reloading accounts...');

          
          this.linkedAcc();

        } else {

          console.error('Switch failed', res);

        }

      });

  }

}
