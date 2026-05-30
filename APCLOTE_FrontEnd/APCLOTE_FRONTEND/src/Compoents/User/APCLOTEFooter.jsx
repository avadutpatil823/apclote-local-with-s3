import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const APCLOTEFooter=()=> {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn("Please enter a valid email to subscribe.");
      return;
    }
    toast.success(`Thanks for subscribing, ${email}!`);
    setEmail("");
  };

  return (
    <footer className="w-full pt-10">
      <div className="w-full border-t border-white/20 bg-[linear-gradient(135deg,#4338ca,#06b6d4)] text-gray-100 shadow-[0_24px_80px_rgba(79,70,229,0.22)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand / About */}
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">APCLOTE</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              APCLOTE — premium online coaching for competitive exams, skill courses and
              career growth. Engaging video lessons, practice tests, and expert mentors.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <FaMapMarkerAlt size={18} />
              <span className="text-sm text-gray-300">Benglore, Karnataka, India</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <FaPhone size={18} />
              <a className="text-sm text-gray-300 hover:underline" href="tel:+911234567890">
                +91 84310 75750
              </a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <FaEnvelope size={18} />
              <a className="text-sm text-gray-300 hover:underline" href="mailto:support@apclote.example">
                support@apclote.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li><a href="/allBatchs" className="hover:text-white hover:underline">Courses</a></li>
              <li><a href="/about" className="hover:text-white hover:underline">About Us</a></li>
              <li><a href="/pricing" className="hover:text-white hover:underline">Pricing</a></li>
              <li><a href="/contact" className="hover:text-white hover:underline">Contact</a></li>
              <li><a href="/blog" className="hover:text-white hover:underline">Blog</a></li>
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="text-lg font-semibold">Popular Courses</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>JEE Foundation</li>
              <li>NEET Preparation</li>
              <li>Full-Stack Development</li>
              <li>Data Science & ML</li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <p className="mt-3 text-sm text-gray-300">Subscribe to get course updates, offers and useful tips.</p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-3">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full sm:w-auto flex-1 min-w-0 px-4 py-3 rounded-2xl bg-white/12 border border-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-sky-200"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-sky-50 font-bold"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <a href="https://www.facebook.com/share/1ABDRTs7mj/" aria-label="facebook" className="hover:opacity-80"><FaFacebook size={20} /></a>
              <a href="https://twitter.com" aria-label="twitter" className="hover:opacity-80"><FaTwitter size={20} /></a>
              <a href="https://youtube.com" aria-label="youtube" className="hover:opacity-80"><FaYoutube size={20} /></a>
              <a href="https://linkedin.com" aria-label="linkedin" className="hover:opacity-80"><FaLinkedin size={20} /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div>© {currentYear} APCLOTE. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="/terms" className="hover:text-white hover:underline">Terms</a>
            <a href="/privacy" className="hover:text-white hover:underline">Privacy</a>
            <a href="/founders" className="hover:text-white hover:underline">Founders</a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
export default APCLOTEFooter;
