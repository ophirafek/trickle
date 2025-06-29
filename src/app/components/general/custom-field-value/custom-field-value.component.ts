import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { GeneralCode, GeneralCodeService } from '../../../services/general-codes.service';
import { MaterialModule } from '../../../core/modules/material.module';
import { SharedModule } from '../../../core/modules/shared.module';

@Component({
  selector: 'app-custom-field-value',
  templateUrl: './custom-field-value.component.html',
  standalone: true,
  imports: [MaterialModule, SharedModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFieldValueComponent),
      multi: true
    }
  ]
})
export class CustomFieldValueComponent implements OnInit, ControlValueAccessor {
  @Input() field: any;
  @Input() readOnly = false;

  generalCodes: GeneralCode[] = [];
  isLoadingGeneralCodes = false;

  // Form control for the field value
  control = new FormControl();

  // Required for ControlValueAccessor
  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(private generalCodeService: GeneralCodeService) { }

  ngOnInit(): void {
    this.setupField();
    this.control.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  /**
   * Setup field based on its type
   */
  private setupField(): void {
    // Load general codes if field type is general-code
    if (this.field && this.field.fieldType === 'general-code' && this.field.generalCodeType) {
      this.loadGeneralCodes(this.field.generalCodeType);
    }

    // Set initial value
    if (this.field && this.field.defaultValue !== null && this.field.defaultValue !== undefined) {
      this.control.setValue(this.field.defaultValue);
    }

    // Set required validator if field is required
    if (this.field && this.field.isRequired) {
      this.control.setValidators([control => control.value ? null : { required: true }]);
    }

    // Set readonly if specified
    if (this.readOnly) {
      this.control.disable();
    }
  }

  /**
   * Load general codes for a general-code type field
   */
  private loadGeneralCodes(codeType: number): void {
    this.isLoadingGeneralCodes = true;
    this.generalCodeService.getCodesByType(codeType)
      .subscribe({
        next: (codes) => {
          this.generalCodes = codes.filter(code => code.isActive);
          this.isLoadingGeneralCodes = false;
        },
        error: (error) => {
          console.error('Error loading general codes:', error);
          this.isLoadingGeneralCodes = false;
        }
      });
  }

  /**
   * Get options for select and multi-select fields
   */
  getOptions(): any[] {
    return this.field && this.field.options?.filter((o: any) => o) || [];
  }

  /**
   * Check if a multi-select option is selected
   */
  isOptionSelected(optionId: number): boolean {
    if (!this.control.value || !Array.isArray(this.control.value)) {
      return false;
    }
    return this.control.value.includes(optionId);
  }

  /**
   * Toggle a multi-select option
   */
  toggleOption(optionId: number): void {
    if (!this.control.value || !Array.isArray(this.control.value)) {
      this.control.setValue([optionId]);
      return;
    }

    const currentValue = [...this.control.value];
    const index = currentValue.indexOf(optionId);

    if (index === -1) {
      currentValue.push(optionId);
    } else {
      currentValue.splice(index, 1);
    }

    this.control.setValue(currentValue);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}