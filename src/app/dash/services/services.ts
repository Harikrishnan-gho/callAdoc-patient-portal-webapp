import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'services',
  imports: [CommonModule,RouterModule],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {

  services = [
    {
      label: "Medical Records",
      icon: 'dashboard/calender.svg',
      link: '#'
    },
    {
      label: "Diet Plans",
      icon: 'dashboard/diet.svg',
      link: '/dietplan'
    },
    {
      label: "Vitals",
      icon: 'dashboard/vitals.svg',
      link: '#'
    },
    {
      label: "Medications & Prescriptions",
      icon: 'dashboard/med.svg',
      link: '#'
    },
    {
      label: "Allergy",
      icon: 'dashboard/allergy.svg',
      link: '#'
    },
    {
      label: "History",
      icon: 'dashboard/clock.svg',
      link: '#'
    },
    {
      label: "Insurance",
      icon: 'dashboard/insurance.svg',
      link: '#'
    },
    {
      label: "Payments",
      icon: 'dashboard/payments.svg',
      link: '#'
    },
  ]

}
