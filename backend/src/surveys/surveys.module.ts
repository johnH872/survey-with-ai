import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { Survey } from './entities/survey.entity';
import { User } from '../users/entities/user.entity';
import { SurveyAnalyticsService } from './survey-analytics.service';
import { DocxExportService } from './docx-export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, User])
  ],
  controllers: [SurveysController],
  providers: [SurveysService, SurveyAnalyticsService, DocxExportService],
  exports: [SurveysService, SurveyAnalyticsService]
})
export class SurveysModule {} 