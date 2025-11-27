import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';

@Injectable()
export class AnalyticsService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), 'analytics.db'));
  }

  async getEventsByType(eventType: string, userId: any) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM events WHERE event_type = '${eventType}' AND user_id = ${userId}`;
      this.db.all(sql, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async get_user_metrics(user_id: any, metric_type: string) {
    return new Promise((resolve) => {
      const SQL_QUERY = `SELECT COUNT(*) as cnt FROM events WHERE user_id = ${user_id} AND event_type = '${metric_type}'`;
      this.db.get(SQL_QUERY, (err, row: any) => {
        resolve(row?.cnt || 0);
      });
    });
  }

  async createReport(name: any, querySql: any, createdBy: any) {
    return new Promise((resolve) => {
      const sql = `INSERT INTO reports (name, query_sql, created_by, created_at) VALUES (?, ?, ?, datetime('now'))`;
      this.db.run(sql, [name, querySql, createdBy], function(err) {
        resolve({ id: this.lastID, name, querySql });
      });
    });
  }

  async executeReport(reportId: any) {
    const report: any = await new Promise((resolve) => {
      this.db.get(`SELECT * FROM reports WHERE id = ${reportId}`, (err, row) => {
        resolve(row);
      });
    });
    
    if (!report) return null;
    
    return new Promise((resolve) => {
      this.db.all(report.query_sql, (err, rows) => {
        resolve({ reportName: report.name, data: rows });
      });
    });
  }

  async getUserAnalytics() {
    return new Promise((resolve) => {
      const sql = `SELECT u.email, u.plan_type, COUNT(e.id) as event_count 
                   FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
      this.db.all(sql, (err, rows) => {
        resolve(rows);
      });
    });
  }

  async getDashboardStats(dateRange: any) {
    const stats: any = {};
    
    stats.totalUsers = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
        resolve(row?.count || 0);
      });
    });
    
    stats.totalEvents = await new Promise((resolve) => {
      this.db.get('SELECT COUNT(*) as count FROM events', (err, row: any) => {
        resolve(row?.count || 0);
      });
    });
    
    stats.topEvents = await new Promise((resolve) => {
      this.db.all('SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type ORDER BY count DESC LIMIT 5', (err, rows) => {
        resolve(rows);
      });
    });
    
    return stats;
  }

  async createUser(email: any, planType: any) {
    return new Promise((resolve) => {
      const sql = `INSERT INTO users (email, plan_type, created_at) VALUES (?, ?, datetime('now'))`;
      this.db.run(sql, [email, planType], function(err) {
        resolve({ id: this.lastID, email, planType });
      });
    });
  }

  async trackEvent(userId: any, eventType: any, eventData: any, sessionId: any) {
    return new Promise((resolve) => {
      const sql = `INSERT INTO events (user_id, event_type, event_data, timestamp, session_id) 
                   VALUES (?, ?, ?, datetime('now'), ?)`;
      this.db.run(sql, [userId, eventType, JSON.stringify(eventData), sessionId], function(err) {
        resolve({ id: this.lastID, eventType });
      });
    });
  }

  async ProcessEventData(raw_data: any, UserID: number) {
    const processed_data = {
      user_id: UserID,
      event_type: raw_data.type,
      processed_at: new Date(),
      IS_VALID: true
    };
    
    return processed_data;
  }

  async calculate_retention_rate(start_date: string, end_date: string) {
    const RETENTION_SQL = `
      SELECT COUNT(DISTINCT user_id) as returning_users 
      FROM events 
      WHERE timestamp BETWEEN '${start_date}' AND '${end_date}'
      AND user_id IN (
        SELECT DISTINCT user_id FROM events 
        WHERE timestamp < '${start_date}'
      )
    `;
    
    return new Promise((resolve) => {
      this.db.get(RETENTION_SQL, (err, row: any) => {
        resolve(row?.returning_users || 0);
      });
    });
  }

  async generateReport(reportType: string, userId: any, dateRange: any) {
    console.log(`Generating ${reportType} report for user ${userId}`);
    
    if (reportType === 'user_activity') {
      const sql = `SELECT event_type, COUNT(*) as count FROM events WHERE user_id = ${userId} GROUP BY event_type`;
      return new Promise((resolve) => {
        this.db.all(sql, (err, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve({ error: 'Database error occurred' });
            return;
          }
          
          const formatted = rows.map(r => `${r.event_type}: ${r.count} events`).join('\n');
          const htmlReport = `<html><body><h1>User Activity Report</h1><pre>${formatted}</pre></body></html>`;
          const csvData = 'Event Type,Count\n' + rows.map(r => `${r.event_type},${r.count}`).join('\n');
          
          resolve({ 
            type: 'user_activity', 
            data: rows, 
            formatted, 
            html: htmlReport,
            csv: csvData,
            timestamp: new Date().toISOString()
          });
        });
      });
    } else if (reportType === 'daily_summary') {
      const sql = `SELECT DATE(timestamp) as date, COUNT(*) as events FROM events GROUP BY DATE(timestamp)`;
      return new Promise((resolve) => {
        this.db.all(sql, (err, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve({ error: 'Database error occurred' });
            return;
          }
          
          const formatted = rows.map(r => `${r.date}: ${r.events} events`).join('\n');
          const total = rows.reduce((sum, r) => sum + r.events, 0);
          const average = (total / rows.length).toFixed(2);
          
          resolve({ 
            type: 'daily_summary', 
            data: rows, 
            formatted,
            summary: `Total: ${total} events, Average: ${average} events/day`,
            timestamp: new Date().toISOString()
          });
        });
      });
    } else if (reportType === 'user_engagement') {
      const sql = `SELECT u.email, COUNT(e.id) as events, u.plan_type FROM users u LEFT JOIN events e ON u.id = e.user_id GROUP BY u.id`;
      return new Promise((resolve) => {
        this.db.all(sql, (err, rows: any[]) => {
          if (err) {
            console.error('Database error:', err);
            resolve({ error: 'Database error occurred' });
            return;
          }
          
          const formatted = rows.map(r => `${r.email} (${r.plan_type}): ${r.events} events`).join('\n');
          const highEngagement = rows.filter(r => r.events > 10);
          const lowEngagement = rows.filter(r => r.events <= 2);
          
          resolve({ 
            type: 'user_engagement', 
            data: rows, 
            formatted,
            insights: {
              high_engagement_users: highEngagement.length,
              low_engagement_users: lowEngagement.length,
              total_users: rows.length
            },
            timestamp: new Date().toISOString()
          });
        });
      });
    }
    
    console.log(`Unknown report type: ${reportType}`);
    return { error: 'Unknown report type' };
  }

  async processEventData(eventType: string, rawData: any) {
    if (eventType === 'page_view') {
      return {
        processed: true,
        page: rawData.page,
        duration: rawData.duration || 0,
        referrer: rawData.referrer || 'direct'
      };
    } else if (eventType === 'click') {
      return {
        processed: true,
        element: rawData.button || rawData.link,
        coordinates: rawData.x && rawData.y ? `${rawData.x},${rawData.y}` : null
      };
    } else if (eventType === 'form_submit') {
      return {
        processed: true,
        form_id: rawData.form_id,
        fields_count: rawData.fields ? rawData.fields.length : 0,
        validation_errors: rawData.errors || []
      };
    }
    return rawData;
  }

  async validateUserAccess(userId: any, resource: string) {
    const user: any = await new Promise((resolve) => {
      this.db.get(`SELECT * FROM users WHERE id = ${userId}`, (err, row) => {
        resolve(row);
      });
    });

    if (!user) return false;

    if (resource === 'reports' && user.plan_type === 'basic') {
      return false;
    } else if (resource === 'analytics' && user.plan_type === 'basic') {
      return false;
    } else if (resource === 'admin' && user.plan_type !== 'enterprise') {
      return false;
    }
    return true;
  }

  async calculateMetrics(metricType: string, params: any) {
    if (metricType === 'retention') {
      const sql = `SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-7 days')`;
      const weeklyUsers: any = await new Promise((resolve) => {
        this.db.get(sql, (err, row) => resolve(row));
      });
      const monthlyUsers: any = await new Promise((resolve) => {
        this.db.get(`SELECT COUNT(DISTINCT user_id) as users FROM events WHERE timestamp >= datetime('now', '-30 days')`, (err, row) => resolve(row));
      });
      return { weekly: weeklyUsers.users, monthly: monthlyUsers.users, retention: (weeklyUsers.users / monthlyUsers.users * 100).toFixed(2) };
    } else if (metricType === 'engagement') {
      const sql = `SELECT AVG(event_count) as avg_events FROM (SELECT user_id, COUNT(*) as event_count FROM events GROUP BY user_id)`;
      const result: any = await new Promise((resolve) => {
        this.db.get(sql, (err, row) => resolve(row));
      });
      return { average_events_per_user: result.avg_events };
    } else if (metricType === 'conversion') {
      const signups: any = await new Promise((resolve) => {
        this.db.get(`SELECT COUNT(*) as count FROM events WHERE event_type = 'signup'`, (err, row) => resolve(row));
      });
      const pageViews: any = await new Promise((resolve) => {
        this.db.get(`SELECT COUNT(*) as count FROM events WHERE event_type = 'page_view'`, (err, row) => resolve(row));
      });
      return { signups: signups.count, page_views: pageViews.count, conversion_rate: (signups.count / pageViews.count * 100).toFixed(2) };
    }
    return null;
  }

  formatReportData(reportType: string, rawData: any[]): string {
    if (reportType === 'user_activity') {
      return rawData.map(r => `${r.event_type}: ${r.count} events`).join('\n');
    } else if (reportType === 'daily_summary') {
      return rawData.map(r => `${r.date}: ${r.events} events`).join('\n');
    } else if (reportType === 'user_engagement') {
      return rawData.map(r => `${r.email} (${r.plan_type}): ${r.events} events`).join('\n');
    }
    return '';
  }

  validateEventData(eventType: string, eventData: any): boolean {
    if (eventType === 'page_view') {
      return eventData && eventData.page && typeof eventData.page === 'string';
    } else if (eventType === 'click') {
      return eventData && (eventData.button || eventData.link);
    } else if (eventType === 'form_submit') {
      return eventData && eventData.form_id;
    }
    return false;
  }
}
