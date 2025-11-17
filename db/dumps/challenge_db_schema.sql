--
-- PostgreSQL database dump
--

\restrict rmeFelu330WfwRMz25lj0E3a3c9V4Dyt2jxbUgigoaDCENZq4hBPuptna6nTc9L

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.brands OWNER TO challenge;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.brands_id_seq OWNER TO challenge;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    brand_id integer,
    sub_brand_id integer,
    name character varying(200) NOT NULL,
    type character(1) DEFAULT 'P'::bpchar,
    pos_uuid character varying(100),
    deleted_at timestamp without time zone
);


ALTER TABLE public.categories OWNER TO challenge;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO challenge;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: channels; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.channels (
    id integer NOT NULL,
    brand_id integer,
    name character varying(100) NOT NULL,
    description character varying(255),
    type character(1),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT channels_type_check CHECK ((type = ANY (ARRAY['P'::bpchar, 'D'::bpchar])))
);


ALTER TABLE public.channels OWNER TO challenge;

--
-- Name: channels_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.channels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.channels_id_seq OWNER TO challenge;

--
-- Name: channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.channels_id_seq OWNED BY public.channels.id;


--
-- Name: coupon_sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.coupon_sales (
    id integer NOT NULL,
    sale_id integer,
    coupon_id integer,
    value double precision,
    target character varying(100),
    sponsorship character varying(100)
);


ALTER TABLE public.coupon_sales OWNER TO challenge;

--
-- Name: coupon_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.coupon_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coupon_sales_id_seq OWNER TO challenge;

--
-- Name: coupon_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.coupon_sales_id_seq OWNED BY public.coupon_sales.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    brand_id integer,
    code character varying(50) NOT NULL,
    discount_type character varying(1),
    discount_value numeric(10,2),
    is_active boolean DEFAULT true,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone
);


ALTER TABLE public.coupons OWNER TO challenge;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coupons_id_seq OWNER TO challenge;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_name character varying(100),
    email character varying(100),
    phone_number character varying(50),
    cpf character varying(100),
    birth_date date,
    gender character varying(10),
    store_id integer,
    sub_brand_id integer,
    registration_origin character varying(20),
    agree_terms boolean DEFAULT false,
    receive_promotions_email boolean DEFAULT false,
    receive_promotions_sms boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO challenge;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO challenge;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: delivery_addresses; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.delivery_addresses (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    delivery_sale_id integer,
    street character varying(200),
    number character varying(20),
    complement character varying(200),
    formatted_address character varying(500),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(50),
    country character varying(100),
    postal_code character varying(20),
    reference character varying(300),
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.delivery_addresses OWNER TO challenge;

--
-- Name: delivery_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.delivery_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_addresses_id_seq OWNER TO challenge;

--
-- Name: delivery_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.delivery_addresses_id_seq OWNED BY public.delivery_addresses.id;


--
-- Name: delivery_sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.delivery_sales (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    courier_id character varying(100),
    courier_name character varying(100),
    courier_phone character varying(100),
    courier_type character varying(100),
    delivered_by character varying(100),
    delivery_type character varying(100),
    status character varying(100),
    delivery_fee double precision,
    courier_fee double precision,
    timing character varying(100),
    mode character varying(100)
);


ALTER TABLE public.delivery_sales OWNER TO challenge;

--
-- Name: delivery_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.delivery_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_sales_id_seq OWNER TO challenge;

--
-- Name: delivery_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.delivery_sales_id_seq OWNED BY public.delivery_sales.id;


--
-- Name: item_item_product_sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.item_item_product_sales (
    id integer NOT NULL,
    item_product_sale_id integer NOT NULL,
    item_id integer NOT NULL,
    option_group_id integer,
    quantity double precision NOT NULL,
    additional_price double precision NOT NULL,
    price double precision NOT NULL,
    amount double precision DEFAULT 1
);


ALTER TABLE public.item_item_product_sales OWNER TO challenge;

--
-- Name: item_item_product_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.item_item_product_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_item_product_sales_id_seq OWNER TO challenge;

--
-- Name: item_item_product_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.item_item_product_sales_id_seq OWNED BY public.item_item_product_sales.id;


--
-- Name: item_product_sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.item_product_sales (
    id integer NOT NULL,
    product_sale_id integer NOT NULL,
    item_id integer NOT NULL,
    option_group_id integer,
    quantity double precision NOT NULL,
    additional_price double precision NOT NULL,
    price double precision NOT NULL,
    amount double precision DEFAULT 1,
    observations character varying(300)
);


ALTER TABLE public.item_product_sales OWNER TO challenge;

--
-- Name: item_product_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.item_product_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_product_sales_id_seq OWNER TO challenge;

--
-- Name: item_product_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.item_product_sales_id_seq OWNED BY public.item_product_sales.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.items (
    id integer NOT NULL,
    brand_id integer,
    sub_brand_id integer,
    category_id integer,
    name character varying(500) NOT NULL,
    pos_uuid character varying(100),
    deleted_at timestamp without time zone
);


ALTER TABLE public.items OWNER TO challenge;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_id_seq OWNER TO challenge;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: option_groups; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.option_groups (
    id integer NOT NULL,
    brand_id integer,
    sub_brand_id integer,
    category_id integer,
    name character varying(500) NOT NULL,
    pos_uuid character varying(100),
    deleted_at timestamp without time zone
);


ALTER TABLE public.option_groups OWNER TO challenge;

--
-- Name: option_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.option_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.option_groups_id_seq OWNER TO challenge;

--
-- Name: option_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.option_groups_id_seq OWNED BY public.option_groups.id;


--
-- Name: payment_types; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.payment_types (
    id integer NOT NULL,
    brand_id integer,
    description character varying(100) NOT NULL
);


ALTER TABLE public.payment_types OWNER TO challenge;

--
-- Name: payment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.payment_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_types_id_seq OWNER TO challenge;

--
-- Name: payment_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.payment_types_id_seq OWNED BY public.payment_types.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    payment_type_id integer,
    value numeric(10,2) NOT NULL,
    is_online boolean DEFAULT false,
    description character varying(100),
    currency character varying(10) DEFAULT 'BRL'::character varying
);


ALTER TABLE public.payments OWNER TO challenge;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO challenge;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: product_sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.product_sales (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity double precision NOT NULL,
    base_price double precision NOT NULL,
    total_price double precision NOT NULL,
    observations character varying(300)
);


ALTER TABLE public.product_sales OWNER TO challenge;

--
-- Name: product_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.product_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_sales_id_seq OWNER TO challenge;

--
-- Name: product_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.product_sales_id_seq OWNED BY public.product_sales.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.products (
    id integer NOT NULL,
    brand_id integer,
    sub_brand_id integer,
    category_id integer,
    name character varying(500) NOT NULL,
    pos_uuid character varying(100),
    deleted_at timestamp without time zone
);


ALTER TABLE public.products OWNER TO challenge;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO challenge;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    store_id integer NOT NULL,
    sub_brand_id integer,
    customer_id integer,
    channel_id integer NOT NULL,
    cod_sale1 character varying(100),
    cod_sale2 character varying(100),
    created_at timestamp without time zone NOT NULL,
    customer_name character varying(100),
    sale_status_desc character varying(100) NOT NULL,
    total_amount_items numeric(10,2) NOT NULL,
    total_discount numeric(10,2) DEFAULT 0,
    total_increase numeric(10,2) DEFAULT 0,
    delivery_fee numeric(10,2) DEFAULT 0,
    service_tax_fee numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) NOT NULL,
    value_paid numeric(10,2) DEFAULT 0,
    production_seconds integer,
    delivery_seconds integer,
    people_quantity integer,
    discount_reason character varying(300),
    increase_reason character varying(300),
    origin character varying(100) DEFAULT 'POS'::character varying
);


ALTER TABLE public.sales OWNER TO challenge;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_id_seq OWNER TO challenge;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.stores (
    id integer NOT NULL,
    brand_id integer,
    sub_brand_id integer,
    name character varying(255) NOT NULL,
    city character varying(100),
    state character varying(2),
    district character varying(100),
    address_street character varying(200),
    address_number integer,
    zipcode character varying(10),
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_active boolean DEFAULT true,
    is_own boolean DEFAULT false,
    is_holding boolean DEFAULT false,
    creation_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stores OWNER TO challenge;

--
-- Name: stores_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.stores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stores_id_seq OWNER TO challenge;

--
-- Name: stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.stores_id_seq OWNED BY public.stores.id;


--
-- Name: sub_brands; Type: TABLE; Schema: public; Owner: challenge
--

CREATE TABLE public.sub_brands (
    id integer NOT NULL,
    brand_id integer,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sub_brands OWNER TO challenge;

--
-- Name: sub_brands_id_seq; Type: SEQUENCE; Schema: public; Owner: challenge
--

CREATE SEQUENCE public.sub_brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sub_brands_id_seq OWNER TO challenge;

--
-- Name: sub_brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: challenge
--

ALTER SEQUENCE public.sub_brands_id_seq OWNED BY public.sub_brands.id;


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: channels id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.channels ALTER COLUMN id SET DEFAULT nextval('public.channels_id_seq'::regclass);


--
-- Name: coupon_sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupon_sales ALTER COLUMN id SET DEFAULT nextval('public.coupon_sales_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: delivery_addresses id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_addresses ALTER COLUMN id SET DEFAULT nextval('public.delivery_addresses_id_seq'::regclass);


--
-- Name: delivery_sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_sales ALTER COLUMN id SET DEFAULT nextval('public.delivery_sales_id_seq'::regclass);


--
-- Name: item_item_product_sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_item_product_sales ALTER COLUMN id SET DEFAULT nextval('public.item_item_product_sales_id_seq'::regclass);


--
-- Name: item_product_sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_product_sales ALTER COLUMN id SET DEFAULT nextval('public.item_product_sales_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: option_groups id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.option_groups ALTER COLUMN id SET DEFAULT nextval('public.option_groups_id_seq'::regclass);


--
-- Name: payment_types id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payment_types ALTER COLUMN id SET DEFAULT nextval('public.payment_types_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: product_sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.product_sales ALTER COLUMN id SET DEFAULT nextval('public.product_sales_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: stores id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.stores ALTER COLUMN id SET DEFAULT nextval('public.stores_id_seq'::regclass);


--
-- Name: sub_brands id; Type: DEFAULT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sub_brands ALTER COLUMN id SET DEFAULT nextval('public.sub_brands_id_seq'::regclass);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: coupon_sales coupon_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupon_sales
    ADD CONSTRAINT coupon_sales_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_addresses delivery_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_addresses
    ADD CONSTRAINT delivery_addresses_pkey PRIMARY KEY (id);


--
-- Name: delivery_sales delivery_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_sales
    ADD CONSTRAINT delivery_sales_pkey PRIMARY KEY (id);


--
-- Name: item_item_product_sales item_item_product_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_item_product_sales
    ADD CONSTRAINT item_item_product_sales_pkey PRIMARY KEY (id);


--
-- Name: item_product_sales item_product_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_product_sales
    ADD CONSTRAINT item_product_sales_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: option_groups option_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.option_groups
    ADD CONSTRAINT option_groups_pkey PRIMARY KEY (id);


--
-- Name: payment_types payment_types_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payment_types
    ADD CONSTRAINT payment_types_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_sales product_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.product_sales
    ADD CONSTRAINT product_sales_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: sub_brands sub_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sub_brands
    ADD CONSTRAINT sub_brands_pkey PRIMARY KEY (id);


--
-- Name: idx_product_sales_product_sale; Type: INDEX; Schema: public; Owner: challenge
--

CREATE INDEX idx_product_sales_product_sale ON public.product_sales USING btree (product_id, sale_id);


--
-- Name: idx_sales_date_status; Type: INDEX; Schema: public; Owner: challenge
--

CREATE INDEX idx_sales_date_status ON public.sales USING btree (date(created_at), sale_status_desc);


--
-- Name: categories categories_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: categories categories_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: channels channels_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: coupon_sales coupon_sales_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupon_sales
    ADD CONSTRAINT coupon_sales_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_sales coupon_sales_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupon_sales
    ADD CONSTRAINT coupon_sales_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: customers customers_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: customers customers_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: delivery_addresses delivery_addresses_delivery_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_addresses
    ADD CONSTRAINT delivery_addresses_delivery_sale_id_fkey FOREIGN KEY (delivery_sale_id) REFERENCES public.delivery_sales(id) ON DELETE CASCADE;


--
-- Name: delivery_addresses delivery_addresses_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_addresses
    ADD CONSTRAINT delivery_addresses_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: delivery_sales delivery_sales_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.delivery_sales
    ADD CONSTRAINT delivery_sales_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: item_item_product_sales item_item_product_sales_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_item_product_sales
    ADD CONSTRAINT item_item_product_sales_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: item_item_product_sales item_item_product_sales_item_product_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_item_product_sales
    ADD CONSTRAINT item_item_product_sales_item_product_sale_id_fkey FOREIGN KEY (item_product_sale_id) REFERENCES public.item_product_sales(id) ON DELETE CASCADE;


--
-- Name: item_item_product_sales item_item_product_sales_option_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_item_product_sales
    ADD CONSTRAINT item_item_product_sales_option_group_id_fkey FOREIGN KEY (option_group_id) REFERENCES public.option_groups(id);


--
-- Name: item_product_sales item_product_sales_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_product_sales
    ADD CONSTRAINT item_product_sales_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: item_product_sales item_product_sales_option_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_product_sales
    ADD CONSTRAINT item_product_sales_option_group_id_fkey FOREIGN KEY (option_group_id) REFERENCES public.option_groups(id);


--
-- Name: item_product_sales item_product_sales_product_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.item_product_sales
    ADD CONSTRAINT item_product_sales_product_sale_id_fkey FOREIGN KEY (product_sale_id) REFERENCES public.product_sales(id) ON DELETE CASCADE;


--
-- Name: items items_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: items items_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: option_groups option_groups_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.option_groups
    ADD CONSTRAINT option_groups_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: option_groups option_groups_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.option_groups
    ADD CONSTRAINT option_groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: option_groups option_groups_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.option_groups
    ADD CONSTRAINT option_groups_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: payment_types payment_types_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payment_types
    ADD CONSTRAINT payment_types_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: payments payments_payment_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_type_id_fkey FOREIGN KEY (payment_type_id) REFERENCES public.payment_types(id);


--
-- Name: payments payments_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: product_sales product_sales_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.product_sales
    ADD CONSTRAINT product_sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_sales product_sales_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.product_sales
    ADD CONSTRAINT product_sales_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: sales sales_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id);


--
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: sales sales_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: stores stores_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: stores stores_sub_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_sub_brand_id_fkey FOREIGN KEY (sub_brand_id) REFERENCES public.sub_brands(id);


--
-- Name: sub_brands sub_brands_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: challenge
--

ALTER TABLE ONLY public.sub_brands
    ADD CONSTRAINT sub_brands_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- PostgreSQL database dump complete
--

\unrestrict rmeFelu330WfwRMz25lj0E3a3c9V4Dyt2jxbUgigoaDCENZq4hBPuptna6nTc9L

