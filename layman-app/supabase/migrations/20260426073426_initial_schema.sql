-- Create saved_articles table
create table if not exists public.saved_articles (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  article_id text not null,
  title text not null,
  source text,
  image_url text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.saved_articles enable row level security;

-- Create policies
create policy "Users can view their own saved articles"
  on public.saved_articles for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own saved articles"
  on public.saved_articles for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own saved articles"
  on public.saved_articles for delete
  using ( auth.uid() = user_id );

-- Enable Realtime for this table
alter publication supabase_realtime add table saved_articles;
