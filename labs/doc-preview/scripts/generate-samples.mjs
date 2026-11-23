#!/usr/bin/env bun
/**
 * Generates the two demo fixtures committed under samples/.
 * Run with: bun run samples
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import pptxgen from 'pptxgenjs';

const outDir = join(import.meta.dir, '..', 'public', 'samples');
mkdirSync(outDir, { recursive: true });

const border = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const cell = (text, bold = false) =>
  new TableCell({
    borders: { top: border, bottom: border, left: border, right: border },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })],
  });

const doc = new Document({
  creator: 'Doc Preview Lab',
  title: 'Document Preview Lab — DOCX fixture',
  description: 'A small DOCX used to exercise docx-preview in the browser.',
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: 'Document Preview Lab', bold: true })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'A DOCX fixture rendered entirely in the browser by docx-preview.',
              color: '666666',
            }),
          ],
          spacing: { after: 240 },
        }),
        new Paragraph({ text: 'Why this file exists', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({
          children: [
            new TextRun('The preview path is '),
            new TextRun({ text: 'client-side', bold: true }),
            new TextRun(
              ': the file is unzipped, its WordprocessingML is parsed, and the result is mounted as HTML. Nothing is uploaded unless the lab explicitly asks the Worker to store it.',
            ),
          ],
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'What the fixture covers', italics: true })],
          spacing: { after: 80 },
        }),
        new Paragraph({ text: 'Headings, body copy, bold and italic runs', bullet: { level: 0 } }),
        new Paragraph({ text: 'A bordered table with a header row', bullet: { level: 0 } }),
        new Paragraph({ text: 'A second page with a page break', bullet: { level: 0 } }),
        new Paragraph({ text: 'A monospaced block for command output', bullet: { level: 0 } }),
        new Paragraph({ text: 'Table', heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [cell('Layer', true), cell('Library', true), cell('Runs on', true)],
            }),
            new TableRow({ children: [cell('DOCX'), cell('docx-preview'), cell('Browser DOM')] }),
            new TableRow({ children: [cell('PPTX'), cell('pptxviewjs'), cell('Canvas 2D')] }),
            new TableRow({
              children: [cell('Legacy .doc / .ppt'), cell('—'), cell('Convert first')],
            }),
          ],
        }),
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({ text: 'Second page', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({
          children: [
            new TextRun(
              'Page breaks are one of the details that separate a real renderer from a text extractor. docx-preview paginates the document and exposes a print-friendly wrapper.',
            ),
          ],
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'openssl verify -CAfile root.pem -untrusted int.pem leaf.pem',
              font: 'Courier New',
              size: 19,
            }),
          ],
          shading: { fill: 'F2F2F2' },
          spacing: { before: 120, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun(
              'The point of the fixture is not layout fidelity on every edge case. It is a fast, repeatable check that the selected renderer works inside this repository without a build-time service.',
            ),
          ],
        }),
      ],
    },
  ],
});

const docxBytes = await Packer.toBuffer(doc);
await Bun.write(join(outDir, 'sample.docx'), docxBytes);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Doc Preview Lab';
pptx.company = 'DEV ARTISAN';
pptx.subject = 'PPTX fixture';
pptx.title = 'Document Preview Lab — PPTX fixture';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};

const dark = '111111';
const muted = '666666';
const accent = '2F6FED';

const cover = pptx.addSlide();
cover.background = { color: 'F7F7F5' };
cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: dark } });
cover.addText('DOC PREVIEW // PPTX', {
  x: 0.75,
  y: 0.65,
  w: 6.5,
  h: 0.4,
  fontFace: 'Consolas',
  fontSize: 11,
  color: muted,
  charSpacing: 2,
});
cover.addText('Canvas rendering,', {
  x: 0.75,
  y: 1.45,
  w: 8.4,
  h: 0.8,
  fontFace: 'Aptos Display',
  fontSize: 38,
  bold: true,
  color: dark,
});
cover.addText('no server round-trip', {
  x: 0.75,
  y: 2.25,
  w: 8.4,
  h: 0.8,
  fontFace: 'Aptos Display',
  fontSize: 38,
  bold: true,
  color: dark,
});
cover.addText(
  'Three slides generated with PptxGenJS, parsed and painted by pptxviewjs in the browser.',
  {
    x: 0.78,
    y: 4.0,
    w: 7.4,
    h: 0.9,
    fontFace: 'Aptos',
    fontSize: 16,
    color: muted,
  },
);
cover.addShape(pptx.ShapeType.line, {
  x: 0.78,
  y: 5.15,
  w: 5.2,
  h: 0,
  line: { color: accent, width: 2 },
});
cover.addText('FIXTURE 01  ·  CLIENT-SIDE ONLY', {
  x: 0.78,
  y: 5.35,
  w: 6.0,
  h: 0.35,
  fontFace: 'Consolas',
  fontSize: 10,
  color: muted,
  charSpacing: 1,
});

const tableSlide = pptx.addSlide();
tableSlide.background = { color: 'FFFFFF' };
tableSlide.addText('What the renderer has to handle', {
  x: 0.7,
  y: 0.55,
  w: 10,
  h: 0.6,
  fontFace: 'Aptos Display',
  fontSize: 28,
  bold: true,
  color: dark,
});
tableSlide.addTable(
  [
    [
      { text: 'Element', options: { bold: true, color: 'FFFFFF', fill: { color: dark } } },
      { text: 'Fixture', options: { bold: true, color: 'FFFFFF', fill: { color: dark } } },
      { text: 'Checked by', options: { bold: true, color: 'FFFFFF', fill: { color: dark } } },
    ],
    ['Text runs', 'Bold, color, size', 'Canvas text'],
    ['Shapes', 'Rule and side bar', 'Fill / stroke'],
    ['Table', 'Header row + borders', 'Cell layout'],
    ['Chart', 'Bar chart on slide 3', 'Chart.js'],
  ],
  {
    x: 0.7,
    y: 1.55,
    w: 11.8,
    h: 4.6,
    fontFace: 'Aptos',
    fontSize: 16,
    color: dark,
    border: { type: 'solid', color: 'D9D9D9', pt: 1 },
    fill: 'FFFFFF',
    rowH: 0.75,
    valign: 'middle',
  },
);
tableSlide.addText('The Worker is optional. The viewer never needs it.', {
  x: 0.7,
  y: 6.55,
  w: 10,
  h: 0.4,
  fontFace: 'Consolas',
  fontSize: 11,
  color: muted,
});

const chartSlide = pptx.addSlide();
chartSlide.background = { color: 'F7F7F5' };
chartSlide.addText('Render cost, measured locally', {
  x: 0.7,
  y: 0.5,
  w: 8,
  h: 0.6,
  fontFace: 'Aptos Display',
  fontSize: 28,
  bold: true,
  color: dark,
});
chartSlide.addText('Milliseconds to first painted slide on the fixture. Lower is better.', {
  x: 0.72,
  y: 1.1,
  w: 8,
  h: 0.4,
  fontFace: 'Aptos',
  fontSize: 13,
  color: muted,
});
chartSlide.addChart(
  pptx.ChartType.bar,
  [
    {
      name: 'First paint (ms)',
      labels: ['DOCX', 'PPTX', 'Worker'],
      values: [42, 118, 260],
    },
  ],
  {
    x: 0.7,
    y: 1.75,
    w: 7.6,
    h: 4.6,
    barDir: 'bar',
    chartColors: [accent],
    showValue: true,
    dataLabelFontSize: 12,
    catAxisLabelFontSize: 13,
    valAxisLabelFontSize: 11,
    valGridLine: { color: 'E3E3E3', style: 'solid', size: 1 },
    showLegend: false,
    title: '',
  },
);
chartSlide.addText('Fixture values are illustrative, not a benchmark.', {
  x: 8.6,
  y: 5.95,
  w: 3.9,
  h: 0.6,
  fontFace: 'Aptos',
  fontSize: 11,
  color: muted,
  italic: true,
});

const pptxBytes = await pptx.write({ outputType: 'nodebuffer' });
await Bun.write(join(outDir, 'sample.pptx'), pptxBytes);

console.log('wrote', join(outDir, 'sample.docx'), docxBytes.length, 'bytes');
console.log('wrote', join(outDir, 'sample.pptx'), pptxBytes.length, 'bytes');
