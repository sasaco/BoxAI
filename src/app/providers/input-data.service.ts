import { Injectable } from '@angular/core';
import { ɵangular_packages_platform_browser_platform_browser_k } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class InputDataService {

  public number_of_rail: number;
  public intended_use_of_box_culvert: number;
  public number_of_spans: number;
  public structural_type_of_top_slab: number;
  public structural_type_of_bottom_slab: number;
  public structural_type_of_wall: number;
  public structural_type_of_middle_wall: number;
  public span1: number;
  public span2: number;
  public span3: number;
  public span4: number;
  public raise1: number;
  public raise2: number;
  public raise3: number;
  public raise4: number;
  public covering_depth: number;
  public bevel: number;
  public haunch_of_top_slab_and_wall: number;
  public haunch_of_bottom_slab_and_wall: number;
  public haunch_of_top_slab_and_middle_wall: number;
  public haunch_of_bottom_slab_and_middle_wall: number;

  public thickness_of_top_slab: any;
  public thickness_of_bottom_slab: any;
  public thickness_of_wall: any;
  public thickness_of_middle_wall1: any;
  public thickness_of_middle_wall2: any;

  constructor() {

    this.number_of_rail = 1;
    this.intended_use_of_box_culvert = 1;
    this.number_of_spans = 1;
    this.structural_type_of_top_slab = 1;
    this.structural_type_of_bottom_slab = 1;
    this.structural_type_of_wall = 1;
    this.structural_type_of_middle_wall = 0;
    this.span1 = 0;
    this.span2 = 3;
    this.span3 = 0;
    this.span4 = 0;
    this.raise1 = 0;
    this.raise2 = 2.5;
    this.raise3 = 0;
    this.raise4 = 0;
    this.covering_depth = 0.0;
    this.bevel = 90;
    this.haunch_of_top_slab_and_wall = 300;
    this.haunch_of_bottom_slab_and_wall = 300;
    this.haunch_of_top_slab_and_middle_wall = 0;
    this.haunch_of_bottom_slab_and_middle_wall = 0;

    this.thickness_of_top_slab = '';
    this.thickness_of_bottom_slab = '';
    this.thickness_of_wall = '';
    this.thickness_of_middle_wall1 = '';
    this.thickness_of_middle_wall2 = '';
  }

  public getInputArray(): number[][] {
    const result = [
      [this.number_of_rail],
      [this.intended_use_of_box_culvert],
      [this.number_of_spans],
      [this.structural_type_of_top_slab],
      [this.structural_type_of_bottom_slab],
      [this.structural_type_of_wall],
      [this.structural_type_of_middle_wall],
      [this.span1],
      [this.span2],
      [this.span3],
      [this.span4],
      [this.raise1],
      [this.raise2],
      [this.raise3],
      [this.raise4],
      [this.covering_depth],
      [this.bevel],
      [this.haunch_of_top_slab_and_wall],
      [this.haunch_of_bottom_slab_and_wall],
      [this.haunch_of_top_slab_and_middle_wall],
      [this.haunch_of_bottom_slab_and_middle_wall]
    ];
    return result;
  }

  public getInputText(loginUserName: string, loginPassword: string): string {

    const data = {
      'Number of rail': [this.number_of_rail],
      'Intended use of box culvert': [this.intended_use_of_box_culvert],
      'Number of spans': [this.number_of_spans],
      'Structural type of top slab': [this.structural_type_of_top_slab],
      'Structural type of bottom slab': [this.structural_type_of_bottom_slab],
      'Structural type of wall': [this.structural_type_of_wall],
      'Structural type of middle wall': [this.structural_type_of_middle_wall],
      Span1: [this.span1],
      Span2: [this.span2],
      Span3: [this.span3],
      Span4: [this.span4],
      Raise1: [this.raise1],
      Raise2: [this.raise2],
      Raise3: [this.raise3],
      Raise4: [this.raise4],
      'Covering depth': [this.covering_depth],
      Bevel: [this.bevel],
      'Haunch of top slab and wall': [this.haunch_of_top_slab_and_wall],
      'Haunch of bottom slab and wall': [this.haunch_of_bottom_slab_and_wall],
      'Haunch of top slab and middle wall': [this.haunch_of_top_slab_and_middle_wall],
      'Haunch of bottom slab and middle wall': [this.haunch_of_bottom_slab_and_middle_wall],
      username: loginUserName,
      password: loginPassword
    };

    const result: string = JSON.stringify(data);
    return result;
  }


  // 計算結果を読み込む 
  public loadResultData(result: unknown[]): boolean {

    try {
      this.thickness_of_top_slab = result[0];     // ['thickness of top slab'];
      this.thickness_of_bottom_slab = result[1];  // ['thickness of bottom slab'];
      this.thickness_of_wall = result[2];         // ['thickness of wall'];
      this.thickness_of_middle_wall1 = result[3]; // ['thickness of middle wall1'];
      this.thickness_of_middle_wall2 = result[4]; // ['thickness of middle wall2'];

    } catch (e) {
      return false;
    }
    return true;
  }


  /// <summary>
  /// 文字列string を数値にする
  /// </summary>
  /// <param name='num'>数値に変換する文字列</param>
  public toNumber(num: any): number {
    let result: number = null;
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
