# UI Implementation Plan: Student Portal Dashboard Layout
## shadcn/ui Components Mapping

Based on the UX Structure Plan, this document maps each UI element to specific shadcn/ui components and blocks.

---

## Sidebar Navigation
└── **Block: sidebar-07** (A sidebar that collapses to icons - permanently collapsed state)
    ├── Logo/Branding Area
    │   └── **Custom component** (Logo icon only, wrapped in Link)
    ├── Primary Navigation Items (Icon-only with tooltips)
    │   ├── Dashboard
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (Home icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "Dashboard" label on hover)
    │   ├── My Courses
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (Book icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "My Courses" label on hover)
    │   ├── Assignments
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button with relative positioning)
    │   │   ├── **Icon component** (ClipboardList icon from lucide-react)
    │   │   ├── **@shadcn/badge** (notification count - positioned absolute top-right)
    │   │   └── **@shadcn/tooltip** (shows "Assignments" label on hover)
    │   ├── Calendar
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (Calendar icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "Calendar" label on hover)
    │   ├── Grades
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (BarChart icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "Grades" label on hover)
    │   ├── Resources
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (FolderOpen icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "Resources" label on hover)
    │   ├── Messages
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button with relative positioning)
    │   │   ├── **Icon component** (Mail icon from lucide-react)
    │   │   ├── **@shadcn/badge** (unread count - positioned absolute top-right)
    │   │   └── **@shadcn/tooltip** (shows "Messages" label on hover)
    │   └── Profile
    │       ├── **@shadcn/button** (variant: "ghost", icon button)
    │       ├── **Icon component** (User icon from lucide-react)
    │       └── **@shadcn/tooltip** (shows "Profile" label on hover)
    ├── **@shadcn/separator** (divider between primary and secondary nav)
    ├── Secondary Navigation Items (Icon-only with tooltips - positioned at bottom)
    │   ├── Settings
    │   │   ├── **@shadcn/button** (variant: "ghost", icon button)
    │   │   ├── **Icon component** (Settings icon from lucide-react)
    │   │   └── **@shadcn/tooltip** (shows "Settings" label on hover)
    │   └── Help & Support
    │       ├── **@shadcn/button** (variant: "ghost", icon button)
    │       ├── **Icon component** (HelpCircle icon from lucide-react)
    │       └── **@shadcn/tooltip** (shows "Help & Support" label on hover)
    └── User Section (Bottom)
        ├── **@shadcn/avatar** (User Avatar only, wrapped in button)
        └── **@shadcn/tooltip** (shows user name and role on hover)

---

## Breadcrumbs
└── **@shadcn/breadcrumb**
    ├── Breadcrumb Container (built into component)
    ├── Home Icon (lucide-react icon)
    ├── Breadcrumb Items
    │   ├── **BreadcrumbList** (container)
    │   ├── **BreadcrumbItem** (each segment)
    │   ├── **BreadcrumbLink** (clickable segments)
    │   ├── **BreadcrumbSeparator** (arrow or slash)
    │   └── **BreadcrumbPage** (current page, non-clickable)
    └── Responsive Behavior
        └── **BreadcrumbEllipsis** (for truncated segments on mobile)

---

## Main Content Area Layout
└── Content Container
    ├── **@shadcn/breadcrumb** (positioned at top of content area)
    └── **Main content slot** (placeholder for page-specific content)

---

## Component Summary

### Blocks (Priority Use)
- **@shadcn/sidebar-07** - Icon-only collapsed sidebar navigation (used in permanently collapsed state)

### UI Components
- **@shadcn/tooltip** - Icon labels on hover for sidebar navigation
- **@shadcn/breadcrumb** - Navigation breadcrumbs at top of content area
- **@shadcn/badge** - Notification counts on sidebar icons (Assignments and Messages)
- **@shadcn/avatar** - User profile avatar in sidebar
- **@shadcn/button** - Sidebar navigation items (variant: "ghost")
- **@shadcn/separator** - Divider in sidebar between primary and secondary navigation

### External/Custom Components
- **lucide-react** - All icons throughout the interface (sidebar navigation icons)
- **Custom layout containers** - Main layout structure with sidebar and content area

### Implementation Notes
- Sidebar remains in permanently collapsed/icon-only state (no expand functionality)
- Tooltips appear on the right side when hovering over sidebar icons
- Badge notifications positioned absolutely on top-right of icon buttons for Assignments and Messages
- Avatar at bottom of sidebar acts as user menu trigger
- Main content area contains breadcrumbs at top with content slot below for page-specific content