-- Drop table

-- DROP TABLE public.que1;

CREATE TABLE public.que1 (
	id bigserial NOT NULL,
	batch int8 NOT NULL,
	portion int4 NOT NULL,
	portion_data text NULL,
	CONSTRAINT que1_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.send_log;

CREATE TABLE public.send_log (
	id bigserial NOT NULL,
	batch int8 NOT NULL,
	portions int4 NOT NULL,
	sender_id int4 NULL,
--	data_struct text NULL,
--	send_time int8 NULL,
	sended bool NULL,
	received bool NULL,
	CONSTRAINT send_log_pkey PRIMARY KEY (id)
);
