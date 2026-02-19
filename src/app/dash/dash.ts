import { GHOService } from '../services/ghosrvs';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

import { Router } from "@angular/router";
import { ghoresult, tags } from '../model/ghomodel';
import { MatDividerModule } from '@angular/material/divider';
import { CustomDialog } from '../shared/custom-dialog/custom-dialog';
import { GeneralPhysician } from '../home-care/general-physician/general-physician';
import { PharmacyDelivery } from '../home-care/pharmacy-delivery/pharmacy-delivery';
import { NursingServices } from '../home-care/nursing-services/nursing-services';
import { Physiotherapy } from '../home-care/physiotherapy/physiotherapy';
import { LabCollection } from '../home-care/lab-collection/lab-collection';
import { WelcomeSection } from '../welcome-section/welcome-section';
import { UserCard } from './user-card/user-card';
import { UpcomingAppointments } from './upcoming-appointments/upcoming-appointments';
import { SubscriptionHeader } from './subscription-header/subscription-header';
import { Services } from './services/services';
import { Banner } from './banner/banner';
import { Healthcare } from './healthcare/healthcare';
import { Graph } from './graph/graph';
import { Nutrition } from './nutrition/nutrition';


@Component({
  selector: 'rev-dashboard',
  templateUrl: './dash.html',
  standalone: true,
  styleUrl: './dash.css',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule,
    MatFormFieldModule, MatIconModule, MatSelectModule,SubscriptionHeader,Banner,Nutrition,Graph,
    FormsModule, MatDividerModule,WelcomeSection,UserCard,UpcomingAppointments,Services,Healthcare,
    CustomDialog, GeneralPhysician, PharmacyDelivery, NursingServices, Physiotherapy, LabCollection],
})
export class RevDash implements OnInit {
  srv = inject(GHOService);
  userid: string = "";
  pw: string = "";
  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  showGeneralPhysicianPopup = false;
  showPharmacyDeliveryPopup = false;
  showNursingServicesPopup = false;
  showPhysiotherapyPopup = false;
  showScheduleLabPopup = false;

  router = inject(Router)
  ngOnInit(): void {
    setInterval(() => {
      this.next();
    }, 3000);
  }


  images = [
    'dashboard/advertisement.png',
    'dashboard/ad2.jpg',
    'dashboard/ad3.jpg'
  ];

  currentIndex = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }



  openGeneralPhysician() {
    this.showGeneralPhysicianPopup = true;
  }
  closeGeneralPhysician() {
    this.showGeneralPhysicianPopup = false;
  }

  openPharmacyDelivery() {
    this.showPharmacyDeliveryPopup = true;
  }
  closePharmacyDelivery() {
    this.showPharmacyDeliveryPopup = false;
  }

  openNursingServices() {
    this.showNursingServicesPopup = true;
  }
  closeNursingServices() {
    this.showNursingServicesPopup = false;
  }

  openScheduleLabPopup() {
    this.showScheduleLabPopup = true;
  }
  closeScheduleLabPopup() {
    this.showScheduleLabPopup = false;
  }


  openshowPhysiotherapyPopup() {
    this.showPhysiotherapyPopup = true;
  }
  closeshowPhysiotherapyPopup() {
    this.showPhysiotherapyPopup = false;
  }

  navigateToSpecialty() {
    this.router.navigate(['specialty'])
  }

  getCardiologyDoctors(specialtyId: string) {
    this.router.navigate(['schedule/specialty', specialtyId]);
  }
  getNeurologyDoctors(specialtyId: string) {
    this.router.navigate(['schedule/specialty', specialtyId]);
  }
  getOncologyDoctors(specialtyId: string) {
    this.router.navigate(['schedule/specialty', specialtyId]);
  }
  getOrthopaedicDoctors(specialtyId: string) {
    this.router.navigate(['schedule/specialty', specialtyId]);
  }


 
}
  



