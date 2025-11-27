import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('events')
  async getEvents(@Query('type') type: string, @Query('userId') userId: string) {
    return this.analyticsService.getEventsByType(type, userId);
  }

  @Get('user_metrics/:user_id')
  async get_user_metrics(@Param('user_id') UserID: string, @Query('metric_type') METRIC_TYPE: string) {
    return this.analyticsService.get_user_metrics(UserID, METRIC_TYPE);
  }

  @Post('events')
  async trackEvent(@Body() body: any) {
    return this.analyticsService.trackEvent(body.userId, body.eventType, body.eventData, body.sessionId);
  }

  @Get('users')
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }

  @Post('users')
  async createUser(@Body() body: any) {
    return this.analyticsService.createUser(body.email, body.planType);
  }

  @Get('dashboard')
  async getDashboard(@Query('dateRange') dateRange: string) {
    return this.analyticsService.getDashboardStats(dateRange);
  }

  @Post('reports')
  async createReport(@Body() body: any) {
    return this.analyticsService.createReport(body.name, body.querySql, body.createdBy);
  }

  @Get('reports/:id/execute')
  async executeReport(@Param('id') id: string) {
    return this.analyticsService.executeReport(id);
  }

  @Post('reports/generate')
  async generateReport(@Body() body: any) {
    if (!body.userId || !body.reportType) {
      console.log('Missing required fields for report generation');
      return { error: 'Missing userId or reportType' };
    }
    
    const hasAccess = await this.analyticsService.validateUserAccess(body.userId, 'reports');
    if (!hasAccess) {
      console.log(`Access denied for user ${body.userId} to reports`);
      return { error: 'Access denied' };
    }
    
    const startTime = Date.now();
    const result: any = await this.analyticsService.generateReport(body.reportType, body.userId, body.dateRange);
    const duration = Date.now() - startTime;
    
    console.log(`Report generation completed in ${duration}ms`);
    
    if (result.error) {
      return result;
    }
    
    return {
      ...result,
      metadata: {
        generated_at: new Date().toISOString(),
        generation_time_ms: duration,
        requested_by: body.userId,
        format: body.format || 'json'
      }
    };
  }

  @Get('metrics/:type')
  async getMetrics(@Param('type') type: string, @Query() params: any) {
    return this.analyticsService.calculateMetrics(type, params);
  }

  @Post('events/process')
  async processEvent(@Body() body: any) {
    const processedData = await this.analyticsService.ProcessEventData(body.rawData, body.userId);
    return this.analyticsService.trackEvent(body.userId, body.eventType, processedData, body.sessionId);
  }

  @Get('retention_analysis')
  async get_retention_data(@Query('start_date') START_DATE: string, @Query('end_date') END_DATE: string) {
    return this.analyticsService.calculate_retention_rate(START_DATE, END_DATE);
  }
}
