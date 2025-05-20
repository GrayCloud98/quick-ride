import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestRidePageComponent } from './request-ride-page.component';

describe('RidePageComponent', () => {
  let component: RequestRidePageComponent;
  let fixture: ComponentFixture<RequestRidePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestRidePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestRidePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
