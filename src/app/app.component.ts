import { Component, OnInit, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { ConfigService } from './providers/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  baseUrl: string;
  project: string;

  isCalculated: boolean;
  isManual: boolean;
  isSRC: boolean; // SRC部材 があるかどうか

  activeComponentRef: any;

  constructor(platformLocation: PlatformLocation,
              private config: ConfigService) {

    const location = (platformLocation as any).location;
    this.baseUrl = location.origin + location.pathname;
    console.log('baseUrl', this.baseUrl);

    // custom property
    this.isCalculated = false;
    this.isManual = true;
  }

  ngOnInit() {
  }


  dialogClose(): void {
    this.deactiveButtons();
  }

  // 画面遷移したとき現在表示中のコンポーネントを覚えておく
  onActivate(componentRef: any): void {
    this.config.setActiveComponent(componentRef);
  }
  onDeactivate(componentRef: any): void {
    this.config.setActiveComponent(null);
  }

  activePageChenge(id): void {
    this.deactiveButtons();
    document.getElementById(id).classList.add('active');
  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for (let i = 0; i <= 11; i++) {
      const data = document.getElementById(i + '');
      if (data != null) {
        if (data.classList.contains('active')) {
          data.classList.remove('active');
        }
      }
    }
  }


}
