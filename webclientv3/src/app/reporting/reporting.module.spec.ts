import { ReportingModule } from './reporting.module';

describe('ReportingModule', () => {
  let reportingModule: ReportingModule;

  beforeEach(() => {
    reportingModule = new ReportingModule();
  });

  it('should create an instance', () => {
    expect(reportingModule).toBeTruthy();
  });
});
