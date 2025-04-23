-- Enable Row Level Security on all tables
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Store" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Price" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderItem" ENABLE ROW LEVEL SECURITY;

-- Create basic policies for each table
-- For User table, users can only see and modify their own data
CREATE POLICY "Users can view own data" ON "public"."User"
  FOR SELECT USING (auth.uid()::text = email);
  
CREATE POLICY "Users can update own data" ON "public"."User"
  FOR UPDATE USING (auth.uid()::text = email);

-- For Store table, everyone can view, only admins can modify
CREATE POLICY "Stores are viewable by everyone" ON "public"."Store"
  FOR SELECT USING (true);
  
-- For Product table, everyone can view
CREATE POLICY "Products are viewable by everyone" ON "public"."Product"
  FOR SELECT USING (true);
  
-- For Category table, everyone can view
CREATE POLICY "Categories are viewable by everyone" ON "public"."Category"
  FOR SELECT USING (true);
  
-- For Price table, everyone can view
CREATE POLICY "Prices are viewable by everyone" ON "public"."Price"
  FOR SELECT USING (true);
  
-- For Cart table, users can only access their own cart
CREATE POLICY "Users can view own cart" ON "public"."Cart"
  FOR SELECT USING ((SELECT email FROM "public"."User" WHERE id = "userId") = auth.uid()::text);
  
CREATE POLICY "Users can update own cart" ON "public"."Cart"
  FOR UPDATE USING ((SELECT email FROM "public"."User" WHERE id = "userId") = auth.uid()::text);
  
CREATE POLICY "Users can insert own cart" ON "public"."Cart"
  FOR INSERT WITH CHECK ((SELECT email FROM "public"."User" WHERE id = "userId") = auth.uid()::text);
  
-- For CartItem table, users can only access items in their own cart
CREATE POLICY "Users can view own cart items" ON "public"."CartItem"
  FOR SELECT USING ((SELECT email FROM "public"."User" WHERE id = 
    (SELECT "userId" FROM "public"."Cart" WHERE id = "cartId")) = auth.uid()::text);
    
CREATE POLICY "Users can update own cart items" ON "public"."CartItem"
  FOR UPDATE USING ((SELECT email FROM "public"."User" WHERE id = 
    (SELECT "userId" FROM "public"."Cart" WHERE id = "cartId")) = auth.uid()::text);
    
CREATE POLICY "Users can insert own cart items" ON "public"."CartItem"
  FOR INSERT WITH CHECK ((SELECT email FROM "public"."User" WHERE id = 
    (SELECT "userId" FROM "public"."Cart" WHERE id = "cartId")) = auth.uid()::text);
    
CREATE POLICY "Users can delete own cart items" ON "public"."CartItem"
  FOR DELETE USING ((SELECT email FROM "public"."User" WHERE id = 
    (SELECT "userId" FROM "public"."Cart" WHERE id = "cartId")) = auth.uid()::text);
    
-- For Order table, users can only access their own orders
CREATE POLICY "Users can view own orders" ON "public"."Order"
  FOR SELECT USING ((SELECT email FROM "public"."User" WHERE id = "userId") = auth.uid()::text);
  
CREATE POLICY "Users can insert own orders" ON "public"."Order"
  FOR INSERT WITH CHECK ((SELECT email FROM "public"."User" WHERE id = "userId") = auth.uid()::text);
  
-- For OrderItem table, users can only access items in their own orders
CREATE POLICY "Users can view own order items" ON "public"."OrderItem"
  FOR SELECT USING ((SELECT email FROM "public"."User" WHERE id = 
    (SELECT "userId" FROM "public"."Order" WHERE id = "orderId")) = auth.uid()::text); 