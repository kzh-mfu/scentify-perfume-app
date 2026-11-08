create table profiles (
  id varchar(128) primary key,
  display_name varchar(255) not null default 'Studio Member',
  shipping_address text not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp
);

create table ingredients (
  ingredient_id bigint primary key auto_increment,
  name varchar(150) not null unique,
  scent_family varchar(100) not null,
  description varchar(1000) not null,
  available boolean not null default true,
  created_at timestamp not null default current_timestamp
);

create table orders (
  order_id bigint primary key auto_increment,
  order_number varchar(100) not null unique,
  user_id varchar(128) not null,
  customer_name varchar(255) not null,
  customer_email varchar(320) not null,
  customer_phone varchar(50) not null,
  shipping_address text not null,
  total decimal(12, 2) not null,
  status varchar(30) not null default 'pending',
  payment_status varchar(30) not null default 'pending',
  payment_slip_url text,
  verified_at timestamp null,
  items text not null,
  created_at timestamp not null default current_timestamp,
  constraint fk_orders_profile foreign key (user_id) references profiles(id)
);

create table order_items (
  order_item_id bigint primary key auto_increment,
  order_id bigint not null,
  product_name varchar(255) not null,
  quantity int not null,
  unit_price decimal(12, 2) not null,
  constraint fk_order_items_order foreign key (order_id) references orders(order_id) on delete cascade
);

create table studio_chat_messages (
  id varchar(128) primary key,
  user_id varchar(128) not null,
  sender_id varchar(128) not null,
  sender_role varchar(20) not null,
  message text not null,
  created_at timestamp not null default current_timestamp,
  constraint fk_chat_user foreign key (user_id) references profiles(id),
  constraint fk_chat_sender foreign key (sender_id) references profiles(id)
);

create index orders_user_id_created_at_idx on orders (user_id, created_at);
create index studio_chat_messages_user_created_at_idx on studio_chat_messages (user_id, created_at);
