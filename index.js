require('dotenv').config();
const { Discord } = require('discord.js');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');



const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages
  ],
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;

  if (["i can't do this", "i want to die", "i want to kill myself", "i dont want to be here anymore", "i cant do this", "kill myself", "kms", "end my life", "i dont want to wakeup"].includes(message.content.toLowerCase())) {
    try {
      const exampleEmbed = {
        color: parseInt('ff0000', 16),
        title: '🚨🚨🚨 BAYMAX TRIGGERED 🚨🚨🚨',
        description: 'Hello, I am Baymax, your personal healthcare and AI companion. I noticed you sent a discouraging message in the channel and wanted to check up on you. On a scale of one to ten, how would you rate your pain?'
      };
  
      const warningMessage = await message.author.send({ embeds: [exampleEmbed] });
  
      // Create message collector to listen for user's response
      const collector = warningMessage.channel.createMessageCollector({
        filter: (msg) => msg.author.id === message.author.id,
        time: 20000, // 20 seconds
        max: 1
      });
  
      collector.on('collect', (msg) => {
        const userInput = Number(msg.content.trim());
        if (!Number.isNaN(msg.content) && parseInt(msg.content) >= 5) {
          message.author.send('I\'m sorry to hear that. Can you please provide more details?');
          let moreDetailsProvided = false;
          
          const detailsCollector = message.author.dmChannel.createMessageCollector({
            filter: (response) => response.author.id === message.author.id,
            time: 30000, // 30 seconds
            max: 1
          });
      
          detailsCollector.on('collect', (response) => {
            moreDetailsProvided = true;
            // Do something with the details provided by the user
            message.author.send(`Thank you for sharing ${message.author.username}. There is more to life than just being upset. As a health companion, I am here for you no matter what. I do suggest calling Talk Suicide Canada at 1.833.456.4566 if you require additional help. But here is a virtual hug!`);
            message.author.send(`Source: https://tenor.com/view/hug-baymax-bh6-gif-11673006`);
          });

          detailsCollector.on('end', (collected) => {
            if (collected.size === 0 && !moreDetailsProvided) {
              message.author.send(`I\'m sorry, I didn\'t hear from you. ${message.author.username}, Please remember that Baymax is always here for you no matter what.`);
            }
          });
        } else {
          message.author.send(`Thank you for sharing ${message.author.username}. Please remember that there is always help available if you need it. Here is a fist bump to cheer you up:`);
          message.author.send(`Source: https://media.tenor.com/tJQF6R0xkIgAAAAC/fist-bump-baymax.gif`);

        }
      });
      
      collector.on('end', (collected) => {
        if (collected.size === 0) {
          message.author.send('I\'m sorry, I didn\'t hear from you. Please remember that Baymax is always here for you no matter what.');
        }
      });
    } catch (error) {
      console.log(`ERR: ${error}`);
    }
  }

  let conversationLog = [{ role: 'system', content: 'You are a friendly chatbot.' }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
