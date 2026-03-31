# FindMySpare - Product Specification
**Auto Parts Marketplace with Escrow System**

---

## 🔐 AUTH & ROLE SETUP

### User Registration & Authentication
- [ ] Buyer signup (OTP / Email verification)
- [ ] Supplier signup (OTP / Email verification)
- [ ] Role selection screen (Buyer / Supplier)
- [ ] Login flow with role persistence
- [ ] Basic verification state management
- [ ] Password reset flow
- [ ] Session management

---

## 🏠 BUYER MODULE

### Buyer Home
- [ ] Buyer dashboard with quick stats
- [ ] Active order display (if any exists)
- [ ] Vertical order status timeline widget
- [ ] "Browse Parts" CTA button
- [ ] Recent searches / viewed items
- [ ] Recommended parts section

### Browse & Purchase
- [ ] Browse parts list (grid/list view)
- [ ] Search functionality:
  - [ ] By part name
  - [ ] By vehicle make/model
  - [ ] By part number
- [ ] Filters (category, price range, supplier rating)
- [ ] Part detail page:
  - [ ] High-quality images
  - [ ] Part specifications
  - [ ] Price display
  - [ ] Stock availability
  - [ ] Supplier information card
  - [ ] Reviews/ratings
- [ ] Add to cart functionality
- [ ] Checkout page:
  - [ ] Order summary
  - [ ] Delivery address selection
  - [ ] 100% escrow hold explanation
  - [ ] Payment gateway integration
- [ ] Payment confirmation screen
- [ ] Order created notification

### Orders
- [ ] Active order detail page
- [ ] Vertical order flow display:
  1. Order Placed
  2. Order Confirmed
  3. Shipped
  4. In Transit
  5. Delivered
  6. Issue (if raised)
  7. Resolution
  8. Closure
- [ ] Track shipment button
- [ ] Raise issue button (post-delivery)
- [ ] Issue submission page:
  - [ ] Issue type selection
  - [ ] Description field
  - [ ] Photo/video upload (multiple)
  - [ ] Submit button
- [ ] Issue status tracking page
- [ ] Return instructions page (if approved)
- [ ] Buyer orders list:
  - [ ] Active orders tab
  - [ ] Past orders tab
  - [ ] Order filtering/sorting
- [ ] Order details quick view
- [ ] Reorder functionality

### Buyer Profile & Settings
- [ ] Buyer profile page:
  - [ ] Name, email, phone
  - [ ] Profile picture
  - [ ] Edit profile
- [ ] Address management:
  - [ ] Add new address
  - [ ] Edit/delete addresses
  - [ ] Set default address
- [ ] Notification settings:
  - [ ] Push notifications toggle
  - [ ] Email notifications toggle
  - [ ] SMS notifications toggle
- [ ] Help & support access
- [ ] Legal pages:
  - [ ] Terms of Service
  - [ ] Privacy Policy
  - [ ] Escrow Policy
  - [ ] Dispute Policy
- [ ] Logout functionality

---

## 🧑‍🔧 SUPPLIER MODULE

### Supplier Home
- [ ] Supplier dashboard with metrics:
  - [ ] Total sales
  - [ ] Active orders count
  - [ ] Pending actions count
  - [ ] Completed orders count
  - [ ] Average rating
- [ ] Orders requiring action (priority queue)
- [ ] Orders in progress list
- [ ] Quick action buttons (Add Product, View Orders)

### Product Management
- [ ] Product list page:
  - [ ] Grid/list view toggle
  - [ ] Search within products
  - [ ] Filter by status (active/paused/out of stock)
- [ ] Add product page:
  - [ ] Product name
  - [ ] Category selection
  - [ ] Part number
  - [ ] Compatible vehicles
  - [ ] Description (rich text)
  - [ ] Price
  - [ ] Stock quantity
  - [ ] Multiple image upload
  - [ ] Specifications (key-value pairs)
  - [ ] Warranty information
- [ ] Edit product page (same fields as add)
- [ ] Product status toggle:
  - [ ] Active
  - [ ] Paused
  - [ ] Out of stock
- [ ] Bulk actions (pause/activate multiple)
- [ ] Product analytics (views, orders)

### Order Management
- [ ] Orders grouped by status:
  - [ ] New Orders
  - [ ] Ready to Ship
  - [ ] Shipped
  - [ ] Delivered
  - [ ] Completed
  - [ ] Disputed
- [ ] Order detail page:
  - [ ] Buyer information
  - [ ] Delivery address
  - [ ] Order items
  - [ ] Order timeline
  - [ ] Escrow status (100% held)
  - [ ] Amount breakdown
- [ ] Mark as ready to ship
- [ ] Shipping confirmation page:
  - [ ] Courier service selection
  - [ ] Tracking number input
  - [ ] Estimated delivery date
  - [ ] Upload shipment proof (optional)
- [ ] Shipment updates/notifications
- [ ] Auto-notifications to buyer

### Disputes & Returns
- [ ] Issue notification center
- [ ] Issue detail page:
  - [ ] View buyer's complaint
  - [ ] View uploaded evidence (photos/videos)
  - [ ] Issue timeline
- [ ] Respond to dispute:
  - [ ] Accept return
  - [ ] Reject with reason
  - [ ] Upload counter-evidence
- [ ] Approve/reject return flow
- [ ] Return handling page:
  - [ ] Return shipping instructions to buyer
  - [ ] Expected return date
  - [ ] Return tracking
- [ ] Confirm return received:
  - [ ] Verify returned item
  - [ ] Upload proof of receipt
  - [ ] Trigger refund process
- [ ] Dispute resolution history

### Supplier Profile & Settings
- [ ] Supplier profile page:
  - [ ] Business name
  - [ ] Business logo
  - [ ] Contact details
  - [ ] Business address
  - [ ] Tax ID/registration
- [ ] Business details:
  - [ ] Business type
  - [ ] Years in business
  - [ ] Specialization
  - [ ] Operating hours
- [ ] Verification status display:
  - [ ] Verification badge
  - [ ] Documents uploaded
  - [ ] Pending verifications
- [ ] Notification settings:
  - [ ] Order notifications
  - [ ] Dispute notifications
  - [ ] Marketing emails
- [ ] Help & support access
- [ ] Legal pages access
- [ ] Logout functionality

---

## 🔄 ESCROW & SYSTEM LOGIC (PHASE 1)

### Escrow Rules
- [ ] Hold 100% payment in escrow on order placement
- [ ] Release payment on order closure (auto or manual)
- [ ] Full refund on approved buyer dispute
- [ ] No partial payouts in Phase 1
- [ ] No wallet/balance system in Phase 1
- [ ] No manual negotiation between parties

### Auto-Close Logic
- [ ] Auto-close after 7 days if buyer doesn't raise issue
- [ ] Auto-close if buyer marks "Order OK"
- [ ] Auto-close on seller inactivity (configurable timeout)
- [ ] Notification before auto-close (2 days prior)

### Payment Flow States
1. **Payment Held** - Order placed, 100% in escrow
2. **Payment Released** - Order closed successfully, payment to supplier
3. **Refund Initiated** - Dispute approved, refund processing
4. **Refund Completed** - Money returned to buyer

### Notification Triggers
- [ ] Payment held confirmation (buyer)
- [ ] New order notification (supplier)
- [ ] Shipment confirmation (buyer)
- [ ] Delivery confirmation (both)
- [ ] Issue raised (supplier)
- [ ] Issue resolved (both)
- [ ] Payment released (supplier)
- [ ] Refund processed (buyer)

---

## 📖 SYSTEM EXPLANATION & TRUST

### "How FindMySpare Works" Page
- [ ] Visual flow diagram (buyer journey)
- [ ] Visual flow diagram (supplier journey)
- [ ] Step-by-step process explanation
- [ ] Video tutorial (optional)

### Vertical Flow Explanation
- [ ] Order lifecycle infographic
- [ ] Each stage explained with icons
- [ ] Expected timelines for each stage
- [ ] What happens at each stage

### Escrow Explanation (Phase 1)
- [ ] What is escrow?
- [ ] Why we use escrow
- [ ] Money safety guarantee
- [ ] When payment is released
- [ ] When refunds happen
- [ ] Visual representation

### Scenario-Based Explanations (20 Scenarios)
Document edge cases and how system handles them:

**Happy Path**
1. [ ] Buyer orders, receives part, closes order → Supplier gets paid
2. [ ] Buyer orders, receives part, doesn't respond → Auto-close after 7 days

**Dispute Scenarios**
3. [ ] Wrong part received → Issue raised → Return approved → Refund
4. [ ] Damaged part → Issue with photos → Return approved → Refund
5. [ ] Part not as described → Evidence provided → Resolution
6. [ ] Delivery delay → Supplier notified → Extended timeline
7. [ ] Lost in transit → Proof required → Investigation → Resolution
8. [ ] Partial delivery → Partial refund request → System limitation noted

**Supplier-Side Scenarios**
9. [ ] Supplier can't fulfill → Order cancelled → Immediate refund
10. [ ] Supplier disputes buyer claim → Counter-evidence → Admin review
11. [ ] Supplier doesn't ship → Auto-cancel after X days → Refund

**Return Scenarios**
12. [ ] Return approved → Buyer ships back → Supplier confirms → Refund
13. [ ] Return approved → Buyer doesn't ship → Dispute closed (no refund)
14. [ ] Return received damaged → Supplier disputes → Admin review

**Payment Scenarios**
15. [ ] Payment processing failed → Order not created → Retry option
16. [ ] Refund processing delay → Status shown → Timeline communicated
17. [ ] Escrow hold expires (safety mechanism) → Auto-action

**Communication Scenarios**
18. [ ] Buyer-supplier direct contact → Via in-app messaging only
19. [ ] Buyer unresponsive → Escalation path defined
20. [ ] Supplier unresponsive → Auto-actions after timeout

### Legal-Safe Language
- [ ] Disclaimers on product quality (sold "as-is")
- [ ] Platform role clarification (facilitator, not seller)
- [ ] Limitation of liability statements
- [ ] Dispute resolution jurisdiction
- [ ] Force majeure clauses
- [ ] User responsibilities clearly stated

---

## 🆘 HELP & LEGAL

### Help & FAQ Page
- [ ] Category-wise FAQ:
  - [ ] Account & Login
  - [ ] Ordering & Payment
  - [ ] Escrow & Safety
  - [ ] Shipping & Delivery
  - [ ] Returns & Refunds
  - [ ] Disputes
  - [ ] For Suppliers
- [ ] Search functionality
- [ ] "Still need help?" CTA

### Contact Support
- [ ] Contact form:
  - [ ] Issue category dropdown
  - [ ] Order number (optional)
  - [ ] Description
  - [ ] File attachments
  - [ ] Email/phone for response
- [ ] Live chat (future phase)
- [ ] Email support (support@findmyspare.com)
- [ ] Phone support hours
- [ ] Expected response time

### Legal Pages

**Terms of Service**
- [ ] Platform usage terms
- [ ] User obligations
- [ ] Prohibited activities
- [ ] Account termination clause
- [ ] Intellectual property
- [ ] Dispute resolution

**Escrow Policy**
- [ ] How escrow works
- [ ] Payment hold duration
- [ ] Release conditions
- [ ] Refund conditions
- [ ] Timeframes
- [ ] Edge cases handling

**Dispute Policy**
- [ ] When disputes can be raised
- [ ] Evidence requirements
- [ ] Resolution process
- [ ] Admin review process
- [ ] Final decision authority
- [ ] Appeal process (if any)

**Privacy Policy**
- [ ] Data collection
- [ ] Data usage
- [ ] Third-party sharing
- [ ] Data security
- [ ] User rights
- [ ] Cookie policy
- [ ] GDPR compliance (if applicable)

**Refund & Return Policy**
- [ ] Return eligibility
- [ ] Return window (days)
- [ ] Condition requirements
- [ ] Return shipping responsibility
- [ ] Refund processing time
- [ ] Non-returnable items

---

## 🎯 PHASE 1 SCOPE LIMITATIONS

**Not Included in Phase 1:**
- ❌ Partial refunds
- ❌ Wallet/balance system
- ❌ Direct buyer-supplier negotiation
- ❌ Multi-vendor cart
- ❌ Advanced analytics
- ❌ Loyalty programs
- ❌ Subscription plans
- ❌ Live chat support
- ❌ AI-powered recommendations
- ❌ Social sharing features

**Included in Phase 1:**
- ✅ Basic buyer-supplier marketplace
- ✅ 100% escrow on all orders
- ✅ Simple dispute flow
- ✅ Auto-close mechanisms
- ✅ Mobile-responsive web app
- ✅ Essential notifications
- ✅ Basic product catalog
- ✅ Order tracking
- ✅ User profiles
- ✅ Legal compliance

---

## 📱 TECHNICAL NOTES

### Platform Priority
1. Mobile web (responsive)
2. Desktop web
3. Native apps (future phase)

### Key Integrations Needed
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] SMS gateway (OTP)
- [ ] Email service (transactional emails)
- [ ] Cloud storage (images/videos)
- [ ] Push notification service
- [ ] Courier API (tracking)

### Data Models (High-Level)
- Users (buyers, suppliers)
- Products
- Orders
- Issues/Disputes
- Transactions (escrow)
- Addresses
- Notifications

---

## 🚀 LAUNCH CHECKLIST

### Pre-Launch
- [ ] All user flows tested
- [ ] Payment integration tested (test mode)
- [ ] Legal pages reviewed by lawyer
- [ ] Terms of Service finalized
- [ ] Privacy policy compliant
- [ ] Escrow system tested thoroughly
- [ ] Dispute flow tested
- [ ] Email templates ready
- [ ] SMS templates ready
- [ ] Support team trained

### Launch Day
- [ ] Payment gateway live
- [ ] Monitoring dashboards active
- [ ] Support channels staffed
- [ ] Emergency rollback plan ready
- [ ] User onboarding emails scheduled
- [ ] Social media announcements ready

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track key metrics (orders, disputes, refunds)
- [ ] Quick bug fixes
- [ ] Gather supplier feedback
- [ ] Iterate on Phase 1 before Phase 2

---

**Document Version:** 1.0  
**Last Updated:** Feb 10, 2026  
**Status:** Phase 1 Specification  
**Next Review:** Post-MVP Launch