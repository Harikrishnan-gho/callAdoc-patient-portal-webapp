import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { catchError } from 'rxjs';
import { GHOService } from '../../services/ghosrvs';

@Component({
  selector: 'app-general-physician',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './general-physician.html',
  styleUrls: ['./general-physician.css']
})
export class GeneralPhysician {

  constructor(public srv: GHOService) {}
  private service = inject(GHOService);
  booking = {
    date: null as Date | null,
    hour: '09',
    minute: '00',
    ampm: 'AM',
    name: '',
    phone: '',
    address: ''
  };
  userId = "";
 @Output() close = new EventEmitter<void>();

  hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

    ngOnInit(): void {
    this.userId = this.service.getsession("id");
  
  }

  confirmBooking(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    let formattedDate = '';
    if (this.booking.date) {
      const d = this.booking.date;
      formattedDate = `${String(d.getDate()).padStart(2, '0')}/${
        String(d.getMonth() + 1).padStart(2, '0')
      }/${d.getFullYear()}`;
    }

    const time = `${this.booking.hour}:${this.booking.minute} ${this.booking.ampm}`;

    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: formattedDate },
      { T: 'c1', V: time },
      { T: 'c2', V: this.booking.name },
      { T: 'c3', V: this.booking.phone },
      { T: 'c4', V: this.booking.address },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('generalphysician', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          const msg = r.Data[0][0]?.msg;
          this.srv.openDialog('Booking Request', 's', msg);
          this.close.emit();    
          form.resetForm({
            hour: '09',
            minute: '00',
            ampm: 'AM'
          });
        } else {
          this.srv.openDialog('Booking Request', 'w', r.Info);
        }
      });
  }

  closePopup() {
    this.close.emit();
  }
}
