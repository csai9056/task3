import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovetocardComponent } from './movetocard.component';

describe('MovetocardComponent', () => {
  let component: MovetocardComponent;
  let fixture: ComponentFixture<MovetocardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovetocardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovetocardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
