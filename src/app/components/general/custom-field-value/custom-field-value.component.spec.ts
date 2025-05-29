import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldValueComponent } from './custom-field-value.component';

describe('CustomFieldValueComponent', () => {
  let component: CustomFieldValueComponent;
  let fixture: ComponentFixture<CustomFieldValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomFieldValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFieldValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
