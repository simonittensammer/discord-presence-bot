const Discord = require('discord.js');
const client = new Discord.Client();

let users = [];
let channel;
let anwesenheitBotId = '707213377918730291';
let anwesenheitMsg;
let studentRole = 'schueler';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!anwesenheit') || msg.content.startsWith('!Anwesenheit') || msg.content.startsWith('!ANWESENHEIT') || msg.content === '!a') {

        users = [];
        channel = msg.channel;

        //console.log('***********************************************');
        msg.guild.roles.cache.every((value, key) => {
            if(value.name === studentRole) {
                value.members.forEach(member => users.push({displayName: member.displayName, id: member.user.id, anwesend: false})); //member.user.username
                return false;
            }
            return true;
        });
        
        users.sort(compare);
        //console.log(users);
        //console.log('***********************************************');

        /*
        channel.send(
            '>>> Please react with :thumbsup: to this message'
        ).then(function (msg) {

            msg.react("👍")
                .then()
                .catch(console.error);
        });
        */

        channel.send(
            '```diff' +
            getStudents() +
            '```'
        ).then(function (msg) {
            msg.react("👍")
                .then()
                .catch(console.error);
        });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return;
		}
	}

    if (user.id != anwesenheitBotId) {
        //console.log(user);
        for(let i = 0; i < users.length; i++) {
            if (users[i].id == user.id) {
                users[i].anwesend = true;
            }
        }

        //console.log(reaction.message.id);
    } else {
        anwesenheitMsg = user.lastMessage;
    }

    anwesenheitMsg.edit(
        '```diff' +
        getStudents() +
        '```'
    );
});


function getStudents() {
    let students = '';

    if(users.length === 0) {
        return '\nNo students found';
    } else {
        for(let i = 0; i < users.length; i++) {
            if(users[i].anwesend) {
                students += '\n+ ' + users[i].displayName;
            } else {
                students += '\n- ' + users[i].displayName;
            }
        }
    }

    return students;
}

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const nameA = a.displayName.toUpperCase();
    const nameB = b.displayName.toUpperCase();
  
    let comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
  }

client.login(process.env.BOT_TOKEN);