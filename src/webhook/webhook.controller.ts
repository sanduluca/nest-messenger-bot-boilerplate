import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Configuration, mode } from '../config/configuration'


@Controller('webhook')
export class WebhookController {
    constructor(private configService: ConfigService<Configuration>) { }
    @Get()
    index(@Query() query: Request['query'], @Res({ passthrough: true }) response: Response) {

        // Parse the query params
        let hubMode = query["hub.mode"];
        let token = query["hub.verify_token"];
        let challenge = query["hub.challenge"];

        const verifyToken = this.configService.get('VERIFY_TOKEN')

        // Checks if a token and mode is in the query string of the request
        if (hubMode && token) {
            // Checks the mode and token sent is correct
            if (hubMode === mode.SUBSCRIBE && token === verifyToken) {
                // Responds with the challenge token from the request
                return challenge;
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                response.sendStatus(403);
            }
        }
    }
}
