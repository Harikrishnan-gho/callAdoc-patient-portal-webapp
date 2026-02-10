import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ghoresult, tags } from '../../model/ghomodel';
import { GHOService } from '../../services/ghosrvs';
import { GHOUtitity } from '../../services/utilities';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-nursing-services',
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule],
  templateUrl: './nursing-services.html',
  styleUrl: './nursing-services.css',
})
export class NursingServices {

  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  userId = "";

  patientDetails = {
    type: '',
    date: null as Date | null,
    duration: '',
    name: '',
    phone: '',
    address: ''
  };

  private service = inject(GHOService);
   @Output() close = new EventEmitter<void>();

    PostSurgicalCare = [
    "Elderly Care",
    "Chronic Disease Management",
    "Palliative Care",
    "Mother & Baby Care",
    "Wound Dressing & Care",
    "IV / IM Injections",
    "Catheter & Ryle's Tube Care",
    "Home ICU Support",
    "Tracheostomy Care",
    "Respiratory / Nebulization Care",
    "Physiotherapy Assistance",
    "Diabetes Care",
    "Blood Pressure Monitoring"]

    ngOnInit(): void {
    this.userId = this.service.getsession("id");
  
  }

  confirmBooking(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

        let formattedDate = '';
    if (this.patientDetails.date) {
      const d = this.patientDetails.date;
      formattedDate = `${String(d.getDate()).padStart(2, '0')}/${
        String(d.getMonth() + 1).padStart(2, '0')
      }/${d.getFullYear()}`;
    }


    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.patientDetails.type },
      { T: 'c1', V: this.patientDetails.duration },
      { T: 'c2', V: formattedDate },
      { T: 'c3', V: this.patientDetails.name },
      { T: 'c4', V: this.patientDetails.phone },
      { T: 'c5', V: this.patientDetails.address },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('nursingservices', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          const msg = r.Data[0][0]?.msg;
          this.srv.openDialog('Booking Request', 's', msg);
          this.close.emit();
          form.resetForm({});
        } else {
          this.srv.openDialog('Booking Request', 'w', r.Info);
        }
      });
  }

    closePopup() {
    this.close.emit();
  }
}
