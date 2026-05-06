-- Convert GiftCard.amount and balance from Float (EUR) to Int (XPF)
-- to eliminate floating-point arithmetic errors on currency calculations.
-- Conversion rate used historically: 1 EUR = 119.33 XPF.

-- Step 1: Convert existing EUR values to XPF (rounded to nearest XPF)
UPDATE "gift_cards" SET amount = ROUND(amount * 119.33);
UPDATE "gift_cards" SET balance = ROUND(balance * 119.33);

-- Step 2: Change column type from DOUBLE PRECISION (Float) to INTEGER
ALTER TABLE "gift_cards" ALTER COLUMN amount TYPE INTEGER USING amount::INTEGER;
ALTER TABLE "gift_cards" ALTER COLUMN balance TYPE INTEGER USING balance::INTEGER;
