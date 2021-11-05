import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { GraphApi } from './graph-api';
import configuration, { Configuration } from './config/configuration';
import * as path from 'path';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en_US',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: process.env.NODE_ENV !== 'production',
      },
    }),
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService, GraphApi],
})
export class AppModule {
  constructor(private configService: ConfigService<Configuration>) {
    const appUrl = this.configService.get('APP_URL')
    const verifyToken = this.configService.get('VERIFY_TOKEN')
    console.log(
      "Is this the first time running?\n" +
      "Make sure to set the both the Messenger profile, persona " +
      "and webhook by visiting:\n" +
      appUrl +
      "/profile?mode=all&verify_token=" +
      verifyToken
    );
  }
}
