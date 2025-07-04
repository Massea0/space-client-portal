create table "public"."companies" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "email" text not null,
    "phone" text,
    "address" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."companies" enable row level security;

create table "public"."devis" (
    "id" uuid not null default uuid_generate_v4(),
    "number" text not null,
    "company_id" uuid not null,
    "object" text not null,
    "amount" numeric(10,2) not null,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "valid_until" timestamp with time zone not null,
    "notes" text,
    "rejection_reason" text,
    "validated_at" timestamp with time zone
);


alter table "public"."devis" enable row level security;

create table "public"."devis_items" (
    "id" uuid not null default uuid_generate_v4(),
    "devis_id" uuid not null,
    "description" text not null,
    "quantity" integer not null,
    "unit_price" numeric(10,2) not null,
    "total" numeric(10,2) not null
);


alter table "public"."devis_items" enable row level security;

create table "public"."invoice_items" (
    "id" uuid not null default uuid_generate_v4(),
    "invoice_id" uuid not null,
    "description" text not null,
    "quantity" integer not null,
    "unit_price" numeric(10,2) not null,
    "total" numeric(10,2) not null
);


alter table "public"."invoice_items" enable row level security;

create table "public"."invoices" (
    "id" uuid not null default uuid_generate_v4(),
    "number" text not null,
    "company_id" uuid not null,
    "amount" numeric(10,2) not null,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "due_date" timestamp with time zone not null,
    "paid_at" timestamp with time zone,
    "dexchange_transaction_id" text,
    "payment_method" text,
    "notes" text
);


alter table "public"."invoices" enable row level security;

create table "public"."ticket_attachments" (
    "id" uuid not null default uuid_generate_v4(),
    "ticket_message_id" uuid not null,
    "name" text not null,
    "url" text not null,
    "size" integer not null,
    "type" text not null
);


alter table "public"."ticket_attachments" enable row level security;

create table "public"."ticket_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ticket_categories" enable row level security;

create table "public"."ticket_messages" (
    "id" uuid not null default uuid_generate_v4(),
    "ticket_id" uuid not null,
    "author_id" uuid not null,
    "author_name" text not null,
    "author_role" text not null,
    "content" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ticket_messages" enable row level security;

create table "public"."tickets" (
    "id" uuid not null default uuid_generate_v4(),
    "number" text not null,
    "company_id" uuid not null,
    "subject" text not null,
    "description" text not null,
    "status" text not null,
    "priority" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "assigned_to" text,
    "category_id" uuid
);


alter table "public"."tickets" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "first_name" text not null,
    "last_name" text not null,
    "email" text not null,
    "role" text not null,
    "company_id" uuid,
    "phone" text,
    "created_at" timestamp with time zone default now(),
    "is_active" boolean not null default true,
    "deleted_at" timestamp with time zone
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX companies_email_key ON public.companies USING btree (email);

CREATE UNIQUE INDEX companies_name_key ON public.companies USING btree (name);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX devis_items_pkey ON public.devis_items USING btree (id);

CREATE UNIQUE INDEX devis_number_key ON public.devis USING btree (number);

CREATE UNIQUE INDEX devis_pkey ON public.devis USING btree (id);

CREATE INDEX idx_companies_email ON public.companies USING btree (email);

CREATE INDEX idx_companies_name ON public.companies USING btree (name);

CREATE INDEX idx_devis_company_id ON public.devis USING btree (company_id);

CREATE INDEX idx_devis_items_devis_id ON public.devis_items USING btree (devis_id);

CREATE INDEX idx_devis_number ON public.devis USING btree (number);

CREATE INDEX idx_devis_status ON public.devis USING btree (status);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);

CREATE INDEX idx_invoices_company_id ON public.invoices USING btree (company_id);

CREATE INDEX idx_invoices_number ON public.invoices USING btree (number);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE INDEX idx_ticket_attachments_message_id ON public.ticket_attachments USING btree (ticket_message_id);

CREATE INDEX idx_ticket_categories_name ON public.ticket_categories USING btree (name);

CREATE INDEX idx_ticket_messages_author_id ON public.ticket_messages USING btree (author_id);

CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages USING btree (ticket_id);

CREATE INDEX idx_tickets_category_id ON public.tickets USING btree (category_id);

CREATE INDEX idx_tickets_company_id ON public.tickets USING btree (company_id);

CREATE INDEX idx_tickets_number ON public.tickets USING btree (number);

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);

CREATE INDEX idx_users_company_id ON public.users USING btree (company_id);

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE UNIQUE INDEX invoice_items_pkey ON public.invoice_items USING btree (id);

CREATE UNIQUE INDEX invoices_number_key ON public.invoices USING btree (number);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX ticket_attachments_pkey ON public.ticket_attachments USING btree (id);

CREATE UNIQUE INDEX ticket_categories_name_key ON public.ticket_categories USING btree (name);

CREATE UNIQUE INDEX ticket_categories_pkey ON public.ticket_categories USING btree (id);

CREATE UNIQUE INDEX ticket_messages_pkey ON public.ticket_messages USING btree (id);

CREATE UNIQUE INDEX tickets_number_key ON public.tickets USING btree (number);

CREATE UNIQUE INDEX tickets_pkey ON public.tickets USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."devis" add constraint "devis_pkey" PRIMARY KEY using index "devis_pkey";

alter table "public"."devis_items" add constraint "devis_items_pkey" PRIMARY KEY using index "devis_items_pkey";

alter table "public"."invoice_items" add constraint "invoice_items_pkey" PRIMARY KEY using index "invoice_items_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_pkey" PRIMARY KEY using index "ticket_attachments_pkey";

alter table "public"."ticket_categories" add constraint "ticket_categories_pkey" PRIMARY KEY using index "ticket_categories_pkey";

alter table "public"."ticket_messages" add constraint "ticket_messages_pkey" PRIMARY KEY using index "ticket_messages_pkey";

alter table "public"."tickets" add constraint "tickets_pkey" PRIMARY KEY using index "tickets_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."companies" add constraint "companies_email_key" UNIQUE using index "companies_email_key";

alter table "public"."companies" add constraint "companies_name_key" UNIQUE using index "companies_name_key";

alter table "public"."devis" add constraint "devis_amount_check" CHECK ((amount >= (0)::numeric)) not valid;

alter table "public"."devis" validate constraint "devis_amount_check";

alter table "public"."devis" add constraint "devis_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."devis" validate constraint "devis_company_id_fkey";

alter table "public"."devis" add constraint "devis_number_key" UNIQUE using index "devis_number_key";

alter table "public"."devis" add constraint "devis_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'validated'::text]))) not valid;

alter table "public"."devis" validate constraint "devis_status_check";

alter table "public"."devis_items" add constraint "devis_items_devis_id_fkey" FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE not valid;

alter table "public"."devis_items" validate constraint "devis_items_devis_id_fkey";

alter table "public"."devis_items" add constraint "devis_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."devis_items" validate constraint "devis_items_quantity_check";

alter table "public"."devis_items" add constraint "devis_items_total_check" CHECK ((total >= (0)::numeric)) not valid;

alter table "public"."devis_items" validate constraint "devis_items_total_check";

alter table "public"."devis_items" add constraint "devis_items_unit_price_check" CHECK ((unit_price >= (0)::numeric)) not valid;

alter table "public"."devis_items" validate constraint "devis_items_unit_price_check";

alter table "public"."invoice_items" add constraint "invoice_items_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_invoice_id_fkey";

alter table "public"."invoice_items" add constraint "invoice_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_quantity_check";

alter table "public"."invoice_items" add constraint "invoice_items_total_check" CHECK ((total >= (0)::numeric)) not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_total_check";

alter table "public"."invoice_items" add constraint "invoice_items_unit_price_check" CHECK ((unit_price >= (0)::numeric)) not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_unit_price_check";

alter table "public"."invoices" add constraint "invoices_amount_check" CHECK ((amount >= (0)::numeric)) not valid;

alter table "public"."invoices" validate constraint "invoices_amount_check";

alter table "public"."invoices" add constraint "invoices_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_company_id_fkey";

alter table "public"."invoices" add constraint "invoices_number_key" UNIQUE using index "invoices_number_key";

alter table "public"."invoices" add constraint "invoices_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text, 'pending_payment'::text]))) not valid;

alter table "public"."invoices" validate constraint "invoices_status_check";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_size_check" CHECK ((size >= 0)) not valid;

alter table "public"."ticket_attachments" validate constraint "ticket_attachments_size_check";

alter table "public"."ticket_attachments" add constraint "ticket_attachments_ticket_message_id_fkey" FOREIGN KEY (ticket_message_id) REFERENCES ticket_messages(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_attachments" validate constraint "ticket_attachments_ticket_message_id_fkey";

alter table "public"."ticket_categories" add constraint "ticket_categories_name_key" UNIQUE using index "ticket_categories_name_key";

alter table "public"."ticket_messages" add constraint "ticket_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_messages" validate constraint "ticket_messages_author_id_fkey";

alter table "public"."ticket_messages" add constraint "ticket_messages_author_role_check" CHECK ((author_role = ANY (ARRAY['client'::text, 'admin'::text]))) not valid;

alter table "public"."ticket_messages" validate constraint "ticket_messages_author_role_check";

alter table "public"."ticket_messages" add constraint "ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_messages" validate constraint "ticket_messages_ticket_id_fkey";

alter table "public"."tickets" add constraint "tickets_category_id_fkey" FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE SET NULL not valid;

alter table "public"."tickets" validate constraint "tickets_category_id_fkey";

alter table "public"."tickets" add constraint "tickets_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."tickets" validate constraint "tickets_company_id_fkey";

alter table "public"."tickets" add constraint "tickets_number_key" UNIQUE using index "tickets_number_key";

alter table "public"."tickets" add constraint "tickets_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."tickets" validate constraint "tickets_priority_check";

alter table "public"."tickets" add constraint "tickets_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text, 'pending_admin_response'::text, 'pending_client_response'::text]))) not valid;

alter table "public"."tickets" validate constraint "tickets_status_check";

alter table "public"."users" add constraint "users_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "users_company_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_role_check" CHECK ((role = ANY (ARRAY['client'::text, 'admin'::text]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.users WHERE id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.users WHERE id = p_user_id;
$function$
;

CREATE OR REPLACE FUNCTION public.set_custom_claims()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Met à jour la colonne raw_app_meta_data de l'utilisateur dans auth.users
  -- Ajoute ou met à jour le claim 'user_role' avec la nouvelle valeur du rôle
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('user_role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_devis_status_by_client(quote_id uuid, new_status text, rejection_reason_text text DEFAULT NULL::text)
 RETURNS SETOF devis
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    requesting_user_id uuid := auth.uid();
    target_devis_company_id uuid;
    requesting_user_company_id uuid;
BEGIN
    -- Définir un search_path spécifique pour la sécurité
    SET search_path = public, pg_temp;

    -- 1. Récupérer l'ID de la compagnie du devis cible
    SELECT company_id INTO target_devis_company_id FROM public.devis WHERE devis.id = quote_id;

    -- 2. Récupérer l'ID de la compagnie de l'utilisateur qui fait la requête
    SELECT company_id INTO requesting_user_company_id FROM public.users WHERE users.id = requesting_user_id;

    -- 3. Vérification de sécurité : L'utilisateur doit appartenir à la même compagnie que le devis
    IF target_devis_company_id IS NULL OR target_devis_company_id <> requesting_user_company_id THEN
        RAISE EXCEPTION 'Authorization error: User is not authorized to update this quote. (ID: %)', quote_id;
    END IF;

    -- 4. Logique métier : Un client ne peut qu'approuver ou rejeter
    IF new_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status transition: Client can only set status to "approved" or "rejected".';
    END IF;

    -- 5. Mettre à jour le devis
    UPDATE public.devis
    SET
        status = new_status,
        rejection_reason = rejection_reason_text,
        -- C'était la source de l'erreur. La colonne existe maintenant.
        validated_at = CASE WHEN new_status = 'approved' THEN now() ELSE validated_at END
    WHERE devis.id = quote_id;

    -- 6. Renvoyer l'enregistrement du devis mis à jour pour confirmation
    RETURN QUERY
    SELECT * FROM public.devis WHERE devis.id = quote_id;

END;
$function$
;

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."devis" to "anon";

grant insert on table "public"."devis" to "anon";

grant references on table "public"."devis" to "anon";

grant select on table "public"."devis" to "anon";

grant trigger on table "public"."devis" to "anon";

grant truncate on table "public"."devis" to "anon";

grant update on table "public"."devis" to "anon";

grant delete on table "public"."devis" to "authenticated";

grant insert on table "public"."devis" to "authenticated";

grant references on table "public"."devis" to "authenticated";

grant select on table "public"."devis" to "authenticated";

grant trigger on table "public"."devis" to "authenticated";

grant truncate on table "public"."devis" to "authenticated";

grant update on table "public"."devis" to "authenticated";

grant delete on table "public"."devis" to "service_role";

grant insert on table "public"."devis" to "service_role";

grant references on table "public"."devis" to "service_role";

grant select on table "public"."devis" to "service_role";

grant trigger on table "public"."devis" to "service_role";

grant truncate on table "public"."devis" to "service_role";

grant update on table "public"."devis" to "service_role";

grant delete on table "public"."devis_items" to "anon";

grant insert on table "public"."devis_items" to "anon";

grant references on table "public"."devis_items" to "anon";

grant select on table "public"."devis_items" to "anon";

grant trigger on table "public"."devis_items" to "anon";

grant truncate on table "public"."devis_items" to "anon";

grant update on table "public"."devis_items" to "anon";

grant delete on table "public"."devis_items" to "authenticated";

grant insert on table "public"."devis_items" to "authenticated";

grant references on table "public"."devis_items" to "authenticated";

grant select on table "public"."devis_items" to "authenticated";

grant trigger on table "public"."devis_items" to "authenticated";

grant truncate on table "public"."devis_items" to "authenticated";

grant update on table "public"."devis_items" to "authenticated";

grant delete on table "public"."devis_items" to "service_role";

grant insert on table "public"."devis_items" to "service_role";

grant references on table "public"."devis_items" to "service_role";

grant select on table "public"."devis_items" to "service_role";

grant trigger on table "public"."devis_items" to "service_role";

grant truncate on table "public"."devis_items" to "service_role";

grant update on table "public"."devis_items" to "service_role";

grant delete on table "public"."invoice_items" to "anon";

grant insert on table "public"."invoice_items" to "anon";

grant references on table "public"."invoice_items" to "anon";

grant select on table "public"."invoice_items" to "anon";

grant trigger on table "public"."invoice_items" to "anon";

grant truncate on table "public"."invoice_items" to "anon";

grant update on table "public"."invoice_items" to "anon";

grant delete on table "public"."invoice_items" to "authenticated";

grant insert on table "public"."invoice_items" to "authenticated";

grant references on table "public"."invoice_items" to "authenticated";

grant select on table "public"."invoice_items" to "authenticated";

grant trigger on table "public"."invoice_items" to "authenticated";

grant truncate on table "public"."invoice_items" to "authenticated";

grant update on table "public"."invoice_items" to "authenticated";

grant delete on table "public"."invoice_items" to "service_role";

grant insert on table "public"."invoice_items" to "service_role";

grant references on table "public"."invoice_items" to "service_role";

grant select on table "public"."invoice_items" to "service_role";

grant trigger on table "public"."invoice_items" to "service_role";

grant truncate on table "public"."invoice_items" to "service_role";

grant update on table "public"."invoice_items" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."ticket_attachments" to "anon";

grant insert on table "public"."ticket_attachments" to "anon";

grant references on table "public"."ticket_attachments" to "anon";

grant select on table "public"."ticket_attachments" to "anon";

grant trigger on table "public"."ticket_attachments" to "anon";

grant truncate on table "public"."ticket_attachments" to "anon";

grant update on table "public"."ticket_attachments" to "anon";

grant delete on table "public"."ticket_attachments" to "authenticated";

grant insert on table "public"."ticket_attachments" to "authenticated";

grant references on table "public"."ticket_attachments" to "authenticated";

grant select on table "public"."ticket_attachments" to "authenticated";

grant trigger on table "public"."ticket_attachments" to "authenticated";

grant truncate on table "public"."ticket_attachments" to "authenticated";

grant update on table "public"."ticket_attachments" to "authenticated";

grant delete on table "public"."ticket_attachments" to "service_role";

grant insert on table "public"."ticket_attachments" to "service_role";

grant references on table "public"."ticket_attachments" to "service_role";

grant select on table "public"."ticket_attachments" to "service_role";

grant trigger on table "public"."ticket_attachments" to "service_role";

grant truncate on table "public"."ticket_attachments" to "service_role";

grant update on table "public"."ticket_attachments" to "service_role";

grant delete on table "public"."ticket_categories" to "anon";

grant insert on table "public"."ticket_categories" to "anon";

grant references on table "public"."ticket_categories" to "anon";

grant select on table "public"."ticket_categories" to "anon";

grant trigger on table "public"."ticket_categories" to "anon";

grant truncate on table "public"."ticket_categories" to "anon";

grant update on table "public"."ticket_categories" to "anon";

grant delete on table "public"."ticket_categories" to "authenticated";

grant insert on table "public"."ticket_categories" to "authenticated";

grant references on table "public"."ticket_categories" to "authenticated";

grant select on table "public"."ticket_categories" to "authenticated";

grant trigger on table "public"."ticket_categories" to "authenticated";

grant truncate on table "public"."ticket_categories" to "authenticated";

grant update on table "public"."ticket_categories" to "authenticated";

grant delete on table "public"."ticket_categories" to "service_role";

grant insert on table "public"."ticket_categories" to "service_role";

grant references on table "public"."ticket_categories" to "service_role";

grant select on table "public"."ticket_categories" to "service_role";

grant trigger on table "public"."ticket_categories" to "service_role";

grant truncate on table "public"."ticket_categories" to "service_role";

grant update on table "public"."ticket_categories" to "service_role";

grant delete on table "public"."ticket_messages" to "anon";

grant insert on table "public"."ticket_messages" to "anon";

grant references on table "public"."ticket_messages" to "anon";

grant select on table "public"."ticket_messages" to "anon";

grant trigger on table "public"."ticket_messages" to "anon";

grant truncate on table "public"."ticket_messages" to "anon";

grant update on table "public"."ticket_messages" to "anon";

grant delete on table "public"."ticket_messages" to "authenticated";

grant insert on table "public"."ticket_messages" to "authenticated";

grant references on table "public"."ticket_messages" to "authenticated";

grant select on table "public"."ticket_messages" to "authenticated";

grant trigger on table "public"."ticket_messages" to "authenticated";

grant truncate on table "public"."ticket_messages" to "authenticated";

grant update on table "public"."ticket_messages" to "authenticated";

grant delete on table "public"."ticket_messages" to "service_role";

grant insert on table "public"."ticket_messages" to "service_role";

grant references on table "public"."ticket_messages" to "service_role";

grant select on table "public"."ticket_messages" to "service_role";

grant trigger on table "public"."ticket_messages" to "service_role";

grant truncate on table "public"."ticket_messages" to "service_role";

grant update on table "public"."ticket_messages" to "service_role";

grant delete on table "public"."tickets" to "anon";

grant insert on table "public"."tickets" to "anon";

grant references on table "public"."tickets" to "anon";

grant select on table "public"."tickets" to "anon";

grant trigger on table "public"."tickets" to "anon";

grant truncate on table "public"."tickets" to "anon";

grant update on table "public"."tickets" to "anon";

grant delete on table "public"."tickets" to "authenticated";

grant insert on table "public"."tickets" to "authenticated";

grant references on table "public"."tickets" to "authenticated";

grant select on table "public"."tickets" to "authenticated";

grant trigger on table "public"."tickets" to "authenticated";

grant truncate on table "public"."tickets" to "authenticated";

grant update on table "public"."tickets" to "authenticated";

grant delete on table "public"."tickets" to "service_role";

grant insert on table "public"."tickets" to "service_role";

grant references on table "public"."tickets" to "service_role";

grant select on table "public"."tickets" to "service_role";

grant trigger on table "public"."tickets" to "service_role";

grant truncate on table "public"."tickets" to "service_role";

grant update on table "public"."tickets" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Admin_manage_companies"
on "public"."companies"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Client_read_own_company"
on "public"."companies"
as permissive
for select
to authenticated
using ((id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Admin_manage_all_devis"
on "public"."devis"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Client_read_own_company_devis"
on "public"."devis"
as permissive
for select
to authenticated
using ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Admin_manage_devis_items"
on "public"."devis_items"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Read_devis_items"
on "public"."devis_items"
as permissive
for select
to authenticated
using ((devis_id IN ( SELECT devis.id
   FROM devis
  WHERE ((devis.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid()))) OR (( SELECT users.role
           FROM users
          WHERE (users.id = auth.uid())) = 'admin'::text)))));


create policy "Admin_manage_invoice_items"
on "public"."invoice_items"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Read_invoice_items"
on "public"."invoice_items"
as permissive
for select
to authenticated
using ((invoice_id IN ( SELECT invoices.id
   FROM invoices
  WHERE ((invoices.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid()))) OR (( SELECT users.role
           FROM users
          WHERE (users.id = auth.uid())) = 'admin'::text)))));


create policy "Admin_manage_all_invoices"
on "public"."invoices"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Client_read_own_company_invoices"
on "public"."invoices"
as permissive
for select
to authenticated
using ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Admin_manage_ticket_attachments"
on "public"."ticket_attachments"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Read_ticket_attachments"
on "public"."ticket_attachments"
as permissive
for select
to authenticated
using ((ticket_message_id IN ( SELECT ticket_messages.id
   FROM ticket_messages
  WHERE (ticket_messages.ticket_id IN ( SELECT tickets.id
           FROM tickets
          WHERE ((tickets.company_id = ( SELECT users.company_id
                   FROM users
                  WHERE (users.id = auth.uid()))) OR (( SELECT users.role
                   FROM users
                  WHERE (users.id = auth.uid())) = 'admin'::text)))))));


create policy "Admin_manage_ticket_categories"
on "public"."ticket_categories"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Authenticated_read_ticket_categories"
on "public"."ticket_categories"
as permissive
for select
to authenticated
using (true);


create policy "Admin_manage_ticket_messages"
on "public"."ticket_messages"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Insert_ticket_messages"
on "public"."ticket_messages"
as permissive
for insert
to authenticated
with check (((ticket_id IN ( SELECT tickets.id
   FROM tickets
  WHERE ((tickets.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid()))) OR (( SELECT users.role
           FROM users
          WHERE (users.id = auth.uid())) = 'admin'::text)))) AND (author_id = auth.uid())));


create policy "Read_ticket_messages"
on "public"."ticket_messages"
as permissive
for select
to authenticated
using ((ticket_id IN ( SELECT tickets.id
   FROM tickets
  WHERE ((tickets.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid()))) OR (( SELECT users.role
           FROM users
          WHERE (users.id = auth.uid())) = 'admin'::text)))));


create policy "Admin_manage_all_tickets"
on "public"."tickets"
as permissive
for all
to authenticated
using ((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = 'admin'::text));


create policy "Client_insert_own_company_tickets"
on "public"."tickets"
as permissive
for insert
to authenticated
with check ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Client_manage_own_company_tickets"
on "public"."tickets"
as permissive
for select
to authenticated
using ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Client_update_own_tickets"
on "public"."tickets"
as permissive
for update
to authenticated
using ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))))
with check ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "1_user_insert_own"
on "public"."users"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "2_user_select_update_own"
on "public"."users"
as permissive
for all
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "3_admin_all_access"
on "public"."users"
as permissive
for all
to public
using ((get_user_role(auth.uid()) = 'admin'::text))
with check ((get_user_role(auth.uid()) = 'admin'::text));


create policy "Admins can view all users data"
on "public"."users"
as permissive
for select
to public
using ((get_my_role() = 'admin'::text));


create policy "Users can view their own data"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER on_profile_role_change AFTER UPDATE OF role ON public.users FOR EACH ROW EXECUTE FUNCTION set_custom_claims();

CREATE TRIGGER on_profile_role_insert AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION set_custom_claims();


