import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideSimulationComponent } from './ride-simulation.component';

describe('RideSimulationComponent', () => {
  let component: RideSimulationComponent;
  let fixture: ComponentFixture<RideSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RideSimulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
