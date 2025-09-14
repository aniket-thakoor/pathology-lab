import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts.js';
// pdfMake.vfs = pdfFonts.vfs;
import { vfs } from "@/fonts/vfs_fonts";

pdfMake.vfs = vfs;

pdfMake.fonts = {
  PathLabFont: {
    normal: 'CourierPrime-Regular.ttf',
    bold: 'CourierPrime-Bold.ttf',
    italics: 'CourierPrime-Italic.ttf',
    bolditalics: 'CourierPrime-BoldItalic.ttf'
  }
};


/**
 * Common styles
 */
const styles = {
  labTitle: { fontSize: 20, bold: true, color: '#333', margin: [0, 0, 0, 4] },
  labSub: { fontSize: 11, italics: true, color: '#555', margin: [0, 0, 0, 6] },
  sectionTitle: { fontSize: 13, bold: true, margin: [0, 8, 0, 4], color: '#222' },
  bodyLabel: { fontSize: 9, bold: true },
  bodyValue: { fontSize: 9, color: '#222' },
  abnormalValue: { fontSize: 9, bold: true, color: '#222' },
  noteText: { fontSize: 8, italics: true, color: '#555' },
  tableHeader: { fontSize: 10, bold: true, color: '#222' }
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
    hLineColor: () => '#222',
    vLineColor: () => '#222'
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
      {
        columns: [
          { width: 'auto', ...labelVal('Age: ', patient.age) },
          { width: 'auto', ...labelVal('Gender: ', patient.gender, { alignment: 'right' }) }
        ],
        columnGap: 15
      },
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
const footer = (labDetails, currentPage, pageCount) => ({
  margin: [40, 0, 40, 40],
  stack: [
    {
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            {
              stack: [
                currentPage === pageCount
                  ? { text: 'Please Correlate Clinically.', style: 'bodyValue', margin: [0, 6, 0, 0] }
                  : { text: '', margin: [0, 20, 0, 0] },
                { text: '', margin: [0, 20, 0, 20] },
                { text: 'Technologist', bold: true, color: '#222' }
              ].filter(Boolean),
              border: [false, false, false, false],
              alignment: 'left'
            },
            {
              stack: [
                labDetails.signature
                  ? { image: labDetails.signature, width: 60, alignment: 'right', margin: [0, 0, 0, 4] }
                  : { text: '' },
                { text: labDetails.doctorName || '', bold: true, alignment: 'right', color: '#222' },
                { text: labDetails.doctorQualification || '', alignment: 'right', fontSize: 8 }
              ],
              border: [false, false, false, false],
              alignment: 'right'
            }
          ]
        ]
      },
      layout: 'noBorders'
    },
    {
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'right',
      fontSize: 8,
      color: '#555',
      margin: [0, 6, 0, 0]
    },
    currentPage === pageCount && {
      text: [
        'This report was digitally generated using app ',
        {
          text: 'pathology-lab',
          link: 'https://github.com/aniket-thakoor/pathology-lab',
          color: '#2a5db0',
          decoration: 'underline'
        }
      ],
      fontSize: 7,
      color: '#777',
      alignment: 'left',
      margin: [0, 4, 0, 0]
    }
  ].filter(Boolean)
});

const shouldIsolateGroup = (group, results) => {
  const paramCount = group.subGroups?.reduce((acc, sub) => {
    const validParams = sub.parameters.filter(param => !!results[param.id]);
    return acc + validParams.length;
  }, 0) || 0;

  return paramCount >= 10 || !!group.desc?.trim();
};

/**
 * Pure builder: returns the docDefinition without downloading or sharing
 */
export function getSummaryReportDocDef({ patient, labDetails, groups, results, showRanges, showNotes }) {
  const content = [];
  
  const groupBlocks = [];

  groups.forEach((group, index) => {
    const groupContent = [];

    groupContent.push({ text: group.classification || group.name, alignment: 'center', style: 'sectionTitle' });

    const headers = [
      { text: 'TEST DESCRIPTION', style: 'tableHeader', decoration: 'underline' },
      { text: 'OBSERVED VALUE', style: 'tableHeader', alignment: 'center', decoration: 'underline' },
      ...(group.hasRanges ? [{ text: 'REFERENCE RANGE', style: 'tableHeader', alignment: 'right', decoration: 'underline' }] : [])
    ];

    const rows = [];
    let paramCount = 0;

    group.subGroups.forEach(sub => {
      const subRows = [];

      sub.parameters.forEach(param => {
        const val = results[param.id];
        if (!val) return;

        paramCount++;

        const { min, max } = param.ranges?.[patient.gender] || param.ranges?.Common || {};  
        const rangeText = `${min ?? ''}–${max ?? ''}`;

        const abnormal = (() => {
          const r = param.ranges?.[patient.gender] || param.ranges?.Common;
          return r && !isNaN(parseFloat(val)) && (val < r.min || val > r.max);
        })();

        const row = [
          { text: param.name, style: 'bodyValue' },
          { text: val, style: abnormal ? 'abnormalValue' : 'bodyValue', alignment: group.hasRanges ? 'center' : 'left', decoration: abnormal ? 'underline' : '' }
        ];
        if (group.hasRanges) {
          row.push({
            text: showRanges ? `${rangeText}${param.unit ? ' (' + param.unit + ')' : ''}` : '',
            alignment: 'right',
            style: 'bodyValue',
            noWrap: true
          });
        }

        subRows.push(row);
      });

      if (subRows.length > 0) {
        rows.push([
          { text: sub.name, colSpan: group.hasRanges ? 3 : 2, bold: true, fontSize: 9, decoration: 'underline' },
          ...(group.hasRanges ? ['', ''] : [''])
        ]);
        rows.push(...subRows);
      }
    });

    groupContent.push(buildTable(headers, rows, group.hasRanges ? ['33.34%', '33.33%', '33.33%'] : ['*', 'auto']));

    if (group.desc) {
      groupContent.push({
        stack: [
          { text: 'Interpretation & Remark:', bold: true, fontSize: 10, margin: [0, 16, 0, 4] },
          { text: group.desc, fontSize: 9 }
        ],
        keepTogether: true
      });
    }

    const isolate = shouldIsolateGroup(group, results);
    const isFirstGroup = index === 0;
    const isLastGroup = index === groups.length - 1;
    const nextGroup = groups[index + 1];
    const nextIsolate = nextGroup && shouldIsolateGroup(nextGroup, results);

    // 🔹 If next group is isolated, add End of Report before pageBreak: 'before'
    if (nextIsolate && !isLastGroup) {
      groupContent.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
    }

    const groupBlock = {
      keepTogether: true,
      stack: groupContent,
      ...(isolate && !isFirstGroup ? { pageBreak: 'before' } : {})
    };

    groupBlocks.push(groupBlock);

    // 🔹 If current group is isolated and next is not, add End of Report before pageBreak: 'after'
    if (isolate && !isLastGroup && !nextIsolate) {
      groupBlocks.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
      groupBlocks.push({ text: '', pageBreak: 'after' });
    } else if (!isLastGroup) {
      groupBlocks.push({ text: '', margin: [0, 20, 0, 0] });
    }
  });

  if (groupBlocks.length > 0) {
    groupBlocks.push({
      stack: [
        {
          text: '-- End of Report --',
          style: 'bodyValue',
          alignment: 'center',
          bold: true,
          margin: [0, 20, 0, 4]
        }
      ]
    });
  }

  return {
    pageSize: 'A4',
    pageMargins: [20, 150, 20, 105], // top margin increased to accommodate header
    content: groupBlocks,
    styles,
    defaultStyle: { font: 'PathLabFont', fontSize: 10 },
    header: () => ({
      margin: [20, 20, 20, 0],
      stack: labHeader(patient, labDetails)
    }),
    footer: (currentPage, pageCount) => footer(labDetails, currentPage, pageCount)
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
