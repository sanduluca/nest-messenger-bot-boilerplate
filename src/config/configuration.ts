
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

export interface Configuration extends EnvironmentVariables { }

const config = () => ({
    ...process.env,
});
export default config

