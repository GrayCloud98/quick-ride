import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RidehistoryComponent } from './ridehistory.component';

describe('RidehistoryComponent', () => {
  let component: RidehistoryComponent;
  let fixture: ComponentFixture<RidehistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RidehistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RidehistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
