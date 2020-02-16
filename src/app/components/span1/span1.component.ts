import { Component, OnInit, OnDestroy } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-span1',
  templateUrl: './span1.component.html',
  styleUrls: ['./span1.component.scss']
})
export class Span1Component implements OnInit, OnDestroy {

  /*
  private number_of_rail: number;
  private intended_use_of_box_culvert: number;
  // private number_of_spans: number;
  private structural_type_of_top_slab: number;
  private structural_type_of_bottom_slab: number;
  private structural_type_of_wall: number;
  private structural_type_of_middle_wall: number;
  private span1: number;
  private span2: number;
  private span3: number;
  private span4: number;
  private raise1: number;
  private raise2: number;
  private raise3: number;
  private raise4: number;
  private covering_depth: number;
  private bevel: number;
  private haunch_of_top_slab_and_wall: number;
  private haunch_of_bottom_slab_and_wall: number;
  private haunch_of_top_slab_and_middle_wall: number;
  private haunch_of_bottom_slab_and_middle_wall: number;

  public thickness_of_top_slab: any;
  public thickness_of_bottom_slab: any;
  public thickness_of_wall: any;
  public thickness_of_middle_wall1: any;
  public thickness_of_middle_wall2: any;
*/

  constructor( public input: InputDataService) {

  }

  ngOnInit() {
    this.input.number_of_spans = 1;
/*
    this.number_of_rail =  this.input.number_of_rail;
    this.intended_use_of_box_culvert = this.input.intended_use_of_box_culvert;
    this.structural_type_of_top_slab = this.input.structural_type_of_top_slab;
    this.structural_type_of_bottom_slab = this.input.structural_type_of_bottom_slab;
    this.structural_type_of_wall = this.input.structural_type_of_wall;
    this.structural_type_of_middle_wall = this.input.structural_type_of_middle_wall;
    this.span1 = this.input.span1;
    this.span2 = this.input.span2;
    this.span3 = this.input.span3;
    this.span4 = this.input.span4;
    this.raise1 = this.input.raise1;
    this.raise2 = this.input.raise2;
    this.raise3 = this.input.raise3;
    this.raise4 = this.input.raise4;
    this.covering_depth = this.input.covering_depth;
    this.bevel = this.input.bevel;
    this.haunch_of_top_slab_and_wall = this.input.haunch_of_top_slab_and_wall;
    this.haunch_of_bottom_slab_and_wall = this.input.haunch_of_bottom_slab_and_wall;
    this.haunch_of_top_slab_and_middle_wall = this.input.haunch_of_top_slab_and_middle_wall;
    this.haunch_of_bottom_slab_and_middle_wall = this.input.haunch_of_bottom_slab_and_middle_wall;

    this.thickness_of_top_slab = this.input.thickness_of_top_slab;
    this.thickness_of_bottom_slab = this.input.thickness_of_bottom_slab;
    this.thickness_of_wall = this.input.thickness_of_wall;
    this.thickness_of_middle_wall1 = this.input.thickness_of_middle_wall1;
    this.thickness_of_middle_wall2 = this.input.thickness_of_middle_wall2;
*/

  }

  ngOnDestroy() {
  }





}
