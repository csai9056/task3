import { TestBed } from '@angular/core/testing';

import { DashboardInterceptor } from './dashboard.interceptor';

describe('DashboardInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DashboardInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: DashboardInterceptor = TestBed.inject(DashboardInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
