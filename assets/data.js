// Demo data for the Resilience Room. Realistic placeholder values, not Hotelschool figures.
// good = the value that scores 100, bad = the value that scores 0 (works for lower-is-better too).

window.RR = {
  // NIST Cybersecurity Framework 2.0: the six functions
  functions: [
    { id: 'govern', name: 'Govern', q: 'Do we steer cyber risk from the top?', plain: 'Leadership, rules and suppliers' },
    { id: 'identify', name: 'Identify', q: 'Do we know what we have and what is exposed?', plain: 'Knowing our systems and data' },
    { id: 'protect', name: 'Protect', q: 'Are the doors locked?', plain: 'Logins, updates and awareness' },
    { id: 'detect', name: 'Detect', q: 'Would we notice an attacker, and how fast?', plain: 'Spotting an attack quickly' },
    { id: 'respond', name: 'Respond', q: 'Can we contain an attack and tell people in time?', plain: 'Stopping the spread, informing people' },
    { id: 'recover', name: 'Recover', q: 'Can we get teaching and services back on time?', plain: 'Getting classes and services back' }
  ],

  kpis: [
    // Govern
    { id: 'training', fn: 'govern', name: 'Staff who finished security training', unit: '%', value: 71, good: 95, bad: 50, vol: 2.5, trend: 1,
      why: 'Every member of staff is a door into the network. Training is the cheapest lock.' },
    { id: 'suppliers', fn: 'govern', name: 'Key suppliers with a security review', unit: '%', value: 58, good: 100, bad: 30, vol: 3, trend: 1,
      why: 'The learning platform, exam software, payments and hotel system are all run by suppliers. Marriott 2020 came in through a partner.' },
    { id: 'board', fn: 'govern', name: 'Cyber risk on the board agenda (12 months)', unit: '×', value: 2, good: 4, bad: 0, vol: 0.4, trend: 0, int: true,
      why: 'Resilience starts at the top: budget, priorities and who decides in a crisis.' },
    // Identify
    { id: 'assets', fn: 'identify', name: 'Systems listed in the asset register', unit: '%', value: 84, good: 100, bad: 60, vol: 2, trend: 1,
      why: 'You cannot protect what you do not know you have. Starwood’s breached system came with an acquisition.' },
    { id: 'vulns', fn: 'identify', name: 'Critical weaknesses open > 30 days', unit: '', value: 7, good: 0, bad: 20, vol: 1.5, trend: 1, int: true,
      why: 'Known, unpatched weaknesses are how most ransomware gets in.' },
    { id: 'datamap', fn: 'identify', name: 'Sensitive data stores mapped', unit: '%', value: 76, good: 100, bad: 40, vol: 2.5, trend: 1,
      why: 'Passport copies for visas, grades, home addresses, card payments: where is each one stored?' },
    // Protect
    { id: 'mfa', fn: 'protect', name: 'Accounts with two-step login', unit: '%', value: 96, good: 100, bad: 85, vol: 0.6, trend: 1,
      why: 'A stolen password alone is then not enough. Marriott 2020: two logins were all it took.' },
    { id: 'phish', fn: 'protect', name: 'Phishing test click rate', unit: '%', value: 9, good: 5, bad: 20, vol: 1.6, trend: 1,
      why: 'Measured with harmless fake phishing mails every quarter.' },
    { id: 'patch', fn: 'protect', name: 'Critical patches within 14 days', unit: '%', value: 88, good: 95, bad: 70, vol: 2.5, trend: 0,
      why: 'Speed of patching decides whether a public weakness becomes our incident.' },
    // Detect
    { id: 'mttd', fn: 'detect', name: 'Mean time to detect', unit: 'h', value: 31, good: 24, bad: 168, vol: 9, trend: 1,
      why: 'Starwood: attackers sat in the guest database for about four years before anyone noticed.' },
    { id: 'report', fn: 'detect', name: 'Phishing mails reported by users', unit: '%', value: 34, good: 60, bad: 10, vol: 3, trend: 1,
      why: 'Students and staff are the best sensors we have, if reporting takes one click.' },
    { id: 'triage', fn: 'detect', name: 'Security alerts checked within 1 hour', unit: '%', value: 82, good: 95, bad: 60, vol: 3, trend: 0,
      why: 'An alert nobody reads is the same as no alert. Starwood was found by one alert that someone did read.' },
    // Respond
    { id: 'mttc', fn: 'respond', name: 'Mean time to contain', unit: 'h', value: 6.5, good: 4, bad: 48, vol: 0.8, trend: 1, dec: 1,
      why: 'From “we know” to “it cannot spread further”.' },
    { id: 'drill', fn: 'respond', name: 'Days since the last crisis drill', unit: ' d', value: 210, good: 90, bad: 365, vol: 2, trend: -1, int: true,
      why: 'In a crisis people fall back on what they rehearsed, not on the plan in a drawer.' },
    { id: 'notify', fn: 'respond', name: 'Breach notification drill time', unit: 'h', value: 30, good: 24, bad: 72, vol: 4, trend: 1,
      why: 'The GDPR gives 72 hours to report a data breach to the Dutch regulator. Our own target is 24.' },
    // Recover
    { id: 'restore', fn: 'recover', name: 'Critical systems restore-tested (90 days)', unit: '%', value: 75, good: 100, bad: 40, vol: 4, trend: 1,
      why: 'A backup only counts once you have restored from it.' },
    { id: 'offline', fn: 'recover', name: 'Backups kept offline', unit: '%', value: 80, good: 100, bad: 50, vol: 3, trend: 1,
      why: 'Ransomware encrypts the backups it can reach. Offline copies are the way back.' },
    { id: 'rto', fn: 'recover', name: 'Recoveries within target time', unit: '%', value: 67, good: 95, bad: 50, vol: 4, trend: 0,
      why: 'How often we actually got a service back within the time we promised.' }
  ],

  // Daily blocked phishing e-mails (demo), most recent last
  blockedBase: 160,

  systems: [
    { name: 'MyHotelschool (Sakai)', use: 'Courses, decks, assignments', who: 'All students and staff', data: 'Medium', mfa: true, patched: true, review: true, status: 'warning',
      note: 'Hosted by a supplier. Sign-in through Microsoft. Students find it hard to navigate.' },
    { name: 'Microsoft 365', use: 'E-mail, Teams, files', who: 'All students and staff', data: 'High', mfa: true, patched: true, review: true, status: 'warning',
      note: '96% of accounts have two-step login; the other 4% are the open door.' },
    { name: 'Student information system', use: 'Grades, enrolment, visas', who: 'Staff', data: 'High', mfa: true, patched: false, review: true, status: 'serious',
      note: 'Holds passport copies for visa students. One critical patch is 41 days old.' },
    { name: 'Exam software', use: 'Digital exams', who: 'All students', data: 'Medium', mfa: true, patched: true, review: false, status: 'warning',
      note: 'Supplier security review still to be done.' },
    { name: 'Training hotel system', use: 'Guest bookings, check-in', who: 'Students in training', data: 'High', mfa: false, patched: true, review: false, status: 'serious',
      note: 'Real guest data, many short-term student users. The same risk as any hotel.' },
    { name: 'Restaurant tills & payments', use: 'Card payments in training outlets', who: 'Students in training', data: 'High', mfa: false, patched: true, review: true, status: 'warning',
      note: 'Card data must meet the payment industry standard (PCI DSS).' },
    { name: 'Campus Wi-Fi', use: 'Students, staff, guests', who: 'Everyone on campus', data: 'Low', mfa: true, patched: true, review: true, status: 'good',
      note: 'Guest network separated from staff systems.' },
    { name: 'Doors, cameras, building sensors', use: 'Access control, IoT', who: 'Facilities', data: 'Medium', mfa: false, patched: false, review: false, status: 'serious',
      note: 'Ch. 8: smart locks and sensors are computers too. Some still run on factory passwords.' }
  ],

  // The five biggest cyber challenges for the school, in plain language (score = likelihood × impact, out of 25)
  challenges: [
    { title: 'Ransomware locks our systems', fn: 'recover', score: 15,
      why: 'Not every backup has been tested by restoring it. Getting back up is our weakest point.' },
    { title: 'Stolen student and staff logins', fn: 'protect', score: 15,
      why: '9% of people click a fake phishing mail. Among first-years it is 14%.' },
    { title: 'A confusing platform makes fakes look real', fn: 'govern', score: 12,
      why: 'Students struggle to find their way on MyHotelschool, so a fake login page is hard to spot.' },
    { title: 'A supplier gets hacked', fn: 'govern', score: 12,
      why: 'Only 58% of key suppliers (learning platform, exams, payments) have had a security check.' },
    { title: 'Passport copies and grades leak', fn: 'identify', score: 10,
      why: 'Not every place where sensitive data is stored has been mapped yet.' }
  ],

  // What we would fix first: three actions, each moving a KPI on the dashboard
  fixFirst: [
    { t: 'Test every backup by restoring it', fn: 'recover', metric: 'Critical systems restore-tested', from: 75, to: 100,
      why: 'Ransomware is our biggest risk, and getting back up is where we are weakest. A backup only counts once it has been restored.' },
    { t: 'A security check for every key supplier', fn: 'govern', metric: 'Key suppliers with a security review', from: 58, to: 100,
      why: 'The learning platform, exams and payments all run at suppliers. Every contract gets a “tell us within 24 hours” clause.' },
    { t: 'One official channel and one clear home page', fn: 'protect', metric: 'Messages through one official channel', from: 64, to: 100,
      why: 'Fixes the confusing platform. When students know what real looks like, a fake message stands out.' }
  ],

  // Top resilience challenges: likelihood and impact on a 1–5 scale.
  risks: [
    { id: 'R1', cyber: true, title: 'Ransomware locks learning and admin systems', l: 3, i: 5, move: 'up', fix: 'Offline backups, restore tests, network segments' },
    { id: 'R2', cyber: true, title: 'Phishing steals student or staff logins', l: 5, i: 3, move: 'up', fix: 'Two-step login for all, phishing tests, a report button' },
    { id: 'R3', cyber: true, title: 'A supplier is hacked (learning platform, exams, payments)', l: 3, i: 4, move: 'up', fix: 'Security review per supplier, exit plans' },
    { id: 'R4', cyber: true, title: 'Leak of passport copies and grades', l: 2, i: 5, move: 'up', fix: 'Encrypt, keep less, breach drill' },
    { id: 'R5', cyber: true, title: 'Confusing platform and scattered messages: students cannot tell real from fake', l: 4, i: 3, move: 'up', fix: 'One official channel, a clear home page, verified senders' },
    { id: 'R6', cyber: true, title: 'Card fraud at the training outlets', l: 2, i: 3, move: 'flat', fix: 'Payment standard checks, till offline mode' },
    { id: 'R7', cyber: false, title: 'Platform outage in exam week', l: 3, i: 4, move: 'flat', fix: 'Status page, paper fallback, deadline rules' },
    { id: 'R8', cyber: false, title: 'Policy limits on English-taught programmes and international intake', l: 4, i: 5, move: 'up', fix: 'Scenario budgets, more non-degree income' },
    { id: 'R9', cyber: false, title: 'Key-person dependency in IT, timetabling and exams', l: 3, i: 4, move: 'flat', fix: 'A trained backup for every critical role' },
    { id: 'R10', cyber: false, title: 'National cuts to higher-education budgets', l: 4, i: 3, move: 'up', fix: 'Cash buffer of 4+ months' }
  ],

  // Track & trace: d = hours from start to detected, c = to contained, r = to recovered. rto = recovery target in hours.
  incidents: [
    { id: 'INC-0417', kind: 'Phishing', cyber: true, sev: 3, start: '2026-10-16T21:40', status: 'monitoring',
      title: 'Fake MyHotelschool login page shared in student group chats',
      how: 'Three students used the report button within 20 minutes. All three said it “looked like the real thing”.',
      d: 0.4, c: 3, r: 30, rto: 24,
      cause: 'A copy of the sign-in page on a look-alike web address. Because the real platform is hard to navigate, students had no clear picture of what “real” looks like.',
      lesson: 'Blocked the address; forced password reset for 14 accounts. Proposed: a verified-sender banner and one official home page.' },
    { id: 'INC-0412', kind: 'Communication', cyber: false, sev: 2, start: '2026-10-19T09:00', status: 'open',
      title: 'Room clash: class 8 booked in room 0.22 and the Auditorium',
      how: 'A student noticed the calendar and the timetable gave different rooms.',
      d: 0.5, c: 4, r: null, rto: 8,
      cause: 'Two systems hold room bookings and nothing checks them against each other.',
      lesson: 'Proposed: one source of truth for rooms, checked automatically each night.' },
    { id: 'INC-0409', kind: 'Communication', cyber: false, sev: 2, start: '2026-10-07T10:00', status: 'closed',
      title: 'Deadline change posted in one platform section only: 40% missed it',
      how: 'Students asked the lecturer by e-mail why the hand-in had closed.',
      d: 26, c: 30, r: 50, rto: 24,
      cause: 'The change sat in one course tool; no announcement, no e-mail. Information on the platform is spread over many sections.',
      lesson: 'Rule: every change goes out through one official channel, with the same format every time.' },
    { id: 'INC-0402', kind: 'Vulnerability', cyber: true, sev: 2, start: '2026-10-02T08:00', status: 'closed',
      title: 'Room booking server found with a known critical weakness',
      how: 'The monthly security scan flagged it.',
      d: 1, c: 6, r: 20, rto: 72,
      cause: 'The server was missing from the asset register, so it was never on the patch list.',
      lesson: 'Server added to the register. KPI: systems listed in the asset register.' },
    { id: 'INC-0398', kind: 'Access', cyber: true, sev: 3, start: '2026-09-28T09:00', status: 'closed',
      title: 'MyHotelschool sign-in fails after the Microsoft login step',
      how: 'Students reported an error page; IT desk tickets piled up.',
      d: 5, c: 26, r: 74, rto: 24,
      cause: 'A change in the sign-in connection between Microsoft and the platform, not tested end to end.',
      lesson: 'Sign-in success rate is now monitored live, with an alert below 98%.' },
    { id: 'INC-0391', kind: 'Phishing', cyber: true, sev: 3, start: '2026-09-22T07:30', status: 'closed',
      title: 'Phishing wave: fake student-finance refund e-mail',
      how: 'Thirty-eight students used the report button within the first hour.',
      d: 1.2, c: 5, r: 26, rto: 24,
      cause: 'A convincing look-alike of a government student-finance e-mail, sent to 2,100 inboxes.',
      lesson: 'Five accounts reset; two-step login made mandatory for students too.' }
  ],

  scenarios: [
    { id: 'ransom', name: 'Ransomware', icon: 'lock', system: 'Student information system',
      blurb: 'Monday 07:40. File servers and the student information system are encrypted and a ransom note asks for bitcoin. The logs show the attackers got in a week earlier.',
      benchmark: 'Real benchmark: Maastricht University, Dec 2019. Most systems went down over the holidays and the university paid about €200,000.',
      chain: [
        { step: 'Phishing e-mail', control: 'Phishing test click rate', kpi: 'phish' },
        { step: 'Stolen password', control: 'Two-step login', kpi: 'mfa' },
        { step: 'Unpatched server', control: 'Critical patches', kpi: 'patch' },
        { step: 'Encrypts servers', control: 'Time to detect', kpi: 'mttd' },
        { step: 'Ransom note', control: 'Offline backups', kpi: 'offline' }
      ],
      impact: { mttd: 168, mttc: 30, restore: 75, notify: 60, rto: 55 },
      breaks: ['Grades, enrolment and visa files unreachable', 'E-mail and the learning platform go down for safety', 'The GDPR clock starts: 72 hours to report'],
      playbook: ['Cut infected network segments', 'Crisis team meets within 1 hour', 'Restore from offline backups', 'Report to the regulator within 72 hours', 'Update students by text every 4 hours'],
      stages: { d: 0.3, c: 4, r: 40 }, rto: 48, without: 216 },
    { id: 'phish', name: 'Fake login campaign', icon: 'mail', system: 'Microsoft 365',
      blurb: 'A message “Your MyHotelschool account will be locked” reaches 3,000 inboxes with a link to a copy of the login page. 9% of students type their password.',
      benchmark: 'Marriott 2020: two stolen employee logins were enough to reach 5.2 million guest records.',
      chain: [
        { step: 'Look-alike e-mail', control: 'One official channel', kpi: null },
        { step: 'Fake login page', control: 'Users who report it', kpi: 'report' },
        { step: 'Password typed', control: 'Two-step login', kpi: 'mfa' },
        { step: 'Mailbox taken over', control: 'Alerts checked in 1 h', kpi: 'triage' },
        { step: 'New phishing from a real account', control: 'Time to contain', kpi: 'mttc' }
      ],
      impact: { phish: 19, report: 18, mttd: 48, mttc: 12 },
      breaks: ['Attackers read e-mail and files of 270 students', 'New phishing goes out from real school accounts, which makes it even more believable'],
      playbook: ['Pull the mail from all inboxes', 'Reset every account that clicked', 'Force two-step login', 'One clear warning through the official channel'],
      stages: { d: 1, c: 3, r: 20 }, rto: 24, without: 96 },
    { id: 'supplier', name: 'Supplier breach', icon: 'link', system: 'MyHotelschool (Sakai)',
      blurb: 'The company hosting the learning platform reports a breach. Course files and student names may have been copied. We depend on their timeline.',
      benchmark: 'Like Marriott’s franchise case: the weakest link sat outside the company’s own walls.',
      chain: [
        { step: 'Supplier is hacked', control: 'Supplier security reviews', kpi: 'suppliers' },
        { step: 'Our data is copied', control: 'Sensitive data mapped', kpi: 'datamap' },
        { step: 'We hear it late', control: 'Breach notice in contract', kpi: null },
        { step: 'Students ask questions', control: 'Notification drill', kpi: 'notify' }
      ],
      impact: { suppliers: 40, datamap: 60, notify: 66, mttd: 96 },
      breaks: ['We cannot see the logs ourselves', 'Students and parents ask what was taken, and we cannot yet say'],
      playbook: ['Activate the contract’s breach clause', 'Map exactly which data the supplier holds', 'Joint statement within 24 hours', 'Exit plan if trust is gone'],
      stages: { d: 30, c: 48, r: 120 }, rto: 96, without: 480 },
    { id: 'skim', name: 'Card skimming at the till', icon: 'card', system: 'Restaurant tills & payments',
      blurb: 'Malware on a till in the training restaurant copies guest card numbers for three weeks before the bank flags fraud.',
      benchmark: 'Hotels and restaurants are a classic target for payment card theft. A hotel school runs real outlets with real guests.',
      chain: [
        { step: 'Default password on a till', control: 'Systems in the asset register', kpi: 'assets' },
        { step: 'Malware on the till', control: 'Critical patches', kpi: 'patch' },
        { step: 'Cards copied for weeks', control: 'Time to detect', kpi: 'mttd' },
        { step: 'Bank reports fraud', control: 'Notification drill', kpi: 'notify' }
      ],
      impact: { mttd: 160, assets: 70, notify: 50 },
      breaks: ['Guests’ cards are blocked; the bank may fine us', 'Card payments stop in the training outlets'],
      playbook: ['Take the till offline, keep the evidence', 'Inform the bank and the payment provider', 'Write to every affected guest', 'Rebuild the till from a clean image'],
      stages: { d: 2, c: 6, r: 48 }, rto: 72, without: 240 },
    { id: 'outage', name: 'Platform down in exam week', icon: 'cloud', system: 'MyHotelschool (Sakai)',
      blurb: 'Thursday of exam week. The learning platform and its sign-in stop responding. 900 students have a deadline at noon.',
      benchmark: 'Not every outage is an attack, but the response is the same muscle: detect, communicate, recover.',
      chain: [
        { step: 'Platform stops', control: 'Alerts checked in 1 h', kpi: 'triage' },
        { step: 'Students panic in group chats', control: 'One official channel', kpi: null },
        { step: 'Deadline passes', control: 'Recoveries within target', kpi: 'rto' }
      ],
      impact: { rto: 52, triage: 70, mttc: 8 },
      breaks: ['Assignments cannot be handed in', 'Rumours spread faster than the official message'],
      playbook: ['Status page live within 15 minutes', 'Deadline moved automatically by the outage time', 'Hand-in by e-mail as a fallback'],
      stages: { d: 0.25, c: 1.5, r: 6 }, rto: 4, without: 30 }
  ],

  // Human factor: phishing test click rate per group (demo)
  groups: [
    { name: 'First-year students', v: 14 },
    { name: 'Students in training outlets', v: 11 },
    { name: 'Master students', v: 8 },
    { name: 'Teaching staff', v: 7 },
    { name: 'Support staff', v: 5 }
  ],

  humanKpis: [
    { id: 'find', name: 'Students who find a deadline within 2 minutes', unit: '%', value: 58, good: 90, bad: 40,
      why: 'Usability test on MyHotelschool. Students told us the platform has many sections and the information is spread out.' },
    { id: 'onechannel', name: 'Messages sent through one official channel', unit: '%', value: 64, good: 100, bad: 40,
      why: 'Today a change can appear in a course tool, an announcement, an e-mail or a Teams chat. Students cannot know which one counts.' },
    { id: 'spot', name: 'Students who can spot a fake school message', unit: '%', value: 61, good: 90, bad: 40,
      why: 'If you do not know what real looks like, you cannot spot fake.' }
  ],

  fixes: [
    { t: 'One home page', d: 'Deadlines, changes and announcements in one place, in the same order for every course.' },
    { t: 'One official channel', d: 'Every change goes out the same way. Anything else is suspicious by default.' },
    { t: 'Verified sender banner', d: 'Real school messages carry a visible mark; students learn to look for it.' },
    { t: 'A report button', d: 'One click to report a suspicious message, with a thank-you reply.' },
    { t: 'Two-minute nudges', d: 'Short monthly reminders instead of one long yearly training.' }
  ],

  // Beyond cyber: the wider resilience of the school
  wider: [
    { id: 'learning', name: 'Digital learning & communication', challenge: 'A platform students find hard to navigate, and messages spread over too many channels.',
      kpis: [
        { name: 'Learning platform uptime', unit: '%', value: 99.6, good: 99.9, bad: 99.0, dec: 1 },
        { name: 'Students who find a deadline within 2 min', unit: '%', value: 58, good: 90, bad: 40 },
        { name: 'Messages through one official channel', unit: '%', value: 64, good: 100, bad: 40 }
      ] },
    { id: 'campus', name: 'Campus & training outlets', challenge: 'Real restaurants and hotel rooms that must keep running when systems fail.',
      kpis: [
        { name: 'Room booking clashes per week', unit: '', value: 4, good: 0, bad: 10, int: true },
        { name: 'Outlets tested to trade offline', unit: '%', value: 67, good: 100, bad: 50 },
        { name: 'Maintenance closed within SLA', unit: '%', value: 81, good: 90, bad: 60 }
      ] },
    { id: 'people', name: 'People', challenge: 'Key tasks that sit with one person, and staff stretched thin.',
      kpis: [
        { name: 'Critical roles with a trained backup', unit: '%', value: 72, good: 100, bad: 50 },
        { name: 'Staff absence rate', unit: '%', value: 5.6, good: 4, bad: 8, dec: 1 },
        { name: 'Student wellbeing pulse', unit: '/10', value: 6.8, good: 7.5, bad: 5.5, dec: 1 }
      ] },
    { id: 'finance', name: 'Finance & intake', challenge: 'National policy on international students and budget cuts.',
      kpis: [
        { name: 'Applications vs target', unit: '%', value: 91, good: 100, bad: 80 },
        { name: 'Cash buffer', unit: ' mo', value: 3.2, good: 4.5, bad: 1.5, dec: 1 },
        { name: 'Income outside degree fees', unit: '%', value: 12, good: 20, bad: 5 }
      ] },
    { id: 'reputation', name: 'Reputation & trust', challenge: 'One data leak can undo years of trust from students, parents and industry.',
      kpis: [
        { name: 'Student satisfaction (NSE)', unit: '/5', value: 3.8, good: 4.0, bad: 3.3, dec: 1 },
        { name: 'Positive online sentiment', unit: '%', value: 76, good: 80, bad: 60 },
        { name: 'Graduates employed within 6 months', unit: '%', value: 94, good: 96, bad: 85 }
      ] }
  ],

  marriott: [
    { year: '2014 – 2018', title: 'Starwood guest database',
      timeline: [
        { t: '2014', e: 'Attackers get into Starwood’s reservation system' },
        { t: '2016', e: 'Marriott buys Starwood and inherits the hidden breach' },
        { t: 'Sep 2018', e: 'A security alert flags an unusual database query' },
        { t: 'Nov 2018', e: 'Disclosed: ~339 million guest records, millions of unencrypted passport numbers' },
        { t: '2020', e: 'UK regulator fines Marriott £18.4 million' }
      ],
      lesson: 'Detection time is a KPI. So is knowing what is inside the systems you buy or inherit.',
      kpis: ['Mean time to detect', 'Systems in the asset register', 'Sensitive data stores mapped'] },
    { year: '2020', title: 'Franchise employee logins',
      timeline: [
        { t: 'Mid-Jan 2020', e: 'Attackers log in with two franchise employees’ credentials' },
        { t: 'End Feb 2020', e: 'Marriott notices the unusual access' },
        { t: 'Mar 2020', e: 'Disclosed: contact details of up to 5.2 million guests' }
      ],
      lesson: 'Your weakest login is your real perimeter, including partners and franchisees.',
      kpis: ['Accounts with two-step login', 'Key suppliers with a security review', 'Alerts checked within 1 hour'] }
  ],

  // "Spot the phish" quiz shown on phones
  quiz: [
    { from: 'MyHotelschool Support', addr: 'support@myhotelschool-login.com', subject: 'Your account will be locked in 24 hours',
      body: 'We detected unusual activity. Verify your password now to keep access to your courses: myhotelschool-login.com/verify',
      fake: true, flags: ['Look-alike web address (…-login.com)', 'Pressure: “24 hours”', 'Asks for your password'] },
    { from: 'Exams Office', addr: 'exams@hotelschool.nl', subject: 'Reminder: check your exam laptop before Friday',
      body: 'Please run the laptop check before the exam. Open MyHotelschool the way you always do and go to the Exams page. No reply needed.',
      fake: false, flags: ['School address', 'No link, no password asked', 'Tells you to go there yourself'] },
    { from: 'DUO Student Finance', addr: 'refunds@duo-terugbetaling.nl', subject: 'You are owed a refund of €312',
      body: 'Due to a calculation error you are owed €312. Confirm your bank details within 48 hours: duo-terugbetaling.nl/claim',
      fake: true, flags: ['Not the official DUO address', 'Money as bait', 'Asks for bank details'] }
  ],

  sources: [
    { name: 'Govern', from: 'Training records, supplier contracts, board minutes' },
    { name: 'Identify', from: 'Asset register, vulnerability scanner, data map (GDPR register)' },
    { name: 'Protect', from: 'Microsoft sign-in logs, phishing test tool, patch management' },
    { name: 'Detect', from: 'Security monitoring (SIEM), report-button mailbox' },
    { name: 'Respond', from: 'Incident tickets, drill log' },
    { name: 'Recover', from: 'Backup software, restore tests, recovery tickets' }
  ]
};
