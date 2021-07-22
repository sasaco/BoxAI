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
    this.GridHelper = new THREE.GridHelper(200, 20);
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
      -Width/10, Width/10,
      Height/10, -Height/10,
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
  public initialize(): void{
    // GL の線 GL は y=50 の位置とする
    const points = [
      new THREE.Vector3( -100, 50, 0 ),
      new THREE.Vector3( 100, 50, 0 ) 
    ];
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    this.scene.add( line );

    // 画像を読み込む
    var texture = new THREE.TextureLoader().load('./assets/img/t25.png',
    (tex) => { // 読み込み完了時
        // 縦横比を保って適当にリサイズ
        const w = 25;
        const h = tex.image.height/(tex.image.width/w);

        // 平面
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial( { map:texture } );
        const plane = new THREE.Mesh( geometry, material );
        plane.scale.set(w, h, 1);
        plane.position.y = 50 + h/2;
        plane.position.z = -1;
        this.scene.add( plane );

        // T-25 の文字
        const myText = new Text();
        this.scene.add(myText);
        myText.text = 'T-25';
        myText.fontSize = 5;
        myText.position.z = 0;
        myText.color = 0x000000;
        myText.position.y = 50 + h;
        myText.sync();
        setTimeout(() => {
          this.render();
        }, 1000);
    });

    
    this.changeData();
  }
  public changeData(): void {

    const Df = this.result.Df;
    const b0 = this.result.b0;
    const h0 = this.result.h0;

    // 内空の作成 ---------------------------------------------------------
    const hillShape = new THREE.Shape();
    const L = 8, H = 2;
    hillShape.moveTo( -b0/2, 50-Df );
    hillShape.lineTo( b0/2, 50-Df );
    hillShape.lineTo( b0/2, 50-Df-h0 );
    hillShape.lineTo( -b0/2, 50-Df-h0 );
    const geometry = new THREE.ShapeGeometry( hillShape );
    const hmaterial = new THREE.MeshBasicMaterial( { color: 0x8B4513});
    const hmesh = new THREE.Mesh( geometry, hmaterial ) ;
    hmesh.position.set(0, 0, 3);
    this.scene.add( hmesh );
  
        // 文字をシーンに追加
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = 'あああ';
        // div.style.marginTop = '-1em';
        const label = new CSS2DObject(div);
        label.position.set(0, 11, 0);
        label.name = 'font';
        label.visible = true;
        hmesh.add(label);




    console.log('event');

    this.render();
  }
}
