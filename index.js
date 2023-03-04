import { Telegraf } from 'telegraf';
const BOT_TOKEN = "6290000446:AAGRZEgD9Y2nXObUOcnTtQ6v5K1se7RarWc";
import { NotionAPI } from 'notion-client'
const projects = [];
const bot = new Telegraf(BOT_TOKEN);
const api = new NotionAPI();

//const cron = require('node-cron');

//require('dotenv').config()

//const { BOT_TOKEN, CHAT_ID } = process.env.BOT_TOKEN;


bot.start((ctx) => ctx.reply('Zahar lox!'));
bot.hears('/getprojects', async (ctx) => {
    const page = await api.getPage('projects-todo-68d4b5c3bccd4d25a26fb791423c071c');
    const data = Object.keys(page.block)
        .map((key) => page.block[key])
        .filter((x) => x.value.type === "page")
        .map((x) => x.value.properties)
        .map((x) => x.title)
    const regExp = /\(.+\)./;
    const regExp2 = /(?<=\()[^)]+(?=\))/g;

    for (let i = 1; i < data.length; i++) {
        const title = data[i][0][0].replace(regExp, '');
        let status = '';
        console.log(data[i][0][0].replace(regExp, ''));
        if (regExp.test(data[i][0][0])) {
            console.log(data[i][0][0].match(regExp2));
            status = data[i][0][0].match(regExp2)[0];
        }
        ctx.reply(`${title} - ${status}`);
    }
});
bot.launch();

/*bot.hears('/getnotactive', (ctx) => {
    ctx.reply(messageByNotActiveUser(users));
})

bot.hears('/getallactive', (ctx) => {
    ctx.reply(messageAllActiveUser(users));
})

bot.on('message',  (ctx) => {
    usersMessage.push(ctx.message.from.username);
})*/

/*const usersMessage = [];

function messageCounterByUser(users) {
    let resultActive = {};
    let message = '';

    users.forEach((a) => {
        if (resultActive[a] !== undefined) {
            ++resultActive[a];
        }
        else {
            resultActive[a] = 1;
        }
    });

    resultActive = Object.entries(resultActive)
        .sort(([,a],[,b]) => b-a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    for (const key in resultActive) {
        message += `${key} - ${resultActive[key]} сообщения(е)\n`;
    }
    return message;
}

function messageByNotActiveUser(usersAll) {
    const usersNotActive = usersAll.filter(el => !usersMessage.includes(el));
    let resultNotActive = {};
    let message = '';

    usersNotActive.forEach((a) => {
        ++resultNotActive[a];
    });

    for (const key in resultNotActive) {
        message += `${key}, `;
    }
    return message + 'были не активными, ребята, давайте активничайте';
}

function messageAllActiveUser(usersAll) {
    const usersNotActive = usersAll.filter(el => !usersMessage.includes(el));
    let resultNotActiveAll = {};
    let resultActiveAll = {};
    let message = '';

    usersNotActive.forEach((a) => {
        resultNotActiveAll[a] = 0;
    });

    users.forEach((a) => {
        if (resultActiveAll[a] !== undefined) {
            ++resultActiveAll[a];
        } else {
            resultActiveAll[a] = 1;
        }
    });

    let result = { ...resultActiveAll, ...resultNotActiveAll };

    result = Object.entries(result)
        .sort(([,a],[,b]) => b-a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    for (const key in result) {
        message += `${key} - ${result[key]} сообщения(е)\n`;
    }
    return message;
}

bot.hears('/getstat', (ctx) => {
    ctx.reply(messageCounterByUser(usersMessage));
})

bot.hears('/getnotactive', (ctx) => {
    ctx.reply(messageByNotActiveUser(users));
})

bot.hears('/getallactive', (ctx) => {
    ctx.reply(messageAllActiveUser(users));
})

bot.on('message',  (ctx) => {
    usersMessage.push(ctx.message.from.username);
})

cron.schedule('* 9 * * 1', () => {
    bot.telegram.sendMessage(CHAT_ID, messageCounterByUser(usersMessage))
});
*
bot.launch();*/