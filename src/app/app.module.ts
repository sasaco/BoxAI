import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';


import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HotTableModule } from '@handsontable/angular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Span1Component } from './components/span1/span1.component';

import { UserInfoService } from './providers/user-info.service';
import { ConfigService } from './/providers/config.service';

import { MenuComponent } from './components/menu/menu.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { WaitDialogComponent } from './components/wait-dialog/wait-dialog.component';



@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule,
    DragDropModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),
    HotTableModule
  ],
  declarations: [
    AppComponent,
    WebviewDirective,
    MenuComponent,
    LoginDialogComponent,
    WaitDialogComponent,

    Span1Component,

  ],
  entryComponents: [
    LoginDialogComponent,
    WaitDialogComponent,
  ],
  providers: [
    UserInfoService,
    ConfigService,

  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
