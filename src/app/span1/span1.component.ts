import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as tf from '@tensorflow/tfjs';
import { ResultService } from '../result/result.service';
import { SceneService } from '../three/scene.service';

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

  // 環境条件
  public CONDITIONS: string[] = [
    '一般の環境',
    '腐食性環境',
    '厳しい腐食性環境',
  ];
  public conSelect(con){
    this.result.condition = con;
    this.onChange(con);
  }

  public coverSoilWeight = 0; // 被り土重量
  public surfaceLoad = 0; // 上載荷重
  public highWaterDepth = 0; // 高水位
  public lowWaterDepth = 0; // 低水位
  public temperature = 0; // 温度

  public r1 = 0; // 1層目 湿潤重量

  // 2層目 地盤区分
  public TYPE2s: string[] = [
    '粘性土',
    '砂質土',
  ];
  public type2Select(typ){
    this.result.type2 = typ;
    this.onChange(typ);
  }
  public r2 = 0;
  public E02 = 0;
  public Ko2 = 0;

  // 3層目 地盤区分
  public TYPE3s: string[] = [
    '粘性土',
    '砂質土',
  ];
  public type3Select(typ){
    this.result.type3 = typ;
    this.onChange(typ);
  }
  public r3 = 0;
  public E03 = 0;
  public Ko3 = 0;

  public onChange(event: any){
    this.scene.changeData();
  }

  constructor(
    public result: ResultService,
    private scene: SceneService) { }

  ngOnInit(): void {
  }

  public async doForecast(): Promise<void> {

    // モデルを読み込む
    const MODEL_PATH = 'assets/jsmodel/model.json';
    const model = await tf.loadLayersModel(MODEL_PATH);
    console.log(model.summary());

    // インプットされているデータを取得する
    const data_normal = this.result.getInputArray();


    // インプットされているデータをテンソルに変換する
    //const inputs = tf.cast(data, "float32");
    const inputs = tf.tensor(data_normal).reshape([1, data_normal.length]);

    // AI に推論させる
    const output = model.predict(inputs) as any;
    let predictions_normal = Array.from(output.dataSync());
    console.log(predictions_normal);


    // 推論させたデータを表示する
    this.result.loadResultData(predictions_normal);

    // アラート
    alert('予測結果がでました');

  }


}
