# Privacy Policy

**Unit Price Sort for Amazon Search** (the “Extension”)

**Effective date:** August 4, 2026  
**Last updated:** August 7, 2026  
**Developer / Data controller:** Martial Systems LLC  
**Contact:** martialsys@gmail.com  
**Website:** https://martialsys.net/

---

### 1. Summary (plain language)

| Question | Answer |
|----------|--------|
| Do we collect your shopping history? | **No.** |
| Do we collect account passwords or payment data? | **No.** |
| Do we sell or share personal data with advertisers? | **No.** |
| Do we run analytics or tracking pixels? | **No.** |
| Does the Extension send data to our servers? | **No.** We do not operate a backend that receives your shopping data. |
| What does the Extension access? | Product listing information **already displayed** on Amazon pages in your browser, to compute unit prices and rank or label results **on that page**. |
| What is saved on your device? | Optional **Keep Alexa off** preference (a single on/off boolean). Not product or search history. |

---

### 2. Who we are

The Extension is developed and offered by **Martial Systems LLC**, an Indiana limited liability company (“we,” “us,” or “our”).

Privacy inquiries: **martialsys@gmail.com**  
Company site: **https://martialsys.net/**

---

### 3. Scope

This Policy applies only to the Extension as distributed through the Chrome Web Store (or as an unpacked build you install yourself). It does not apply to:

- Amazon.com, Inc. or its affiliates, or any Amazon website, app, or service;
- Google LLC, the Chrome browser, or the Chrome Web Store platform;
- Any third-party website or extension.

Your use of Amazon and Google services is governed by their respective terms and privacy policies.

---

### 4. Information the Extension processes

#### 4.1 Information processed locally in your browser

When you use the Extension on a supported Amazon domain, the Extension’s content script may **read information already present in the page** for the sole purpose of providing unit-price ranking, including without limitation:

- Product titles and visible listing text;
- Displayed prices and Amazon-shown unit prices (e.g., “$0.12/oz”);
- Structural page elements needed to identify search-result cards (e.g., product identifiers exposed in the page markup).

If you enable **Keep Alexa off**, the Extension may also identify and hide on-page Amazon “Alexa for Shopping” / assistant UI shells in your browser view. That also happens **locally**; no shopping content is uploaded to us.

This processing occurs **on your device**, within the browser process. We do **not** transmit this information to Martial Systems LLC servers for analytics, advertising, or resale. The Extension is designed so that it **does not initiate network requests** to collect shopping data.

#### 4.2 Preferences and interface state

| State | Storage | What it is |
|-------|---------|------------|
| Unit-sort overlay ON/OFF | In-memory for the browser session | Toolbar / overlay toggle; not shopping history |
| Overlay drag position | In-memory for the tab session | UI placement only |
| **Keep Alexa off** | `chrome.storage.local` (one boolean) | Preference so the assistant stays hidden across restarts |

We do **not** use storage for product lists, search queries, prices, ASINs, or account data.

Your browser or operating system may maintain its own caches, history, or crash logs outside our control.

#### 4.3 Information we do not collect

We do not intentionally collect, upload, or maintain:

- Names, email addresses, or contact details (except if you email us for support);
- Precise geolocation;
- Authentication credentials or payment card data;
- A persistent log of products you viewed or prices you compared;
- Advertising identifiers for cross-site tracking;
- Data from websites other than the Amazon host permissions declared in the Extension manifest.

#### 4.4 Information you provide voluntarily

If you contact us at **martialsys@gmail.com**, we will process the content of your message and your email address to respond. We retain such correspondence only as long as reasonably necessary for support, legal compliance, or dispute resolution.

If you open our optional **Donate** link, that takes you to a third-party site (e.g. Ko-fi) governed by that provider’s policies. We do not process payment card data through the Extension.

---

### 5. Permissions and host access

| Permission | Why |
|------------|-----|
| Host access to listed Amazon domains | Run on Amazon pages to read visible listing data, show ranking UI, and optionally hide the on-page shopping assistant |
| `contextMenus` | Right-click menu on the extension icon (**Keep Alexa off**, **Donate**) |
| `storage` | Save only the **Keep Alexa off** boolean preference |

The Extension does **not** request identity, geolocation, “read all website data,” or downloads.

Chrome may display permission warnings based on the manifest. Those warnings describe technical capability, not an intent to exfiltrate data.

---

### 6. How we use information

Locally processed page content is used solely to:

1. Estimate or read price-per-unit values;
2. Rank, label, or reorder search results on the page at your request (e.g., “Sort Now”);
3. Display the Extension’s user interface (overlay, badges, toolbar badge);
4. Optionally hide Amazon’s on-page shopping assistant UI when you enable **Keep Alexa off**.

We do not use Extension-processed data for advertising, profiling, resale, or training of machine-learning models.

---

### 7. Legal bases (EEA/UK users)

If the GDPR or UK GDPR applies, processing of information on your device is based on:

- **Performance of a contract / requested service** — providing the features you installed and invoke; and/or
- **Legitimate interests** — operating a functional browser extension with minimal data practices; and/or
- **Consent**, where required by law for non-essential technologies (the Extension is designed not to rely on non-essential tracking).

You may stop all Extension processing by uninstalling the Extension or disabling it in your browser.

---

### 8. Sharing of information

We do **not** sell personal information. We do **not** share Extension-processed shopping data with third parties for cross-context behavioral advertising.

We may disclose information if required by law, legal process, or to protect rights, safety, and security, to the limited extent such information is in our possession (e.g., support emails).

Amazon and Google independently process data under their own policies when you use their services.

---

### 9. International transfers

Because the Extension processes listing data **locally**, we do not operate a transfer of that listing data to our systems. If you email us, your message may be processed on email infrastructure that stores data in the United States or other countries.

---

### 10. Retention

- **On-device unit-sort session state:** while the browser session lasts or until you clear it / uninstall.  
- **Keep Alexa off preference:** until you change it or uninstall the Extension (or clear extension storage).  
- **Support emails:** retained as reasonably necessary, then deleted or archived per ordinary business practice.

---

### 11. Security

We design the Extension to minimize data collection. No method of electronic transmission or storage is fully secure. You are responsible for keeping your browser and operating system updated.

---

### 12. Children’s privacy

The Extension is not directed to children under 13 (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us information via support email, contact **martialsys@gmail.com** and we will delete it where required.

---

### 13. Your rights

Depending on your location, you may have rights to access, correct, delete, or restrict certain personal data, or to object to processing, and to lodge a complaint with a supervisory authority.

Because we do not collect shopping profiles, many access/deletion requests will not correspond to Extension shopping datasets. For support-email data, contact **martialsys@gmail.com**. Uninstalling the Extension removes local Extension state from your browser (subject to browser behavior).

**California residents:** We do not “sell” or “share” personal information as those terms are commonly defined under the CCPA/CPRA for the Extension’s operation as described herein. We do not use sensitive personal information for the purpose of inferring characteristics about you via this Extension.

---

### 14. Third-party services

The Extension interacts with Amazon web pages that you choose to visit. Amazon’s collection and use of data is governed by Amazon’s privacy policy and terms. We are not responsible for Amazon’s practices.

Optional donate links open third-party payment platforms under their own policies.

---

### 15. Changes to this Policy

We may update this Policy from time to time. The “Last updated” date will change when we do. Material changes will be reflected by updating the policy URL linked from the Chrome Web Store listing. Continued use after an update constitutes acceptance where permitted by law.

---

### 16. Contact

**Martial Systems LLC**  
Email: **martialsys@gmail.com**  
Web: **https://martialsys.net/**  
Governing jurisdiction: **Indiana, United States**
