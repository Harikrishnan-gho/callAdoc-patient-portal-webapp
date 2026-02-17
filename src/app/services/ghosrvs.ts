import { inject, Injectable } from '@angular/core';
import { ghoiin, tags, ghoresult } from '../model/ghomodel'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from './SessionService';
import { catchError, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogAlert } from '../features/dialog/dialog';
import { Router } from '@angular/router';

interface ApiResponse { data: any; /* etc */ }
interface AwsFileResponse {
  Url: string;
}
@Injectable({
  providedIn: 'root',
})

export class GHOService {
  uploadImage(arg0: string, formData: FormData) {
    throw new Error('Method not implemented.');
  }
  http = inject(HttpClient);
  tkn: string = "";
  constructor(private ss: SessionService, public rt: Router) { }
  tv: tags[] = [];
  res: ghoresult = new ghoresult();
  url: string = "https://ghoapps.com/cdoc/iin";
  saveSession(T: string, V: string) {
    this.ss.set(T, V);
  }

  getsession(tag: string) {
    const val = this.ss.get(tag) as string;
    if (val == undefined || val == null) {
      return "";
    }
    return val;
  }

  setsession(T: string, V: string) {
    this.ss.set(T, V);
  }

  clearsession() {
    this.ss.clear();
  }

  getdata(a: string, ts: tags[]) {
    let src = navigator.userAgent;
    let lts = new Date();
    this.tkn = this.getsession('tkn')
    let gh: ghoiin = {
      Token: this.tkn,
      Action: a,
      Lts: lts.toString(),
      BrowseInfo: navigator.userAgent,
      Mode: "WEB",
      Tags: ts
    }
    var tokenValue = "";
    var headerOptions = new HttpHeaders({ 'Content-Type': 'application/JSON', 'Cache-Control': 'no-cache', 'Authorization': tokenValue });
    var requestOptions = { headers: headerOptions };
    return this.http.post<ghoresult>(this.url, gh, requestOptions)
  }



  dialog = inject(MatDialog);
  openDialog(t: string, ty: string, m: string) {
    if (ty == "s") { ty = "success" }
    if (ty == "w") { ty = "warning" }
    if (ty == "e") { ty = "error" }
    const dialogRef = this.dialog.open(DialogAlert, {
      data: {
        title: t,
        type: ty,
        message: m
      },
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  validstr(s: string) {
    if (s == undefined || s == null || s == "") return false;
    else return true;
  }

  validnum(s: number) {
    if (s == undefined || s == null || s === 0) return false;
    else return true;
  }


  navigate(v: string) {
    this.rt.navigate([v]);
  }
  logout() {
    this.setsession("id", "0")
    this.setsession("tkn", "")
    this.navigate("/login");

  }
  MONTHS = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' },
  ];

  awsfileuploadinfo(id: string, typ: string): Observable<AwsFileResponse> {
    return this.http.get<AwsFileResponse>(
      `https://ghoapps.com/api/file/upload-url?filename=${id}&filetype=${typ}`
    );
  }

  async uploadFile(fileId: string, fileType: string, file: File): Promise<number> {
    try {
      const getRes = await this.awsfileuploadinfo(fileId, fileType).toPromise();
      const uploadUrl = getRes?.Url;
      if (!uploadUrl) {
        this.openDialog('Error', 'e', 'Upload URL missing');
        return 0;
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

    
      if (response.status === 200) {
        return 2; 
      } else {
        this.openDialog('Error', 'e', `Failed to upload file, status code: ${response.status}`);
        return 0;
      }

    } catch (err) {
      console.error(err);
      this.openDialog('Error', 'e', 'Error uploading file');
      return 0;
    }
  }
}