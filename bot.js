import express from "express";
import bodyParser from "body-parser";
import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} from "discord.js";

const app = express();
app.use(bodyParser.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Message, Partials.Channel],
});

app.post("/form", async (req, res) => {
  try {
    const formData = req.body.content || "No form data";
    const channel = await client.channels.fetch(CHANNEL_ID);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accept").setLabel("✅ Accept").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("deny").setLabel("❌ Deny").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("onhold").setLabel("⏸ On Hold").setStyle(ButtonStyle.Secondary)
    );

    await channel.send({
      embeds: [{ title: "📩 New Google Form Response", description: formData, color: 0x3498db }],
      components: [buttons],
    });

    res.status(200).send("Form sent ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error ❌");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  const colors = { accept: 0x00ff00, deny: 0xff0000, onhold: 0xffff00 };
  const labels = { accept: "✅ Accepted", deny: "❌ Denied", onhold: "⏸ On Hold" };

  await interaction.update({
    embeds: [{
      title: "📩 Form Response",
      description: interaction.message.embeds[0].description,
      color: colors[interaction.customId],
      footer: { text: labels[interaction.customId] },
    }],
    components: [],
  });
});

client.once("ready", () => console.log(`🤖 Logged in as ${client.user.tag}`));
client.login(DISCORD_TOKEN);

app.listen(PORT, () => console.log(`🌐 Running on port ${PORT}`));
