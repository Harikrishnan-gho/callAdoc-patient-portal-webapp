import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatTabsModule } from "@angular/material/tabs";

@Component({
  selector: 'rev-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatDialogModule, MatButtonModule, MatInputModule],
  templateUrl:'./summary.html'})
  
export class RevSummary {
  activeTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<RevSummary>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }
}
