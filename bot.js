const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const api = require('coinpaprika-js');
const bot = new Telegraf(process.env.BOT_TOKEN);

let welcome = `Glad to see you!!!😊 I'm a bot that knows a lot of interesting things about cryptocurrencies.💸I can show you current rates, exchanges and general market information.🏦I'm still learning so later I will be able to do more things ✌🏻`;
let coinsPageTitle = '⬇️ If there is no button with the coin you are looking for, write me and I will try to find it for you. ⬇️';
let btnCoins = 'Сoins 📊';
let btnSearche = 'Search 🔍';
let btnExchanges = 'Exchanges 💰';
let btnGlobalData = 'Global data 🌏';
let back = `⬅️ Back`
let select_a_language = `Select a language`


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
    console.log('searchCoin');
    try {
        let price_usd = '*Price USD*'
        let rank = '*Rank*'
        let volume_24h_usd = '*Volume 24h usd*'

        let ticerCoin = await api.search(`${ticer}`);
        let coin = await api.ticker(`${ticerCoin.currencies[0].id}`, { quotes: "USD,BTC,ETH" });

        const formatData = `
*${coin.name}*  *${coin.symbol}*

${price_usd}: ${formatCurrency(coin.price_usd)}
${rank}:      ${coin.rank}
${volume_24h_usd}:   ${formatCurrency(coin.volume_24h_usd)}
${volume_24h_usd}:   ${formatCurrency(coin.market_cap_usd)}
${volume_24h_usd}:   ${formatCurrency(coin.circulating_supply)}`
        await ctx.reply(formatData, { parse_mode: 'markdown' });

    } catch {
        await ctx.reply('Сталась помилка', displayKeyboardCoins(ctx));
    }
}


bot.start((ctx) => ctx.reply(`Welcome ${ctx.message.from.first_name}`, displayKeyboardLanguage(ctx)));

bot.help((ctx) => ctx.reply('Send me a sticker'));


bot.on('callback_query', async (ctx) => {
    console.log(ctx.update.callback_query.data);
    if (ctx.update.callback_query.data === 'menu') {
        console.log("/menu");
    }

    if (ctx.update.callback_query.data) {
        searchCoin(ctx, ctx.update.callback_query.data)
    }
    else if (
        ctx.message.text !== `` &&
        ctx.message.text !== `${btnCoins}` &&
        ctx.message.text !== 'Polski język 🇵🇱' &&
        ctx.message.text !== 'Українська мова 🇺🇦' &&
        ctx.message.text !== 'English 🇬🇧' &&
        ctx.message.text !== 'Español 🇪🇸' &&
        ctx.message.text !== `BTC ₿` &&
        ctx.message.text !== `${back}` &&
        ctx.message.text !== `${btnGlobalData}` &&
        ctx.message.text !== `${btnExchanges}`) {
    }
})

bot.on('text', async (ctx) => {
    console.log(ctx.message.text, 'sad');
    if (ctx.message.text === '/menu') {
        ctx.reply(`menu`, displayKeyboardHome(ctx))
    }
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
        console.log(`${btnExchanges}`);
    }
    if (ctx.message.text === `BTC ₿`) {
        searchCoin(ctx, 'btc')
    }
    if (ctx.message.text === `${btnGlobalData}`) {
        globalInfo(ctx)
    }
    if (ctx.message.text === `${btnSearche}`) {
        coinsButton(ctx);
    }
    else if (
        ctx.message.text !== '/menu' &&
        ctx.message.text !== `` &&
        ctx.message.text !== `${btnCoins}` &&
        ctx.message.text !== 'Polski język 🇵🇱' &&
        ctx.message.text !== 'Українська мова 🇺🇦' &&
        ctx.message.text !== 'English 🇬🇧' &&
        ctx.message.text !== 'Español 🇪🇸' &&
        ctx.message.text !== `BTC ₿` &&
        ctx.message.text !== `${back}` &&
        ctx.message.text !== `${btnGlobalData}` &&
        ctx.message.text !== `${btnExchanges}`) {
        searchCoin(ctx, ctx.message.text)

    }

});

bot.launch();