import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeneralCodeService, GeneralCode } from '../../../services/general-codes.service';

import { TranslocoService } from '@jsverse/transloco';

@Component({
  standalone: false,
  selector: 'app-general-code-select',
  templateUrl: './general-code-select.component.html',
  styleUrls: ['./general-code-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GeneralCodeSelectComponent),
      multi: true
    }
  ]
})
export class GeneralCodeSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() codeType!: number;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showEmptyOption: boolean = true;
  @Input() emptyOptionText: string = 'COMMON.NOT_SPECIFIED';
  @Input() emptyOptionValue: any = 0;
  @Input() languageCode?: number;
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() showLabel: boolean = true;
  @Input() hint: string = '';
  @Input() errorMsg: string = '';

  @Output() selectionChange = new EventEmitter<any>();

  codes: GeneralCode[] = [];
  loading: boolean = false;
  innerValue: any = null;
  isDisabled: boolean = false;
  touched: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(
    private generalCodeService: GeneralCodeService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload codes if codeType changes
    if (changes['codeType'] && !changes['codeType'].firstChange) {
      this.loadCodes();
    }

    // Update disabled state
    if (changes['disabled']) {
      this.isDisabled = changes['disabled'].currentValue;
    }
  }

  loadCodes(): void {
    if (!this.codeType) {
      console.error('Code type is required');
      return;
    }

    this.loading = true;
    
    // Use provided language code or get active language from transloco
    const language = this.languageCode || 
      (this.translocoService.getActiveLang() === 'he' ? 2 : 1);

    this.generalCodeService.getCodesByType(this.codeType, language)
      .subscribe({
        next: (codes) => {
          this.codes = codes;
          this.loading = false;
        },
        error: (error) => {
          console.error(`Error loading codes for type ${this.codeType}:`, error);
          this.loading = false;
        }
      });
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.innerValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // Value change handling
  onValueChange(event: any): void {
    this.innerValue = event.value;
    this.onChange(this.innerValue);
    this.selectionChange.emit(this.innerValue);
    this.markAsTouched();
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  // Helper method to get code description by number
  getCodeDescription(codeNumber: number): string {
    const code = this.codes.find(c => c.codeNumber === codeNumber);
    return code ? code.codeShortDescription : '';
  }
}