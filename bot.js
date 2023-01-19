const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const api = require('coinpaprika-js');
const bot = new Telegraf(process.env.BOT_TOKEN);

let welcome = ``;
let coinsPageTitle = '';
let btnCoins = '';
let btnSearche = '';
let btnExchanges = '';
let btnGlobalData = '';
let back = ``
let select_a_language = ``

const parceLanguage = function (lang) {

    const obj = require(`./language/${lang}.json`)
    select_a_language = obj.message.select_a_language;
    welcome = obj.message.welcome;
    coinsPageTitle = obj.message.coins_title;
    btnCoins = obj.button.coins;
    btnSearche = obj.button.search;
    btnExchanges = obj.button.exchanges;
    btnGlobalData = obj.button.global_data
    back = obj.button.back;


}

// keyboards
const displayKeyboardHome = (ctx) => {
    const keyboardHome = Markup.keyboard([
        [Markup.button.callback(`${btnCoins}`, "coins"), Markup.button.callback("BTC ₿", "btc")]
        , [Markup.button.callback(`${btnExchanges}`, 'markets'), Markup.button.callback(`${btnSearche}`, "search")],
        [Markup.button.callback(`${btnGlobalData}`)],
        [Markup.button.callback(`${back}`)]

    ]).resize();
    return keyboardHome;
}

const displayKeyboardLanguage = (ctx) => {
    const keyboardLanguage = Markup.keyboard([
        [Markup.button.callback("Polski język 🇵🇱", "poland"), Markup.button.callback("Українська мова 🇺🇦", "ukraine")]
        , [Markup.button.callback('English 🇬🇧', 'english'), Markup.button.callback("Español 🇪🇸", "spain")]
    ]).resize();
    return keyboardLanguage;
}

const displayKeyboardCoins = (ctx) => {
    const keyboardCoins = Markup.inlineKeyboard([
        [Markup.button.callback("BTC", "btc"), Markup.button.callback("ETH", "eth"),
        Markup.button.callback("DOT", "dot"), Markup.button.callback("BNB", "bnb"),
        Markup.button.callback("MATIC", "matic"), Markup.button.callback("AVAX", "avax")],

        [Markup.button.callback("Atom", "atom"), Markup.button.callback("SOL", "sol"),
        Markup.button.callback("ETC", "etc"), Markup.button.callback("FLOW", "flow"),
        Markup.button.callback("1INCH", "1inch"), Markup.button.callback("Tron", "tron")],

        [Markup.button.callback("BTC", "btc"), Markup.button.callback("ETH", "eth"),
        Markup.button.callback("DOT", "dot"), Markup.button.callback("BNB", "bnb"),
        Markup.button.callback("MATIC", "matic"), Markup.button.callback("AVAX", "avax")]
    ]).resize();
    return keyboardCoins;
}

const coinsButton = async (ctx) => {
    try {
        await ctx.reply(`${coinsPageTitle}`, displayKeyboardCoins())

    } catch {
        await ctx.reply('Сталась помилка')
    }
}

const formatCurrency = function (value) {
    return new Intl.NumberFormat().format(value).split(',')[0];

}

const infoBTC = async (ctx) => {
    let btc = await api.coin("btc-bitcoin")
    const formatInfoBTC = `
    ${btc.name}
    ${btc.rank}
    ${btc.links.reddit}`
    await ctx.reply(formatInfoBTC)
}

const globalInfo = async (ctx) => {
    try {
        const globalData = await api.global()

        const formatGlobalData = `
Капіталізація ${formatCurrency(globalData.market_cap_usd)} USD
Домінація BTC:  ${globalData.bitcoin_dominance_percentage} %
        `
        await ctx.reply(formatGlobalData);
    } catch {
        await ctx.reply('Сталась помилка')
    }

}
const searchCoin = async (ctx, ticer) => {

    try {
        let ticerCoin = await api.search(`${ticer}`);
        let coin = await api.ticker(`${ticerCoin.currencies[0].id}`, { quotes: "USD,BTC,ETH" });
        console.log(typeof coin.price_usd);
        const formatData = `
        ${coin.name} ${coin.symbol}
Price: ${formatCurrency(coin.price_usd)} $        
Rank:  ${coin.rank}`

        await ctx.reply(formatData);

    } catch {
        await ctx.reply('Незнайдено жодної монети', displayKeyboardCoins())
    }
}

bot.start((ctx) => ctx.reply(`Welcome ${ctx.message.from.first_name}`, displayKeyboardLanguage(ctx)));

bot.help((ctx) => ctx.reply('Send me a sticker'));


bot.on('callback_query', async (ctx) => {
    if (ctx.update.callback_query.data) {
        searchCoin(ctx, ctx.update.callback_query.data)
    }
    else if (
        ctx.message.text !== `${btnCoins}` &&
        ctx.message.text !== 'Polski język 🇵🇱' &&
        ctx.message.text !== 'Українська мова 🇺🇦' &&
        ctx.message.text !== 'English 🇬🇧' &&
        ctx.message.text !== 'Español 🇪🇸' &&
        ctx.message.text !== `BTC ₿` &&
        ctx.message.text !== `${back}` &&
        ctx.message.text !== `${btnGlobalData}`) {
        console.log("dasd");

    }
})

bot.on('text', async (ctx) => {

    if (ctx.message.text === 'Polski język 🇵🇱') {
        parceLanguage('pl');
        ctx.reply(`${welcome}`, displayKeyboardHome(ctx))
    }
    if (ctx.message.text === 'Українська мова 🇺🇦') {
        parceLanguage('ua');
        ctx.reply(`${welcome}`, displayKeyboardHome(ctx))
    }
    if (ctx.message.text === 'English 🇬🇧') {
        parceLanguage('en');
        ctx.reply(`${welcome}`, displayKeyboardHome(ctx))
    }
    if (ctx.message.text === 'Español 🇪🇸') {
        parceLanguage('es');
        ctx.reply(`${welcome}`, displayKeyboardHome(ctx))
    }
    if (ctx.message.text === `${back}`) {
        ctx.reply(`${select_a_language}`, displayKeyboardLanguage(ctx))
    }
    if (ctx.message.text === `${btnCoins}`) {
        coinsButton(ctx);
    }
    if (ctx.message.text === `${btnExchanges}`) {

    }
    if (ctx.message.text === `BTC ₿`) {
        infoBTC(ctx)
    }
    if (ctx.message.text === `${btnGlobalData}`) {
        globalInfo(ctx)
    }
    if (ctx.message.text === `${btnSearche}`) {
        displayKeyboardCoins();
    }
    else if (
        ctx.message.text !== `${btnCoins}` &&
        ctx.message.text !== 'Polski język 🇵🇱' &&
        ctx.message.text !== 'Українська мова 🇺🇦' &&
        ctx.message.text !== 'English 🇬🇧' &&
        ctx.message.text !== 'Español 🇪🇸' &&
        ctx.message.text !== `BTC ₿` &&
        ctx.message.text !== `${back}` &&
        ctx.message.text !== `${btnGlobalData}`) {
        searchCoin(ctx, ctx.message.text)

    }

});

bot.launch();