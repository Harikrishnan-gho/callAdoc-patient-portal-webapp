import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { tags } from '../../model/ghomodel';
import { GHOService } from '../../services/ghosrvs';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-closed-case-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './closed-case-details.html',
  styleUrls: ['./closed-case-details.css'],
})
export class ClosedCaseDetails implements OnInit, OnChanges {

  tv: tags[] = [];
  srv = inject(GHOService);
  caseDetails: any;
  patientDetails: any;
  medicalSummary: any;
  patientRecords: any;
  // reviewerRecords: any;
  reviewerRecords: any[] = [];
  medications: any;
  queries: any;
  id: string = "0";
  @Input() caseData: any;

  ngOnInit(): void {
    this.id = this.srv.getsession("id");
    if (this.caseData) {
      this.fetchCaseDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseData'] && this.caseData) {
      this.fetchCaseDetails();
    }
  }

  openFile(url: string) {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('File URL is missing!');
    }
  }

  getIcon(ext: string) {
    switch (ext) {
      case 'pdf':
        return 'case-detail-svgs/pdf.svg';

      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'case-detail-svgs/jpg.svg';

      case 'mp4':
      case 'mov':
      case 'm4a':
      case 'webm':
        return 'case-detail-svgs/audio-file.svg';

      default:
        return 'case-detail-svgs/file.svg';
    }
  }

  isAudio(ext: string): boolean {
    return ['mp3', 'wav', 'm4a', 'aac', 'ogg',].includes(ext);
  }

  fetchCaseDetails() {
    const caseReviewerId = this.caseData.CaseReviewerID;

    this.tv = [
      { T: "dk1", V: caseReviewerId },
      { T: "dk2", V: this.id },
      { T: "c10", V: "13" }
    ];

    this.srv.getdata("reviewercase", this.tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {

        if (r.Status === 1) {

          this.caseDetails = r.Data;
          this.patientDetails = r.Data[0][0];
          this.medicalSummary = r.Data[1][0];
          this.medications = r.Data[1] ?? [];
          this.queries = r.Data[2] ?? [];

          this.patientRecords = (r.Data[3] ?? []).map((file: any) => {
            const ext = file.FileName.split('.').pop()?.toLowerCase() || '';
            return {
              ...file,
              extension: ext,
              showAudio: false
            };
          });


          this.reviewerRecords = (r.Data[5] ?? []).map((file: any) => {
            const ext = file.FileName.split('.').pop()?.toLowerCase() || '';
            return {
              ...file,
              extension: ext,
              showAudio: false
            };
          });

        }

      });
  }

}
