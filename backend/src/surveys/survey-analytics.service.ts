import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Survey } from './entities/survey.entity';

@Injectable()
export class SurveyAnalyticsService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get('OPENAI_API_KEY'),
        });
    }

    async generateAnalyticsReport(surveys: Survey[], responses: Record<string, any[]>): Promise<string> {
        try {
            const prompt = this.prepareAnalyticsPrompt(surveys, responses);

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional survey analyst specializing in trend analysis and pattern recognition. 
                        Create a comprehensive report that analyzes multiple surveys and their responses.
                        Focus on identifying common themes, emerging patterns, and actionable insights.
                        Structure your response in clear sections with bullet points where appropriate.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content generated from OpenAI');
            }
            return content;
        } catch (error) {
            console.error('Error generating analytics report:', error);
            throw new Error('Failed to generate analytics report');
        }
    }

    private prepareAnalyticsPrompt(surveys: Survey[], responses: Record<string, any[]>): string {
        const surveyDetails = surveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            description: survey.description,
            responseCount: responses[survey.id]?.length || 0
        }));

        return `
            Analytics Report Request

            Total Number of Surveys: ${surveys.length}

            Survey Details:
            ${JSON.stringify(surveyDetails, null, 2)}

            Response Data:
            ${JSON.stringify(responses, null, 2)}

            Please provide a comprehensive analysis including:

            1. Survey Overview
            - Total number of surveys analyzed
            - Distribution of survey topics/themes
            - Most common survey types

            2. Topic Analysis
            - Main themes and topics across surveys
            - Frequency and distribution of topics
            - Emerging trends in survey topics

            3. Key Insights
            - Common patterns in survey responses
            - Notable trends across different surveys
            - Significant findings and observations

            4. Issues and Recommendations
            - For each major topic identified:
                * Current challenges or issues
                * One specific recommendation for improvement
                * Potential impact of implementing the recommendation

            Please structure the response in clear sections with bullet points for better readability.
            Focus on actionable insights and practical recommendations.
            `;
    }
} 