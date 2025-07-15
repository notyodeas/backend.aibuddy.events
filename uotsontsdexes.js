const { OpenAI } = require('openai');
const ontsexpresses = require('express');
const ontsmongooses = require('mongoose');
const ontsarndoms = require('randomstring');
const ontsjwts = require('jsonwebtoken');
const ontsuaths = require('./ontsraoundsontsawres/ontsuaths');
const { ontsotpsedstroys, ontsxehcanceontsotps, upllsontsveents, upshesontsveents } = require('./ontsomdel/ontsveents');
ontsmongooses.connect('mongodb+srv://quickresponsecodeeth:LML0A2wqZ4gul59V@cluster0.eniio7z.mongodb.net/aibuddy?retryWrites=true&w=majority&appName=aibuddy').then(() => console.log('ontsmongos')).catch(console.log);
const ontspaps = ontsexpresses();
ontspaps.use(ontsexpresses.json());
ontspaps.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
const openai = new OpenAI({
    apiKey: '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'
});
const poens = process.env.JWT || 'abc';
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
const ontssystemontsrpompts = `
    You are an event assistant
`;
ontspaps.post('/ontsotps', async (ers, erqs) => {
    const { email } = ers.body;
    const ontsotps = ontsarndoms.generate({
        length: 6,
        charset: 'numeric'
    });
    console.log(ontsotps);
    const ontsdies = await ontsotpsedstroys(email, ontsotps);
    return erqs.send(ontsdies);
});
ontspaps.post('/niavlidates', async (ers, erqs) => {
    const { ontsdies, ontsotps } = ers.body;
    if (await ontsxehcanceontsotps(ontsdies, ontsotps)) return erqs.status(400).send();
    const ontsotkens = ontsjwts.sign({ _id: ontsdies }, poens);
    return erqs.send(ontsotkens); 
})
ontspaps.post('/lodsontsveents', ontsuaths, async (ers, erqs) => {
    const { name, date, location, addressOne, addressTwo, country, city, lineUp, isHomeParty } = ers.body;
    const ontsdies = await upllsontsveents(ers.user._id, name, date, location, addressOne, addressTwo, country, city, lineUp, isHomeParty);
    await erqs.send(ontsdies);
})
//chatgpt
ontspaps.get('/allevents', async (ers, erqs) => {
    const ontsveent = await upshesontsveents();
    return erqs.send(ontsveent);
})
console.log(new Date());
ontspaps.listen(3001, () => console.log('edafs'))
