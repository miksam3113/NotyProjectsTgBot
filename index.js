import { Telegraf } from 'telegraf';
import { NotionAPI } from 'notion-client';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();
const { BOT_TOKEN, HOME_PAGE_API, URL_SITE, CHAT_ID } = process.env;
const api = new NotionAPI();
const bot = new Telegraf(BOT_TOKEN);

bot.telegram.setMyCommands([
    {
        command: "/start",
        description: "start bot"
    },
    {
        command: "/getproject",
        description: "get random project"
    },
]);

const statuses = {
    "🔴": ["не тронут", "не тронуто", "нет прогресса", "ничего не сделано"],
    "🟠": ["есть наработки", "есть какой-то дизайн"],
    "🟡": ["в разработке"],
    "🟢": ["готово но prod ли?", "почти готово", "готово, но не тестировано!"],
    "⚫️": ["анреал"]
};

const configMassage = (projectUrl) => (
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open this project',
                        url: `${URL_SITE}${projectUrl}`
                    }
                ]
            ]
        }
    }
);

const regExpBrackets = /\(.+\)./;
const regExpWords = /(?<=\()[^)]+(?=\))/g;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createMassage (title, status, status_emoji) {
    return (
        `${title}${status ? ` - ${status_emoji} ${status}${status[status.length-1] === '!' || status[status.length-1] === '?' ? '' : '.'}` : '.'} ${status_emoji === "🟢" ? 'Ты можешь помочь закончить!' : 'Всегда стоит попробовать!'}`
    );
}

async function getProject () {
    const homePage = await api.getPage(HOME_PAGE_API);
    const homeData = Object.keys(homePage.block)
        .map((key) => homePage.block[key])
        .filter((x) => x.value.type === "page")
        .map((x) => x.value.properties)
        .map((x) => x.title);
    const projectsId = Object.keys(homePage.block)
        .map((key) => homePage.block[key])
        .filter((x) => x.value.type === "page")
        .map((x) => x.value.id);
    const randomProject = getRandomInt(homeData.length);
    const projects = [];

    // Fill array title of projects
    for (let i = 1; i < homeData.length; i++) {
        let str = '';
        if (homeData[i].length === 1) {
            str += homeData[i][0];
        } else {
            for (let y = 0; y < homeData[i].length; y++) {
                str += homeData[i][y][0];
            }
        }
        projects.push(str);
    }
    const project = projects[randomProject];
    let title = project.replace(regExpBrackets, '');
    let status = '';
    let status_emoji = '';
    if (regExpBrackets.test(project)) {
        status = project.match(regExpWords)[0];
    }
    for (const emoji in statuses) {
        for (const key in statuses[emoji]) {
            if (statuses[emoji][key] === status) {
                status_emoji = emoji;
            }
        }
    }
    let projectUrl = projectsId[randomProject + 1];
    projectUrl = projectUrl.split('-').join('');
    title = title[0].toUpperCase() + title.slice(1);
    if (status !== '') {
        status = status[0]?.toUpperCase() + status?.slice(1);
    }
    return [createMassage(title, status, status_emoji), configMassage(projectUrl)];
}

bot.start((ctx) => ctx.replyWithMarkdown('Hello, this bot sends projects that will be useful for ш++. You can call me by sending to the chat ``/getproject``. This bot will send random project every Monday at 10 am.'));

bot.hears(['/getproject', '/getproject@todoprojects_bot'], (ctx) => {
    getProject().then(data => {
        const [textMassage, configMassage] = data;
        ctx.reply(textMassage, configMassage);
    })
});

cron.schedule('20 23 * * *', () => {
    getProject().then(data => {
        const [textMassage, configMassage] = data;
        bot.telegram.sendMessage(CHAT_ID, textMassage, configMassage).then(res => console.log(res)).catch(err => console.log(err))
    })
});

bot.launch();
