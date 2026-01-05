import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyProfiles() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to view your profiles.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/my-profiles"],
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Profile> }) => {
      const response = await apiRequest("PUT", `/api/profiles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setEditingId(null);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile Deleted", description: "The profile has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = (profile: Profile) => {
    setEditingId(profile.id);
    setEditForm({
      fullName: profile.fullName,
      villageName: profile.villageName,
      district: profile.district,
      yearLeft: profile.yearLeft,
      currentLocation: profile.currentLocation,
      story: profile.story,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: number) => {
    updateMutation.mutate({ id, data: editForm });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-secondary">My Profiles</h1>
            <p className="text-muted-foreground">Manage the profiles you have submitted</p>
          </div>
          <Link href="/submit">
            <Button data-testid="button-create-profile">
              <Plus className="mr-2 h-4 w-4" />
              Create New Profile
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="space-y-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden" data-testid={`card-profile-${profile.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    {editingId === profile.id ? (
                      <Input
                        value={editForm.fullName || ""}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="font-serif text-xl font-bold"
                        data-testid="input-edit-fullname"
                      />
                    ) : (
                      <CardTitle className="font-serif text-xl">{profile.fullName}</CardTitle>
                    )}
                    <CardDescription>
                      {profile.villageName}, {profile.district}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editingId === profile.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(profile.id)}
                          disabled={updateMutation.isPending}
                          data-testid="button-save-edit"
                        >
                          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} data-testid="button-cancel-edit">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEditing(profile)} data-testid={`button-edit-${profile.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" data-testid={`button-delete-${profile.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this profile? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(profile.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === profile.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Village Name</Label>
                          <Input
                            value={editForm.villageName || ""}
                            onChange={(e) => setEditForm({ ...editForm, villageName: e.target.value })}
                            data-testid="input-edit-villagename"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>District</Label>
                          <Input
                            value={editForm.district || ""}
                            onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                            data-testid="input-edit-district"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year Left</Label>
                          <Input
                            type="number"
                            value={editForm.yearLeft || ""}
                            onChange={(e) => setEditForm({ ...editForm, yearLeft: parseInt(e.target.value) || undefined })}
                            data-testid="input-edit-yearleft"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Current Location</Label>
                          <Input
                            value={editForm.currentLocation || ""}
                            onChange={(e) => setEditForm({ ...editForm, currentLocation: e.target.value })}
                            data-testid="input-edit-currentlocation"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Story</Label>
                        <Textarea
                          value={editForm.story || ""}
                          onChange={(e) => setEditForm({ ...editForm, story: e.target.value })}
                          className="min-h-[100px]"
                          data-testid="input-edit-story"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {profile.yearLeft && `Left in ${profile.yearLeft}`}
                        {profile.yearLeft && profile.currentLocation && " • "}
                        {profile.currentLocation && `Now in ${profile.currentLocation}`}
                      </p>
                      <p className="text-sm line-clamp-3">{profile.story}</p>
                      <Link href={`/profile/${profile.id}`}>
                        <Button variant="ghost" className="px-0 text-primary" data-testid={`link-view-profile-${profile.id}`}>
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You haven't submitted any profiles yet.</p>
              <Link href="/submit">
                <Button data-testid="button-submit-first">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Your First Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
