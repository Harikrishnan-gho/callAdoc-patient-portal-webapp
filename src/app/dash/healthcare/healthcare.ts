import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'healthcare',
  imports: [CommonModule],
  templateUrl: './healthcare.html',
  styleUrl: './healthcare.css',
})
export class Healthcare {
  healthcare = [
    {
      title: "Wellness",
      icon: "dashboard/wellness.svg",
      color: "#E1DFFF",
      text: "#6C63FF"
    },
    {
      title: "Nutrition Care",
      icon: "dashboard/nutrition.svg",
      color: "#CDEDEC",
      text: "#2AA39F"
    },
    {
      title: "Mental Health Care",
      icon: "dashboard/mental-health.svg",
      color: "#FFF5D2",
      text: "#EBBC0F"
    }
  ]
}
