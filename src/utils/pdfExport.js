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
  labTitle: { fontSize: 22, italics: true, bold: true, color: '#FF3333', margin: [0, 0, 0, 4] },
  labSub: { fontSize: 12, italics: true, color: '#A00', margin: [0, 0, 0, 6] },
  sectionTitle: { fontSize: 15, bold: true, margin: [0, 22, 0, 4], color: '#000' },
  bodyLabel: { fontSize: 9, bold: true },
  bodyValue: { fontSize: 11, color: '#000' },
  abnormalValue: { fontSize: 11, bold: true, color: '#000' },
  noteText: { fontSize: 8, italics: true, color: '#555' },
  tableHeader: { fontSize: 12, bold: true, color: '#000' }
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
          widths: ['55%', '45%'],
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
        { text: labDetails.specialistQualification || '', alignment: 'right', color: '#000', style: 'bodyValue' }
      ]
    ]
  },
  boxedSection(
  [
    // Patient name with gender-based prefix
    {
      columns: [
        {
          width: 100,
          text: "Patient's Name: ",
          bold: true,
          style: 'bodyValue'
        },
        {
          width: '*',
          text: `${patient.gender?.toLowerCase() === 'male'
            ? 'Mr. '
            : patient.gender?.toLowerCase() === 'female'
              ? 'Ms. '
              : ''
          }${patient.name || ''}`,
          style: 'bodyValue'
        }
      ],
      columnGap: 2
    },

    // Age and gender
    {
      columns: [
        { width: 'auto', ...labelVal('Age: ', patient.age) },
        { width: 'auto', ...labelVal('Gender: ', patient.gender, {alignment: 'right'}) }
      ],
      columnGap: 15
    },

    // Mobile number
    patient.mobile && labelVal('Mobile: ', patient.mobile)
  ],

  [
    // Referring doctor's name with aligned wrapping
    {
      columns: [
        {
          width: 80,
          text: 'Referred By: ',
          bold: true,
          style: 'bodyValue'
        },
        {
          width: '*',
          text: patient.referredBy || '',
          style: 'bodyValue'
        }
      ],
      columnGap: 2
    },

    // Sample collection date
    labelVal(
      'Sample Collected On: ',
      patient.sampleDate
        ? new Date(patient.sampleDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '',
      {
        alignment: 'left'
      }
    )
  ])
]);

/**
 * Footer Builder
 */
const footer = (labDetails, currentPage, pageCount) => {
  const showAppDetails = localStorage.getItem('showAppDetailsInReport') === 'true';
  const showPageNumbers = localStorage.getItem('showPageNumbersInReport') === 'true';

  return {
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
                  { text: 'Technologist', bold: true, color: '#000' }
                ].filter(Boolean),
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
      },
      ...(showPageNumbers
        ? [
            {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'right',
              fontSize: 8,
              color: '#555',
              margin: [0, 6, 0, 0]
            }
          ]
        : []),
      ...(showAppDetails && currentPage === pageCount
        ? [{
            text: [
              'This report was digitally generated using app ',
              {
                text: 'github.com/aniket-thakoor/pathology-lab',
                link: 'https://github.com/aniket-thakoor/pathology-lab',
                color: '#2a5db0',
                decoration: 'underline'
              }
            ],
            fontSize: 7,
            color: '#777',
            alignment: 'left',
            margin: [0, 4, 0, 0]
          }]
        : [])
    ].filter(Boolean)
  };
};

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

  const classifyGroup = (group) => {
    const paramCount = group.subGroups?.reduce((acc, sub) => {
      const validParams = sub.parameters.filter(param => !!results[param.id]);
      return acc + validParams.length;
    }, 0) || 0;

    return {
      paramCount,
      type:
        paramCount >= 10 || !!group.desc?.trim()
          ? 'isolated'
          : paramCount >= 6
          ? 'medium'
          : 'small'
    };
  };

  const isolatedGroups = [];
  const mediumGroups = [];
  const smallGroups = [];

  groups.forEach(group => {
    const { type } = classifyGroup(group);
    if (type === 'isolated') isolatedGroups.push(group);
    else if (type === 'medium') mediumGroups.push(group);
    else smallGroups.push(group);
  });

  const totalGroups = isolatedGroups.length + mediumGroups.length + smallGroups.length;
  let groupCounter = 0;
  let smallIndex = 0;

  const buildGroupBlock = (group) => {
    const groupContent = [];

    groupContent.push({ text: group.classification || group.name, alignment: 'center', style: 'sectionTitle' });

    const headers = [
      { text: 'TEST DESCRIPTION', style: 'tableHeader', decoration: 'underline' },
      { text: 'OBSERVED VALUE', style: 'tableHeader', alignment: 'left', decoration: 'underline' },
      ...(group.hasRanges ? [{ text: 'REFERENCE RANGE', style: 'tableHeader', alignment: 'left', decoration: 'underline' }] : [])
    ];

    const rows = [];

    group.subGroups.forEach(sub => {
      const subRows = [];

      sub.parameters.forEach(param => {
        const val = results[param.id];
        if (!val) return;

        const { min, max } = param.ranges?.[patient.gender] || param.ranges?.Common || {};
        const rangeText = `${min ?? ''}–${max ?? ''}`;
        const abnormal = param.ranges && !isNaN(parseFloat(val)) && (val < min || val > max);

        const row = [
          { text: param.name, style: 'bodyValue' },
          { text: val, margin: group.hasRanges ? [-60, 0, 0, 0] : [0, 0, 0, 0], style: abnormal ? 'abnormalValue' : 'bodyValue', alignment: group.hasRanges ? 'center' : 'left', decoration: abnormal ? 'underline' : '' }
        ];
        if (group.hasRanges) {
          row.push({
            text: showRanges ? `${rangeText}${param.unit ? ' (' + param.unit + ')' : ''}` : '',
            alignment: 'left',
            style: 'bodyValue',
            noWrap: true
          });
        }

        subRows.push(row);
      });

      if (subRows.length > 0) {
        rows.push([
          { text: sub.name, colSpan: group.hasRanges ? 3 : 2, bold: true, fontSize: 11, decoration: 'underline' },
          ...(group.hasRanges ? ['', ''] : [''])
        ]);
        rows.push(...subRows);
      }
    });

    groupContent.push(buildTable(headers, rows, group.hasRanges ? ['40%', '30%', '30%'] : ['*', 'auto']));

    if (group.desc) {
      groupContent.push({
        stack: [
          { text: 'Interpretation & Remark:', bold: true, fontSize: 11, margin: [0, 16, 0, 4] },
          { text: group.desc, fontSize: 11 }
        ],
        keepTogether: true
      });
    }

    return {
      keepTogether: true,
      stack: groupContent
    };
  };

  // 🔹 Add isolated groups
  isolatedGroups.forEach(group => {
    groupBlocks.push(buildGroupBlock(group));
    groupCounter++;
    if (groupCounter < totalGroups) {
      groupBlocks.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
      groupBlocks.push({ text: '', pageBreak: 'after' });
    }
  });

  // 🔹 Add medium groups
  for (let i = 0; i < mediumGroups.length; i++) {
    groupBlocks.push(buildGroupBlock(mediumGroups[i]));
    groupCounter++;

    const isLastMedium = i === mediumGroups.length - 1;
    const isOddCount = mediumGroups.length % 2 !== 0;

    if ((i + 1) % 2 === 0) {
      if (groupCounter < totalGroups) {
        groupBlocks.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
        groupBlocks.push({ text: '', pageBreak: 'after' });
      }
    } else if (isOddCount && isLastMedium && smallGroups[smallIndex]) {
      groupBlocks.push(buildGroupBlock(smallGroups[smallIndex]));
      groupCounter++;
      smallIndex++;
      if (groupCounter < totalGroups) {
        groupBlocks.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
        groupBlocks.push({ text: '', pageBreak: 'after' });
      }
    } else if (isLastMedium && groupCounter < totalGroups) {
      groupBlocks.push({
        text: '-- End of Report --',
        style: 'bodyValue',
        alignment: 'center',
        bold: true,
        margin: [0, 20, 0, 4]
      });
      groupBlocks.push({ text: '', pageBreak: 'after' });
    }
  }

  // 🔹 Add remaining small groups
  for (let i = smallIndex; i < smallGroups.length; i++) {
    groupBlocks.push(buildGroupBlock(smallGroups[i]));
    groupCounter++;
    if ((i - smallIndex + 1) % 3 === 0) {
      if (groupCounter < totalGroups) {
        groupBlocks.push({
          text: '-- End of Report --',
          style: 'bodyValue',
          alignment: 'center',
          bold: true,
          margin: [0, 20, 0, 4]
        });
        groupBlocks.push({ text: '', pageBreak: 'after' });
      }
    }
  }

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
    pageMargins: [20, 164.4, 20, 105], // top margin increased to accommodate header
    content: groupBlocks,
    styles,
    defaultStyle: { font: 'PathLabFont', fontSize: 11 },
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
  pdfMake.createPdf(docDef).download(`Report_${opts.patient.name || 'Patient'}.pdf`);
}

/**
 * Return a Blob for sharing
 */
export function getSummaryReportBlob(opts, callback) {
  const docDef = getSummaryReportDocDef(opts);
  pdfMake.createPdf(docDef).getBlob(blob => callback(blob));
}
