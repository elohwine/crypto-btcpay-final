--
-- PostgreSQL database dump
--

\restrict iaIXYdTB8Da6bk3CMmFixwdkLPmO97D2jbtZUTp5vj7PVttXCWg5JIX5h16lS6v

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CONFIRMED',
    'FAILED'
);


ALTER TYPE public."DepositStatus" OWNER TO postgres;

--
-- Name: get_itemcode(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_itemcode(invoice_blob jsonb) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT invoice_blob->'metadata'->>'itemCode';
$$;


ALTER FUNCTION public.get_itemcode(invoice_blob jsonb) OWNER TO postgres;

--
-- Name: get_monitored_invoices(text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_monitored_invoices(arg_payment_method_id text, include_non_activated boolean) RETURNS TABLE(invoice_id text, payment_id text, payment_method_id text)
    LANGUAGE sql STABLE
    AS $$
WITH cte AS (
-- Get all the invoices which are pending. Even if no payments.
SELECT i."Id" invoice_id, p."Id" payment_id, p."PaymentMethodId" payment_method_id FROM "Invoices" i LEFT JOIN "Payments" p ON i."Id" = p."InvoiceDataId"
        WHERE is_pending(i."Status")
UNION ALL
-- For invoices not pending, take all of those which have pending payments
SELECT i."Id" invoice_id, p."Id" payment_id, p."PaymentMethodId" payment_method_id FROM "Invoices" i INNER JOIN "Payments" p ON i."Id" = p."InvoiceDataId"
        WHERE is_pending(p."Status") AND NOT is_pending(i."Status"))
SELECT cte.* FROM cte
JOIN "Invoices" i ON cte.invoice_id=i."Id"
LEFT JOIN "Payments" p ON cte.payment_id=p."Id" AND cte.payment_method_id=p."PaymentMethodId"
WHERE (p."PaymentMethodId" IS NOT NULL AND p."PaymentMethodId" = arg_payment_method_id) OR
      (p."PaymentMethodId" IS NULL AND get_prompt(i."Blob2", arg_payment_method_id) IS NOT NULL AND
        (include_non_activated IS TRUE OR (get_prompt(i."Blob2", arg_payment_method_id)->'inactive')::BOOLEAN IS NOT TRUE));
$$;


ALTER FUNCTION public.get_monitored_invoices(arg_payment_method_id text, include_non_activated boolean) OWNER TO postgres;

--
-- Name: get_orderid(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_orderid(invoice_blob jsonb) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT invoice_blob->'metadata'->>'orderId';
$$;


ALTER FUNCTION public.get_orderid(invoice_blob jsonb) OWNER TO postgres;

--
-- Name: get_prompt(jsonb, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_prompt(invoice_blob jsonb, payment_method_id text) RETURNS jsonb
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT invoice_blob->'prompts'->payment_method_id
$$;


ALTER FUNCTION public.get_prompt(invoice_blob jsonb, payment_method_id text) OWNER TO postgres;

--
-- Name: is_pending(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_pending(status text) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT status = 'Processing' OR status = 'New';
$$;


ALTER FUNCTION public.is_pending(status text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AddressInvoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AddressInvoices" (
    "Address" text NOT NULL,
    "InvoiceDataId" text,
    "PaymentMethodId" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."AddressInvoices" OWNER TO postgres;

--
-- Name: ApiKeys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ApiKeys" (
    "Id" character varying(50) NOT NULL,
    "StoreId" character varying(50),
    "Type" integer DEFAULT 0 NOT NULL,
    "UserId" character varying(50),
    "Label" text,
    "Blob" bytea,
    "Blob2" jsonb
);


ALTER TABLE public."ApiKeys" OWNER TO postgres;

--
-- Name: Apps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Apps" (
    "Id" text NOT NULL,
    "AppType" text,
    "Created" timestamp with time zone NOT NULL,
    "Name" text,
    "Settings" jsonb,
    "StoreDataId" text,
    "TagAllInvoices" boolean DEFAULT false NOT NULL,
    "Archived" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Apps" OWNER TO postgres;

--
-- Name: AspNetRoleClaims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetRoleClaims" (
    "Id" integer NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    "RoleId" text NOT NULL
);


ALTER TABLE public."AspNetRoleClaims" OWNER TO postgres;

--
-- Name: AspNetRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetRoles" (
    "Id" text NOT NULL,
    "ConcurrencyStamp" text,
    "Name" character varying(256),
    "NormalizedName" character varying(256)
);


ALTER TABLE public."AspNetRoles" OWNER TO postgres;

--
-- Name: AspNetUserClaims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetUserClaims" (
    "Id" integer NOT NULL,
    "ClaimType" text,
    "ClaimValue" text,
    "UserId" text NOT NULL
);


ALTER TABLE public."AspNetUserClaims" OWNER TO postgres;

--
-- Name: AspNetUserLogins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetUserLogins" (
    "LoginProvider" character varying(255) NOT NULL,
    "ProviderKey" character varying(255) NOT NULL,
    "ProviderDisplayName" text,
    "UserId" text NOT NULL
);


ALTER TABLE public."AspNetUserLogins" OWNER TO postgres;

--
-- Name: AspNetUserRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetUserRoles" (
    "UserId" text NOT NULL,
    "RoleId" text NOT NULL
);


ALTER TABLE public."AspNetUserRoles" OWNER TO postgres;

--
-- Name: AspNetUserTokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetUserTokens" (
    "UserId" text NOT NULL,
    "LoginProvider" character varying(64) NOT NULL,
    "Name" character varying(64) NOT NULL,
    "Value" text
);


ALTER TABLE public."AspNetUserTokens" OWNER TO postgres;

--
-- Name: AspNetUsers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AspNetUsers" (
    "Id" text NOT NULL,
    "AccessFailedCount" integer NOT NULL,
    "ConcurrencyStamp" text,
    "Email" character varying(256),
    "EmailConfirmed" boolean NOT NULL,
    "LockoutEnabled" boolean NOT NULL,
    "LockoutEnd" timestamp with time zone,
    "NormalizedEmail" character varying(256),
    "NormalizedUserName" character varying(256),
    "PasswordHash" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean NOT NULL,
    "SecurityStamp" text,
    "TwoFactorEnabled" boolean NOT NULL,
    "UserName" character varying(256),
    "RequiresEmailConfirmation" boolean DEFAULT false NOT NULL,
    "Created" timestamp with time zone,
    "DisabledNotifications" text,
    "Blob" bytea,
    "Blob2" jsonb,
    "Approved" boolean DEFAULT false NOT NULL,
    "RequiresApproval" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."AspNetUsers" OWNER TO postgres;

--
-- Name: Deposit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Deposit" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "invoiceId" text NOT NULL,
    amount double precision NOT NULL,
    currency text NOT NULL,
    status public."DepositStatus" DEFAULT 'PENDING'::public."DepositStatus" NOT NULL,
    "btcpayStatus" text,
    "confirmedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "walletAddress" text,
    "txHash" text
);


ALTER TABLE public."Deposit" OWNER TO postgres;

--
-- Name: Fido2Credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fido2Credentials" (
    "Id" text NOT NULL,
    "Name" text,
    "ApplicationUserId" text,
    "Blob" bytea,
    "Type" integer NOT NULL,
    "Blob2" jsonb
);


ALTER TABLE public."Fido2Credentials" OWNER TO postgres;

--
-- Name: Files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Files" (
    "Id" text NOT NULL,
    "FileName" text,
    "StorageFileName" text,
    "Timestamp" timestamp with time zone NOT NULL,
    "ApplicationUserId" text
);


ALTER TABLE public."Files" OWNER TO postgres;

--
-- Name: Forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Forms" (
    "Id" text NOT NULL,
    "Name" text,
    "StoreId" text,
    "Config" jsonb,
    "Public" boolean NOT NULL
);


ALTER TABLE public."Forms" OWNER TO postgres;

--
-- Name: InvoiceEvents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceEvents" (
    "InvoiceDataId" text NOT NULL,
    "Message" text,
    "Timestamp" timestamp with time zone NOT NULL,
    "Severity" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."InvoiceEvents" OWNER TO postgres;

--
-- Name: InvoiceSearches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceSearches" (
    "Id" integer NOT NULL,
    "InvoiceDataId" character varying(255),
    "Value" text
);


ALTER TABLE public."InvoiceSearches" OWNER TO postgres;

--
-- Name: InvoiceSearches_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."InvoiceSearches_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InvoiceSearches_Id_seq" OWNER TO postgres;

--
-- Name: InvoiceSearches_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."InvoiceSearches_Id_seq" OWNED BY public."InvoiceSearches"."Id";


--
-- Name: InvoiceWebhookDeliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceWebhookDeliveries" (
    "InvoiceId" text NOT NULL,
    "DeliveryId" text NOT NULL
);


ALTER TABLE public."InvoiceWebhookDeliveries" OWNER TO postgres;

--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoices" (
    "Id" text NOT NULL,
    "Blob" bytea,
    "Created" timestamp with time zone NOT NULL,
    "ExceptionStatus" text,
    "Status" text,
    "StoreDataId" text,
    "Archived" boolean DEFAULT false NOT NULL,
    "Blob2" jsonb,
    "Amount" numeric,
    "Currency" text
);


ALTER TABLE public."Invoices" OWNER TO postgres;

--
-- Name: LedgerEntry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LedgerEntry" (
    id text NOT NULL,
    "userId" text,
    account text NOT NULL,
    "deltaMinor" bigint NOT NULL,
    currency text,
    "refType" text NOT NULL,
    "refId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LedgerEntry" OWNER TO postgres;

--
-- Name: LightningAddresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LightningAddresses" (
    "Username" text NOT NULL,
    "StoreDataId" text NOT NULL,
    "Blob" bytea,
    "Blob2" jsonb
);


ALTER TABLE public."LightningAddresses" OWNER TO postgres;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    "Id" character varying(36) NOT NULL,
    "Created" timestamp with time zone NOT NULL,
    "ApplicationUserId" character varying(50) NOT NULL,
    "NotificationType" character varying(100) NOT NULL,
    "Seen" boolean NOT NULL,
    "Blob" bytea,
    "Blob2" jsonb
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: OffchainTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OffchainTransactions" (
    "Id" character varying(64) NOT NULL,
    "Blob" bytea
);


ALTER TABLE public."OffchainTransactions" OWNER TO postgres;

--
-- Name: PairedSINData; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PairedSINData" (
    "Id" text NOT NULL,
    "Label" text,
    "PairingTime" timestamp with time zone NOT NULL,
    "SIN" text,
    "StoreDataId" text
);


ALTER TABLE public."PairedSINData" OWNER TO postgres;

--
-- Name: PairingCodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PairingCodes" (
    "Id" text NOT NULL,
    "DateCreated" timestamp with time zone NOT NULL,
    "Expiration" timestamp with time zone NOT NULL,
    "Facade" text,
    "Label" text,
    "SIN" text,
    "StoreDataId" text,
    "TokenValue" text
);


ALTER TABLE public."PairingCodes" OWNER TO postgres;

--
-- Name: PayjoinLocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PayjoinLocks" (
    "Id" character varying(100) NOT NULL
);


ALTER TABLE public."PayjoinLocks" OWNER TO postgres;

--
-- Name: PaymentRequests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentRequests" (
    "Id" text NOT NULL,
    "StoreDataId" text,
    "Blob" bytea,
    "Created" timestamp with time zone DEFAULT '1970-01-01 00:00:00+00'::timestamp with time zone NOT NULL,
    "Archived" boolean DEFAULT false NOT NULL,
    "Blob2" jsonb,
    "ReferenceId" text,
    "Expiry" timestamp with time zone,
    "Amount" numeric DEFAULT 0.0 NOT NULL,
    "Currency" text,
    "Status" text NOT NULL
);


ALTER TABLE public."PaymentRequests" OWNER TO postgres;

--
-- Name: Payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payments" (
    "Id" text NOT NULL,
    "Blob" bytea,
    "InvoiceDataId" text,
    "Accounted" boolean DEFAULT false,
    "Blob2" jsonb,
    "PaymentMethodId" text NOT NULL,
    "Amount" numeric,
    "Created" timestamp with time zone,
    "Currency" text,
    "Status" text
);


ALTER TABLE public."Payments" OWNER TO postgres;

--
-- Name: PayoutProcessors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PayoutProcessors" (
    "Id" text NOT NULL,
    "StoreId" text,
    "PayoutMethodId" text,
    "Processor" text,
    "Blob" bytea,
    "Blob2" jsonb
);


ALTER TABLE public."PayoutProcessors" OWNER TO postgres;

--
-- Name: Payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payouts" (
    "Id" character varying(30) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "PullPaymentDataId" character varying(30),
    "State" character varying(20) NOT NULL,
    "PayoutMethodId" character varying(20) NOT NULL,
    "DedupId" text,
    "Blob" jsonb,
    "Proof" jsonb,
    "StoreDataId" text,
    "Currency" text NOT NULL,
    "Amount" numeric,
    "OriginalAmount" numeric NOT NULL,
    "OriginalCurrency" text NOT NULL
);


ALTER TABLE public."Payouts" OWNER TO postgres;

--
-- Name: PendingTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PendingTransactions" (
    "TransactionId" text,
    "CryptoCode" text,
    "StoreId" text,
    "Expiry" timestamp with time zone,
    "State" integer NOT NULL,
    "OutpointsUsed" text[],
    "Blob2" jsonb,
    "Id" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."PendingTransactions" OWNER TO postgres;

--
-- Name: PlannedTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PlannedTransactions" (
    "Id" character varying(100) NOT NULL,
    "BroadcastAt" timestamp with time zone NOT NULL,
    "Blob" bytea
);


ALTER TABLE public."PlannedTransactions" OWNER TO postgres;

--
-- Name: PullPayments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PullPayments" (
    "Id" character varying(30) NOT NULL,
    "StoreId" character varying(50),
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone,
    "Archived" boolean NOT NULL,
    "Blob" jsonb,
    "Currency" text NOT NULL,
    "Limit" numeric NOT NULL
);


ALTER TABLE public."PullPayments" OWNER TO postgres;

--
-- Name: Refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Refunds" (
    "InvoiceDataId" text NOT NULL,
    "PullPaymentDataId" text NOT NULL
);


ALTER TABLE public."Refunds" OWNER TO postgres;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settings" (
    "Id" text NOT NULL,
    "Value" jsonb
);


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- Name: StoreRoles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreRoles" (
    "Id" text NOT NULL,
    "StoreDataId" text,
    "Role" text NOT NULL,
    "Permissions" text[] NOT NULL
);


ALTER TABLE public."StoreRoles" OWNER TO postgres;

--
-- Name: StoreSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreSettings" (
    "Name" text NOT NULL,
    "StoreId" text NOT NULL,
    "Value" jsonb
);


ALTER TABLE public."StoreSettings" OWNER TO postgres;

--
-- Name: StoreWebhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreWebhooks" (
    "StoreId" character varying(50) NOT NULL,
    "WebhookId" character varying(25) NOT NULL
);


ALTER TABLE public."StoreWebhooks" OWNER TO postgres;

--
-- Name: Stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stores" (
    "Id" text NOT NULL,
    "DerivationStrategy" text,
    "SpeedPolicy" integer NOT NULL,
    "StoreCertificate" bytea,
    "StoreName" text,
    "StoreWebsite" text,
    "StoreBlob" jsonb,
    "DerivationStrategies" jsonb,
    "DefaultCrypto" text,
    "Archived" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Stores" OWNER TO postgres;

--
-- Name: U2FDevices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."U2FDevices" (
    "Id" text NOT NULL,
    "Name" text,
    "KeyHandle" bytea NOT NULL,
    "PublicKey" bytea NOT NULL,
    "AttestationCert" bytea NOT NULL,
    "Counter" integer NOT NULL,
    "ApplicationUserId" text
);


ALTER TABLE public."U2FDevices" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserStore; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserStore" (
    "ApplicationUserId" text NOT NULL,
    "StoreDataId" text NOT NULL,
    "Role" text
);


ALTER TABLE public."UserStore" OWNER TO postgres;

--
-- Name: WalletObjectLinks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletObjectLinks" (
    "WalletId" text NOT NULL,
    "AType" text NOT NULL,
    "AId" text NOT NULL,
    "BType" text NOT NULL,
    "BId" text NOT NULL,
    "Data" jsonb
);


ALTER TABLE public."WalletObjectLinks" OWNER TO postgres;

--
-- Name: WalletObjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletObjects" (
    "WalletId" text NOT NULL,
    "Type" text NOT NULL,
    "Id" text NOT NULL,
    "Data" jsonb
);


ALTER TABLE public."WalletObjects" OWNER TO postgres;

--
-- Name: WalletTransactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletTransactions" (
    "WalletDataId" text NOT NULL,
    "TransactionId" text NOT NULL,
    "Labels" text,
    "Blob" bytea
);


ALTER TABLE public."WalletTransactions" OWNER TO postgres;

--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallets" (
    "Id" text NOT NULL,
    "Blob" bytea
);


ALTER TABLE public."Wallets" OWNER TO postgres;

--
-- Name: WebhookDeliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WebhookDeliveries" (
    "Id" text NOT NULL,
    "WebhookId" text NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL,
    "Pruned" boolean NOT NULL,
    "Blob" jsonb NOT NULL
);


ALTER TABLE public."WebhookDeliveries" OWNER TO postgres;

--
-- Name: WebhookEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WebhookEvent" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "eventType" text NOT NULL,
    payload jsonb NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WebhookEvent" OWNER TO postgres;

--
-- Name: Webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Webhooks" (
    "Id" character varying(25) NOT NULL,
    "Blob" bytea NOT NULL,
    "Blob2" jsonb
);


ALTER TABLE public."Webhooks" OWNER TO postgres;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: boltcards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boltcards (
    id character varying(32) NOT NULL,
    counter integer DEFAULT 0 NOT NULL,
    ppid character varying(30),
    version integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.boltcards OWNER TO postgres;

--
-- Name: lang_dictionaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lang_dictionaries (
    dict_id text NOT NULL,
    fallback text,
    source text,
    metadata jsonb
);


ALTER TABLE public.lang_dictionaries OWNER TO postgres;

--
-- Name: lang_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lang_translations (
    dict_id text NOT NULL,
    sentence text NOT NULL,
    translation text NOT NULL
);


ALTER TABLE public.lang_translations OWNER TO postgres;

--
-- Name: translations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.translations AS
 WITH RECURSIVE translations_with_paths AS (
         SELECT d.dict_id,
            t.sentence,
            t.translation,
            ARRAY[d.dict_id] AS path
           FROM (public.lang_translations t
             JOIN public.lang_dictionaries d USING (dict_id))
        UNION ALL
         SELECT d.dict_id,
            t.sentence,
            t.translation,
            (d.dict_id || t.path)
           FROM (translations_with_paths t
             JOIN public.lang_dictionaries d ON ((d.fallback = t.dict_id)))
        ), ranked_translations AS (
         SELECT translations_with_paths.dict_id,
            translations_with_paths.sentence,
            translations_with_paths.translation,
            translations_with_paths.path,
            row_number() OVER (PARTITION BY translations_with_paths.dict_id, translations_with_paths.sentence ORDER BY (array_length(translations_with_paths.path, 1))) AS rn
           FROM translations_with_paths
        )
 SELECT dict_id,
    sentence,
    translation,
    path
   FROM ranked_translations
  WHERE (rn = 1);


ALTER VIEW public.translations OWNER TO postgres;

--
-- Name: VIEW translations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.translations IS 'Compute the translation for all sentences for all dictionaries, taking into account fallbacks';


--
-- Name: InvoiceSearches Id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceSearches" ALTER COLUMN "Id" SET DEFAULT nextval('public."InvoiceSearches_Id_seq"'::regclass);


--
-- Data for Name: AddressInvoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AddressInvoices" ("Address", "InvoiceDataId", "PaymentMethodId") FROM stdin;
\.


--
-- Data for Name: ApiKeys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ApiKeys" ("Id", "StoreId", "Type", "UserId", "Label", "Blob", "Blob2") FROM stdin;
\.


--
-- Data for Name: Apps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Apps" ("Id", "AppType", "Created", "Name", "Settings", "StoreDataId", "TagAllInvoices", "Archived") FROM stdin;
\.


--
-- Data for Name: AspNetRoleClaims; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetRoleClaims" ("Id", "ClaimType", "ClaimValue", "RoleId") FROM stdin;
\.


--
-- Data for Name: AspNetRoles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetRoles" ("Id", "ConcurrencyStamp", "Name", "NormalizedName") FROM stdin;
cd03bd12-7afa-4b64-93a9-acee0e9f9c33	\N	ServerAdmin	SERVERADMIN
\.


--
-- Data for Name: AspNetUserClaims; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetUserClaims" ("Id", "ClaimType", "ClaimValue", "UserId") FROM stdin;
\.


--
-- Data for Name: AspNetUserLogins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetUserLogins" ("LoginProvider", "ProviderKey", "ProviderDisplayName", "UserId") FROM stdin;
\.


--
-- Data for Name: AspNetUserRoles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetUserRoles" ("UserId", "RoleId") FROM stdin;
ec812ebb-2e2e-435b-b72e-2b5fb1be12a6	cd03bd12-7afa-4b64-93a9-acee0e9f9c33
\.


--
-- Data for Name: AspNetUserTokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetUserTokens" ("UserId", "LoginProvider", "Name", "Value") FROM stdin;
\.


--
-- Data for Name: AspNetUsers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AspNetUsers" ("Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName", "RequiresEmailConfirmation", "Created", "DisabledNotifications", "Blob", "Blob2", "Approved", "RequiresApproval") FROM stdin;
ec812ebb-2e2e-435b-b72e-2b5fb1be12a6	0	caebc3e9-f797-4453-a608-45b12f9835ae	mceeloh@gmail.com	f	t	\N	MCEELOH@GMAIL.COM	MCEELOH@GMAIL.COM	AQAAAAIAAYagAAAAENFA4JXD2jk3J8zZOZZepwY1Q9HHV0tYvfT7891uauoq54FF9ZHbhvRobB5jhLQsHA==	\N	f	ZXKGDBLLT3OQSXPAM3CHKOUPSRDCTVLE	f	mceeloh@gmail.com	f	2025-10-18 12:05:35.154263+00	\N	\N	\N	t	f
\.


--
-- Data for Name: Deposit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deposit" (id, "userId", "invoiceId", amount, currency, status, "btcpayStatus", "confirmedAt", "createdAt", "updatedAt", "walletAddress", "txHash") FROM stdin;
\.


--
-- Data for Name: Fido2Credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fido2Credentials" ("Id", "Name", "ApplicationUserId", "Blob", "Type", "Blob2") FROM stdin;
\.


--
-- Data for Name: Files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Files" ("Id", "FileName", "StorageFileName", "Timestamp", "ApplicationUserId") FROM stdin;
\.


--
-- Data for Name: Forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Forms" ("Id", "Name", "StoreId", "Config", "Public") FROM stdin;
\.


--
-- Data for Name: InvoiceEvents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceEvents" ("InvoiceDataId", "Message", "Timestamp", "Severity") FROM stdin;
\.


--
-- Data for Name: InvoiceSearches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceSearches" ("Id", "InvoiceDataId", "Value") FROM stdin;
\.


--
-- Data for Name: InvoiceWebhookDeliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceWebhookDeliveries" ("InvoiceId", "DeliveryId") FROM stdin;
\.


--
-- Data for Name: Invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoices" ("Id", "Blob", "Created", "ExceptionStatus", "Status", "StoreDataId", "Archived", "Blob2", "Amount", "Currency") FROM stdin;
\.


--
-- Data for Name: LedgerEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LedgerEntry" (id, "userId", account, "deltaMinor", currency, "refType", "refId", "createdAt") FROM stdin;
\.


--
-- Data for Name: LightningAddresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LightningAddresses" ("Username", "StoreDataId", "Blob", "Blob2") FROM stdin;
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" ("Id", "Created", "ApplicationUserId", "NotificationType", "Seen", "Blob", "Blob2") FROM stdin;
\.


--
-- Data for Name: OffchainTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OffchainTransactions" ("Id", "Blob") FROM stdin;
\.


--
-- Data for Name: PairedSINData; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PairedSINData" ("Id", "Label", "PairingTime", "SIN", "StoreDataId") FROM stdin;
\.


--
-- Data for Name: PairingCodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PairingCodes" ("Id", "DateCreated", "Expiration", "Facade", "Label", "SIN", "StoreDataId", "TokenValue") FROM stdin;
\.


--
-- Data for Name: PayjoinLocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PayjoinLocks" ("Id") FROM stdin;
\.


--
-- Data for Name: PaymentRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentRequests" ("Id", "StoreDataId", "Blob", "Created", "Archived", "Blob2", "ReferenceId", "Expiry", "Amount", "Currency", "Status") FROM stdin;
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" ("Id", "Blob", "InvoiceDataId", "Accounted", "Blob2", "PaymentMethodId", "Amount", "Created", "Currency", "Status") FROM stdin;
\.


--
-- Data for Name: PayoutProcessors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PayoutProcessors" ("Id", "StoreId", "PayoutMethodId", "Processor", "Blob", "Blob2") FROM stdin;
\.


--
-- Data for Name: Payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payouts" ("Id", "Date", "PullPaymentDataId", "State", "PayoutMethodId", "DedupId", "Blob", "Proof", "StoreDataId", "Currency", "Amount", "OriginalAmount", "OriginalCurrency") FROM stdin;
\.


--
-- Data for Name: PendingTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PendingTransactions" ("TransactionId", "CryptoCode", "StoreId", "Expiry", "State", "OutpointsUsed", "Blob2", "Id") FROM stdin;
\.


--
-- Data for Name: PlannedTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PlannedTransactions" ("Id", "BroadcastAt", "Blob") FROM stdin;
\.


--
-- Data for Name: PullPayments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PullPayments" ("Id", "StoreId", "StartDate", "EndDate", "Archived", "Blob", "Currency", "Limit") FROM stdin;
\.


--
-- Data for Name: Refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Refunds" ("InvoiceDataId", "PullPaymentDataId") FROM stdin;
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" ("Id", "Value") FROM stdin;
BTCPayServer.Storage.Models.StorageSettings	{"Provider": 3, "ConfigurationStr": "{\\n  \\"ContainerName\\": \\"\\"\\n}"}
BTCPayServer.Services.MigrationSettings	{"AddStoreToPayout": true, "MigrateU2FToFIDO2": true, "AddInitialUserBlob": true, "MigrateAppYmlToJson": true, "MigrateWalletColors": true, "MigrateToStoreConfig": true, "PaymentMethodCriteria": true, "FixMappedDomainAppType": true, "MigrateAppCustomOption": true, "MigrateBlockExplorerLinks": true, "MigrateHotwalletProperty2": true, "MigratedTransactionLabels": 2147483647, "FileSystemStorageAsDefault": true, "MigratePayoutDestinationId": true, "LighingAddressSettingRename": true, "MigrateOldDerivationSchemes": true, "MigratedInvoiceTextSearchPages": 2147483647, "LighingAddressDatabaseMigration": true, "MigrateEmailServerDisableTLSCerts": true, "MigrateStoreExcludedPaymentMethods": true, "TransitionToStoreBlobAdditionalData": true, "TransitionInternalNodeConnectionString": true}
PaymentRequestsMigration2	{"Complete": true, "Progress": null}
InvoicesMigration	{"Complete": true, "Progress": null}
BTCPayServer.Services.ThemeSettings	{"LogoUrl": null, "FirstRun": false, "CustomTheme": false, "CustomThemeCssUrl": null, "CustomThemeExtension": 0}
BTCPayServer.Services.PoliciesSettings	{"RootAppId": null, "DefaultRole": null, "RootAppType": null, "Experimental": false, "PluginSource": null, "LangDictionary": "English", "LockSubscription": true, "DisableSSHService": false, "PluginPreReleases": false, "BlockExplorerLinks": [], "DomainToAppMapping": [], "CheckForNewVersions": false, "AllowHotWalletForAll": false, "DefaultStoreTemplate": null, "RequiresUserApproval": false, "RequiresConfirmedEmail": false, "DiscourageSearchEngines": false, "AllowCreateColdWalletForAll": false, "DisableNonAdminCreateUserApi": false, "AllowHotWalletRPCImportForAll": false, "AllowLightningInternalNodeForAll": false, "DisableStoresToUseServerEmailSettings": false}
BTCPayServer.HostedServices.PluginVersionCheckerDataHolder	{"LastVersions": {"BTCPayServer.Plugins.USDt": "0.4.5.0"}}
USDT_TRON_LISTENER_STATE	{"LastBlockHeight": 61454987}
\.


--
-- Data for Name: StoreRoles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreRoles" ("Id", "StoreDataId", "Role", "Permissions") FROM stdin;
Manager	\N	Manager	{btcpay.store.canviewstoresettings,btcpay.store.canmodifyinvoices,btcpay.store.webhooks.canmodifywebhooks,btcpay.store.canmodifypaymentrequests,btcpay.store.canmanagepullpayments,btcpay.store.canmanagepayouts}
Employee	\N	Employee	{btcpay.store.canmodifyinvoices,btcpay.store.canmodifypaymentrequests,btcpay.store.cancreatenonapprovedpullpayments,btcpay.store.canviewpayouts,btcpay.store.canviewpullpayments}
Guest	\N	Guest	{btcpay.store.canmodifyinvoices,btcpay.store.canviewpaymentrequests,btcpay.store.canviewpullpayments,btcpay.store.canviewpayouts}
Owner	\N	Owner	{btcpay.store.canmodifystoresettings}
\.


--
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreSettings" ("Name", "StoreId", "Value") FROM stdin;
\.


--
-- Data for Name: StoreWebhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreWebhooks" ("StoreId", "WebhookId") FROM stdin;
\.


--
-- Data for Name: Stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stores" ("Id", "DerivationStrategy", "SpeedPolicy", "StoreCertificate", "StoreName", "StoreWebsite", "StoreBlob", "DerivationStrategies", "DefaultCrypto", "Archived") FROM stdin;
Cz77Wgp1Zd4TdEWUvLR8a69ZbM34CKnFEQiEjgt1Z9QQ	\N	1	\N	Demo USDT	\N	{"cssUrl": null, "spread": 0.0, "logoUrl": null, "htmlTitle": null, "brandColor": null, "emailRules": null, "defaultLang": null, "emailSettings": null, "networkFeeMode": "MultiplePaymentsOnly", "payJoinEnabled": false, "receiptOptions": {"showQR": true, "enabled": true, "showPayments": true}, "defaultCurrency": "U", "paymentSoundUrl": null, "showStoreHeader": true, "storeSupportUrl": null, "anyoneCanInvoice": false, "celebratePayment": true, "paymentTolerance": 0.0, "invoiceExpiration": 15, "autoDetectLanguage": false, "lazyPaymentMethods": false, "playSoundOnPayment": false, "showRecommendedFee": true, "primaryRateSettings": {"rateScript": null, "rateScripting": false, "preferredExchange": null}, "defaultCurrencyPairs": [], "fallbackRateSettings": null, "monitoringExpiration": 1440, "paymentMethodCriteria": [], "redirectAutomatically": false, "showPayInWalletButton": true, "additionalTrackedRates": [], "displayExpirationTimer": 5, "excludedPaymentMethods": null, "applyBrandColorToBackend": false, "lightningAmountInSatoshi": false, "recommendedFeeBlockTarget": 1, "lightningPrivateRouteHints": false, "lightningDescriptionTemplate": "Paid to {StoreName} (Order ID: {OrderId})", "onChainWithLnInvoiceFallback": false}	\N	\N	f
\.


--
-- Data for Name: U2FDevices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."U2FDevices" ("Id", "Name", "KeyHandle", "PublicKey", "AttestationCert", "Counter", "ApplicationUserId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserStore; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserStore" ("ApplicationUserId", "StoreDataId", "Role") FROM stdin;
ec812ebb-2e2e-435b-b72e-2b5fb1be12a6	Cz77Wgp1Zd4TdEWUvLR8a69ZbM34CKnFEQiEjgt1Z9QQ	Owner
\.


--
-- Data for Name: WalletObjectLinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletObjectLinks" ("WalletId", "AType", "AId", "BType", "BId", "Data") FROM stdin;
\.


--
-- Data for Name: WalletObjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletObjects" ("WalletId", "Type", "Id", "Data") FROM stdin;
\.


--
-- Data for Name: WalletTransactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletTransactions" ("WalletDataId", "TransactionId", "Labels", "Blob") FROM stdin;
\.


--
-- Data for Name: Wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wallets" ("Id", "Blob") FROM stdin;
\.


--
-- Data for Name: WebhookDeliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WebhookDeliveries" ("Id", "WebhookId", "Timestamp", "Pruned", "Blob") FROM stdin;
\.


--
-- Data for Name: WebhookEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WebhookEvent" (id, "eventId", "eventType", payload, processed, "createdAt") FROM stdin;
\.


--
-- Data for Name: Webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Webhooks" ("Id", "Blob", "Blob2") FROM stdin;
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20200225133433_AddApiKeyLabel	8.0.11
20200402065615_AddApiKeyBlob	8.0.11
20200413052418_PlannedTransactions	8.0.11
20200507092343_AddArchivedToInvoice	8.0.11
20200625064111_refundnotificationpullpayments	8.0.11
20200901161733_AddInvoiceEventLogSeverity	8.0.11
20201002145033_AddCreateDateToUser	8.0.11
20201007090617_u2fDeviceCascade	8.0.11
20201015151438_AddDisabledNotificationsToUser	8.0.11
20201108054749_webhooks	8.0.11
20201208054211_invoicesorderindex	8.0.11
20201228225040_AddingInvoiceSearchesTable	8.0.11
20210314092253_Fido2Credentials	8.0.11
20211021085011_RemovePayoutDestinationConstraint	8.0.11
20211125081400_AddUserBlob	8.0.11
20220115184620_AddCustodianAccountData	8.0.11
20220311135252_AddPayoutProcessors	8.0.11
20220414132313_AddLightningAddress	8.0.11
20220518061525_invoice_created_idx	8.0.11
20220523022603_remove_historical_addresses	8.0.11
20220610090843_AddSettingsToStore	8.0.11
20220929132704_label	8.0.11
20221128062447_jsonb	8.0.11
20230123062447_migrateoldratesource	8.0.11
20230125085242_AddForms	8.0.11
20230130040047_blob2	8.0.11
20230130062447_jsonb2	8.0.11
20230315062447_fixmaxlength	8.0.11
20230504125505_StoreRoles	8.0.11
20230529135505_WebhookDeliveriesCleanup	8.0.11
20230906135844_AddArchivedFlagForStoresAndApps	8.0.11
20231020135844_AddBoltcardsTable	8.0.11
20231121031609_removecurrentrefund	8.0.11
20231219031609_appssettingstojson	8.0.11
20231219031609_translationsmigration	8.0.11
20240104155620_AddApprovalToApplicationUser	8.0.11
20240220000000_FixWalletObjectsWithEmptyWalletId	8.0.11
20240229000000_PayoutAndPullPaymentToJsonBlob	8.0.11
20240229092905_AddManagerAndEmployeeToStoreRoles	8.0.11
20240304003640_addinvoicecolumns	8.0.11
20240317024757_payments_refactor	8.0.11
20240325095923_RemoveCustodian	8.0.11
20240405004015_cleanup_invoice_events	8.0.11
20240501015052_noperiod	8.0.11
20240508015052_fileid	8.0.11
20240826065950_removeinvoicecols	8.0.11
20240827034505_migratepayouts	8.0.11
20240904092905_UpdateStoreOwnerRole	8.0.11
20240913034505_refactorpendinginvoicespayments	8.0.11
20240919085726_refactorinvoiceaddress	8.0.11
20240923065254_refactorpayments	8.0.11
20240924065254_monitoredinvoices	8.0.11
20241029163147_AddingPendingTransactionsTable	8.0.11
20250407133937_AddingReferenceIdToPaymentRequest	8.0.11
20250407133937_pr_expiry	8.0.11
20250418074941_changependingtxsid	8.0.11
20250501000000_storetemplate	8.0.11
20250508000000_fallbackrates	8.0.11
20250709000000_lightningaddressinmetadata	8.0.11
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1191beca-4bea-4957-9683-772b71604ef2	8ecbf51e5838d7676f8e0e00bbcbdb4108e0301243445e191151bfe7ad1a102e	2025-10-18 12:00:07.395672+00	20250828155826_init	\N	\N	2025-10-18 12:00:07.300687+00	1
2102c43c-19a4-4652-9860-cef58dc899eb	20b345abae91136cc22b4e4dc0723c8565322c70e30ac140631a4cf185f0a465	2025-10-18 12:00:07.409464+00	20251010102010_add_wallet_address	\N	\N	2025-10-18 12:00:07.398707+00	1
8d3bf6c7-5e30-4f43-b75c-0564d9c92467	b966d203f381d961f9decd7009402c38d72bcc339211de45e8edcfe7045b3954	2025-10-18 12:00:13.616658+00	20251018120013_apply_all	\N	\N	2025-10-18 12:00:13.590298+00	1
\.


--
-- Data for Name: boltcards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boltcards (id, counter, ppid, version) FROM stdin;
\.


--
-- Data for Name: lang_dictionaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lang_dictionaries (dict_id, fallback, source, metadata) FROM stdin;
English	\N	Default	\N
\.


--
-- Data for Name: lang_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lang_translations (dict_id, sentence, translation) FROM stdin;
\.


--
-- Name: InvoiceSearches_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InvoiceSearches_Id_seq"', 1, false);


--
-- Name: Deposit Deposit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY (id);


--
-- Name: LedgerEntry LedgerEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY (id);


--
-- Name: AddressInvoices PK_AddressInvoices; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AddressInvoices"
    ADD CONSTRAINT "PK_AddressInvoices" PRIMARY KEY ("Address", "PaymentMethodId");


--
-- Name: ApiKeys PK_ApiKeys; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApiKeys"
    ADD CONSTRAINT "PK_ApiKeys" PRIMARY KEY ("Id");


--
-- Name: Apps PK_Apps; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Apps"
    ADD CONSTRAINT "PK_Apps" PRIMARY KEY ("Id");


--
-- Name: AspNetRoleClaims PK_AspNetRoleClaims; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetRoleClaims"
    ADD CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id");


--
-- Name: AspNetRoles PK_AspNetRoles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetRoles"
    ADD CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id");


--
-- Name: AspNetUserClaims PK_AspNetUserClaims; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserClaims"
    ADD CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id");


--
-- Name: AspNetUserLogins PK_AspNetUserLogins; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserLogins"
    ADD CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey");


--
-- Name: AspNetUserRoles PK_AspNetUserRoles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserRoles"
    ADD CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId");


--
-- Name: AspNetUserTokens PK_AspNetUserTokens; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserTokens"
    ADD CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name");


--
-- Name: AspNetUsers PK_AspNetUsers; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUsers"
    ADD CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id");


--
-- Name: Fido2Credentials PK_Fido2Credentials; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fido2Credentials"
    ADD CONSTRAINT "PK_Fido2Credentials" PRIMARY KEY ("Id");


--
-- Name: Files PK_Files; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "PK_Files" PRIMARY KEY ("Id");


--
-- Name: Forms PK_Forms; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Forms"
    ADD CONSTRAINT "PK_Forms" PRIMARY KEY ("Id");


--
-- Name: InvoiceSearches PK_InvoiceSearches; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceSearches"
    ADD CONSTRAINT "PK_InvoiceSearches" PRIMARY KEY ("Id");


--
-- Name: InvoiceWebhookDeliveries PK_InvoiceWebhookDeliveries; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceWebhookDeliveries"
    ADD CONSTRAINT "PK_InvoiceWebhookDeliveries" PRIMARY KEY ("InvoiceId", "DeliveryId");


--
-- Name: Invoices PK_Invoices; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "PK_Invoices" PRIMARY KEY ("Id");


--
-- Name: LightningAddresses PK_LightningAddresses; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LightningAddresses"
    ADD CONSTRAINT "PK_LightningAddresses" PRIMARY KEY ("Username");


--
-- Name: Notifications PK_Notifications; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id");


--
-- Name: OffchainTransactions PK_OffchainTransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OffchainTransactions"
    ADD CONSTRAINT "PK_OffchainTransactions" PRIMARY KEY ("Id");


--
-- Name: PairedSINData PK_PairedSINData; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PairedSINData"
    ADD CONSTRAINT "PK_PairedSINData" PRIMARY KEY ("Id");


--
-- Name: PairingCodes PK_PairingCodes; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PairingCodes"
    ADD CONSTRAINT "PK_PairingCodes" PRIMARY KEY ("Id");


--
-- Name: PayjoinLocks PK_PayjoinLocks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayjoinLocks"
    ADD CONSTRAINT "PK_PayjoinLocks" PRIMARY KEY ("Id");


--
-- Name: PaymentRequests PK_PaymentRequests; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentRequests"
    ADD CONSTRAINT "PK_PaymentRequests" PRIMARY KEY ("Id");


--
-- Name: Payments PK_Payments; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "PK_Payments" PRIMARY KEY ("Id", "PaymentMethodId");


--
-- Name: PayoutProcessors PK_PayoutProcessors; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayoutProcessors"
    ADD CONSTRAINT "PK_PayoutProcessors" PRIMARY KEY ("Id");


--
-- Name: Payouts PK_Payouts; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payouts"
    ADD CONSTRAINT "PK_Payouts" PRIMARY KEY ("Id");


--
-- Name: PendingTransactions PK_PendingTransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PendingTransactions"
    ADD CONSTRAINT "PK_PendingTransactions" PRIMARY KEY ("Id");


--
-- Name: PlannedTransactions PK_PlannedTransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlannedTransactions"
    ADD CONSTRAINT "PK_PlannedTransactions" PRIMARY KEY ("Id");


--
-- Name: PullPayments PK_PullPayments; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PullPayments"
    ADD CONSTRAINT "PK_PullPayments" PRIMARY KEY ("Id");


--
-- Name: Refunds PK_Refunds; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refunds"
    ADD CONSTRAINT "PK_Refunds" PRIMARY KEY ("InvoiceDataId", "PullPaymentDataId");


--
-- Name: Settings PK_Settings; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "PK_Settings" PRIMARY KEY ("Id");


--
-- Name: StoreRoles PK_StoreRoles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreRoles"
    ADD CONSTRAINT "PK_StoreRoles" PRIMARY KEY ("Id");


--
-- Name: StoreSettings PK_StoreSettings; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "PK_StoreSettings" PRIMARY KEY ("StoreId", "Name");


--
-- Name: StoreWebhooks PK_StoreWebhooks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreWebhooks"
    ADD CONSTRAINT "PK_StoreWebhooks" PRIMARY KEY ("StoreId", "WebhookId");


--
-- Name: Stores PK_Stores; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stores"
    ADD CONSTRAINT "PK_Stores" PRIMARY KEY ("Id");


--
-- Name: U2FDevices PK_U2FDevices; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."U2FDevices"
    ADD CONSTRAINT "PK_U2FDevices" PRIMARY KEY ("Id");


--
-- Name: UserStore PK_UserStore; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStore"
    ADD CONSTRAINT "PK_UserStore" PRIMARY KEY ("ApplicationUserId", "StoreDataId");


--
-- Name: WalletObjectLinks PK_WalletObjectLinks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletObjectLinks"
    ADD CONSTRAINT "PK_WalletObjectLinks" PRIMARY KEY ("WalletId", "AType", "AId", "BType", "BId");


--
-- Name: WalletObjects PK_WalletObjects; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletObjects"
    ADD CONSTRAINT "PK_WalletObjects" PRIMARY KEY ("WalletId", "Type", "Id");


--
-- Name: WalletTransactions PK_WalletTransactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "PK_WalletTransactions" PRIMARY KEY ("WalletDataId", "TransactionId");


--
-- Name: Wallets PK_Wallets; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "PK_Wallets" PRIMARY KEY ("Id");


--
-- Name: WebhookDeliveries PK_WebhookDeliveries; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebhookDeliveries"
    ADD CONSTRAINT "PK_WebhookDeliveries" PRIMARY KEY ("Id");


--
-- Name: Webhooks PK_Webhooks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Webhooks"
    ADD CONSTRAINT "PK_Webhooks" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: boltcards PK_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boltcards
    ADD CONSTRAINT "PK_id" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WebhookEvent WebhookEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebhookEvent"
    ADD CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: lang_dictionaries lang_dictionaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lang_dictionaries
    ADD CONSTRAINT lang_dictionaries_pkey PRIMARY KEY (dict_id);


--
-- Name: lang_translations lang_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lang_translations
    ADD CONSTRAINT lang_translations_pkey PRIMARY KEY (dict_id, sentence);


--
-- Name: Deposit_invoiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Deposit_invoiceId_key" ON public."Deposit" USING btree ("invoiceId");


--
-- Name: Deposit_txHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Deposit_txHash_key" ON public."Deposit" USING btree ("txHash");


--
-- Name: EmailIndex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailIndex" ON public."AspNetUsers" USING btree ("NormalizedEmail");


--
-- Name: IX_AddressInvoices_InvoiceDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AddressInvoices_InvoiceDataId" ON public."AddressInvoices" USING btree ("InvoiceDataId");


--
-- Name: IX_ApiKeys_StoreId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ApiKeys_StoreId" ON public."ApiKeys" USING btree ("StoreId");


--
-- Name: IX_ApiKeys_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ApiKeys_UserId" ON public."ApiKeys" USING btree ("UserId");


--
-- Name: IX_Apps_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Apps_StoreDataId" ON public."Apps" USING btree ("StoreDataId");


--
-- Name: IX_AspNetRoleClaims_RoleId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON public."AspNetRoleClaims" USING btree ("RoleId");


--
-- Name: IX_AspNetUserClaims_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AspNetUserClaims_UserId" ON public."AspNetUserClaims" USING btree ("UserId");


--
-- Name: IX_AspNetUserLogins_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AspNetUserLogins_UserId" ON public."AspNetUserLogins" USING btree ("UserId");


--
-- Name: IX_AspNetUserRoles_RoleId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON public."AspNetUserRoles" USING btree ("RoleId");


--
-- Name: IX_Fido2Credentials_ApplicationUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Fido2Credentials_ApplicationUserId" ON public."Fido2Credentials" USING btree ("ApplicationUserId");


--
-- Name: IX_Files_ApplicationUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Files_ApplicationUserId" ON public."Files" USING btree ("ApplicationUserId");


--
-- Name: IX_Forms_StoreId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Forms_StoreId" ON public."Forms" USING btree ("StoreId");


--
-- Name: IX_InvoiceEvents_InvoiceDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_InvoiceEvents_InvoiceDataId" ON public."InvoiceEvents" USING btree ("InvoiceDataId");


--
-- Name: IX_InvoiceSearches_InvoiceDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_InvoiceSearches_InvoiceDataId" ON public."InvoiceSearches" USING btree ("InvoiceDataId");


--
-- Name: IX_InvoiceSearches_Value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_InvoiceSearches_Value" ON public."InvoiceSearches" USING btree ("Value");


--
-- Name: IX_Invoices_Created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Invoices_Created" ON public."Invoices" USING btree ("Created");


--
-- Name: IX_Invoices_Metadata_ItemCode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Invoices_Metadata_ItemCode" ON public."Invoices" USING btree (public.get_itemcode("Blob2")) WHERE (public.get_itemcode("Blob2") IS NOT NULL);


--
-- Name: IX_Invoices_Metadata_OrderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Invoices_Metadata_OrderId" ON public."Invoices" USING btree (public.get_orderid("Blob2")) WHERE (public.get_orderid("Blob2") IS NOT NULL);


--
-- Name: IX_Invoices_Pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Invoices_Pending" ON public."Invoices" USING btree ((1)) WHERE public.is_pending("Status");


--
-- Name: IX_Invoices_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Invoices_StoreDataId" ON public."Invoices" USING btree ("StoreDataId");


--
-- Name: IX_LightningAddresses_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_LightningAddresses_StoreDataId" ON public."LightningAddresses" USING btree ("StoreDataId");


--
-- Name: IX_Notifications_ApplicationUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Notifications_ApplicationUserId" ON public."Notifications" USING btree ("ApplicationUserId");


--
-- Name: IX_PairedSINData_SIN; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PairedSINData_SIN" ON public."PairedSINData" USING btree ("SIN");


--
-- Name: IX_PairedSINData_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PairedSINData_StoreDataId" ON public."PairedSINData" USING btree ("StoreDataId");


--
-- Name: IX_PaymentRequests_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PaymentRequests_StoreDataId" ON public."PaymentRequests" USING btree ("StoreDataId");


--
-- Name: IX_Payments_InvoiceDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payments_InvoiceDataId" ON public."Payments" USING btree ("InvoiceDataId");


--
-- Name: IX_Payments_Pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payments_Pending" ON public."Payments" USING btree ((1)) WHERE public.is_pending("Status");


--
-- Name: IX_PayoutProcessors_StoreId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PayoutProcessors_StoreId" ON public."PayoutProcessors" USING btree ("StoreId");


--
-- Name: IX_Payouts_DedupId_State; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payouts_DedupId_State" ON public."Payouts" USING btree ("DedupId", "State");


--
-- Name: IX_Payouts_PullPaymentDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payouts_PullPaymentDataId" ON public."Payouts" USING btree ("PullPaymentDataId");


--
-- Name: IX_Payouts_State; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payouts_State" ON public."Payouts" USING btree ("State");


--
-- Name: IX_Payouts_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Payouts_StoreDataId" ON public."Payouts" USING btree ("StoreDataId");


--
-- Name: IX_PendingTransactions_StoreId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PendingTransactions_StoreId" ON public."PendingTransactions" USING btree ("StoreId");


--
-- Name: IX_PendingTransactions_TransactionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PendingTransactions_TransactionId" ON public."PendingTransactions" USING btree ("TransactionId");


--
-- Name: IX_PullPayments_StoreId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_PullPayments_StoreId" ON public."PullPayments" USING btree ("StoreId");


--
-- Name: IX_Refunds_PullPaymentDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Refunds_PullPaymentDataId" ON public."Refunds" USING btree ("PullPaymentDataId");


--
-- Name: IX_StoreRoles_StoreDataId_Role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_StoreRoles_StoreDataId_Role" ON public."StoreRoles" USING btree ("StoreDataId", "Role");


--
-- Name: IX_U2FDevices_ApplicationUserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_U2FDevices_ApplicationUserId" ON public."U2FDevices" USING btree ("ApplicationUserId");


--
-- Name: IX_UserStore_StoreDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_UserStore_StoreDataId" ON public."UserStore" USING btree ("StoreDataId");


--
-- Name: IX_WalletObjectLinks_WalletId_BType_BId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletObjectLinks_WalletId_BType_BId" ON public."WalletObjectLinks" USING btree ("WalletId", "BType", "BId");


--
-- Name: IX_WalletObjects_Type_Id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WalletObjects_Type_Id" ON public."WalletObjects" USING btree ("Type", "Id");


--
-- Name: IX_WebhookDeliveries_Timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WebhookDeliveries_Timestamp" ON public."WebhookDeliveries" USING btree ("Timestamp") WHERE ("Pruned" IS FALSE);


--
-- Name: IX_WebhookDeliveries_WebhookId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_WebhookDeliveries_WebhookId" ON public."WebhookDeliveries" USING btree ("WebhookId");


--
-- Name: RoleNameIndex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RoleNameIndex" ON public."AspNetRoles" USING btree ("NormalizedName");


--
-- Name: UserNameIndex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserNameIndex" ON public."AspNetUsers" USING btree ("NormalizedUserName");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WebhookEvent_eventId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON public."WebhookEvent" USING btree ("eventId");


--
-- Name: ix_paymentrequests_storedataid_referenceid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_paymentrequests_storedataid_referenceid ON public."PaymentRequests" USING btree ("StoreDataId", "ReferenceId") WHERE ("ReferenceId" IS NOT NULL);


--
-- Name: Deposit Deposit_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AddressInvoices FK_AddressInvoices_Invoices_InvoiceDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AddressInvoices"
    ADD CONSTRAINT "FK_AddressInvoices_Invoices_InvoiceDataId" FOREIGN KEY ("InvoiceDataId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: ApiKeys FK_ApiKeys_AspNetUsers_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApiKeys"
    ADD CONSTRAINT "FK_ApiKeys_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: ApiKeys FK_ApiKeys_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ApiKeys"
    ADD CONSTRAINT "FK_ApiKeys_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: Apps FK_Apps_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Apps"
    ADD CONSTRAINT "FK_Apps_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: AspNetRoleClaims FK_AspNetRoleClaims_AspNetRoles_RoleId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetRoleClaims"
    ADD CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES public."AspNetRoles"("Id") ON DELETE CASCADE;


--
-- Name: AspNetUserClaims FK_AspNetUserClaims_AspNetUsers_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserClaims"
    ADD CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: AspNetUserLogins FK_AspNetUserLogins_AspNetUsers_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserLogins"
    ADD CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: AspNetUserRoles FK_AspNetUserRoles_AspNetRoles_RoleId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserRoles"
    ADD CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES public."AspNetRoles"("Id") ON DELETE CASCADE;


--
-- Name: AspNetUserRoles FK_AspNetUserRoles_AspNetUsers_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserRoles"
    ADD CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: AspNetUserTokens FK_AspNetUserTokens_AspNetUsers_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AspNetUserTokens"
    ADD CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: Fido2Credentials FK_Fido2Credentials_AspNetUsers_ApplicationUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fido2Credentials"
    ADD CONSTRAINT "FK_Fido2Credentials_AspNetUsers_ApplicationUserId" FOREIGN KEY ("ApplicationUserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: Files FK_Files_AspNetUsers_ApplicationUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Files"
    ADD CONSTRAINT "FK_Files_AspNetUsers_ApplicationUserId" FOREIGN KEY ("ApplicationUserId") REFERENCES public."AspNetUsers"("Id") ON DELETE RESTRICT;


--
-- Name: Forms FK_Forms_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Forms"
    ADD CONSTRAINT "FK_Forms_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: InvoiceEvents FK_InvoiceEvents_Invoices_InvoiceDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceEvents"
    ADD CONSTRAINT "FK_InvoiceEvents_Invoices_InvoiceDataId" FOREIGN KEY ("InvoiceDataId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: InvoiceSearches FK_InvoiceSearches_Invoices_InvoiceDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceSearches"
    ADD CONSTRAINT "FK_InvoiceSearches_Invoices_InvoiceDataId" FOREIGN KEY ("InvoiceDataId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: InvoiceWebhookDeliveries FK_InvoiceWebhookDeliveries_Invoices_InvoiceId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceWebhookDeliveries"
    ADD CONSTRAINT "FK_InvoiceWebhookDeliveries_Invoices_InvoiceId" FOREIGN KEY ("InvoiceId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: InvoiceWebhookDeliveries FK_InvoiceWebhookDeliveries_WebhookDeliveries_DeliveryId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceWebhookDeliveries"
    ADD CONSTRAINT "FK_InvoiceWebhookDeliveries_WebhookDeliveries_DeliveryId" FOREIGN KEY ("DeliveryId") REFERENCES public."WebhookDeliveries"("Id") ON DELETE CASCADE;


--
-- Name: Invoices FK_Invoices_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "FK_Invoices_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: LightningAddresses FK_LightningAddresses_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LightningAddresses"
    ADD CONSTRAINT "FK_LightningAddresses_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: Notifications FK_Notifications_AspNetUsers_ApplicationUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_AspNetUsers_ApplicationUserId" FOREIGN KEY ("ApplicationUserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: PairedSINData FK_PairedSINData_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PairedSINData"
    ADD CONSTRAINT "FK_PairedSINData_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: PaymentRequests FK_PaymentRequests_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentRequests"
    ADD CONSTRAINT "FK_PaymentRequests_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: Payments FK_Payments_Invoices_InvoiceDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "FK_Payments_Invoices_InvoiceDataId" FOREIGN KEY ("InvoiceDataId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: PayoutProcessors FK_PayoutProcessors_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayoutProcessors"
    ADD CONSTRAINT "FK_PayoutProcessors_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: Payouts FK_Payouts_PullPayments_PullPaymentDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payouts"
    ADD CONSTRAINT "FK_Payouts_PullPayments_PullPaymentDataId" FOREIGN KEY ("PullPaymentDataId") REFERENCES public."PullPayments"("Id") ON DELETE CASCADE;


--
-- Name: Payouts FK_Payouts_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payouts"
    ADD CONSTRAINT "FK_Payouts_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: PendingTransactions FK_PendingTransactions_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PendingTransactions"
    ADD CONSTRAINT "FK_PendingTransactions_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: PullPayments FK_PullPayments_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PullPayments"
    ADD CONSTRAINT "FK_PullPayments_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: Refunds FK_Refunds_Invoices_InvoiceDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refunds"
    ADD CONSTRAINT "FK_Refunds_Invoices_InvoiceDataId" FOREIGN KEY ("InvoiceDataId") REFERENCES public."Invoices"("Id") ON DELETE CASCADE;


--
-- Name: Refunds FK_Refunds_PullPayments_PullPaymentDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refunds"
    ADD CONSTRAINT "FK_Refunds_PullPayments_PullPaymentDataId" FOREIGN KEY ("PullPaymentDataId") REFERENCES public."PullPayments"("Id") ON DELETE CASCADE;


--
-- Name: StoreRoles FK_StoreRoles_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreRoles"
    ADD CONSTRAINT "FK_StoreRoles_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: StoreSettings FK_StoreSettings_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "FK_StoreSettings_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: StoreWebhooks FK_StoreWebhooks_Stores_StoreId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreWebhooks"
    ADD CONSTRAINT "FK_StoreWebhooks_Stores_StoreId" FOREIGN KEY ("StoreId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: StoreWebhooks FK_StoreWebhooks_Webhooks_WebhookId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreWebhooks"
    ADD CONSTRAINT "FK_StoreWebhooks_Webhooks_WebhookId" FOREIGN KEY ("WebhookId") REFERENCES public."Webhooks"("Id") ON DELETE CASCADE;


--
-- Name: U2FDevices FK_U2FDevices_AspNetUsers_ApplicationUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."U2FDevices"
    ADD CONSTRAINT "FK_U2FDevices_AspNetUsers_ApplicationUserId" FOREIGN KEY ("ApplicationUserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: UserStore FK_UserStore_AspNetUsers_ApplicationUserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStore"
    ADD CONSTRAINT "FK_UserStore_AspNetUsers_ApplicationUserId" FOREIGN KEY ("ApplicationUserId") REFERENCES public."AspNetUsers"("Id") ON DELETE CASCADE;


--
-- Name: UserStore FK_UserStore_StoreRoles_Role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStore"
    ADD CONSTRAINT "FK_UserStore_StoreRoles_Role" FOREIGN KEY ("Role") REFERENCES public."StoreRoles"("Id");


--
-- Name: UserStore FK_UserStore_Stores_StoreDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserStore"
    ADD CONSTRAINT "FK_UserStore_Stores_StoreDataId" FOREIGN KEY ("StoreDataId") REFERENCES public."Stores"("Id") ON DELETE CASCADE;


--
-- Name: WalletObjectLinks FK_WalletObjectLinks_WalletObjects_WalletId_AType_AId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletObjectLinks"
    ADD CONSTRAINT "FK_WalletObjectLinks_WalletObjects_WalletId_AType_AId" FOREIGN KEY ("WalletId", "AType", "AId") REFERENCES public."WalletObjects"("WalletId", "Type", "Id") ON DELETE CASCADE;


--
-- Name: WalletObjectLinks FK_WalletObjectLinks_WalletObjects_WalletId_BType_BId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletObjectLinks"
    ADD CONSTRAINT "FK_WalletObjectLinks_WalletObjects_WalletId_BType_BId" FOREIGN KEY ("WalletId", "BType", "BId") REFERENCES public."WalletObjects"("WalletId", "Type", "Id") ON DELETE CASCADE;


--
-- Name: WalletTransactions FK_WalletTransactions_Wallets_WalletDataId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "FK_WalletTransactions_Wallets_WalletDataId" FOREIGN KEY ("WalletDataId") REFERENCES public."Wallets"("Id") ON DELETE CASCADE;


--
-- Name: WebhookDeliveries FK_WebhookDeliveries_Webhooks_WebhookId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebhookDeliveries"
    ADD CONSTRAINT "FK_WebhookDeliveries_Webhooks_WebhookId" FOREIGN KEY ("WebhookId") REFERENCES public."Webhooks"("Id") ON DELETE CASCADE;


--
-- Name: boltcards FK_boltcards_PullPayments; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boltcards
    ADD CONSTRAINT "FK_boltcards_PullPayments" FOREIGN KEY (ppid) REFERENCES public."PullPayments"("Id") ON DELETE SET NULL;


--
-- Name: LedgerEntry LedgerEntry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lang_dictionaries lang_dictionaries_fallback_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lang_dictionaries
    ADD CONSTRAINT lang_dictionaries_fallback_fkey FOREIGN KEY (fallback) REFERENCES public.lang_dictionaries(dict_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lang_translations lang_translations_dict_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lang_translations
    ADD CONSTRAINT lang_translations_dict_id_fkey FOREIGN KEY (dict_id) REFERENCES public.lang_dictionaries(dict_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict iaIXYdTB8Da6bk3CMmFixwdkLPmO97D2jbtZUTp5vj7PVttXCWg5JIX5h16lS6v

