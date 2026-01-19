import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function OrderDialog({ open, onOpenChange, product }: OrderDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerPhone2: "",
    country: "",
    province: "",
    city: "",
    streetAddress: "",
    notes: "",
    quantity: 1,
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const formatPrice = (price: number, currency: string = "PKR") => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const createOrder = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders", {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        customerPhone2: formData.customerPhone2 || undefined,
        country: formData.country || undefined,
        province: formData.province || undefined,
        city: formData.city || undefined,
        streetAddress: formData.streetAddress || undefined,
        notes: formData.notes || undefined,
        items: [
          {
            productId: product.id,
            quantity: formData.quantity,
          },
        ],
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order has been submitted successfully. We will contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      onOpenChange(false);
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerPhone2: "",
        country: "",
        province: "",
        city: "",
        streetAddress: "",
        notes: "",
        quantity: 1,
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("401")) {
        toast({
          title: "Login Required",
          description: "Please log in to place an order.",
          variant: "destructive",
        });
        navigate("/login");
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to place order",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || 
        !formData.country || !formData.province || !formData.city || !formData.streetAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingAuth(true);
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      setIsCheckingAuth(false);
      navigate("/login");
      return;
    }
    
    setIsCheckingAuth(false);
    createOrder.mutate();
  };

  const totalPrice = product.price * formData.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Place Order</DialogTitle>
          <DialogDescription>
            Order {product.title} - {formatPrice(product.price, product.currency)} each
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              data-testid="input-order-quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Your Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter your full name"
              required
              data-testid="input-order-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="Enter your email"
              required
              data-testid="input-order-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone *</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="Enter your phone number"
              required
              data-testid="input-order-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone2">Second Phone (Optional)</Label>
            <Input
              id="customerPhone2"
              type="tel"
              value={formData.customerPhone2}
              onChange={(e) => setFormData({ ...formData, customerPhone2: e.target.value })}
              placeholder="Enter alternate phone number"
              data-testid="input-order-phone2"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Shipping Address</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., Pakistan"
                  required
                  data-testid="input-order-country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province/State *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="e.g., Punjab"
                  required
                  data-testid="input-order-province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Lahore"
                  required
                  data-testid="input-order-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetAddress">Home Address *</Label>
                <Textarea
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="Enter your complete home address"
                  rows={2}
                  required
                  data-testid="input-order-street"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions?"
              rows={2}
              data-testid="input-order-notes"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(totalPrice, product.currency)}
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={createOrder.isPending || isCheckingAuth}
              data-testid="button-submit-order"
            >
              {createOrder.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
