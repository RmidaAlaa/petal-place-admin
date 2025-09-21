import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  Target,
  Bell,
  Send,
  Archive,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'promotion' | 'event' | 'maintenance' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  targetAudience: 'all' | 'customers' | 'partners' | 'staff';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  views: number;
  clicks: number;
  imageUrl?: string;
  tags: string[];
}

const AnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'medium' as const,
    targetAudience: 'all' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tags: [] as string[]
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    // Mock data - in real app, this would be an API call
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Valentine\'s Day Special Offer',
        content: 'Get 20% off on all rose bouquets this Valentine\'s Day! Limited time offer valid until February 14th.',
        type: 'promotion',
        priority: 'high',
        status: 'published',
        targetAudience: 'all',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25',
        createdBy: 'Admin',
        views: 1250,
        clicks: 89,
        tags: ['valentines', 'promotion', 'roses']
      },
      {
        id: '2',
        title: 'Scheduled Maintenance Notice',
        content: 'Our website will be undergoing scheduled maintenance on Sunday, February 18th from 2:00 AM to 4:00 AM EST.',
        type: 'maintenance',
        priority: 'medium',
        status: 'published',
        targetAudience: 'all',
        startDate: '2024-02-15',
        endDate: '2024-02-18',
        createdAt: '2024-02-10',
        updatedAt: '2024-02-10',
        createdBy: 'Admin',
        views: 567,
        clicks: 23,
        tags: ['maintenance', 'notice']
      },
      {
        id: '3',
        title: 'New Flower Arrivals',
        content: 'We\'ve just received fresh shipments of exotic orchids and lilies. Visit our store to see the beautiful new collection!',
        type: 'info',
        priority: 'low',
        status: 'draft',
        targetAudience: 'customers',
        startDate: '2024-02-20',
        createdAt: '2024-02-15',
        updatedAt: '2024-02-15',
        createdBy: 'Admin',
        views: 0,
        clicks: 0,
        tags: ['new-arrivals', 'orchids', 'lilies']
      }
    ];
    setAnnouncements(mockAnnouncements);
  };

  const createAnnouncement = () => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.type,
      priority: newAnnouncement.priority,
      status: 'draft',
      targetAudience: newAnnouncement.targetAudience,
      startDate: newAnnouncement.startDate,
      endDate: newAnnouncement.endDate || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
      views: 0,
      clicks: 0,
      tags: newAnnouncement.tags
    };

    setAnnouncements([...announcements, announcement]);
    setIsCreateDialogOpen(false);
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      targetAudience: 'all',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      tags: []
    });
  };

  const publishAnnouncement = (announcement: Announcement) => {
    const updatedAnnouncements = announcements.map(ann =>
      ann.id === announcement.id ? { ...ann, status: 'published' as const } : ann
    );
    setAnnouncements(updatedAnnouncements);
  };

  const archiveAnnouncement = (announcement: Announcement) => {
    const updatedAnnouncements = announcements.map(ann =>
      ann.id === announcement.id ? { ...ann, status: 'archived' as const } : ann
    );
    setAnnouncements(updatedAnnouncements);
  };

  const deleteAnnouncement = (announcementId: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
  };

  const duplicateAnnouncement = (announcement: Announcement) => {
    const duplicated: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      title: `${announcement.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      clicks: 0
    };
    setAnnouncements([...announcements, duplicated]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotion':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesType = typeFilter === 'all' || announcement.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage announcements for your website</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="update">Update</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newAnnouncement.type} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={newAnnouncement.targetAudience} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, targetAudience: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="partners">Partners</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newAnnouncement.startDate}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newAnnouncement.endDate}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter announcement content"
                      rows={8}
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g. promotion, valentines, roses"
                      value={newAnnouncement.tags.join(', ')}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createAnnouncement}>Create Announcement</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.filter(a => a.status === 'published').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.reduce((sum, a) => sum + a.views, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{announcement.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {announcement.targetAudience} • {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(announcement.type)}>
                      {announcement.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(announcement.status)}>
                      {announcement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(announcement.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{announcement.views.toLocaleString()}</TableCell>
                  <TableCell>{announcement.clicks.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setIsPreviewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateAnnouncement(announcement)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {announcement.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => publishAnnouncement(announcement)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {announcement.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveAnnouncement(announcement)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Preview</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(selectedAnnouncement.type)}>
                    {selectedAnnouncement.type}
                  </Badge>
                  <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                    {selectedAnnouncement.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedAnnouncement.status)}>
                    {selectedAnnouncement.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">{selectedAnnouncement.title}</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{selectedAnnouncement.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{selectedAnnouncement.clicks.toLocaleString()} clicks</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{selectedAnnouncement.targetAudience}</span>
                </div>
              </div>

              {selectedAnnouncement.tags.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {selectedAnnouncement.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Website
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsManager;