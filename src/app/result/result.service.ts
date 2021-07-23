import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  // 解析結果
  public tu1: number = null;
  public tw1: number = null;
  public tb1: number = null;


  // private result_max = 1;
  public Df = 2000;
  public b0 = 5000;
  public h0 = 5000;
  public fck = 25;
  public ds = 50;
  public condition = '一般の環境'; // 環境条件

  public coverSoilWeight = 18; // 被り土重量

  public r1 = 18; // 1層目 湿潤重量
  public type2 = '粘性土'; // 2層目 地盤区分
  public r2 = 15;
  public E02 = 15000;
  public Ko2 = 0.2;
  public type3 = '砂質土';
  public r3 = 18;
  public E03 = 23000;
  public Ko3 = 0.5;

  constructor() { }

  // AI が 理解できる数値の配列を生成する
  public getInputArray(): number[] {

    // 文字列の入力項目を変換
    const _condition = (this.condition === '一般の環境') ? 1 : (this.condition === '腐食性環境') ? 2 : 3;
    const _type2 = (this.type2 === '砂質土') ? 0 : 1;
    const _type3 = (this.type3 === '砂質土') ? 0 : 1;

    const result = [
      1,
      this.Df,
      this.b0,
      this.h0,
      this.fck,
      _condition,
      this.coverSoilWeight,
      this.ds,
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

    //正規化処理
    const max_value = [
      3,      // result_max
      10000,  // Df
      20000,  // b0
      20000,  // h0
      80,     // fck
      3,      // condition
      20,     // coverSoilWeight
      100,    // ds
      20,     // r1
      1,      // type2
      20,     // r2
      51000,  // E02
      0.8,    // Ko2
      1,      // type3 
      20,     // r3
      51000,  // E03
      0.8     // Ko3
    ]
    for (let i = 0; i < result.length; i++) {
      result[i] /= max_value[i];
    }

    return result;
  }


  // 計算結果を読み込む 
  public loadResultData(result: any[]): void {

    // 答え(predictions) は正規化を元に戻す
    const maxValue1 = [5000, 5000, 5000];

    this.tu1 = Math.round(result[0] * maxValue1[0] /10)*10;
    this.tw1 = Math.round(result[1] * maxValue1[1] /10)*10;
    this.tb1 = Math.round(result[2] * maxValue1[2] /10)*10;
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
