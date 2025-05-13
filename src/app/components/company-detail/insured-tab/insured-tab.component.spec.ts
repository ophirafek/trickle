import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuredTabComponent } from './insured-tab.component';

describe('InsuredTabComponent', () => {
  let component: InsuredTabComponent;
  let fixture: ComponentFixture<InsuredTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsuredTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuredTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
