import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'book-appointment-dialog',
  imports: [ CommonModule],
  templateUrl: './book-appointment-dialog.html',
})
export class BookAppointmentDialog {
  data = inject(MAT_DIALOG_DATA);
  constructor(
    public dialogRef: MatDialogRef<BookAppointmentDialog>,

  ) { }

  close() {
    this.dialogRef.close();
  }
}
