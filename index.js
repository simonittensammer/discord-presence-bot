const Discord = require('discord.js');
const client = new Discord.Client();

let students = [];
let lastMessage = null;
let studentRoleName = 'schueler';
let keyWords = ['anwesenheit', 'a'];

// Start event
client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

// Message event
client.on('message', msg => {
    if (msg.member.id === client.user.id) {
        return;
    }

    const msgContent = msg.content;
    if (msgContent.charAt(0) === '!' && keyWords.indexOf(msgContent.substring(1).toLowerCase()) !== -1) {
        
        if (!msg.member.hasPermission('lehrer') && !msg.member.hasPermission('klassensprecher')) {
            msg.channel.send('Bissl Lehrer spielen oder wie?').catch(console.log);
            return;
        }
        if (!(process.env.ALLOWED_CHANNEL_IDS.split(';') || []).includes(msg.channel.id)) {
            msg.channel.send('Wupsi-dupsi, falscher channel?').catch(console.log);
            return;
        }

        msg.guild.roles.cache.each(role => {
            if (role.name === studentRoleName) {
                students = role.members.map(member => ({
                    id: member.id,
                    displayName: member.displayName,
                    isPresent: false
                }));
                students.sort(compareName);

                msg.channel.send(`\`\`\`diff${getStudentsText(students)}\`\`\``).then(msg => {
                    lastMessage = msg;
                    msg.react('👍').catch(console.log);
                });
            }
        });
    }
});

// Reaction Event
client.on('messageReactionAdd', handleReactionEvent(true));
client.on('messageReactionRemove', handleReactionEvent(false))

// Login
client.login(process.env.BOT_TOKEN).catch(console.log);

////////////////////
// Help functions //
////////////////////

function handleReactionEvent(isAddedEvent) {
    return async (reaction, user) => {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.log('Something went wrong when fetching the message: ', error);
                return;
            }
        }

        if (reaction.message.id === lastMessage.id) {
            for (const student of students) {
                if (student.id === user.id) {
                    student.isPresent = isAddedEvent;
                }
            }
            lastMessage.edit('```diff' + getStudentsText(students) + '```').catch(console.log);
        }
    }
}

function getStudentsText(students) {
    return students.reduce((studentText, student) => studentText += `\n${student.isPresent ? '+' : '-'} ${student.displayName}`, '');
}

function compareName(a, b) {
    const nameA = a.displayName;
    const nameB = b.displayName;

    if (nameA > nameB) {
        return 1;
    } else if (nameA < nameB) {
        return -1;
    }
    return 0;
}
