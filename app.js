const Discord = require('discord.js');
const client = new Discord.Client();
const http = require('http');
const https = require('https');
const port = process.env.PORT;


// Server keeps the bot up with Uptime Robot pinging it
const requestHandler = (request, response) => {
  console.log(request.url);
  response.end('server requested');
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`);
});


// When discord.js client is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.fetchInvite('https://discord.gg/jgFrBhN')
    .then(invite => {
      console.log(invite.guild.channels.get('412025755594129431').children);
    });
});

client.on('guildMemberRemove', member => {
  member.createDM()
    .then(DMchannel => {
      DMchannel.send('Hey there, we\'d like to know why you left Game Corner so that future members have a better experience. Please type out your response in a message below. Thanks!');
      const filter = m => m.author.id === member.id;
      DMchannel.awaitMessages(filter, { max: 1, time: 86400000, errors: ['time'] })
        .then(collected => {
          client.fetchUser('240550416129982464')
            .then(user => {
              user.send(`Forner member ${member.displayName} left Game Corner and said: ${collected.values().next().value.toString()}`);
            });
        });
    });
});

// When client receives a message
client.on('message', msg => {
  var msgMatch = msg.content.match(/\([^()]*\)|[^.]+(?=\([^()]*\))|[^.]+/g);
  var username;
  var method;
  var value;
  if (msgMatch[0] === 'API') {
    if (msgMatch[1] === 'summoner') {
      if (msgMatch.length === 3 || msgMatch.length === 4) {
        if (msgMatch[2].startsWith('(') && msgMatch[2].endsWith(')')) {
          var userMatch = msgMatch[2];
          var username = userMatch.slice(1, -1);
          if (username.match('^[A-z0-9 ]+$')) {
            value = 3;
            https.get('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + username + '?api_key=' + process.env.apikey, (res) => {
              res.on('data', (d) => {
                console.log('Riot API statusCode: ' + res.statusCode);
                switch (res.statusCode) {
                  case 400:
                    msg.reply('Something went wrong with the request! Please try again.');
                    break;
                  case 401:
                  case 403:
                    msg.reply('The developer of GC-System is not authorized to use the Riot API. Please contact them for furthur details.');
                    break;
                  case 404:
                    msg.reply('The username ' + username + ' is not found in NA1');
                    break;
                  case 405:
                    msg.reply('The method connection is not allowed. Please contact the bot developer.');
                    break;
                  case 415:
                    msg.reply('The username text is not supported.');
                    break;
                  case 422:
                    msg.reply(username + ' exists, but hasn\'t played since match history collection began.');
                    break;
                  case 429:
                    msg.reply('Too many requests are being made to the API. Please try again later.');
                    break;
                  case 500:
                    msg.reply('There is an internal server error. Please contact the Riot Developer team here: <https://developer.riotgames.com/support/tickets/>.');
                    break;
                  case 502:
                    msg.reply('There is a bad gateway. Please contact the developer of the bot.');
                    break;
                  case 503:
                    msg.reply('The Riot API is currently unavailible. Please see <https://developer.riotgames.com/api-status/> for more details.');
                    break;
                  case 504:
                    msg.reply('The response took too long. Please contact the developer of the bot.');
                    break;
                  case 200:
                    var response = JSON.parse(d);
                    var userResponse = JSON.stringify(response);
                    if (msgMatch.length === 4) {
                      method = msgMatch[3];
                      var methodResponse = response[method];
                      if (methodResponse !== undefined) {
                        msg.reply('The ' + method + ' of ' + username + ' is ' + methodResponse);
                      }
                      else {
                        msg.reply('This is not a valid property. You can find all of the properties at: <https://developer.riotgames.com/api-methods/#summoner-v3/GET_getBySummonerName>');
                      }
                    }
                    else {
                      msg.reply('The data for ' + username + ' is ' + userResponse);
                    }
                }
              });
            }).on('error', (e) => {
              console.error(e);
            });
          }
          else {
            msg.reply('Usernames can only contain letters and numbers.');
          }
        }
        else {
          msg.reply('Please provid the username as a parameter of \`summoner\` for the summoner.');
        }
      }
      else if (msgMatch.length > 4) {
        msg.reply('There are no other parameters of those of \`summoner\`\'s.');
      }
      else {
        msg.reply('Please provid a username as a parameter of \`summoner\` for the summoner.');
      }
    }
    else {
      msg.reply('Please provid a valid property of \`API\`. The only current property is \`summoner\`.');
    }
  }
});

client.login(process.env.token);
