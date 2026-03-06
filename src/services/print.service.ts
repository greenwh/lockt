// src/services/print.service.ts
import type {
  FreetextEntry,
  HealthProvider,
  HealthCondition,
  HealthImpairment,
  HealthJournalEntry,
  HealthMedication,
} from '../types/data.types';

/**
 * Print Service
 * Handles formatted printing for freetext and health data
 */

// Utility: Format date for printing
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Utility: Escape HTML
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Generate print-friendly HTML for Freetext entries
 */
export const printFreetextEntries = (entries: FreetextEntry[], title: string = 'Freetext Entries'): void => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        @media print {
          @page {
            margin: 1in;
          }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #007bff;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .entry {
          margin-bottom: 30px;
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .entry-title {
          font-size: 1.2em;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .entry-meta {
          font-size: 0.9em;
          color: #6c757d;
          margin-bottom: 10px;
        }
        .entry-field {
          margin-bottom: 10px;
        }
        .field-label {
          font-weight: bold;
          color: #495057;
        }
        .field-value {
          margin-left: 10px;
          white-space: pre-wrap;
        }
        .entry-content {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-left: 3px solid #007bff;
          white-space: pre-wrap;
        }
        .structured-fields {
          margin-top: 15px;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 3px;
        }
        .print-date {
          text-align: right;
          font-size: 0.9em;
          color: #6c757d;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${entries.map(entry => `
        <div class="entry">
          <div class="entry-title">${escapeHtml(entry.title)}</div>
          <div class="entry-meta">
            ${entry.category ? `<strong>Category:</strong> ${escapeHtml(entry.category)} | ` : ''}
            ${entry.attachedTo ? `<strong>Attached to:</strong> ${escapeHtml(entry.attachedTo)} | ` : ''}
            <strong>Created:</strong> ${formatDate(entry.createdAt)}
          </div>
          ${entry.description ? `
            <div class="entry-field">
              <span class="field-label">Description:</span>
              <span class="field-value">${escapeHtml(entry.description)}</span>
            </div>
          ` : ''}
          ${entry.content ? `
            <div class="entry-content">${escapeHtml(entry.content)}</div>
          ` : ''}
          ${entry.fields && entry.fields.length > 0 ? `
            <div class="structured-fields">
              <strong>Fields:</strong>
              ${entry.fields.map(field => `
                <div class="entry-field">
                  <span class="field-label">${escapeHtml(field.label)}:</span>
                  <span class="field-value">${escapeHtml(field.value)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${entry.email ? `<div class="entry-field"><span class="field-label">Email:</span> ${escapeHtml(entry.email)}</div>` : ''}
          ${entry.phone ? `<div class="entry-field"><span class="field-label">Phone:</span> ${escapeHtml(entry.phone)}</div>` : ''}
          ${entry.url ? `<div class="entry-field"><span class="field-label">URL:</span> ${escapeHtml(entry.url)}</div>` : ''}
          ${entry.notes ? `
            <div class="entry-field">
              <span class="field-label">Notes:</span>
              <div class="field-value">${escapeHtml(entry.notes)}</div>
            </div>
          ` : ''}
          ${entry.tags && entry.tags.length > 0 ? `
            <div class="entry-field">
              <span class="field-label">Tags:</span>
              <span class="field-value">${entry.tags.map(escapeHtml).join(', ')}</span>
            </div>
          ` : ''}
        </div>
      `).join('')}
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

/**
 * Generate print-friendly HTML for Health Providers
 */
export const printHealthProviders = (providers: HealthProvider[], title: string = 'Health Providers'): void => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        ${getCommonStyles()}
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background: #007bff;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Specialty</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${providers.map(provider => `
            <tr>
              <td><strong>${escapeHtml(provider.drName)}</strong></td>
              <td>${escapeHtml(provider.specialty)}</td>
              <td>
                ${provider.phone ? `Phone: ${escapeHtml(provider.phone)}<br>` : ''}
                ${provider.email ? `Email: ${escapeHtml(provider.email)}<br>` : ''}
                ${provider.fax ? `Fax: ${escapeHtml(provider.fax)}<br>` : ''}
                ${provider.account ? `Account: ${escapeHtml(provider.account)}` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

/**
 * Generate print-friendly HTML for Health Conditions
 */
export const printHealthConditions = (conditions: HealthCondition[], title: string = 'Health Conditions'): void => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        ${getCommonStyles()}
        .condition {
          margin-bottom: 20px;
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .condition-name {
          font-size: 1.2em;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${conditions.map(condition => `
        <div class="condition">
          <div class="condition-name">${escapeHtml(condition.condition)}</div>
          ${condition.dateOfDiagnosis ? `<p><strong>Diagnosed:</strong> ${formatDate(condition.dateOfDiagnosis)}</p>` : ''}
          ${condition.diagnosingDoctorOrAgency ? `<p><strong>Diagnosing Doctor/Agency:</strong> ${escapeHtml(condition.diagnosingDoctorOrAgency)}</p>` : ''}
          ${condition.symptomology ? `<p><strong>Symptomology:</strong> ${escapeHtml(condition.symptomology)}</p>` : ''}
        </div>
      `).join('')}
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

/**
 * Generate print-friendly HTML for Health Impairments
 */
export const printHealthImpairments = (impairments: HealthImpairment[], title: string = 'Health Impairments'): void => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        ${getCommonStyles()}
        .impairment {
          margin-bottom: 20px;
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .impairment-desc {
          font-size: 1.1em;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${impairments.map(impairment => `
        <div class="impairment">
          <div class="impairment-desc">${escapeHtml(impairment.description)}</div>
          ${impairment.dateOfOnset ? `<p><strong>Date of Onset:</strong> ${formatDate(impairment.dateOfOnset)}</p>` : ''}
          ${impairment.elaboration ? `<p><strong>Elaboration:</strong> ${escapeHtml(impairment.elaboration)}</p>` : ''}
        </div>
      `).join('')}
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

/**
 * Generate print-friendly HTML for Health Journal
 */
export const printHealthJournal = (entries: HealthJournalEntry[], title: string = 'Health Journal'): void => {
  // Sort by date descending
  const sortedEntries = [...entries].sort((a, b) => b.date - a.date);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        ${getCommonStyles()}
        .journal-entry {
          margin-bottom: 20px;
          page-break-inside: avoid;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        .journal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .journal-date {
          font-weight: bold;
          color: #007bff;
        }
        .pain-level {
          font-weight: bold;
          color: #dc3545;
        }
        .journal-reason {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .journal-content {
          white-space: pre-wrap;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${sortedEntries.map(entry => `
        <div class="journal-entry">
          <div class="journal-header">
            <span class="journal-date">${formatDate(entry.date)}</span>
            <span class="pain-level">Pain Level: ${entry.painLevel}/10</span>
          </div>
          <div class="journal-reason">${escapeHtml(entry.reasonForEntry)}</div>
          <div class="journal-content">${escapeHtml(entry.entry)}</div>
        </div>
      `).join('')}
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

/**
 * Common CSS styles for print
 */
const getCommonStyles = (): string => {
  return `
    @media print {
      @page {
        margin: 1in;
      }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #007bff;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .print-date {
      text-align: right;
      font-size: 0.9em;
      color: #6c757d;
      margin-top: 20px;
      page-break-inside: avoid;
    }
  `;
};

/**
 * Open print window with formatted HTML
 */
const openPrintWindow = (html: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to print.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };
};

/**
 * Generate print-friendly HTML for Health Medications
 */
export const printHealthMedications = (medications: HealthMedication[], title: string = 'Medications & Supplements'): void => {
  const statusColors: Record<string, string> = {
    active: '#155724',
    planned: '#004085',
    prn: '#856404',
    'not-taking': '#383d41',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        ${getCommonStyles()}
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 0.9em;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #007bff;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        .warning {
          color: #856404;
          font-weight: bold;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.85em;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Dose</th>
            <th>Frequency</th>
            <th>Type</th>
            <th>Status</th>
            <th>Purpose</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${medications.map(med => `
            <tr>
              <td>
                ${med.interactionNotes?.includes('\u26A0\uFE0F') ? '<span class="warning">\u26A0\uFE0F</span> ' : ''}
                <strong>${escapeHtml(med.name)}</strong>
              </td>
              <td>${escapeHtml(med.dose)}</td>
              <td>${escapeHtml(med.frequency)}${med.timing ? '<br><em>' + escapeHtml(med.timing) + '</em>' : ''}</td>
              <td>${escapeHtml(med.type)}</td>
              <td style="color: ${statusColors[med.status] || '#333'}">${escapeHtml(med.status)}</td>
              <td>${escapeHtml(med.purpose)}</td>
              <td>
                ${med.interactionNotes ? '<strong>Interactions:</strong> ' + escapeHtml(med.interactionNotes) + '<br>' : ''}
                ${med.depletionNotes ? '<strong>Depletions:</strong> ' + escapeHtml(med.depletionNotes) : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="print-date">Printed on ${formatDate(Date.now())}</div>
    </body>
    </html>
  `;

  openPrintWindow(html);
};

export const printService = {
  printFreetextEntries,
  printHealthProviders,
  printHealthConditions,
  printHealthImpairments,
  printHealthJournal,
  printHealthMedications,
};
