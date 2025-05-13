import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredCompanyModalComponent } from './insured-company-modal.component';

describe('InsuredCompanyModalComponent', () => {
  let component: InsuredCompanyModalComponent;
  let fixture: ComponentFixture<InsuredCompanyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsuredCompanyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuredCompanyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
