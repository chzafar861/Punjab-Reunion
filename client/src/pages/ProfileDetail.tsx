import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MapPin, Calendar, Globe, Share2, MessageCircle, Send, Facebook, Twitter, Link as LinkIcon, Edit2, Trash2, MoreVertical, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type ProfileComment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const commentSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Comment is required"),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function ProfileDetail() {
  const [, params] = useRoute("/profile/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useProfile(id);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // State for comment editing
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  
  // Get display name from authenticated user
  const displayName = user?.username || 
    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName) || 
    "";
  
  // Check if current user owns this profile
  const isProfileOwner = isAuthenticated && user?.id && profile?.userId === user.id;

  useSEO({
    title: profile ? `${profile.fullName} from ${profile.villageName}` : "Profile Details",
    description: profile 
      ? `Heritage profile of ${profile.fullName} from ${profile.villageName}, ${profile.district}. ${profile.story?.slice(0, 150)}...` 
      : "View detailed heritage profile and family story from pre-partition Punjab.",
    keywords: profile 
      ? `${profile.villageName}, ${profile.district}, Punjab heritage, partition family, ${profile.fullName}`
      : "heritage profile, partition story, Punjab family",
    canonicalPath: `/profile/${id}`,
    ogType: "article",
  });
  
  const { data: comments = [], isLoading: commentsLoading } = useQuery<ProfileComment[]>({
    queryKey: ['/api/profiles', id, 'comments'],
    queryFn: () => fetch(`/api/profiles/${id}/comments`).then(res => res.json()),
    enabled: !!id,
  });

  const createComment = useMutation({
    mutationFn: (data: CommentFormData) => 
      apiRequest("POST", `/api/profiles/${id}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', id, 'comments'] });
      toast({
        title: "Comment Posted",
        description: "Your comment has been added.",
      });
      form.reset();
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      apiRequest("PUT", `/api/comments/${commentId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', id, 'comments'] });
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated.",
      });
      setEditingCommentId(null);
      setEditingContent("");
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) =>
      apiRequest("DELETE", `/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', id, 'comments'] });
      toast({
        title: "Comment Deleted",
        description: "Your comment has been removed.",
      });
      setDeleteCommentId(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const deleteProfile = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      toast({
        title: "Profile Deleted",
        description: "Your profile has been removed.",
      });
      setDeleteProfileOpen(false);
      setLocation("/directory");
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      authorName: displayName,
      content: "",
    }
  });

  // Update authorName when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && displayName) {
      form.setValue("authorName", displayName);
    }
  }, [isAuthenticated, displayName, form]);

  const onSubmitComment = (data: CommentFormData) => {
    // Ensure authorName is set from authenticated user if available
    const submitData = {
      ...data,
      authorName: isAuthenticated && displayName ? displayName : data.authorName,
    };
    createComment.mutate(submitData);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${profile?.fullName}'s heritage profile from ${profile?.villageName}, ${profile?.district}`;
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Profile link has been copied to clipboard.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-serif">Profile not found</h2>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const placeholderImage = "https://images.unsplash.com/photo-1544256658-63640b7952a2?w=800&h=800&fit=crop";
  const signedImageUrl = useSignedUrl(profile.photoUrl);
  const displayImage = signedImageUrl || placeholderImage;

  return (
    <div className="min-h-screen bg-background pb-24 pt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          {/* Header with Details */}
          <div className="p-8 md:p-12 space-y-6">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wider">
                    {profile.district}
                  </span>
                  {profile.yearLeft && (
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full tracking-wider">
                      Since {profile.yearLeft}
                    </span>
                  )}
                </div>
                {isProfileOwner && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/my-profiles?edit=${id}`)}
                      data-testid="button-edit-profile"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteProfileOpen(true)}
                      data-testid="button-delete-profile"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-2">
                {profile.fullName}
              </h1>
              <p className="text-xl text-muted-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> 
                Village {profile.villageName}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-1" />
                <div>
                  <span className="block text-sm font-semibold text-secondary uppercase">Current Location</span>
                  <span className="text-foreground">{profile.currentLocation || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <div>
                  <span className="block text-sm font-semibold text-secondary uppercase">Year of Migration</span>
                  <span className="text-foreground">{profile.yearLeft || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="w-full bg-muted flex items-center justify-center p-4">
             <img src={displayImage} alt={profile.fullName} className="max-w-full max-h-[500px] object-contain rounded-lg" />
          </div>

          {/* Story Section */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="prose prose-stone max-w-none">
              <h3 className="font-serif text-2xl font-bold text-secondary">The Story</h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {profile.story}
              </p>
            </div>

            {/* Share Button */}
            <div className="flex gap-4 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="flex-1 rounded-full border-secondary text-secondary" data-testid="button-share-profile">
                    <Share2 className="w-4 h-4 mr-2" /> Share Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => handleShare("facebook")} data-testid="share-facebook">
                    <Facebook className="w-4 h-4 mr-2" /> Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")} data-testid="share-twitter">
                    <Twitter className="w-4 h-4 mr-2" /> Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")} data-testid="share-copy-link">
                    <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-8 md:p-12 border-t border-border bg-muted/20">
            <div className="max-w-3xl mx-auto">
              <h3 className="font-serif text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" /> Comments
              </h3>

              {/* Comment Form */}
              <form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4 mb-8 bg-background p-6 rounded-xl border border-border">
                {isAuthenticated && displayName ? (
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">Commenting as logged in user</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Your Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="authorName" 
                      data-testid="input-comment-author"
                      placeholder="Enter your name"
                      {...form.register("authorName")} 
                      className="bg-muted/30"
                    />
                    {form.formState.errors.authorName && (
                      <p className="text-sm text-destructive">{form.formState.errors.authorName.message}</p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="content">Comment <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="content" 
                    data-testid="input-comment-content"
                    placeholder="Share your thoughts, memories, or connections to this family..."
                    rows={4}
                    {...form.register("content")} 
                    className="bg-muted/30 resize-y"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="bg-primary text-white"
                  disabled={createComment.isPending}
                  data-testid="button-submit-comment"
                >
                  {createComment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Post Comment
                    </>
                  )}
                </Button>
              </form>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => {
                    const isCommentOwner = isAuthenticated && user?.id && comment.userId === user.id;
                    const isEditing = editingCommentId === comment.id;
                    
                    return (
                      <div key={comment.id} className="bg-background p-6 rounded-xl border border-border" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{comment.authorName}</span>
                                {comment.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                )}
                              </div>
                              {isCommentOwner && !isEditing && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-comment-menu-${comment.id}`}>
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingContent(comment.content);
                                      }}
                                      data-testid={`button-edit-comment-${comment.id}`}
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => setDeleteCommentId(comment.id)}
                                      className="text-destructive focus:text-destructive"
                                      data-testid={`button-delete-comment-${comment.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="bg-muted/30 resize-y"
                                  rows={3}
                                  data-testid={`input-edit-comment-${comment.id}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateComment.mutate({ commentId: comment.id, content: editingContent })}
                                    disabled={updateComment.isPending || !editingContent.trim()}
                                    data-testid={`button-save-comment-${comment.id}`}
                                  >
                                    {updateComment.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4 mr-1" />
                                    )}
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCommentId(null);
                                      setEditingContent("");
                                    }}
                                    data-testid={`button-cancel-edit-${comment.id}`}
                                  >
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={deleteCommentId !== null} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-comment">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && deleteComment.mutate(deleteCommentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-comment"
            >
              {deleteComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Profile Confirmation Dialog */}
      <AlertDialog open={deleteProfileOpen} onOpenChange={setDeleteProfileOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this heritage profile? This will permanently remove all the information and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-profile">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProfile.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-profile"
            >
              {deleteProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
