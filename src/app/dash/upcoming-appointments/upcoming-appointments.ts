import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'upcoming-appointments',
  imports: [MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './upcoming-appointments.html',
  styleUrl: './upcoming-appointments.css',
})
export class UpcomingAppointments {

}
