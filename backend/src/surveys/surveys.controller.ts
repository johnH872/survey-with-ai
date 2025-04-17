import { Controller, Get, Post, Patch, Delete, UseGuards, Query, Param, Body, Res } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SurveyAnalyticsService } from './survey-analytics.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { Response } from 'express';
import { DocxExportService, DocxData } from './docx-export.service';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(
    private readonly surveysService: SurveysService,
    private readonly surveyAnalyticsService: SurveyAnalyticsService,
    private readonly docxExportService: DocxExportService,
  ) {}

  @Post()
  create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(createSurveyDto);
  }

  @Get()
  findAll() {
    return this.surveysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveysService.update(id, updateSurveyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }

  @Get('analytics/report')
  async generateAnalyticsReport(@Query('surveyIds') surveyIds: string) {
    const ids = surveyIds.split(',');
    const surveys = await Promise.all(
      ids.map(id => this.surveysService.findOne(id))
    );

    // TODO: Get actual survey responses from database
    const mockResponses: Record<string, any[]> = {};
    surveys.forEach(survey => {
      mockResponses[survey.id] = [
        { question: "How satisfied are you?", answer: "Very satisfied" },
        { question: "How satisfied are you?", answer: "Satisfied" },
        { question: "How satisfied are you?", answer: "Neutral" },
      ];
    });

    const report = await this.surveyAnalyticsService.generateAnalyticsReport(surveys, mockResponses);
    return { report };
  }

  @Post('export-docx')
  async exportToDocx(@Body() data: DocxData, @Res() res: Response) {
    try {
      const buffer = await this.docxExportService.generateDocx(data);
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=analytics-report.docx',
      });
      
      res.send(buffer);
    } catch (error) {
      console.error('Error generating docx:', error);
      res.status(500).json({ error: 'Error generating docx file' });
    }
  }
} 