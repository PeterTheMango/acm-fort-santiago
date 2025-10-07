# UX Structure Plan: Student Portal Dashboard Layout

## Navigation Flow
└── Primary User Journey
    ├── User lands on Dashboard (default landing page after authentication)
    ├── User views overview of key information and metrics
    ├── User navigates to specific sections via Sidebar Navigation
    ├── User tracks current location via Breadcrumbs
    └── User interacts with section-specific content and features

## Sidebar Navigation
└── Sidebar Container
    ├── Logo/Branding Area
    │   └── Organization logo with link to Dashboard home
    ├── Primary Navigation Items
    │   ├── Dashboard
    │   │   ├── Icon: Home/Dashboard icon
    │   │   └── Label: "Dashboard"
    │   ├── My Courses
    │   │   ├── Icon: Book/Courses icon
    │   │   └── Label: "My Courses"
    │   ├── Assignments
    │   │   ├── Icon: Clipboard/Tasks icon
    │   │   ├── Label: "Assignments"
    │   │   └── Badge: Notification count for pending assignments
    │   ├── Calendar
    │   │   ├── Icon: Calendar icon
    │   │   └── Label: "Calendar"
    │   ├── Grades
    │   │   ├── Icon: Chart/Analytics icon
    │   │   └── Label: "Grades"
    │   ├── Resources
    │   │   ├── Icon: Folder/Library icon
    │   │   └── Label: "Resources"
    │   ├── Messages
    │   │   ├── Icon: Mail/Envelope icon
    │   │   ├── Label: "Messages"
    │   │   └── Badge: Unread message count
    │   └── Profile
    │       ├── Icon: User/Person icon
    │       └── Label: "Profile"
    ├── Secondary Navigation Items
    │   ├── Settings
    │   │   ├── Icon: Gear/Settings icon
    │   │   └── Label: "Settings"
    │   └── Help & Support
    │       ├── Icon: Question mark/Help icon
    │       └── Label: "Help & Support"
    └── User Section (Bottom)
        ├── User Avatar
        ├── User Name Display
        ├── User Role Label (e.g., "Student")
        └── Sign Out Button

## Breadcrumbs
└── Breadcrumb Container
    ├── Position: Top of page, below header, above main content
    ├── Structure Pattern
    │   └── Home Icon > Section Name > Subsection Name (if applicable) > Current Page
    ├── Example Scenarios
    │   ├── Dashboard Page
    │   │   └── Home Icon > Dashboard
    │   ├── Course List Page
    │   │   └── Home Icon > My Courses
    │   ├── Individual Course Page
    │   │   └── Home Icon > My Courses > [Course Name]
    │   ├── Assignment List Page
    │   │   └── Home Icon > Assignments
    │   ├── Individual Assignment Page
    │   │   └── Home Icon > Assignments > [Assignment Name]
    │   ├── Calendar Page
    │   │   └── Home Icon > Calendar
    │   ├── Grades Overview Page
    │   │   └── Home Icon > Grades
    │   ├── Course Grades Page
    │   │   └── Home Icon > Grades > [Course Name]
    │   ├── Resources Page
    │   │   └── Home Icon > Resources
    │   ├── Resource Category Page
    │   │   └── Home Icon > Resources > [Category Name]
    │   ├── Messages Page
    │   │   └── Home Icon > Messages
    │   ├── Individual Message Thread
    │   │   └── Home Icon > Messages > [Conversation Title]
    │   ├── Profile Page
    │   │   └── Home Icon > Profile
    │   ├── Settings Page
    │   │   └── Home Icon > Settings
    │   └── Help & Support Page
    │       └── Home Icon > Help & Support
    ├── Interaction Behavior
    │   ├── Each breadcrumb segment is clickable (except current page)
    │   ├── Hovering over segment shows hover state (underline or color change)
    │   ├── Clicking segment navigates to that level
    │   └── Current page segment is non-clickable and visually distinct (bold or different color)
    └── Visual Styling
        ├── Separator: Right arrow (>) or forward slash (/)
        ├── Font: Small to medium size, secondary text color
        ├── Current page: Primary text color, bold weight
        └── Responsive behavior: Truncate middle segments on mobile, show "..." with tooltip on hover

## Dashboard Page Layout
└── Main Content Area
    ├── Page Header
    │   ├── Page Title: "Dashboard"
    │   ├── Welcome Message: "Welcome back, [Student Name]"
    │   └── Current Date/Time Display
    ├── Quick Stats Section
    │   ├── Active Courses Card
    │   │   ├── Icon
    │   │   ├── Count Display
    │   │   └── Label: "Active Courses"
    │   ├── Pending Assignments Card
    │   │   ├── Icon
    │   │   ├── Count Display
    │   │   └── Label: "Due This Week"
    │   ├── Upcoming Events Card
    │   │   ├── Icon
    │   │   ├── Count Display
    │   │   └── Label: "Upcoming Events"
    │   └── Average Grade Card
    │       ├── Icon
    │       ├── Percentage/GPA Display
    │       └── Label: "Current Average"
    ├── Recent Activity Section
    │   ├── Section Header: "Recent Activity"
    │   ├── Activity Feed
    │   │   ├── Activity Item 1
    │   │   │   ├── Icon (based on activity type)
    │   │   │   ├── Activity Description
    │   │   │   └── Timestamp
    │   │   ├── Activity Item 2
    │   │   └── Activity Item 3
    │   └── View All Link
    ├── Upcoming Assignments Section
    │   ├── Section Header: "Upcoming Assignments"
    │   ├── Assignment List
    │   │   ├── Assignment Item 1
    │   │   │   ├── Assignment Title
    │   │   │   ├── Course Name
    │   │   │   ├── Due Date
    │   │   │   └── Priority Indicator
    │   │   ├── Assignment Item 2
    │   │   └── Assignment Item 3
    │   └── View All Assignments Link
    ├── Calendar Widget Section
    │   ├── Section Header: "This Week"
    │   ├── Mini Calendar View
    │   │   ├── Current Week Display
    │   │   ├── Event Indicators on Dates
    │   │   └── Selected Date Details
    │   └── View Full Calendar Link
    └── Announcements Section
        ├── Section Header: "Recent Announcements"
        ├── Announcement List
        │   ├── Announcement Item 1
        │   │   ├── Title
        │   │   ├── Preview Text
        │   │   ├── Posted Date
        │   │   └── Course/Source
        │   ├── Announcement Item 2
        │   └── Announcement Item 3
        └── View All Announcements Link