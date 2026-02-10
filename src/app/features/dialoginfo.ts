import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle,
} from '@angular/material/dialog';

export interface dMsg {
  t: string;
  m: string;
}

@Component({
  selector: 'dialog-info',
    standalone: true,
  template: `
    <div style="min-width: 400px;">
    <table class="w100">
      <tr>
        <td class="pl20"><img src="logo.png" style="width: 50px; ">
        </td>
        <td>
          <h2 mat-dialog-title>{{data.t}}</h2>
        </td>
        <td class="right pr10">
          <i class="bi bi-x-circle fs-3 red pointer" matButton mat-dialog-close></i>
        </td>
      </tr>
    </table>
  <mat-dialog-content class="bt">
    <div  [innerHTML]="data.m"></div> 
  </mat-dialog-content>
    
  <mat-dialog-actions>
    <button matButton mat-dialog-close>Close</button>
  </mat-dialog-actions>
    
  `,
  imports: [FormsModule, MatButtonModule,
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
  ],
})
export class DialogInfo {
  readonly dialogRef = inject(MatDialogRef<DialogInfo>);
  data = inject<dMsg>(MAT_DIALOG_DATA);
}
