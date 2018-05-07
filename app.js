const Discord = require("discord.js");
const client = new Discord.Client();
const https = require("https");

const requestHandler = (request, response) => {
  console.log(request.url);
  response.end('GC-System active.');
}

const server = https.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.indexOf('API.') === 0) {
    var content = msg.content;
    var reststring = content.slice(4);
    var propertyPos = reststring.indexOf('.');
    if (propertyPos !== -1) {
      username = reststring.slice(0, propertyPos);
      method = reststring.slice(propertyPos + 1);
    }
    if (username.match('^[A-z0-9 ]+$')) {
      https.get('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + username + '?api_key=' + process.env.apikey, (res) => {
        res.on('data', (d) => {
          var response = JSON.parse(d);
          var finalResponse = response[method];
          console.log(res.statusCode);
          switch (res.statusCode) {
            case 400:
              msg.reply('Something went wrong with the request! Please try again.');
              break;
            case 401:
              msg.reply('The developer of GC-System is not authorized to use the Riot API. Please contact them for furthur details.');
              break;
            case 403:
              msg.reply('The username ' + username + ' is not found in NA1');
              break;
            case 404:
              msg.reply('The username ' + username + ' is not found in NA1');
              break;
            case 405:
              msg.reply('The method ' + method + ' is not valid. Please go to <https://developer.riotgames.com/api-methods/#summoner-v3/GET_getBySummonerName> to see all availible methods.');
              break;
            case 415:
              msg.reply('The inputed text is not supported.');
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
              if (propertyPos !== -1) {
                msg.reply('The ' + method + ' of ' + username + ' is ' + finalResponse);
              }
              else {
                msg.reply('The data for ' + reststring + ' is ' + response);
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
});

client.login(process.env.token);
