"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  // General & UI
  CubeIcon,
  Home01Icon,
  StarIcon,
  FlashIcon,
  Target01Icon,
  Chart01Icon,
  CheckmarkSquare01Icon,
  CheckmarkSquare02Icon,
  BulbIcon,
  IdeaIcon,
  DiamondIcon,
  CrownIcon,
  GiftIcon,
  BadgeIcon,
  AuctionIcon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
  Award01Icon,
  Award02Icon,
  RocketIcon,
  Shield01Icon,
  LockIcon,
  HeartAddIcon,
  FireIcon,
  FlowerIcon,
  SnowIcon,
  ZapIcon,
  PowerIcon,
  // People
  UserIcon,
  UserGroupIcon,
  // Communication
  Message01Icon,
  ChatIcon,
  ChatBotIcon,
  ChatAddIcon,
  ChatEditIcon,
  ChatFeedbackIcon,
  ChatSearchIcon,
  ChatSparkIcon,
  ChatTranslateIcon,
  ChatUserIcon,
  MailOpenIcon,
  MailsIcon,
  MailboxIcon,
  PhoneCheckIcon,
  VoiceIcon,
  // Files
  File01Icon,
  FileEditIcon,
  FileCodeIcon,
  FileSearchIcon,
  FileStarIcon,
  FileSyncIcon,
  FileUploadIcon,
  FileDownloadIcon,
  FileHeartIcon,
  FileImageIcon,
  FileMusicIcon,
  FileVideoIcon,
  FileSecurityIcon,
  FileLinkIcon,
  FileClockIcon,
  // Folders
  Folder01Icon,
  FolderOpenIcon,
  FolderAddIcon,
  FolderCheckIcon,
  FolderCodeIcon,
  FolderCloudIcon,
  FolderGitIcon,
  FolderHeartIcon,
  FolderSearchIcon,
  FolderTreeIcon,
  FolderVideoIcon,
  // Charts & Analytics
  ChartIcon,
  ChartUpIcon,
  ChartDownIcon,
  ChartAreaIcon,
  ChartGanttIcon,
  ChartRadarIcon,
  ChartRingIcon,
  ChartScatterIcon,
  ChartBarBigIcon,
  ChartColumnIcon,
  ChartHistogramIcon,
  ChartIncreaseIcon,
  ChartDecreaseIcon,
  ChartEvaluationIcon,
  AnalyticsUpIcon,
  AnalyticsDownIcon,
  // Code & Tech
  CodeIcon,
  CodeSquareIcon,
  CodeCircleIcon,
  CodeSimpleIcon,
  TerminalIcon,
  DatabaseIcon,
  DatabaseAddIcon,
  DatabaseSyncIcon,
  DatabaseSettingIcon,
  DatabaseLightningIcon,
  RouterIcon,
  LaptopIcon,
  ChipIcon,
  CpuIcon,
  GpuIcon,
  HardDriveIcon,
  UsbIcon,
  BluetoothIcon,
  PrinterIcon,
  DroneIcon,
  MicrochipIcon,
  MicroscopeIcon,
  AtomicPowerIcon,
  // Cloud & Computer
  CloudIcon,
  CloudServerIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
  CloudAlertIcon,
  CloudBigRainIcon,
  CloudSnowIcon,
  ComputerIcon,
  ComputerCheckIcon,
  ComputerCloudIcon,
  ComputerActivityIcon,
  ComputerUserIcon,
  // Books
  BookOpenCheckIcon,
  BookEditIcon,
  BookSearchIcon,
  BookHeartIcon,
  BookUserIcon,
  BookUploadIcon,
  // Nature & Earth
  Tree01Icon,
  EarthIcon,
  SolarEnergyIcon,
  SolarPowerIcon,
  // Maps & Navigation
  MapsIcon,
  CompassIcon,
  MapPinIcon,
  NavigationIcon,
  // Media & Audio
  AlbumIcon,
  RadioIcon,
  PodcastIcon,
  NewsIcon,
  RssIcon,
  // Objects & Tools
  InboxIcon,
  InboxCheckIcon,
  Calendar01Icon,
  Activity03Icon,
  Tag01Icon,
  Link01Icon,
  GlobeIcon,
  MoonIcon,
  Sun01Icon,
  TruckIcon,
  RefreshIcon,
  SecurityIcon,
  NoteIcon,
  TranslateIcon,
  BrainIcon,
  BrushIcon,
  PaintBucketIcon,
  PencilIcon,
  ToolsIcon,
  ToolboxIcon,
  PackageIcon,
  PackageDeliveredIcon,
  ZoomIcon,
  WorkIcon,
  GameIcon,
  PuzzleIcon,
  StackStarIcon,
  WifiCircleIcon,
  SdCardIcon,
  DollarCircleIcon,
  BankIcon,
} from "@hugeicons/core-free-icons"

// ─── Types ─────────────────────────────────────────────────────────────────────
type IconType = typeof CubeIcon

// ─── Icon Registry ─────────────────────────────────────────────────────────────
export const PICKER_ICONS: { icon: IconType; name: string }[] = [
  // General & UI
  { icon: CheckmarkSquare01Icon, name: "checkmark square tick" },
  { icon: CheckmarkSquare02Icon, name: "checkmark square tick done" },
  { icon: CubeIcon, name: "cube" },
  { icon: Home01Icon, name: "home" },
  { icon: StarIcon, name: "star" },
  { icon: FlashIcon, name: "flash" },
  { icon: Target01Icon, name: "target" },
  { icon: RocketIcon, name: "rocket" },
  { icon: FireIcon, name: "fire" },
  { icon: FlowerIcon, name: "flower" },
  { icon: SnowIcon, name: "snow" },
  { icon: ZapIcon, name: "zap" },
  { icon: PowerIcon, name: "power" },
  { icon: HeartAddIcon, name: "heart" },
  { icon: IdeaIcon, name: "idea" },
  { icon: BulbIcon, name: "bulb" },
  { icon: DiamondIcon, name: "diamond" },
  { icon: CrownIcon, name: "crown" },
  { icon: GiftIcon, name: "gift" },
  { icon: BadgeIcon, name: "badge" },
  { icon: Award01Icon, name: "award" },
  { icon: Award02Icon, name: "award2" },
  { icon: MedalFirstPlaceIcon, name: "medal gold" },
  { icon: MedalSecondPlaceIcon, name: "medal silver" },
  { icon: MedalThirdPlaceIcon, name: "medal bronze" },
  { icon: AuctionIcon, name: "auction" },
  { icon: Shield01Icon, name: "shield" },
  { icon: LockIcon, name: "lock" },
  // People
  { icon: UserIcon, name: "user" },
  { icon: UserGroupIcon, name: "users group" },
  // Communication
  { icon: Message01Icon, name: "message" },
  { icon: ChatIcon, name: "chat" },
  { icon: ChatBotIcon, name: "chatbot bot" },
  { icon: ChatAddIcon, name: "chat add" },
  { icon: ChatEditIcon, name: "chat edit" },
  { icon: ChatFeedbackIcon, name: "feedback" },
  { icon: ChatSearchIcon, name: "chat search" },
  { icon: ChatSparkIcon, name: "chat spark" },
  { icon: ChatTranslateIcon, name: "translate" },
  { icon: ChatUserIcon, name: "chat user" },
  { icon: MailOpenIcon, name: "mail" },
  { icon: MailsIcon, name: "mails" },
  { icon: MailboxIcon, name: "mailbox" },
  { icon: PhoneCheckIcon, name: "phone" },
  { icon: VoiceIcon, name: "voice" },
  // Files
  { icon: File01Icon, name: "file" },
  { icon: FileEditIcon, name: "file edit" },
  { icon: FileCodeIcon, name: "file code" },
  { icon: FileSearchIcon, name: "file search" },
  { icon: FileStarIcon, name: "file star" },
  { icon: FileSyncIcon, name: "file sync" },
  { icon: FileUploadIcon, name: "file upload" },
  { icon: FileDownloadIcon, name: "file download" },
  { icon: FileHeartIcon, name: "file heart" },
  { icon: FileImageIcon, name: "file image photo" },
  { icon: FileMusicIcon, name: "file music" },
  { icon: FileVideoIcon, name: "file video" },
  { icon: FileSecurityIcon, name: "file security" },
  { icon: FileLinkIcon, name: "file link" },
  { icon: FileClockIcon, name: "file clock" },
  // Folders
  { icon: Folder01Icon, name: "folder" },
  { icon: FolderOpenIcon, name: "folder open" },
  { icon: FolderAddIcon, name: "folder add" },
  { icon: FolderCheckIcon, name: "folder check" },
  { icon: FolderCodeIcon, name: "folder code" },
  { icon: FolderCloudIcon, name: "folder cloud" },
  { icon: FolderGitIcon, name: "folder git" },
  { icon: FolderHeartIcon, name: "folder heart" },
  { icon: FolderSearchIcon, name: "folder search" },
  { icon: FolderTreeIcon, name: "folder tree" },
  { icon: FolderVideoIcon, name: "folder video" },
  // Charts & Analytics
  { icon: Chart01Icon, name: "chart" },
  { icon: ChartIcon, name: "chart bar" },
  { icon: ChartUpIcon, name: "chart up" },
  { icon: ChartDownIcon, name: "chart down" },
  { icon: ChartAreaIcon, name: "chart area" },
  { icon: ChartGanttIcon, name: "chart gantt" },
  { icon: ChartRadarIcon, name: "chart radar" },
  { icon: ChartRingIcon, name: "chart ring" },
  { icon: ChartScatterIcon, name: "chart scatter" },
  { icon: ChartBarBigIcon, name: "chart bar big" },
  { icon: ChartColumnIcon, name: "chart column" },
  { icon: ChartHistogramIcon, name: "histogram" },
  { icon: ChartIncreaseIcon, name: "increase" },
  { icon: ChartDecreaseIcon, name: "decrease" },
  { icon: ChartEvaluationIcon, name: "evaluation" },
  { icon: AnalyticsUpIcon, name: "analytics" },
  { icon: AnalyticsDownIcon, name: "analytics down" },
  // Code & Tech
  { icon: CodeIcon, name: "code" },
  { icon: CodeSquareIcon, name: "code square" },
  { icon: CodeCircleIcon, name: "code circle" },
  { icon: CodeSimpleIcon, name: "code simple" },
  { icon: TerminalIcon, name: "terminal" },
  { icon: DatabaseIcon, name: "database" },
  { icon: DatabaseAddIcon, name: "database add" },
  { icon: DatabaseSyncIcon, name: "database sync" },
  { icon: DatabaseSettingIcon, name: "database setting" },
  { icon: DatabaseLightningIcon, name: "database lightning" },
  { icon: RouterIcon, name: "router" },
  { icon: LaptopIcon, name: "laptop" },
  { icon: ChipIcon, name: "chip" },
  { icon: CpuIcon, name: "cpu processor" },
  { icon: GpuIcon, name: "gpu" },
  { icon: HardDriveIcon, name: "hard drive" },
  { icon: UsbIcon, name: "usb" },
  { icon: BluetoothIcon, name: "bluetooth" },
  { icon: PrinterIcon, name: "printer" },
  { icon: DroneIcon, name: "drone" },
  { icon: MicrochipIcon, name: "microchip" },
  { icon: MicroscopeIcon, name: "microscope science" },
  { icon: AtomicPowerIcon, name: "atom science" },
  // Cloud & Computer
  { icon: CloudIcon, name: "cloud" },
  { icon: CloudServerIcon, name: "cloud server" },
  { icon: CloudUploadIcon, name: "cloud upload" },
  { icon: CloudDownloadIcon, name: "cloud download" },
  { icon: CloudAlertIcon, name: "cloud alert" },
  { icon: CloudBigRainIcon, name: "rain cloud" },
  { icon: CloudSnowIcon, name: "cloud snow" },
  { icon: ComputerIcon, name: "computer desktop" },
  { icon: ComputerCheckIcon, name: "computer check" },
  { icon: ComputerCloudIcon, name: "computer cloud" },
  { icon: ComputerActivityIcon, name: "computer activity" },
  { icon: ComputerUserIcon, name: "computer user" },
  // Books & Learning
  { icon: BookOpenCheckIcon, name: "book" },
  { icon: BookEditIcon, name: "book edit" },
  { icon: BookSearchIcon, name: "book search" },
  { icon: BookHeartIcon, name: "book heart" },
  { icon: BookUserIcon, name: "book user" },
  { icon: BookUploadIcon, name: "book upload" },
  // Nature & Earth
  { icon: Tree01Icon, name: "tree nature" },
  { icon: EarthIcon, name: "earth world" },
  { icon: SolarEnergyIcon, name: "solar energy" },
  { icon: SolarPowerIcon, name: "solar power" },
  // Maps & Navigation
  { icon: MapsIcon, name: "map" },
  { icon: CompassIcon, name: "compass" },
  { icon: MapPinIcon, name: "pin location" },
  { icon: NavigationIcon, name: "navigation" },
  // Media & Audio
  { icon: AlbumIcon, name: "album music" },
  { icon: RadioIcon, name: "radio" },
  { icon: PodcastIcon, name: "podcast" },
  { icon: NewsIcon, name: "news" },
  { icon: RssIcon, name: "rss feed" },
  // Objects & Tools
  { icon: InboxIcon, name: "inbox" },
  { icon: InboxCheckIcon, name: "inbox check" },
  { icon: Calendar01Icon, name: "calendar" },
  { icon: Activity03Icon, name: "activity" },
  { icon: Tag01Icon, name: "tag label" },
  { icon: Link01Icon, name: "link url" },
  { icon: GlobeIcon, name: "globe web" },
  { icon: MoonIcon, name: "moon night" },
  { icon: Sun01Icon, name: "sun day" },
  { icon: TruckIcon, name: "truck delivery" },
  { icon: RefreshIcon, name: "refresh sync" },
  { icon: SecurityIcon, name: "security safe" },
  { icon: NoteIcon, name: "note" },
  { icon: TranslateIcon, name: "translate language" },
  { icon: BrainIcon, name: "brain ai" },
  { icon: BrushIcon, name: "brush design" },
  { icon: PaintBucketIcon, name: "paint bucket" },
  { icon: PencilIcon, name: "pencil write" },
  { icon: ToolsIcon, name: "tools" },
  { icon: ToolboxIcon, name: "toolbox" },
  { icon: PackageIcon, name: "package box" },
  { icon: PackageDeliveredIcon, name: "package delivered" },
  { icon: ZoomIcon, name: "zoom search" },
  { icon: WorkIcon, name: "work office" },
  { icon: GameIcon, name: "game" },
  { icon: PuzzleIcon, name: "puzzle" },
  { icon: StackStarIcon, name: "stack" },
  { icon: WifiCircleIcon, name: "wifi" },
  { icon: SdCardIcon, name: "sd card" },
  { icon: DollarCircleIcon, name: "dollar money" },
  { icon: BankIcon, name: "bank finance" },
]

// ─── Colors ────────────────────────────────────────────────────────────────────
export const PICKER_COLORS = [
  { id: "dark", bg: "bg-zinc-700", text: "text-zinc-400" },
  { id: "gray", bg: "bg-zinc-500", text: "text-muted-foreground" },
  { id: "blue", bg: "bg-blue-600", text: "text-blue-500" },
  { id: "cyan", bg: "bg-cyan-500", text: "text-cyan-500" },
  { id: "green", bg: "bg-green-500", text: "text-green-500" },
  { id: "yellow", bg: "bg-yellow-400", text: "text-yellow-500" },
  { id: "orange", bg: "bg-orange-500", text: "text-orange-500" },
  { id: "pink", bg: "bg-pink-400", text: "text-pink-400" },
  { id: "red", bg: "bg-red-500", text: "text-red-500" },
]

// ─── Component ─────────────────────────────────────────────────────────────────
interface IconPickerPopoverProps {
  trigger: React.ReactNode
  onSelect?: (icon: IconType, colorId: string) => void
  defaultIcon?: IconType | null
  defaultColorId?: string
  stopPropagation?: boolean
}

export function IconPickerPopover({
  trigger,
  onSelect,
  defaultIcon = null,
  defaultColorId = "gray",
  stopPropagation = false,
}: IconPickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const [pickerTab, setPickerTab] = useState<"icons" | "emojis">("icons")
  const [colorId, setColorId] = useState(defaultColorId)
  const [search, setSearch] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<IconType | null>(defaultIcon)

  const color = PICKER_COLORS.find((c) => c.id === colorId) ?? PICKER_COLORS[1]

  const filtered = search
    ? PICKER_ICONS.filter((e) => e.name.includes(search.toLowerCase()))
    : PICKER_ICONS

  function handleSelect(icon: IconType) {
    setSelectedIcon(icon)
    setOpen(false)
    onSelect?.(icon, colorId)
  }

  const picker = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="hover:bg-accent flex size-5 shrink-0 items-center justify-center rounded"
          />
        }
      >
        {selectedIcon ? (
          <HugeiconsIcon
            icon={selectedIcon}
            className={`size-4 shrink-0 ${color.text}`}
          />
        ) : (
          trigger
        )}
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-80 gap-0 p-0"
      >
        {/* Tabs */}
        <div className="flex border-b px-3 pt-2">
          {(["icons", "emojis"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPickerTab(t)}
              className={`px-2 pt-0.5 pb-2 text-xs font-medium transition-colors ${
                pickerTab === t
                  ? "border-foreground text-foreground border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Color palette */}
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          {PICKER_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColorId(c.id)}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${c.bg} transition-all ${
                colorId === c.id
                  ? "ring-offset-popover ring-2 ring-white/30 ring-offset-1"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              {colorId === c.id && (
                <svg viewBox="0 0 10 10" className="size-3.5" fill="none">
                  <path
                    d="M2 5l2 2.5L8 2.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
          {/* Rainbow */}
          <button
            type="button"
            onClick={() => setColorId("rainbow")}
            className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 transition-all ${
              colorId === "rainbow"
                ? "ring-offset-popover ring-2 ring-white/30 ring-offset-1"
                : "opacity-75 hover:opacity-100"
            }`}
          >
            {colorId === "rainbow" && (
              <svg viewBox="0 0 10 10" className="size-3.5" fill="none">
                <path
                  d="M2 5l2 2.5L8 2.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border-t border-b px-3 py-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground size-3.5 shrink-0"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>

        {/* Icon grid — auto-fill columns to fill the 320px popup */}
        <div className="grid max-h-60 grid-cols-[repeat(14,1fr)] gap-0.5 overflow-auto p-2">
          {filtered.map((entry) => (
            <button
              key={entry.name}
              type="button"
              title={entry.name}
              onClick={() => handleSelect(entry.icon)}
              className={`hover:bg-accent flex size-[22px] items-center justify-center rounded transition-colors ${
                selectedIcon === entry.icon ? "bg-accent" : ""
              }`}
            >
              <HugeiconsIcon
                icon={entry.icon}
                strokeWidth={2}
                className="text-foreground/90 size-3.5"
              />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full py-3 text-center text-xs">
              No icons found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  return stopPropagation ? (
    <div onClick={(e) => e.stopPropagation()}>{picker}</div>
  ) : (
    picker
  )
}
