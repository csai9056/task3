import { TestBed } from '@angular/core/testing';

import { AuthsGuard } from './auths.guard';

describe('AuthsGuard', () => {
  let guard: AuthsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
