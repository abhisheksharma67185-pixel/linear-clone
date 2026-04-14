// ---------------------------------------------------------------------------
// CESS Benchmark Seed Data — Slack (Theta HQ workspace)
// Anchor date: 2026-04-13 (benchmark day)
// Identity IDs are internal (usr-N, ch-N, msg-N). Display values match the
// CESS spec exactly. Names/emails align with Linear seed so cross-site
// retrieval tasks line up on the same people.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  [key: string]: unknown;
  id: string;
  cessId: string;
  name: string;
  displayName: string;
  email: string;
  avatar: string;
  title: string;
  timezone: string;
  status: { emoji: string; text: string; expiresAt: string | null };
  presence: "active" | "away" | "offline" | "dnd";
  role: "owner" | "admin" | "member" | "guest";
  isBot?: boolean;
}

export interface Channel {
  [key: string]: unknown;
  id: string;
  name: string;
  topic: string;
  purpose: string;
  type: "public" | "private";
  isGeneral: boolean;
  isArchived: boolean;
  isShared: boolean;
  createdAt: string;
  createdBy: string;
  memberIds: string[];
  pinnedMessageIds: string[];
  bookmarkIds: string[];
  canvasId: string | null;
  listIds: string[];
  workflowIds: string[];
  postingPermission: "all" | "admins" | "owners";
  huddleActive: boolean;
}

export interface DirectMessage {
  [key: string]: unknown;
  id: string;
  participantIds: string[];
  createdAt: string;
  isGroup: boolean;
  name: string | null;
  lastMessageAt: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface MessageBlock {
  type: "rich_text" | "code" | "quote" | "divider";
  text: string;
}

export interface Attachment {
  id: string;
  type: "file" | "image" | "link";
  name: string;
  url: string;
  size?: number;
}

export interface Message {
  [key: string]: unknown;
  id: string;
  channelId: string | null;
  dmId: string | null;
  threadRootId: string | null;
  threadReplyCount: number;
  threadParticipantIds: string[];
  authorId: string;
  text: string;
  blocks: MessageBlock[];
  mentions: string[];
  reactions: Reaction[];
  attachments: Attachment[];
  createdAt: string;
  editedAt: string | null;
  isDeleted: boolean;
  pinnedBy: string | null;
  isSaved: boolean;
  broadcastToChannel: boolean;
  scheduledFor: string | null;
}

export interface Notification {
  [key: string]: unknown;
  id: string;
  type:
    | "mention"
    | "dm"
    | "thread_reply"
    | "keyword"
    | "channel_invite"
    | "reaction"
    | "huddle_invite";
  userId: string;
  channelId: string | null;
  dmId: string | null;
  messageId: string;
  read: boolean;
  createdAt: string;
}

export interface ReadState {
  [key: string]: unknown;
  id: string;
  userId: string;
  channelId: string | null;
  dmId: string | null;
  lastReadMessageId: string | null;
  unreadCount: number;
  unreadMentions: number;
}

export interface UserGroup {
  [key: string]: unknown;
  id: string;
  handle: string;
  name: string;
  description: string;
  memberIds: string[];
  isEnabled: boolean;
}

export interface SavedItem {
  [key: string]: unknown;
  id: string;
  userId: string;
  messageId: string;
  reminder: string | null;
  createdAt: string;
  isCompleted: boolean;
}

export interface Bookmark {
  [key: string]: unknown;
  id: string;
  channelId: string;
  title: string;
  url: string;
  emoji: string;
  createdBy: string;
  createdAt: string;
}

export interface Canvas {
  [key: string]: unknown;
  id: string;
  channelId: string | null;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListField {
  id: string;
  name: string;
  type: "text" | "number" | "status" | "user" | "date";
}

export interface ListItem {
  id: string;
  values: Record<string, unknown>;
}

export interface SlackList {
  [key: string]: unknown;
  id: string;
  channelId: string | null;
  name: string;
  fields: ListField[];
  items: ListItem[];
  createdBy: string;
  createdAt: string;
}

export interface Workflow {
  [key: string]: unknown;
  id: string;
  channelId: string | null;
  name: string;
  trigger: "slash" | "shortcut" | "schedule" | "new_channel_member";
  isEnabled: boolean;
  runCount: number;
  lastRunAt: string | null;
}

export interface Huddle {
  [key: string]: unknown;
  id: string;
  channelId: string | null;
  dmId: string | null;
  startedBy: string;
  startedAt: string;
  endedAt: string | null;
  participantIds: string[];
  topic: string;
}

export interface Call {
  [key: string]: unknown;
  id: string;
  type: "huddle" | "slack_call";
  startedAt: string;
  endedAt: string;
  participantIds: string[];
  channelId: string | null;
  dmId: string | null;
}

export interface Preferences {
  [key: string]: unknown;
  theme:
    | "aubergine"
    | "dark"
    | "hoth"
    | "monument"
    | "ochin"
    | "work"
    | "workhard"
    | "breezy";
  notifications: {
    desktop: "all" | "mentions" | "nothing";
    mobile: "all" | "mentions" | "nothing";
    dnd: { enabled: boolean; start: string; end: string };
    sound: string;
  };
  sidebar: {
    showUnreadOnly: boolean;
    showProfilePhotos: boolean;
    listMode: "compact" | "clean";
  };
  language: string;
  timezone: string;
  keyboardShortcuts: boolean;
  markAsReadOnEnter: boolean;
}

// ---------------------------------------------------------------------------
// Workspace (singleton)
// ---------------------------------------------------------------------------

export const workspace = {
  id: "ws-1",
  name: "Theta HQ",
  urlKey: "theta",
  domain: "theta.slack.com",
  iconColor: "#4A154B",
  plan: "business+",
  createdAt: "2024-01-10T09:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Preferences (singleton for viewer usr-1)
// ---------------------------------------------------------------------------

export const preferences: Preferences = {
  theme: "aubergine",
  notifications: {
    desktop: "mentions",
    mobile: "mentions",
    dnd: { enabled: true, start: "22:00", end: "07:00" },
    sound: "ding",
  },
  sidebar: {
    showUnreadOnly: false,
    showProfilePhotos: true,
    listMode: "clean",
  },
  language: "en-US",
  timezone: "Asia/Kolkata",
  keyboardShortcuts: true,
  markAsReadOnEnter: true,
};

// ---------------------------------------------------------------------------
// Users — names aligned with Linear seed; usr-1 Priya is the viewer/owner
// ---------------------------------------------------------------------------

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const users: User[] = [
  {
    id: "usr-1",
    cessId: "SU001",
    name: "Priya Sharma",
    displayName: "priya",
    email: "priya@theta.internal",
    avatar: avatar("priya"),
    title: "Head of Platform",
    timezone: "Asia/Kolkata",
    status: { emoji: ":headphones:", text: "In deep work", expiresAt: null },
    presence: "active",
    role: "owner",
  },
  {
    id: "usr-2",
    cessId: "SU002",
    name: "Arjun Patel",
    displayName: "arjun",
    email: "arjun@theta.internal",
    avatar: avatar("arjun"),
    title: "Staff Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "admin",
  },
  {
    id: "usr-3",
    cessId: "SU003",
    name: "Ravi Kumar",
    displayName: "ravi",
    email: "ravi@theta.internal",
    avatar: avatar("ravi"),
    title: "Senior Backend Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "member",
  },
  {
    id: "usr-4",
    cessId: "SU004",
    name: "Sneha Iyer",
    displayName: "sneha",
    email: "sneha@theta.internal",
    avatar: avatar("sneha"),
    title: "Design Lead",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "admin",
  },
  {
    id: "usr-5",
    cessId: "SU005",
    name: "Kiran Menon",
    displayName: "kiran",
    email: "kiran@theta.internal",
    avatar: avatar("kiran"),
    title: "Frontend Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "member",
  },
  {
    id: "usr-6",
    cessId: "SU006",
    name: "Ananya Gupta",
    displayName: "ananya",
    email: "ananya@theta.internal",
    avatar: avatar("ananya"),
    title: "Senior Designer",
    timezone: "Asia/Kolkata",
    status: {
      emoji: ":palm_tree:",
      text: "On vacation until Monday",
      expiresAt: "2026-04-20T09:00:00.000Z",
    },
    presence: "away",
    role: "member",
  },
  {
    id: "usr-7",
    cessId: "SU007",
    name: "Vikram Singh",
    displayName: "vikram",
    email: "vikram@theta.internal",
    avatar: avatar("vikram"),
    title: "Engineering Manager",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "admin",
  },
  {
    id: "usr-8",
    cessId: "SU008",
    name: "Meera Nair",
    displayName: "meera",
    email: "meera@theta.internal",
    avatar: avatar("meera"),
    title: "Product Manager",
    timezone: "Asia/Kolkata",
    status: {
      emoji: ":house_with_garden:",
      text: "Working from home",
      expiresAt: null,
    },
    presence: "active",
    role: "member",
  },
  {
    id: "usr-9",
    cessId: "SU009",
    name: "Amit Desai",
    displayName: "amit",
    email: "amit@theta.internal",
    avatar: avatar("amit"),
    title: "Infrastructure Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "dnd",
    role: "member",
  },
  {
    id: "usr-10",
    cessId: "SU010",
    name: "Lakshmi Rao",
    displayName: "lakshmi",
    email: "lakshmi@theta.internal",
    avatar: avatar("lakshmi"),
    title: "Visual Designer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "away",
    role: "member",
  },
  {
    id: "usr-11",
    cessId: "SU011",
    name: "Aisha Khan",
    displayName: "aisha",
    email: "aisha@theta.internal",
    avatar: avatar("aisha"),
    title: "Security Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "member",
  },
  {
    id: "usr-12",
    cessId: "SU012",
    name: "Nikhil Reddy",
    displayName: "nikhil",
    email: "nikhil@theta.internal",
    avatar: avatar("nikhil"),
    title: "Data Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "offline",
    role: "member",
  },
  {
    id: "usr-13",
    cessId: "SU013",
    name: "Sanjay Verma",
    displayName: "sanjay",
    email: "sanjay@theta.internal",
    avatar: avatar("sanjay"),
    title: "Legal Counsel",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "member",
  },
  {
    id: "usr-14",
    cessId: "SU014",
    name: "Thomas Joseph",
    displayName: "thomas",
    email: "thomas@theta.internal",
    avatar: avatar("thomas"),
    title: "SRE",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "dnd",
    role: "member",
  },
  {
    id: "usr-15",
    cessId: "SU015",
    name: "Suresh Pillai",
    displayName: "suresh",
    email: "suresh@theta.internal",
    avatar: avatar("suresh"),
    title: "QA Engineer",
    timezone: "Asia/Kolkata",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "offline",
    role: "member",
  },
  {
    id: "usr-slackbot",
    cessId: "SU000",
    name: "Slackbot",
    displayName: "slackbot",
    email: "slackbot@theta.slack.com",
    avatar: avatar("slackbot"),
    title: "Workspace assistant",
    timezone: "UTC",
    status: { emoji: "", text: "", expiresAt: null },
    presence: "active",
    role: "member",
    isBot: true,
  },
];

const ALL_IDS = users.map((u) => u.id);

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export const channels: Channel[] = [
  {
    id: "ch-1",
    name: "general",
    topic: "Company-wide announcements and work-based matters",
    purpose: "This channel is for team-wide communication and announcements. All team members are included.",
    type: "public",
    isGeneral: true,
    isArchived: false,
    isShared: false,
    createdAt: "2024-01-10T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ALL_IDS,
    pinnedMessageIds: ["msg-3", "msg-7"],
    bookmarkIds: [],
    canvasId: "canvas-1",
    listIds: [],
    workflowIds: ["wf-1"],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-2",
    name: "random",
    topic: "Non-work banter and water cooler conversation",
    purpose: "A place for non-work-related flimflam, faffing, hodge-podge or jibber-jabber.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-01-10T09:05:00.000Z",
    createdBy: "usr-1",
    memberIds: ALL_IDS,
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-3",
    name: "announcements",
    topic: "Official company announcements",
    purpose: "Only admins can post. Everyone receives updates.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-02-01T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ALL_IDS,
    pinnedMessageIds: ["msg-44"],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "admins",
    huddleActive: false,
  },
  {
    id: "ch-4",
    name: "engineering",
    topic: "Engineering org discussions, PR reviews, and incident response",
    purpose: "All-hands engineering channel for the Theta engineering org.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-02-15T09:00:00.000Z",
    createdBy: "usr-2",
    memberIds: [
      "usr-1",
      "usr-2",
      "usr-3",
      "usr-5",
      "usr-7",
      "usr-9",
      "usr-11",
      "usr-12",
      "usr-14",
      "usr-15",
      "usr-slackbot",
    ],
    pinnedMessageIds: ["msg-41"],
    bookmarkIds: ["bk-1", "bk-2", "bk-3"],
    canvasId: "canvas-2",
    listIds: ["list-1"],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-5",
    name: "design",
    topic: "Design system, mockups, and reviews",
    purpose: "Design org collaboration space.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-01T10:00:00.000Z",
    createdBy: "usr-4",
    memberIds: ["usr-1", "usr-4", "usr-6", "usr-8", "usr-10", "usr-slackbot"],
    pinnedMessageIds: [],
    bookmarkIds: ["bk-4", "bk-5"],
    canvasId: "canvas-4",
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-6",
    name: "product",
    topic: "Roadmap, OKRs, and prioritization",
    purpose: "Product management hub.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-10T10:00:00.000Z",
    createdBy: "usr-8",
    memberIds: [
      "usr-1",
      "usr-2",
      "usr-4",
      "usr-6",
      "usr-7",
      "usr-8",
      "usr-11",
      "usr-slackbot",
    ],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: "canvas-3",
    listIds: ["list-2"],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-7",
    name: "platform-team",
    topic: "Platform team daily sync",
    purpose: "Platform engineering team squad channel.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-15T10:00:00.000Z",
    createdBy: "usr-1",
    memberIds: [
      "usr-1",
      "usr-2",
      "usr-3",
      "usr-5",
      "usr-7",
      "usr-9",
      "usr-11",
      "usr-14",
      "usr-slackbot",
    ],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: ["wf-2"],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-8",
    name: "frontend-team",
    topic: "Frontend squad",
    purpose: "UI, state, and design-system work.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-15T10:10:00.000Z",
    createdBy: "usr-5",
    memberIds: ["usr-4", "usr-5", "usr-8", "usr-10", "usr-slackbot"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-9",
    name: "infra-team",
    topic: "Infrastructure squad",
    purpose: "Compute, network, storage, and observability.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-15T10:15:00.000Z",
    createdBy: "usr-9",
    memberIds: ["usr-9", "usr-11", "usr-12", "usr-14", "usr-slackbot"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-10",
    name: "legal-team",
    topic: "Legal, compliance, and vendor review",
    purpose: "Legal squad channel.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-20T10:00:00.000Z",
    createdBy: "usr-13",
    memberIds: ["usr-1", "usr-8", "usr-13", "usr-slackbot"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-11",
    name: "help-desk",
    topic: "Ask questions, share answers",
    purpose: "Internal Q&A and support channel.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-04-01T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ALL_IDS,
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-12",
    name: "incidents",
    topic: "Active incidents and postmortems",
    purpose: "Incident response coordination.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-04-05T09:00:00.000Z",
    createdBy: "usr-7",
    memberIds: [
      "usr-1",
      "usr-2",
      "usr-3",
      "usr-7",
      "usr-9",
      "usr-11",
      "usr-14",
      "usr-slackbot",
    ],
    pinnedMessageIds: ["msg-60"],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: ["wf-3"],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-13",
    name: "hiring",
    topic: "Hiring pipeline and interview panels",
    purpose: "Talent and recruiting channel.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-04-08T09:00:00.000Z",
    createdBy: "usr-7",
    memberIds: ["usr-1", "usr-2", "usr-4", "usr-7", "usr-8", "usr-slackbot"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-14",
    name: "social",
    topic: "Team events and celebrations",
    purpose: "Plan team lunches, offsites, and celebrations.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-04-10T09:00:00.000Z",
    createdBy: "usr-6",
    memberIds: ALL_IDS,
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-15",
    name: "exec-private",
    topic: "Executive staff coordination",
    purpose: "Private channel for exec team.",
    type: "private",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-02-01T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ["usr-1", "usr-2", "usr-7"],
    pinnedMessageIds: ["msg-82"],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-16",
    name: "hiring-exec-private",
    topic: "Senior hiring committee",
    purpose: "Private exec hiring committee.",
    type: "private",
    isGeneral: false,
    isArchived: false,
    isShared: false,
    createdAt: "2024-03-01T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ["usr-1", "usr-2", "usr-4", "usr-7"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-17",
    name: "archived-launch",
    topic: "v1 launch coordination (archived)",
    purpose: "Archived — originally the v1 launch channel.",
    type: "public",
    isGeneral: false,
    isArchived: true,
    isShared: false,
    createdAt: "2023-11-01T09:00:00.000Z",
    createdBy: "usr-1",
    memberIds: ["usr-1", "usr-2", "usr-4", "usr-7", "usr-8"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
  {
    id: "ch-18",
    name: "theta-external-connect",
    topic: "Slack Connect with Quantum Partners",
    purpose: "External Slack Connect shared channel with Quantum Partners Ltd.",
    type: "public",
    isGeneral: false,
    isArchived: false,
    isShared: true,
    createdAt: "2024-04-01T09:00:00.000Z",
    createdBy: "usr-7",
    memberIds: ["usr-1", "usr-2", "usr-7", "usr-13"],
    pinnedMessageIds: [],
    bookmarkIds: [],
    canvasId: null,
    listIds: [],
    workflowIds: [],
    postingPermission: "all",
    huddleActive: false,
  },
];

// ---------------------------------------------------------------------------
// Direct Messages
// ---------------------------------------------------------------------------

export const directMessages: DirectMessage[] = [
  {
    id: "dm-1",
    participantIds: ["usr-1", "usr-2"],
    createdAt: "2024-04-01T09:00:00.000Z",
    isGroup: false,
    name: null,
    lastMessageAt: "2026-04-13T10:30:00.000Z",
  },
  {
    id: "dm-2",
    participantIds: ["usr-1", "usr-3"],
    createdAt: "2024-04-01T09:05:00.000Z",
    isGroup: false,
    name: null,
    lastMessageAt: "2026-04-13T11:00:00.000Z",
  },
  {
    id: "dm-3",
    participantIds: ["usr-1", "usr-4"],
    createdAt: "2024-04-01T09:10:00.000Z",
    isGroup: false,
    name: null,
    lastMessageAt: "2026-04-12T17:00:00.000Z",
  },
  {
    id: "dm-4",
    participantIds: ["usr-1", "usr-slackbot"],
    createdAt: "2024-01-10T09:00:00.000Z",
    isGroup: false,
    name: null,
    lastMessageAt: "2026-04-13T08:00:00.000Z",
  },
  {
    id: "dm-5",
    participantIds: ["usr-2", "usr-5"],
    createdAt: "2024-04-02T09:00:00.000Z",
    isGroup: false,
    name: null,
    lastMessageAt: "2026-04-12T18:00:00.000Z",
  },
  {
    id: "dm-6",
    participantIds: ["usr-1", "usr-2", "usr-3"],
    createdAt: "2024-04-05T09:00:00.000Z",
    isGroup: true,
    name: null,
    lastMessageAt: "2026-04-13T09:00:00.000Z",
  },
  {
    id: "dm-7",
    participantIds: ["usr-1", "usr-4", "usr-6", "usr-8"],
    createdAt: "2024-04-06T09:00:00.000Z",
    isGroup: true,
    name: null,
    lastMessageAt: "2026-04-12T16:00:00.000Z",
  },
  {
    id: "dm-8",
    participantIds: ["usr-1", "usr-7", "usr-9"],
    createdAt: "2024-04-07T09:00:00.000Z",
    isGroup: true,
    name: null,
    lastMessageAt: "2026-04-12T15:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Messages — ~150 across channels + DMs, with threads
// ---------------------------------------------------------------------------

const mkMsg = (
  id: string,
  fields: Partial<Message> & Pick<Message, "authorId" | "text">,
): Message => ({
  id,
  channelId: null,
  dmId: null,
  threadRootId: null,
  threadReplyCount: 0,
  threadParticipantIds: [],
  blocks: [{ type: "rich_text", text: fields.text }],
  mentions: [],
  reactions: [],
  attachments: [],
  createdAt: "2026-04-13T09:00:00.000Z",
  editedAt: null,
  isDeleted: false,
  pinnedBy: null,
  isSaved: false,
  broadcastToChannel: false,
  scheduledFor: null,
  ...fields,
});

export const messages: Message[] = [
  // #general (ch-1) — 14 msgs
  mkMsg("msg-1", { channelId: "ch-1", authorId: "usr-slackbot", text: "Welcome to Theta HQ! Please introduce yourself in #general.", createdAt: "2024-01-10T09:00:00.000Z" }),
  mkMsg("msg-2", { channelId: "ch-1", authorId: "usr-1", text: "Good morning everyone — welcome to our new Slack workspace!", createdAt: "2024-01-10T09:05:00.000Z" }),
  mkMsg("msg-3", { channelId: "ch-1", authorId: "usr-1", text: "Pinned: Our company all-hands happens every Tuesday at 10am IST. Calendar invite in #announcements.", createdAt: "2024-01-12T10:00:00.000Z", pinnedBy: "usr-1", reactions: [{ emoji: ":pushpin:", userIds: ["usr-2", "usr-4"] }] }),
  mkMsg("msg-4", { channelId: "ch-1", authorId: "usr-2", text: "New coffee machine on the 4th floor is live :coffee:", createdAt: "2026-04-12T09:00:00.000Z", reactions: [{ emoji: ":tada:", userIds: ["usr-3", "usr-4", "usr-5"] }] }),
  mkMsg("msg-5", { channelId: "ch-1", authorId: "usr-8", text: "Reminder: Q2 planning doc due by Friday. Link in #product.", createdAt: "2026-04-12T10:30:00.000Z" }),
  mkMsg("msg-6", { channelId: "ch-1", authorId: "usr-4", text: "Design system v2 is live! Check out the new components.", createdAt: "2026-04-12T11:00:00.000Z", reactions: [{ emoji: ":fire:", userIds: ["usr-1", "usr-5", "usr-10"] }] }),
  mkMsg("msg-7", { channelId: "ch-1", authorId: "usr-1", text: "Pinned: Onboarding canvas for new joiners is attached to this channel.", createdAt: "2026-04-12T11:30:00.000Z", pinnedBy: "usr-1" }),
  mkMsg("msg-8", { channelId: "ch-1", authorId: "usr-7", text: "Interview panels next week — please confirm availability in #hiring.", createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-9", { channelId: "ch-1", authorId: "usr-6", text: "Team lunch tomorrow at 1pm, 3rd floor kitchen.", createdAt: "2026-04-13T08:30:00.000Z", reactions: [{ emoji: ":pizza:", userIds: ["usr-2", "usr-5", "usr-8"] }] }),
  mkMsg("msg-10", { channelId: "ch-1", authorId: "usr-11", text: "Security training reminder — please complete by end of week.", mentions: ["usr-slackbot"], createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-11", { channelId: "ch-1", authorId: "usr-14", text: "Prod deploy window shifted to 3pm IST today.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-12", { channelId: "ch-1", authorId: "usr-1", text: "Welcome to the new hires joining this week! Please say hi.", createdAt: "2026-04-13T10:00:00.000Z", reactions: [{ emoji: ":wave:", userIds: ["usr-2", "usr-4", "usr-6", "usr-8", "usr-11"] }] }),
  mkMsg("msg-13", { channelId: "ch-1", authorId: "usr-13", text: "New vendor NDA template available in #legal-team.", createdAt: "2026-04-13T10:15:00.000Z" }),
  mkMsg("msg-14", { channelId: "ch-1", authorId: "usr-2", text: "FYI engineering all-hands postponed to next Thursday.", createdAt: "2026-04-13T10:30:00.000Z" }),

  // #random (ch-2) — 10 msgs
  mkMsg("msg-15", { channelId: "ch-2", authorId: "usr-5", text: "Anyone tried the new ramen place next to the office?", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-16", { channelId: "ch-2", authorId: "usr-8", text: "Yes! The tonkotsu is amazing.", createdAt: "2026-04-13T09:05:00.000Z", reactions: [{ emoji: ":ramen:", userIds: ["usr-5", "usr-6"] }] }),
  mkMsg("msg-17", { channelId: "ch-2", authorId: "usr-6", text: "Meme of the day :laughing:", createdAt: "2026-04-13T09:10:00.000Z" }),
  mkMsg("msg-18", { channelId: "ch-2", authorId: "usr-3", text: "Who's joining Friday coffee chat?", createdAt: "2026-04-13T09:15:00.000Z", reactions: [{ emoji: ":raised_hand:", userIds: ["usr-1", "usr-5", "usr-8"] }] }),
  mkMsg("msg-19", { channelId: "ch-2", authorId: "usr-10", text: "Just finished my first marathon :running:", createdAt: "2026-04-13T09:20:00.000Z", reactions: [{ emoji: ":tada:", userIds: ["usr-1", "usr-2", "usr-4", "usr-6", "usr-8"] }, { emoji: ":fire:", userIds: ["usr-3", "usr-5"] }] }),
  mkMsg("msg-20", { channelId: "ch-2", authorId: "usr-12", text: "TIL clickhouse has arrays as first-class types", createdAt: "2026-04-13T09:25:00.000Z" }),
  mkMsg("msg-21", { channelId: "ch-2", authorId: "usr-4", text: "New office plant arrived :herb:", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-22", { channelId: "ch-2", authorId: "usr-9", text: "Anyone up for lunch at noon?", createdAt: "2026-04-13T09:35:00.000Z" }),
  mkMsg("msg-23", { channelId: "ch-2", authorId: "usr-11", text: "Dog photos thread below :dog:", createdAt: "2026-04-13T09:40:00.000Z" }),
  mkMsg("msg-24", { channelId: "ch-2", authorId: "usr-15", text: "Team karaoke Friday anyone?", createdAt: "2026-04-13T09:45:00.000Z" }),

  // #announcements (ch-3) — 6 msgs
  mkMsg("msg-25", { channelId: "ch-3", authorId: "usr-1", text: "Q1 results are in — we exceeded our targets! Great work everyone.", createdAt: "2026-04-01T10:00:00.000Z", reactions: [{ emoji: ":tada:", userIds: ["usr-2", "usr-3", "usr-4", "usr-5", "usr-6", "usr-7", "usr-8"] }] }),
  mkMsg("msg-26", { channelId: "ch-3", authorId: "usr-7", text: "New office space confirmed for Bangalore — move-in June 1st.", createdAt: "2026-04-05T10:00:00.000Z" }),
  mkMsg("msg-27", { channelId: "ch-3", authorId: "usr-1", text: "Annual performance reviews begin next Monday.", createdAt: "2026-04-08T10:00:00.000Z" }),
  mkMsg("msg-28", { channelId: "ch-3", authorId: "usr-2", text: "Reminder: company holiday on Friday April 17th.", createdAt: "2026-04-10T10:00:00.000Z" }),
  mkMsg("msg-29", { channelId: "ch-3", authorId: "usr-4", text: "New brand guidelines coming this week — watch for updates.", createdAt: "2026-04-11T10:00:00.000Z" }),
  mkMsg("msg-30", { channelId: "ch-3", authorId: "usr-7", text: "Engineering hiring for 5 senior roles — refer your network.", createdAt: "2026-04-12T10:00:00.000Z" }),

  // #engineering (ch-4) — 18 msgs
  mkMsg("msg-31", { channelId: "ch-4", authorId: "usr-2", text: "PR for PLT-101 (OAuth2 PKCE flow) merged to main.", createdAt: "2026-04-11T09:00:00.000Z", reactions: [{ emoji: ":white_check_mark:", userIds: ["usr-1", "usr-3"] }] }),
  mkMsg("msg-32", { channelId: "ch-4", authorId: "usr-3", text: "PR for PLT-102 refresh token rotation ready for review.", mentions: ["usr-1", "usr-2"], createdAt: "2026-04-11T10:00:00.000Z" }),
  mkMsg("msg-33", { channelId: "ch-4", authorId: "usr-1", text: "LGTM on PLT-102, merging now.", createdAt: "2026-04-11T10:30:00.000Z" }),
  mkMsg("msg-34", { channelId: "ch-4", authorId: "usr-2", text: "Working on PLT-104 rate limiting today. Token-bucket approach.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-35", { channelId: "ch-4", authorId: "usr-5", text: "Frontend staging env deployed with new auth flow.", createdAt: "2026-04-12T09:30:00.000Z" }),
  mkMsg("msg-36", { channelId: "ch-4", authorId: "usr-11", text: "Security review scheduled for Thursday 2pm.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-37", { channelId: "ch-4", authorId: "usr-14", text: "Prod db migration completed, 2.4M rows updated.", createdAt: "2026-04-12T10:30:00.000Z", reactions: [{ emoji: ":fire:", userIds: ["usr-1", "usr-2", "usr-9"] }] }),
  mkMsg("msg-38", { channelId: "ch-4", authorId: "usr-9", text: "Cluster upgrade to 1.29 complete, zero downtime.", createdAt: "2026-04-12T11:00:00.000Z", reactions: [{ emoji: ":rocket:", userIds: ["usr-1", "usr-2", "usr-3", "usr-14"] }] }),
  mkMsg("msg-39", { channelId: "ch-4", authorId: "usr-12", text: "Analytics pipeline backfill done for last 6 months.", createdAt: "2026-04-12T11:30:00.000Z" }),
  mkMsg("msg-40", { channelId: "ch-4", authorId: "usr-15", text: "QA regression suite down to 12 min runtime :raised_hands:", createdAt: "2026-04-12T12:00:00.000Z", reactions: [{ emoji: ":raised_hands:", userIds: ["usr-1", "usr-5"] }] }),
  mkMsg("msg-41", { channelId: "ch-4", authorId: "usr-1", text: "Pinned runbook: https://runbooks.theta.internal/oncall", createdAt: "2026-04-12T12:30:00.000Z", pinnedBy: "usr-1" }),
  mkMsg("msg-42", { channelId: "ch-4", authorId: "usr-2", text: "Who's on call this week? I need a pair for a quick debug.", mentions: ["usr-3"], createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-43", { channelId: "ch-4", authorId: "usr-3", text: "I'm on call. Joining now.", createdAt: "2026-04-12T14:01:00.000Z" }),
  mkMsg("msg-44", { channelId: "ch-4", authorId: "usr-1", text: "Team, we shipped v2.3.0 :rocket: congrats everyone!", createdAt: "2026-04-12T17:00:00.000Z", reactions: [{ emoji: ":+1:", userIds: ["usr-2", "usr-3", "usr-5", "usr-9", "usr-14"] }, { emoji: ":rocket:", userIds: ["usr-2", "usr-3", "usr-11"] }, { emoji: ":tada:", userIds: ["usr-5", "usr-15"] }] }),
  mkMsg("msg-45", { channelId: "ch-4", authorId: "usr-5", text: "Error rate dropped 40% after the rate-limit fix. Great work @arjun.", mentions: ["usr-2"], createdAt: "2026-04-13T08:30:00.000Z" }),
  mkMsg("msg-46", { channelId: "ch-4", authorId: "usr-7", text: "Sprint review Friday at 2pm, please come prepared.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-47", { channelId: "ch-4", authorId: "usr-11", text: "CVE scan clean, all dependencies up-to-date.", createdAt: "2026-04-13T09:30:00.000Z", reactions: [{ emoji: ":shield:", userIds: ["usr-1"] }] }),
  mkMsg("msg-48", { channelId: "ch-4", authorId: "usr-2", text: "Starting a huddle for the rate-limit debug — join if interested.", createdAt: "2026-04-13T10:00:00.000Z" }),

  // Threaded replies on msg-44 (v2.3.0 announcement)
  mkMsg("msg-49", { channelId: "ch-4", authorId: "usr-3", text: "Amazing work team!", threadRootId: "msg-44", createdAt: "2026-04-12T17:05:00.000Z" }),
  mkMsg("msg-50", { channelId: "ch-4", authorId: "usr-5", text: "The new auth flow feels so smooth", threadRootId: "msg-44", createdAt: "2026-04-12T17:10:00.000Z" }),
  mkMsg("msg-51", { channelId: "ch-4", authorId: "usr-11", text: "Security audit passed with flying colors", threadRootId: "msg-44", createdAt: "2026-04-12T17:15:00.000Z" }),
  mkMsg("msg-52", { channelId: "ch-4", authorId: "usr-2", text: "Next up: PLT-103 session mgmt API", threadRootId: "msg-44", createdAt: "2026-04-12T17:20:00.000Z" }),

  // #design (ch-5) — 11 msgs
  mkMsg("msg-53", { channelId: "ch-5", authorId: "usr-4", text: "Checkout v3 mockups ready for review — Figma link in bookmarks.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-54", { channelId: "ch-5", authorId: "usr-6", text: "Love the new color palette. Much more accessible.", createdAt: "2026-04-12T09:30:00.000Z" }),
  mkMsg("msg-55", { channelId: "ch-5", authorId: "usr-10", text: "Icon set updated — 45 new icons added.", createdAt: "2026-04-12T10:00:00.000Z", reactions: [{ emoji: ":art:", userIds: ["usr-4", "usr-6"] }] }),
  mkMsg("msg-56", { channelId: "ch-5", authorId: "usr-4", text: "Design crit session tomorrow 3pm.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-57", { channelId: "ch-5", authorId: "usr-8", text: "Product wants to know ETA on the empty state illustrations.", mentions: ["usr-4"], createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-58", { channelId: "ch-5", authorId: "usr-4", text: "By EOD Thursday.", createdAt: "2026-04-12T14:05:00.000Z" }),
  mkMsg("msg-59", { channelId: "ch-5", authorId: "usr-6", text: "Brand guide v2 canvas attached to this channel.", createdAt: "2026-04-12T15:00:00.000Z" }),
  mkMsg("msg-60", { channelId: "ch-5", authorId: "usr-10", text: "Dark mode tokens finalized.", createdAt: "2026-04-12T15:30:00.000Z" }),
  mkMsg("msg-61", { channelId: "ch-5", authorId: "usr-4", text: "Sharing the motion principles doc for review.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-62", { channelId: "ch-5", authorId: "usr-8", text: "Can we sync on the onboarding flow this afternoon?", mentions: ["usr-4"], createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-63", { channelId: "ch-5", authorId: "usr-4", text: "Yes 3pm works. Sending invite.", createdAt: "2026-04-13T09:35:00.000Z" }),

  // #product (ch-6) — 9 msgs
  mkMsg("msg-64", { channelId: "ch-6", authorId: "usr-8", text: "Q2 OKRs draft ready — feedback welcome.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-65", { channelId: "ch-6", authorId: "usr-1", text: "Looks solid. One question on KR2.", createdAt: "2026-04-12T10:30:00.000Z" }),
  mkMsg("msg-66", { channelId: "ch-6", authorId: "usr-8", text: "Roadmap canvas attached to channel.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-67", { channelId: "ch-6", authorId: "usr-7", text: "Engineering committed to 3 of the 5 items.", createdAt: "2026-04-12T11:30:00.000Z" }),
  mkMsg("msg-68", { channelId: "ch-6", authorId: "usr-4", text: "Design capacity review needed for items 2 and 5.", createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-69", { channelId: "ch-6", authorId: "usr-8", text: "Launch checklist list just created — take a look.", createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-70", { channelId: "ch-6", authorId: "usr-2", text: "I'll own the platform items, have a draft plan.", createdAt: "2026-04-13T08:30:00.000Z" }),
  mkMsg("msg-71", { channelId: "ch-6", authorId: "usr-11", text: "Compliance review needed before ship.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-72", { channelId: "ch-6", authorId: "usr-8", text: "On it — syncing with legal this afternoon.", createdAt: "2026-04-13T09:15:00.000Z" }),

  // #platform-team (ch-7) — 15 msgs
  mkMsg("msg-73", { channelId: "ch-7", authorId: "usr-1", text: "Daily standup: status updates below please.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-74", { channelId: "ch-7", authorId: "usr-2", text: "Yesterday: PLT-101 merged. Today: PLT-104 rate limiting. No blockers.", createdAt: "2026-04-13T09:31:00.000Z" }),
  mkMsg("msg-75", { channelId: "ch-7", authorId: "usr-3", text: "Yesterday: PLT-102 review. Today: PLT-103 session API spec. No blockers.", createdAt: "2026-04-13T09:32:00.000Z" }),
  mkMsg("msg-76", { channelId: "ch-7", authorId: "usr-5", text: "Yesterday: frontend staging. Today: auth UI polish. No blockers.", createdAt: "2026-04-13T09:33:00.000Z" }),
  mkMsg("msg-77", { channelId: "ch-7", authorId: "usr-11", text: "Yesterday: CVE scan. Today: security review prep. No blockers.", createdAt: "2026-04-13T09:34:00.000Z" }),
  mkMsg("msg-78", { channelId: "ch-7", authorId: "usr-9", text: "Yesterday: cluster upgrade. Today: monitoring dashboards. No blockers.", createdAt: "2026-04-13T09:35:00.000Z" }),
  mkMsg("msg-79", { channelId: "ch-7", authorId: "usr-14", text: "Yesterday: prod migration. Today: backup automation. Blocker: waiting on infra team for storage quota.", createdAt: "2026-04-13T09:36:00.000Z" }),
  mkMsg("msg-80", { channelId: "ch-7", authorId: "usr-9", text: "Will bump the quota today.", createdAt: "2026-04-13T09:37:00.000Z" }),
  mkMsg("msg-81", { channelId: "ch-7", authorId: "usr-1", text: "Thanks everyone. Reviews going well, will check in at EOD.", createdAt: "2026-04-13T09:40:00.000Z" }),
  mkMsg("msg-82", { channelId: "ch-7", authorId: "usr-2", text: "Heads up: rate-limit change needs feature flag first.", createdAt: "2026-04-13T10:00:00.000Z" }),
  mkMsg("msg-83", { channelId: "ch-7", authorId: "usr-7", text: "Oncall rotation: Ravi → Arjun → Priya next week.", createdAt: "2026-04-13T10:15:00.000Z" }),
  mkMsg("msg-84", { channelId: "ch-7", authorId: "usr-15", text: "QA coverage at 84% for platform module.", createdAt: "2026-04-13T10:30:00.000Z" }),
  mkMsg("msg-85", { channelId: "ch-7", authorId: "usr-3", text: "Session API RFC draft: /docs/rfc/session-api-v1", createdAt: "2026-04-13T10:45:00.000Z" }),
  mkMsg("msg-86", { channelId: "ch-7", authorId: "usr-5", text: "+1 for RFC format.", createdAt: "2026-04-13T10:50:00.000Z" }),
  mkMsg("msg-87", { channelId: "ch-7", authorId: "usr-11", text: "Security checklist added.", createdAt: "2026-04-13T11:00:00.000Z" }),

  // #frontend-team (ch-8) — 12 msgs
  mkMsg("msg-88", { channelId: "ch-8", authorId: "usr-5", text: "Design system v2 integration PR up.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-89", { channelId: "ch-8", authorId: "usr-4", text: "Nice! Reviewing now.", createdAt: "2026-04-12T09:15:00.000Z" }),
  mkMsg("msg-90", { channelId: "ch-8", authorId: "usr-10", text: "Icon component refactor done.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-91", { channelId: "ch-8", authorId: "usr-8", text: "PM asking about bundle size.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-92", { channelId: "ch-8", authorId: "usr-5", text: "Down to 180kb gzipped.", createdAt: "2026-04-12T11:30:00.000Z" }),
  mkMsg("msg-93", { channelId: "ch-8", authorId: "usr-4", text: "Figma token plugin working with Tailwind v4.", createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-94", { channelId: "ch-8", authorId: "usr-5", text: "Can we sync on the empty state components?", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-95", { channelId: "ch-8", authorId: "usr-10", text: "Yes, 2pm today?", createdAt: "2026-04-13T09:05:00.000Z" }),
  mkMsg("msg-96", { channelId: "ch-8", authorId: "usr-5", text: "Works for me.", createdAt: "2026-04-13T09:10:00.000Z" }),
  mkMsg("msg-97", { channelId: "ch-8", authorId: "usr-4", text: "I'll join.", createdAt: "2026-04-13T09:15:00.000Z" }),
  mkMsg("msg-98", { channelId: "ch-8", authorId: "usr-8", text: "Same.", createdAt: "2026-04-13T09:20:00.000Z" }),
  mkMsg("msg-99", { channelId: "ch-8", authorId: "usr-10", text: "Posting the meeting link in a bit.", createdAt: "2026-04-13T09:25:00.000Z" }),

  // #infra-team (ch-9) — 10 msgs
  mkMsg("msg-100", { channelId: "ch-9", authorId: "usr-9", text: "Cluster scaling completed without incident.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-101", { channelId: "ch-9", authorId: "usr-11", text: "IAM audit running.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-102", { channelId: "ch-9", authorId: "usr-12", text: "Data pipeline SLA at 99.95% this week.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-103", { channelId: "ch-9", authorId: "usr-14", text: "Backup verification OK.", createdAt: "2026-04-12T12:00:00.000Z" }),
  mkMsg("msg-104", { channelId: "ch-9", authorId: "usr-9", text: "Terraform state locked — don't apply until I unlock.", createdAt: "2026-04-13T08:30:00.000Z" }),
  mkMsg("msg-105", { channelId: "ch-9", authorId: "usr-11", text: "Got it.", createdAt: "2026-04-13T08:31:00.000Z" }),
  mkMsg("msg-106", { channelId: "ch-9", authorId: "usr-14", text: "Vault rotation starting.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-107", { channelId: "ch-9", authorId: "usr-12", text: "DWH job failure at 03:00. Retried. OK now.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-108", { channelId: "ch-9", authorId: "usr-9", text: "State unlocked.", createdAt: "2026-04-13T10:00:00.000Z" }),
  mkMsg("msg-109", { channelId: "ch-9", authorId: "usr-11", text: "Starting the apply.", createdAt: "2026-04-13T10:05:00.000Z" }),

  // #legal-team (ch-10) — 6 msgs
  mkMsg("msg-110", { channelId: "ch-10", authorId: "usr-13", text: "New vendor NDA template v3 ready.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-111", { channelId: "ch-10", authorId: "usr-1", text: "Thanks — will circulate to the team.", createdAt: "2026-04-12T10:15:00.000Z" }),
  mkMsg("msg-112", { channelId: "ch-10", authorId: "usr-8", text: "Compliance review for Q2 launch?", mentions: ["usr-13"], createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-113", { channelId: "ch-10", authorId: "usr-13", text: "Scheduling this week.", createdAt: "2026-04-13T08:15:00.000Z" }),
  mkMsg("msg-114", { channelId: "ch-10", authorId: "usr-13", text: "Privacy policy update needed for new data pipeline.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-115", { channelId: "ch-10", authorId: "usr-1", text: "Drafting a note to send to everyone.", createdAt: "2026-04-13T09:30:00.000Z" }),

  // #help-desk (ch-11) — 7 msgs
  mkMsg("msg-116", { channelId: "ch-11", authorId: "usr-15", text: "How do I reset my VPN?", createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-117", { channelId: "ch-11", authorId: "usr-14", text: "Go to it.theta.internal → VPN → reset token.", createdAt: "2026-04-13T08:05:00.000Z" }),
  mkMsg("msg-118", { channelId: "ch-11", authorId: "usr-15", text: "Got it, thanks!", createdAt: "2026-04-13T08:10:00.000Z" }),
  mkMsg("msg-119", { channelId: "ch-11", authorId: "usr-12", text: "Anyone know the grafana URL?", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-120", { channelId: "ch-11", authorId: "usr-9", text: "grafana.theta.internal", createdAt: "2026-04-13T09:05:00.000Z" }),
  mkMsg("msg-121", { channelId: "ch-11", authorId: "usr-5", text: "How do I install the new dev tools?", createdAt: "2026-04-13T10:00:00.000Z" }),
  mkMsg("msg-122", { channelId: "ch-11", authorId: "usr-2", text: "brew install theta-cli", createdAt: "2026-04-13T10:05:00.000Z" }),

  // #incidents (ch-12) — 8 msgs
  mkMsg("msg-123", { channelId: "ch-12", authorId: "usr-7", text: "INC-042: Payment gateway timeouts starting 14:32 IST.", createdAt: "2026-04-09T14:32:00.000Z" }),
  mkMsg("msg-124", { channelId: "ch-12", authorId: "usr-2", text: "Investigating. Elevated 5xx from payments service.", createdAt: "2026-04-09T14:34:00.000Z" }),
  mkMsg("msg-125", { channelId: "ch-12", authorId: "usr-9", text: "Upstream vendor reporting issues.", createdAt: "2026-04-09T14:40:00.000Z" }),
  mkMsg("msg-126", { channelId: "ch-12", authorId: "usr-2", text: "Circuit breaker enabled. Traffic dropping.", createdAt: "2026-04-09T14:50:00.000Z" }),
  mkMsg("msg-127", { channelId: "ch-12", authorId: "usr-7", text: "Vendor confirms resolved at their end.", createdAt: "2026-04-09T15:20:00.000Z" }),
  mkMsg("msg-128", { channelId: "ch-12", authorId: "usr-2", text: "Recovery confirmed. Closing incident.", createdAt: "2026-04-09T15:40:00.000Z", reactions: [{ emoji: ":white_check_mark:", userIds: ["usr-1", "usr-7", "usr-9", "usr-14"] }] }),
  mkMsg("msg-129", { channelId: "ch-12", authorId: "usr-7", text: "Postmortem doc: /docs/incidents/inc-042", createdAt: "2026-04-10T09:00:00.000Z", pinnedBy: "usr-7" }),
  mkMsg("msg-130", { channelId: "ch-12", authorId: "usr-11", text: "Action items tracked in #engineering.", createdAt: "2026-04-10T10:00:00.000Z" }),

  // #hiring (ch-13) — 5 msgs
  mkMsg("msg-131", { channelId: "ch-13", authorId: "usr-7", text: "Senior platform engineer role posted.", createdAt: "2026-04-11T09:00:00.000Z" }),
  mkMsg("msg-132", { channelId: "ch-13", authorId: "usr-8", text: "Have 3 strong referrals to share.", createdAt: "2026-04-11T10:00:00.000Z" }),
  mkMsg("msg-133", { channelId: "ch-13", authorId: "usr-1", text: "Interview panel for Friday: Priya, Arjun, Ravi.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-134", { channelId: "ch-13", authorId: "usr-2", text: "Confirmed.", createdAt: "2026-04-12T09:05:00.000Z" }),
  mkMsg("msg-135", { channelId: "ch-13", authorId: "usr-4", text: "Design interview Monday 10am.", createdAt: "2026-04-13T09:00:00.000Z" }),

  // #social (ch-14) — 6 msgs
  mkMsg("msg-136", { channelId: "ch-14", authorId: "usr-6", text: "Team offsite June 15-17, Goa. RSVP this week!", createdAt: "2026-04-12T10:00:00.000Z", reactions: [{ emoji: ":beach_with_umbrella:", userIds: ["usr-1", "usr-2", "usr-4", "usr-5", "usr-8"] }] }),
  mkMsg("msg-137", { channelId: "ch-14", authorId: "usr-8", text: "Birthday celebration for Kiran tomorrow at 4pm!", mentions: ["usr-5"], createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-138", { channelId: "ch-14", authorId: "usr-5", text: "Aww thanks!", createdAt: "2026-04-12T14:05:00.000Z" }),
  mkMsg("msg-139", { channelId: "ch-14", authorId: "usr-10", text: "Photos from last week's hackathon uploaded.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-140", { channelId: "ch-14", authorId: "usr-6", text: "Karaoke Friday confirmed — 7pm at Skyline.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-141", { channelId: "ch-14", authorId: "usr-3", text: "Count me in!", createdAt: "2026-04-13T09:35:00.000Z" }),

  // #exec-private (ch-15) — 7 msgs
  mkMsg("msg-142", { channelId: "ch-15", authorId: "usr-1", text: "Board deck final draft attached.", createdAt: "2026-04-12T09:00:00.000Z" }),
  mkMsg("msg-143", { channelId: "ch-15", authorId: "usr-2", text: "Looks good, one comment on slide 14.", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-144", { channelId: "ch-15", authorId: "usr-7", text: "Comp review cycle kick-off next Monday.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-145", { channelId: "ch-15", authorId: "usr-1", text: "Budget review Friday 11am.", createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-146", { channelId: "ch-15", authorId: "usr-7", text: "Headcount plan in the works.", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-147", { channelId: "ch-15", authorId: "usr-2", text: "Strategy offsite dates confirmed: May 5-6.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-148", { channelId: "ch-15", authorId: "usr-1", text: "Pinned: strategy notes doc /docs/strategy-h1", createdAt: "2026-04-13T10:00:00.000Z", pinnedBy: "usr-1" }),

  // DMs ----------------------------------------------------------------
  // dm-1 (Priya ↔ Arjun) — 7 msgs
  mkMsg("msg-150", { dmId: "dm-1", authorId: "usr-2", text: "Hey Priya, can you review the PLT-102 PR?", createdAt: "2026-04-13T09:00:00.000Z" }),
  mkMsg("msg-151", { dmId: "dm-1", authorId: "usr-1", text: "Yes, looking now.", createdAt: "2026-04-13T09:05:00.000Z" }),
  mkMsg("msg-152", { dmId: "dm-1", authorId: "usr-1", text: "Approved. Nice work.", createdAt: "2026-04-13T09:30:00.000Z" }),
  mkMsg("msg-153", { dmId: "dm-1", authorId: "usr-2", text: "Thanks! I'll merge after CI.", createdAt: "2026-04-13T09:35:00.000Z" }),
  mkMsg("msg-154", { dmId: "dm-1", authorId: "usr-1", text: "Are you free for a quick call later?", createdAt: "2026-04-13T10:00:00.000Z" }),
  mkMsg("msg-155", { dmId: "dm-1", authorId: "usr-2", text: "After 3pm works", createdAt: "2026-04-13T10:15:00.000Z" }),
  mkMsg("msg-156", { dmId: "dm-1", authorId: "usr-1", text: "Perfect. 3:30.", createdAt: "2026-04-13T10:30:00.000Z" }),

  // dm-2 (Priya ↔ Ravi) — 4 msgs, 2 unread for usr-1
  mkMsg("msg-157", { dmId: "dm-2", authorId: "usr-1", text: "Ravi, can you pick up PLT-103?", createdAt: "2026-04-12T16:00:00.000Z" }),
  mkMsg("msg-158", { dmId: "dm-2", authorId: "usr-3", text: "Yes, starting tomorrow.", createdAt: "2026-04-12T16:30:00.000Z" }),
  mkMsg("msg-159", { dmId: "dm-2", authorId: "usr-3", text: "Quick question — should the API be REST or gRPC?", createdAt: "2026-04-13T10:30:00.000Z" }),
  mkMsg("msg-160", { dmId: "dm-2", authorId: "usr-3", text: "Never mind, going with REST per the RFC.", createdAt: "2026-04-13T11:00:00.000Z" }),

  // dm-3 (Priya ↔ Sneha) — 3 msgs
  mkMsg("msg-161", { dmId: "dm-3", authorId: "usr-4", text: "Mocks ready for your review.", createdAt: "2026-04-12T15:00:00.000Z" }),
  mkMsg("msg-162", { dmId: "dm-3", authorId: "usr-1", text: "Looking now — great work.", createdAt: "2026-04-12T16:00:00.000Z" }),
  mkMsg("msg-163", { dmId: "dm-3", authorId: "usr-4", text: "Thanks!", createdAt: "2026-04-12T17:00:00.000Z" }),

  // dm-4 (Priya ↔ Slackbot) — 5 msgs
  mkMsg("msg-164", { dmId: "dm-4", authorId: "usr-slackbot", text: "Hi Priya! Welcome to Theta HQ. I'm Slackbot — ask me anything!", createdAt: "2024-01-10T09:00:00.000Z" }),
  mkMsg("msg-165", { dmId: "dm-4", authorId: "usr-slackbot", text: "Tip: try pressing Cmd-K to quickly navigate the workspace.", createdAt: "2024-01-10T09:05:00.000Z" }),
  mkMsg("msg-166", { dmId: "dm-4", authorId: "usr-slackbot", text: "Reminder: team all-hands starts in 10 minutes.", createdAt: "2026-04-12T09:50:00.000Z" }),
  mkMsg("msg-167", { dmId: "dm-4", authorId: "usr-slackbot", text: "Daily digest: 3 mentions, 2 DMs, 1 thread reply.", createdAt: "2026-04-13T08:00:00.000Z" }),
  mkMsg("msg-168", { dmId: "dm-4", authorId: "usr-slackbot", text: "You have 1 scheduled message going out tomorrow.", createdAt: "2026-04-13T08:05:00.000Z" }),

  // dm-5 (Arjun ↔ Kiran) — 5 msgs, no Priya
  mkMsg("msg-169", { dmId: "dm-5", authorId: "usr-2", text: "Hey Kiran, can you review the CSS tokens?", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-170", { dmId: "dm-5", authorId: "usr-5", text: "Yes, reviewing now.", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-171", { dmId: "dm-5", authorId: "usr-5", text: "LGTM, small naming suggestion.", createdAt: "2026-04-12T12:00:00.000Z" }),
  mkMsg("msg-172", { dmId: "dm-5", authorId: "usr-2", text: "Accepted, merging.", createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-173", { dmId: "dm-5", authorId: "usr-5", text: "Thanks!", createdAt: "2026-04-12T18:00:00.000Z" }),

  // dm-6 (Priya + Arjun + Ravi, mpdm) — 8 msgs
  mkMsg("msg-174", { dmId: "dm-6", authorId: "usr-1", text: "Platform team weekly sync prep", createdAt: "2026-04-13T08:30:00.000Z" }),
  mkMsg("msg-175", { dmId: "dm-6", authorId: "usr-2", text: "Agenda draft: 1) RFC 2) oncall 3) Q2 plan", createdAt: "2026-04-13T08:35:00.000Z" }),
  mkMsg("msg-176", { dmId: "dm-6", authorId: "usr-3", text: "Add: session API RFC review", createdAt: "2026-04-13T08:40:00.000Z" }),
  mkMsg("msg-177", { dmId: "dm-6", authorId: "usr-1", text: "Added. Anything else?", createdAt: "2026-04-13T08:45:00.000Z" }),
  mkMsg("msg-178", { dmId: "dm-6", authorId: "usr-2", text: "Nope, LGTM.", createdAt: "2026-04-13T08:50:00.000Z" }),
  mkMsg("msg-179", { dmId: "dm-6", authorId: "usr-3", text: "Same.", createdAt: "2026-04-13T08:55:00.000Z" }),
  mkMsg("msg-180", { dmId: "dm-6", authorId: "usr-1", text: "Meeting in 5 minutes.", createdAt: "2026-04-13T08:58:00.000Z" }),
  mkMsg("msg-181", { dmId: "dm-6", authorId: "usr-1", text: "Walking over now.", createdAt: "2026-04-13T09:00:00.000Z" }),

  // dm-7 (Priya + Sneha + Ananya + Meera, mpdm) — 5 msgs
  mkMsg("msg-182", { dmId: "dm-7", authorId: "usr-8", text: "Design ↔ PM sync notes from this morning", createdAt: "2026-04-12T10:00:00.000Z" }),
  mkMsg("msg-183", { dmId: "dm-7", authorId: "usr-4", text: "Thanks for posting!", createdAt: "2026-04-12T11:00:00.000Z" }),
  mkMsg("msg-184", { dmId: "dm-7", authorId: "usr-6", text: "I'll incorporate feedback this week.", createdAt: "2026-04-12T12:00:00.000Z" }),
  mkMsg("msg-185", { dmId: "dm-7", authorId: "usr-1", text: "Great — looking forward to the updated mocks.", createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-186", { dmId: "dm-7", authorId: "usr-8", text: "Let's sync again Thursday.", createdAt: "2026-04-12T16:00:00.000Z" }),

  // dm-8 (Priya + Vikram + Amit, mpdm) — 3 msgs
  mkMsg("msg-187", { dmId: "dm-8", authorId: "usr-7", text: "Infra ↔ platform capacity planning", createdAt: "2026-04-12T13:00:00.000Z" }),
  mkMsg("msg-188", { dmId: "dm-8", authorId: "usr-9", text: "Drafted a doc — sharing link.", createdAt: "2026-04-12T14:00:00.000Z" }),
  mkMsg("msg-189", { dmId: "dm-8", authorId: "usr-1", text: "Great, will review this afternoon.", createdAt: "2026-04-12T15:00:00.000Z" }),

  // Scheduled message (not yet sent)
  mkMsg("msg-190", { channelId: "ch-1", authorId: "usr-1", text: "Good morning team — happy Tuesday!", createdAt: "2026-04-13T11:30:00.000Z", scheduledFor: "2026-04-14T09:00:00.000Z" }),
];

// Update thread reply counts based on actual replies
{
  const byRoot: Record<string, Message[]> = {};
  for (const m of messages) {
    if (m.threadRootId) {
      (byRoot[m.threadRootId] ??= []).push(m);
    }
  }
  for (const root of messages) {
    const replies = byRoot[root.id] ?? [];
    root.threadReplyCount = replies.length;
    root.threadParticipantIds = Array.from(new Set(replies.map((r) => r.authorId)));
  }
}

// ---------------------------------------------------------------------------
// Notifications (for usr-1 viewer)
// ---------------------------------------------------------------------------

export const notifications: Notification[] = [
  { id: "notif-1", type: "mention", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-32", read: false, createdAt: "2026-04-11T10:00:00.000Z" },
  { id: "notif-2", type: "mention", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-42", read: false, createdAt: "2026-04-12T14:00:00.000Z" },
  { id: "notif-3", type: "mention", userId: "usr-1", channelId: "ch-5", dmId: null, messageId: "msg-62", read: false, createdAt: "2026-04-13T09:30:00.000Z" },
  { id: "notif-4", type: "mention", userId: "usr-1", channelId: "ch-10", dmId: null, messageId: "msg-112", read: true, createdAt: "2026-04-13T08:00:00.000Z" },
  { id: "notif-5", type: "thread_reply", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-49", read: false, createdAt: "2026-04-12T17:05:00.000Z" },
  { id: "notif-6", type: "thread_reply", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-50", read: false, createdAt: "2026-04-12T17:10:00.000Z" },
  { id: "notif-7", type: "thread_reply", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-51", read: true, createdAt: "2026-04-12T17:15:00.000Z" },
  { id: "notif-8", type: "dm", userId: "usr-1", channelId: null, dmId: "dm-2", messageId: "msg-159", read: false, createdAt: "2026-04-13T10:30:00.000Z" },
  { id: "notif-9", type: "dm", userId: "usr-1", channelId: null, dmId: "dm-2", messageId: "msg-160", read: false, createdAt: "2026-04-13T11:00:00.000Z" },
  { id: "notif-10", type: "reaction", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-44", read: false, createdAt: "2026-04-12T17:05:00.000Z" },
  { id: "notif-11", type: "reaction", userId: "usr-1", channelId: "ch-4", dmId: null, messageId: "msg-44", read: true, createdAt: "2026-04-12T17:10:00.000Z" },
  { id: "notif-12", type: "channel_invite", userId: "usr-1", channelId: "ch-18", dmId: null, messageId: "msg-1", read: true, createdAt: "2026-04-01T09:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// Read states — one per (channel|dm, user)
// ---------------------------------------------------------------------------

const mkReadState = (
  entity: "ch" | "dm",
  entityId: string,
  userId: string,
  unread = 0,
  unreadMentions = 0,
  lastReadMessageId: string | null = null,
): ReadState => ({
  id: `rs-${entity}-${entityId}-${userId}`,
  userId,
  channelId: entity === "ch" ? entityId : null,
  dmId: entity === "dm" ? entityId : null,
  lastReadMessageId,
  unreadCount: unread,
  unreadMentions,
});

export const readStates: ReadState[] = [
  // Viewer usr-1 — varied unread state
  mkReadState("ch", "ch-1", "usr-1", 0, 0, "msg-14"),
  mkReadState("ch", "ch-2", "usr-1", 1, 0, "msg-23"),
  mkReadState("ch", "ch-3", "usr-1", 0, 0, "msg-30"),
  mkReadState("ch", "ch-4", "usr-1", 4, 1, "msg-44"),
  mkReadState("ch", "ch-5", "usr-1", 2, 1, "msg-61"),
  mkReadState("ch", "ch-6", "usr-1", 0, 0, "msg-72"),
  mkReadState("ch", "ch-7", "usr-1", 0, 0, "msg-87"),
  mkReadState("ch", "ch-8", "usr-1", 0, 0, "msg-99"),
  mkReadState("ch", "ch-9", "usr-1", 0, 0, null),
  mkReadState("ch", "ch-10", "usr-1", 1, 0, "msg-114"),
  mkReadState("ch", "ch-11", "usr-1", 0, 0, "msg-122"),
  mkReadState("ch", "ch-12", "usr-1", 3, 2, "msg-127"),
  mkReadState("ch", "ch-13", "usr-1", 1, 0, "msg-134"),
  mkReadState("ch", "ch-14", "usr-1", 0, 0, "msg-141"),
  mkReadState("ch", "ch-15", "usr-1", 0, 0, "msg-148"),
  mkReadState("ch", "ch-16", "usr-1", 0, 0, null),
  mkReadState("ch", "ch-17", "usr-1", 0, 0, null),
  mkReadState("ch", "ch-18", "usr-1", 0, 0, null),
  mkReadState("dm", "dm-1", "usr-1", 0, 0, "msg-156"),
  mkReadState("dm", "dm-2", "usr-1", 2, 0, "msg-158"),
  mkReadState("dm", "dm-3", "usr-1", 0, 0, "msg-163"),
  mkReadState("dm", "dm-4", "usr-1", 0, 0, "msg-168"),
  mkReadState("dm", "dm-6", "usr-1", 0, 0, "msg-181"),
  mkReadState("dm", "dm-7", "usr-1", 0, 0, "msg-186"),
  mkReadState("dm", "dm-8", "usr-1", 0, 0, "msg-189"),
];

// ---------------------------------------------------------------------------
// Saved items for usr-1
// ---------------------------------------------------------------------------

export const savedItems: SavedItem[] = [
  { id: "sv-1", userId: "usr-1", messageId: "msg-41", reminder: null, createdAt: "2026-04-12T12:30:00.000Z", isCompleted: false },
  { id: "sv-2", userId: "usr-1", messageId: "msg-129", reminder: "2026-04-15T10:00:00.000Z", createdAt: "2026-04-10T09:00:00.000Z", isCompleted: false },
  { id: "sv-3", userId: "usr-1", messageId: "msg-85", reminder: null, createdAt: "2026-04-13T10:45:00.000Z", isCompleted: false },
  { id: "sv-4", userId: "usr-1", messageId: "msg-66", reminder: null, createdAt: "2026-04-12T11:00:00.000Z", isCompleted: true },
];

// ---------------------------------------------------------------------------
// User groups
// ---------------------------------------------------------------------------

export const userGroups: UserGroup[] = [
  {
    id: "ug-1",
    handle: "frontend-team",
    name: "Frontend team",
    description: "Frontend engineers and designers",
    memberIds: ["usr-4", "usr-5", "usr-8", "usr-10"],
    isEnabled: true,
  },
  {
    id: "ug-2",
    handle: "oncall",
    name: "On-call rotation",
    description: "Current oncall engineers",
    memberIds: ["usr-2", "usr-3", "usr-14"],
    isEnabled: true,
  },
  {
    id: "ug-3",
    handle: "leads",
    name: "Engineering leads",
    description: "Tech leads across all squads",
    memberIds: ["usr-1", "usr-2", "usr-4", "usr-7"],
    isEnabled: true,
  },
  {
    id: "ug-4",
    handle: "design-leads",
    name: "Design leads",
    description: "Design org leadership",
    memberIds: ["usr-4", "usr-6"],
    isEnabled: true,
  },
];

// ---------------------------------------------------------------------------
// Bookmarks (channel bookmark bar)
// ---------------------------------------------------------------------------

export const bookmarks: Bookmark[] = [
  { id: "bk-1", channelId: "ch-4", title: "GitHub — platform", url: "https://github.com/theta/platform", emoji: ":octocat:", createdBy: "usr-2", createdAt: "2024-03-01T10:00:00.000Z" },
  { id: "bk-2", channelId: "ch-4", title: "Linear — PLT board", url: "https://linear.theta.internal/team/PLT", emoji: ":kanban:", createdBy: "usr-2", createdAt: "2024-03-01T10:05:00.000Z" },
  { id: "bk-3", channelId: "ch-4", title: "Runbook", url: "https://runbooks.theta.internal/oncall", emoji: ":book:", createdBy: "usr-1", createdAt: "2024-03-05T10:00:00.000Z" },
  { id: "bk-4", channelId: "ch-5", title: "Figma — design system", url: "https://figma.com/theta/ds", emoji: ":art:", createdBy: "usr-4", createdAt: "2024-03-10T10:00:00.000Z" },
  { id: "bk-5", channelId: "ch-5", title: "Notion — brand", url: "https://notion.so/theta/brand", emoji: ":notebook:", createdBy: "usr-4", createdAt: "2024-03-10T10:05:00.000Z" },
];

// ---------------------------------------------------------------------------
// Canvases
// ---------------------------------------------------------------------------

export const canvases: Canvas[] = [
  {
    id: "canvas-1",
    channelId: "ch-1",
    title: "Theta HQ Onboarding",
    content: "# Welcome to Theta HQ\n\nThis is your onboarding checklist. Complete within your first week:\n\n- [ ] Complete HR paperwork\n- [ ] Set up dev environment\n- [ ] Meet your buddy\n- [ ] Join team standup\n- [ ] Read the engineering handbook",
    createdBy: "usr-1",
    createdAt: "2024-01-12T10:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "canvas-2",
    channelId: "ch-4",
    title: "Engineering Runbook",
    content: "# On-call Runbook\n\n## Paging\nUse pagerduty.theta.internal\n\n## Common incidents\n1. Payment timeouts → check vendor status\n2. Auth failures → verify JWT secret rotation\n3. DB latency → check connection pool",
    createdBy: "usr-1",
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2026-04-12T12:30:00.000Z",
  },
  {
    id: "canvas-3",
    channelId: "ch-6",
    title: "Q2 2026 Roadmap",
    content: "# Q2 2026 Roadmap\n\n## Themes\n1. Auth platform overhaul\n2. Checkout v3\n3. Analytics pipeline\n\n## Milestones\n- Apr: Auth spec freeze\n- May: Checkout beta\n- Jun: Analytics GA",
    createdBy: "usr-8",
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-12T11:00:00.000Z",
  },
  {
    id: "canvas-4",
    channelId: "ch-5",
    title: "Brand Guide v2",
    content: "# Theta Brand Guide v2\n\n## Colors\n- Primary: #4A154B\n- Accent: #1264A3\n- Destructive: #E01E5A\n\n## Typography\n- Headings: Lato Bold\n- Body: Lato Regular",
    createdBy: "usr-4",
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-04-12T15:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export const lists: SlackList[] = [
  {
    id: "list-1",
    channelId: "ch-4",
    name: "Bug Tracker",
    fields: [
      { id: "f-title", name: "Title", type: "text" },
      { id: "f-status", name: "Status", type: "status" },
      { id: "f-assignee", name: "Assignee", type: "user" },
      { id: "f-due", name: "Due", type: "date" },
    ],
    items: [
      { id: "li-1", values: { "f-title": "Fix race condition in auth service", "f-status": "in_progress", "f-assignee": "usr-2", "f-due": "2026-04-17" } },
      { id: "li-2", values: { "f-title": "Add rate limiting metrics", "f-status": "todo", "f-assignee": "usr-3", "f-due": "2026-04-20" } },
      { id: "li-3", values: { "f-title": "Vault token rotation script", "f-status": "done", "f-assignee": "usr-14", "f-due": "2026-04-12" } },
    ],
    createdBy: "usr-2",
    createdAt: "2026-04-08T10:00:00.000Z",
  },
  {
    id: "list-2",
    channelId: "ch-6",
    name: "Launch Checklist",
    fields: [
      { id: "f-item", name: "Item", type: "text" },
      { id: "f-status", name: "Status", type: "status" },
      { id: "f-owner", name: "Owner", type: "user" },
    ],
    items: [
      { id: "li-4", values: { "f-item": "Security review", "f-status": "in_progress", "f-owner": "usr-11" } },
      { id: "li-5", values: { "f-item": "Privacy policy update", "f-status": "todo", "f-owner": "usr-13" } },
      { id: "li-6", values: { "f-item": "Marketing copy", "f-status": "done", "f-owner": "usr-6" } },
      { id: "li-7", values: { "f-item": "Engineering readiness", "f-status": "in_progress", "f-owner": "usr-2" } },
    ],
    createdBy: "usr-8",
    createdAt: "2026-04-10T10:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export const workflows: Workflow[] = [
  {
    id: "wf-1",
    channelId: "ch-1",
    name: "New member welcome",
    trigger: "new_channel_member",
    isEnabled: true,
    runCount: 24,
    lastRunAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "wf-2",
    channelId: "ch-7",
    name: "Daily standup poll",
    trigger: "schedule",
    isEnabled: true,
    runCount: 84,
    lastRunAt: "2026-04-13T09:30:00.000Z",
  },
  {
    id: "wf-3",
    channelId: "ch-12",
    name: "Incident escalation",
    trigger: "slash",
    isEnabled: true,
    runCount: 6,
    lastRunAt: "2026-04-09T14:32:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Huddles (historical)
// ---------------------------------------------------------------------------

export const huddles: Huddle[] = [
  {
    id: "hud-1",
    channelId: "ch-4",
    dmId: null,
    startedBy: "usr-2",
    startedAt: "2026-04-12T15:00:00.000Z",
    endedAt: "2026-04-12T15:45:00.000Z",
    participantIds: ["usr-2", "usr-3", "usr-5"],
    topic: "Debug: rate-limit edge case",
  },
];

// ---------------------------------------------------------------------------
// Call history
// ---------------------------------------------------------------------------

export const callHistory: Call[] = [
  { id: "call-1", type: "huddle", startedAt: "2026-04-12T15:00:00.000Z", endedAt: "2026-04-12T15:45:00.000Z", participantIds: ["usr-2", "usr-3", "usr-5"], channelId: "ch-4", dmId: null },
  { id: "call-2", type: "slack_call", startedAt: "2026-04-11T14:00:00.000Z", endedAt: "2026-04-11T14:30:00.000Z", participantIds: ["usr-1", "usr-2"], channelId: null, dmId: "dm-1" },
  { id: "call-3", type: "huddle", startedAt: "2026-04-10T10:00:00.000Z", endedAt: "2026-04-10T10:20:00.000Z", participantIds: ["usr-4", "usr-6", "usr-8"], channelId: "ch-5", dmId: null },
  { id: "call-4", type: "slack_call", startedAt: "2026-04-09T14:32:00.000Z", endedAt: "2026-04-09T15:40:00.000Z", participantIds: ["usr-1", "usr-2", "usr-7", "usr-9"], channelId: "ch-12", dmId: null },
];
