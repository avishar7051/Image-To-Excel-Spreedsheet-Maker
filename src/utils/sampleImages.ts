/**
 * Built-in sample images rendered via SVG data URLs for instant 1-click testing.
 */

export interface SampleItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  mimeType: string;
  dataUrl: string;
}

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

// 1. Itemized Commercial Invoice
const invoiceSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
  <rect width="900" height="700" fill="#ffffff" />
  <rect x="0" y="0" width="900" height="12" fill="#2563eb" />
  
  <!-- Header -->
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#0f172a">APEX LOGISTICS INC.</text>
  <text x="50" y="85" font-family="Arial, sans-serif" font-size="14" fill="#64748b">100 Enterprise Way, Suite 400 | San Francisco, CA 94105</text>
  
  <text x="680" y="55" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#2563eb">INVOICE</text>
  <text x="680" y="80" font-family="Arial, sans-serif" font-size="13" fill="#475569">Invoice #: <tspan font-weight="bold" fill="#0f172a">INV-2026-8842</tspan></text>
  <text x="680" y="100" font-family="Arial, sans-serif" font-size="13" fill="#475569">Date: <tspan font-weight="bold" fill="#0f172a">October 14, 2026</tspan></text>
  <text x="680" y="120" font-family="Arial, sans-serif" font-size="13" fill="#475569">Due Date: <tspan font-weight="bold" fill="#0f172a">November 14, 2026</tspan></text>

  <!-- Bill To Box -->
  <rect x="50" y="130" width="380" height="90" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="65" y="155" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2563eb" letter-spacing="1">BILLED TO:</text>
  <text x="65" y="175" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Global Tech Solutions Corp.</text>
  <text x="65" y="195" font-family="Arial, sans-serif" font-size="13" fill="#475569">Attn: Accounts Payable</text>
  <text x="65" y="210" font-family="Arial, sans-serif" font-size="13" fill="#475569">742 Evergreen Terrace, Seattle, WA 98101</text>

  <!-- Table Header -->
  <rect x="50" y="245" width="800" height="38" rx="4" fill="#0f172a" />
  <text x="70" y="269" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">SKU / Item</text>
  <text x="210" y="269" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">Description</text>
  <text x="490" y="269" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Qty</text>
  <text x="650" y="269" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Unit Price ($)</text>
  <text x="830" y="269" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Total ($)</text>

  <!-- Row 1 -->
  <rect x="50" y="285" width="800" height="36" fill="#ffffff" />
  <line x1="50" y1="321" x2="850" y2="321" stroke="#e2e8f0" stroke-width="1" />
  <text x="70" y="308" font-family="Arial, sans-serif" font-size="13" fill="#334155">SRV-CLOUD-01</text>
  <text x="210" y="308" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Managed Cloud Infrastructure (Enterprise)</text>
  <text x="490" y="308" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">3</text>
  <text x="650" y="308" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">1,250.00</text>
  <text x="830" y="308" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">3,750.00</text>

  <!-- Row 2 -->
  <rect x="50" y="322" width="800" height="36" fill="#f8fafc" />
  <line x1="50" y1="358" x2="850" y2="358" stroke="#e2e8f0" stroke-width="1" />
  <text x="70" y="345" font-family="Arial, sans-serif" font-size="13" fill="#334155">LIC-DB-PRO</text>
  <text x="210" y="345" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Relational Database Core License (Yearly)</text>
  <text x="490" y="345" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">8</text>
  <text x="650" y="345" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">420.00</text>
  <text x="830" y="345" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">3,360.00</text>

  <!-- Row 3 -->
  <rect x="50" y="359" width="800" height="36" fill="#ffffff" />
  <line x1="50" y1="395" x2="850" y2="395" stroke="#e2e8f0" stroke-width="1" />
  <text x="70" y="382" font-family="Arial, sans-serif" font-size="13" fill="#334155">CON-SEC-AUD</text>
  <text x="210" y="382" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Cybersecurity Compliance &amp; Penetration Audit</text>
  <text x="490" y="382" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">1</text>
  <text x="650" y="382" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">2,800.00</text>
  <text x="830" y="382" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">2,800.00</text>

  <!-- Row 4 -->
  <rect x="50" y="396" width="800" height="36" fill="#f8fafc" />
  <line x1="50" y1="432" x2="850" y2="432" stroke="#e2e8f0" stroke-width="1" />
  <text x="70" y="419" font-family="Arial, sans-serif" font-size="13" fill="#334155">SUP-247-PREM</text>
  <text x="210" y="419" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Dedicated 24/7 SLA Engineering Support Tier</text>
  <text x="490" y="419" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">2</text>
  <text x="650" y="419" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">750.00</text>
  <text x="830" y="419" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">1,500.00</text>

  <!-- Row 5 -->
  <rect x="50" y="433" width="800" height="36" fill="#ffffff" />
  <line x1="50" y1="469" x2="850" y2="469" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="70" y="456" font-family="Arial, sans-serif" font-size="13" fill="#334155">TRN-STAFF-ONB</text>
  <text x="210" y="456" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Staff Technical Training &amp; Onboarding Workshop</text>
  <text x="490" y="456" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">4</text>
  <text x="650" y="456" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">350.00</text>
  <text x="830" y="456" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">1,400.00</text>

  <!-- Summary Table -->
  <rect x="520" y="485" width="330" height="175" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="540" y="515" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Subtotal:</text>
  <text x="830" y="515" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">$12,810.00</text>

  <text x="540" y="542" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Volume Discount (5%):</text>
  <text x="830" y="542" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#16a34a" text-anchor="end">-$640.50</text>

  <text x="540" y="569" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Sales Tax (8.25%):</text>
  <text x="830" y="569" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">$1,003.98</text>

  <line x1="540" y1="585" x2="830" y2="585" stroke="#cbd5e1" stroke-width="1" />

  <text x="540" y="618" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">Total Amount Due:</text>
  <text x="830" y="618" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2563eb" text-anchor="end">$13,173.48</text>

  <text x="50" y="650" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">Thank you for your business! Please make payments to Apex Logistics Inc via wire or direct deposit.</text>
</svg>
`;

// 2. Quarterly Financial Matrix
const financialSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <rect width="900" height="600" fill="#ffffff" />
  <rect x="0" y="0" width="900" height="8" fill="#059669" />

  <text x="40" y="50" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">VANGUARD TECHNOLOGIES GROUP</text>
  <text x="40" y="75" font-family="Arial, sans-serif" font-size="14" fill="#64748b">FY2026 Consolidated Quarterly Financial Performance (in USD Millions)</text>

  <!-- Table Header -->
  <rect x="40" y="105" width="820" height="38" rx="4" fill="#065f46" />
  <text x="60" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">Metric / Line Item</text>
  <text x="320" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Q1 2026</text>
  <text x="450" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Q2 2026</text>
  <text x="580" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Q3 2026</text>
  <text x="710" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Q4 2026 (Est)</text>
  <text x="840" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="end">Full Year Total</text>

  <!-- Row 1: Subscription Revenue -->
  <rect x="40" y="145" width="820" height="34" fill="#ffffff" />
  <line x1="40" y1="179" x2="860" y2="179" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="167" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">SaaS Subscription Revenue</text>
  <text x="320" y="167" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">42.8</text>
  <text x="450" y="167" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">48.5</text>
  <text x="580" y="167" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">54.2</text>
  <text x="710" y="167" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">61.0</text>
  <text x="840" y="167" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">206.5</text>

  <!-- Row 2: Professional Services -->
  <rect x="40" y="180" width="820" height="34" fill="#f8fafc" />
  <line x1="40" y1="214" x2="860" y2="214" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="202" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Professional Services &amp; Training</text>
  <text x="320" y="202" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">12.4</text>
  <text x="450" y="202" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">14.1</text>
  <text x="580" y="202" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">15.0</text>
  <text x="710" y="202" font-family="Arial, sans-serif" font-size="13" fill="#334155" text-anchor="end">16.8</text>
  <text x="840" y="202" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">58.3</text>

  <!-- Row 3: Total Gross Revenue -->
  <rect x="40" y="215" width="820" height="34" fill="#ecfdf5" />
  <line x1="40" y1="249" x2="860" y2="249" stroke="#a7f3d0" stroke-width="1.5" />
  <text x="60" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46">Total Gross Revenue</text>
  <text x="320" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46" text-anchor="end">55.2</text>
  <text x="450" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46" text-anchor="end">62.6</text>
  <text x="580" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46" text-anchor="end">69.2</text>
  <text x="710" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46" text-anchor="end">77.8</text>
  <text x="840" y="237" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46" text-anchor="end">264.8</text>

  <!-- Row 4: Cost of Goods Sold -->
  <rect x="40" y="250" width="820" height="34" fill="#ffffff" />
  <line x1="40" y1="284" x2="860" y2="284" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="272" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Cost of Goods Sold (COGS)</text>
  <text x="320" y="272" font-family="Arial, sans-serif" font-size="13" fill="#dc2626" text-anchor="end">(11.2)</text>
  <text x="450" y="272" font-family="Arial, sans-serif" font-size="13" fill="#dc2626" text-anchor="end">(12.5)</text>
  <text x="580" y="272" font-family="Arial, sans-serif" font-size="13" fill="#dc2626" text-anchor="end">(13.8)</text>
  <text x="710" y="272" font-family="Arial, sans-serif" font-size="13" fill="#dc2626" text-anchor="end">(15.4)</text>
  <text x="840" y="272" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#dc2626" text-anchor="end">(52.9)</text>

  <!-- Row 5: Gross Margin -->
  <rect x="40" y="285" width="820" height="34" fill="#f8fafc" />
  <line x1="40" y1="319" x2="860" y2="319" stroke="#cbd5e1" stroke-width="1" />
  <text x="60" y="307" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">Gross Margin</text>
  <text x="320" y="307" font-family="Arial, sans-serif" font-size="13" fill="#0f172a" text-anchor="end">44.0</text>
  <text x="450" y="307" font-family="Arial, sans-serif" font-size="13" fill="#0f172a" text-anchor="end">50.1</text>
  <text x="580" y="307" font-family="Arial, sans-serif" font-size="13" fill="#0f172a" text-anchor="end">55.4</text>
  <text x="710" y="307" font-family="Arial, sans-serif" font-size="13" fill="#0f172a" text-anchor="end">62.4</text>
  <text x="840" y="307" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">211.9</text>

  <!-- Row 6: R&D Expense -->
  <rect x="40" y="320" width="820" height="34" fill="#ffffff" />
  <line x1="40" y1="354" x2="860" y2="354" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="342" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Research &amp; Development</text>
  <text x="320" y="342" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">14.5</text>
  <text x="450" y="342" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">16.0</text>
  <text x="580" y="342" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">17.2</text>
  <text x="710" y="342" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">18.5</text>
  <text x="840" y="342" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">66.2</text>

  <!-- Row 7: Sales & Marketing -->
  <rect x="40" y="355" width="820" height="34" fill="#f8fafc" />
  <line x1="40" y1="389" x2="860" y2="389" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="377" font-family="Arial, sans-serif" font-size="13" fill="#0f172a">Sales &amp; Marketing</text>
  <text x="320" y="377" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">16.2</text>
  <text x="450" y="377" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">17.8</text>
  <text x="580" y="377" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">19.0</text>
  <text x="710" y="377" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="end">20.4</text>
  <text x="840" y="377" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">73.4</text>

  <!-- Row 8: Operating Income / EBITDA -->
  <rect x="40" y="390" width="820" height="38" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" />
  <text x="60" y="414" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803d">Operating Income (EBITDA)</text>
  <text x="320" y="414" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="end">13.3</text>
  <text x="450" y="414" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="end">16.3</text>
  <text x="580" y="414" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="end">19.2</text>
  <text x="710" y="414" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="end">23.5</text>
  <text x="840" y="414" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#15803d" text-anchor="end">72.3</text>

  <!-- Footnote -->
  <text x="40" y="465" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">* All monetary figures audited in compliance with US-GAAP. Q4 figures subject to final year-end adjustments.</text>
</svg>
`;

// 3. Multi-table: Roster & Equipment Assignment
const multiSectionSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650">
  <rect width="900" height="650" fill="#ffffff" />
  <rect x="0" y="0" width="900" height="10" fill="#7c3aed" />

  <text x="40" y="45" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">NEXUS LABS - HARDWARE &amp; STAFF DEPLOYMENT</text>
  <text x="40" y="70" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Internal Asset Allocation and Personnel Tracking Log</text>

  <!-- Section 1 Header -->
  <text x="40" y="105" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#7c3aed">TABLE 1: ACTIVE PERSONNEL ROSTER</text>
  <rect x="40" y="115" width="820" height="32" rx="3" fill="#4c1d95" />
  <text x="60" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Employee ID</text>
  <text x="200" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Full Name</text>
  <text x="390" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Department</text>
  <text x="580" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Primary Role</text>
  <text x="760" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Office Location</text>

  <!-- Roster Row 1 -->
  <rect x="40" y="147" width="820" height="28" fill="#ffffff" />
  <line x1="40" y1="175" x2="860" y2="175" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="166" font-family="Arial, sans-serif" font-size="12" fill="#334155">EMP-1042</text>
  <text x="200" y="166" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Sarah Jenkins</text>
  <text x="390" y="166" font-family="Arial, sans-serif" font-size="12" fill="#334155">Data Engineering</text>
  <text x="580" y="166" font-family="Arial, sans-serif" font-size="12" fill="#334155">Lead Architect</text>
  <text x="760" y="166" font-family="Arial, sans-serif" font-size="12" fill="#334155">San Francisco, CA</text>

  <!-- Roster Row 2 -->
  <rect x="40" y="176" width="820" height="28" fill="#f8fafc" />
  <line x1="40" y1="204" x2="860" y2="204" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="195" font-family="Arial, sans-serif" font-size="12" fill="#334155">EMP-1089</text>
  <text x="200" y="195" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Marcus Chen</text>
  <text x="390" y="195" font-family="Arial, sans-serif" font-size="12" fill="#334155">Machine Learning</text>
  <text x="580" y="195" font-family="Arial, sans-serif" font-size="12" fill="#334155">Staff Scientist</text>
  <text x="760" y="195" font-family="Arial, sans-serif" font-size="12" fill="#334155">New York, NY</text>

  <!-- Roster Row 3 -->
  <rect x="40" y="205" width="820" height="28" fill="#ffffff" />
  <line x1="40" y1="233" x2="860" y2="233" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="60" y="224" font-family="Arial, sans-serif" font-size="12" fill="#334155">EMP-1115</text>
  <text x="200" y="224" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Elena Rostova</text>
  <text x="390" y="224" font-family="Arial, sans-serif" font-size="12" fill="#334155">Product Design</text>
  <text x="580" y="224" font-family="Arial, sans-serif" font-size="12" fill="#334155">Design Director</text>
  <text x="760" y="224" font-family="Arial, sans-serif" font-size="12" fill="#334155">Austin, TX</text>


  <!-- Section 2 Header -->
  <text x="40" y="280" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0284c7">TABLE 2: HARDWARE ASSET INVENTORY</text>
  <rect x="40" y="290" width="820" height="32" rx="3" fill="#0369a1" />
  <text x="60" y="311" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Asset Tag</text>
  <text x="200" y="311" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Device Model</text>
  <text x="430" y="311" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Assigned To</text>
  <text x="620" y="311" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Serial Number</text>
  <text x="780" y="311" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Status</text>

  <!-- Asset Row 1 -->
  <rect x="40" y="322" width="820" height="28" fill="#ffffff" />
  <line x1="40" y1="350" x2="860" y2="350" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="341" font-family="Arial, sans-serif" font-size="12" fill="#334155">AST-9921</text>
  <text x="200" y="341" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">MacBook Pro 16" M3 Max (64GB)</text>
  <text x="430" y="341" font-family="Arial, sans-serif" font-size="12" fill="#334155">Sarah Jenkins</text>
  <text x="620" y="341" font-family="Arial, sans-serif" font-size="12" fill="#334155">C02G89A2MD6R</text>
  <text x="780" y="341" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#16a34a">Active</text>

  <!-- Asset Row 2 -->
  <rect x="40" y="351" width="820" height="28" fill="#f8fafc" />
  <line x1="40" y1="379" x2="860" y2="379" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="370" font-family="Arial, sans-serif" font-size="12" fill="#334155">AST-9934</text>
  <text x="200" y="370" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">Dell Precision 7960 Workstation (Dual RTX 4090)</text>
  <text x="430" y="370" font-family="Arial, sans-serif" font-size="12" fill="#334155">Marcus Chen</text>
  <text x="620" y="370" font-family="Arial, sans-serif" font-size="12" fill="#334155">8Y9K2L1</text>
  <text x="780" y="370" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#16a34a">Active</text>

  <!-- Asset Row 3 -->
  <rect x="40" y="380" width="820" height="28" fill="#ffffff" />
  <line x1="40" y1="408" x2="860" y2="408" stroke="#e2e8f0" stroke-width="1" />
  <text x="60" y="399" font-family="Arial, sans-serif" font-size="12" fill="#334155">AST-9950</text>
  <text x="200" y="399" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">Studio Display 27" 5K Nano-Texture</text>
  <text x="430" y="399" font-family="Arial, sans-serif" font-size="12" fill="#334155">Elena Rostova</text>
  <text x="620" y="399" font-family="Arial, sans-serif" font-size="12" fill="#334155">C02KL89P123X</text>
  <text x="780" y="399" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#16a34a">Active</text>

  <!-- Asset Row 4 -->
  <rect x="40" y="409" width="820" height="28" fill="#f8fafc" />
  <line x1="40" y1="437" x2="860" y2="437" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="60" y="428" font-family="Arial, sans-serif" font-size="12" fill="#334155">AST-9988</text>
  <text x="200" y="428" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">CalDigit TS4 Thunderbolt 4 Dock</text>
  <text x="430" y="428" font-family="Arial, sans-serif" font-size="12" fill="#334155">Sarah Jenkins</text>
  <text x="620" y="428" font-family="Arial, sans-serif" font-size="12" fill="#334155">TS4-US-88741</text>
  <text x="780" y="428" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#16a34a">Active</text>
</svg>
`;

export const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'sample-invoice',
    title: 'Itemized Commercial Invoice',
    badge: 'Single Table & Totals',
    description: 'Detailed billing with SKU codes, item descriptions, quantities, unit prices, discounts, and tax calculation.',
    mimeType: 'image/svg+xml',
    dataUrl: svgToDataUrl(invoiceSvg),
  },
  {
    id: 'sample-finance',
    title: 'Quarterly Financial Matrix',
    badge: 'Multi-Column Financials',
    description: 'Quarterly breakdown of gross revenue, COGS, operating expenses, and EBITDA projections.',
    mimeType: 'image/svg+xml',
    dataUrl: svgToDataUrl(financialSvg),
  },
  {
    id: 'sample-multitable',
    title: 'Roster & Hardware Deployment',
    badge: 'Multi-Section (2 Sheets)',
    description: 'Two distinct tabular sections: Staff Personnel Roster and Hardware Asset Inventory.',
    mimeType: 'image/svg+xml',
    dataUrl: svgToDataUrl(multiSectionSvg),
  },
];
