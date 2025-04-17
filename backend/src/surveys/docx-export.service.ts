import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export interface DocxData {
  title: string;
  content: string;
  sections: {
    title: string;
    content: string;
  }[];
}

@Injectable()
export class DocxExportService {
  private createBulletPoint(text: string, level: number = 0): Paragraph {
    return new Paragraph({
      bullet: {
        level,
      },
      spacing: {
        before: 100,
        after: 100,
      },
      children: [
        new TextRun({
          text: text.trim(),
          size: 22,
          font: 'Arial',
        }),
      ],
    });
  }

  private processContent(content: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const lines = content.split('\n');
    let inSection4 = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.trim()) {
        // Add empty line to preserve spacing
        paragraphs.push(new Paragraph({
          spacing: {
            before: 50,
            after: 50,
          },
        }));
        continue;
      }

      // Check if we're in section 4
      if (line.startsWith('**4.')) {
        inSection4 = true;
      } else if (line.startsWith('**')) {
        inSection4 = false;
      }

      // Handle section titles (starts with **)
      if (line.startsWith('**')) {
        paragraphs.push(new Paragraph({
          spacing: {
            before: 100,
            after: 50,
          },
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, ''),
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
        }));
        continue;
      }

      // Handle bullet points
      if (line.startsWith('-')) {
        const matchResult = line.match(/^\s*/);
        const indentLevel = matchResult ? matchResult[0].length / 2 : 0;
        const bulletText = line.trim().substring(1).trim();
        
        paragraphs.push(new Paragraph({
          indent: {
            left: indentLevel * 720,
          },
          spacing: {
            before: 20,
            after: 20,
          },
          children: [
            new TextRun({
              text: bulletText,
              size: 22,
              font: 'Arial',
            }),
          ],
        }));
        continue;
      }

      // Handle regular text
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          before: 50,
          after: 50,
        },
        children: [
          new TextRun({
            text: line,
            size: 22,
            font: 'Arial',
          }),
        ],
      }));
    }

    return paragraphs;
  }

  async generateDocx(data: DocxData): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
            children: [
              new TextRun({
                text: data.title,
                bold: true,
                size: 36,
                font: 'Arial',
              }),
            ],
          }),

          // Content
          ...this.processContent(data.content),

          // Sections
          ...data.sections.flatMap(section => [
            // Section Title
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 200,
                after: 100,
              },
              children: [
                new TextRun({
                  text: section.title,
                  bold: true,
                  size: 28,
                  font: 'Arial',
                }),
              ],
            }),

            // Section Content
            ...this.processContent(section.content),
          ]),

          // Footer
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: {
              before: 200,
            },
            children: [
              new TextRun({
                text: 'Generated on ' + new Date().toLocaleDateString(),
                size: 18,
                font: 'Arial',
                color: '666666',
              }),
            ],
          }),
        ],
      }],
    });

    return await Packer.toBuffer(doc);
  }
} 