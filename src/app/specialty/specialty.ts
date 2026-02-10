import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GHOService } from '../services/ghosrvs';
import { GHOUtitity } from '../services/utilities';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-specialty',
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatIconModule, MatDividerModule, MatTabsModule],
  templateUrl: './specialty.html',
  styleUrl: './specialty.css',
})
export class Specialty {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  router = inject(Router)
  specialtyList: any[] = [];
  filteredSpecialtyList: any[] = [];
  selectedSpecialtyId: string;
  selectedSpecialty: string;
  showDoctorBySpecialtyPopup = false;
  doctorsBySpecialty: any = []
  tbidx: number = 0;


  onSearchSpecialty(event: Event) {
    const value = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();

    if (!value) {
      this.filteredSpecialtyList = [...this.specialtyList];
      return;
    }

    this.filteredSpecialtyList = this.specialtyList.filter(specialty =>
      specialty.SpecialtyName.toLowerCase().includes(value)
    );
  }

  ngOnInit(): void {
    this.getSpecialites()
  }

  getSpecialites() {
    const tv = [
      { T: 'c10', V: '3' }
    ];
    this.srv.getdata('specialty', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          this.specialtyList = r.Data[0]
          this.filteredSpecialtyList = [...this.specialtyList];
        } else {
          this.srv.openDialog('Specialty List', 'w', r.Info);
        }
      });
  }

  navigateToDashboard() {
    this.router.navigate(['dash'])
  }

  openDoctorBySpecialty(specialty: any) {
    this.selectedSpecialtyId = specialty.ID;
    this.selectedSpecialty = specialty.SpecialtyName;
    if (this.selectedSpecialtyId) {
      this.getDoctorsBySpecialites(this.selectedSpecialtyId)
    }
    this.tbidx = 1
  }


  getDoctorsBySpecialites(specialtyId: string) {
    const tv = [
      { T: 'dk1', V: specialtyId },
      { T: 'c10', V: '10' }
    ];
    this.srv.getdata('doctors', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          this.doctorsBySpecialty = r.Data[0]
        } else {
          this.srv.openDialog('Specialty List', 'w', r.Info);
        }
      });
  }

  bookAppointment(doctor: any) {
    this.router.navigate(['/schedule/doctor', doctor.ID]);
  }

}
