-- Allow authenticated users to insert conversations

create policy "Allow conversation inserts"
on conversations
for insert
to authenticated
with check (true);



-- Allow authenticated users to read conversations

create policy "Allow conversation reads"
on conversations
for select
to authenticated
using (true);