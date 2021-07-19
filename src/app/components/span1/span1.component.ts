import { Component, OnInit, OnDestroy } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-span1',
  templateUrl: './span1.component.html',
  styleUrls: ['./span1.component.scss']
})
export class Span1Component implements OnInit, OnDestroy {

  private input_data_header = [
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

  private output_data_header = [
    ['tw1', 5000],
    ['tu1', 5000],
    ['tb1', 5000],
    ['a1', 4000],
    ['b1', 4000],
    ['d1', 4000],
    ['c1', 4000],
  ]

  constructor( ) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  

  // 計算
  public async calcrate(): Promise<void> {


    // モデルを読み込む
    const MODEL_PATH = 'assets/jsmodel/model.json';
    const model = await tf.loadLayersModel(MODEL_PATH);
    console.log(model.summary());

    // インプットされているデータを取得する
    const data = this.input.getInputArray();

    //正規化処理
    let data_normal = [];
    //最大値と最小値の入力（条件）




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
