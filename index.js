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
const { getLanguageByInput, languages, defaultLanguage }= require('./language.js')
const dictionary = require('./dictionary')
//database
const { getUser, updateUser, getSynonym, getTopDeckStats } = require("./db")
//random image service
const randomImageService = require('random-image-api')
const fs = require('fs')
//topDeck game
const { topDeck, myTDRank }  = require('./topDeck')

//start server
app.get('/', (req, res) => res.send('Bot is online.'))
app.listen(port, () => console.log(`Bot is listening at :${port}`))

// ================= DISCORD JS ===================
const { Client, Intents, Permissions } = require('discord.js')
const { handleSynonym } = require('./search');
const { drawBattlefield } = require('./canvasManager');
const client = new Client(
  {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ]
  })
//login event
client.on('ready', () =>
{
    console.log(`Logged in as ${client.user.tag}`, 'Server count: ' + client.guilds.cache.size)
    client.user.setActivity('KARDS(' + client.guilds.cache.size + ') servers')
})
//main block
try
{   //await new messages
    client.on('messageCreate', async message =>
    {
        let prefix = '!' //default
        //not a bot command or bot
        if (!message.content.startsWith(prefix) || message.author.bot) {

            return
        }
        //check for write permissions
        const clientMember = await message.guild.members.fetch(client.user.id)
        let permissions = message.channel.permissionsFor(clientMember)
        if (!permissions.has(Permissions.FLAGS.ATTACH_FILES) || !permissions.has(Permissions.FLAGS.SEND_MESSAGES))
        {
            console.log('no write permissions.')

            return
        }
        //check for a different prefix

        let serverPrefix = process.env['PREFIX_'+message.guildId]
        if (serverPrefix !== undefined) {
            prefix = serverPrefix
            console.log('prefix is set to ->', prefix)
        }
        //it's a bot command
        console.log('bot command:', message.author.username, '->', message.content)
        //set username
        const user = await getUser(message.author.id.toString())
        user.name = message.author.username
        //remove the prefix and whitespaces from the beginning
        let command = message.content.replace(prefix, '').trim().toLowerCase()
        //check the user language
        let language = defaultLanguage
        if (user.language !== defaultLanguage) language = user.language
        await updateUser(user)
        //handle command
        if (command === 'help')
        {
            await message.reply(translator.translate(language, 'help'))

            return
        }
        //get top 9 TD ranking
        if (command === 'ranking' || command === 'rankings')
        {
            await message.reply(await getTopDeckStats())

            return
        }
        //user's TD ranking
        if (command === 'myrank')
        {
            await message.reply(myTDRank(user))

            return
        }
        //show online stats
        if (
          message.content === prefix+prefix ||
          message.content === prefix+'ingame' ||
          message.content === prefix+'online')
        {
            stats.getStats().then(res => { message.reply(res) }).catch(error => { console.log(error) })

            return
        }
        //handle synonyms
        if (command.startsWith('+'))
        {
            let syn = await handleSynonym(user, command)
            if (syn) {
                await message.reply(syn.key + ' created')
                console.log('created synonym:', syn.key)
            }

            return
        }
        //top deck game only in special channels
        if (
          message.content.startsWith(prefix+'td') &&
          ( message.channel.name.search('bot') !== -1 ||
            dictionary.botwar.channels.includes( message.channelId.toString() )
          )
        )
        {
            console.log('starting top deck game')
            //let channel = client.channels.fetch(message.channelId)
            let td = await topDeck(message.channelId, user, command)
            if (td.state === 'open') {
                let unitType = 'Unit type: '
                if (td.unitType) unitType += td.unitType
                await message.reply('**' +unitType.toUpperCase()+ '**\nWaiting for another player...')

                return
            }
            if (td.state === 'finished') {
                //draw the image
                await message.reply('getting battle results...')
                const battleImage = await drawBattlefield(td)
                await message.reply({content: td.log, files: [battleImage]})
                console.log(td.log)
                //delete the battle image
                fs.rm(battleImage, function () {
                    console.log('image deleted')
                })
            }

            return
        }
        //switch language
        if (message.content.length === 3 && languages.includes(command.slice(0,2)))
        {
            language = command.slice(0,2)
            //for traditional chinese
            if (language === 'tw') language = 'zh-Hant'
            user.language = language
            await updateUser(user)
            message.reply(
                translator.translate(language, 'langChange') + language.toUpperCase()
            ).then( () =>  {
                console.log('lang changed to', language.toUpperCase(), 'for', message.author.username)
            })

            return
        }
        if (command.length < minStrLen)
        {
            await message.reply('Minimum ' + minStrLen + ' chars, please')
        }
        //else search on KARDS website
        else
        {
            //check for synonyms
            let syn = await getSynonym(command)
            if (syn) {
                //check if there is a image link
                if (syn.value.startsWith('https')) {
                    await message.reply({files: [syn.value]})

                    return
                }
                else command = syn.value
            }
            else if (command in dictionary.synonyms)
            {
                command = dictionary.synonyms[command]
                console.log('synonym found for ' + command)
            }
            let variables = {
                'language': language,
                'q': command,
                'showSpawnables': true,
            }
            const searchResult = await search.getCards(variables)

            if (!searchResult) {
                await message.reply(translator.translate(language, 'error'))

                return
            }
            const counter = searchResult.counter
            if (!counter)
            {
                //get a random cat image for no result
                const catImage = await randomImageService.nekos('meow')
                await message.reply(
                  {content: translator.translate(language, 'noresult'),
                      files: [catImage.toString()]
                  })

                return
            }
            //if any cards are found - attach them
            let content = translator.translate(language, 'search') + ': ' + counter
            //warn that there are more cards found
            if (counter > limit) {
                content += translator.translate(language, 'limit') + limit
            }
            //attach found images
            const files = search.getFiles(searchResult, language)
            //reply to user
            await message.reply({content: content, files: files})
            console.log(counter + ' card(s) found', files)
        } //end of search
    }) // end of onMessageCreate
    //start bot session
    client.login(process.env.DISCORD_TOKEN).then( () => { console.log('client started') })
//end of global try
} catch (error) { console.log(error) }