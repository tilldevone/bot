
import { Telegraf } from 'telegraf'
import { Airgram } from 'Airgram';
import { Database, sqlite3 } from 'sqlite3';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { message } from 'telegraf/filters'

import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';
import { de, hi, ru } from 'date-fns/locale';
import { Buffer } from 'buffer';

import { VK } from 'vk-io';
import { VKOptions } from 'vk-io/types';
import { runInContext } from 'vm';
import { stringify } from 'querystring';

import * as env from 'dotenv';
import { diff } from 'util';



// Load environment variables from .env file
const envv = env.config({ path: path.resolve(__dirname, '../.env') });
console.log('Environment variables loaded:', envv.parsed.DEBUG);
var debug_mode: Boolean = (envv.parsed.DEBUG === 'true') ? true : false;

// var db: Database = new Database('./db/bot.db', (err) => {
//     if (err) {
//         console.error('Error opening database:', err.message);
//     } else {
//         console.log('Connected to the SQLite database.');
//     }
// });

//     const sql = `CREATE TABLE IF NOT EXISTS users (
//     user_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
//     friends INTEGER DEFAULT 0,
//     groups INTEGER DEFAULT 0,
//     followers INTEGER DEFAULT 0,
//     subscriptions INTEGER DEFAULT 0,
//     photos INTEGER DEFAULT 0,
//     videos INTEGER DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );`;    


  interface History implements VK.types.User {
    friends: [ VK.types.User ];
  };

  var hist: History;
//    = {
//     friends: 0,
//     groups: 0,
//     followers: 0,
//     subscriptions: 0,
//     photos: 0,
//     videos: 0
//   };

// db.serialize(() => {
//     var res = "";
//     db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
//         if (err) {
//             console.error('Error fetching table names:', err.message);
//         } else {
//             if (rows.length === 0) {
//                 console.log('No tables found in the database. Creating users table...');
//                 db.run(sql, (err) => {
//                     if (err) {
//                         console.error('Error creating users table:', err.message);
//                     } else {
//                         console.log('Users table created successfully.');
//                     }
//                 });
//             } else {
//                 console.log('Tables already exist in the database.');
//                 console.log('Tables in the database:', rows.map(row => row.name));
//             }
//         }

//     });
// });

const bot = new Telegraf("2019283473:AAF9MbS_OwiDl_sMhNt-JlbvfAI5mcesOFA");

const vk = new VK({
    token: '503f374b503f374b503f374b5b530a7cb45503f503f374b3841340dfc1a797e4acbf43a',
    apiVersion: '5.199',
    language: 'ru',
});

function resolve_dev(input: any): string {
    var ret = "Unknown"
    switch (input) {
        case 1:
            ret = 'Mobile website'
            break
        case 2:
            ret = "iPhone"
            break
        case 3:
            ret = "iPad"
            break
        case 4:
            ret = "Android"
            break
        case 7:
            ret = "Website on PC"
            break
    }
    return ret
}

function debug_log(data: any, from: string! ) {
    if (debug_mode) {
        console.log("\n\n");
        console.log(' >> DEBUG LOG: ');
        console.log(' >> From: ', from);
        console.log(data);
        console.log(" END OF DEBUG LOG \n\n");
    }
}

async function run(): Promise<string> {
    var res = ""
    await vk.api.users.get({
        user_ids: [ 'katya_bach' ],
        fields: [ 'online' , 'online_info', 'last_seen', 'followers_count', 'counters', 'lists' ]
    }).then((response) => {
            res += "[ ::: VK ::: " + response[0]['first_name'] + ' ' + response[0]['last_name'] + "](https://vk.com/id" + response[0]['id'] + " ) ";
            res += "\n ```";
            res += `\n | Cтатус     \t| ${response[0]['online'] ? 'Online' : 'Offline'} `;
            res += `\n | Заходил    \t| ${format(new Date((response[0].last_seen.time * 1000 - 7200)), 'dd MMMM yyyy',{ locale: ru })} `;
            res += `\n | Время      \t| ${format(new Date((response[0].last_seen.time * 1000 - 7200)), 'HH:mm',{ locale: ru })} `;
            res += `\n | Устройство \t| ${resolve_dev(response[0]["last_seen"]['platform'])} `;
            res += "\n ```";
            if (hist) {
                if ((hist.followers_count - hist.counters.followers) !== (response[0]['followers_count'] - response[0]['counters']['followers'])) {
                    res += `\n   ${response[0]['followers_count'] - response[0]['counters']['followers'] - (hist.followers_count - hist.counters.followers)} новых друзей `;
                }
                if (hist.counters.pages !== response[0]['counters']['pages']) res += `\n   ${response[0]['counters']['pages'] - hist.counters.pages} новых групп `;
                if (hist.counters.followers !== response[0]['counters']['followers']) res += `\n   ${response[0]['counters']['followers'] - hist.counters.followers} новых подписчиков `;
                if (hist.counters.subscriptions !== response[0]['counters']['subscriptions']) res += `\n   ${response[0]['counters']['subscriptions'] - hist.counters.subscriptions} новых подписок `;
                if (hist.counters.photos !== response[0]['counters']['photos']) res += `\n   ${response[0]['counters']['photos'] - hist.counters.photos} новых фотографий `;
            };

            hist = response[0] as VK.types.User;
            
    debug_log(hist, "hist");
    //     db.run(`INSERT OR REPLACE INTO users (user_id, friends, groups, followers, subscriptions, photos, videos, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    //         [response[0]['id'], (response[0]['followers_count'] - response[0]['counters']['followers']), response[0]['counters']['pages'], response[0]['counters']['followers'], response[0]['counters']['subscriptions'], response[0]['counters']['photos'], response[0]['counters']['videos'], new Date()],
    //         (err) => {
    //             if (err) {
    //                 console.error('Error inserting or updating user data:', err.message);
    //             } else {
    //                 console.log('User data inserted or updated successfully.');
    //             }
    //         }
    // );

     //debug_log(response[0], "User data");

    // if (debug_mode) {
    //     res += "\n\n ```DEBUG ";
    //     res += `\n FROM: response[0] `;
    //    res += `\n ${(response[0]['followers_count'] - response[0]['counters']['followers'])} друзей, ${hist.friends} было `;
    //    res += `\n ${response[0]['counters']['pages']} групп, ${hist.groups} было `;
    //    res += `\n ${response[0]['counters']['followers']} подписчиков, ${hist.followers} было `;
    //    res += `\n ${response[0]['counters']['subscriptions']} подписок, ${hist.subscriptions} было `;
    //    res += `\n ${response[0]['counters']['photos']} фото, ${hist.photos} было `;
    //    res += `\n ${response[0]['counters']['videos']} видео, ${hist.videos} было `;
    //     res += "\n END OF DEBUG INFO ```";

    
    if (debug_mode) {
        res += "\n\n ```DEBUG ";
       res += "\n | Списки      	| Значение 	| Было \t	|";
       res += "\n |-------------	|----------	|------	\t|";
       res += `\n | Друзей      	| \t ${response[0]['followers_count'] - response[0]['counters']['followers']} \t\t | ${hist.followers_count - hist.counters.followers} \t |`;
       res += `\n | Групп       	| \t ${response[0]['counters']['pages']} \t\t\t | ${hist.counters.pages} \t\t |`;
       res += `\n | Подписок    	| \t ${response[0]['counters']['subscriptions']} \t\t\t\t | ${hist.counters.subscriptions} \t\t\t |`;
       res += `\n | Подписчиков 	| \t ${response[0]['counters']['followers']} \t\t\t | ${hist.counters.followers} \t\t |`;
       res += `\n | Фотографий  	| \t ${response[0]['counters']['photos']} \t\t\t | ${hist.counters.photos} \t\t |`;
       res += `\n | Видео       	| \t ${response[0]['counters']['videos']} \t\t\t | ${hist.counters.videos} \t\t |`;
       res += "\n ```";
    };


    });



    return res;
}







function getFilesInDirectory(directoryPath: string): string[] {
    console.log('Directory scan started..');
    try {
        // Read the contents of the directory
        const files = fs.readdirSync(directoryPath);

        // Filter out directories and return only files
        return files.filter(file => {
            const filePath = path.join(directoryPath, file);
            return fs.statSync(filePath).isFile();
        });
    } catch (error) {
        console.error(`Error reading directory: ${directoryPath}`, error);
        return [];
    }
}

const ImgdirectoryPath = './img';

var imgmedias = filesarray(ImgdirectoryPath)

const VidirectoryPath = './vid';
var vidmedias = filesarray(VidirectoryPath)


function filesarray(path: string) {
    const files = getFilesInDirectory(path);
    console.log('Directory ',path, ' scan finished. Found ', files.length, ' files.');

    const filespath = files.map(item => `${path}/${item}`)

    debug_log(filespath.slice(0, 10).join(', ') + " ... ", "files scanned");
    return filespath;
}

var step = 0;

bot.command('status', async (ctx) => {
 run().then((res) => {
    ctx.replyWithMarkdownV2(
        res);
}).catch((error) => {   
    console.error('Error fetching status:', error);
    ctx.reply('Failed to fetch status. Please try again later.');   
});
});

function getSymmetricDifference<T>(arr1: T[], arr2: T[]): T[] {
  const uniqueToA = arr1.filter(item => !arr2.includes(item));
  const uniqueToB = arr2.filter(item => !arr1.includes(item));
  return [...uniqueToA, ...uniqueToB];
}


function list_updates(resp: VK.types.User, list: string): string {
    var res = "";
    if (hist) {
        res += `\n   ${hist.followers_count - hist.counters.followers} новых друзей `;
        res += `\n   ${hist.counters.pages} новых групп `;
        res += `\n   ${hist.counters.followers} новых подписчиков `;
        res += `\n   ${hist.counters.subscriptions} новых подписок `;
        res += `\n   ${hist.counters.photos} новых фотографий `;
        res += `\n   ${hist.counters.videos} новых видео `;
    }
    return res;
}

bot.command('photos', async (ctx) => {
    var fls = [];
    var j = 11;
    if (imgmedias.length < 10) j = imgmedias.length
        for (let i = 1; i < j; i += 1) {
            fls.push(imgmedias[step + i]);
            step += 1;
            if (step >= imgmedias.length) {
                step = 0; // Reset step if it exceeds the length of medias
            }
        }
        if (debug_mode) {
            console.log('Photo Files total: ', imgmedias.length);
            console.log('Step value: ', step);
            console.log('Current page: ', Math.floor(step / 10) + 1);
            console.log('Less then 10: ', !((imgmedias.length - step) < 10) ? 'No' : 'Yes, now ' + (imgmedias.length - step) + ' files left');
        }
    ctx.sendMediaGroup(
        fls.map((media) => {
            return {
                type: 'photo',
                media: { source: media }
            }
        })
    ).finally(() => {

        
        if (debug_mode) ctx.sendMessage('Photo Files total: ' + imgmedias.length + '\n' +
            'Step value: ' + step + '\n' +
            'Current page: ' + Math.floor(step / 10 + 1) + '\n' +
            'Less then 10: ' + (!((imgmedias.length - step) < 10) ? 'No' : 'Yes, now ' + (imgmedias.length - step) + ' files left')
        );
        ctx.reply('/photos for more');
    }).catch((error) => {
        console.error('Error sending photos:', error);
        ctx.reply('Failed to send photos. Please try again later.');
    });

})


bot.command('videos', async (ctx) => {
     var fls = [];
    var j = 2;
    if (vidmedias.length < 1) j = vidmedias.length
        for (let i = 1; i < j; i += 1) {
            fls.push(vidmedias[step + i]);
            step += 1;
            if (step >= vidmedias.length) {
                step = 0; // Reset step if it exceeds the length of medias
            }
        }
        if (debug_mode) {
            console.log('VIDEO Files total: ', vidmedias.length);
            console.log('Step value: ', step);
            console.log('Current page: ', Math.floor(step / 1) + 1);
            console.log('Less then 10: ', !((vidmedias.length - step) < 1) ? 'No' : 'Yes, now ' + (vidmedias.length - step) + ' files left');
        }
    ctx.sendMediaGroup(
        fls.map((media) => {
            return {
                type: 'video',
                media: { source: media }
            }
        })
    ).finally(() => {

        
        if (debug_mode) ctx.sendMessage('VIDEO Files total: ' + vidmedias.length + '\n' +
            'Step value: ' + step + '\n' +
            'Current page: ' + Math.floor(step / 1 + 1) + '\n' +
            'Less then 10: ' + (!((vidmedias.length - step) < 1) ? 'No' : 'Yes, now ' + (vidmedias.length - step) + ' files left')
        );
        ctx.reply('/videos for more');
    }).catch((error) => {
        console.error('Error sending videos:', error);
        ctx.reply('Failed to send videos. Please try again later.');
    });

}) 

bot.command('debug', (ctx) => {
    debug_mode = !debug_mode;
    ctx.reply(`Debug mode is now ${debug_mode ? 'enabled' : 'disabled'}.`);
});

bot.on(message('photo'), async (ctx) => {
    if (ctx.message.photo) {
        // Get the largest photo (last in the array)
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const fileId = photo.file_id;
        const fileInfo = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN || "2019283473:AAFe_aV5VeqD27P34rqcwnboEF5hrtrZa9o"}/${fileInfo.file_path}`;
            const destPath = path.join('./img', `${fileId}.jpg`);
            const https = require('https');
            const file = fs.createWriteStream(destPath);
            debug_log(fileUrl, "fileUrl for photo");
            https.get(fileUrl, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('File downloaded and saved successfully to store');
                    ctx.reply('File downloaded and saved successfully to store');
                    imgmedias = filesarray(ImgdirectoryPath);
                });
            }).on('error', (err) => {
                fs.unlink(destPath, () => {});
                console.error('Error downloading file:', err);
            });
        }
});

bot.on(message('video'), async (ctx) => {
    if (ctx.message && ctx.message.video) {
        // Get the largest photo (last in the array)
        const photo = ctx.message.video;
        const fileId = photo.file_id;
        const fileInfo = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN || "2019283473:AAFe_aV5VeqD27P34rqcwnboEF5hrtrZa9o"}/${fileInfo.file_path}`;
            const destPath = path.join('./vid', `${photo.file_name}`);
            const https = require('https');
            const file = fs.createWriteStream(destPath);
            debug_log(fileUrl, "fileUrl for video");
            https.get(fileUrl, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('File downloaded and saved successfully to store as ', destPath);
                    ctx.reply('File downloaded and saved successfully to store');
                    vidmedias = filesarray(VidirectoryPath);
                });
            }).on('error', (err) => {
                fs.unlink(destPath, () => {});
                console.error('Error downloading file:', err);
            });
        }
});

bot.on(message('text'), (ctx) => {
    ctx.reply('Hello! I am a bot. Send /status to get status or /photos to get photos or /videos to get videos.')
})

bot.launch({
    dropPendingUpdates: true,
    allowedUpdates: ['message', 'edited_message', 'channel_post', 'edited_channel_post', 'inline_query', 'chosen_inline_result', 'callback_query', 'shipping_query', 'pre_checkout_query', 'poll', 'poll_answer']
}).then(() => {
    console.log('Bot started');
}).catch((error) => {  
    console.error('Error starting bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
