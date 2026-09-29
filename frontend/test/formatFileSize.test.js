import { describe, expect, it } from 'vitest';
import formatFileSize from '../src/utils/formatFileSize.js';

describe('formatFileSize', () => {
  it('formata bytes e converte para KB e MB', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1_572_864)).toBe('1.5 MB');
  });
});