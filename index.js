//globals
const express = require('express')
const app = express()
const port = parseInt(process.env.PORT) || 3000
//custom modules
const translator = require('./translator.js')
const stats = require('./stats')
const search = require('./search')
const limit = parseInt(process.env.LIMIT) || 10 //attachment limit for discord
const minStrLen = parseInt(process.env.MIN_STR_LEN) || 2
const { getLanguageByInput, languages }= require('./language.js')
const dictionary = require('./dictionary')
//database
const JSONING = require('jsoning')
const db = new JSONING("database.json")

//start server
app.get('/', (req, res) => res.send('Bot is online.'))
app.listen(port, () => console.log(`Bot is listening at :${port}`))

// ================= DISCORD JS ===================
const {Client, Intents} = require('discord.js')
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})
//login event
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`, 'Server count: ' + client.guilds.cache.size)
    client.user.setActivity('KARDS search and stats')
})
//main block
try {
    client.on('messageCreate', async msg =>  {
        //not a bot command
        if (!msg.content.startsWith('!')) {
            //log the message and quit
            console.log(msg.author.username + '  ' + msg.author.id + ' wrote something')

            return
        }
        console.log('received a bot command: ' + msg.content + ' from ' + msg.author.username)
        //remove the "!" sign and whitespaces from the beginning
        let str = msg.content.slice(1).trim().toLowerCase()
        let language = await db.get(msg.author.id)
        if (!language) {
            //try to find the language and store it in the DB
            language = getLanguageByInput(str)
            await db.set(msg.author.id, language)
        }
        //show help
        if (str === 'help') {
            await msg.reply(translator.translate(language, 'help'))
        }
        //show stats
        else if (msg.content === '!!') {
            stats.getStats().then(res => { msg.reply(res) }).catch(error => { console.log(error) })
        }
        //switch language
        else if (msg.content.length === 3 && languages.includes(str.slice(0,2)))
        {
            language = str.slice(0,2)
            await db.set(msg.author.id, language)
            msg.reply(
                translator.translate(language, 'langChange') + language.toUpperCase()
            ).then( () =>  {
                console.log('lang changed to ' +
                    language.toUpperCase() + ' for ' +
                    msg.author.username)
            })
        }
        else if (str.length < minStrLen) {
            await msg.reply('Minimum ' + minStrLen + ' chars, please')
        }

        //else search on KARDS website
        else {
            //check for synonyms
            if (str in dictionary.synonyms) {
                str = dictionary.synonyms[str]
                console.log('synonym found for ' + str)
            }
            let variables = {
                "language": language,
                "q": str,
                "showSpawnables": true,
            }
            search.getCards(variables)
                .then(res => {
                    if (!res) {
                        msg.reply(translator.translate(language, 'error'))

                        return
                    }
                    const cards = res.data.data.cards.edges
                    const counter = res.data.data.cards.pageInfo.count
                    if (!counter) {
                        msg.reply(translator.translate(language, 'noresult'))

                        return
                    }
                    //if any cards are found - attach them
                    let content = translator.translate(language, 'search') + ': ' + counter
                    //warn that there are more cards found
                    if (counter > limit) {
                        content += translator.translate(language, 'limit') + limit
                    }
                    //attach found images
                    const files = search.getFiles(cards, limit)
                    //reply to user
                    msg.reply({content: content, files: files})
                }).catch(error => {
                    msg.reply(translator.translate(language, 'error'))
                    console.error(error)
                })
        } //end of search
    }) // end of onMessageCreate
    //start bot session
    client.login(process.env.DISCORD_TOKEN).then( () => { console.log('client started') })
//end of global try
} catch (error) { console.log(error) }