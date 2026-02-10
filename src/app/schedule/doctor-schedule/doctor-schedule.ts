import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { tags, ghoresult } from '../../model/ghomodel';
import { GHOService } from '../../services/ghosrvs';
import { formatDate } from '@angular/common';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface Slot {
  ID: number;
  AppointmentTime: string;
}

interface AppointmentPayload {
  doctorId: string;
  selectedDate: string;
  selectedTimeId: number;
  selectedTime: string;
}


@Component({
  selector: 'doctor-schedule',
  imports: [MatCardModule, MatDatepickerModule, CommonModule, MatButtonModule, MatIconModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './doctor-schedule.html',
})



export class DoctorSchedule implements OnInit, OnChanges {



  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  slots: Slot[] = [];

  selectedTimeId!: number;
  selectedTime!: string;
  router = inject(Router)
  selected: Date = new Date();
  selectedDate: string = formatDate(new Date(), 'dd/MM/yyyy', 'en-IN');

  @Input() doctor: string;


 @Output() bookAppointment = new EventEmitter<AppointmentPayload>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctor'] && this.doctor) {
      this.loadSlotsForCurrentDate();
    }
  }

  timeSelected(slot: Slot) {
    this.selectedTimeId = slot.ID;
    this.selectedTime = slot.AppointmentTime;
  }


  // onBookAppointment() {
  //   this.tv = [
  //     { T: "dk1", V: this.selectedTimeId },
  //     { T: "dk2", V: this.srv.getsession('id') },
  //     { T: "c10", V: "1" }
  //   ];

  //   this.srv.getdata("appointment", this.tv).pipe(
  //     catchError((err) => {
  //       this.srv.openDialog("Slots Info", "e", "Error while booking appointment");
  //       throw err;
  //     })
  //   ).subscribe((r) => {
  //     if (r.Status === 1) {
  //       this.srv.openDialog("Success", "s", "Appointment booked successfully!");
  //     } else {
  //       this.srv.openDialog("Error", "e", "Failed to book appointment");
  //     }
  //   });
  // }

  onBookAppointment() {
    if (!this.selectedTimeId) {
      this.srv.openDialog('Slot Required', 'e', 'Please select a time slot');
      return;
    }

    this.bookAppointment.emit({
      doctorId: this.doctor,
      selectedDate: this.selectedDate,
      selectedTimeId: this.selectedTimeId,
      selectedTime: this.selectedTime
    });
  }

  dateselected(e: any) {
    this.selectedDate = formatDate(e, 'dd/MM/yyyy', 'en-IN');
    this.loadSlots(this.selectedDate);
  }

  private loadSlotsForCurrentDate() {
    this.loadSlots(this.selectedDate);
  }

  private loadSlots(date: string) {
    this.tv = [
      { T: "dk1", V: this.doctor },
      { T: "dk2", V: date },
      { T: "c10", V: "11" }
    ];

    this.srv.getdata("prxcare", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Slots Info", "e", "Error while loading slot info");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.slots = r.Data[0];
      }
    });
  }

  // navigateToMakePayment() {
  //   this.router.navigate([
  //     'make-payment/slot',
  //     this.selectedTimeId
  //   ]);
  // }

}
