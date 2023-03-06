import { Telegraf } from 'telegraf';
const BOT_TOKEN = "6290000446:AAGRZEgD9Y2nXObUOcnTtQ6v5K1se7RarWc";
import { NotionAPI } from 'notion-client';
const bot = new Telegraf(BOT_TOKEN);
const api = new NotionAPI();

const statuses = {
    "🔴": ["не тронут", "не тронуто", "нет прогресса", "ничего не сделано"],
    "🟠": ["есть наработки", "есть какой-то дизайн"],
    "🟡": ["в разработке"],
    "🟢": ["готово но prod ли?", "почти готово", "готово, но не тестировано!"],
    "⚫️": ["анреал"]
}

//const cron = require('node-cron');

//require('dotenv').config()

//const { BOT_TOKEN, CHAT_ID } = process.env.BOT_TOKEN;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

bot.start((ctx) => ctx.reply('Zahar lox!'));
bot.hears('/getproject', async (ctx) => {
    const homePage = await api.getPage('projects-todo-68d4b5c3bccd4d25a26fb791423c071c');
    const homeData = Object.keys(homePage.block)
        .map((key) => homePage.block[key])
        .filter((x) => x.value.type === "page")
        .map((x) => x.value.properties)
        .map((x) => x.title)
    const projectsId = Object.keys(homePage.block)
        .map((key) => homePage.block[key])
        .filter((x) => x.value.type === "page")
        .map((x) => x.value.id)
    const regExpBrackets = /\(.+\)./;
    const regExpWords = /(?<=\()[^)]+(?=\))/g;
    const regExpUrl = /[A-Za-z]/g;
    const randomProject = getRandomInt(homeData.length);
    const projects = [];
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
    let projectUrl = projectsId[randomProject+1];
    projectUrl = projectUrl.split('-').join('');
    console.log(projectUrl);
    const chatId = "-1001792494229";
    title = title[0].toUpperCase() + title.slice(1);
    if (status !== '') {
        status = status[0]?.toUpperCase() + status?.slice(1);
    }
    console.log(status)
    ctx.reply(`${title}${status ? " - " + status_emoji + " " + status + (status[status.length-1] === '!' || status[status.length-1] === '?' ? '' : '.') : '.'} ${status_emoji === "🟢" ? 'Ты можешь помочь закончить!' : 'Всегда стоит попробовать!'}`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open this project',
                        url: `https://shpp.notion.site/${projectUrl}`
                    }
                ]
            ]
        }
    })
});
bot.launch();
