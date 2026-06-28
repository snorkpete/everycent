import { describe, it, expect } from 'vitest';
import { getSystemPrompt } from './systemPrompt';

// Arbitrary fixed date — only verifies the string is embedded, not the format
const FIXED_DATE = 'Sunday, 28 June 2026';

describe('getSystemPrompt', () => {
  describe('nlq mode', () => {
    it('returns a non-empty string', () => {
      expect(getSystemPrompt('nlq', FIXED_DATE).length).toBeGreaterThan(0);
    });

    it('contains financial analysis context', () => {
      expect(getSystemPrompt('nlq', FIXED_DATE)).toContain('financial analysis assistant');
    });

    it('contains Everycent-specific data model content', () => {
      expect(getSystemPrompt('nlq', FIXED_DATE)).toContain('zero-based budgeting');
    });
  });

  describe('bug-report mode', () => {
    it('returns a non-empty string', () => {
      expect(getSystemPrompt('bug-report', FIXED_DATE).length).toBeGreaterThan(0);
    });

    it('contains bug-reporting context', () => {
      expect(getSystemPrompt('bug-report', FIXED_DATE)).toContain('bug-reporting assistant');
    });

    it('mentions create_bug_report tool', () => {
      expect(getSystemPrompt('bug-report', FIXED_DATE)).toContain('create_bug_report');
    });

    it('mentions search_bug_reports tool', () => {
      expect(getSystemPrompt('bug-report', FIXED_DATE)).toContain('search_bug_reports');
    });
  });

  it('returns different prompts for different modes', () => {
    expect(getSystemPrompt('nlq', FIXED_DATE)).not.toBe(getSystemPrompt('bug-report', FIXED_DATE));
  });

  it('appends the supplied date to nlq prompt', () => {
    expect(getSystemPrompt('nlq', FIXED_DATE)).toContain(FIXED_DATE);
  });

  it('appends the supplied date to bug-report prompt', () => {
    expect(getSystemPrompt('bug-report', FIXED_DATE)).toContain(FIXED_DATE);
  });
});
