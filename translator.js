/**
 *
 * @param language
 * @param msg
 * @returns {string|*}
 */
function translate(language, msg)
{
    const reservedWords = {
        'germany': 'германия',
        'usa': 'сша',
        'japan': 'япония',
        'soviet': 'советы',
        'britain': 'британия',
        'france': 'франция',
        'italy': 'италия',
        'poland': 'польша',
        'infantry': 'пехота',
        'artillery': 'арта',
        'fighter': 'истребитель',
        'bomber': 'бомбардировщик',
        'tank': 'танк',
        'order': 'приказ',
        'countermeasure': 'контрмера',
        'blitz': 'блиц',
        'ambush': 'засада',
        'smokescreen': 'дым',
        'fury': 'ярость',
        'guard': 'охрана',
        'alpine': 'альпийский',
        'pincer': 'клещи',
        'heavyArmor1': 'тяжелый',
        'heavyArmor2': 'тяжелый',
        'standard': 'стандартная',
        'limited': 'ограниченная',
        'special': 'специальная',
        'elite': 'элитная',
        'exile': 'изгнание',
    }

    switch (language)
    {
        case 'ru':
            if (msg === 'online') return 'Steam нагибаторов онлайн'
            if (msg === 'search') return 'найдено карт'
            if (msg === 'stats') return 'последние 24 часа'
            if (msg === 'error') return 'shit..ошибочка вышла!'
            if (msg === 'limit') return ', но покажу всего '
            if (msg === 'time') return 'Время сейчас'
            if (msg === 'noresult') return 'Язык поиска: ' + language.toUpperCase() + ', карт не найдено...'
            if (msg === 'langChange') return 'Язык поиска: '
            if (msg === 'help')
            {
                return 'Приветствую!\n\n' +
                    '**!!** - *Количество игроков онлайн и статистика*\n\n' +
                    '**!leo** - *Найдет Леопольда*\n' +
                    '**!сша пехота 3к блиц** - *Найдет карты с соответствующими параметрами*\n' +
                    '**!en** [ de| es | ft | it | ko | pl | pt | ru | tw | zh ] - *Сменить язык поиска*'
            }
            break
        case 'de':
            if (msg === 'online') return 'Steam Spieler online'
            if (msg === 'search') return 'Suchergebnisse'
            if (msg === 'stats') return 'Die letzten 24 Stunden'
            if (msg === 'error') return 'Scheiße, ein Fehler!'
            if (msg === 'limit') return ', ich zeige aber nur '
            if (msg === 'time') return 'Die aktuelle Zeit'
            if (msg === 'noresult') return 'Suchsprache: ' + language.toUpperCase() + ', nichts gefunden...'
            if (msg === 'langChange') return 'Suchsprache: '
            if (msg === 'help')
            {
                return 'Willkommen!\n\n' +
                    '**!!** - *Steam Spieler online and Statistiken*\n\n' +
                    '**!leo** - *findet den Leopold*\n' +
                    '**!usa infantry blitz 3k** - *findet alle Karten mit den Attributen*\n' +
                    'Nationen: **Soviet Germany Britain USA Japan Poland France Italy**\n' +
                    '**!de** [ de| es | ft | it | ko | pl | pt | ru | tw | zh ] - Suchsprache ändern'
            }
            break
        default: //en
            if (msg === 'online') return 'Steam players online'
            if (msg === 'search') return 'Cards found'
            if (msg === 'stats') return 'Last 24 hours'
            if (msg === 'error') return 'Oops... Something went wrong...'
            if (msg === 'limit') return ', but showing only the first '
            if (msg === 'time') return 'Time now'
            if (msg === 'noresult') return 'Search language: ' + language.toUpperCase() + '. No cards found...'
            if (msg === 'langChange') return 'Search language: '
            if (msg === 'help')
            {
                return 'Welcome!\n\n' +
                    '**!!** - *Steam players online and stats*\n\n' +
                    '**!leo** - *will find the Leopold*\n' +
                    '**!usa infantry blitz 3k 2c smoke 5/5** - *find cards with all the attributes*\n' +
                    'Nations for search: **Soviet Germany Britain USA Japan Poland France Italy**\n' +
                    '**!td [infantry | tank | artillery | fighter | bomber]**\n' +
                    '- 2 random cards fight. You can pick the unit type or leave it blank.\n' +
                    '**!ranking** - Top Deck Ranking\n' +
                    '**!myrank** - Your personal Top Deck Ranking with stats.\n\n' +
                    '**!en** [ de | es | ft | it | ko | pl | pt | ru | tw | zh ] - change the search language.\n\n' +
                    'Uptime stats: https://stats.uptimerobot.com/kBwWphkNQx\n' +
                    'The hosting costs 7$ a month.\n' + 'If you want to support me: https://www.paypal.me/kropotor'

            }
            //translate meta keywords from ru to en
            for (const [key, value] of Object.entries(reservedWords))
            {
                if (msg.slice(0, 3) === value.slice(0, 3)) return key
            }

            return msg
    }
}

module.exports = {translate}