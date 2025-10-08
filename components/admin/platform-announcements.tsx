"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createPlatformAnnouncement,
  getAllPlatformAnnouncements,
  deletePlatformAnnouncement,
  PlatformAnnouncement,
} from "@/handlers/admin-handler";
import { Timestamp } from "firebase/firestore";

export function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [message, setMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState<
    "warning" | "success" | "info"
  >("info");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getAllPlatformAnnouncements();
    setAnnouncements(data);
  };

  const handleSendAnnouncement = async () => {
    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user ID from Clerk or context
      // For now, using a placeholder
      const createdBy = "admin"; // Replace with actual user ID

      const announcementId = await createPlatformAnnouncement({
        message,
        type: announcementType,
        createdBy,
      });

      if (announcementId) {
        // Send toast based on type
        if (announcementType === "warning") {
          toast.warning(message);
        } else if (announcementType === "success") {
          toast.success(message);
        } else {
          toast.info(message);
        }

        toast.success("Announcement sent successfully!");
        setMessage("");
        loadAnnouncements();
      } else {
        toast.error("Failed to send announcement");
      }
    } catch (error) {
      toast.error("Error sending announcement");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deletePlatformAnnouncement(id);
      toast.success("Announcement deleted");
      loadAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={announcementType}
              onChange={(e) =>
                setAnnouncementType(
                  e.target.value as "warning" | "success" | "info"
                )
              }
              className="w-full p-2 border rounded"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <Button
            onClick={handleSendAnnouncement}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Announcement"}
          </Button>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Recent Announcements</h3>
            <div className="space-y-2">
              {announcements.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No announcements yet
                </p>
              ) : (
                announcements.map((announcement, index) => {
                  const announcementId = (announcement as { docId?: string; id?: string }).docId || (announcement as { id?: string }).id || `announcement-${index}`;
                  return (
                    <div
                      key={announcementId}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{announcement.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              announcement.type === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : announcement.type === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {announcement.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {announcement.createdAt instanceof Timestamp
                              ? announcement.createdAt.toDate().toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcementId)}
                      >
                        Delete
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
