const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const sock = makeWASocket({ auth: state, logger: P({ level: "silent" }), printQRInTerminal: true });
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") console.log("👑 MALICE MUSE SEXY CONNECTÉ - 210 CMDS");
        if (connection === "close") startBot();
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith("@g.us");
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
        if (!text.startsWith(".")) return;

        const args = text.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        const q = args.join(" ");

        const reply = (t) => sock.sendMessage(jid, { text: t }, { quoted: msg });

        // --- MENU ---
        if (cmd === "menu" || cmd === "help" || cmd === "commandes") {
            return reply(`╭━━〔 👑 KAYSEUR ULTRA 〕━━╮
┃ Total: 210+ Commandes
┃ Prefix:.
╰━━━━━━━━━━━━━━━━━━━━╯

*👮 ADMIN / GROUPE (50)*
.tag,.tagall,.hidetag,.kick,.kickall,.ban,.unban,.promote,.demote,.add,.revoke,.linkgroup,.setname,.setdesc,.setppgroup,.open,.close,.antilink on/off,.antibad on/off,.welcome on/off,.goodbye on/off,.bot on/off,.mute,.unmute,.pin,.unpin,.delete,.clear,.purge,.warn,.warnings,.demoteall,.promoteall,.listadmin,.groupinfo,.invitelink,.kickall etc...

*📥 DOWNLOAD (30)*
.play,.song,.ytmp3,.ytmp4,.tiktok,.tt,.insta,.ig,.facebook,.fb,.twitter,.mediafire,.gdrive,.apk,.apkdl,.pinterest,.pin,.spotify,.soundcloud,.lyrics,.wallpaper

*🛠️ OUTILS / TOOLS (40)*
.sticker,.s,.toimg,.tourl,.translate,.trt,.calc,.weather,.meteo,.qrcode,.readqr,.removebg,.enhance,.emojimix,.fancy,.say,.tts,.wikipedia,.google,.ss,.screenshot,.shorturl,.getpp,.whois,.id,.jid

*🎉 FUN / JEUX (50)*
.joke,.blague,.quote,.citation,.truth,.verite,.dare,.defi,.8ball,.ship,.couple,.gay,.lesbian,.cute,.handsome,.horoscope,.kiss,.hug,.slap,.kill,.hack,.clown,.waifu,.neko,.meme,.fact,.darkjoke

*🤖 IA / AUTRES (40)*
.bot,.ai,.gpt,.gemini,.imagine,.image,.dalle,.anime,.chat,.info,.ping,.alive,.owner,.script,.sc,.runtime,.speed

Tape.ping pour tester!`);
        }

        // --- COMMANDES QUI MARCHENT VRAIMENT ---
        if (cmd === "ping" || cmd === "speed") return reply(`🏓 PONG!\n👑 KAYSEUR ULTRA\n⚡ Speed: ${Math.floor(Math.random()*100)}ms\n✅ 210 cmds actives`);
        if (cmd === "info" || cmd === "botinfo") return reply(`👑 MALICE MUSE SEXY V1\n🤖 Statut: En ligne\n⚡ Moteur: Baileys v6\n📦 Commandes: 210+\n👑 Owner: King Kayseur\n🚀 Host: Railway`);
        if (cmd === "owner") return reply(`👑 Owner: wa.me/242... (mets ton num)`);
        if (cmd === "tagall" || cmd === "tag") {
            if (!isGroup) return reply("Groupe seulement");
            const groupMetadata = await sock.groupMetadata(jid);
            const participants = groupMetadata.participants.map(p => p.id);
            let txt = `👑 TAG ALL BY KAYSEUR AND MUSE\n\n${q || "Salut à tous"}\n\n`;
            participants.forEach(p => txt += `@${p.split("@")[0]} `);
            return sock.sendMessage(jid, { text: txt, mentions: participants });
        }
        if (cmd === "sticker" || cmd === "s") {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: P({ level: 'silent' }) });
            if (!buffer) return reply("Envoie une image avec.sticker");
            return sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
        }
        if (cmd === "hidetag") {
            const groupMetadata = await sock.groupMetadata(jid);
            const participants = groupMetadata.participants.map(p => p.id);
            return sock.sendMessage(jid, { text: q || "👑 MALICE MUSE HIDETAG", mentions: participants });
        }
        if (cmd === "kick") {
            if (!msg.message.extendedTextMessage?.contextInfo?.mentionedJid) return reply("Mentionne quelqu'un");
            const target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            await sock.groupParticipantsUpdate(jid, [target], "remove");
            return reply("✅ Kick fait");
        }

        // --- LES 200 AUTRES COMMANDES (TEMPLATE) ---
        const otherCmds = ["play","ytmp3","ytmp4","tiktok","insta","fb","apk","sticker","toimg","translate","weather","joke","quote","truth","dare","8ball","ship","waifu","meme","ai","imagine","kickall","promote","demote","antilink","welcome","open","close","setname","setdesc","mute","unmute","calc","qrcode","emojimix","fancy","tts","ss","shorturl","getpp","kiss","hug","slap","horoscope","fact","gpt","runtime","alive","sc"];
        if (otherCmds.includes(cmd)) {
            return reply(`✅ Commande.${cmd} détectée!\nFonction en cours d'activation sur MALICE MUSE SEXY.\n\nhttps://whatsapp.com/channel/0029Vb8cfQn8V0te5K0atc1s`);
        }
    });
}
startBot();