import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, LogOut, Loader2 } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();

  const handleLogout = () => {
    removeToken();
    setLocation("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user.email} disabled className="bg-muted/50 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>Member Since</Label>
            <Input value={new Date(user.createdAt).toLocaleDateString()} disabled className="bg-muted/50 cursor-not-allowed" />
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">You are currently on the <strong className="text-foreground">Pro Plan</strong> (Active).</p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Manage Billing</Button>
        </CardContent>
      </Card>
    </div>
  );
}
