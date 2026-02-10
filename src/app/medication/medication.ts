import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {  MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { AddMedicationDialog } from './add-medication-dialog/add-medication-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';


@Component({
  selector: 'medication',
  imports: [MatIconModule, MatButtonModule , MatTabsModule, CommonModule, MatChipsModule, MatDialogModule],
  templateUrl: './medication.html',
  styleUrl: './medication.css',
})
export class Medication implements OnInit {

  constructor(private dialog: MatDialog) { }

  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  medications: [] = [];
  isEdit: boolean = true

  ngOnInit(): void {
    this.getMedications();
  }

  getMedications() {
    this.tv = [
      { T: "dk1", V: this.srv.getsession('id') },
      { T: "dk2", V: "0" },
      { T: "c10", V: "3" }
    ];
    this.srv.getdata("patientmedication", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Medication Info", "e", "Error while loading allergy");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {

        this.medications = r.Data[0];
        if (this.medications.length === 0) {
        }
      }
    });
  }

  editMedication(medication: any) {
    this.isEdit = true;
    const type: 'medication' | 'prescription' =
      medication.DocumentTypeID === 6 ? 'prescription' : 'medication';

    this.tv = [
      { T: "dk1", V: this.srv.getsession('id') },
      { T: "dk2", V: medication.ID },
      { T: "c10", V: "3" }
    ];

    this.srv.getdata("patientmedication", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Medication Info", "e", "Error while loading medication");
        throw err;
      })
    ).subscribe((r) => {

      if (r.Status !== 1 || !r.Data?.length) {
        this.srv.openDialog("Error", "e", "Medication not found");
        return;
      }

      const fullMedicationData = r.Data[0]?.[0];
      const files = r.Data[1] || [];

      this.dialog.open(AddMedicationDialog, {
        width: '600px',
        disableClose: false,
        data: {
          record: fullMedicationData,
          files: files,
          edit: this.isEdit,
          type
        }
      }).afterClosed().subscribe(() => {
        this.getMedications();
      });
    });
  }

  deleteMedication(id: any, name: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Medication',
        message: `Are you sure you want to delete "${name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.tv = [
        { T: "dk1", V: this.srv.getsession('id') },
        { T: "dk2", V: id },
        { T: "c10", V: "4" }
      ];

      this.srv.getdata("patientmedication", this.tv).pipe(
        catchError((err) => {
          this.srv.openDialog("Medication Info", "e", "Error while deleting medication");
          throw err;
        })
      ).subscribe((r) => {
        if (r.Status === 1) {
          this.srv.openDialog("Success", "s", "Medication Deleted Successfully");
          this.getMedications()
        } else {
          this.srv.openDialog("Error", "e", "Failed to delete Medication");
        }
      });
    });
  }

  addMedication() {
    this.isEdit = false;
    const dialogRef = this.dialog.open(AddMedicationDialog, {
      width: '600px',
      disableClose: false,
      data: {
        edit: this.isEdit
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      this.getMedications();
    });
  }

}
