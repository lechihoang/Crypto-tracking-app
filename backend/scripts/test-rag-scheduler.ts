import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RagSchedulerService } from '../src/rag/rag-scheduler.service';

async function testScheduler() {
  console.log('🚀 Testing RAG Scheduler...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const scheduler = app.get(RagSchedulerService);

  try {
    console.log('📊 Triggering manual refresh via scheduler...\n');
    const result = await scheduler.triggerManualRefresh();
    
    console.log('\n✅ Scheduler test completed!');
    console.log('Result:', result);
  } catch (error) {
    console.error('\n❌ Scheduler test failed:', error);
  } finally {
    await app.close();
  }
}

testScheduler();
