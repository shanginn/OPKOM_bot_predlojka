/* eslint-disable @typescript-eslint/no-floating-promises */

import { Telegraf, Markup } from "telegraf";
import Workflow from "./workflow";
import workflow from "./workflow";
import {match} from "ts-pattern";
import {VoteType} from "./VoteType";

const groupId = process.env.PREDLOJKA_CHAT_ID;
if (!groupId) {
    throw new Error("PREDLOJKA_CHAT_ID is not set");
}

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN must be provided!')
}

// votes is object with botesttypes keys
function getKeyboard(votes: any) {
    return Markup.inlineKeyboard([
        Markup.button.callback(`👍 ${votes.UP || ''}`, '👍'),
        Markup.button.callback(`👎 ${votes.DOWN || ''}`, '👎')
    ])
}


const bot = new Telegraf(token)

bot.action(['👍', '👎'], async (ctx) => {
    const query = ctx.update.callback_query;
    const message = query.message;

    if (!message) {
        return;
    }

    const messageId = message.message_id;
    const vote = query.data;
    const voterId = query.from.id;

    const voteType = match(vote)
        .with('👍', () => VoteType.UP)
        .with('👎', () => VoteType.DOWN)
        .otherwise(() => undefined);

    if (!voteType) {
        return;
    }

    try {
        await workflow.vote(messageId, voterId, voteType);

        const votesCount = await workflow.getVotesCount(messageId);

        await ctx.editMessageReplyMarkup(
            getKeyboard(votesCount).reply_markup
        );
    } catch (e) {
        console.error(e);
    }
});

bot.start((ctx) => ctx.reply('Hello'))
bot.help((ctx) => ctx.reply('Help message'))
bot.on('message', async (ctx) => {
    if (!ctx.message) {
        return;
    }

    if (ctx.message.chat.id < 0) {
        return;
    }

    try {
        const copiedMessage = await ctx.telegram.copyMessage(
            groupId,
            ctx.message.chat.id,
            ctx.message.message_id,
            getKeyboard({UP: 0, DOWN: 0}),
        );

        await workflow.startPostWorkflow(
            copiedMessage.message_id,
            ctx.message.from.id,
        )
    } catch (e) {
        console.error('Error', e);
    }
});

bot.launch()
console.log('Running...');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
