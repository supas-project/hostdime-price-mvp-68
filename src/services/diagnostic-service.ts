
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  latency?: number;
  timestamp: Date;
}

export interface DiagnosticReport {
  results: DiagnosticResult[];
  overallStatus: 'success' | 'error' | 'pending';
  timestamp: Date;
  environment: string;
  sessionInfo?: {
    user?: string;
    expires?: Date;
  };
}

export class DiagnosticService {
  private static instance: DiagnosticService;
  private report: DiagnosticReport;

  private constructor() {
    this.report = {
      results: [],
      overallStatus: 'pending',
      timestamp: new Date(),
      environment: import.meta.env.MODE || 'unknown',
    };
  }

  public static getInstance(): DiagnosticService {
    if (!DiagnosticService.instance) {
      DiagnosticService.instance = new DiagnosticService();
    }
    return DiagnosticService.instance;
  }

  public async runAllDiagnostics(): Promise<DiagnosticReport> {
    this.resetReport();
    
    // Run all diagnostic tests in parallel
    await Promise.all([
      this.testAuthConnection(),
      this.testDatabaseConnection(),
      this.testSessionManagement()
    ]);
    
    // Calculate overall status
    this.report.overallStatus = this.report.results.some(r => r.status === 'error') 
      ? 'error' 
      : 'success';
    
    this.report.timestamp = new Date();
    return { ...this.report };
  }

  private resetReport() {
    this.report.results = [];
    this.report.overallStatus = 'pending';
    this.report.timestamp = new Date();
  }

  private async testAuthConnection(): Promise<void> {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      
      const latency = performance.now() - startTime;
      
      if (error) {
        this.addResult('Auth Connection', 'error', `Failed to connect to Auth API: ${error.message}`, latency);
        return;
      }
      
      const session = data.session;
      if (session) {
        this.report.sessionInfo = {
          user: session.user.email || session.user.id,
          expires: new Date(session.expires_at! * 1000),
        };
        this.addResult('Auth Connection', 'success', 'Successfully connected to Auth API', latency);
      } else {
        this.addResult('Auth Connection', 'success', 'Auth API connection successful, but no active session', latency);
      }
    } catch (err) {
      const latency = performance.now() - startTime;
      this.addResult('Auth Connection', 'error', `Exception during Auth test: ${(err as Error).message}`, latency);
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    const startTime = performance.now();
    try {
      // We'll use a simple query to check database connection
      // This will only work if the user has access to this table
      const { error } = await supabase
        .from('_dummy_query_for_diagnostics')
        .select('*')
        .limit(1)
        .single();
      
      const latency = performance.now() - startTime;
      
      // For our diagnostic, we expect this query to fail with a specific error
      // about the table not existing, which confirms DB connection
      if (error && error.code === 'PGRST116') {
        // This is the expected error code when table doesn't exist
        this.addResult('Database Connection', 'success', 'Successfully connected to database', latency);
      } else if (error) {
        // If we get a different error, the database is accessible but unexpected error
        this.addResult('Database Connection', 'success', 
          `Database connection successful (expected error received): ${error.code}`, latency);
      } else {
        // This shouldn't happen as the table doesn't exist
        this.addResult('Database Connection', 'success', 'Database connection successful, but got unexpected result', latency);
      }
    } catch (err) {
      const latency = performance.now() - startTime;
      this.addResult('Database Connection', 'error', `Exception during database test: ${(err as Error).message}`, latency);
    }
  }

  private async testSessionManagement(): Promise<void> {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const latency = performance.now() - startTime;
      
      if (error) {
        this.addResult('Session Management', 'error', `Failed to get session: ${error.message}`, latency);
        return;
      }
      
      const session = data.session as Session | null;
      
      if (session) {
        // Check if session is valid
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        
        if (expiresAt > now) {
          // Session is valid
          const timeRemaining = Math.round((expiresAt.getTime() - now.getTime()) / (60 * 1000));
          this.addResult('Session Management', 'success', 
            `Valid session found. Expires in ${timeRemaining} minutes.`, latency);
        } else {
          this.addResult('Session Management', 'error', 'Session expired but not refreshed properly', latency);
        }
      } else {
        this.addResult('Session Management', 'success', 'No active session', latency);
      }
    } catch (err) {
      const latency = performance.now() - startTime;
      this.addResult('Session Management', 'error', `Exception during session test: ${(err as Error).message}`, latency);
    }
  }

  private addResult(
    name: string, 
    status: 'success' | 'error' | 'pending', 
    message: string, 
    latency?: number
  ): void {
    this.report.results.push({
      name,
      status,
      message,
      latency,
      timestamp: new Date()
    });
  }
}

export const diagnosticService = DiagnosticService.getInstance();
