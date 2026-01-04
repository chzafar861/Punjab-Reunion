import { useRoute } from "wouter";
import { useProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MapPin, Calendar, Globe, Share2, MessageCircle, Send, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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

const commentSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Comment is required"),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function ProfileDetail() {
  const [, params] = useRoute("/profile/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useProfile(id);
  const { toast } = useToast();
  
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

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      authorName: "",
      content: "",
    }
  });

  const onSubmitComment = (data: CommentFormData) => {
    createComment.mutate(data);
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

  const displayImage = profile.photoUrl || "https://images.unsplash.com/photo-1544256658-63640b7952a2?w=800&h=800&fit=crop";

  return (
    <div className="min-h-screen bg-background pb-24 pt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          {/* Header Image Area - Mobile Only */}
          <div className="md:hidden h-64 w-full bg-muted">
             <img src={displayImage} alt={profile.fullName} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Sidebar / Image - Desktop */}
            <div className="hidden md:block md:col-span-5 h-full min-h-[500px] relative bg-muted">
               <img src={displayImage} alt={profile.fullName} className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content Area */}
            <div className="md:col-span-7 p-8 md:p-12 space-y-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                   <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wider">
                     {profile.district}
                   </span>
                   {profile.yearLeft && (
                     <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full tracking-wider">
                       Since {profile.yearLeft}
                     </span>
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

              <div className="prose prose-stone max-w-none">
                <h3 className="font-serif text-2xl font-bold text-secondary">The Story</h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {profile.story}
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
          </div>

          {/* Comments Section */}
          <div className="p-8 md:p-12 border-t border-border bg-muted/20">
            <div className="max-w-3xl mx-auto">
              <h3 className="font-serif text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" /> Comments
              </h3>

              {/* Comment Form */}
              <form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4 mb-8 bg-background p-6 rounded-xl border border-border">
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
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-background p-6 rounded-xl border border-border" data-testid={`comment-${comment.id}`}>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">{comment.authorName}</span>
                            {comment.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className="text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
