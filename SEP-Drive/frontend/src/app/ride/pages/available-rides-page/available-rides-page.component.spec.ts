import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableRidesPageComponent } from './available-rides-page.component';

describe('RequestsListComponent', () => {
  let component: AvailableRidesPageComponent;
  let fixture: ComponentFixture<AvailableRidesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvailableRidesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableRidesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
