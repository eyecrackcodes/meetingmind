import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Archive,
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  Calendar,
  Folder,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import {
  Objective,
  MeetingTemplate,
  OKRCycle,
  ArchiveOperation,
  BulkOperation,
} from "@/types";

interface ArchiveManagerProps {
  objectives: Objective[];
  templates: MeetingTemplate[];
  cycles: OKRCycle[];
  onArchive: (
    type: "objective" | "template" | "cycle",
    id: string,
    reason?: string
  ) => Promise<boolean>;
  onRestore: (
    type: "objective" | "template" | "cycle",
    id: string
  ) => Promise<boolean>;
  onPermanentDelete: (
    type: "objective" | "template" | "cycle",
    id: string
  ) => Promise<boolean>;
  onBulkOperation: (operation: BulkOperation) => Promise<boolean>;
  archiveHistory: ArchiveOperation[];
}

export function ArchiveManager({
  objectives,
  templates,
  cycles,
  onArchive,
  onRestore,
  onPermanentDelete,
  onBulkOperation,
  archiveHistory,
}: ArchiveManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "objectives" | "templates" | "cycles" | "history"
  >("objectives");
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // Bulk action state (future implementation)
  // const [bulkAction, setBulkAction] = useState<"archive" | "restore" | "delete" | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);

  // Filter data based on current tab and settings
  const getFilteredData = useCallback(() => {
    let data: any[] = [];

    switch (activeTab) {
      case "objectives":
        data = objectives.filter((obj) =>
          showArchived ? obj.status === "archived" : obj.status !== "archived"
        );
        break;
      case "templates":
        data = templates.filter((template) =>
          showArchived
            ? template.status === "archived"
            : template.status !== "archived"
        );
        break;
      case "cycles":
        data = cycles.filter((cycle) =>
          showArchived
            ? cycle.status === "archived"
            : cycle.status !== "archived"
        );
        break;
      case "history":
        data = archiveHistory;
        break;
    }

    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.meetingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [
    activeTab,
    showArchived,
    searchTerm,
    objectives,
    templates,
    cycles,
    archiveHistory,
  ]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const filteredData = getFilteredData();
    const allIds = filteredData.map((item) => item.id);
    setSelectedItems(selectedItems.length === allIds.length ? [] : allIds);
  };

  const handleSingleAction = async (
    action: "archive" | "restore" | "delete",
    itemId: string,
    itemTitle: string
  ) => {
    setConfirmAction({
      type: "single",
      action,
      itemId,
      itemTitle,
      resourceType:
        activeTab === "objectives"
          ? "objective"
          : activeTab === "templates"
          ? "template"
          : "cycle",
    });
    setShowConfirmDialog(true);
  };

  const handleBulkAction = async (action: "archive" | "restore" | "delete") => {
    if (selectedItems.length === 0) return;

    setConfirmAction({
      type: "bulk",
      action,
      itemIds: selectedItems,
      resourceType:
        activeTab === "objectives"
          ? "objective"
          : activeTab === "templates"
          ? "template"
          : "cycle",
    });
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "single") {
        const { action, itemId, resourceType } = confirmAction;

        switch (action) {
          case "archive":
            await onArchive(resourceType, itemId, archiveReason);
            break;
          case "restore":
            await onRestore(resourceType, itemId);
            break;
          case "delete":
            await onPermanentDelete(resourceType, itemId);
            break;
        }
      } else {
        // Bulk operation
        const bulkOp: BulkOperation = {
          id: `bulk_${Date.now()}`,
          userId: "current-user", // Replace with actual user ID
          operation: confirmAction.action,
          resourceType: confirmAction.resourceType,
          resourceIds: confirmAction.itemIds,
          parameters:
            confirmAction.action === "archive" ? { reason: archiveReason } : {},
          timestamp: new Date().toISOString(),
          results: { successful: [], failed: [] },
        };

        await onBulkOperation(bulkOp);
        setSelectedItems([]);
      }

      setShowConfirmDialog(false);
      setConfirmAction(null);
      setArchiveReason("");
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "objectives":
        return <Folder className="h-4 w-4" />;
      case "templates":
        return <FileText className="h-4 w-4" />;
      case "cycles":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      archived: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="h-6 w-6" />
            Archive Manager
          </h2>
          <p className="text-gray-600">
            Manage, archive, and restore your OKRs and templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
          >
            {showArchived ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "objectives", label: "Objectives", count: objectives.length },
          { id: "templates", label: "Templates", count: templates.length },
          { id: "cycles", label: "Cycles", count: cycles.length },
          { id: "history", label: "History", count: archiveHistory.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {activeTab !== "history" && (
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleBulkAction(showArchived ? "restore" : "archive")
                  }
                  className="flex items-center gap-1"
                >
                  {showArchived ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                  {showArchived ? "Restore" : "Archive"}
                </Button>
                {showArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("delete")}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getItemIcon(activeTab)}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              {showArchived && " (Archived)"}
            </CardTitle>

            {activeTab !== "history" && filteredData.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.length === filteredData.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-600">
                {showArchived
                  ? `No archived ${activeTab} to display`
                  : `No active ${activeTab} to display`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {activeTab !== "history" && (
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemSelect(item.id)}
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {item.title || item.name || item.meetingTitle}
                        </h4>
                        {item.status && getStatusBadge(item.status)}
                      </div>

                      <div className="text-sm text-gray-600">
                        {activeTab === "objectives" && (
                          <span>
                            {item.category} • {item.level} • {item.quarter}
                          </span>
                        )}
                        {activeTab === "templates" && (
                          <span>
                            {item.facilitator} •{" "}
                            {new Date(item.meetingDate).toLocaleDateString()}
                          </span>
                        )}
                        {activeTab === "cycles" && (
                          <span>
                            Q{item.quarter} {item.year} •{" "}
                            {item.objectives?.length || 0} objectives
                          </span>
                        )}
                        {activeTab === "history" && (
                          <span>
                            {item.action} • {item.resourceType} •{" "}
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {item.archivedDate && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Archived on{" "}
                          {new Date(item.archivedDate).toLocaleDateString()}
                          {item.archivedReason && ` - ${item.archivedReason}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {activeTab !== "history" && (
                    <div className="flex items-center gap-2">
                      {showArchived ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSingleAction(
                                "restore",
                                item.id,
                                item.title || item.name
                              )
                            }
                            className="flex items-center gap-1"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSingleAction(
                                "delete",
                                item.id,
                                item.title || item.name
                              )
                            }
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSingleAction(
                              "archive",
                              item.id,
                              item.title || item.name
                            )
                          }
                          className="flex items-center gap-1"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">
                Confirm{" "}
                {confirmAction?.action === "delete"
                  ? "Permanent Delete"
                  : confirmAction?.action}
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              {confirmAction?.type === "single" ? (
                confirmAction?.action === "delete" ? (
                  <>
                    This will permanently delete "
                    <strong>{confirmAction.itemTitle}</strong>". This action
                    cannot be undone.
                  </>
                ) : confirmAction?.action === "archive" ? (
                  <>
                    This will archive "
                    <strong>{confirmAction.itemTitle}</strong>". You can restore
                    it later.
                  </>
                ) : (
                  <>
                    This will restore "
                    <strong>{confirmAction.itemTitle}</strong>" to active
                    status.
                  </>
                )
              ) : confirmAction?.action === "delete" ? (
                <>
                  This will permanently delete {selectedItems.length} items.
                  This action cannot be undone.
                </>
              ) : confirmAction?.action === "archive" ? (
                <>
                  This will archive {selectedItems.length} items. You can
                  restore them later.
                </>
              ) : (
                <>
                  This will restore {selectedItems.length} items to active
                  status.
                </>
              )}
            </p>

            {confirmAction?.action === "archive" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for archiving (optional)
                </label>
                <Textarea
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="e.g., Completed project, outdated objective, etc."
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                  setArchiveReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmAction?.action === "delete" ? "destructive" : "default"
                }
                onClick={executeAction}
              >
                {confirmAction?.action === "delete"
                  ? "Permanently Delete"
                  : confirmAction?.action?.charAt(0).toUpperCase() +
                    confirmAction?.action?.slice(1)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
