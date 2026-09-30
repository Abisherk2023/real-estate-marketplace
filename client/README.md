## 🏡 Real Estate Marketplace

A full-stack web application designed for property buyers, renters, sellers, and real estate agents. The platform facilitates seamless property discovery, direct real-time agent communication, interactive tools, and agent verification.

---

### ✨ Key Features

#### 🔍 Property Discovery & Filtering
* **Advanced Search & Filter:** Filter properties by listing type (sale/rent), property type, city, price range, bedrooms, and bathrooms.
* **Interactive Map Integration:** View property locations with precise coordinates using Leaflet map view (`PropertyMap`).
* **Similar Properties:** Smart recommendations at the bottom of property listings based on location and price.
* **Recently Viewed:** Automatically stores and displays recently browsed properties using local storage.

#### 📊 Tools & Utilities
* **Property Comparison (`CompareBar`):** Compare multiple properties side-by-side on price, area, room count, and amenities.
* **EMI Calculator:** Built-in loan installment estimator on property detail pages for prospective buyers.
* **Property Reporting:** Flag suspicious or fraudulent listings directly to administrators (`ReportButton`).

#### 💬 Communication & Interaction
* **Real-time Chat:** Direct agent-to-buyer messaging powered by **Socket.io** for live instant communication.
* **Inquiry System:** Submit inquiries directly to property owners with tracking inside the agent dashboard.

#### 🛡️ Agent Verification & Dashboard
* **Verified Agent Badge (`VerifiedBadge`):** Identity verification workflow allowing legitimate agents to get verified by admins.
* **Agent Dashboard:** Manage property listings, track unread inquiries, and monitor listing analytics.
* **Admin Control Panel:** Admin panel for property approvals, user management, handling verification requests, and reviewing flagged content.

---

### 🛠️ Tech Stack

* **Frontend:** React, React Router DOM, Tailwind CSS, Axios, Socket.io-client
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** MongoDB & Mongoose
* **Authentication:** JWT (JSON Web Tokens)
