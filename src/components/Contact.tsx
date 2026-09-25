import { useState } from "react";

const EMAIL = "luka.engels@outlook.de";
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Status = "idle" | "sending" | "sent" | "error";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", company: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const mailtoFallback = () => {
    const body = `From: ${form.name} <${form.email}>\n\n${form.message}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: bots fill hidden fields, people do not.
    if (form.company) return;

    if (!WEB3FORMS_KEY) {
      mailtoFallback();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          from_name: "luka-engels.de",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message ?? "Submission failed");
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "", company: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass = "w-full bg-transparent border border-black p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white";

  return <section id="contact" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Get In Touch
        </h2>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h3 className="text-2xl font-medium mb-6">What I am looking for</h3>
            <p className="text-lg font-light mb-4">
              Permanent, fully remote roles employed in Germany, at Staff, Principal, Lead or
              Head of Engineering level, where the agentic and LLM platform work is the job rather
              than a side quest.
            </p>
            <p className="text-lg font-light mb-8">
              If that is the kind of team you are building, write to me directly. Recruiters are
              welcome, provided the role is permanent and genuinely remote.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <a className="text-lg font-light hover:underline" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-lg font-light">Hamburg, Germany · fully remote</span>
              </div>
            </div>
            <div className="mt-8 flex space-x-6">
              <a href="https://www.linkedin.com/in/lukaengels/" className="hover:text-gray-600" aria-label="LinkedIn profile">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                </svg>
              </a>
              <a href="https://github.com/srnux" className="hover:text-gray-600" aria-label="GitHub profile">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-lg font-light mb-2">
                  Name
                </label>
                <input type="text" id="name" value={form.name} onChange={handleChange} required autoComplete="name" className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-light mb-2">
                  Email
                </label>
                <input type="email" id="email" value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} placeholder="Your email" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-lg font-light mb-2">
                  Subject
                </label>
                <input type="text" id="subject" value={form.subject} onChange={handleChange} required className={inputClass} placeholder="Subject" />
              </div>
              <div>
                <label htmlFor="message" className="block text-lg font-light mb-2">
                  Message
                </label>
                <textarea id="message" rows={4} value={form.message} onChange={handleChange} required className={inputClass} placeholder="Your message"></textarea>
              </div>
              <input type="text" id="company" value={form.company} onChange={handleChange} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <button type="submit" disabled={status === "sending"} className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
              <p aria-live="polite" className="text-lg font-light">
                {status === "sent" && "Thank you. Your message is on its way and I will come back to you."}
                {status === "error" && <>Something went wrong on the way. Please write to <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> instead.</>}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;
