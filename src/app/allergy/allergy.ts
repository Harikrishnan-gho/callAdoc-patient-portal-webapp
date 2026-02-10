import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AddAllergyDialog } from './add-allergy-dialog/add-allergy-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GHOService } from '../services/ghosrvs';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'allergy',
  imports: [MatButtonModule, MatIconModule, MatChipsModule, AddAllergyDialog, MatDialogModule],
  templateUrl: './allergy.html',
  styleUrl: './allergy.css',
})
export class Allergy implements OnInit {

  constructor(private dialog: MatDialog) { }

  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  allergies: [] = [];

  ngOnInit(): void {
    this.getAllergies();
  }

  getAllergies() {
    this.tv = [
      { T: "dk1", V: this.srv.getsession('id') },
      { T: "dk2", V: "0" },
      { T: "c10", V: "3" }
    ];
    this.srv.getdata("PatientAllergy", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Allergy Info", "e", "Error while loading allergy");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.allergies = r.Data[0];
      }
    });

  }

  editAllergy(allergy: any) {
    const dialogRef = this.dialog.open(AddAllergyDialog, {
      width: '600px',
      disableClose: false,
      data: allergy
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllergies();
    });
  }
  
  deleteAllergy(id: any, name: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Allergy',
        message: `Are you sure you want to delete "${name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.tv = [
        { T: "dk1", V: this.srv.getsession('id') },
        { T: "dk2", V: id },
        { T: "c10", V: "4" }
      ];

      this.srv.getdata("PatientAllergy", this.tv).pipe(
        catchError((err) => {
          this.srv.openDialog("Allergy Info", "e", "Error while deleting allergy");
          throw err;
        })
      ).subscribe((r) => {
        if (r.Status === 1) {
          this.srv.openDialog("Success", "s", "Allergy Deleted Successfully");
          this.getAllergies()
        } else {
          this.srv.openDialog("Error", "e", "Failed to delete allergy");
        }
      });
    });
  }

  addAllergy() {
    const dialogRef = this.dialog.open(AddAllergyDialog, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllergies();
    });
  }

}
