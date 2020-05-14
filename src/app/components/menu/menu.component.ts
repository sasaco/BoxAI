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

import * as tf from '@tensorflow/tfjs';

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



  // 計算
  public async calcrate(): Promise<void>  {
/*
    if (this.user.loggedIn === false) {
      this.logIn();
    }
    if (this.user.loggedIn === false) {
      return;
    }
*/

  const MODEL_PATH = 'assets/jsmodel/model.json';
  const model = await tf.loadLayersModel(MODEL_PATH);
  console.log(model.summary());

  const data = this.input.getInputArray();
  const inputs = tf.tensor(data).reshape([1,data.length,1]); // テンソルに変換
  const output = model.predict(inputs) as any;
  let predictions = Array.from(output.dataSync());
  console.log(predictions);

  this.input.loadResultData(predictions);

  this.app.isCalculated = true;
  }

  
}
