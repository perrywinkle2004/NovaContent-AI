import { useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { useGetCampaign, useRegenerateContent, useExportTxt } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Copy, RefreshCw, CheckCircle2, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:id");
  const campaignId = parseInt(params?.id || "0", 10);
  const { toast } = useToast();
  
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: campaign, isLoading, refetch } = useGetCampaign(campaignId, {
    query: {
      enabled: !!campaignId,
      refetchInterval: (query) => {
        return query.state.data?.status === 'generating' ? 3000 : false;
      }
    }
  });

  const exportQuery = useExportTxt(campaignId, {
    query: { enabled: false }, // Only fetch manually
    request: { responseType: 'blob' } // Important for file download
  });

  const regenerateMutation = useRegenerateContent();

  if (isLoading || !campaign) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading campaign data...</p>
      </div>
    );
  }

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const handleRegenerate = (contentType: string) => {
    regenerateMutation.mutate({ data: { campaignId, contentType } }, {
      onSuccess: () => {
        toast({ title: "Regenerating", description: `Re-crafting ${contentType} content...` });
        refetch(); // Refetch to start polling status again
      }
    });
  };

  const handleDownload = async () => {
    try {
      const { data } = await exportQuery.refetch();
      if (!data) return;
      
      const url = window.URL.createObjectURL(new Blob([data as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${campaign.name.replace(/\s+/g, '-').toLowerCase()}-campaign.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast({ variant: "destructive", title: "Export Failed", description: "Could not download the file." });
    }
  };

  // Group content by type for tabs
  const contentByType = campaign.content.reduce((acc, curr) => {
    if (!acc[curr.contentType]) acc[curr.contentType] = [];
    acc[curr.contentType].push(curr);
    return acc;
  }, {} as Record<string, typeof campaign.content>);

  const types = Object.keys(contentByType);

  return (
    <div className="space-y-8 pb-8 h-full flex flex-col">
      {/* Header Info */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                  <Badge variant="outline" className={
                    campaign.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                    campaign.status === 'failed' ? 'border-destructive text-destructive' :
                    'border-secondary text-secondary'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">{campaign.productName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{campaign.category}</Badge>
                  <Badge variant="secondary">{campaign.tone}</Badge>
                  <Badge variant="secondary">{campaign.goal}</Badge>
                </div>
              </div>
              
              <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={campaign.status !== 'completed'}>
                <Download className="h-4 w-4" />
                Export TXT
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Area */}
      {campaign.status === 'generating' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border mt-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <h3 className="text-2xl font-bold mb-2">Generating Content...</h3>
          <p className="text-muted-foreground">Your campaign is currently being crafted. This may take a few moments.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 mt-4">
          <Tabs defaultValue={types.length > 0 ? types[0] : "images"} className="w-full flex flex-col h-full">
            <div className="overflow-x-auto pb-2 mb-4">
              <TabsList className="bg-card inline-flex h-12 items-center justify-center rounded-xl p-1 text-muted-foreground">
                {types.map(t => (
                  <TabsTrigger key={t} value={t} className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize">
                    {t}
                  </TabsTrigger>
                ))}
                {campaign.images && campaign.images.length > 0 && (
                  <TabsTrigger value="images" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize">
                    Images
                  </TabsTrigger>
                )}
                <TabsTrigger value="raw" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize">
                  Raw Output
                </TabsTrigger>
              </TabsList>
            </div>

            {types.map(type => (
              <TabsContent key={type} value={type} className="flex-1 mt-0">
                <div className="grid grid-cols-1 gap-6">
                  {contentByType[type].map((item) => (
                    <Card key={item.id} className="overflow-hidden border-border/50">
                      <div className="flex justify-between items-center bg-card/50 p-4 border-b border-border">
                        <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          ID: {item.id}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content, item.id)} className="gap-2">
                            {copiedId === item.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRegenerate(type)} className="gap-2" disabled={regenerateMutation.isPending}>
                            <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <ScrollArea className="max-h-[500px] p-6">
                          <div className="prose prose-invert prose-violet max-w-none whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                            {item.content}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}

            {campaign.images && campaign.images.length > 0 && (
              <TabsContent value="images" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaign.images.map((img) => (
                    <Card key={img.id} className="overflow-hidden group">
                      <div className="aspect-video relative bg-muted overflow-hidden">
                        {/* Assuming imageUrl is valid, fallback handled if broken */}
                        <img src={img.imageUrl} alt={img.prompt} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                           <Button variant="secondary" size="sm" onClick={() => window.open(img.imageUrl, '_blank')} className="gap-2">
                             <Download className="h-4 w-4" /> Download
                           </Button>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{img.imageType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{img.prompt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="raw" className="mt-0 flex-1">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <ScrollArea className="h-[600px] w-full bg-[#0a0a0f] p-4 rounded-xl">
                    <pre className="font-mono text-xs text-secondary whitespace-pre-wrap">
                      {JSON.stringify(campaign, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
