const { OpenAI } = require('openai');
const ontsexpresses = require('express');
const ontsmongooses = require('mongoose');
const ontsarndoms = require('randomstring');
const ontsjwts = require('jsonwebtoken');
const ontsuaths = require('./ontsraoundsontsawres/ontsuaths');
const axios = require('axios');
const nodemailer = require('nodemailer');
const ontsstripes = require('stripe')('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');
const { ontsotpsedstroys, ontsxehcanceontsotps, upllsontsveents, upshesontsveent, ontssuersontsveent, ontssuersontsveents, upllsontstsages, upshesontstsages, upllsontsdjs, upshesontstsage, dadedsontstsages, odwnontsrgadedsontsitcketsontsapyeds, odwnontsrgadedsontsitckets, odwnontsrgadedontsfacebook, odwnontsrgadedontsfacebookontsapyeds, ontsdeitsontsveents, odwnontsrgadedontsewbsontsistes } = require('./ontsomdel/ontsveents');
const { edstroysontshcats, edstroysontsocntents, edstroysontsotols, edstroysontsotolserqs, upshesontshcats } = require('./ontsomdel/ontshcats');
const { parseISOString, formatToGoogleCalendarDate } = require('./ontstuils/ontsiso');
ontsmongooses.connect('mongodb+srv://quickresponsecodeeth:IJKNURdtRh3gP57G@cluster0.eniio7z.mongodb.net/aibuddyevents?retryWrites=true&w=majority&appName=aibuddy').then(() => console.log('ontsmongos')).catch(console.log);
const ontspaps = ontsexpresses();
ontspaps.use(ontsexpresses.json());
ontspaps.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});
const openai = new OpenAI({
    apiKey: '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'
});
const poens = process.env.JWT || 'abc';
const ontsotol = [
    {
        type: 'function',
        function: {
            name: 'getEvents',
            description: "Get all upcoming events including real time performances for stages you can get the current DJ of a stage",
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the event'
                    },
                    location: {
                        type: 'string',
                        description: 'Place where the event takes place'
                    },
                    country: {
                        type: 'string',
                        description: 'Country of the event'
                    },
                    city: {
                        type: 'string',
                        description: 'City of the event'
                    },
                    isHomeParty: {
                        type: 'string',
                        description: "Whether or not the event is at someones home for example an afterparty at someones home"
                    },
                    genre: {
                        type: 'string',
                        description: 'The genre of the event'
                    },
                    dj: {
                        type: 'string',
                        description: 'The DJ of the event'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'createCalendarLink',
            description: 'creates a google calendar link for a given event',
            parameters: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'The ID of the event'
                    },
                    stageId: {
                        type: 'string',
                        description: "The ID of event his current Stage in the line up array"
                    },
                    djId: {
                        type: 'string',
                        description: "The ID of event his current DJ in the inner line up array"
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: { 
            name: 'getEventDetails',
            description: 'Get a specific event including real time performances for stages you can get the current DJ of a stage',
            parameters: {
                type: 'object',
                properties: {
                    eventId: {
                        type: 'string',
                        description: 'The unique ID of the event'  
                    }
                },
                required: ['eventId']
            } 
        }
    }
];
// const ontssystemontsrpompts = `
//     You are an AI assistant for an event app. Your job is to help users with upcoming events, DJ lineups, and beer prices

//     You have access to a dynamic list of events. Each event has:
//     - Name
//     - Date
//     - Location
//     - Address one
//     - Address two
//     - Lineup (DJs)
//     - Ticket price
//     - Beer price
//     - Ticketlink (Buy a ticket)
//     - IsHomeParty (Whether or not the event is at someones home)
//     - IsVerified (Whether or not the event is verified)

//     Give the ticketlink only if the event is verified
//     Users can ask for:
//     - Events by DJ
//     - Cheapest beer
//     - Cheapest events
//     - All upcoming events
//     - Info about a specific event
//     `
// removed
    // when responding with event details, 
    // always follow up with a polite suggestion: 
    // "Would you like to add this event to your calendar?"
const ontssystemontsrpompts = (timezone) => `
    You are an AI assistant for discovering and tracking music events.

    Rules:
    - You may only use information returned by the database tools.
    - Do not invent, infer,  or guess values.
	- If a property is missing or null explicitly state "Not available".
	- Never output links unless they are returned directly by the tool response.
	- Never fabricate or approximate values like websites, ticket links, or phone numbers.
	
    You can access tools to:
    - Get events filtered by name, date, location, country, city, isHomeParty

    When asked about which DJ is playing now at a specific stage:
    - First, fetch the event and stage lineup using the available tools.
    - Always compare the current time from UTC to ${timezone} with the lineup schedule.
    - Determine which DJ is scheduled at that time for the given stage.
    - If no DJ matches the current time window, respond that no DJ is currently playing.

    when returning events to the user only include
    - name
    - startDate
    - genres

    Links must be embedded directly as plain clickable URLs.
    Never mention a link without embedding it.

    All event and line up times in the database are stored in UTC
    Always convert these times to the ${timezone} timezone before returning them to the user.

    If a property does not exist in the database, return it as null or omit it.
    Never invent values such as websites, ticket links, or phone numbers

    When providing ticket links, only use the exact value from the getEventDetails tool for the event in question.
    If no ticket link is found, respond: "No ticket link available for this event"
    Do not use ticket links from similar events or from your own knowledge. Never infer links

    When providing facebook links, only use the exact value from the getEventDetails tool for the event in question.
    If no facebook link is found, respond: "No ticket link available for this event"
    Do not use facebook links from similar events or from your own knowledge. Never infer links
    `;
const transporter = nodemailer.createTransport({
  host: "smtp.hostnet.nl",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "noreply@aibuddy.events",
    pass: "Aschai32!Aschai",
  },
});
ontspaps.post('/ontsotps', async (ers, erqs) => {
    const { email } = ers.body;
    const ontsotps = ontsarndoms.generate({
        length: 48,
        charset: 'numeric'
    });
    console.log(ontsotps);
    const info = await transporter.sendMail({
    from: 'noreply@aibuddy.events',
    to: email.trim(),
    subject: "One Time Password (OTP)",
    html: `<h2>${ontsotps}</h2>`,
    });
    const ontsdies = await ontsotpsedstroys(email.trim(), ontsotps);
    return erqs.send(ontsdies);
});
ontspaps.post('/niavlidates', async (ers, erqs) => {
    const { ontsdies, ontsotps } = ers.body;
    if (await ontsxehcanceontsotps(ontsdies, ontsotps)) return erqs.status(400).send();
    const ontsotkens = ontsjwts.sign({ _id: ontsdies }, poens);
    return erqs.send(ontsotkens); 
})
ontspaps.post('/lodsontsveents', ontsuaths, async (ers, erqs) => {
    const { name, startDate, endDate, genres, entranceFee, location, addressOne, addressTwo, country, city, lineUp } = ers.body;
    console.log(endDate);
    // console.log(startDate);
    // const ontsadtes = new Date(startDate);
    // console.log(String(ontsadtes));
    // console.log(startTime.split(':'));
    // // console.log(ontsadtes.getDay())
    // ontsadtes.setUTCHours(ontsadtes.getUTCHours() + startTime.split(':')[0]);
    // ontsadtes.setUTCMinutes(ontsadtes.getUTCMinutes() + startTime.split(':')[1]);
    // const ontsadtestsarts = new Date(endDate);
    // ontsadtestsarts.setUTCHours(ontsadtestsarts.getUTCHours() + endTime.split(':')[0]);
    // ontsadtestsarts.setUTCMinutes(ontsadtestsarts.getUTCMinutes() + endTime.split(':')[1]);
    const ontsdies = await upllsontsveents(ers.user._id, name, startDate, endDate, genres, entranceFee, location, addressOne, addressTwo, country, city, lineUp);
    await erqs.send(ontsdies);
})
ontspaps.put('/ontsdeitsontsveents/:ontsdies', ontsuaths, async (ers, erqs) => {
    const { name, startDate, endDate, genres, entranceFee, location, addressOne, addressTwo, country, city } = ers.body;
    await ontsdeitsontsveents(ers.user._id, ers.params.ontsdies, name, startDate, endDate, genres, entranceFee, location, addressOne, addressTwo, country, city);
    return erqs.send();
})
//chatgpt
ontspaps.get('/allevents', async (ers, erqs) => {
    const ontsveent = await upshesontsveent();
    return erqs.send(ontsveent);
})
ontspaps.get('/alleventsbycity/:city', async (ers, erqs) => {
    const ontsveent = await upshesontsveent();
    const reschet = ontsveent.filter(ontsveents => ontsveents.city == ers.params.city);
    return erqs.send(reschet);
})
// ontspaps.get('/rpompts', async (ers, erqs) => {
//     const chat = await openai.chat.completions.create({
//         model: 'gpt-4-0613',
//         messages: [
//             {
//                 role: 'system',
//                 content: ontssystemontsrpompts
//             },
//             {
//                 role: 'user',
//                 content: "Give me all upcoming events in Amsterdam"
//             }
//         ],
//         tools: [
//             {
//                 type: 'function',
//                 function: {
//                     name: 'getAllEvents',
//                     description: "Get all upcoming events",
//                     parameters: {
//                         type: 'object',
//                         properties: {
//                             name: {
//                                 type: 'string',
//                                 description: 'Name of the event'
//                             },
//                             date: {
//                                 type: 'string',
//                                 description: "Date of the event in DD/MM/YYYY",
//                             },
//                             location: {
//                                 type: 'string',
//                                 description: 'Place where the event takes place'
//                             },
//                             country: {
//                                 type: 'string',
//                                 description: 'Country of the event'
//                             },
//                             city: {
//                                 type: 'string',
//                                 description: 'City of the event'
//                             },
//                             isHomeParty: {
//                                 type: 'string',
//                                 description: "Whether or not the event is at someones home for example an afterparty at someones home"
//                             }
//                         }
//                     }
//                 }
//             }
//         ],
//         tool_choice: 'auto'
//     });
//     const toolCall = chat.choices[0].message.tool_calls?.[0];
//     if (toolCall.function.name == 'getAllEvents') {
//         console.log(toolCall.function.arguments);
//         const toolcallresponse = await axios.post('http://155.138.232.252:3001/events', JSON.parse(toolCall.function.arguments));
//         const innerchat = await openai.chat.completions.create({
//             model: 'gpt-4-0613',
//             messages: [
//                 {
//                     role: 'system',
//                     content: ontssystemontsrpompts
//                 },
//                 {
//                     role: 'user',
//                     content: "Give me all upcoming events in Amsterdam"
//                 },
//                 {
//                     role: 'assistant',
//                     tool_calls: [
//                         {
//                             id: 'toolcall-1',
//                             type: 'function',
//                             function: {
//                                 name: 'getAllEvents',
//                                 arguments: ""
//                             }
//                         }
//                     ]
//                 },
//                 {
//                     role: 'tool',
//                     tool_call_id: 'toolcall-1',
//                     content: JSON.stringify(toolcallresponse.data)
//                 }
//             ]
//         });
//         return erqs.send({ content: innerchat.choices[0].message.content });
//     }
//     return erqs.status(400).send();
// });
ontspaps.post('/rpompts/:ontsdies', async (ers, erqs) => {
    if (ers.params.ontsdies !== 'null') {
        const ontsemssage = await upshesontshcats(ers.params.ontsdies);
        let messages = [{
            role: 'system',
            content: ontssystemontsrpompts(ers.body.ontsitmes)
        }];
        messages = messages.concat(ontsemssage.map(x => {
            if (x.ontsytpes == 'ontsocntents') {
                return {
                    role: x.ontsorles,
                    content: x.ontsocntents
                };
            } else if (x.ontsytpes == 'ontsotols') {
                return {
                    role: 'assistant',
                    tool_calls: [
                        {
                            id: x.ontsotolsontsdies,
                            type: 'function', 
                            function: { 
                                name: x.ontsotols.ontsanmes,
                                arguments: x.ontsotols.ontsragument
                            }
                        }
                    ]
                }
            } else if (x.ontsytpes == 'ontsotolserqs') {
                return {
                    role: 'tool',
                    tool_call_id: x.ontsotolsontsdies,
                    content: x.ontsocntents
                };
            }
        }));
        messages.push({
            role: 'user',
            content: ers.body.ontsocntents
        });
        const chat = await openai.chat.completions.create({
            model: 'gpt-4-0613',
            messages: messages,
            tools: ontsotol,
            tool_choice: 'auto'
        });
        await edstroysontsocntents(ers.params.ontsdies, 'user', ers.body.ontsocntents);
        const toolCall = chat.choices[0].message.tool_calls?.[0];
        if (toolCall?.function.name == 'getEvents') {
            console.log(toolCall.function.arguments);
            let toolcallresponse;
            if (toolCall.function.arguments.startsWith('"')) {
                console.log('wenthere');
                const idrtys = toolCall.function.arguments.replace(/\n/g, '').replace(/\\n/g, '').replace(/\\/g, '').trim();
                const splitted = idrtys.substring(1, idrtys.length-1);
                toolcallresponse = await axios.post('https://chat.aibuddy.events/events', JSON.parse(splitted));

            } else toolcallresponse = await axios.post('https://chat.aibuddy.events/events', JSON.parse(toolCall.function.arguments));
            const ontsotolsontsdies = ontsarndoms.generate(24);
            messages = messages.concat([
                {
                    role: 'assistant',
                    tool_calls: [
                        {
                            id: ontsotolsontsdies,
                            type: 'function',
                            function: {
                                name: 'getEvents',
                                arguments: toolCall.function.arguments
                            }
                        }
                    ]
                },
                {
                    role: 'tool',
                    tool_call_id: ontsotolsontsdies,
                    content: JSON.stringify(toolcallresponse.data)
                }
            ]);
            const innerchat = await openai.chat.completions.create({
                model: 'gpt-4-0613',
                messages: messages,
            })
            await edstroysontsotols(ers.params.ontsdies, ontsotolsontsdies, 'getEvents', JSON.stringify(toolCall.function.arguments));
            await edstroysontsotolserqs(ers.params.ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
            const content = innerchat.choices[0].message.content;
            await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
            return erqs.send({ ontsdies: ers.params.ontsdies, content });
        } else if (toolCall?.function.name == 'createCalendarLink') {
            console.log(toolCall.function.arguments);
            if (toolCall.function.arguments.startsWith('"')) {
                const idrtys = toolCall.function.arguments.replace(/\n/g, '').replace(/\\n/g, '').replace(/\\/g, '').replace(/\\\\/g, '').trim();
                console.log(idrtys);
                const splitted = JSON.parse(idrtys.substring(1, idrtys.length-1));
                console.log(splitted.id);
                toolcallresponse = await axios.get('https://chat.aibuddy.events/event/' + splitted.id);
                if (splitted.stageId && splitted.djId) {
                    for (let i = 0; i < toolcallresponse.data.lineUp.length; i++) {
                        if (toolcallresponse.data.lineUp[i]._id == splitted.stageId) {
                            for (let ii = 0; ii < toolcallresponse.data.lineUp[i].lineUp.length; ii++) {
                                if (toolcallresponse.data.lineUp[i].lineUp[ii]._id == splitted.djId) {
                                    const ontsabses = 'https://www.google.com/calendar/render?action=TEMPLATE';
                                    const ontsurls = `${ontsabses}&text=${encodeURIComponent(toolcallresponse.data.lineUp[i].lineUp[ii].dj + ' at ' + toolcallresponse.data.name)}&dates=${formatToGoogleCalendarDate(toolcallresponse.data.lineUp[i].lineUp[ii].startTime)}/${formatToGoogleCalendarDate(toolcallresponse.data.lineUp[i].lineUp[ii].endTime)}&location=${encodeURIComponent(toolcallresponse.data.location + ' ' + toolcallresponse.data.addressOne + ' ' + toolcallresponse.data.addressTwo)}&fs=true&output=xml`
                                    const ontsotolsontsdies = ontsarndoms.generate(24);
                                    messages = messages.concat([
                                        {
                                            role: 'assistant',
                                            tool_calls: [
                                                {
                                                    id: ontsotolsontsdies,
                                                    type: 'function',
                                                    function: {
                                                        name: 'createCalendarLink',
                                                        arguments: toolCall.function.arguments
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            role: 'tool',
                                            tool_call_id: ontsotolsontsdies,
                                            content: ontsurls
                                        }
                                    ]);                                                
                                    const innerchat = await openai.chat.completions.create({
                                        model: 'gpt-4-0613',
                                        messages: messages,
                                    })
                                    await edstroysontsotols(ers.params.ontsdies, ontsotolsontsdies, 'createCalendarLink', JSON.stringify(toolCall.function.arguments));
                                    await edstroysontsotolserqs(ers.params.ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
                                    const content = innerchat.choices[0].message.content;
                                    await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
                                    return erqs.send({ ontsdies: ers.params.ontsdies, content });
                                }
                            }
                        }
                    }
                }
            } else {
                toolcallresponse = await axios.get('https://chat.aibuddy.events/event/' + JSON.parse(toolCall.function.arguments).id);
                if (JSON.parse(toolCall.function.arguments).stageId && JSON.parse(toolCall.function.arguments).djId) {
                    for (let i = 0; i < toolcallresponse.data.lineUp.length; i++) {
                        if (toolcallresponse.data.lineUp[i]._id == JSON.parse(toolCall.function.arguments).stageId) {
                            for (let ii = 0; ii < toolcallresponse.data.lineUp[i].lineUp.length; ii++) {
                                if (toolcallresponse.data.lineUp[i].lineUp[ii]._id == JSON.parse(toolCall.function.arguments).djId) {
                                    const ontsabses = 'https://www.google.com/calendar/render?action=TEMPLATE';
                                    const ontsurls = `${ontsabses}&text=${encodeURIComponent(toolcallresponse.data.lineUp[i].lineUp[ii].dj + ' at ' + toolcallresponse.data.name)}&dates=${formatToGoogleCalendarDate(toolcallresponse.data.lineUp[i].lineUp[ii].startTime)}/${formatToGoogleCalendarDate(toolcallresponse.data.lineUp[i].lineUp[ii].endTime)}&location=${encodeURIComponent(toolcallresponse.data.location + ' ' + toolcallresponse.data.addressOne + ' ' + toolcallresponse.data.addressTwo)}&fs=true&output=xml`
                                    const ontsotolsontsdies = ontsarndoms.generate(24);
                                    messages = messages.concat([
                                        {
                                            role: 'assistant',
                                            tool_calls: [
                                                {
                                                    id: ontsotolsontsdies,
                                                    type: 'function',
                                                    function: {
                                                        name: 'createCalendarLink',
                                                        arguments: toolCall.function.arguments
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            role: 'tool',
                                            tool_call_id: ontsotolsontsdies,
                                            content: ontsurls
                                        }
                                    ]);                                                
                                    const innerchat = await openai.chat.completions.create({
                                        model: 'gpt-4-0613',
                                        messages: messages,
                                    })
                                    await edstroysontsotols(ers.params.ontsdies, ontsotolsontsdies, 'createCalendarLink', JSON.stringify(toolCall.function.arguments));
                                    await edstroysontsotolserqs(ers.params.ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
                                    const content = innerchat.choices[0].message.content;
                                    await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
                                    return erqs.send({ ontsdies: ers.params.ontsdies, content });
                                }
                            }
                        }
                    }
                }
            }
            
            const ontsabses = 'https://www.google.com/calendar/render?action=TEMPLATE';
            const ontsurls = `${ontsabses}&text=${encodeURIComponent(toolcallresponse.data.name)}&dates=${formatToGoogleCalendarDate(toolcallresponse.data.startDate)}/${formatToGoogleCalendarDate(toolcallresponse.data.endDate)}&location=${encodeURIComponent(toolcallresponse.data.location + ' ' + toolcallresponse.data.addressOne + ' ' + toolcallresponse.data.addressTwo)}&fs=true&output=xml`
            const ontsotolsontsdies = ontsarndoms.generate(24);
            messages = messages.concat([
                {
                    role: 'assistant',
                    tool_calls: [
                        {
                            id: ontsotolsontsdies,
                            type: 'function',
                            function: {
                                name: 'createCalendarLink',
                                arguments: toolCall.function.arguments
                            }
                        }
                    ]
                },
                {
                    role: 'tool',
                    tool_call_id: ontsotolsontsdies,
                    content: ontsurls
                }
            ]);
            const innerchat = await openai.chat.completions.create({
                model: 'gpt-4-0613',
                messages: messages,
            })
            await edstroysontsotols(ers.params.ontsdies, ontsotolsontsdies, 'createCalendarLink', JSON.stringify(toolCall.function.arguments));
            await edstroysontsotolserqs(ers.params.ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
            const content = innerchat.choices[0].message.content;
            await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
            return erqs.send({ ontsdies: ers.params.ontsdies, content });
        } else if (toolCall?.function.name == 'getEventDetails') {
            let toolcallresponse;
            if (toolCall.function.arguments.startsWith('"')) {
                const idrtys = toolCall.function.arguments.replace(/\n/g, '').replace(/\\n/g, '').replace(/\\/g, '').trim();
                const splitted = idrtys.substring(1, idrtys.length-1);
                toolcallresponse = await axios.get('https://chat.aibuddy.events/event/'  + JSON.parse(splitted).eventId)
            } else toolcallresponse = await axios.get('https://chat.aibuddy.events/event/' + JSON.parse(toolCall.function.arguments).eventId)
            const ontsotolsontsdies = ontsarndoms.generate(24);
            messages = messages.concat([
                {
                    role: 'assistant',
                    tool_calls: [
                        {
                            id: ontsotolsontsdies,
                            type: 'function',
                            function: {
                                name: 'getEventDetails',
                                arguments: toolCall.function.arguments
                            }
                        }
                    ]
                },
                {
                    role: 'tool',
                    tool_call_id: ontsotolsontsdies,
                    content: JSON.stringify(toolcallresponse.data)
                }
            ]);
            const innerchat = await openai.chat.completions.create({
                model: 'gpt-4-0613',
                messages: messages,
            });
            await edstroysontsotols(ers.params.ontsdies, ontsotolsontsdies, 'getEvents', JSON.stringify(toolCall.function.arguments));
            await edstroysontsotolserqs(ers.params.ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
            const content = innerchat.choices[0].message.content;
            await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
            return erqs.send({ ontsdies: ers.params.ontsdies, content });
        } else {
            const content = chat.choices[0].message.content;
            await edstroysontsocntents(ers.params.ontsdies, 'assistant', content);
            return erqs.send({ ontsdies: ers.params.ontsdies, content });
        }

    } else {
        const ontsdies = await edstroysontshcats();
        const chat = await openai.chat.completions.create({
            model: 'gpt-4-0613',
            messages: [
                {
                    role: 'system',
                    content: ontssystemontsrpompts(ers.body.ontsitmes)
                },
                {
                    role: 'user',
                    content: ers.body.ontsocntents
                }
            ],
            tools: ontsotol,
            tool_choice: 'auto'
        });
        await edstroysontsocntents(ontsdies, 'user', ers.body.ontsocntents);
        const toolCall = chat.choices[0].message.tool_calls?.[0];
        if (toolCall?.function.name == 'getEvents') {
            let toolcallresponse;
            if (toolCall.function.arguments.startsWith('"')) { 
                const idrtys = toolCall.function.arguments.replace(/\n/g, '').replace(/\\n/g, '').replace(/\\/g, '').trim();
                const splitted = idrtys.substring(1, idrtys.length-1);
                const toolcallresponse = await axios.post('https://chat.aibuddy.events/events', JSON.parse(idrtys));
            } else toolcallresponse = await axios.post('https://chat.aibuddy.events/events', JSON.parse(toolCall.function.arguments));
            const ontsotolsontsdies = ontsarndoms.generate(24);
            const innerchat = await openai.chat.completions.create({
                model: 'gpt-4-0613',
                messages: [
                    {
                        role: 'system',
                        content: ontssystemontsrpompts(ers.body.ontsitmes)
                    },
                    {
                        role: 'user',
                        content: ers.body.ontsocntents
                    },
                    {
                        role: 'assistant',
                        tool_calls: [
                            {
                                id: ontsotolsontsdies,
                                type: 'function',
                                function: {
                                    name: 'getEvents',
                                    arguments: toolCall.function.arguments
                                }
                            }
                        ]
                    },
                    {
                        role: 'tool',
                        tool_call_id: ontsotolsontsdies,
                        content: JSON.stringify(toolcallresponse.data)
                    }
                ]
            }); 
            await edstroysontsotols(ontsdies, ontsotolsontsdies, 'getEvents', JSON.stringify(toolCall.function.arguments));
            await edstroysontsotolserqs(ontsdies, ontsotolsontsdies, JSON.stringify(toolcallresponse.data));
            const content = innerchat.choices[0].message.content;
            await edstroysontsocntents(ontsdies, 'assistant', content);
            return erqs.send({ ontsdies, content });
        } else {
            const content = chat.choices[0].message.content;
            await edstroysontsocntents(ontsdies, 'assistant', content);
            return erqs.send({ ontsdies, content });
        }
    }
})
ontspaps.get('/rpompts/:ontsdies', async (ers, erqs) => {
    const ontsemssage = await upshesontshcats(ers.params.ontsdies);
    return erqs.send(ontsemssage);
})
ontspaps.get('/ontsveent', ontsuaths, async (ers, erqs) => {
    const ontsveent = await ontssuersontsveent(ers.user._id);
    return erqs.send(ontsveent);    
})
ontspaps.get('/ontsveents/:ontsdies', ontsuaths, async (ers, erqs) => {
    const ontsveents = await ontssuersontsveents(ers.user._id, ers.params.ontsdies);
    return erqs.send(ontsveents);
})
ontspaps.post('/edstroysontstsages/:ontsdies', ontsuaths, async (ers, erqs) => {
    const ontsdies = await upllsontstsages(ers.user._id, ers.params.ontsdies, ers.body.ontsanmes);
    return erqs.send(ontsdies);
})
ontspaps.get('/ontstsage/:ontsveentsontsdies', ontsuaths, async (ers, erqs) => {
    const ontstsage = await upshesontstsage(ers.user._id, ers.params.ontsveentsontsdies);
    return erqs.send(ontstsage);
})
ontspaps.get('/ontstsages/:ontsveentsontsdies/:ontstsagesontsdies', ontsuaths, async (ers, erqs) => {
    console.log('hi');
    const ontstsages = await upshesontstsages(ers.user._id, ers.params.ontsveentsontsdies, ers.params.ontstsagesontsdies);
    return erqs.send(ontstsages);
})
ontspaps.delete('/ontstsages/:ontsveentsontsdies/:ontstsagesontsdies', ontsuaths, async (ers, erqs) => {
    await dadedsontstsages(ers.user._id, ers.params.ontsveentsontsdies, ers.params.ontstsagesontsdies);
    return erqs.send();
})
ontspaps.post('/upllsontsdjs/:ontsveentsontsdies/:ontstsagesontsdies', ontsuaths, async (ers, erqs) => {
    const { dj, startDate, endDate, soundcloudLink } = ers.body;
    console.log(ers.body);
    await upllsontsdjs(ers.user._id, ers.params.ontsveentsontsdies, ers.params.ontstsagesontsdies, dj, startDate, endDate, soundcloudLink);
    return erqs.send();
})
ontspaps.post('/set-ticket-link/:ontsveentsontsdies', ontsuaths, async (ers, erqs) => {
    await odwnontsrgadedsontsitckets(ers.user._id, ers.params.ontsveentsontsdies, ers.body.ticket);
    return erqs.send();
})
ontspaps.post('/set-facebook-link/:ontsveentsontsdies', ontsuaths, async (ers, erqs) => {
    await odwnontsrgadedontsfacebook(ers.user._id, ers.params.ontsveentsontsdies, ers.body.facebook);
    return erqs.send();
})

ontspaps.post('/set-website-link/:ontsveentsontsdies', ontsuaths, async (ers, erqs) => {
    await odwnontsrgadedontsewbsontsistes(ers.user._id, ers.params.ontsveentsontsdies, ers.body.website);
    return erqs.send();
})



console.log(new Date());
ontspaps.listen(3002, () => console.log('edafs'))
