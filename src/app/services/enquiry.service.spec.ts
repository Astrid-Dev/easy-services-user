import { TestBed } from '@angular/core/testing';

import { EnquiryService } from './enquiry.service';

describe('EnquiryService', () => {
  let service: EnquiryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnquiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
