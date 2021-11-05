import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { GraphApi } from 'src/graph-api';
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [WebhookController],
  providers: [AppService, GraphApi],

})
export class WebhookModule {}
