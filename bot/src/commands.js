import {
  MessageFlags,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { collectChannelMessages, summarizeMessages } from './summaries.js';
import { REPLY_ONLY_MENTIONS, parseDuration, splitDiscordMessage } from './utils.js';

const commandBuilders = [
  new SlashCommandBuilder()
    .setName('ai-model')
    .setDescription('查看或切換 AI 模型')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('從 AI 服務目前提供的模型中選擇')
        .setAutocomplete(true),
    ),
  new SlashCommandBuilder()
    .setName('ai-summary')
    .setDescription('整理目前頻道指定期間內的對話')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option
        .setName('period')
        .setDescription('例如 30m、2h、7d，最長 30 天')
        .setRequired(true),
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('只整理這位使用者的發言'),
    )
    .addIntegerOption((option) =>
      option
        .setName('max_messages')
        .setDescription('最多整理幾則訊息')
        .setMinValue(10)
        .setMaxValue(500),
    ),
];

export const commandData = commandBuilders.map((command) => command.toJSON());

export async function registerCommands({ token, applicationId, guildId }) {
  const rest = new REST({ version: '10' }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(applicationId, guildId)
    : Routes.applicationCommands(applicationId);
  await rest.put(route, { body: commandData });
}

async function replyEphemeralChunks(interaction, content) {
  const chunks = splitDiscordMessage(content);
  await interaction.editReply({
    content: chunks[0],
    allowedMentions: REPLY_ONLY_MENTIONS,
  });
  for (const chunk of chunks.slice(1)) {
    await interaction.followUp({
      content: chunk,
      flags: MessageFlags.Ephemeral,
      allowedMentions: REPLY_ONLY_MENTIONS,
    });
  }
}

export async function handleAutocomplete(interaction, ai) {
  if (interaction.commandName !== 'ai-model') return;
  try {
    const focused = interaction.options.getFocused().toLowerCase();
    const models = await ai.listModels();
    const choices = models
      .filter((model) => model.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((model) => ({ name: model.slice(0, 100), value: model.slice(0, 100) }));
    await interaction.respond(choices);
  } catch {
    await interaction.respond([]).catch(() => {});
  }
}

export async function handleModelCommand(interaction, ai) {
  if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: '需要「管理伺服器」權限才能使用這個指令。', flags: MessageFlags.Ephemeral, allowedMentions: REPLY_ONLY_MENTIONS });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const requestedModel = interaction.options.getString('model');

  if (requestedModel) {
    const selected = await ai.selectModel(requestedModel);
    await interaction.editReply({ content: `已將 AI 模型切換為 \`${selected}\`。重新啟動後會回到環境變數設定的預設模型。`, allowedMentions: REPLY_ONLY_MENTIONS });
    return;
  }

  const [selected, models] = await Promise.all([ai.getSelectedModel(), ai.listModels()]);
  await interaction.editReply({ content: `目前模型：\`${selected}\`\n可用文字對話模型：${models.length} 個`, allowedMentions: REPLY_ONLY_MENTIONS });
}

export async function handleSummaryCommand(interaction, ai, { defaultMaxMessages = 300 } = {}) {
  if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({ content: '需要「管理訊息」權限才能使用這個指令。', flags: MessageFlags.Ephemeral, allowedMentions: REPLY_ONLY_MENTIONS });
    return;
  }

  if (!interaction.channel?.isTextBased() || !interaction.channel.messages) {
    await interaction.reply({ content: '這個指令只能在可讀取訊息記錄的文字頻道使用。', flags: MessageFlags.Ephemeral, allowedMentions: REPLY_ONLY_MENTIONS });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const periodInput = interaction.options.getString('period', true);
  const duration = parseDuration(periodInput);
  const user = interaction.options.getUser('user');
  const maxMessages = interaction.options.getInteger('max_messages') || defaultMaxMessages;
  const until = Date.now();
  const since = until - duration;

  const result = await collectChannelMessages(interaction.channel, {
    since,
    until,
    userId: user?.id,
    limit: maxMessages,
  });

  if (!result.messages.length) {
    await interaction.editReply({ content: '指定範圍內沒有可整理的訊息。', allowedMentions: REPLY_ONLY_MENTIONS });
    return;
  }

  const periodLabel = `${periodInput}（<t:${Math.floor(since / 1000)}:f> 至今）`;
  const summary = await summarizeMessages(ai, result.messages, {
    periodLabel,
    userLabel: user?.globalName || user?.username,
  });
  const truncatedNote = result.truncated ? '，已達訊息上限，摘要以最近的訊息為主' : '';
  const heading = `**AI 對話摘要**\n範圍：${periodLabel}${user ? `\n使用者：${user}` : ''}\n共整理 ${result.messages.length} 則訊息${truncatedNote}\n\n`;
  await replyEphemeralChunks(interaction, `${heading}${summary}`);
}
