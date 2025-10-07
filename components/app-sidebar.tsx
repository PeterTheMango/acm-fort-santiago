"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  menuItems: [
    {
      title: "Dashboard",
      url: "/",
      imageSrc: "/dashboard.png",
    },
    {
      title: "Courses",
      url: "/courses",
      imageSrc: "/courses.png",
    },
    {
      title: "Upcoming Events",
      url: "/events",
      imageSrc: "/events.png",
    },
    {
      title: "Leaderboards",
      url: "/leaderboards",
      imageSrc: "/leaderboards.png",
    },
    {
      title: "Social",
      url: "/social",
      imageSrc: "/social.png",
    },
  ],
};

/**
 * Renders the application's left navigation sidebar with brand, menu items, and user area.
 *
 * The sidebar is collapsible in icon mode and includes a header with the brand/logo, a content area that maps configured menu items (each showing an image and title) and highlights the item whose URL matches the current pathname, a footer that displays the user panel, and a sidebar rail. All props are forwarded to the underlying Sidebar component.
 *
 * @param props - Props forwarded to the underlying Sidebar component.
 * @returns The Sidebar React element with navigation, header, footer, and rail.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4 bg-primary">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-16 py-3 text-primary-foreground hover:bg-primary hover:text-primary-foreground">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="ACM Fort Santiago"
                  width={56}
                  height={56}
                  className="object-contain shrink-0 rounded-lg"
                />
                <div className="flex flex-col gap-1 leading-none">
                  <span className="font-semibold text-base">
                    ACM Fort Santiago
                  </span>
                  <span className="text-sm opacity-80">Learning Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={pathname === item.url}
                  className="h-12 py-3 text-base"
                >
                  <Link href={item.url}>
                    <Image
                      src={item.imageSrc}
                      alt={item.title}
                      width={24}
                      height={24}
                      className="object-contain shrink-0"
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}