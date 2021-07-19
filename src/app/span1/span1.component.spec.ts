import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Span1Component } from './span1.component';

describe('Span1Component', () => {
  let component: Span1Component;
  let fixture: ComponentFixture<Span1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Span1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Span1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
