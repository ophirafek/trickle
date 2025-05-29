import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralCodeSelectComponent } from './general-code-select.component';

describe('GeneralCodeSelectComponent', () => {
  let component: GeneralCodeSelectComponent;
  let fixture: ComponentFixture<GeneralCodeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralCodeSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralCodeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
