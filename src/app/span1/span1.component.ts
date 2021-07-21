import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-span1',
  templateUrl: './span1.component.html',
  styleUrls: ['./span1.component.scss']
})
export class Span1Component implements OnInit {
  // 解析結果
  public tu1 = '';
  public tw1 = '';
  public tb1 = '';
  public a1 = '';
  public b1 = '';
  public d1 = ''
  public c1 = '';

  // private result_max = 1;
  public Df = 0;
  public b0 = 0;
  public h0 = 0;
  public fck = 0;
  public condition = '一般の環境'; // 環境条件

  public coverSoilWeight = 0; // 被り土重量
  public surfaceLoad = 0; // 上載荷重
  public highWaterDepth = 0; // 高水位
  public lowWaterDepth = 0; // 低水位
  public temperature = 0; // 温度

  public r1 = 0; // 1層目 湿潤重量
  public type2 = ''; // 2層目 地盤区分
  public r2 = 0;
  public E02 = 0;
  public Ko2 = 0;
  public type3 = '';
  public r3 = 0;
  public E03 = 0;
  public Ko3 = 0;


  constructor() { }

  ngOnInit(): void {
  }

  public async doForecast(): Promise<void> {

    // モデルを読み込む
    const MODEL_PATH = 'assets/jsmodel/model.json';
    const model = await tf.loadLayersModel(MODEL_PATH);
    console.log(model.summary());

    // インプットされているデータを取得する
    const data_normal = this.getInputArray();


    // インプットされているデータをテンソルに変換する
    //const inputs = tf.cast(data, "float32");
    const inputs = tf.tensor(data_normal).reshape([1, data_normal.length]);

    // AI に推論させる
    const output = model.predict(inputs) as any;
    let predictions_normal = Array.from(output.dataSync());
    console.log(predictions_normal);


    // 推論させたデータを表示する
    this.loadResultData(predictions_normal);

    // アラート
    alert('予測結果がでました');

  }


  public getInputArray(): number[] {
   //正規化処理
    const max_value = [
      3,
      10000,
      20000,
      20000,
      80,
      3,
      20,
      500,
      35000,
      35000,
      35,
      20,
      1,
      20,
      51000,
      0.8,
      1,
      20,
      51000,
      0.8
    ]

    const _condition = (this.condition === '一般の環境') ? 1: (this.condition === '腐食性環境') ? 2: 3;
    const _type2 = (this.type2 === '砂質土') ? 0: 1;
    const _type3 = (this.type3 === '砂質土') ? 0: 1;

    const result = [
      1,
      this.Df,
      this.b0,
      this.h0,
      this.fck,
      _condition,
      this.coverSoilWeight,
      this.surfaceLoad,
      this.highWaterDepth,
      this.lowWaterDepth,
      this.temperature,
      this.r1,
      _type2,
      this.r2,
      this.E02,
      this.Ko2,
      _type3,
      this.r3,
      this.E03,
      this.Ko3
    ];


    for(let i=0; i<result.length; i++){
      result[i] /= max_value[i];
    }

    return result;
  }



  // 計算結果を読み込む 
  public loadResultData(result: any[]): boolean {

    
    // 答え(predictions) は正規化を元に戻す
    const predictions = [];
    //最大値と最小値の入力（予測値）
    const maxValue1 = [5000, 5000, 5000, 400, 400, 400, 400];

    for (let i = 0; i < result.length; i++) {
      const a: number = this.toNumber(result[i]);
      predictions.push(maxValue1[i] * a);
    }

    this.tu1 = (result[0] / maxValue1[0]).toFixed(0);
    this.tw1 = (result[1] / maxValue1[1]).toFixed(0);
    this.tb1 = (result[2] / maxValue1[2]).toFixed(0);

    this.a1 = (result[3] / maxValue1[3]).toFixed(0);
    this.b1 = (result[4] / maxValue1[4]).toFixed(0);
    this.d1 = (result[5] / maxValue1[5]).toFixed(0);
    this.c1 = (result[6] / maxValue1[6]).toFixed(0);

    return true;
  }


  /// <summary>
  /// 文字列string を数値にする
  /// </summary>
  /// <param name='num'>数値に変換する文字列</param>
  public toNumber(num: any): any {
    let result: any = null;
    try {
      const tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch {
      result = null;
    }
    return result;
  }


}
