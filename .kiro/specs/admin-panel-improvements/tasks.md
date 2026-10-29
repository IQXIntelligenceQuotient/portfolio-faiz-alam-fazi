# Implementation Plan: Admin Panel Improvements

## Overview

Tasks broken into small, focused units. Backend is fully complete. Remaining work is frontend-only plus a few targeted tests.

## Tasks

> Status: `[x]` Done · `[ ]` Pending · `[~]` In progress

---

### Phase 1 — Database Migrations (DONE)

- [x] 1.1 Add `approval_status`, `communication_status`, `last_message_type`, `last_message_date` to reviews table
  - _Req: 8.1_
- [x] 1.2 Add `inquiry_status`, `email_status`, `email_sent_date`, `last_error_message` to contact_inquiries table
  - _Req: 8.2_
- [x] 1.3 Add nullable `publish_date` column to posts table
  - _Req: 8.3_
- [x] 1.4 Add `category_id` foreign key to tags table
  - _Req: 8.5_
- [x] 1.5 Create `category_tag_rel` table (category_id, tag_id, priority)
  - _Req: 8.5_

---

### Phase 2 — Backend API (DONE)

- [x] 2.1 ReviewController: `sendCommunication` — sends predefined/custom email, updates `communication_status` and `last_message_type`
  - _Req: 1.1, 1.2, 1.4, 1.5, 1.6_
- [x] 2.2 ReviewController: `updateCommunicationStatus` — manual status override
  - _Req: 1.3_
- [x] 2.3 ContactController: `updateStatus` — independently updates `inquiry_status` and/or `email_status`
  - _Req: 2.1, 2.2, 2.3_
- [x] 2.4 ContactController: `sendEmail` — sends templated/custom email with 3-retry exponential backoff, updates `email_status` to sent/failed
  - _Req: 2.4, 2.5, 2.6_
- [x] 2.5 PostController: auto-assigns `author_id` from `req.user.id`, preserves `publish_date`, accepts null for drafts
  - _Req: 3.1, 3.2, 3.3, 3.4, 4.4_
- [x] 2.6 TagController: `getTagsByCategory` (merges rel-table + direct tags), `searchTags` (ILIKE filter)
  - _Req: 5.1, 6.6, 8.8_
- [x] 2.7 Routes wired: `POST /api/review/:id/communication`, `PUT /api/review/:id/communication-status`, `PUT /api/contact/:id/status`, `POST /api/contact/:id/send-email`, `GET /api/tags/search`, `GET /api/tags/by-category/:categoryId`
  - _Req: 8.6_

---

### Phase 3 — Frontend: Fix Posts.jsx

- [x] 3.1 Remove `author_id` from `editForm` initial state and from the `handleUpdatePost` FormData append
  - The backend auto-assigns it; sending it from the frontend is unnecessary
  - _Req: 4.4_
- [x] 3.2 Add a `publish_date` field to `editForm` state (separate from `published_at`)
  - Initialize it from `post.publish_date` in `openEditModal`
  - _Req: 3.1, 3.2_
- [x] 3.3 Add a `datetime-local` input for `publish_date` in the edit form
  - Use `toDateTimeLocal(editForm.publish_date)` as value; append `publish_date` (not `published_at`) to FormData on submit
  - Show the field for both draft and published posts; leave empty for drafts
  - _Req: 3.1, 3.3, 3.4_

---

### Phase 4 — Frontend: Reviews Communication Modal

- [x] 4.1 Add `communication_status` and `last_message_type` columns to the reviews table
  - Display badge for status (Email Sent / Email Pending / Email Failed) and the last message type
  - _Req: 1.3_
- [x] 4.2 Add "Send Message" button to each review row's action group
  - Only active when `is_approved === true`; opens the communication modal for that review
  - _Req: 1.1_
- [x] 4.3 Build the communication modal component
  - Four template radio options: Review Approved, Thank You, Review Published, Custom Message
  - Show a `<textarea>` for custom text only when "Custom Message" is selected
  - _Req: 1.2, 1.6_
- [x] 4.4 Wire modal submit to `POST /api/review/:id/communication`
  - Send `{ messageTemplate, customMessage }` with auth header
  - On success: close modal, refresh reviews list, show success toast/alert
  - On failure: show error message inside modal, keep modal open
  - _Req: 1.4, 1.5_

---

### Phase 5 — Frontend: Contacts Admin Page

- [x] 5.1 Create `Contacts.jsx` admin component with a table listing all inquiries
  - Columns: Name, Email, Subject, Inquiry Status, Email Status, Created At, Actions
  - Fetch from `GET /api/contacts/admin/all` with auth header
  - _Req: 2.1, 2.2, 7.1_
- [x] 5.2 Add inline inquiry status dropdown per row
  - Options: New, Read, Responded, Closed
  - On change: call `PUT /api/contact/:id/status` with `{ inquiry_status }` and update row in state
  - _Req: 2.1, 2.3_
- [x] 5.3 Add inline email status dropdown per row
  - Options: Not Sent, Drafted, Sent, Failed
  - On change: call `PUT /api/contact/:id/status` with `{ email_status }` independently (does not touch inquiry_status)
  - _Req: 2.2, 2.3_
- [x] 5.4 Add "Send Email" button per row that opens an email modal
  - Template selector: Acknowledgement, Follow Up, Closed, Custom
  - Custom option shows a textarea; submit calls `POST /api/contact/:id/send-email`
  - On success: refresh row data; on failure: show error in modal
  - _Req: 2.4, 2.5, 2.6, 2.7_
- [x] 5.5 Add Contacts link to admin navigation / Dashboard quick actions
  - _Req: 7.1_

---

### Phase 6 — Frontend: Tags UI Improvements

- [x] 6.1 Add search input above the tag list
  - On input change (debounced 300ms): call `GET /api/tags/search?q=<value>` and replace tag list
  - If input is empty: show all tags
  - _Req: 5.1_
- [x] 6.2 Convert tag list to multi-select with selected-tags preview strip
  - Clicking a tag toggles selection; selected tags appear as removable chips above the list
  - Clicking a chip removes it from selection
  - _Req: 5.2, 5.3, 5.4, 5.5_
- [x] 6.3 Group tags by category with expand/collapse toggles
  - Fetch categories, then for each category call `GET /api/tags/by-category/:id`
  - Each category heading has a chevron toggle; collapsed = tags hidden
  - When a post category is selected, expand that category's group by default
  - _Req: 6.1, 6.2, 6.3, 6.4, 6.5_
- [x] 6.4 Add "Create New Tag" inline form at the bottom of the tag panel
  - Input + submit button; calls `POST /api/tags` with auth header
  - On success: add new tag to list and auto-select it
  - _Req: 5.6, 8.7_

---

### Phase 7 — Critical Property Tests

- [x] 7.1 **Publish Date Preservation** — updating a post without changing `publish_date` keeps the original value
  - _Req: 3.4_
  - [pbt] 7.1.1 Write property test for Publish Date Preservation
- [ ] 7.2 **Author Auto-Assignment** — creating a post never requires `author_id` in the request body
  - _Req: 4.4_
- [ ] 7.3 **Email Status on Send Success** — `email_status` becomes `'sent'` only when `email_sent_date` is recorded
  - _Req: 2.5_
- [ ] 7.4 **Email Status on Send Failure** — `email_status` becomes `'failed'` when all retries are exhausted
  - _Req: 2.6_
- [ ] 7.5 **Tag Search Filtering** — search returns only tags whose name contains the query (case-insensitive)
  - _Req: 5.1_

---

### Phase 8 — Final Verification

- [ ] 8.1 Smoke-test Reviews: approve a review → send each message template → verify `communication_status` updates in the table
- [ ] 8.2 Smoke-test Contacts: change inquiry status and email status independently → send a templated email → verify statuses update correctly
- [ ] 8.3 Smoke-test Posts: create a draft with no publish_date → publish with a future date → edit without touching publish_date → verify date is preserved
- [ ] 8.4 Smoke-test Tags: search for a tag → multi-select → collapse/expand a category → create a new tag

---

## Notes

- All backend work (Phases 1–2) is complete and tested via existing routes
- Frontend phases (3–6) are independent and can be worked in any order
- Phase 3 (Posts fix) is the smallest — good starting point
- Phase 5 (Contacts) requires creating a new component and wiring it into the admin router
- Property tests in Phase 7 target the most critical correctness invariants only
- Phase 8 smoke tests are manual verification steps, not automated tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3", "8.4"] }
  ]
}
```
