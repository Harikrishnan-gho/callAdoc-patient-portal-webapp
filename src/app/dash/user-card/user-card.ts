import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'user-card',
  imports: [MatCardModule, MatProgressBarModule, MatButtonModule,MatIconModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {

}
