// constants
import { EMAIL_REGEX, DOMAIN_REGEX } from 'src/boot/constants';
import { SUPPRESSION_FIELD_ALIASES } from 'src/boot/campaign-constants';

const normalizeString = (value = '') => value.trim().toLowerCase();

const normalizeDomain = (value = '') => normalizeString(value)
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .split('/')[0]
  .replace(/:\d+$/, '')
  .replace(/^@/, '');

const normalizedAliases = Object.entries(SUPPRESSION_FIELD_ALIASES).flatMap(
  ([type, aliases]) => aliases.map((alias) => ({
    alias: normalizeString(alias),
    type,
  })),
);

const extractValues = ({ csvData, field, type }) => {
  const uniqueValues = new Set();

  let invalid = 0;
  let duplicates = 0;

  csvData.forEach((row) => {
    let value = row[field];

    if (!value) {
      return;
    }

    value = type === 'email'
      ? normalizeString(value)
      : normalizeDomain(value);

    const isValid = type === 'email'
      ? EMAIL_REGEX.test(value)
      : DOMAIN_REGEX.test(value);

    if (!isValid) {
      invalid++;
      return;
    }

    if (uniqueValues.has(value)) {
      duplicates++;
      return;
    }

    uniqueValues.add(value);
  });

  return {
    values: [...uniqueValues],
    stats: {
      total: csvData.length,
      valid: uniqueValues.size,
      invalid,
      duplicates,
    },
  };
};

export const detectSuppressionColumns = ({ csvHeaders = [], csvData = [] }) => {
  const detectedColumns = csvHeaders.map((header) => {
    const normalizedHeader = normalizeString(header);

    // ---------- Header Detection ----------
    const headerMatch = normalizedAliases.find(
      ({ alias }) => normalizedHeader.includes(alias) || alias.includes(normalizedHeader),
    );

    if (headerMatch) {
      const { values, stats } = extractValues({
        csvData,
        field: header,
        type: headerMatch.type,
      });

      return {
        field: header,
        type: headerMatch.type,
        confidence: 100,
        values,
        stats,
      };
    }

    // ---------- Value Detection ----------
    let total = 0;
    let emailCount = 0;
    let domainCount = 0;

    csvData.forEach((row) => {
      const value = row[header];

      if (!value) {
        return;
      }

      total++;

      if (EMAIL_REGEX.test(normalizeString(value))) {
        emailCount++;
      } else if (DOMAIN_REGEX.test(normalizeDomain(value))) {
        domainCount++;
      }
    });

    if (!total) {
      return null;
    }

    const emailConfidence = Math.round((emailCount / total) * 100);
    const domainConfidence = Math.round((domainCount / total) * 100);

    if (emailConfidence >= 80) {
      const { values, stats } = extractValues({
        csvData,
        field: header,
        type: 'email',
      });

      return {
        field: header,
        type: 'email',
        confidence: emailConfidence,
        values,
        stats,
      };
    }

    if (domainConfidence >= 80) {
      const { values, stats } = extractValues({
        csvData,
        field: header,
        type: 'domain',
      });

      return {
        field: header,
        type: 'domain',
        confidence: domainConfidence,
        values,
        stats,
      };
    }

    return null;
  });

  return detectedColumns
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence);
};

export const normalizeCustomFieldKey = (key) => (
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_') // replace spaces & special chars
    .replace(/^_+|_+$/g, '') // remove leading/trailing _
);

/**
 * Generates and triggers a browser download of an SMTP mailbox CSV template.
 * Includes all required/optional columns with a single dummy row so users
 * know the expected format before filling in real data.
 */
export const downloadSmtpCsvTemplate = () => {
  const headers = [
    'name',
    'email',
    'password',
    'smtp_host',
    'smtp_port',
    'smtp_secure',
    'imap_host',
    'imap_port',
    'imap_secure',
    'sending_limit_per_day',
    'minimum_time_gap_mins',
  ];

  const dummyRow = [
    'John Doe',
    'john@example.com',
    'yourpassword',
    'smtp.example.com',
    '465',
    'true',
    'imap.example.com',
    '993',
    'true',
    '20',
    '5',
  ];

  const csvContent = [headers.join(','), dummyRow.join(',')].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'smtp_mailboxes_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
