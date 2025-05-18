import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRidePageComponent } from './active-ride-page.component';

describe('ActiveRidePageComponent', () => {
  let component: ActiveRidePageComponent;
  let fixture: ComponentFixture<ActiveRidePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveRidePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveRidePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
