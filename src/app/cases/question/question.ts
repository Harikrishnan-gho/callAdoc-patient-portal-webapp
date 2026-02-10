import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";

@Component({
  selector: 'rev-question',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule],
  templateUrl: './question.html'
})

export class RevQuestion {
  activeTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<RevQuestion>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({ submitted: true, data: this.data })
  }
}
