## 2025-05-24 - N+1 Query in Post Fetching
**Learning:** The `fetchFeed` function in `src/lib/social.ts` queries posts, then fires three separate queries (likes, comments, myLikes) to fetch counts and 'liked by me' status for the entire batch. This involves extra network roundtrips and manual mapping.
**Action:** Replace the separate count queries with a single query using Supabase's associated count capabilities: `.select('..., likes(count), comments(count)')`, and possibly fetching the 'liked by me' in the same pass or just replacing the map loop.
