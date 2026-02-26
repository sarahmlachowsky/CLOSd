const SELLER_TEMPLATE = [
  { theme: "New Lead", group: 1, activities: [
    { name: "Create new contact in CRM and add all info", notes: "Collect name, phone number, email, address" },
    { name: "Update CRM to reflect correct status", notes: "Update CRM to reflect whether New Lead or Active Lead" },
    { name: "Set up on an Automated Campaign", notes: "Make sure you select the right campaign for the status (ie New Lead, Active Lead, Prospect, etc)" },
    { name: "Add all Hashtags", notes: "Make this intuitive for future use (ie VA = military, FTHB, etc - if you use a strategic outreach cycle, add that)" },
    { name: "Use SM to collect info like children's names, birthdays, activities", notes: "This will help on your outreach to know their milestones, hobbies, etc" }
  ]},
  { theme: "Lead", group: 2, activities: [
    { name: "Have seller complete a seller intake questionaire BEFORE listing appt", notes: "" },
    { name: "Prepare Seller Presentation according to layout in 'Step by Step Guides'", notes: "Template Available" },
    { name: "Send all comms BEFORE presentation according to 'Step by Step Guides'", notes: "" },
    { name: "Prepare CMA to accompany Seller Presentation", notes: "Template Available" },
    { name: "Complete Seller Net Worksheet", notes: "Seller paid fees (FL): Title fees ie closing, search (~$550), owners policy (PPx .005), HOA Estoppel (~$300), Prorated taxes (1/1-closing date), Doc stamps on deed (PPx .007)" },
    { name: "Create folders on Computer (ie OneDrive) & Email (ie Outlook, Gmail)", notes: "Add all docs from Contract/Doc Prep sections into folder once complete" },
    { name: "Create/update row in Sales spreadsheet", notes: "Template available or use your own" },
    { name: "Create transaction in CLOSd", notes: "" }
  ]},
  { theme: "Document Prep", group: 3, activities: [
    { name: "Create transaction in Document Signing System", notes: "Create in both the electronic signing system (ie Docusign, Form Simplicity) and document management system (ie Dot Loop, broker specific)" },
    { name: "Listing Agreement - Page 1 - Seller Names", notes: "1. Pull legal names from property records (COJ.net)" },
    { name: "Listing Agreement - Page 1 - Enter listing agreement dates", notes: "Can put any date range depending on your market (I use 6mo)" },
    { name: "Listing Agreement - Page 1 - Address and Property Tax ID", notes: "Pull from county records and/or old MLS listing" },
    { name: "Listing Agreement - Page 1 - Section 2, Occupancy", notes: "Select appropriate radio button" },
    { name: "Listing Agreement - Page 1 - Section 3, Price/Financing Terms", notes: "Set agreed price and which financing types the seller will accept" },
    { name: "Listing Agreement - Page 2 - Section 6, Broker Authority", notes: "Make sure if the seller has restrictions on where it can be advertised, this section is completed" },
    { name: "Listing Agreement - Page 2 - Section 6e, Broker Authority (Lockbox)", notes: "" },
    { name: "Listing Agreement - Page 3 - Section 8, Compensation", notes: "Fill in applicable fee (Option A most likely) & include broker transaction fee" },
    { name: "Listing Agreement - Page 3 - Section 10, Compensation", notes: "Fill in applicable fee (Option B most likely), but can be A or C (depends on what you negotiate)" },
    { name: "Listing Agreement - Page 3 - Section 12, Conditional Termination", notes: "Put in a damage fee of $1,000 unless a different amt agreed at presentation" },
    { name: "Listing Agreement - Page 4 - Section 15, Add'l Terms", notes: "Enter any additional terms of the agreement that aren't addressed by other sections (ie if sellers want to take personal fixture items)" },
    { name: "Supra Lockbox Form", notes: "" },
    { name: "Seller Controlled Marketing Disclosure", notes: "" },
    { name: "Prepare Flood Disclosure", notes: "" },
    { name: "Prepare Affiliated Business Arrangement", notes: "Specific to your brokerage" },
    { name: "Verify Tax info via County Property appraiser", notes: "Save a copy for your records" },
    { name: "Check coastal construction line for Flood Zone", notes: "Save a copy for your records" },
    { name: "Seller Property Disclosure", notes: "Send digitally and allow sellers to complete using radio buttons or print a copy and have them sign at the listing presentation" },
    { name: "HOA Disclosure", notes: "Complete if property has an HOA" },
    { name: "CDD Disclosure", notes: "Complete if property is in a CDD" },
    { name: "Comp Agreement", notes: "Discuss with the seller what terms they are offering for buyer agent compensation and complete in advance" },
    { name: "Offer Instructions", notes: "Create/modify using my template or use your own" },
    { name: "Create listing agreement package with all docs & send for signatures", notes: "" }
  ]},
  { theme: "Listing Prep", group: 4, activities: [
    { name: "Ask seller for spare house keys, amenities center (photographer will need)", notes: "" },
    { name: "Schedule photography", notes: "Send the sellers a 1-pager for photography prep several days in advance of the appt" },
    { name: "Bring marketing materials to property (can coincide with photography visit)", notes: "Include listing info sheets, business cards, MLS printout, acrylic placard to put MLS inside, any treats/water for potential buyers" },
    { name: "Lockbox placement", notes: "Make sure to record the code to add to Showing Time" },
    { name: "Contact HOA mgmt company (or Seller) and obtain Decs & Covenants", notes: "Template Available - Ask for Bylaws, Rules & Regs, Decs and Covenants, Articles of Incorporation, YE Financial stmts" },
    { name: "Request copy of Survey from Seller", notes: "Add to MLS, CRM and Cloud Storage folder - if they don't have, advise Title one will need to be ordered" }
  ]},
  { theme: "MLS", group: 5, activities: [
    { name: "Enter property into MLS", notes: "Coming soon only goes to realtors, cannot be shown until 'Active'" },
    { name: "Showing Time setup", notes: "Setup Lockbox # and add instructions for Realtors" },
    { name: "Send 'Seller Controlled Marketing Disclosure' to MLS", notes: "Email form with listing to MLS if not putting on MLS within 3 days of date" },
    { name: "Upload HOA Docs to Document section of MLS, Client File, & Transaction Mgmt System", notes: "" },
    { name: "Upload Offer Instructions to Document section", notes: "" },
    { name: "Upload HOA (if applicable), CDD (if applicable), Flood Disclosure", notes: "" },
    { name: "Upload survey to document section", notes: "" },
    { name: "Upload floor plan (if available) to floor plan section", notes: "" },
    { name: "Upload and order all photos into photos section", notes: "" }
  ]},
  { theme: "Active", group: 6, activities: [
    { name: "Download new active listing from MLS", notes: "Add to cloud based storage (and brokerage if req'd) for your records - this is a snapshot of the original entry/terms of the listing" },
    { name: "Send info to Title Company", notes: "Boilerplate Template Available; can wait until contract received but I like to give the title company advance notice" },
    { name: "Sign placement", notes: "Out front, in between walkway or within 5 ft of the road, facing vertically - cannot place until listing is Active" },
    { name: "Complete Change Authorization Form & have Sellers execute", notes: "Must complete EVERY time the terms of a listing change (ie end date, price, etc)" },
    { name: "Update new price/terms on MLS", notes: "Must be done same day of signing" },
    { name: "Request feedback for each Showing / publish to Seller", notes: "Requests via automation -> text -> call - once received publish or relay to Seller" },
    { name: "Publish price change to all agents via ShowingTime", notes: "Must do on every price change" },
    { name: "Run SM posts each day for 3 days in advance of any OH", notes: "" },
    { name: "Create Open House in MLS EACH TIME you hold one", notes: "" },
    { name: "Add showing agent info to phone and CRM for every showing request", notes: "This helps you build your realtor database and allows for outreach after showings" },
    { name: "Send offers and updated Seller Net Sheet", notes: "Once offer(s) are received, send an email outlining terms to seller along with an updated seller net sheet with correct figs" }
  ]},
  { theme: "Under Contract", group: 7, activities: [
    { name: "Change Listing to 'Pending' or 'Active Under Contract' in MLS", notes: "Do it immediately once contract has been accepted and if there are contingencies, needs to be 'Active under Contract'" },
    { name: "Submit any necessary items to Compliance portal", notes: "Upload required items to applicable TM system and submit for approval" },
    { name: "Submit executed docs to buyer agent", notes: "Template Available - Include instructions on deposit of EMD", daysOffset: 1 },
    { name: "Submit contract and Survey to Title Company", notes: "Template Available", daysOffset: 1 },
    { name: "Confirm Inspection date / repair request", notes: "Ensure repair request received by contract expiration date", daysOffset: 5 },
    { name: "Confirm Buyer Appraisal ordered", notes: "Update spreadsheet with date ordered & again when complete", daysOffset: 15 },
    { name: "Request Prelim ALTA from Title Company", notes: "Generally needed by brokerage in order to issue the DA (way you get paid as an agent)" }
  ]},
  { theme: "Pre-close", group: 8, activities: [
    { name: "Confirm Title company is C2C", notes: "Template Available - Once appraisal and conditions are in, email title to confirm nothing outstanding", daysOffset: 20 },
    { name: "Confirm all docs submitted for compliance and request DA from broker", notes: "Ensure DA request matches compensation agreement" },
    { name: "Submit DA to Title", notes: "Indicate who's paying Broker Fee & Transaction Fee ($250) and any other splits (co-agent) - Can combine this task when confirming Title is clear to close" },
    { name: "Confirm with Sellers that all repairs have been completed", notes: "Notify buyers agent once complete and ask if they want a formal reinspection or will verify on final walkthrough", daysOffset: 15 },
    { name: "Purchase Closing Gift", notes: "" },
    { name: "Collect keys/garage door openers/alarm codes", notes: "Remind sellers to bring all items to closing so they can be delivered to buyers" },
    { name: "Receive CD from Lender/Buyer Agent and Review with Client", notes: "It is good practice for the seller to understand what they're getting at closing to avoid any hiccups on closing day" },
    { name: "Confirm with Seller that they've provided title with account info", notes: "Title company and/or client should confirm they have correct account information for them to wire funds" }
  ]},
  { theme: "Closed", group: 9, activities: [
    { name: "Change status in MLS to closed", notes: "Must be done day of closing" },
    { name: "Submit Closure items to Transaction Mgmt system", notes: "Survey, DA, Final Executed Alta" },
    { name: "Send Closure Email & all docs to Client", notes: "Template Available - Include contract, appraisal, title (if avail), survey, HOA (if appl)" },
    { name: "Ask for a Google Review", notes: "Template Available - Provide personal link and ask them to pls provide a review" },
    { name: "Update contact info / create new Automated Campaign", notes: "Include new address, sale date, add to Homestead Campaign, proactive outreach, change status to 'Sphere' or 'Closed'" },
    { name: "Update sales board & spreadsheet with all info", notes: "Include other agent & TC (if appl), title co, and all known fields/deadlines" }
  ]}
];

export default SELLER_TEMPLATE;
