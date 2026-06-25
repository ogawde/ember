export function extractMentionedUserIds(text: string): string[] {
  const mentionRegex = /<@([A-Z0-9]+)>/g
  const ids: string[] = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    ids.push(match[1])
  }
  return [...new Set(ids)]
}

export function mapChannelType(
  channelType?: string
): 'public' | 'private' | 'dm' | 'group_dm' {
  switch (channelType) {
    case 'channel':
      return 'public'
    case 'group':
      return 'private'
    case 'im':
      return 'dm'
    case 'mpim':
      return 'group_dm'
    default:
      return 'public'
  }
}
