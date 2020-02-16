import { Component, OnInit, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';

import { UserInfoService } from '../../providers/user-info.service';
import * as FileSaver from 'file-saver';
import { ConfigService } from '../../providers/config.service';

import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  loginUserName: string;
  userPoint: string;
  loggedIn: boolean;
  baseUrl: string;

  constructor(
    private modalService: NgbModal,
    private app: AppComponent,
    private user: UserInfoService,
    private http: Http,
    private platformLocation: PlatformLocation,
    private router: Router,
    private config: ConfigService,
    private input: InputDataService) {

    this.loggedIn = this.user.loggedIn;
  }

  ngOnInit() {
  }

  // 新規作成
  renew(): void {
    this.router.navigate(['/blank-page']);
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.app.isManual = true;
    this.app.isCalculated = false;
  }


  // ログイン関係
  private logIn(): void {
    this.modalService.open(LoginDialogComponent).result.then((result) => {
      this.loggedIn = this.user.loggedIn;
      if (this.loggedIn === true) {
        this.loginUserName = this.user.loginUserName;
        this.userPoint = this.user.purchase_value.toString();
      }
    });
    // 「ユーザー名」入力ボックスにフォーカスを当てる
    document.getElementById('user_name_id').focus();
  }

  // ユーザーポイントを更新
  private setUserPoint() {
    const url = 'https://structuralengine.com/my-module/get_points_balance.php?id=' 
              + this.user.loginUserName + '&ps=' + this.user.loginPassword;
    this.http.get(url, {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
      .subscribe(
        response => {
          // 通信成功時の処理（成功コールバック）
          const response_text = JSON.parse(response.text());
          if ('error' in response_text) {
            this.user.errorMessage = response_text.error;
          } else {
            this.user.user_id = response_text.user_id;
            this.user.purchase_value = response_text.purchase_value;
            this.user.loggedIn = true;
            this.userPoint = this.user.purchase_value.toString();
          }
        },
        error => {
          // 通信失敗時の処理（失敗コールバック）
          this.user.errorMessage = error.statusText;
        }
      );
  }

  // 計算
  calcrate(): void {
/*
    if (this.user.loggedIn === false) {
      this.logIn();
    }
    if (this.user.loggedIn === false) {
      return;
    }
*/
    const modalRef = this.modalService.open(WaitDialogComponent);

    const inputJson = 'inp_grid='
      + this.input.getInputText( this.user.loginUserName, this.user.loginPassword );

    console.log(inputJson);

    const url = 'http://structuralengine.com/BoxAI/api/Web_Api.py';

    this.http.post(url, inputJson, {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      })
    }).subscribe(
      response => {
        // 通信成功時の処理（成功コールバック）
        console.log('通信成功!!');
        console.log(response.text());

        if (!this.input.loadResultData(response.text())) {
          alert(response.text());
        } else {
          this.loadResultData(response.text());
          this.app.isCalculated = true;
        }

        modalRef.close();
      },
      error => {
        // 通信失敗時の処理（失敗コールバック）
        this.app.isCalculated = false;
        console.log(error.statusText);
        modalRef.close();
      }
    );
  }


  private loadResultData(resultText: string): void {
    this.user.loadResultData(resultText);
    this.userPoint = this.user.purchase_value.toString();
  }
  
}
