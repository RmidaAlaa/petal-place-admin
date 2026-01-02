import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Folder, Trash2, Clock, Share2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SavedBouquet {
  id: string;
  name: string;
  price: number;
  design_data: any;
  is_public: boolean;
  occasion: string | null;
  created_at: string;
}

interface SavedDesignsPanelProps {
  onLoadDesign: (designData: any) => void;
}

export const SavedDesignsPanel: React.FC<SavedDesignsPanelProps> = ({ onLoadDesign }) => {
  const [designs, setDesigns] = useState<SavedBouquet[]>([]);
  const [loading, setLoading] = useState(true);
  const { state: authState } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (authState.user) {
      fetchDesigns();
    } else {
      setLoading(false);
    }
  }, [authState.user]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_bouquets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_bouquets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDesigns(prev => prev.filter(d => d.id !== id));
      toast.success('Design deleted');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    }
  };

  const togglePublic = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_bouquets')
        .update({ is_public: !currentState })
        .eq('id', id);

      if (error) throw error;
      setDesigns(prev => prev.map(d => 
        d.id === id ? { ...d, is_public: !currentState } : d
      ));
      toast.success(currentState ? 'Design is now private' : 'Design is now public');
    } catch (error) {
      console.error('Error updating design:', error);
      toast.error('Failed to update design');
    }
  };

  if (!authState.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Folder className="w-4 h-4" />
            Saved Designs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Sign in to save and access your bouquet designs
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Folder className="w-4 h-4" />
            Saved Designs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Folder className="w-4 h-4" />
          Saved Designs ({designs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {designs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No saved designs yet. Create your first bouquet!
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{design.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary font-semibold">
                          {formatPrice(design.price)}
                        </span>
                        {design.occasion && (
                          <Badge variant="secondary" className="text-xs">
                            {design.occasion}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(design.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => togglePublic(design.id, design.is_public)}
                        title={design.is_public ? 'Make private' : 'Make public'}
                      >
                        {design.is_public ? (
                          <Globe className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => onLoadDesign(design.design_data)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(design.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
