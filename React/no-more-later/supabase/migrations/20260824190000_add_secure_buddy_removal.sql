-- Allow either participant to remove a buddy relationship safely.

create or replace function public.remove_buddy(p_buddy_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_removed boolean := false;
begin
    if auth.uid() is null then
        raise exception 'You must be signed in to remove a buddy.';
    end if;

    if p_buddy_id is null or p_buddy_id = auth.uid() then
        raise exception 'Invalid buddy.';
    end if;

    delete from public.buddy_connections connections
    where connections.status = 'accepted'
      and (
          (connections.requester_id = auth.uid() and connections.addressee_id = p_buddy_id)
          or (connections.addressee_id = auth.uid() and connections.requester_id = p_buddy_id)
      );

    v_removed := found;

    if v_removed then
        -- A removed person may still have the current user's shared code.
        -- Retire it so reconnecting requires a newly generated invitation.
        update public.buddy_invites invites
        set expires_at = now()
        where invites.inviter_id = auth.uid()
          and invites.expires_at > now();
    end if;

    return v_removed;
end;
$function$;

revoke execute on function public.remove_buddy(uuid) from public, anon;
grant execute on function public.remove_buddy(uuid) to authenticated;
