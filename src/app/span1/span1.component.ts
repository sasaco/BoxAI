import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as tf from '@tensorflow/tfjs';
import { ResultService } from '../result/result.service';
import { SceneService } from '../three/scene.service';

@Component({
  selector: 'app-span1',
  templateUrl: './span1.component.html',
  styleUrls: ['./span1.component.scss']
})
export class Span1Component {
  
  private MODEL_PATH = 'assets/jsmodel/model.json';
  private model: any;;
  constructor(
    public result: ResultService,
    private scene: SceneService) {
      this.loadModel();
  }
  
  // モデルを読み込む
  public async loadModel(): Promise<void> {
    this.model = await tf.loadLayersModel(this.MODEL_PATH);
    console.log(this.model.summary());
    this.onChange(null);
  }

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

  // 2層目 地盤区分
  public TYPE2s: string[] = [
    '粘性土',
    '砂質土',
  ];
  public type2Select(typ){
    this.result.type2 = typ;
    this.onChange(typ);
  }
  // 3層目 地盤区分
  public TYPE3s: string[] = [
    '粘性土',
    '砂質土',
  ];
  public type3Select(typ){
    this.result.type3 = typ;
    this.onChange(typ);
  }

  private changeFlg = false;
  private calcrateFlg = false;
  public onChange(event: any){

    if(this.calcrateFlg === true){
      this.changeFlg = true;
      return; // 計算中は予約だけして無視
    }

    this.doForecast().then((value) => {
      if(this.changeFlg === true){
        this.onChange(null);
      }
      this.changeFlg = false;
    });

  }


  private async doForecast(): Promise<void> {

    this.calcrateFlg = true;

    // インプットされているデータを取得する
    const data_normal = this.result.getInputArray();

    // インプットされているデータをテンソルに変換する
    const inputs = tf.tensor(data_normal).reshape([1, data_normal.length]);

    // AI に推論させる
    const output = this.model.predict(inputs) as any;
    let predictions_normal = Array.from(output.dataSync());
    console.log(predictions_normal);

    // 推論させたデータを表示する
    this.result.loadResultData(predictions_normal);

    // アラート
    this.scene.changeData();

    this.calcrateFlg = false;
  }


}
