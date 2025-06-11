import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRatingDialogComponent } from './ride-rating-dialog.component';

describe('RideRatingDialogComponent', () => {
  let component: RideRatingDialogComponent;
  let fixture: ComponentFixture<RideRatingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RideRatingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRatingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
