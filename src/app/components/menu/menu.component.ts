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
  public async calcrate(): Promise<void> {
    /*
        if (this.user.loggedIn === false) {
          this.logIn();
        }
        if (this.user.loggedIn === false) {
          return;
        }
    */

    // モデルを読み込む
    const MODEL_PATH = 'assets/jsmodel/model.json';
    const model = await tf.loadLayersModel(MODEL_PATH);
    console.log(model.summary());

    // インプットされているデータを取得する
    const data = this.input.getInputArray();

    //正規化処理
    let data_normal = [];
    //最大値と最小値の入力（条件）

    const input_data_header = [
      ['result_max', 3],
      ['Df', 10000],
      ['b0', 20000],
      ['h0', 20000],
      ['fck', 80],
      ['fsyk', 490],
      ['fwyk', 490],
      ['condition', 3],
      ['coverSoilWeight', 20],
      ['surfaceLoad', 500],
      ['highWaterDepth', 26000],
      ['lowWaterDepth', 26000],
      ['temperature', 35],

      ['h', 26000], ['type', 1], ['r', 20], ['rw', 10], ['E0', 51000], ['Ko', 0.8],
    ]
    const output_data_header = [
      ['tw1', 5000],
      ['tu1', 5000],
      ['tb1', 5000],
      ['a1', 4000],
      ['b1', 4000],
      ['d1', 4000],
      ['c1', 4000],
    ]


    for (let i = 0; i < data.length; i++){
      data_normal.push(data[i] / maxValue[i]);
    }


    // インプットされているデータをテンソルに変換する
    //const inputs = tf.cast(data, "float32");
    const inputs = tf.tensor(data_normal).reshape([1, data_normal.length]); 

    // AI に推論させる
    const output = model.predict(inputs) as any;
    let predictions_normal = Array.from(output.dataSync());
    console.log(predictions_normal);

    // 答え(predictions) は正規化を元に戻す
    const predictions = [];
      //最大値と最小値の入力（予測値）
    const maxValue1 = [2000, 1900, 1900, 1100.0, 600.0];
    const minValue1 = [ 130,  130,  130,    0.0,   0.0];
    
    for (let i = 0; i < predictions_normal.length; i++){
      const a: number = this.input.toNumber(predictions_normal[i]);
      predictions.push((maxValue1[i] - minValue1[i]) * a + minValue1[i]);
    }
    
    // 推論させたデータを表示する
    this.input.loadResultData(predictions);

    // アラート
    alert('予測結果がでました');

    // 完了フラグ
    this.app.isCalculated = true;
  }


}
