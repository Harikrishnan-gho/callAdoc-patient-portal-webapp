import { Component, inject, Inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { catchError, filter } from 'rxjs/operators';
import { MatIcon } from "@angular/material/icon";
import { tags, ghoresult } from './model/ghomodel';
import { GHOService } from './services/ghosrvs';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EmailPopup } from './email-popup/email-popup';
import { MatMenuModule } from '@angular/material/menu';
import { SubscriptionHeader } from './dash/subscription-header/subscription-header';
import { Services } from './dash/services/services';

export interface MenuItem {
  name: string;
  Icon: string;
  link: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIcon, CommonModule, MatDialogModule, SubscriptionHeader,Services,
    MatButtonModule, EmailPopup, MatMenuModule],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'Global Second Opinion Network';
  footerUrl = 'https://globalhealthopinion.com';
  footerLink = 'Global Health Opinion';

  showNavbar: boolean = true;
  hiddenRoutes: string[] = ['/', '/login', '/join', '/bid/', '/broadcasted-case', '/signup'];
  isjoin: boolean = false;

  srv = inject(GHOService);
  userid: string = "";
  pw: string = "";
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  menuItems: MenuItem[] = [];
  userInfo: any = [];
  selectedItem: any = null;
  selectedMenu: string = 'Dashboard';
  selectedTab: number | null = null;
  doctorId: string = '';
  currentRoute: string = '';

  notifications = [
    { message: 'Your Appointment(REF#Ap0018) with DR. Sofia John has been successfully scheduled on Feb 04, 2026 2:00 PM' },
  ];

  constructor(private router: Router, private dialog: MatDialog) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects.split('?')[0];
      this.currentRoute = currentUrl;
      this.showNavbar = !this.hiddenRoutes.includes(currentUrl);
      this.isjoin = (event.urlAfterRedirects === "/join");
      if (currentUrl.substring(0, 5) == "/bid/") this.showNavbar = false

      if (this.showNavbar) {
        this.getmenu();
      }

      const current = this.menuItems.find(m => m.link === event.urlAfterRedirects);
      this.selectedMenu = current ? current.name : '';

      // Reset local storage if needed
      localStorage.setItem("tkn", "");
      localStorage.setItem("id", "");
    });
  }
  isDashPage(): boolean {
    return this.currentRoute === '/dash';
  }
  goToEmergency() {
    this.router.navigate(['/emergenservices']);
  }

 
  naviagteToProfile() {
    this.router.navigate([`/profile`]);

  }
  bookAppointment() {
    this.router.navigate(['/schedule']);
  }

  ngOnInit(): void {
    this.doctorId = this.srv.getsession('id');
    if (this.doctorId) {
      this.getUserDetails()
    }
    const navMain = document.getElementById('navbarCollapse');
    if (navMain) {
      navMain.onclick = () => {
        if (navMain) {
          navMain.classList.remove("show");
        }
      }
    }
  }



  @ViewChild('emailPopup') emailPopup!: EmailPopup;

  openEmailPopup() {
    this.emailPopup.openPopup();
  }


  logout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: { title: 'Logout', message: 'Are you sure you want to logout?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.srv.logout();
      }
    });
  }
  changeLang(lang: string) {
    console.log("Selected Language:", lang);
  }
  // Desktop sidebar menu click
  onMenuClick(item: any) {

    if (item.name === 'Logout') {
      this.logout();
    } else {
      this.selectedMenu = item.name;
      this.srv.navigate(item.link);
    }
  }

  // Mobile sidebar menu click
  onMobileMenuClick(item: any) {
    this.onMenuClick(item);

    const offcanvasEl = document.getElementById('mobileSidebar');
    if (offcanvasEl) {
      try {
        const offcanvasInstance: any = (window as any).bootstrap?.Offcanvas.getInstance(offcanvasEl);
        offcanvasInstance?.hide();
      } catch (e) {
        console.error('Offcanvas close error:', e);
      }
    }
  }

  // Fetch menu from service
  getmenu() {
    this.tv = [];
    this.srv.getdata("menu", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Menu", "e", "error while loading menu");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.menuItems = r.Data[0];
      }
    });
  }

  getUserDetails() {
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.doctorId });
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
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class=""> <img class="logo" src="apollo-logo.png" /> </div>
      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      <mat-dialog-content class="dialog-content">{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button class="btn-no" (click)="onNoClick()">Cancel</button>
        <button mat-button color="primary" class="btn-yes" (click)="onYesClick()">Yes, Log Out</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 30px;
      min-width: 300px;
    }

    .dialog-title {
      margin: 0 0 12px 0;
      font-weight: 400;
    }

    .dialog-content {
      margin-bottom: 20px;
      font-size: 14px;
      color: #333;
    }
      .custom-dialog-container {
  z-index: 1100 !important; 
}


    .dialog-actions button {
      min-width: 70px;
    }

    .btn-no {
      color: #555;
      border-radius: 4px;
       cursor: pointer;
    }

  .btn-yes {
  background-color: rgb(12,121,165) !important; 
  color: #fff !important;              
  border-radius: 4px;
   cursor: pointer;
}
     .logo {
    width: 120px;
  }

  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }



}
