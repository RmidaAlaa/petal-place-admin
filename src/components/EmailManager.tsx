import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEmail } from '@/contexts/EmailContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  type: 'welcome' | 'promotional' | 'newsletter' | 'abandoned_cart' | 'birthday' | 'review_request';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  scheduledFor?: string;
}

const EmailManager = () => {
  const { sendBulkEmails } = useEmail();
  const { toast } = useToast();
  
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: '1',
      name: 'Welcome New Users',
      subject: 'Welcome to Roses Garden! 🌹',
      type: 'welcome',
      status: 'sent',
      recipientCount: 150,
      sentCount: 148,
      openRate: 78.5,
      clickRate: 23.2,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Valentine\'s Day Special',
      subject: 'Special Valentine\'s Day Offer - 20% Off! 💕',
      type: 'promotional',
      status: 'scheduled',
      recipientCount: 2500,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: '2024-01-20',
      scheduledFor: '2024-02-10T09:00:00Z',
    },
    {
      id: '3',
      name: 'Abandoned Cart Reminder',
      subject: 'Don\'t forget your beautiful flowers! 🌹',
      type: 'abandoned_cart',
      status: 'sent',
      recipientCount: 45,
      sentCount: 45,
      openRate: 65.2,
      clickRate: 18.9,
      createdAt: '2024-01-18',
    },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    type: 'promotional' as const,
    content: '',
    recipientGroup: 'all' as const,
    scheduledFor: '',
  });

  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      type: newCampaign.type,
      status: newCampaign.scheduledFor ? 'scheduled' : 'draft',
      recipientCount: 0,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      scheduledFor: newCampaign.scheduledFor || undefined,
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      subject: '',
      type: 'promotional',
      content: '',
      recipientGroup: 'all',
      scheduledFor: '',
    });

    toast({
      title: 'Success',
      description: 'Campaign created successfully',
    });
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    try {
      // Simulate sending emails
      const emails = [
        {
          type: campaign.type,
          data: {
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            subject: campaign.subject,
            content: newCampaign.content,
          },
        },
      ];

      const result = await sendBulkEmails(emails);
      
      setCampaigns(campaigns.map(c => 
        c.id === campaign.id 
          ? { ...c, status: 'sent', sentCount: result.success }
          : c
      ));

      toast({
        title: 'Campaign Sent',
        description: `Successfully sent ${result.success} emails`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send campaign',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500 text-white';
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'draft':
        return 'bg-gray-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'promotional':
        return '🎯';
      case 'newsletter':
        return '📰';
      case 'abandoned_cart':
        return '🛒';
      case 'birthday':
        return '🎂';
      case 'review_request':
        return '⭐';
      default:
        return '📧';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Management</h2>
          <p className="text-muted-foreground">Create and manage email campaigns</p>
        </div>
        <Button onClick={() => setSelectedCampaign(null)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getTypeIcon(campaign.type)}</div>
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {campaign.sentCount}/{campaign.recipientCount} sent
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendCampaign(campaign)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Campaigns</span>
                    <span className="font-semibold">{campaigns.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent Today</span>
                    <span className="font-semibold">
                      {campaigns.filter(c => c.status === 'sent').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Open Rate</span>
                    <span className="font-semibold">
                      {Math.round(
                        campaigns
                          .filter(c => c.status === 'sent')
                          .reduce((acc, c) => acc + c.openRate, 0) /
                        campaigns.filter(c => c.status === 'sent').length || 0
                      )}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Click Rate</span>
                    <span className="font-semibold">
                      {Math.round(
                        campaigns
                          .filter(c => c.status === 'sent')
                          .reduce((acc, c) => acc + c.clickRate, 0) /
                        campaigns.filter(c => c.status === 'sent').length || 0
                      )}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Welcome Email', type: 'welcome', icon: '👋' },
                  { name: 'Order Confirmation', type: 'order_confirmation', icon: '📦' },
                  { name: 'Password Reset', type: 'password_reset', icon: '🔐' },
                  { name: 'Promotional', type: 'promotional', icon: '🎯' },
                  { name: 'Newsletter', type: 'newsletter', icon: '📰' },
                  { name: 'Abandoned Cart', type: 'abandoned_cart', icon: '🛒' },
                  { name: 'Birthday Discount', type: 'birthday', icon: '🎂' },
                  { name: 'Review Request', type: 'review_request', icon: '⭐' },
                ].map((template) => (
                  <div
                    key={template.type}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">Click to edit template</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Emails Sent</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">72.3%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-sage" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">18.7%</p>
                  </div>
                  <Users className="h-8 w-8 text-coral" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unsubscribe Rate</p>
                    <p className="text-2xl font-bold">2.1%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input id="from-name" defaultValue="Roses Garden" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input id="from-email" defaultValue="noreply@rosesgarden.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-to">Reply To Email</Label>
                  <Input id="reply-to" defaultValue="support@rosesgarden.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your email service API key" />
                </div>
              </div>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Campaign Modal */}
      {!selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(value: any) => setNewCampaign({ ...newCampaign, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="abandoned_cart">Abandoned Cart</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="review_request">Review Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                placeholder="Enter email content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-group">Recipient Group</Label>
                <Select
                  value={newCampaign.recipientGroup}
                  onValueChange={(value: any) => setNewCampaign({ ...newCampaign, recipientGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="new">New Customers</SelectItem>
                    <SelectItem value="vip">VIP Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-for">Schedule For (Optional)</Label>
                <Input
                  id="scheduled-for"
                  type="datetime-local"
                  value={newCampaign.scheduledFor}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledFor: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailManager;
