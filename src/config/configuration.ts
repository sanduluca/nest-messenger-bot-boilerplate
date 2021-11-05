
export interface EnvironmentVariables {
    PAGE_ID: string;
    APP_ID: string;
    PAGE_ACCESS_TOKEN: string;
    APP_SECRET: string;
    VERIFY_TOKEN: string;
    APP_URL: string;
    SITE_URL: string;
    MONGODB: string;
}


export const mode = {
    ALL: "all",
    SUBSCRIBE: "subscribe",
    WEBHOOK: "webhook",
    PROFILE: "profile",
    PERSONAS: "personas",
    NLP: "nlp",
    DOMAINS: "domains",
    PRIVATE_REPLY: "private-reply",
}

export interface Configuration extends EnvironmentVariables {
    whitelistedDomains: string[];

    mPlatformDomain: string;
    mPlatformVersion: string;
    mPlatfom: string;

    appUrl: string;
    webhookUrl: string;

    pageWebhookFields: string;
    userProfileFields: string;

    defaultLocale: string;
}

const config = () => ({
    ...process.env,
    whitelistedDomains: [
        process.env.SITE_URL,
        process.env.APP_URL
    ],

    // Messenger Platform API
    mPlatformDomain: "https://graph.facebook.com",
    mPlatformVersion: "v3.2",
    get mPlatfom() {
        return this.mPlatformDomain + "/" + this.mPlatformVersion;
    },
    appUrl: process.env.APP_URL,
    // URL of your webhook endpoint
    get webhookUrl() {
        return this.appUrl + "/webhook";
    },

    // Page Webhooks fields that you want to subscribe
    pageWebhookFields: "messages, messaging_postbacks, messaging_optins, \
     message_deliveries, messaging_referrals",

    userProfileFields: "first_name, last_name, gender, locale, timezone",

    defaultLocale: "en_US",


});
export default config

const configObj = config()
export {
    configObj as config
}
