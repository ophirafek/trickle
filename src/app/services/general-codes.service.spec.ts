import { TestBed } from '@angular/core/testing';

import { GeneralCodesService } from './general-codes.service';

describe('GeneralCodesService', () => {
  let service: GeneralCodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralCodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
