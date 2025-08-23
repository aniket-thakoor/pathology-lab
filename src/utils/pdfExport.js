import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.vfs;

/**
 * Common styles
 */
const styles = {
  labTitle: { fontSize: 20, bold: true, color: '#000', margin: [0, 0, 0, 4] },
  labSub: { fontSize: 11, italics: true, color: '#555', margin: [0, 0, 0, 6] },
  sectionTitle: { fontSize: 13, bold: true, margin: [0, 8, 0, 4], color: '#000' },
  bodyLabel: { fontSize: 9, bold: true },
  bodyValue: { fontSize: 9, color: '#000' },
  abnormalValue: { fontSize: 9, bold: true, color: '#000' },
  noteText: { fontSize: 8, italics: true, color: '#555' },
  tableHeader: { fontSize: 10, bold: true, color: '#000' }
};

/**
 * Helpers
 */
const labelVal = (label, value, opts = {}) => ({
  text: [{ text: label, bold: true }, { text: value || '' }],
  style: 'bodyValue',
  ...opts
});

const boxedSection = (leftStack, rightStack) => ({
  table: {
    widths: ['*'],
    body: [[
      {
        table: {
          widths: ['50%', '50%'],
          body: [[
            { stack: leftStack.filter(Boolean), border: [false, false, false, false] },
            { stack: rightStack.filter(Boolean), border: [false, false, false, false] }
          ]]
        },
        layout: 'noBorders'
      }
    ]]
  },
  layout: {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#000',
    vLineColor: () => '#000'
  },
  margin: [0, 5, 0, 10]
});

const buildTable = (headers, bodyRows, widths) => ({
  table: { headerRows: 1, widths, body: [headers, ...bodyRows] },
  layout: {
    fillColor: () => null,
    hLineWidth: () => 0.5,
    vLineWidth: () => 0,
    hLineColor: () => 'white'
  }
});

/**
 * Header Builder
 */
const labHeader = (patient, labDetails) => ([
  { text: labDetails.labName || '', style: 'labTitle', alignment: 'center' },
  { text: labDetails.subHeading || '', style: 'labSub', alignment: 'center' },
  { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: 'white' }], margin: [0, 4, 0, 4] },
  {
    columns: [
      [
        labDetails.address && { text: labDetails.address, style: 'bodyValue' },
        labelVal('Phone: ', labDetails.phone),
        labDetails.email && labelVal('Email: ', labDetails.email)
      ].filter(Boolean),
      [
        { text: labDetails.specialistName || '', bold: true, alignment: 'right', style: 'bodyValue' },
        { text: labDetails.specialistQualification || '', alignment: 'right', color: '#222', style: 'bodyValue' }
      ]
    ]
  },
  boxedSection(
    [
      // Add prefix here based on gender
      labelVal(
        `Patient's Name: `,
        `${patient.gender?.toLowerCase() === 'male'
          ? 'Mr. '
          : patient.gender?.toLowerCase() === 'female'
            ? 'Ms. '
            : ''}${patient.name || ''}`
      ),
      labelVal('Age: ', patient.age),
      labelVal('Gender: ', patient.gender),
      patient.mobile && labelVal('Mobile: ', patient.mobile)
    ],
    [
      labelVal('Referred By: ', patient.referredBy, { alignment: 'right' }),
      labelVal('Sample Collected On: ', new Date(patient.sampleDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }), { alignment: 'right' })
    ]
  )
]);

/**
 * Footer Builder
 */
const footer = (labDetails) => ({
  margin: [40, 0, 40, 40],
  table: {
    widths: ['50%', '50%'],
    body: [
      [
        {
          stack: [
            { text: 'Please Correlate Clinically.', style: 'bodyValue', margin: [0, 6, 0, 0] },
            { text: '', margin: [0, 20, 0, 20] },
            { text: 'Technologist', bold: true, color: '#000' }
          ],
          border: [false, false, false, false],
          alignment: 'left'
        },
        {
          stack: [
            labDetails.signature
              ? { image: labDetails.signature, width: 60, alignment: 'right', margin: [0, 0, 0, 4] }
              : { text: '' },
            { text: labDetails.doctorName || '', bold: true, alignment: 'right', color: '#000' },
            { text: labDetails.doctorQualification || '', alignment: 'right', fontSize: 8 }
          ],
          border: [false, false, false, false],
          alignment: 'right'
        }
      ]
    ]
  },
  layout: 'noBorders'
});


/**
 * Pure builder: returns the docDefinition without downloading or sharing
 */
export function getSummaryReportDocDef({ patient, labDetails, groups, results, showRanges, showNotes }) {
  const content = [];

  groups.forEach((group, idx) => {
    if (idx > 0) content.push({ text: '', pageBreak: 'before' });
    content.push(...labHeader(patient, labDetails));
    content.push({ text: group.name, alignment: 'center', style: 'sectionTitle' });

    const headers = [
      { text: 'TEST DESCRIPTION', style: 'tableHeader', decoration: 'underline' },
      { text: 'OBSERVED VALUE', style: 'tableHeader', alignment: 'center', decoration: 'underline' },
      ...(group.hasRanges ? [{ text: 'REFERENCE RANGE', style: 'tableHeader', alignment: 'right', decoration: 'underline' }] : [])
    ];

    const rows = [];
    group.subGroups.forEach(sub => {
      rows.push([
        { text: sub.name, colSpan: group.hasRanges ? 3 : 2, bold: true, fontSize: 9, decoration: 'underline' },
        ...(group.hasRanges ? ['', ''] : [''])
      ]);

      sub.parameters.forEach(param => {
        const val = results[param.id] || '-';
        const rangeText = Object.entries(param.ranges || {}).map(([_, r]) => `${r.min}–${r.max}`).join(' | ');
        const abnormal = (() => {
          const r = param.ranges?.[patient.gender] || param.ranges?.Common;
          return r && !isNaN(parseFloat(val)) && (val < r.min || val > r.max);
        })();

        const row = [
          { text: param.name, style: 'bodyValue' },
          { text: val, style: abnormal ? 'abnormalValue' : 'bodyValue', alignment: 'center' }
        ];
        if (group.hasRanges) {
          row.push({
            text: showRanges ? `${rangeText}${param.unit ? ' (' + param.unit + ')' : ''}` : '',
            alignment: 'right',
            style: 'bodyValue',
            noWrap: true
          });
        }
        rows.push(row);
      });
    });

    content.push(buildTable(headers, rows, group.hasRanges ? ['33.34%', '33.33%', '33.33%'] : ['*', 'auto']));

    if (group.desc) {
      content.push({
        table: {
          widths: ['*'],
          body: [[
            {
              text: [
                { text: 'Interpretation & Remark:', bold: true, fontSize: 10 },
                { text: '\n' + group.desc, fontSize: 9 }
              ],
              color: '#000'
            }
          ]]
        },
        layout: {
          hLineWidth: i => i === 0 ? 0.5 : 0,
          hLineColor: () => 'white',
          vLineWidth: () => 0
        },
        margin: [0, 16, 0, 0]
      });
    }
  });

  return {
    pageSize: 'A4',
    pageMargins: [20, 20, 20, 100],
    content,
    styles,
    defaultStyle: { fontSize: 10 },
    footer: () => footer(labDetails)
  };
}

/**
 * Download PDF
 */
export function exportSummaryReport(opts) {
  const docDef = getSummaryReportDocDef(opts);
  pdfMake.createPdf(docDef).download(`Summary_Report_${opts.patient.name || 'Patient'}.pdf`);
}

/**
 * Return a Blob for sharing
 */
export function getSummaryReportBlob(opts, callback) {
  const docDef = getSummaryReportDocDef(opts);
  pdfMake.createPdf(docDef).getBlob(blob => callback(blob));
}
