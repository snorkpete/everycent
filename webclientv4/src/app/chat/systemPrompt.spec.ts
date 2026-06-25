import { describe, it, expect } from 'vitest';
import { getSystemPrompt } from './systemPrompt';

describe('getSystemPrompt', () => {
  describe('nlq mode', () => {
    it('returns a non-empty string', () => {
      expect(getSystemPrompt('nlq').length).toBeGreaterThan(0);
    });

    it('contains financial analysis context', () => {
      expect(getSystemPrompt('nlq')).toContain('financial analysis assistant');
    });

    it('contains Everycent-specific data model content', () => {
      expect(getSystemPrompt('nlq')).toContain('zero-based budgeting');
    });
  });

  describe('bug-report mode', () => {
    it('returns a non-empty string', () => {
      expect(getSystemPrompt('bug-report').length).toBeGreaterThan(0);
    });

    it('contains bug-reporting context', () => {
      expect(getSystemPrompt('bug-report')).toContain('bug-reporting assistant');
    });

    it('mentions create_bug_report tool', () => {
      expect(getSystemPrompt('bug-report')).toContain('create_bug_report');
    });

    it('mentions search_bug_reports tool', () => {
      expect(getSystemPrompt('bug-report')).toContain('search_bug_reports');
    });
  });

  it('returns different prompts for different modes', () => {
    expect(getSystemPrompt('nlq')).not.toBe(getSystemPrompt('bug-report'));
  });
});
