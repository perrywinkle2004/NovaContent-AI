import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListCampaigns, useDeleteCampaign, useDuplicateCampaign } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Copy, Trash2, Calendar, LayoutTemplate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaigns, isLoading, refetch } = useListCampaigns({
    query: { refetchOnWindowFocus: true }
  });

  const deleteMutation = useDeleteCampaign();
  const duplicateMutation = useDuplicateCampaign();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Campaign removed." });
        refetch();
      }
    });
  };

  const handleDuplicate = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Duplicated", description: "Campaign copied successfully." });
        refetch();
      }
    });
  };

  const filtered = (campaigns || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Campaign History</h1>
        <p className="text-muted-foreground">Manage and review your generated content</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search campaigns..." 
            className="pl-9 h-12 rounded-xl bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="generating">Generating</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-6">Create a new campaign to see it here.</p>
          <Button onClick={() => setLocation("/generate")}>Create Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation(`/campaigns/${campaign.id}`)}>
                  <CardContent className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className={
                        campaign.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                        campaign.status === 'failed' ? 'border-destructive text-destructive' :
                        campaign.status === 'generating' ? 'border-secondary text-secondary' :
                        'border-amber-500 text-amber-500'
                      }>
                        {campaign.status}
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{campaign.tone}</Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{campaign.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {campaign.productName} — {campaign.description}
                    </p>

                    <div className="flex items-center text-xs text-muted-foreground mt-auto">
                      <Calendar className="h-3 w-3 mr-2" />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 border-t border-border mt-4 flex justify-end gap-2 bg-card/50">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => handleDuplicate(campaign.id, e)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => handleDelete(campaign.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
