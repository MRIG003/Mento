# Mento: Creative Brief

Status: **Approved at CHECKPOINT 1 (2026-11-03)** with the recommended answers to all open questions. Skill: idea-refine (diverge, then converge).
Every name and number below is illustrative demo data. Nothing here is a measured fact.

---

## 1. Problem Statement

**How might we** let a tired teacher with 40+ notebooks find out in under a minute each evening
which children are stuck, on which concept, and what to do tomorrow, starting from the
WhatsApp link they already send?

Who: a Class 3-8 teacher in an affordable private school, phone only, 9 pm, Hindi or English or both.
Success: the teacher knows what to do next and can later see whether it helped. "Submitted" does not count as success.
What we're up against: WhatsApp plus paper. Mento has to take less effort than that, and it also has to show more.

---

## 2. Diverge: eight variations (lenses from idea-refine)

| # | Lens | Variation | Verdict |
|---|---|---|---|
| 1 | Inversion | **The homework grades the lesson plan, not the child.** The main output is tomorrow's first five minutes, not a mark sheet. | Keep. Becomes the *Evening Wrap*. |
| 2 | Expert lens (experienced maths teacher) | **Wrong answers that explain themselves.** Each MCQ distractor in the bank carries a misconception tag (choosing 2/8 for 1/4 + 1/4 = "added the denominators"). A wrong pick becomes evidence of a cause, not just a cross. | Keep. Cheap, high value, and it's what makes "likely misconception" honest. |
| 3 | Combination (WhatsApp + desk) | **The Desk.** The teacher's home is a desk of sticky notes generated from data: "32 of 40 in", "6 stuck → practice?", "Remind 8 parents". | Keep. This is the home screen. |
| 4 | Simplification (10x simpler) | **No authoring at all.** The teacher picks a chapter, Mento proposes 5 bank questions, one tap publishes. Typing your own questions is the exception. | Keep as the default create path. |
| 5 | Audience shift (parent first) | Parents get a nightly "3 questions for your child" without the teacher. | Reject for v1. It goes around the teacher, who is the user who knows the class. A plain-language parent report stays. |
| 6 | Constraint removal | Real OCR on every notebook photo, zero entry. | Reject for v1. Accuracy, cost and child-privacy risk. Guided capture is real; the reading is Preview. |
| 7 | 10x scale | School-wide concept recovery across terms ("Class 6 recovered Comparing fractions in 2 weeks"). | Later (School plan, term history). v1 shows a single re-check delta. |
| 8 | Inversion (teacher time) | **One summary a day, never a ping per submission.** | Keep. Quiet by design. |

### Converge: three directions, stress-tested

| Direction | User value | Feasibility | Differentiation |
|---|---|---|---|
| **A. The Evening Desk** (3 + 1 + 8): a desk of notes, a 10-second wrap | Painkiller: replaces "flip 40 notebooks" | Medium: pure UI over the data layer | A home that says what to *do* next, not a dashboard |
| **B. Diagnostic questions** (2 + 4): misconception-tagged bank, auto-drafted sets | Painkiller for "why are they wrong?" | Low to medium: content work, simple logic | Explains *why*, with evidence |
| **C. Parent-first nudges** (5) | Vitamin | Low | Weak; competes with the teacher |

**Recommended: A + B together, with C cut down to a parent report and a reminder composer.**

---

## 3. Recommended Direction

Mento is **the teacher's evening desk**. Homework goes out as one WhatsApp link. Children answer
on a parent's phone with no account. The teacher's desk then fills with a few sticky notes, ordered by
what to do next. The flagship note is the highlighter: the weakest concept gets *marked* like a
notebook, "6 students stuck on Comparing fractions", with the evidence underneath ("got 1 of 4
right"). One tap drafts a practice set at those children's level. The teacher approves it, it goes out on the
same link, and a re-check later shows whether it helped.

What makes the diagnosis trustworthy is that the bank's wrong options carry misconception tags, and the gap rules refuse
to call something a gap on thin evidence ("not enough answers yet to say"). The teacher can override any mark
or recommendation. Hindi and English are equal: a one-tap `EN | हिं` switch on every screen, plus bilingual
content fields.

This direction stays clearly separate from Kaksha. There's no answer-sheet theme, no slides, no XP or streaks, no plan names
borrowed from it. The metaphor is a real desk with sticky notes, a highlighter, washi tape and name tags, and
the product is a working app.

---

## 4. Three signature ideas

1. **The highlighter heatmap that marks.** On the concepts card, a yellow highlighter swipe
   (#FFEB3B) draws once behind the weakest concept, the way a teacher marks a notebook. Strength is
   carried by words ("stuck", "getting there", "on track") and the percentage as well as colour.
   Below it, the evidence: "Comparing fractions: 41% right. Most picked 3/5 < 2/5 → *bigger
   numerator means bigger*". Reduced motion: the highlight is just there, with no animation.
2. **The Desk home.** Today's work as 3-5 sticky notes, most urgent first, each one a single action:
   - yellow "6 stuck on Comparing fractions → Give practice"
   - pink "8 parents haven't opened it → Remind"
   - blue "Fractions HW · 32 of 40 in · due 8 pm"
   - mint "Re-check ready: 4 of 6 now on track"
   Done notes slide into a "Done today" tray. When the desk is empty it says so ("Desk is clear").
3. **The Evening Wrap (10 seconds).** After the due time, one note: *"Tomorrow, start with Comparing
   fractions (5 min). 6 children need it. Practice is ready to send."* Two buttons: **Send practice** and
   **Not now**. After the re-check: *"Comparing fractions for these 6: 1 of 4 → 3 of 4 right"*.
   The wrap is computed from the data, never written by hand. This replaces any ping per submission.

Supporting idea: **wrong answers that explain themselves** (misconception-tagged distractors), shown
only when at least 2 students chose the same distractor.

---

## 5. Micro-delight (quiet, adult, optional)

- **Motion** (CSS transforms only, 150-400 ms, all off under `prefers-reduced-motion`): a note "peels"
  (lift + slight rotate) when tapped; the highlighter swipes once (scaleX from the left); name tags drop
  into the "Needs help" row with a tiny stagger; the washi tape settles on first paint.
- **Sound and haptics:** off by default. One switch in Settings. When on, a soft paper tick on
  submit and a 10 ms vibration (Android `navigator.vibrate`, ignored elsewhere).
- **Stickers for teachers (non-childish):** stationery stickers, one per Starter Checklist step:
  paperclip (class created), postage stamp (link shared), rubber "Sent" stamp (first homework),
  highlighter cap (first insight), gold star seal (first practice). Each comes with a one-line celebration,
  e.g. "First insight. You now know who to help tomorrow."
- **For students:** a single ink stamp on the success screen ("Submitted ✓" / "On time"). No XP,
  no streaks, no leaderboards, no comparing children.
- **Empty states with personality:** "Desk is clear. Start with a homework." · "Nothing to highlight
  yet. Insights appear once a few answers are in." · "No one needs help on this one. Nice."
- **Stationery loading states:** ruled-paper skeleton lines that fill left to right; no spinners
  on content areas. Text fallback "Loading…" / "लोड हो रहा है…".

---

## 6. Microcopy for key moments (English and simple Hindi)

Hindi is everyday spoken Hindi, flagged for native-speaker review. Concept names: Fractions = भिन्न,
Adding fractions = भिन्नों का जोड़, Equivalent fractions = तुल्य भिन्न, Comparing fractions =
भिन्नों की तुलना.

| Moment | English | हिन्दी |
|---|---|---|
| Role: teacher | I'm a teacher | मैं टीचर हूँ |
| Role: principal | I'm a principal | मैं प्रिंसिपल हूँ |
| Role: parent/student | I got a link from my child's school | मुझे बच्चे के स्कूल से लिंक मिला है |
| Pick name | Who is answering? Tap your name. | कौन जवाब दे रहा है? अपना नाम चुनें। |
| Confirm name | You are Anaya? · Not me | आप अनाया हैं? · मैं नहीं हूँ |
| Consent line | Your teacher sees your answers. The school sees only class totals, never your name. | आपके जवाब आपके टीचर देखेंगे। स्कूल को सिर्फ़ पूरी क्लास का जोड़ दिखता है, आपका नाम नहीं। |
| Warm-up | Try this one first. It's just practice. | पहले यह आज़माएँ। यह सिर्फ़ अभ्यास है। |
| Progress | Question 3 of 8 | सवाल 3 / 8 |
| Saved | Saved on this phone. | इस फ़ोन में सेव है। |
| Save error | Couldn't save. Your answers are still on this phone. | सेव नहीं हुआ। आपके जवाब इस फ़ोन में सुरक्षित हैं। |
| Submit success | Done! Your teacher will see it this evening. | हो गया! टीचर आज शाम देख लेंगे। |
| Late | Submitted late. That's okay, your teacher will still see it. | देर से जमा हुआ। कोई बात नहीं, टीचर फिर भी देखेंगे। |
| Insight headline | 6 students stuck on Comparing fractions | 6 बच्चे भिन्नों की तुलना में अटके हैं |
| Evidence | Got 1 of 4 right on this concept | इस टॉपिक में 4 में से 1 सही |
| Not enough evidence | Not enough answers yet to say | अभी कुछ कहने के लिए जवाब कम हैं |
| Practice CTA | Give practice to these 6 | इन 6 को प्रैक्टिस दें |
| Approve practice | Check the practice before it goes out | भेजने से पहले प्रैक्टिस देख लें |
| Override | Mark as correct | सही मानें |
| Share | Share on WhatsApp | WhatsApp पर भेजें |
| Homework message | Class 6B Maths homework: Fractions. Please finish by tomorrow 8 pm. Open: {link} | कक्षा 6B गणित का होमवर्क: भिन्न। कल रात 8 बजे तक पूरा करें। खोलें: {link} |
| Reminder | Gentle reminder: today's Maths homework is still pending for some children. {link} | याद दिला रहे हैं: आज का गणित होमवर्क कुछ बच्चों का अभी बाकी है। {link} |
| Evening wrap | Tomorrow, start with Comparing fractions. 6 children need it. | कल की शुरुआत भिन्नों की तुलना से करें। 6 बच्चों को इसकी ज़रूरत है। |
| Re-check | Re-check: 4 of 6 now on track | दोबारा जाँच: 6 में से 4 अब ठीक चल रहे हैं |
| Camera: dark | Too dark, move near a light | बहुत अँधेरा है, रोशनी के पास जाएँ |
| Camera: shake | Hold still | फ़ोन स्थिर रखें |
| Camera: far | Move closer | थोड़ा पास लाएँ |
| Camera: cropped | Show the whole page | पूरा पेज दिखाएँ |
| Camera: glare | Tilt slightly, there is glare | थोड़ा तिरछा करें, चमक आ रही है |
| Camera tip | Wipe the camera lens first | पहले कैमरे का लेंस पोंछ लें |
| Principal lock | Unlocks when 3 teachers are active this week (now 1) | इस हफ़्ते 3 टीचर ऐक्टिव होने पर खुलेगा (अभी 1) |
| Empty desk | Desk is clear. Start with a homework. | डेस्क खाली है। एक होमवर्क से शुरू करें। |
| Labels | Demo data · Preview | डेमो डेटा · प्रीव्यू |

---

## 7. Friction reducers (10 per role, then the best 3)

**Teacher**
1. "Reuse last homework" with the next chapter preselected. 2. Chapter → 5 suggested bank questions, already ticked.
3. Due time defaults to the last one used (first time: tomorrow 8 pm). 4. WhatsApp message pre-written in the class language.
5. Self-join roster link: students tap their own name, or add it if missing. 6. Paste a class list (one name per line, from WhatsApp or Excel).
7. One Evening Wrap instead of pings. 8. Review queue shows only uncertain items, with "Accept all suggestions".
9. Paper-fallback grid: tap ✓/✗ per child per question. 10. Practice set auto-drafted, approved with one tap.
**Best 3:** reuse last homework (the 30-second path) · self-join roster · auto-drafted practice.

**Principal**
1. Join with a school code from any teacher, no setup. 2. One plain sentence at the top ("Class 6 Maths is the biggest gap this term").
3. Aggregates only, so there are no rankings to interpret or defend. 4. The locked view shows a labelled demo preview of what unlocks.
5. Invite teachers through a pre-written WhatsApp message. 6. Indian number formatting (1,20,000).
7. Current term preselected. 8. "Classes needing attention" with the weakest concept, instead of raw tables.
9. "Active teacher" defined inline. 10. A shareable one-page summary for staff meetings.
**Best 3:** one-sentence headline · demo preview behind the lock · invite via WhatsApp.

**Parent**
1. No install, no login. 2. Opens in the language the teacher preset. 3. Two big buttons in their own scripts when the language is unknown.
4. The report uses words ("understood / getting there / not yet"), not scores. 5. Shared phone: pick a child by name, and switching siblings is easy.
6. Reminder links open the pending homework directly. 7. Works on weak connections, with answers saved on the phone.
8. A one-line consent that's readable. 9. A plain statement of what the teacher sees. 10. The same link later shows the report and practice.
**Best 3:** no install/login · language preset · plain-word report.

**Student**
1. One question per screen with large targets. 2. Answers saved as typed. 3. Devanagari digits and spelling variants accepted (५ = 5).
4. A ten-second warm-up explains the screen. 5. Answers can be edited until the deadline. 6. Progress dots "3 of 8".
7. Back never loses an answer. 8. Skip and come back. 9. A clear success stamp. 10. Practice at their level on the same link.
**Best 3:** one question per screen · saved as typed · ten-second warm-up.

---

## 8. Risks for first-time users, and how we prevent them

| Risk | Prevention |
|---|---|
| **v1 has no server, so a student's answers on another phone cannot reach the teacher's phone.** | Say it plainly: v1 is a working single-device demo (teacher and student link in the same browser, or the demo submission wave). The repository interface is built so a sync backend (Supabase) can slot in. The README and an in-app "Preview: sync" note state this. *Biggest honesty risk; see Open Question 1.* |
| "Where do my students come from?" | The roster step offers a join link **or** paste-a-list, plus "Try with a demo class". |
| The first homework feels like work | A guided "mission" with a prefilled sample chapter, target under 3 minutes, and a progress indicator. |
| Nothing to see right after publishing | A labelled "demo submission wave" arrives so the first heatmap appears at once. |
| Teacher doesn't trust auto-check | Show the key, show per-question evidence, make every mark overridable, send uncertain items to review. |
| A wrong gap flag hurts trust | Gap rules need evidence; "not enough answers yet" is a first-class state. |
| WhatsApp's in-app browser loses storage or blocks the camera | Test it; show an "Open in Chrome" hint when storage or camera is unavailable. |
| Wrong child picked on a shared phone | A "You are Anaya? / Not me" confirm; the teacher can reassign a submission. |
| Teacher wrote English only, parent reads Hindi | Show the available language with a small note; teacher gets "Add Hindi" and a Preview auto-translate. |
| Principal thinks the dashboard is broken | The lock states the rule with live counts, alongside a labelled demo preview. |
| Camera denied | A plain explanation and a file-picker fallback. |
| Tour fatigue | Max 4 coach marks per screen, skippable, resumable; "Help" replays them. |

---

## 9. Navigation map

```
First open ──► Role chooser  [EN | हिं always visible]
               ├─ I'm a teacher ─► OTP (Preview) ─► name/school ─► first class ─► roster ─► consent
               │                   ─► first-homework mission ─► preview as student ─► share
               │                   ─► demo wave ─► first insight ─► first practice
               ├─ I'm a principal ─► school code / invite ─► "what Mento shows (and never shows)"
               │                     ─► demo school dashboard ─► lock explainer ─► invite teachers
               └─ I got a link    ─► (language) ─► pick name ─► consent ─► warm-up ─► homework ─► done

TEACHER tabs:   Desk (home) │ Create │ Results* │ Class        + Help, Settings in the top bar
  Desk:      sticky notes, Evening Wrap, Starter Checklist (until complete)
  Create:    class/chapter ─► questions (bank / own) ─► due ─► preview ─► publish ─► share
  Results*:  per homework: Review (flagged, override, paper marks) │ Concepts (highlighter, needs help, practice)
  Class:     roster, join link, default language, consent status, parent report, reminders
PRINCIPAL tabs: Overview │ Gaps │ Classes │ Plan
STUDENT (link): Today │ Practice │ My progress
Deep links:     /join/{token}  /h/{token}  /h/{token}/practice   (tokens only; no names in URLs)
Demo mode:      "Demo data" badge, script overlay, Reset demo, available from every role
```

**Proposed change to navigation (needs your OK):** merge the requested *Check* and *Insights* tabs into one
**Results** tab with two sub-views (Review | Concepts). Teachers think in terms of "how did this homework go",
and both views belong to the same homework. That gives four tabs, which are bigger targets on a 390 px phone.
If you prefer the original five, I'll keep five.

---

## 10. Key Assumptions to Validate

- [ ] A returning teacher can create and share in under 30 s. *Test:* time 5 teachers on the reuse path.
- [ ] Children on a shared parent phone pick the right name. *Test:* 5 families; count wrong picks and "Not me" taps.
- [ ] Misconception-tagged distractors match what teachers see in notebooks. *Test:* review the Class 6 bank with 2 maths teachers.
- [ ] Gap thresholds (student: ≥2 attempts and <50%; class: <60% over ≥3 attempts) agree with teacher judgement. *Test:* compare flags with a teacher's own list for one real class.
- [ ] The WhatsApp in-app browser keeps localStorage between opens and allows camera access. *Test:* Android, current WhatsApp, 3 phones.
- [ ] The Evening Wrap changes what happens next day. *Test:* ask 5 teachers the next morning what they did with it.
- [ ] Schools would pay ₹200-400 per student per year. *Test:* owner interviews. Shown only as "assumption" in the app.
- [ ] The Hindi copy reads naturally. *Test:* native-speaker review (flagged in README).

---

## 11. MVP Scope

**In (v1, working end to end on one device):** role chooser and all three onboarding paths; Desk home
with Starter Checklist and Evening Wrap; create homework (MCQ, number/fill-in, short answer, photo
[Preview reading], paper fallback) with bilingual fields, bank, reuse, template, preview; share link and
wa.me composer; student link (language, name, consent, warm-up, one question per screen, local save,
late tag, edit until deadline); auto-check, review/override, highlighter concepts card, gap rules,
needs-help list, practice draft → approve → re-check; parent report; reminder composer; guided photo
capture with real on-device quality checks; principal dashboard (aggregates, lock rule) and plan screen;
consent, CSV export, delete, "what we keep" screen, text size; demo mode (badge, script overlay, reset);
EN/HI everywhere.

**Preview (simulated, labelled):** OTP, WhatsApp sending (we only open wa.me), AI handwriting reading,
auto-translate, payments, multi-device sync.

---

## 12. Not Doing (and Why)

- **Real backend, accounts or sync.** Out of scope for v1. The repository interface keeps the door open for Supabase.
- **XP, streaks, leaderboards, class rankings.** They compare children and pressure them, and they're Kaksha's mechanics. We use one quiet stamp instead.
- **Teacher rankings for principals.** They'd destroy teacher trust. Aggregates only.
- **Exam or focus mode.** It isn't part of the homework loop, and Kaksha already covers it.
- **Push notifications or a ping per submission.** Push needs a backend, and pings punish the teacher. There's one in-app Evening Wrap.
- **Real OCR, WhatsApp API, OTP, translation, payments.** Cost, accuracy and privacy. Stubbed behind interfaces, labelled Preview.
- **Languages beyond EN/HI.** "6+ languages" appears on the plan screen as *planned*, not as working.
- **Rich-text or HTML question authoring.** XSS risk and complexity. Plain text plus simple fraction notation.
- **Native app, ERP, timetable, live classes, attendance.** Not part of the loop.
- **Sound on by default.** Evenings, shared phones, sleeping siblings.

---

## 13. Drift check against Kaksha

Checked and avoided: no answer-sheet/OMR visuals, no slide or section structure, no plan names
like Pro/Campus (Mento uses **Free (teacher)** and **School plan**), no XP or streaks, none of its wording or
North Star phrase, and not its "let teachers focus on teaching" framing. Mento's own language is *desk, note, highlight, tag,
wrap*. Proposed working North Star: **"children unstuck per class per week"**, meaning flagged
student-concept pairs that move to on-track on a re-check. This is a measurement definition only;
no value is ever shown unless it's computed.

---

## 14. Open Questions (for you, at this checkpoint)

1. **Single-device v1.** Is it OK that v1 works fully in one browser (teacher, student link and demo wave),
   with cross-phone sync shown as Preview? *(Recommended: yes. The only alternative is a real backend.)*
2. **Navigation.** Four teacher tabs with *Results* (Review | Concepts), or the original five?
3. **Misconception-tagged distractors** in the Class 6 bank, shown only when ≥2 children chose the same one. Keep?
4. **North Star wording** "children unstuck per class per week". OK, or do you want another phrase?

### Resolved at CHECKPOINT 1
1. Single-device v1, cross-phone sync shown as Preview: **yes**.
2. Teacher tabs: **four** (Desk, Create, Results [Review | Concepts], Class).
3. Misconception-tagged distractors, shown when 2 or more children chose the same one: **keep**.
4. North Star definition "children unstuck per class per week": **OK** (definition only, never shown uncomputed).
