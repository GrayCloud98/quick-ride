import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideOffersPageComponent } from './ride-offers-page.component';

describe('RideOffersPageComponent', () => {
  let component: RideOffersPageComponent;
  let fixture: ComponentFixture<RideOffersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RideOffersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideOffersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
