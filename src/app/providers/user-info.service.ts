import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';


@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  loginUserName: string;
  loginPassword: string;
  user_id: number;
  purchase_value: number;
  loggedIn: boolean;
  errorMessage: string;

  constructor(private http: Http) { 
    this.clear();
  }

  clear(): void{
    this.loginUserName = 'test1105';
    this.loginPassword = 'test1105';
    this.user_id = -1;
    this.purchase_value = -1;
    this.loggedIn = false;
  }

  Login(): boolean {

    const url = 'https://structuralengine.com/my-module/get_points_balance.php?id=' + this.loginUserName + '&ps=' + this.loginPassword;

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
            this.errorMessage = response_text.error;
            this.loggedIn = false;
          } else {
            this.user_id = response_text.user_id;
            this.purchase_value = response_text.purchase_value;
            this.loggedIn = true;
          }
        },
        error => {
          // 通信失敗時の処理（失敗コールバック）
          this.errorMessage = error.statusText;
          this.loggedIn = false;
        }
    );
    return this.loggedIn;
  }
  
  // 計算結果情報から ユーザーポイントを更新する
  public loadResultData(resultText: string): void {

    const pos = resultText.lastIndexOf('}');
    const str = resultText.substring(0, pos) + '}';

    const jsonData: {} = JSON.parse(str);
    if ('new_points' in jsonData) {
      this.purchase_value = jsonData['new_points'];
    }
  }

}
