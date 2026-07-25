-- Phase 37: closes a Tech Debt Register item. Without this, a resubmitted
-- signup (double-click, or someone filling the form out twice) silently
-- creates a duplicate row, making it harder for the founder to tell real
-- distinct interest from noise when reviewing early_access_signups.
-- Paired with an application-level change (app/actions.ts) so a resubmit
-- still shows the same success message instead of a confusing error.

alter table early_access_signups
	add constraint early_access_signups_email_key unique (email);
