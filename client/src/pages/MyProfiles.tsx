import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, Plus, Save, X, Upload, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useSignedUrl } from "@/hooks/use-signed-url";
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

function ProfilePhotoDisplay({ photoUrl }: { photoUrl: string | null | undefined }) {
  const signedUrl = useSignedUrl(photoUrl);
  if (!signedUrl) return null;
  return (
    <img 
      src={signedUrl} 
      alt="Profile" 
      className="w-20 h-20 object-cover rounded-md border"
    />
  );
}

export default function MyProfiles() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile & { photoUrl?: string | null }>>({});
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Session token to distinguish between edit sessions - prevents stale upload callbacks
  // from leaking into new edit sessions. Incremented on start/cancel/save.
  const editSessionTokenRef = useRef<number>(0);
  
  const { uploadFile, deleteFile, isUploading } = useSupabaseUpload({
    bucket: "profile-photos",
    folder: "uploads",
    // Note: Session-aware logic is handled in handleFileChange, not here
    onError: (error) => {
      toast({
        title: t("toast.uploadFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("auth.signInRequired"),
        description: t("auth.signInRequiredDesc"),
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast, setLocation, t]);

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/my-profiles"],
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, oldPhotoToDelete, orphanedPhotos }: { 
      id: number; 
      data: Partial<Profile>; 
      oldPhotoToDelete?: string | null;
      orphanedPhotos: string[];
    }) => {
      const response = await apiRequest("PUT", `/api/profiles/${id}`, data);
      const result = await response.json();
      return { result, oldPhotoToDelete, orphanedPhotos };
    },
    onSuccess: async ({ oldPhotoToDelete, orphanedPhotos }) => {
      // Increment session token to invalidate any in-flight uploads from this session
      editSessionTokenRef.current += 1;
      // Delete old photo from storage AFTER successful save
      if (oldPhotoToDelete) {
        try {
          await deleteFile(oldPhotoToDelete);
        } catch (err) {
          console.error("Failed to delete old photo:", err);
        }
      }
      // Delete orphaned photos (uploaded during session but not used)
      for (const orphan of orphanedPhotos) {
        try {
          await deleteFile(orphan);
        } catch (err) {
          console.error("Failed to delete orphaned photo:", err);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/my-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setEditingId(null);
      setOriginalPhotoUrl(null);
      setUploadedPhotos([]);
      toast({ title: t("myProfiles.profileUpdated"), description: t("myProfiles.profileUpdatedDesc") });
    },
    onError: async (error: Error, variables) => {
      // On save failure, clean up any uploaded photos to avoid orphans
      for (const orphan of variables.orphanedPhotos) {
        try {
          await deleteFile(orphan);
        } catch (err) {
          console.error("Failed to delete orphaned photo on error:", err);
        }
      }
      // Also delete the photo we just uploaded that was supposed to be saved
      const newPhotoUrl = variables.data.photoUrl;
      if (newPhotoUrl && newPhotoUrl !== originalPhotoUrl) {
        try {
          await deleteFile(newPhotoUrl);
        } catch (err) {
          console.error("Failed to delete new photo on error:", err);
        }
      }
      // Revert form state to original photo to prevent submitting deleted URL
      setEditForm(prev => ({ ...prev, photoUrl: originalPhotoUrl }));
      setUploadedPhotos([]);
      toast({ 
        title: t("myProfiles.updateFailed"), 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: t("myProfiles.profileDeleted"), description: t("myProfiles.profileDeletedDesc") });
    },
    onError: (error: Error) => {
      toast({ title: t("myProfiles.deleteFailed"), description: error.message, variant: "destructive" });
    },
  });

  const startEditing = (profile: Profile) => {
    // Increment session token to invalidate any pending uploads from previous sessions
    editSessionTokenRef.current += 1;
    setEditingId(profile.id);
    setOriginalPhotoUrl(profile.photoUrl || null);
    setUploadedPhotos([]);
    setEditForm({
      fullName: profile.fullName,
      villageName: profile.villageName,
      district: profile.district,
      yearLeft: profile.yearLeft,
      currentLocation: profile.currentLocation,
      story: profile.story,
      photoUrl: profile.photoUrl,
    });
  };

  const cancelEditing = async () => {
    // Increment session token FIRST to invalidate any in-flight uploads
    editSessionTokenRef.current += 1;
    // If user uploaded photos during this session but cancelled, delete them to avoid orphans
    for (const orphan of uploadedPhotos) {
      try {
        await deleteFile(orphan);
      } catch (err) {
        console.error("Failed to delete orphaned photo:", err);
      }
    }
    setEditingId(null);
    setEditForm({});
    setOriginalPhotoUrl(null);
    setUploadedPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveEdit = (id: number) => {
    const newPhotoUrl = editForm.photoUrl || null;
    
    // Determine if the original photo needs to be deleted (changed to different or removed)
    const oldPhotoToDelete = (originalPhotoUrl && originalPhotoUrl !== newPhotoUrl) 
      ? originalPhotoUrl 
      : null;
    
    // Determine which uploaded photos are orphans (not the one being saved)
    const orphanedPhotos = uploadedPhotos.filter(url => url !== newPhotoUrl);
    
    updateMutation.mutate({ id, data: editForm, oldPhotoToDelete, orphanedPhotos });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("toast.invalidFileType"),
        description: t("toast.pleaseSelectImage"),
        variant: "destructive",
      });
      return;
    }
    
    // Capture the session token in a closure BEFORE starting upload
    // This ensures we compare against the exact session when upload was initiated
    const uploadSessionToken = editSessionTokenRef.current;
    
    const response = await uploadFile(file);
    
    if (!response) {
      // Upload failed - error already shown by onError callback
      return;
    }
    
    // Check if the session has changed since upload started
    if (uploadSessionToken !== editSessionTokenRef.current) {
      // Session changed (user cancelled and possibly started new edit)
      // Delete this orphaned upload
      try {
        await deleteFile(response.publicUrl);
      } catch (err) {
        console.error("Failed to cleanup stale session upload:", err);
      }
      return;
    }
    
    // Session is still valid - update form state
    setEditForm(prev => ({ ...prev, photoUrl: response.publicUrl }));
    setUploadedPhotos(prev => [...prev, response.publicUrl]);
    toast({
      title: t("toast.uploadSuccess"),
      description: t("toast.uploadSuccessDesc"),
    });
  };

  const handleDeletePhoto = () => {
    // Just clear the photo URL from the form - actual storage deletion happens on save
    // This ensures data consistency: if user cancels, the original photo remains intact
    setEditForm(prev => ({ ...prev, photoUrl: null }));
    toast({
      title: t("myProfiles.photoDeleted"),
      description: t("myProfiles.photoDeletedDesc"),
    });
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
        <p className="text-muted-foreground">{t("auth.redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-secondary">{t("myProfiles.title")}</h1>
            <p className="text-muted-foreground">{t("myProfiles.subtitle")}</p>
          </div>
          <Link href="/submit">
            <Button data-testid="button-create-profile">
              <Plus className="mr-2 h-4 w-4" />
              {t("myProfiles.createNew")}
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
                      {profile.yearLeft && (
                        <span className="ml-2">• {t("myProfiles.leftIn")} {profile.yearLeft}</span>
                      )}
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
                              <AlertDialogTitle>{t("myProfiles.deleteTitle")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("myProfiles.deleteDescription")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(profile.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                {t("common.delete")}
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
                          <Label>{t("submit.villageName")}</Label>
                          <Input
                            value={editForm.villageName || ""}
                            onChange={(e) => setEditForm({ ...editForm, villageName: e.target.value })}
                            data-testid="input-edit-villagename"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("submit.district")}</Label>
                          <Input
                            value={editForm.district || ""}
                            onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                            data-testid="input-edit-district"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("submit.yearLeft")}</Label>
                          <Input
                            type="number"
                            value={editForm.yearLeft || ""}
                            onChange={(e) => setEditForm({ ...editForm, yearLeft: parseInt(e.target.value) || undefined })}
                            data-testid="input-edit-yearleft"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("submit.currentLocation")}</Label>
                          <Input
                            value={editForm.currentLocation || ""}
                            onChange={(e) => setEditForm({ ...editForm, currentLocation: e.target.value })}
                            data-testid="input-edit-currentlocation"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("submit.story")}</Label>
                        <Textarea
                          value={editForm.story || ""}
                          onChange={(e) => setEditForm({ ...editForm, story: e.target.value })}
                          className="min-h-[100px]"
                          data-testid="input-edit-story"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("myProfiles.profilePhoto")}</Label>
                        <div className="flex items-center gap-4 flex-wrap">
                          {editForm.photoUrl ? (
                            <div className="flex items-center gap-4">
                              <ProfilePhotoDisplay photoUrl={editForm.photoUrl} />
                              <div className="flex flex-col gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      disabled={updateMutation.isPending}
                                      data-testid="button-delete-photo"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t("myProfiles.deletePhoto")}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("myProfiles.deletePhotoTitle")}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("myProfiles.deletePhotoDescription")}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeletePhoto}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        {t("common.delete")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploading || updateMutation.isPending}
                                  data-testid="button-change-photo"
                                >
                                  {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                  )}
                                  {t("myProfiles.changePhoto")}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-muted rounded-md border flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || updateMutation.isPending}
                                data-testid="button-upload-photo"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                {t("myProfiles.uploadPhoto")}
                              </Button>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            data-testid="input-photo-file"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {profile.yearLeft && `${t("myProfiles.leftIn")} ${profile.yearLeft}`}
                        {profile.yearLeft && profile.currentLocation && " • "}
                        {profile.currentLocation && `${t("myProfiles.nowIn")} ${profile.currentLocation}`}
                      </p>
                      <p className="text-sm line-clamp-3">{profile.story}</p>
                      <Link href={`/profile/${profile.id}`}>
                        <Button variant="ghost" className="px-0 text-primary" data-testid={`link-view-profile-${profile.id}`}>
                          {t("myProfiles.viewFull")}
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
              <p className="text-muted-foreground mb-4">{t("myProfiles.noProfiles")}</p>
              <Link href="/submit">
                <Button data-testid="button-submit-first">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("myProfiles.submitFirst")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
