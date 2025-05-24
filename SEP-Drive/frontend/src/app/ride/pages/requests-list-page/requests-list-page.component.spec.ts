import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsListPageComponent } from './requests-list-page.component';

describe('RequestsListComponent', () => {
  let component: RequestsListPageComponent;
  let fixture: ComponentFixture<RequestsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestsListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
