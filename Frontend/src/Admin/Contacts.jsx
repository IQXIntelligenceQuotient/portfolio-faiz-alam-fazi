import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");

// GET all contacts
const CONTACTS_ADMIN_API =
  import.meta.env.VITE_CONTACTS_ADMIN_API ||
  `${API_BASE_URL}/api/contact/admin/all`;

// Base for status updates and send-email
const CONTACTS_BASE_API = `${API_BASE_URL}/api/contact`;

// Delete endpoint
const CONTACTS_DELETE_API = `${API_BASE_URL}/api/contact/admin`;

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [_updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailStatusFilter, setEmailStatusFilter] = useState("all");

  const [viewContact, setViewContact] = useState(null);

  // Send Email modal state
  const [emailContact, setEmailContact] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState("acknowledgement");
  const [emailCustomMessage, setEmailCustomMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(CONTACTS_ADMIN_API, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch contact inquiries.");
      const contactsData = data.data || data.contacts || data.inquiries || data || [];
      setContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (error) {
      alert(error.message || "Unable to load contact inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const value = search.toLowerCase();
      const matchesSearch =
        contact.name?.toLowerCase().includes(value) ||
        contact.email?.toLowerCase().includes(value) ||
        contact.subject?.toLowerCase().includes(value) ||
        contact.message?.toLowerCase().includes(value);
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      const matchesEmailStatus = emailStatusFilter === "all" || contact.email_status === emailStatusFilter;
      return matchesSearch && matchesStatus && matchesEmailStatus;
    });
  }, [contacts, search, statusFilter, emailStatusFilter]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString();
  };

  // Inquiry status — admin manual control only
  const _handleInquiryStatusChange = async (contact, newInquiryStatus) => {
    try {
      setUpdatingId(contact.id);
      const response = await fetch(`${CONTACTS_BASE_API}/${contact.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ inquiry_status: newInquiryStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Status update failed.");
      setContacts((prev) =>
        prev.map((item) =>
          item.id === contact.id ? { ...item, status: newInquiryStatus } : item
        )
      );
    } catch (error) {
      alert(error.message || "Something went wrong while updating inquiry status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewContact = async (contact) => {
    setViewContact(contact);
    if (contact.status === "new") {
      try {
        const response = await fetch(`${CONTACTS_BASE_API}/${contact.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ inquiry_status: "read" }),
        });
        if (response.ok) {
          setContacts((prev) =>
            prev.map((item) =>
              item.id === contact.id ? { ...item, status: "read" } : item
            )
          );
          setViewContact((prev) => prev ? { ...prev, status: "read" } : null);
        }
      } catch (error) {
        console.error("Failed to automatically mark inquiry as read:", error);
      }
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact inquiry? This action cannot be undone.")) return;
    try {
      setDeletingId(contactId);
      const response = await fetch(`${CONTACTS_DELETE_API}/${contactId}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Contact inquiry delete failed.");
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      alert("Contact inquiry deleted successfully.");
    } catch (error) {
      alert(error.message || "Something went wrong while deleting inquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  // Task 5.4: Send Email modal handlers
  const closeEmailModal = () => {
    setEmailContact(null);
    setEmailTemplate("acknowledgement");
    setEmailCustomMessage("");
    setEmailSending(false);
    setEmailError("");
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailContact?.id) return;
    try {
      setEmailSending(true);
      setEmailError("");
      const response = await fetch(`${CONTACTS_BASE_API}/${emailContact.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messageTemplate: emailTemplate,
          customMessage: emailCustomMessage,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Even on failure the backend updates email_status to 'failed' — reflect that
        if (data?.data) {
          setContacts((prev) =>
            prev.map((item) =>
              item.id === emailContact.id
                ? { ...item, email_status: data.data.email_status, status: data.data.status || item.status }
                : item
            )
          );
        }
        throw new Error(data.message || "Failed to send email.");
      }
      // Update email_status & status in state from the response (auto: 'sent' & 'responded'/'closed')
      if (data?.data) {
        setContacts((prev) =>
          prev.map((item) =>
            item.id === emailContact.id
              ? { 
                  ...item, 
                  email_status: data.data.email_status, 
                  email_sent_date: data.data.email_sent_date,
                  status: data.data.status || (emailTemplate === 'closed' ? 'closed' : 'responded')
                }
              : item
          )
        );
      }
      closeEmailModal();
      alert("Email sent successfully.");
    } catch (error) {
      setEmailError(error.message || "Something went wrong while sending email.");
    } finally {
      setEmailSending(false);
    }
  };

  const totalInquiries = contacts.length;
  const newInquiries = contacts.filter((item) => item.status === "new").length;
  const respondedInquiries = contacts.filter((item) => item.status === "responded").length;
  const pendingEmails = contacts.filter((item) => !item.email_status || item.email_status === "not_sent" || item.email_status === "pending").length;

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Admin Panel</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">Contact Inquiries</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage contact inquiries. Set inquiry status manually after review. Email status updates automatically when emails are sent.
              </p>
            </div>
            <button type="button" onClick={fetchContacts}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={totalInquiries} />
          <StatCard label="New" value={newInquiries} />
          <StatCard label="Responded" value={respondedInquiries} />
          <StatCard label="Pending Emails" value={pendingEmails} />
        </section>

        {/* Filters */}
        <div className="mb-6 grid gap-4 rounded-[24px] border border-white/10 bg-[#080b13]/95 p-5 shadow-2xl md:grid-cols-[1fr_auto_auto]">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject, or message..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full min-w-[180px] rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20">
            <option value="all">All Inquiry Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
          <select value={emailStatusFilter} onChange={(e) => setEmailStatusFilter(e.target.value)}
            className="w-full min-w-[160px] rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20">
            <option value="all">All Email Status</option>
            <option value="not_sent">Not Sent</option>
            <option value="drafted">Drafted</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 shadow-2xl">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">#</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Sender</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Subject</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Message</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Inquiry Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Email Status
                    <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 normal-case tracking-normal">auto</span>
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Created</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">Loading contact inquiries...</td></tr>
                ) : filteredContacts.length === 0 ? (
                  <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">No contact inquiries found.</td></tr>
                ) : (
                  filteredContacts.map((contact, idx) => (
                    <tr key={contact.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{contact.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-1 max-w-[200px] text-sm text-slate-300">{contact.subject || "No subject"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 max-w-[280px] text-sm leading-6 text-slate-300">{contact.message}</p>
                      </td>

                      {/* Inquiry Status — auto status badge */}
                      <td className="px-5 py-4">
                        <InquiryStatusBadge status={contact.status} />
                      </td>

                      {/* Email Status — read-only badge, auto-updated by system */}
                      <td className="px-5 py-4">
                        <EmailStatusBadge status={contact.email_status} />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">{formatDate(contact.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button type="button" onClick={() => handleViewContact(contact)}
                            title="View inquiry"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">View</span>
                          </button>
                          {/* Send Email */}
                          <button type="button"
                            onClick={() => { setEmailContact(contact); setEmailTemplate("acknowledgement"); setEmailCustomMessage(""); setEmailError(""); }}
                            title="Send email"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Send Email</span>
                          </button>
                          {/* Delete */}
                          <button type="button" onClick={() => handleDeleteContact(contact.id)} disabled={deletingId === contact.id}
                            title="Delete inquiry"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      </div>

      {/* View Modal */}
      {viewContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Inquiry Details</p>
                <h2 className="mt-2 text-2xl font-black text-white">{viewContact.subject || "Contact Message"}</h2>
              </div>
              <button type="button" onClick={() => setViewContact(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBox label="Name" value={viewContact.name} />
              <InfoBox label="Email" value={viewContact.email} />
              <InfoBox label="Inquiry Status" value={viewContact.status} />
              <InfoBox label="Email Status" value={viewContact.email_status} />
              <InfoBox label="Created At" value={formatDate(viewContact.created_at)} />
              <InfoBox label="Updated At" value={formatDate(viewContact.updated_at)} />
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-2 text-sm font-bold text-[#d4af37]">Message</h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{viewContact.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal — Task 5.4 */}
      {emailContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Send Email</p>
                <h2 className="mt-2 text-2xl font-black text-white">Email {emailContact.name}</h2>
              </div>
              <button type="button" onClick={closeEmailModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Message Template</p>
                {[
                  { value: "acknowledgement", label: "Acknowledgement" },
                  { value: "follow_up", label: "Follow Up" },
                  { value: "closed", label: "Closed" },
                  { value: "custom", label: "Custom Message" },
                ].map((option) => (
                  <label key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-[#d4af37]/30">
                    <input type="radio" name="emailTemplate" value={option.value}
                      checked={emailTemplate === option.value}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="accent-[#d4af37]" />
                    {option.label}
                  </label>
                ))}
              </div>
              {emailTemplate === "custom" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Custom Message</label>
                  <textarea value={emailCustomMessage} onChange={(e) => setEmailCustomMessage(e.target.value)}
                    rows="4" placeholder="Enter your custom message..."
                    className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
                </div>
              )}
              {emailError && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{emailError}</p>
              )}
              <button type="submit" disabled={emailSending}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {emailSending ? "Sending..." : "Send Email"}
              </button>
              <button type="button" onClick={closeEmailModal}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function EmailStatusBadge({ status }) {
  const map = {
    sent:     { label: "Sent",     cls: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20" },
    failed:   { label: "Failed",   cls: "bg-red-500/10 text-red-300 border-red-400/20" },
    drafted:  { label: "Drafted",  cls: "bg-blue-500/10 text-blue-300 border-blue-400/20" },
    not_sent: { label: "Not Sent", cls: "bg-slate-500/10 text-slate-400 border-slate-400/20" },
    pending:  { label: "Pending",  cls: "bg-yellow-500/10 text-yellow-300 border-yellow-400/20" },
  };
  const s = map[status] || map["not_sent"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

function InquiryStatusBadge({ status }) {
  const map = {
    new:       { label: "New",       cls: "bg-blue-500/10 text-blue-300 border-blue-400/20" },
    read:      { label: "Read",      cls: "bg-slate-500/10 text-slate-300 border-slate-400/20" },
    responded: { label: "Responded", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20" },
    closed:    { label: "Closed",    cls: "bg-red-500/10 text-red-300 border-red-400/20" },
  };
  const s = map[status] || map["new"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[#d4af37]/20 bg-[#080b13]/95 p-5 shadow-2xl">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <h2 className="mt-2 text-3xl font-black text-[#d4af37]">{value}</h2>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">{label}</h3>
      <p className="break-words text-sm text-slate-300">{value || "Not available"}</p>
    </div>
  );
}

export default Contacts;
