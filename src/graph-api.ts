import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './config/configuration';
import camelCase from "camelcase"
const request = require('request')

@Injectable()
export class GraphApi {
    constructor(private configService: ConfigService<Configuration>) { }

    callSendAPI(requestBody: any) {
        const mPlatfom = this.configService.get('mPlatfom')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')

        // Send the HTTP request to the Messenger Platform
        request(
            {
                uri: `${mPlatfom}/me/messages`,
                qs: {
                    access_token: pageAccesToken
                },
                method: "POST",
                json: requestBody
            },
            error => {
                if (error) {
                    console.error("Unable to send message:", error);
                }
            }
        );
    }

    callMessengerProfileAPI(requestBody: any) {
        const appId = this.configService.get('APP_ID')
        const mPlatfom = this.configService.get('mPlatfom')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        // Send the HTTP request to the Messenger Profile API
        console.log(`Setting Messenger Profile for app ${appId}`);
        console.log(requestBody)
        request(
            {
                uri: `${mPlatfom}/me/messenger_profile`,
                qs: {
                    access_token: pageAccesToken
                },
                method: "POST",
                json: requestBody
            },
            (error: any, _res: any, body: any) => {
                if (!error) {
                    console.log("Request sent:", body);
                } else {
                    console.error("Unable to send message:", error);
                }
            }
        );
    }

    callSubscriptionsAPI(customFields?: any) {
        const mPlatfom = this.configService.get('mPlatfom')
        const appId = this.configService.get('APP_ID')
        const pageWebhookFields = this.configService.get('pageWebhookFields')
        const webhookUrl = this.configService.get('webhookUrl')
        const verifyToken = this.configService.get('VERIFY_TOKEN')
        const appSecret = this.configService.get('APP_SECRET')
        // Send the HTTP request to the Subscriptions Edge to configure your webhook
        // You can use the Graph API's /{app-id}/subscriptions edge to configure and
        // manage your app's Webhooks product
        // https://developers.facebook.com/docs/graph-api/webhooks/subscriptions-edge
        console.log(
            `Setting app ${appId} callback url to ${webhookUrl}`
        );

        let fields = pageWebhookFields;

        if (customFields !== undefined) {
            fields = fields + ", " + customFields;
        }

        console.log(fields);

        request(
            {
                uri: `${mPlatfom}/${appId}/subscriptions`,
                qs: {
                    access_token: appId + "|" + appSecret,
                    object: "page",
                    callback_url: webhookUrl,
                    verify_token: verifyToken,
                    fields: fields,
                    include_values: "true"
                },
                method: "POST"
            },
            (error: any, _res: any, body: any) => {
                if (!error) {
                    console.log("Request sent:", body);
                } else {
                    console.error("Unable to send message:", error);
                }
            }
        );
    }

    callSubscribedApps(customFields?: any) {
        const mPlatfom = this.configService.get('mPlatfom')
        const appId = this.configService.get('APP_ID')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        const pageId = this.configService.get('PAGE_ID')
        const pageWebhookFields = this.configService.get('pageWebhookFields')

        // Send the HTTP request to subscribe an app for Webhooks for Pages
        // You can use the Graph API's /{page-id}/subscribed_apps edge to configure
        // and manage your pages subscriptions
        // https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps
        console.log(`Subscribing app ${appId} to page ${pageId}`);

        let fields = pageWebhookFields;

        if (customFields !== undefined) {
            fields = fields + ", " + customFields;
        }

        console.log(fields);
        request(
            {
                uri: `${mPlatfom}/${pageId}/subscribed_apps`,
                qs: {
                    access_token: pageAccesToken,
                    subscribed_fields: fields
                },
                method: "POST"
            },
            (error: any) => {
                if (error) {
                    console.error("Unable to send message:", error);
                }
            }
        );
    }

    async getUserProfile(senderPsid: any) {
        try {
            const userProfile: any = await this.callUserProfileAPI(senderPsid);

            for (const key in userProfile) {
                const camelizedKey = camelCase(key);
                const value = userProfile[key];
                delete userProfile[key];
                userProfile[camelizedKey] = value;
            }

            return userProfile;
        } catch (err) {
            console.log("Fetch failed:", err);
        }
    }

    callUserProfileAPI(senderPsid: any) {
        const mPlatfom = this.configService.get('mPlatfom')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        const userProfileFields = this.configService.get('userProfileFields')
        return new Promise(function (resolve, reject) {
            let body: any[] = [];

            // Send the HTTP request to the Graph API
            request({
                uri: `${mPlatfom}/${senderPsid}`,
                qs: {
                    access_token: pageAccesToken,
                    fields: userProfileFields
                },
                method: "GET"
            })
                .on("response", function (response: any) {
                    // console.log(response.statusCode);

                    if (response.statusCode !== 200) {
                        reject(Error(response.statusCode));
                    }
                })
                .on("data", function (chunk) {
                    body.push(chunk);
                })
                .on("error", function (error: any) {
                    console.error("Unable to fetch profile:" + error);
                    reject(Error("Network Error"));
                })
                .on("end", () => {
                    const res = Buffer.concat(body).toString();
                    // console.log(JSON.parse(body));

                    resolve(JSON.parse(res));
                });
        });
    }

    getPersonaAPI() {
        const mPlatfom = this.configService.get('mPlatfom')
        const appId = this.configService.get('APP_ID')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        return new Promise(function (resolve, reject) {
            let body: any[] = [];

            // Send the POST request to the Personas API
            console.log(`Fetching personas for app ${appId}`);

            request({
                uri: `${mPlatfom}/me/personas`,
                qs: {
                    access_token: pageAccesToken
                },
                method: "GET"
            })
                .on("response", function (response: any) {
                    // console.log(response.statusCode);

                    if (response.statusCode !== 200) {
                        reject(Error(response.statusCode));
                    }
                })
                .on("data", function (chunk: any) {
                    body.push(chunk);
                })
                .on("error", function (error: any) {
                    console.error("Unable to fetch personas:" + error);
                    reject(Error("Network Error"));
                })
                .on("end", () => {
                    const res = Buffer.concat(body).toString();
                    // console.log(JSON.parse(body));

                    resolve(JSON.parse(res).data);
                });
        });
    }

    postPersonaAPI(name: any, profile_picture_url: any) {
        const mPlatfom = this.configService.get('mPlatfom')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        const appId = this.configService.get('APP_ID')

        let body: any[] = [];

        return new Promise(function (resolve, reject) {
            // Send the POST request to the Personas API
            console.log(`Creating a Persona for app ${appId}`);

            let requestBody = {
                name: name,
                profile_picture_url: profile_picture_url
            };

            request({
                uri: `${mPlatfom}/me/personas`,
                qs: {
                    access_token: pageAccesToken
                },
                method: "POST",
                json: requestBody
            })
                .on("response", function (response: any) {
                    // console.log(response.statusCode);
                    if (response.statusCode !== 200) {
                        reject(Error(response.statusCode));
                    }
                })
                .on("data", function (chunk: any) {
                    body.push(chunk);
                })
                .on("error", function (error: any) {
                    console.error("Unable to create a persona:", error);
                    reject(Error("Network Error"));
                })
                .on("end", () => {
                    const res = Buffer.concat(body).toString();
                    // console.log(JSON.parse(body));

                    resolve(JSON.parse(res).id);
                });
        }).catch(error => {
            console.error("Unable to create a persona:", error, body);
        });
    }

    callNLPConfigsAPI() {
        const mPlatfom = this.configService.get('mPlatfom')
        const pageAccesToken = this.configService.get('PAGE_ACCESS_TOKEN')
        const pageId = this.configService.get('PAGE_ID')

        // Send the HTTP request to the Built-in NLP Configs API
        // https://developers.facebook.com/docs/graph-api/reference/page/nlp_configs/

        console.log(`Enable Built-in NLP for Page ${pageId}`);
        request(
            {
                uri: `${mPlatfom}/me/nlp_configs`,
                qs: {
                    access_token: pageAccesToken,
                    nlp_enabled: true
                },
                method: "POST"
            },
            (error: any, _res: any, body: any) => {
                if (!error) {
                    console.log("Request sent:", body);
                } else {
                    console.error("Unable to activate built-in NLP:", error);
                }
            }
        );
    }

    callFBAEventsAPI(senderPsid: string, eventName: string) {
        const mPlatfom = this.configService.get('mPlatfom')
        const pageId = this.configService.get('PAGE_ID')
        const appId = this.configService.get('APP_ID')
        // Construct the message body
        let requestBody = {
            event: "CUSTOM_APP_EVENTS",
            custom_events: JSON.stringify([
                {
                    _eventName: "postback_payload",
                    _value: eventName,
                    _origin: "original_coast_clothing"
                }
            ]),
            advertiser_tracking_enabled: 1,
            application_tracking_enabled: 1,
            extinfo: JSON.stringify(["mb1"]),
            page_id: pageId,
            page_scoped_user_id: senderPsid
        };

        // Send the HTTP request to the Activities API
        request(
            {
                uri: `${mPlatfom}/${appId}/activities`,
                method: "POST",
                form: requestBody
            },
            (error: any) => {
                if (!error) {
                    console.log(`FBA event '${eventName}'`);
                } else {
                    console.error(`Unable to send FBA event '${eventName}':` + error);
                }
            }
        );
    }
}
