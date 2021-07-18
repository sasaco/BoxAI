import { Component, OnInit, OnDestroy } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-span1',
  templateUrl: './span1.component.html',
  styleUrls: ['./span1.component.scss']
})
export class Span1Component implements OnInit, OnDestroy {


  constructor( public input: InputDataService) {

  }

  ngOnInit() {
    this.input.number_of_spans = 1;

  }

  ngOnDestroy() {
  }





}
