# Employee Data Verification Portal — Cluster Hub GBHS Qamar Din Chandio

Single-page portal (one `index.html`) for Cluster Hub School GBHS Qamar Din Chandio,
UC Khairwah, Taluka Moro, District Naushahro Feroze. Employees sign in to review and update
their service record; the HM Dashboard collects school enrollment and forms; officers
(Master Admin, HUB HM, Cell Heads) review and approve from the Admin Dashboard.

The data lives in Supabase (project `qdc-cluster-portal`). This file only contains the
public "anon" key, which is safe to publish — all access rules are enforced in the database.

## Publish with GitHub Pages

1. Create a new repository on github.com (for example `qdc-cluster-portal`).
2. **Add file → Upload files**, drop in `index.html`, `README.md` and `.nojekyll`, then **Commit changes**.
3. Open **Settings → Pages**. Under *Build and deployment* pick **Deploy from a branch**,
   branch **main**, folder **/ (root)**, and **Save**.
4. After a minute the portal is live at `https://<your-username>.github.io/qdc-cluster-portal/`.

To update the site later, upload the new `index.html` over the old one and commit.

## Keep the database awake

Supabase's free plan pauses a project after about a week with no activity. If the portal
stops loading data, open the Supabase dashboard and press **Restore project**.

Developed by Muzafar Ali Solangi · IT Focal Person
