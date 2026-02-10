
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { DoctorDetails } from './doctor-details/doctor-details';
import { DoctorSchedule } from './doctor-schedule/doctor-schedule';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MakePayment } from './make-payment/make-payment';


@Component({
  selector: 'app-schedule',
  imports: [MatCardModule, CommonModule, MatButtonModule, MatTabsModule, MatIconModule, DoctorDetails, DoctorSchedule, MatFormFieldModule,
    MatInputModule, MatSelectModule,MakePayment],
  templateUrl: './schedule.html',
})
export class Schedule implements OnInit {

  constructor(private dialog: MatDialog) { }

  srv = inject(GHOService);
  userid: string = "";
  pw: string = "";
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  patientId: string;
  tbidx: number = 0;
  selectedDoc: any;
  docid: string = "";
  specialtyList: any[] = [];
  doctorsBySpecialty: any = [];
  selectedSpecialty: string | null = null;
  allDoctors: any[] = [];
  isDoctorRoute = false;
  appointmentData: any = null;

  searchText = '';
filteredDoctors: any[] = [];


  private service = inject(GHOService);
  router = inject(Router)
  route = inject(ActivatedRoute);

  ngOnInit(): void {

    this.getSpecialites();
    this.route.url.subscribe(url => {
      const id = this.route.snapshot.paramMap.get('id');

      this.isDoctorRoute = false;

      if (url.some(segment => segment.path === 'doctor')) {
        this.isDoctorRoute = true;
        this.docid = id;
        this.tbidx = 1;
        this.loadDoctorDetails(id!);
        return; 
      }

      if (url.some(segment => segment.path === 'specialty') && id) {
        this.selectedSpecialty = id;
        this.getDoctorsBySpecialites(id);
        this.tbidx = 0;
      }
    });
  }



  loadDoctorDetails(doctorId: string) {
    const tv = [
      { T: 'dk1', V: '' },
      { T: 'dk2', V: doctorId },
      { T: 'c10', V: '3' } 
    ];

    this.srv.getdata('doctors', tv).subscribe(r => {
      if (r.Status === 1) {
        this.selectedDoc = r.Data[0][0];
      } else {
        this.srv.openDialog('Doctor', 'w', r.Info);
      }
    });
  }



  reviewerId = "";
  doctorList: any = [];

  onAppointmentClick(doctor: any) {
    this.tbidx = 1
    this.selectedDoc = doctor;
    this.docid = doctor["ID"]
  }

  onBookAppointment(data: any) {
  this.appointmentData = data;
  this.tbidx = 2; 
}

  getDoctorList() {
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.srv.getsession("id") })
    this.tv.push({ T: "dk2", V: "0" })
    this.tv.push({ T: "c10", V: "3" });
    this.srv.getdata("doctors", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Doctor Info", "e", "error while loading doctor info");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.allDoctors = r.Data[0];
        this.doctorList = r.Data[0];
         this.filteredDoctors = [...this.allDoctors];

      }
    });
  }


  getSpecialites() {
    const tv = [{ T: 'c10', V: '3' }];
    this.srv.getdata('specialty', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          this.specialtyList = r.Data[0];
          const specialtyId = this.route.snapshot.paramMap.get('id');
          if (specialtyId) {
            this.selectedSpecialty = specialtyId;
            // this.getDoctorsBySpecialites(specialtyId);
          } else {
            this.selectedSpecialty = null;
            this.getDoctorList();
          }
        }
      });
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
          this.doctorList = r.Data[0]
           this.filteredDoctors = [...this.doctorList];
        } else {
          this.srv.openDialog('Specialty List', 'w', r.Info);
        }
      });
  }

  onSpecialtyChange(id: string | null) {
  this.selectedSpecialty = id;

  if (id) {
    this.router.navigate(['schedule', id]);
    this.getDoctorsBySpecialites(id);
  } else {
    this.router.navigate(['schedule']);
    this.doctorList = this.allDoctors;
    this.applyFilters();
  }
}

  applyFilters() {
  let list = this.selectedSpecialty
    ? this.doctorList
    : this.allDoctors;

  if (this.searchText) {
    const value = this.searchText.toLowerCase();
    list = list.filter(doc =>
      doc.Doctor?.toLowerCase().includes(value) ||
      doc.Designation?.toLowerCase().includes(value)
    );
  }

  this.filteredDoctors = [...list];
}


onSearchDoctor(event: Event) {
  this.searchText = (event.target as HTMLInputElement).value
    .toLowerCase()
    .trim();

  this.applyFilters();
}


}
