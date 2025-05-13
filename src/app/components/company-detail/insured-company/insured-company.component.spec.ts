import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredCompanyComponent } from './insured-company.component';

describe('InsuredCompanyComponent', () => {
  let component: InsuredCompanyComponent;
  let fixture: ComponentFixture<InsuredCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsuredCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuredCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
