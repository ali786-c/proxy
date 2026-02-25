
-- Create sequence starting from current invoice count + 1
DO $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.invoices;
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START %s', GREATEST(current_count + 1, 1));
END;
$$;

-- Replace the trigger function with atomic sequence-based generation
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invoice_number := 'INV-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;
