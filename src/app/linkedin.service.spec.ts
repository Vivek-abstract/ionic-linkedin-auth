import { TestBed } from '@angular/core/testing';

import { LinkedinService } from './linkedin.service';

describe('LinkedinService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkedinService = TestBed.get(LinkedinService);
    expect(service).toBeTruthy();
  });
});
