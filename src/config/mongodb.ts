import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

interface MongoConnection {
  isConnected: boolean;
  connection: typeof mongoose | null;
}

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private connection: MongoConnection = {
    isConnected: false,
    connection: null,
  };

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (this.connection.isConnected) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      const uri = config.app.env === 'test' 
        ? config.database.mongodb.testUri 
        : config.database.mongodb.uri;

      await mongoose.connect(uri, config.database.mongodb.options);

      this.connection.isConnected = true;
      this.connection.connection = mongoose;

      logger.info(`MongoDB connected successfully to: ${uri.split('@').pop()}`);

      // Connection event handlers
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.connection.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.connection.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.connection.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.connection.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.connection.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.connection.isConnected = false;
      this.connection.connection = null;
      console.log('📴 MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connection.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection instance
   */
  public getConnection(): typeof mongoose | null {
    return this.connection.connection;
  }

  /**
   * Get connection health
   */
  public async getHealth(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    database: string;
    collections: number;
  }> {
    try {
      if (!this.isConnected()) {
        return {
          status: 'disconnected',
          database: 'N/A',
          collections: 0,
        };
      }

      const db = mongoose.connection.db;
      const collections = await db?.listCollections().toArray();

      return {
        status: 'connected',
        database: db?.databaseName || 'unknown',
        collections: collections?.length || 0,
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'N/A',
        collections: 0,
      };
    }
  }

  /**
   * Clear database (for testing)
   */
  public async clearDatabase(): Promise<void> {
    if (config.app.env !== 'test') {
      throw new Error('clearDatabase can only be used in test environment');
    }

    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  }
}

// Export singleton instance
export const mongoConnection = MongoDBConnection.getInstance();

// Export mongoose for direct access if needed
export { mongoose };
