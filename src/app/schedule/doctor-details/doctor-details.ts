import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { GHOService } from '../../services/ghosrvs';
import { ghoresult, tags } from '../../model/ghomodel';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'doctor-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  templateUrl: './doctor-details.html',
})
export class DoctorDetails implements OnChanges {

  private srv = inject(GHOService);

  @Input() docinfo: any;

  tv: tags[] = [];
  doctorDetails: any;
  specialInterests: [] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['docinfo']?.currentValue) return;

    this.tv = [
      { T: 'dk1', V: this.docinfo.ID },
      { T: 'c10', V: '9' }
    ];

    this.srv.getdata('doctors', this.tv)
      .pipe(
        catchError(err => {
          this.srv.openDialog(
            'Doctor Info',
            'e',
            'Error while loading doctor info'
          );
          return EMPTY;
        })
      )
      .subscribe(r => {
        if (r?.Status === 1 && r.Data?.length) {
          this.doctorDetails = r.Data[0][0];
          this.specialInterests=r.Data[1];
        }
      });
  }
}
