import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Eye, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import type { Order, OrderItem } from "@shared/schema";

type OrderWithItems = Order & { items?: OrderItem[] };

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const isAdmin = user?.role === "admin";

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["supabase-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Transform snake_case to camelCase
      return (data || []).map((o: any) => ({
        id: o.id,
        userId: o.user_id,
        status: o.status,
        totalAmount: o.total_amount,
        currency: o.currency,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        customerPhone2: o.customer_phone_2,
        country: o.country,
        province: o.province,
        city: o.city,
        streetAddress: o.street_address,
        shippingAddress: o.shipping_address,
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Order status updated" });
      queryClient.invalidateQueries({ queryKey: ["supabase-orders"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (orderError) throw orderError;
      
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      if (itemsError) throw itemsError;
      
      // Transform snake_case to camelCase
      const transformedOrder = {
        id: order.id,
        userId: order.user_id,
        status: order.status,
        totalAmount: order.total_amount,
        currency: order.currency,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        customerPhone2: order.customer_phone_2,
        country: order.country,
        province: order.province,
        city: order.city,
        streetAddress: order.street_address,
        shippingAddress: order.shipping_address,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      };
      
      const transformedItems = (items || []).map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        productTitle: item.product_title,
        createdAt: item.created_at,
      }));
      
      setSelectedOrder({ ...transformedOrder, items: transformedItems });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need administrator privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [authLoading, isAdmin, toast, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string = "PKR") => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              All Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(order.totalAmount, order.currency)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatus.mutate({ id: order.id, status: value })}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                            <Badge variant={statusColors[order.status] || "secondary"}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchOrderDetails(order.id)}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Second Phone</p>
                  <p className="font-medium">{(selectedOrder as any).customerPhone2 || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedOrder.status] || "secondary"}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Shipping Address</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{(selectedOrder as any).country || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Province/State</p>
                    <p className="font-medium">{(selectedOrder as any).province || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{(selectedOrder as any).city || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Home Address</p>
                    <p className="font-medium">{(selectedOrder as any).streetAddress || "-"}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="text-sm border-t pt-4">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Items</p>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span>{item.productTitle}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <span>{formatPrice(item.unitPrice * item.quantity, selectedOrder.currency)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No items found</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
