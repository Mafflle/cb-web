CREATE TABLE restaurant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurant(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, restaurant_id)
);

-- RLS Policies
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own restaurant associations
CREATE POLICY "Users can view own restaurant associations"
  ON restaurant_users FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can view all users in their restaurant
CREATE POLICY "Owners can view restaurant users"
  ON restaurant_users FOR SELECT
  USING (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'owner'
    )
  );

-- Managers can view staff in their restaurant
CREATE POLICY "Managers can view restaurant staff"
  ON restaurant_users FOR SELECT
  USING (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'manager'
    )
  );

-- Owners can insert new restaurant users
CREATE POLICY "Owners can insert restaurant users"
  ON restaurant_users FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'owner'
    )
  );

-- Owners can update restaurant users (except other owners)
CREATE POLICY "Owners can update restaurant users"
  ON restaurant_users FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'owner'
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'owner'
    )
  );

-- Owners can delete restaurant users (except themselves)
CREATE POLICY "Owners can delete restaurant users"
  ON restaurant_users FOR DELETE
  USING (
    restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'owner'
    )
    AND user_id != auth.uid()  -- Prevent owners from deleting themselves
  );

-- Managers can insert staff only
CREATE POLICY "Managers can insert staff"
  ON restaurant_users FOR INSERT
  WITH CHECK (
    role = 'staff'
    AND restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'manager'
    )
  );

-- Managers can update staff only
CREATE POLICY "Managers can update staff"
  ON restaurant_users FOR UPDATE
  USING (
    role = 'staff'
    AND restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'manager'
    )
  )
  WITH CHECK (
    role = 'staff'  -- Prevent managers from promoting staff to manager/owner
  );

-- Managers can delete staff only
CREATE POLICY "Managers can delete staff"
  ON restaurant_users FOR DELETE
  USING (
    role = 'staff'
    AND restaurant_id IN (
      SELECT ru.restaurant_id FROM restaurant_users ru
      WHERE ru.user_id = auth.uid() AND ru.role = 'manager'
    )
  );

-- Service role bypass for admin operations (adding first owner)
-- Note: First owner must be added via service role or direct DB access


-- Trigger to update updated_at timestamp
CREATE TRIGGER update_restaurant_users_updated_at
BEFORE UPDATE ON restaurant_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();