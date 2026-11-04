const fs = require("node:fs");
const filename = "client/src/content/site.json";
const c = JSON.parse(fs.readFileSync(filename, "utf8"));
c.demo.enrollmentFields = [
  {
    name: "fullName",
    label: "Full name (demo)",
    placeholder: "Demo Cadet",
    required: true,
  },
  {
    name: "guardian",
    label: "Guardian name (demo)",
    placeholder: "Demo Guardian",
    required: true,
  },
  { name: "dob", label: "Date of birth (demo)", type: "date", required: true },
  {
    name: "phone",
    label: "Phone number (demo)",
    placeholder: "0000000000",
    type: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email (demo)",
    placeholder: "cadet@example.com",
    type: "email",
    required: true,
  },
  {
    name: "address",
    label: "Address (demo)",
    placeholder: "Demo address, Kolkata",
    type: "textarea",
    required: true,
    wide: true,
  },
  {
    name: "qualification",
    label: "Qualification (demo)",
    placeholder: "Demo qualification",
    required: true,
  },
  {
    name: "school",
    label: "School / Institute (demo)",
    placeholder: "Demo Institute",
    required: true,
  },
  {
    name: "consent",
    label: "I confirm this is fake sample data for a demo submission.",
    type: "checkbox",
    required: true,
    wide: true,
  },
];
c.demo.adminTabs = ["cadets", "internships", "pledges", "gallery"];
c.demo.adminLabels = [
  "Cadet applications",
  "Internship applications",
  "Demo pledges",
  "Gallery",
];
c.demo.altLabel = "Image description";
c.demo.fileLabel = "Gallery image";
c.demo.viewCV = "Download CV";
c.demo.openVerification = "Open verification";
c.demo.profile = "Member area";
c.demo.menu = "Toggle navigation";
c.demo.skipContent = "Skip to content";
c.demo.previousImage = "Previous image";
c.demo.nextImage = "Next image";
c.demo.pause = "Pause slideshow";
c.demo.play = "Play slideshow";
c.demo.showPassword = "Show password";
c.demo.hidePassword = "Hide password";
c.demo.passwordMismatch = "Passwords must match";
c.demo.genericError = "Something went wrong. Please try again.";
c.demo.home = "Return home";
c.demo.amountLabel = "Demo amount";
c.demo.approvalNote = "All records below are demo submissions.";
c.demo.submitUpload = "Upload image";
c.demo.referenceIndex = "Reference image";
c.documentation = {
  heading: "FORM NO. 10AC",
  rule: "(See rule 17A/11AA)",
  subheading: "Order for provisional approval",
  rows: [
    ["1", "PAN", "AABAA7008E"],
    ["2", "Name", "AGNI RURAL WELFARE SOCIETY"],
    ["2a", "Nature of Activities", "Charitable"],
    [
      "2b",
      "Address",
      "Flat/Door/Building: 47, School Road\nRoad/Street/Post Office: Dakshin Jagatdal S.O\nArea/Locality: Dingelpota\nTown/City/District: South 24 Parganas\nState: West Bengal\nCountry: India\nPin Code: 700151",
    ],
    ["3", "Document Identification Number", "AABAA7008EF2025101"],
    ["4", "Application Number", "946744880270425"],
    ["5", "Unique Registration Number", "AABAA7008EF20251"],
    [
      "6",
      "Section under which provisional approval is granted",
      "12-Sub-clause (A) of clause (iv) of first proviso to sub-section (5) of section 80G",
    ],
    ["7", "Date of provisional approval", "04-05-2025"],
    [
      "8",
      "Assessment year or years for which trust is approved",
      "From AY 2026-27 to AY 2028-2029",
    ],
  ],
  order: [
    "a. After considering the application of the applicant and the material available on record, the applicant is hereby granted provisional approval with effect from the assessment year mentioned at serial no. 8 above subject to the conditions mentioned in row number 10.",
    "b. The taxability, or otherwise, of the income of the applicant would be separately considered as per the provisions of the Income Tax Act, 1961.",
    "c. This order is liable to be withdrawn by the prescribed authority if it is subsequently found that the activities of the applicant are not genuine or if they are not carried out in accordance with the conditions prescribed in the Income Tax Act.",
  ],
  conditionsHeading:
    "The approval is granted subject to the following conditions:",
  conditions: [
    "The registration granted under section 12AB or approval granted under clause (23C) of section 10 has not been cancelled by the Principal Commissioner.",
    "The form for approval in Form No. 10A has been duly filled with correct information and no false or incorrect documents have been provided.",
    "The institution or fund shall apply for approval within 6 months of commencement of activities or at least 6 months prior to expiry of provisional approval.",
    "The registration granted under section 12AB or approval granted under clause (23C) has not been cancelled by the Principal Commissioner as per the Income-tax Rules.",
  ],
  authorityLabel: "Name and Designation of the Approving Authority",
  authority: "Principal Commissioner of Income Tax\nCommissioner of Income Tax",
  certificates: [
    {
      src: "/assets/certificate-society.png",
      alt: "Certificate of Registration of Societies",
    },
    {
      src: "/assets/certificate-csr.png",
      alt: "Government of India CSR registration letter",
    },
  ],
};
c.imageText = {
  hero: "Do you want to join our NGO for social service?\nThose who want to become member of our NGO contact us :-9433834013 and share this post to everyone.",
  ncc: [
    "Kolkata, West Bengal",
    "NCC “C” CERTIFICATE HOLDERS",
    "WANTED FOR",
    "SIX-MONTH PAID INTERNSHIP",
    "AS VOLUNTEER TRAINERS",
    "ELIGIBILITY",
    "Graduate (Passed)",
    "NCC ‘C’ Certificate Holder",
    "Age: 19 to 25 Years",
    "Resident of Kolkata / South 24 Parganas",
    "BENEFITS",
    "Stipend: ₹1,000 - ₹2,000 Per Month",
    "After 6 Months: ₹15,000 - ₹18,000 Per Month",
    "Experience in Drill & Training Camps",
    "INTERNSHIP WORK",
    "Conduct Training & Schools at least once a week (minimum four days per month)",
    "Assist in an NGO all type of activities (which are mentioned above):",
    "APPLY NOW!",
    "Send Your Resume with NCC “C” Certificate",
    "Email: arws008@gmail.com",
    "WhatsApp: 94338 34013",
    "AGNI RURAL WELFARE SOCIETY",
    "Service to Society Since 2009",
  ],
  fundraising: [
    "NGO FUNDRAISING & FIELD COORDINATOR",
    "VOLUNTEER & INTERNSHIP PROGRAMME",
    "(For Kolkata Only)",
    "AGNI RURAL WELFARE SOCIETY",
    "WE ARE PLANNING TO DISTRIBUTE:",
    "New Clothes",
    "Notebooks & Stationery",
    "Educational Materials",
    "20 Villages of Sundarbans | Every Month:",
    "January · February · March · April · May · June",
    "July · August · September · October · November · Dec",
    "Support Underprivileged Children",
    "Join a Noble Social Cause",
    "INTERNSHIP DETAILS",
    "Role: Fundraising & Field Coordinator",
    "Duration: 6 Months",
    "Location: Kolkata (Field Work)",
    "COMPENSATION & BENEFITS",
    "Stipend: ₹1,000 - ₹2,000 / Month",
    "Target: ₹20,000 Minimum Collection (Every Month)",
    "Placement After Internship",
    "Salary: ₹20,000 - ₹35,000",
    "+ Incentives & Rewards",
    "APPLY NOW!",
    "Send CV / Resume with Photo via WhatsApp",
    "+91 94338 34013",
    "arws008@gmail.com",
    "Agni Rural Welfare Society",
    "Serving Humanity with Commitment",
  ],
  donation: [
    "AGNI RURAL WELFARE SOCIETY",
    "PLEASE DONATE US",
    "SCAN & PAY USING ANY BHIM UPI APP",
    "9831460161m@pnb",
    "MERCHANT: AGNI RURAL WELFARE SOCIETY",
    "Contact : 9433834013",
  ],
  csr: [
    "GOVERNMENT OF INDIA",
    "MINISTRY OF CORPORATE AFFAIRS",
    "OFFICE OF THE REGISTRAR OF COMPANIES",
    "Dated : 05-05-2025",
    "NOTE - THIS LETTER IS ONLY AN APPROVAL FOR REGISTRATION OF THE ENTITIES FOR UNDERTAKING CSR ACTIVITIES.",
    "To,",
    "AGNI RURAL WELFARE SOCIETY , 47 , SCHOOL ROAD , Dakshin Jagatdal,Dingelpota , SOUTH 24 PARGANAS,SOUTH PARGANAS,WB16,WB,700151",
    "PAN : AABAA7008E",
    "Subject: In Reference to Registration of Entities for undertaking CSR activities",
    "Reference: Your application dated 05-05-2025 (SRN-N30590962)",
    "Sir/Madam,",
    "With reference to the above, it is informed that the entity has been registered for undertaking CSR activities and the Registration number is CSR00091482. Please refer the registration number for any further communication.",
    "Registrar of Companies",
    "ROC-DELHI",
    "Note: The corresponding form has been approved and this letter has been digitally signed through a system generated digital signature.",
  ],
  society: [
    "West Bengal Form No. 264.",
    "Certificate of Registration of Societies",
    "WEST BENGAL ACT XXVI of 1961",
    "I hereby certify that",
    "has this day been registered under the West Bengal Societies Registration Act, 1961.",
    "Given under my hand at",
    "Registrar of Firms, Societies & Non-Trading Corporations, West Bengal.",
  ],
  unreadable: [],
};
c.auth.adminUsername = "Admin username";
c.auth.adminPassword = "Admin password";
c.demo.pdfTitle = "MEMBER ID CARD";
c.demo.enrollmentLabel = "Enrollment:";
c.demo.scan = "Scan to verify";
c.documentation.signatureAlt = "Digitally signed approval mark";
c.imageText.signature = [
  "Digitally signed by DS INCOME TAX DEPARTMENT 26",
];
fs.writeFileSync(filename, JSON.stringify(c, null, 2) + "\n");
