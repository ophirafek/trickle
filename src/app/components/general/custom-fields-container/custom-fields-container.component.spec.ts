import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldsContainerComponent } from './custom-fields-container.component';

describe('CustomFieldsContainerComponent', () => {
  let component: CustomFieldsContainerComponent;
  let fixture: ComponentFixture<CustomFieldsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomFieldsContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFieldsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
