import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from '@three-ts/orbit-controls';
import { CSS2DRenderer, CSS2DObject } from './libs/CSS2DRenderer.js';
import { ResultService } from '../result/result.service';
import { Text } from 'troika-three-text'

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // シーン
  private scene: THREE.Scene;

  // レンダラー
  private renderer!: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer;

  // カメラ
  private camera!: THREE.OrthographicCamera;
  private aspectRatio: number = 0;
  private Width: number = 0;
  private Height: number = 0;

  private GridHelper!: THREE.GridHelper;

  // 初期化
  public constructor(private result: ResultService) {
    // シーンを作成
    this.scene = new THREE.Scene();
    // シーンの背景を白に設定
    // this.scene.background = new THREE.Color(0xf0f0f0);
    this.scene.background = new THREE.Color( 0xffffff );
    // レンダラーをバインド
    this.render = this.render.bind(this);

  }

  public OnInit(aspectRatio: number,
                canvasElement: HTMLCanvasElement,
                deviceRatio: number,
                Width: number,
                Height: number): void {
    // カメラ
    this.aspectRatio = aspectRatio;
    this.Width = Width;
    this.Height = Height;
    this.createCamera(aspectRatio, Width, Height);
    // 環境光源
    this.add(new THREE.AmbientLight(0xf0f0f0));
    // レンダラー
    this.createRender(canvasElement,
                      deviceRatio,
                      Width,
                      Height);
    // コントロール
    this.addControls();

    // 床面を生成する
    this.createHelper();

  }


  // 床面を生成する
  private createHelper() {
    this.GridHelper = new THREE.GridHelper(20, 20);
    this.GridHelper.geometry.rotateX(Math.PI / 2);
    this.scene.add(this.GridHelper);
  }

  // コントロール
  public addControls() {
    const controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
    controls.enableRotate = false;
    controls.addEventListener('change', this.render);
  }

  // カメラの初期化
  public createCamera(aspectRatio: number,
                      Width: number, Height: number ) {

    aspectRatio = (aspectRatio === null) ? this.aspectRatio : aspectRatio;
    Width = (Width === null) ? this.Width : Width;
    Height = (Height === null) ? this.Height : Height;

    const target = this.scene.getObjectByName('camera');
    if (target !== undefined) {
      this.scene.remove(this.camera);
    }
    this.camera = new THREE.OrthographicCamera(
      -Width/80, Width/80,
      Height/80, -Height/80,
      0.1,
      21
    );
    this.camera.position.set(0, 0, 10);
    this.camera.name = 'camera';
    this.scene.add(this.camera);

  }

  // レンダラーを初期化する
  public createRender(canvasElement: HTMLCanvasElement,
                      deviceRatio: number,
                      Width: number,
                      Height: number): void {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      canvas: canvasElement,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setPixelRatio(deviceRatio);
    this.renderer.setSize(Width, Height);
    this.renderer.shadowMap.enabled = true;

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(Width, Height);
    this.labelRenderer.domElement.style.position = 'absolute';
  }

  public labelRendererDomElement(): Node {
    return this.labelRenderer.domElement;
  }

  // リサイズ
  public onResize(deviceRatio: number,
                  Width: number,
                  Height: number): void {

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Width, Height);
    this.labelRenderer.setSize(Width, Height);
    this.render();
  }

  // レンダリングする
  public render() {
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  // レンダリングのサイズを取得する
  public getBoundingClientRect(): ClientRect | DOMRect  {
    return this.renderer.domElement.getBoundingClientRect();
  }

  // シーンにオブジェクトを追加する
  public add(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.add(obj);
    }
  }

  // シーンのオブジェクトを削除する
  public remove(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.remove(obj);
    }
  }

  // シーンにオブジェクトを削除する
  public removeByName(...threeName: string[]): void {
    for (const name of threeName) {
      const target = this.scene.getObjectByName(name);
      if (target === undefined) {
        continue;
      }
      this.scene.remove(target);
    }
  }

  // ファイルに視点を保存する
  public getSettingJson(): any {
    return {
      camera: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      }
    };
  }



  ///////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////
  private GL = 5; // GL の線 GL は y=50 の位置とする
  private Inner: THREE.Mesh = null;
  private gound0: THREE.Mesh = null;
  private gound1: THREE.Mesh = null;
  private gound2: THREE.Mesh = null;
  private gound3: THREE.Mesh = null;
  private body1: THREE.Mesh = null;
  private body2: THREE.Mesh = null;

  public initialize(): void{

    // GL の線
    const GL_Line = new THREE.Line( 
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3( -100, this.GL, 0 ),
        new THREE.Vector3( 100, this.GL, 0 ) 
      ] ), 
      new THREE.LineBasicMaterial({color: 0x0000ff}));
    GL_Line.position.z = 9;
    this.scene.add(GL_Line );

    // トラックの画像
    const texture = new THREE.TextureLoader().load('./assets/img/t25.png',
    (tex) => { // 読み込み完了時
        // 縦横比を保って適当にリサイズ
        const w = 5;
        const h = tex.image.height/(tex.image.width/w);
        // 画像
        const plane = new THREE.Mesh( 
          new THREE.PlaneGeometry(1, 1), 
          new THREE.MeshPhongMaterial( { map:texture } ) );
        plane.scale.set(w, h, 1);
        plane.position.y = this.GL + h/2;
        plane.position.z = -1;
        this.scene.add( plane );
        // T-25 の文字
        const myText = new Text();
        this.scene.add(myText);
        myText.text = 'T-25';
        myText.fontSize = 0.7;
        myText.position.z = 0;
        myText.color = 0x000000;
        myText.position.y = this.GL + h;
        myText.sync();
        setTimeout(() => {
          this.render();
        }, 1000);
    });

    // 寸法線のマテリアル
    const line_mat = new THREE.LineBasicMaterial({color: 0x000000});
    // 寸法線に用いるマル
    const curve = new THREE.EllipseCurve(0,0,0.01,0.01,0,2*Math.PI,false,0);
    const points = curve.getPoints(12);
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);

    // 内空の作成 
    this.createInner(line_geo, line_mat);
    this.scene.add( this.Inner);  
    // 地盤の作成 
    this.createGround(line_geo, line_mat);
    this.scene.add( this.gound0);  
    this.scene.add( this.gound1);  
    this.scene.add( this.gound2);  
    this.scene.add( this.gound3);  


    this.changeData();
  }

  public changeData(): void {

    const Df = this.result.Df/1000;
    const b0 = this.result.b0/1000;
    const h0 = this.result.h0/1000;

    // 内空の修正 ---------------------------------------------------------
    this.Inner.scale.set( b0, h0, 1 );
    this.Inner.position.y = this.GL - Df - h0/2;
    const textV = this.Inner.getObjectByName('textV');
    const elemV = textV['element'];
    elemV.innerHTML = h0.toFixed(3);
    const textH = this.Inner.getObjectByName('textH');
    const elemH = textH['element'];
    elemH.innerHTML = b0.toFixed(3);
    // 地盤の修正  ---------------------------------------------------------
    this.gound0.scale.set( b0, Df, 1 );
    this.gound0.position.y = this.GL - Df/2;
    this.gound1.scale.set( 1, Df, 1 );
    this.gound1.position.y = this.GL - Df/2;
    const text1 = this.gound1.getObjectByName('text1');
    text1.position.x = b0;
    this.gound2.scale.set( 1, h0/2, 1 );
    this.gound2.position.y = this.GL - Df - h0/4;
    const text2 = this.gound2.getObjectByName('text2');
    text2.position.x = b0;
    this.gound3.scale.set( 1, h0, 1 );
    this.gound3.position.y = this.GL - Df - h0;
    const text3 = this.gound3.getObjectByName('text3');
    text3.position.x = b0;

    console.log('event');

    this.render();
  }

  // 内空の作成
  private createInner(
    line_geo: THREE.BufferGeometry, 
    line_mat: THREE.LineBasicMaterial): void {

    this.Inner = new THREE.Mesh( 
      new THREE.PlaneGeometry( 1, 1 ), 
      new THREE.MeshBasicMaterial({color: 0x696969}));
    this.Inner.position.z = 0;
    this.scene.add( this.Inner);  

    // 縦の寸法線
    // 寸法線-文字
    const divV = document.createElement('div');
    divV.className = 'label';
    divV.textContent = 'divV';
    divV.style.marginLeft = '-1em';
    divV.style.transform = 'rotate(90deg)';
    const textV = new CSS2DObject(divV);
    textV.name = 'textV'
    this.Inner.add(textV);
    // 寸法線-線
    const lineV = new THREE.Line( 
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3( 0, 0.5, 0 ),
        new THREE.Vector3( 0, -0.5, 0 ) 
      ] ), line_mat);
    lineV.name = 'lineV';  
    lineV.position.z = 1;
    this.Inner.add(lineV);
    // 寸法線-上の丸
    const ellipse0 = new THREE.Line(line_geo, line_mat);
    ellipse0.name = "ellipse0";
    ellipse0.position.set(0,0.5,1);
    this.Inner.add(ellipse0);
    // 寸法線-下の丸
    const ellipse1 = new THREE.Line(line_geo, line_mat);
    ellipse1.name = "ellipse1";
    ellipse1.position.set(0,-0.5,1);
    this.Inner.add(ellipse1);


    // 横の寸法線
    // 寸法線-文字
    const divH = document.createElement('div');
    divH.className = 'label';
    divH.textContent = 'divH';
    divH.style.marginTop = '-1em';
    const textH = new CSS2DObject(divH);
    textH.name = 'textH';
    textH.position.y = -0.2;
    this.Inner.add(textH);
    // 寸法線-線
    const lineH = new THREE.Line( 
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3( -0.5, 0, 0 ),
        new THREE.Vector3( 0.5, 0, 0 ) 
      ] ), line_mat);
    lineH.name = 'lineH';  
    lineH.position.z = 1;
    lineH.position.y = -0.2;
    this.Inner.add(lineH);
    // 寸法線-左の丸
    const ellipse2 = new THREE.Line(line_geo, line_mat);
    ellipse2.name = "ellipse2";
    ellipse2.position.set(-0.5,-0.2,1);
    this.Inner.add(ellipse2);
    // 寸法線-右の丸
    const ellipse3 = new THREE.Line(line_geo, line_mat);
    ellipse3.name = "ellipse3";
    ellipse3.position.set(0.5,-0.2,1);
    this.Inner.add(ellipse3);

  }

  // 地盤の作成 
  private createGround(    
    line_geo: THREE.BufferGeometry, 
    line_mat: THREE.LineBasicMaterial): void {

    // 埋め戻し土      
    this.gound0 = new THREE.Mesh( 
      new THREE.PlaneGeometry( 1, 1 ), 
      new THREE.MeshBasicMaterial({color: 0x66cdaa}));
    this.gound0.position.z = -0.1;
    const div0 = document.createElement('div');
    div0.className = 'label';
    div0.textContent = '埋め戻し土';
    div0.style.marginTop = '-1em';
    const text0 = new CSS2DObject(div0);
    text0.name = 'text0'
    this.gound0.add(text0);

    // 1層目      
    this.gound1 = new THREE.Mesh( 
      new THREE.PlaneGeometry( 200, 1 ), 
      new THREE.MeshBasicMaterial({color: 0xfffacd}));
    this.gound1.position.z = -0.2;
    const div1 = document.createElement('div');
    div1.className = 'label';
    div1.textContent = '1層目';
    div1.style.marginTop = '-1em';
    const text1 = new CSS2DObject(div1);
    text1.name = 'text1'
    this.gound1.add(text1);

    // 2層目      
    this.gound2 = new THREE.Mesh( 
      new THREE.PlaneGeometry( 200, 1 ), 
      new THREE.MeshBasicMaterial({color: 0xf0f8ff}));
    this.gound2.position.z = -0.2;
    const div2 = document.createElement('div');
    div2.className = 'label';
    div2.textContent = '2層目';
    div2.style.marginTop = '-1em';
    const text2 = new CSS2DObject(div2);
    text2.name = 'text2'
    this.gound2.add(text2);

    // 3層目      
    this.gound3 = new THREE.Mesh( 
      new THREE.PlaneGeometry( 200, 1 ), 
      new THREE.MeshBasicMaterial({color: 0xff7f50}));
    this.gound3.position.z = -0.2;
    const div3 = document.createElement('div');
    div3.className = 'label';
    div3.textContent = '3層目';
    div3.style.marginTop = '-1em';
    const text3 = new CSS2DObject(div3);
    text3.name = 'text3'
    this.gound3.add(text3);

  }

  
}
