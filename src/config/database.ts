import { config } from './index';
import { mongoConnection } from './mongodb';
import { mysqlConnection } from './mysql';
import { logger } from '../utils/logger';

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'error';
  type: 'mongodb' | 'mysql';
  database: string;
  collections?: number;
  tables?: number;
}

export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getHealth(): Promise<DatabaseHealth>;
  clearDatabase?(): Promise<void>;
}

class DatabaseFactory {
  private static currentConnection:  any | null = null;

  /**
   * Initialize database connection based on configuration
   */
  public static async connect(): Promise<void> {
    try {
      const dbType = config.database.type;
      
      logger.info(`Initializing ${dbType.toUpperCase()} connection...`);

      switch (dbType) {
        case 'mongodb':
          this.currentConnection = mongoConnection;
          await mongoConnection.connect();
          break;
          
        case 'mysql':
          this.currentConnection = mysqlConnection;
          await mysqlConnection.connect();
          break;
          
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }

      logger.info(`Database (${dbType}) connected successfully`);
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from current database
   */
  public static async disconnect(): Promise<void> {
    if (this.currentConnection) {
      await this.currentConnection.disconnect();
      this.currentConnection = null;
    }
  }

  /**
   * Check if database is connected
   */
  public static isConnected(): boolean {
    return this.currentConnection?.isConnected() || false;
  }

  /**
   * Get current database connection
   */
  public static getConnection(): DatabaseConnection | null {
    return this.currentConnection;
  }

  /**
   * Get database health status
   */
  public static async getHealth(): Promise<DatabaseHealth> {
    if (!this.currentConnection) {
      return {
        status: 'disconnected',
        type: config.database.type,
        database: 'N/A',
      };
    }

    const health = await this.currentConnection.getHealth();
    return {
      ...health,
      type: config.database.type,
    };
  }

  /**
   * Get specific connection instance based on type
   */
  public static getMongoConnection(): any {
    if (config.database.type !== 'mongodb') {
      throw new Error('MongoDB is not the active database type');
    }
    return mongoConnection;
  }

  public static getMySQLConnection(): any {
    if (config.database.type !== 'mysql') {
      throw new Error('MySQL is not the active database type');
    }
    return mysqlConnection;
  }

  /**
   * Clear database (for testing)
   */
  public static async clearDatabase(): Promise<void> {
    if (config.app.env !== 'test') {
      throw new Error('clearDatabase can only be used in test environment');
    }

    if (!this.currentConnection || !this.currentConnection.clearDatabase) {
      throw new Error('Database connection not available or clearDatabase not supported');
    }

    await this.currentConnection.clearDatabase();
  }

  /**
   * Switch database type (primarily for testing)
   */
  public static async switchDatabase(type: 'mongodb' | 'mysql'): Promise<void> {
    if (config.app.env === 'production') {
      throw new Error('Database switching is not allowed in production');
    }

    // Disconnect current connection
    await this.disconnect();

    // Update config temporarily
    const originalType = config.database.type;
    config.database.type = type;

    try {
      // Connect to new database
      await this.connect();
    } catch (error) {
      // Restore original type on error
      config.database.type = originalType;
      throw error;
    }
  }

  /**
   * Test database connection
   */
  public static async testConnection(): Promise<boolean> {
    try {
      if (!this.currentConnection) {
        return false;
      }

      const health = await this.currentConnection.getHealth();
      return health.status === 'connected';
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  public static async getStats(): Promise<{
    type: string;
    connected: boolean;
    uptime: number;
    health: DatabaseHealth;
  }> {
    const startTime = Date.now();
    const health = await this.getHealth();
    const responseTime = Date.now() - startTime;

    return {
      type: config.database.type,
      connected: this.isConnected(),
      uptime: responseTime,
      health,
    };
  }
}

// Export the factory and individual connections
export default DatabaseFactory;
export { mongoConnection, mysqlConnection };

// Export convenience functions with proper binding
export const connectDatabase = () => DatabaseFactory.connect();
export const disconnectDatabase = () => DatabaseFactory.disconnect();
export const isDatabaseConnected = () => DatabaseFactory.isConnected();
export const getDatabaseHealth = () => DatabaseFactory.getHealth();
export const getDatabaseStats = () => DatabaseFactory.getStats();
