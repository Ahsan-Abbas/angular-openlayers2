import { TestBed } from '@angular/core/testing';

import { GravesService } from './graves.service';

describe('GravesService', () => {
  let service: GravesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GravesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
