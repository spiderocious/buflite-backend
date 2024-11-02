import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import { logger } from '../utils/logger';

interface MySQLConnectionState {
  isConnected: boolean;
  connection: DataSource | null;
}

class MySQLConnection {
  private static instance: MySQLConnection;
  private state: MySQLConnectionState = {
    isConnected: false,
    connection: null,
  };

  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }

  /**
   * Get DataSource configuration
   */
  private getDataSourceOptions(): DataSourceOptions  | any{
    const database = config.app.env === 'test' 
      ? config.database.mysql.testDatabase 
      : config.database.mysql.database;

    return {
      type: 'mysql',
      host: config.database.mysql.host,
      port: config.database.mysql.port,
      username: config.database.mysql.username,
      password: config.database.mysql.password,
      database: database,
      synchronize: config.app.env === 'development', // Only in development
      logging: config.app.env === 'development',
      entities: ['src/models/mysql/**/*.ts'],
      migrations: ['src/migrations/**/*.ts'],
      subscribers: ['src/subscribers/**/*.ts'],
      extra: {
        connectionLimit: config.database.mysql.options.connectionLimit,
        acquireTimeout: config.database.mysql.options.acquireTimeout,
        timeout: config.database.mysql.options.timeout,
      },
    };
  }

  /**
   * Connect to MySQL
   */
  public async connect(): Promise<void> {
    if (this.state.isConnected) {
      logger.info('MySQL already connected');
      return;
    }

    try {
      const options = this.getDataSourceOptions();
      const dataSource = new DataSource(options);
      
      await dataSource.initialize();

      this.state.isConnected = true;
      this.state.connection = dataSource;

      logger.info(`MySQL connected successfully to: ${options.host}:${options.port}/${options.database}`);

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Failed to connect to MySQL:', error);
      this.state.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MySQL
   */
  public async disconnect(): Promise<void> {
    if (!this.state.isConnected || !this.state.connection) {
      return;
    }

    try {
      await this.state.connection.destroy();
      this.state.isConnected = false;
      this.state.connection = null;
      logger.info('MySQL connection closed');
    } catch (error) {
      console.error('Error closing MySQL connection:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state.isConnected && this.state.connection?.isInitialized === true;
  }

  /**
   * Get connection instance
   */
  public getConnection(): DataSource | null {
    return this.state.connection;
  }

  /**
   * Get repository for entity
   */
  public getRepository<T extends import('typeorm').ObjectLiteral>(entity: any) {
    if (!this.state.connection) {
      throw new Error('MySQL connection not established');
    }
    return this.state.connection.getRepository<T>(entity);
  }

  /**
   * Get connection health
   */
  public async getHealth(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    database: string;
    tables: number;
  }> {
    try {
      if (!this.isConnected() || !this.state.connection) {
        return {
          status: 'disconnected',
          database: 'N/A',
          tables: 0,
        };
      }

      // Test query to check connection
      const result = await this.state.connection.query('SELECT DATABASE() as db_name');
      const tables = await this.state.connection.query(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()'
      );

      return {
        status: 'connected',
        database: result[0]?.db_name || 'unknown',
        tables: tables[0]?.count || 0,
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'N/A',
        tables: 0,
      };
    }
  }

  /**
   * Run migrations
   */
  public async runMigrations(): Promise<void> {
    if (!this.state.connection) {
      throw new Error('MySQL connection not established');
    }

    try {
      await this.state.connection.runMigrations();
      logger.info('MySQL migrations completed');
    } catch (error) {
      logger.error('MySQL migration failed:', error);
      throw error;
    }
  }

  /**
   * Clear database (for testing)
   */
  public async clearDatabase(): Promise<void> {
    if (config.app.env !== 'test') {
      throw new Error('clearDatabase can only be used in test environment');
    }

    if (!this.state.connection) {
      throw new Error('Database not connected');
    }

    try {
      // Get all table names
      const tables = await this.state.connection.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
      );

      // Disable foreign key checks
      await this.state.connection.query('SET FOREIGN_KEY_CHECKS = 0');

      // Drop all tables
      for (const table of tables) {
        await this.state.connection.query(`DROP TABLE IF EXISTS ${table.table_name}`);
      }

      // Re-enable foreign key checks
      await this.state.connection.query('SET FOREIGN_KEY_CHECKS = 1');

      // Run migrations to recreate tables
      await this.runMigrations();
    } catch (error) {
      console.error('Error clearing MySQL database:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mysqlConnection = MySQLConnection.getInstance();

// Export DataSource for direct access if needed
export { DataSource };
