import { Component, inject, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatRadioGroup, MatRadioButton, MatRadioModule, MatRadioChange } from '@angular/material/radio';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs';
import { GHOService } from '../services/ghosrvs';
import { GHOUtitity } from '../services/utilities';
import { tags } from '../model/ghomodel';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ClosedCaseDetails } from './closed-case-details/closed-case-details';
import { RevCaseDetail } from "./case-detail/case-detail";

@Component({
  selector: 'rev-cases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLabel,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatRadioGroup,
    MatRadioModule,
    MatRadioButton,
    MatPaginatorModule,
    MatPaginator,
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    ClosedCaseDetails,
    RevCaseDetail
],
  templateUrl: './cases.html',
  styleUrl: './cases.css',
})
export class RevCases {

  msg: string = "";
  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  ds: [] = [];
  id: string = "0";
  caseid: string = "0";
  caseReviewerId: string = "0";
  tbidx: number = 0;
  listtitle: string = "";
  selectedCase: any = null;
  selectedFiles: File[] = [];
  caseDetails: any;
  fileType: string = "0";
  fileId: string = "0";
  fileUploadId: any;
  medicalSummary: any;
  patientFiles: any[] = [];
  reviewerFiles: any[] = [];
  medications: any[] = [];
  faq: any[] = [];
  queries: any[] = [];
  medicalSummaryText: string = "";
  isRecording = false;
  selectedRow: any = null;
  url: any;
  isOpenCase: boolean = true;

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private rt: ActivatedRoute, private dialog: MatDialog, private gho: GHOService) { }

  columns: string[] = ['Patient Name', 'Age', 'TimeAllowed', 'DueDate', "Priority", "Status"];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.id = this.srv.getsession("id");
    if (!this.srv.validstr(this.id) || this.id.length < 10) {
      this.srv.openDialog("Cases", "w", "Invalid credential, please login !");
      this.srv.logout();
      return;
    }
    this.caselist("6");
  }

  getlist(e: MatRadioChange) {
    this.isOpenCase = e.value === "6";
    this.caselist(e.value);
    this.tbidx = 0;
  }


  onRowClick(r: any) {
    this.caseid = r.CaseID;
    this.caseReviewerId = r.CaseReviewerID;
    this.selectedCase = r;
    this.tbidx = 1;
    this.getCaseDetails(this.caseid, this.caseReviewerId);
    this.selectedRow = r;
  }

  caselist(v: any) {
    this.listtitle = v === "6" ? "  (Open)" : " (Closed) ";
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.id });
    this.tv.push({ T: "c10", V: v });

    this.srv.getdata("reviewercase", this.tv)
      .pipe(catchError((err) => { throw err; }))
      .subscribe((r) => {
        if (r.Status == 1) {
          this.ds = r.Data[0];
          this.dataSource.data = this.ds;
        }
      });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = this.selectedFiles.concat(Array.from(files));
      this.selectedFiles = this.selectedFiles.filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name)
      );
    }
    event.target.value = '';
  }

  removeFile(index: number) { this.selectedFiles.splice(index, 1); }

  addSummary(caseReviewerId: string, summary: string) {

    if (!summary || summary.trim() === "") {
      this.gho.openDialog("Missing Summary", "w", "Please enter a summary before submitting.");
      return;
    }

    this.tv = [
      { T: "dk1", V: caseReviewerId },
      { T: "c1", V: summary },
      { T: "c10", V: "14" }
    ];

    this.srv.getdata("reviewercase", this.tv)
      .pipe(
        catchError(err => {
          this.gho.openDialog("Error", "e", "Something went wrong while saving the summary.");
          throw err;
        })
      )
      .subscribe(r => {

        if (r.Status == 1) {
          this.gho.openDialog("Summary Saved", "s", "Summary added successfully.");

          if (this.selectedFiles.length > 0) {
            this.selectedFiles.forEach(file =>
              this.uploadReview(caseReviewerId, file.name, file.size, file)
            );
          }

        } else {
          this.gho.openDialog("Failed", "e", "Unable to save the summary. Try again.");
        }
      });
  }



  uploadReview(caseReviewerId: any, fileName: any, fileSize: any, file: File) {
    this.tv = [
      { T: "dk1", V: caseReviewerId },
      { T: "c1", V: "1" },
      { T: "c2", V: fileName },
      { T: "c3", V: fileSize },
      { T: "c10", V: "1" }
    ];

    this.srv.getdata("filemgr", this.tv)
      .subscribe(r => {
        if (r.Status == 1) {
          this.fileType = r.Data[0][0].ftype;
          this.fileId = r.Data[0][0].fid;
          this.fileUploadId = r.Data[0][0].id;
          this.getAwsUploadUrl(file);
        }
      });
  }

  getAwsUploadUrl(file: File) {
    this.srv.awsfileuploadinfo(this.fileId, this.fileType)
      .subscribe({
        next: (res: any) => {
          const url = res?.Url;
          if (url) {
            fetch(url, { method: 'PUT', body: file })
              .then(response => {
                const status = response.status === 200 ? 2 : 3;

                this.tv = [
                  { T: "dk1", V: this.id },
                  { T: "dk2", V: "1" },
                  { T: "c1", V: this.fileUploadId },
                  { T: "c2", V: status.toString() },
                  { T: "c3", V: this.caseReviewerId },
                  { T: "c10", V: "2" }
                ];

                this.srv.getdata("filemgr", this.tv).subscribe({
                  next: r => { },
                });
              })
              .catch(err => console.error(`Upload failed: ${file.name}`, err));
          }
        },
        error: (err) => console.error("AWS Upload Error:", err)
      });
  }


  getCaseDetails(caseid: any, caseReviewerId: any) {
    this.tv = [];
    this.tv.push({ T: "dk1", V: this.caseReviewerId });
    this.tv.push({ T: "dk2", V: this.id });
    this.tv.push({ T: "c10", V: "13" });

    this.srv.getdata("reviewercase", this.tv)
      .pipe(catchError((err) => { throw err; }))
      .subscribe((r) => {
        if (r.Status == 1) {
          this.caseDetails = r.Data[0];
          this.medicalSummaryText = this.caseDetails[0]?.SummaryOfRecords || '';
          this.medicalSummary = r.Data[1][0];
          this.medications = r.Data[2];
          this.faq = r.Data[3];
          if (r.Data[4] && r.Data[4][0].UserType?.trim() === 'C') {

            this.patientFiles = r.Data[4].map((file: any) => {
              const ext = file.FileName.split('.').pop()?.toLowerCase();
              return {
                ...file,
                extension: ext
              };
            });
          }

          const reviewerData = r.Data[5] || [];
          this.reviewerFiles = reviewerData
            .filter((file: any) => file.UserType?.trim() === 'CR')
            .map((file: any) => {
              const ext = file.FileName.split('.').pop()?.toLowerCase();
              return {
                ...file,
                extension: ext
              };
            });

          this.queries = this.faq.map((item: any) => ({
            questionId: item.id ?? "",
            question: item.Question ?? "",
            answer: item.Answer ?? "",
            support: item.Support ?? "",
          }));
        }
      });
  }

  isAudio(ext: string): boolean {
    const audioExtensions = ['mp3', 'm4a', 'wav', 'mov', 'aac'];
    return audioExtensions.includes(ext?.toLowerCase());
  }

  openFile(file: any) {
    if (file?._url) {
      window.open(file._url, '_blank');
    }
  }

  addQuestionSupport(questionId: string, caseReviewerId: string, answer: string, support: string) {
    this.tv = [
      { T: "dk1", V: caseReviewerId },
      { T: "dk2", V: questionId },
      { T: "c1", V: answer },
      { T: "c2", V: support },
      { T: "c10", V: "16" }
    ];

    this.srv.getdata("reviewercase", this.tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status == 1) {
        }
      });
  }



  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
