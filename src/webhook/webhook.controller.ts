import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppService } from 'src/app.service';
import { GraphApi } from 'src/graph-api';
import { Configuration, mode } from '../config/configuration'


@Controller('webhook')
export class WebhookController {
    constructor(
        private configService: ConfigService<Configuration>,
        private graphApi: GraphApi,
        private readonly i18n: I18nService,
        private readonly appService: AppService
    ) { }

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

    @Post()
    post(@Body() body: Request['body'], @Res({ passthrough: true }) response: Response) {

        // Checks if this is an event from a page subscription
        if (body.object === "page") {
            // Returns a '200 OK' response to all requests
            response.status(200).send("EVENT_RECEIVED");


            // Iterates over each entry - there may be multiple if batched
            body.entry.forEach(async (entry: any) => {


                // Gets the body of the webhook event
                let webhookEvent = entry.messaging[0];

                // Discard uninteresting events
                if ("read" in webhookEvent) {
                    // console.log("Got a read event");
                    return;
                }

                if ("delivery" in webhookEvent) {
                    // console.log("Got a delivery event");
                    return;
                }

                // Get the sender PSID
                let senderPsid = webhookEvent.sender.id;

                this.sendSeen(senderPsid)
                setTimeout(() => {
                    this.sendTyping(senderPsid);
                }, 2000)

                const text = await this.appService.getHello()
                const response = {
                    text
                }
                this.sendMessage(senderPsid, response, 4000)
            });


            return
        }
        response.sendStatus(404);
    }

    private sendTyping(recipientId: string) {
        this.graphApi.callSendAPI({
            recipient: {
                id: recipientId
            },
            sender_action: "typing_on"
        })
    }

    private sendSeen(recipientId: string) {
        this.graphApi.callSendAPI({
            recipient: {
                id: recipientId
            },
            sender_action: "mark_seen"
        })
    }

    private sendMessage(recipientId: string, response: any, delay: number = 0) {
        // Check if there is delay in the response
        if ("delay" in response) {
            delay = response["delay"];
            delete response["delay"];
        }

        // Construct the message body
        let requestBody: any = {
            recipient: {
                id: recipientId
            },
            message: response
        };

        // Check if there is persona id in the response
        if ("persona_id" in response) {
            let persona_id = response["persona_id"]
            delete response["persona_id"];

            requestBody = {
                recipient: {
                    id: recipientId
                },
                message: response,
                persona_id: persona_id
            };
        }

        setTimeout(() => {
            this.graphApi.callSendAPI(requestBody)
        }, delay);
    }
}
