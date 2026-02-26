import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { GHOService } from '../services/ghosrvs';
import { GHOUtitity } from '../services/utilities';
import { ghoresult, tags } from '../model/ghomodel';
import { catchError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CustomDialog } from '../shared/custom-dialog/custom-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule,
    MatFormFieldModule, CustomDialog, MatProgressSpinnerModule,
    MatInputModule, MatIconModule, MatButtonModule,
    MatDatepickerModule, MatPaginatorModule, MatMenuModule,
    MatNativeDateModule, MatTableModule 
  ],
  templateUrl: './medical-records.html',
  styleUrl: './medical-records.css',
})
export class MedicalRecords {

  filename: string;
  filesize: string;
  srv = inject(GHOService);
  utl = inject(GHOUtitity);
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  tbidx: number = 0;
  medicalRecordList: any = []
  userId = "";
  showEditMedicalRecordPopup = false;
  medicalRecordId: string = ''
  filteredmedicalRecords: any[] = [];
  selectedFileName = '';
  selectedUploadFile: File | null = null;
  selectedRecord: any = null;
  fileType = '';
  fileId = '';
  fileUploadId = '';
  recordID = '';
  isLoadingFileUpload = false;
  uploadedOn!: Date;
  selectedFileSize: number = 0;
  selectedTabIndex: number = 0;
  mode: string = 'U';
  private service = inject(GHOService);
  searchText: string = '';
  selectedDate: Date | null = null;
  selectedType: String | null = null;
  originalData: any = [];

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) { }

  applyFilter(type: string) {
    console.log('Filter:', type);
  }


  goToDetails(file: any) {
    this.selectedRecord = file;
    this.selectedTabIndex = 1;
  }
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  downloadFile(file: any) {
    this.http.get(file.URL, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     console.log('Selected file:', file.name);
  //   }
  // }

  displayedColumns: string[] = ['filename', 'uploadedOn', 'actions'];

  gotoUpload() {
    this.mode = "U";
    this.getUserMedicalRecords();
  }

  gotoShared() {
    this.mode = "S";
    this.dataSource.data = this.Shared;
  }

  Shared = [
    {
      filename: 'ESR Test result Reenu P Prathap 29032026.pdf',
      filesize: '3.6 MB',
      uploadedOn: '24 Mar 2026'
    },
    {
      filename: 'ESR Test result Reenu P Prathap 29032026.pdf',
      filesize: '3.6 MB',
      uploadedOn: '24 Mar 2026'
    },
    {
      filename: 'ESR Test result Reenu P Prathap 29032026.pdf',
      filesize: '3.6 MB',
      uploadedOn: '24 Mar 2026'
    },
  ]
  dataSource!: MatTableDataSource<any>;

  openMedicalRecord(file: any) {
    this.filename = file.FileName
    this.medicalRecordId = file.ID
    this.showEditMedicalRecordPopup = true;
  }
  closeMedicalRecord() {
    this.showEditMedicalRecordPopup = false;
  }

  ngOnInit(): void {
    this.userId = this.service.getsession("id");
    this.dataSource = new MatTableDataSource([]);
    this.getUserMedicalRecords();
    this.originalData = this.dataSource.data;
     this.dataSource.filterPredicate = (data: any, filter: string) => {
    return data.filename.toLowerCase().includes(filter) ||
           data.uploadedOn.toLowerCase().includes(filter);
  };
  }
// search filter
  applySearch(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();
}

filterByType(type: string) {

  this.selectedType = type === 'all' ? null : type;

  if (type === 'all') {
    this.dataSource.data = this.originalData;
    return;
  }

  this.dataSource.data = this.originalData.filter(record => {

    const ext = record.actualFileName
      ?.split('.')
      .pop()
      ?.toLowerCase();

    if (!ext) return false;

    if (type === 'pdf') return ext === 'pdf';

    if (type === 'doc') return ['doc', 'docx'].includes(ext);

    if (type === 'image') return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);

    return true;
  });
}
sortBy(type: string) {

  const data = [...this.dataSource.data]; 
  if (type === 'name') {
    data.sort((a, b) =>
      a.filename.localeCompare(b.filename)
    );
  }

  if (type === 'date') {
    data.sort((a, b) =>
      new Date(b.uploadedOn).getTime() -
      new Date(a.uploadedOn).getTime()
    );
  }

  if (type === 'size') {
    data.sort((a, b) =>
      Number(b.filesize) - Number(a.filesize)
    );
  }

  this.dataSource.data = data;
}

filterByDate() {

  if (!this.selectedDate) {
    this.dataSource.data = this.originalData;
    return;
  }

  const selected = new Date(this.selectedDate);

  this.dataSource.data = this.originalData.filter(record => {

    if (!record.uploadedOn) return false;

    const recordDate = new Date(record.uploadedOn);

    return (
      recordDate.getFullYear() === selected.getFullYear() &&
      recordDate.getMonth() === selected.getMonth() &&
      recordDate.getDate() === selected.getDate()
    );
  });

}

  getUserMedicalRecords() {
    const tv = [
      { T: 'dk1', V: "" },
      { T: 'dk2', V: this.userId },
      { T: 'c10', V: '3' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          this.medicalRecordList = r.Data[0];
          const mappedData = this.medicalRecordList.map((item: any) => ({
            filename: item.DocumentName,
            actualFileName: item.FileName,
            filesize: item.Size || '',
            uploadedOn: item.UploadedDate || '',
            ID: item.ID,
            URL: item._url,
          }));

          this.dataSource.data = mappedData;
          this.originalData = mappedData;

          if (this.selectedRecord) {
            const updated = mappedData.find(
              x => x.ID === this.selectedRecord.ID
            );
            if (updated) {
              this.selectedRecord = updated;
            }
          }

        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  isImage(fileName: string): boolean {
    return /\.(jpg|jpeg|png)$/i.test(fileName);
  }

  isPdf(fileName: string): boolean {
    return /\.pdf$/i.test(fileName);
  }

  openRecord(record: any) {
    if (record?._url) {
      window.open(record._url, '_blank', 'noopener');
    }
  }

  editRecord() {
    if (!this.filename?.trim()) {
      this.srv.openDialog('Medical Records', 'w', 'File name cannot be empty.');
      return;
    }
    console.log('record id', this.medicalRecordId);

    const tv = [
      { T: 'dk1', V: this.medicalRecordId },
      { T: 'dk2', V: this.userId },
      { T: 'c1', V: this.filename },
      { T: 'c10', V: '2' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg
          this.closeMedicalRecord()
          this.srv.openDialog('Medical Records', 's', msg);
          this.getUserMedicalRecords()
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  deleteRecord(medicalRecordId: string) {
    const tv = [
      { T: 'dk1', V: medicalRecordId },
      { T: 'dk2', V: this.userId },
      { T: 'c10', V: '4' }
    ];
    this.srv.getdata('patientmedicalrecord', tv)
      .pipe(catchError(err => { throw err; }))
      .subscribe(r => {
        if (r.Status === 1) {
          let msg = r.Data[0][0].msg
          this.srv.openDialog('Medical Records', 's', msg);
          this.getUserMedicalRecords()
        } else {
          this.srv.openDialog('Medical Records', 'w', r.Info);
        }
      });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files?.[0];

    if (!file) return;

    this.selectedUploadFile = file;
    this.selectedFileName = file.name;
    this.selectedFileSize = file.size;
    this.uploadedOn = new Date();
    this.uploadMedicalRecord();
  }

  uploadMedicalRecord() {
    if (!this.selectedUploadFile) {
      this.srv.openDialog('Warning', 'w', 'Please select a file first');
      return;
    }


    console.log('recordId', this.userId);
    this.isLoadingFileUpload = true;
    const tv = [
      { T: 'dk2', V: this.userId },
      { T: 'c1', V: this.selectedFileName },
      { T: 'c10', V: '1' }
    ];
    this.srv.getdata('patientmedicalrecord', tv).subscribe({


      next: (r: any) => {
        if (r.Status !== 1 || !r.Data?.[0]?.[0]?.id) {
          this.srv.openDialog('Medical Records', 'w', r.Info || 'Failed to create record');
          return;
        }
        this.recordID = r.Data[0][0].id;
        console.log('recordId', this.recordID);


        this.uploadFileWithRecordId();
      },
      error: () => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'Error creating medical record');
      }
    });
  }

  private uploadFileWithRecordId() {
    if (!this.recordID || !this.selectedUploadFile) return;

    const tv = [
      { T: 'dk1', V: this.userId },
      { T: 'dk2', V: this.recordID },
      { T: 'c1', V: '2' },
      { T: 'c2', V: this.selectedFileName },
      { T: 'c3', V: this.selectedUploadFile.size.toString() },
      { T: 'c10', V: '1' }
    ];

    this.srv.getdata('fileupload', tv).subscribe({
      next: (fileRes: any) => {
        if (fileRes.Status !== 1) {
          this.isLoadingFileUpload = false;
          this.srv.openDialog('Error', 'e', 'Failed to save file info');
          return;
        }

        this.fileId = fileRes.Data[0][0].FileID;
        this.fileType = fileRes.Data[0][0].FileType;
        this.fileUploadId = fileRes.Data[0][0].id;

        this.uploadActualFile();
      },
      error: () => {
        this.srv.openDialog('Error', 'e', 'Error saving file info');
      }
    });
  }

  private uploadActualFile() {
    this.srv.uploadFile(this.fileId, this.fileType, this.selectedUploadFile!)
      .then(status => {

        if (status === 2) {
          const tv = [
            { T: 'dk1', V: this.srv.getsession('id') },
            { T: 'dk2', V: '6' },
            { T: 'c1', V: this.fileUploadId },
            { T: 'c2', V: status.toString() },
            { T: 'c10', V: '2' }
          ];

          this.srv.getdata('fileupload', tv).subscribe({
            complete: () => {
              this.isLoadingFileUpload = false;
              console.log('file is uploaded');

            }
          });
        } else {
          this.isLoadingFileUpload = false;
        }

        this.srv.openDialog('Success', 's', 'Medical record file uploaded successfully!');
        this.getUserMedicalRecords()
      })
      .catch(() => {
        this.isLoadingFileUpload = false;
        this.srv.openDialog('Error', 'e', 'File upload failed');
      });
  }

}
