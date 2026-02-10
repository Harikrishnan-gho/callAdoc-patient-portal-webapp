import { MatStepperModule } from '@angular/material/stepper';

import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GHOService } from '../../services/ghosrvs';
import { catchError } from 'rxjs';
import { tags, ghoresult } from '../../model/ghomodel'
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from "@angular/material/select";
import { GHOUtitity } from '../../services/utilities';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from "@angular/material/tabs";
import { GHOHelp } from "../../features/ghohelp";
import { RevQuestion } from '../question/question';
import { MatDialog } from '@angular/material/dialog';
import { RevSummary } from '../summary/summary';

@Component({
  selector: 'rev-case-detail',
  imports: [CommonModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatStepperModule, MatButtonModule, MatCheckboxModule, MatTabsModule, GHOHelp],
  templateUrl: './case-detail.html',
  styleUrl: './case-detail.css'
})

export class RevCaseDetail {
  @Input() id: string = "0";



  srv = inject(GHOService)
  utl = inject(GHOUtitity)
  constructor(private dialog: MatDialog, private cdr: ChangeDetectorRef) { }
  tv: tags[] = [];
  res: ghoresult = new ghoresult();

  submitbtn: boolean = false;
  rpt: boolean = false;
  new: boolean = false;

  prev: [][] = [];
  caseprv: [] = [];
  mediprv: [] = [];
  qprv: [] = [];
  docs: [] = [];
  drlist: [] = [];
  atts: [] = [];
  queries: any[] = [];


  submit() {

    this.tv = [
      { T: "dk1", V: this.id },
      { T: "c10", V: "17" }
    ];
    this.srv.getdata("reviewercase", this.tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status == 1) {
          this.srv.openDialog("Review", "s", r.Info);
        }
        else { this.srv.openDialog("Review", "w", r.Info); }
      });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      if (changes['id'].currentValue != changes['id'].previousValue) {
        this.getcase();
      }
      else {
        this.id = "0";
      }
    }
  }

  openquestion(query: any) {
    const headerHeight = 80;
    const dialogRef = this.dialog.open(RevQuestion, {
      data: { ...query },
      maxWidth: '800px',
      panelClass: 'center-dialog-panel',
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe(result => {


      if (!result?.submitted) return

      const q = result.data

      this.tv = [
        { T: "dk1", V: this.id },
        { T: "dk2", V: q.id },
        { T: "c1", V: q.Answer },
        { T: "c2", V: q.Support },
        { T: "c10", V: "16" }
      ];

      this.srv.getdata("reviewercase", this.tv)
        .pipe(catchError(err => { throw err; }))
        .subscribe(r => {
          if (r.Status == 1) {
            this.qprv = r.Data[1];
            this.srv.openDialog("Review", "s", "Answers submitted successfully");
            this.cdr.detectChanges();
          }
        });

    }
    );
  }

  addSummary() {
    this.tv = [
      { T: "dk1", V: this.id },
      { T: "c1", V: this.caseprv["SummaryOfRecords"] },
      { T: "c10", V: "14" }
    ];
    this.srv.getdata("reviewercase", this.tv)
      .pipe(
        catchError(err => {
          this.srv.openDialog("Error", "e", "Something went wrong while saving the summary.");
          throw err;
        })
      )
      .subscribe(r => {
        if (r.Status == 1) {
          this.srv.openDialog("Summary Saved", "s", "Summary added successfully.");
        } else {
          this.srv.openDialog("Failed", "e", "Unable to save the summary. Try again.");
        }
      });
  }
  opensummary(summary: string) {
    const headerHeight = 80;
    const dialogRef = this.dialog.open(RevSummary, {
      data: summary,
      maxWidth: '800px',
      panelClass: 'center-dialog-panel',
      enterAnimationDuration: '250ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.caseprv["SummaryOfRecords"] = result
        this.addSummary();
      }
    });
  }

  saveatt(e: any, a: string) {
    let c = 0;
    if (e.checked) c = 1
    this.tv = [];
    if (this.id == undefined || this.id == null || this.id == "") {
      this.srv.openDialog("Reviewer ", "s", "Please save your profile ");
      return;
    }
    this.tv.push({ T: "dk1", V: this.id })
    this.tv.push({ T: "dk2", V: a })
    this.tv.push({ T: "c1", V: c.toString() })
    this.tv.push({ T: "c10", V: "5" })
    this.srv.getdata("caseattestation", this.tv).pipe
      (
        catchError((err) => {
          throw err
        })
      ).subscribe((r) => {
        if (r.Status == 1) {

        }
      }
      );
  }
  getcase() {
    if (this.id == "0") return;
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.id })
    this.tv.push({ T: "c10", V: "13" })
    this.srv.getdata("reviewercase", this.tv).pipe
      (
        catchError((err) => { throw err })
      ).subscribe((r) => {
        if (r.Status == 1) {
          this.caseprv = r.Data[0][0];

          this.mediprv = r.Data[1];
          this.qprv = r.Data[2];
          this.docs = r.Data[3];
          this.atts = r.Data[4];

          this.cdr.detectChanges();
        }
      }
      );
  }

}