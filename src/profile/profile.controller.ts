import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { GraphApi } from 'src/graph-api';
import { Configuration, mode } from '../config/configuration'
import payload from '../config/payload';


@Controller('profile')
export class ProfileController {
    constructor(
        private configService: ConfigService<Configuration>,
        private graphApi: GraphApi,
        private readonly i18n: I18nService
    ) { }
    @Get()
    index(@Query() query: Request['query'], @Res({ passthrough: true }) res: Response) {
        let token = query["verify_token"];
        let queryMode = query["mode"].toString().toLowerCase();

        const webhookUrl = this.configService.get('APP_URL')
        const verifyToken = this.configService.get('VERIFY_TOKEN')
        const appId = this.configService.get('APP_ID')
        const pageId = this.configService.get('PAGE_ID')
        const whitelistedDomains = this.configService.get('whitelistedDomains')

        if (!webhookUrl.startsWith("https://")) {
            res.status(200).send("ERROR - Need a proper API_URL in the .env file");
        }

        // Checks if a token and mode is in the query string of the request
        if (queryMode && token) {
            if (token === verifyToken) {
                if (queryMode === mode.WEBHOOK || queryMode === mode.ALL) {
                    this.setWebhook();
                    res.write(
                        `<p>Set app ${appId} call to ${webhookUrl}</p>`
                    );
                }
                if (queryMode === mode.PROFILE || queryMode === mode.ALL) {
                    this.setThread();
                    res.write(`<p>Set Messenger Profile of Page ${pageId}</p>`);
                }
                if (queryMode === mode.NLP || queryMode === mode.ALL) {
                    this.graphApi.callNLPConfigsAPI();
                    res.write(`<p>Enable Built-in NLP for Page ${pageId}</p>`);
                }
                if (queryMode === mode.DOMAINS || queryMode === mode.ALL) {
                    this.setWhitelistedDomains();
                    res.write(`<p>Whitelisting domains: ${whitelistedDomains}</p>`);
                }
                if (queryMode === mode.PRIVATE_REPLY) {
                    this.setPageFeedWebhook();
                    res.write(`<p>Set Page Feed Webhook for Private Replies.</p>`);
                }
                res.status(200).end();
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        } else {
            // Returns a '404 Not Found' if mode or token are missing
            res.sendStatus(404);
        }
    }

    private setWebhook() {
        this.graphApi.callSubscriptionsAPI()
        this.graphApi.callSubscribedApps()
    }

    private setPageFeedWebhook() {
        this.graphApi.callSubscriptionsAPI("feed");
        this.graphApi.callSubscribedApps("feed");
    }

    private async setThread() {
        const greetings = await this.getGreeting()
        const persistentMenu = await this.getPersistentMenu()
        let profilePayload = {
            ...this.getGetStarted(),
            ...greetings,
            ...persistentMenu
        };

        this.graphApi.callMessengerProfileAPI(profilePayload);
    }

    private setGetStarted() {
        let getStartedPayload = this.getGetStarted();
        this.graphApi.callMessengerProfileAPI(getStartedPayload);
    }

    private setGreeting() {
        let greetingPayload = this.getGreeting();
        this.graphApi.callMessengerProfileAPI(greetingPayload);
    }

    private setPersistentMenu() {
        let menuPayload = this.getPersistentMenu();
    }

    private getGetStarted() {
        return {
            get_started: {
                payload: payload.GET_STARTED
            }
        };
    }

    private async getGreeting() {
        let greetings = [];
        const locales = await this.i18n.getSupportedLanguages()

        for (let locale of locales) {
            greetings.push(await this.getGreetingText(locale));
        }

        return {
            greeting: greetings
        };
    }

    private async getPersistentMenu() {
        let menuItems = [];
        const locales = await this.i18n.getSupportedLanguages()
        for (let locale of locales) {
            menuItems.push(await this.getMenuItems(locale));
        }

        return {
            persistent_menu: menuItems
        };
    }

    private async getMenuItems(locale: string) {
        const siteUrl = this.configService.get('SITE_URL')
        const defaultLocale = this.configService.get('defaultLocale')
        let param = locale === defaultLocale ? "default" : locale;

        const i18n = this.i18n
        const lang = locale

        let localizedMenu = {
            locale: param,
            composer_input_disabled: false,
            call_to_actions: [
                {
                    title: await i18n.t("global.start_over", { lang }),
                    type: "postback",
                    payload: payload.GET_STARTED
                },
                {
                    type: "web_url",
                    title: await i18n.t("global.visit_site", { lang }),
                    url: siteUrl,
                    webview_height_ratio: "full"
                },
                {
                    title: 'To be continue...',
                    type: "postback",
                    payload: payload.GET_STARTED
                },
            ]
        };

        return localizedMenu;
    }

    private async getGreetingText(locale: string) {
        const defaultLocale = this.configService.get('defaultLocale')

        let param = locale === defaultLocale ? "default" : locale;
        const text = await this.i18n.t("global.greeting", {
            lang: locale,
            args: {
                user_first_name: "{{user_first_name}}"
            }
        })
        let localizedGreeting = {
            locale: param,
            text
        };

        return localizedGreeting;
    }

    private setWhitelistedDomains() {
        let domainPayload = this.getWhitelistedDomains();
        this.graphApi.callMessengerProfileAPI(domainPayload);
    }

    private getWhitelistedDomains() {
        const whitelisted_domains = this.configService.get('whitelistedDomains')

        let whitelistedDomains = {
            whitelisted_domains
        };

        return whitelistedDomains;
    }

}
