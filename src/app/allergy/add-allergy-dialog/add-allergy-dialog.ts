import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GHOService } from '../../services/ghosrvs';
import { ghoresult, tags } from '../../model/ghomodel';
import { catchError } from 'rxjs';

@Component({
  selector: 'add-allergy-dialog',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDialogModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-allergy-dialog.html',
  styleUrls: ['./add-allergy-dialog.css'],
})
export class AddAllergyDialog {

  srv = inject(GHOService);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  allergyName = '';
  reaction = '';
  diagnosedBy = '';
  severity = '';
  allergyId: any = null; 

  dialogRef = inject(MatDialogRef<AddAllergyDialog>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data) {
      this.allergyId = data.ID;
      this.allergyName = data.AllergyName;
      this.reaction = data.AllergicReaction;
      this.diagnosedBy = data.ReportedInstitution || '';
      this.severity = data.Severity || '';
    }
  }

  save() {
    this.tv = [
      { T: "dk1", V: this.srv.getsession('id') },
      { T: "dk2", V: this.allergyId ? this.allergyId :"" },
      { T: "c1", V: this.allergyName },
      { T: "c2", V: this.reaction },
      { T: "c3", V: this.diagnosedBy },
      { T: "c4", V: this.severity },
      { T: "c10", V: this.allergyId ? "2" : "1" }
    ];

    if (this.allergyId) {
      this.tv.push({ T: "dk2", V: this.allergyId });
    }

    this.srv.getdata("PatientAllergy", this.tv).pipe(
      catchError((err) => {
        this.srv.openDialog("Allergy Info", "e", this.allergyId ? "Error while updating allergy" : "Error while adding allergy");
        throw err;
      })
    ).subscribe((r) => {
      if (r.Status === 1) {
        this.srv.openDialog("Success", "s", this.allergyId ? "Allergy updated successfully!" : "Allergy added successfully!");
        this.dialogRef.close(true);
      } else {
        this.srv.openDialog("Error", "e", this.allergyId ? "Failed to update allergy" : "Failed to add allergy");
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
