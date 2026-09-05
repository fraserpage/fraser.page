export interface CaseStudyBlock {
  h?: string;
  p?: string;
  visual?: "diff" | "notes" | "tasks" | "sms";
}

export interface CaseStudy {
  slug: string;
  no: string;
  title: string;
  tag: string;
  summary: string;
  blocks: CaseStudyBlock[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "data-requests",
    no: "01",
    title: "Data Requests",
    tag: "AI tool design",
    summary: "Model context is its UI.",
    blocks: [
      { h: "The system" },
      { p: "GRACE lets students make submissions to update their own data. Keeping student data up to date is essentially the main function of the app, and what advisers spend significant amounts of time doing — so this was an opportunity to take some work off their plate. Student submissions get stored as diffs on their own model, and merge to their target once an adviser approves (or rejects) the request." },
      { p: "It's a simple framework with a fair bit of complexity in its implementation: open and rejected requests need distinct form states, requests to create records appear to students as actual records but with a pending-approval label, many different endpoints for different data types, and so on." },
      { h: "The attempt" },
      { p: "Our initial AI tool design explained the system, gave context on the student and adviser submission workflow, and handed over all of the student's data — existing records, diffs on those, the status of each submission, when to use the id of the submission vs. the id of the record. The thesis was: we're using a smart model, give it all the info and let it run." },
      { p: "Actual use showed consistent confusion on the model's part. It struggled to make sense of everything we had dumped on it, and to explain any of it succinctly to students. It would mix up the status of a submission with the status of a college application; it would share model internals and then just say “some updates are pending.”" },
      { h: "The lesson" },
      { p: "Model context is its UI. Our student UI shows only what a student needs to see — if they've requested a change, we don't show them the old value; requests to add new records look as much like real records as possible. We were handing the model complexity that our own UI had never asked a human to deal with." },
      { p: "So I rebuilt the agent surface to mirror the UI: don't explain inner workings that aren't surfaced to the student, handle the complexity in code in the name of a simple surface, and let the agent spend its attention on its prime directive rather than on decoding our data model." },
    ],
  },
  {
    slug: "smart-interaction",
    no: "02",
    title: "Smart Interaction",
    tag: "Feature craft",
    summary: "One vague “can we add AI?” became three shipped features.",
    blocks: [
      { h: "The brief" },
      { p: "Turning vague asks into polished solutions usually fell to me and the team. This one started as a question we put to the client ourselves: “where can we integrate AI to make advisers' lives easier?” What evolved out of it was a “smart interaction” tool to assist advisers with their most common data-input task — logging an interaction every time they talk to a student." },
      { h: "Narrowing it down" },
      { p: "In that first conversation we all pictured a new interface in the app. My work, including research into existing UI patterns, narrowed it to something much smaller: a “fill fields from notes” button sitting under the notes field advisers were already using. A small intervention that meets advisers where they are, and makes adoption close to free." },
      { p: "An agent with the form's rules and the adviser documentation baked in reads the notes advisers already write and infers form state, filling the form in for them — with student names filtered out of what gets sent. A transition on the affected fields makes the magic-fill visible as it happens. I ran automated testing across several models to pick the right one for the task, prioritizing speed and balancing accuracy against cost." },
      { visual: "notes" },
      { h: "What the research turned up" },
      { p: "Scoping the feature, I dug into how advisers were actually using the form and found many of them working in batches — opening the modal, logging one interaction, closing it, opening it again. So I pitched and built two more features on the back of that." },
      { p: "First, a “keep window open” toggle, for advisers who like the one-at-a-time dialog but shouldn't have to keep re-entering it. Second, for the power users, an extended bulk import: our existing importer taught to handle the interaction form's harder requirements — conditional fields, clearable selects, better error messages — which improved every other bulk import in the app along the way." },
      { p: "Three working habits, three fits, instead of one guess." },
    ],
  },
  {
    slug: "tasks-system",
    no: "03",
    title: "Tasks System",
    tag: "Greenfield",
    summary: "A checklist that's just a read of the student's own data.",
    blocks: [
      { h: "The gap" },
      { p: "A new student portal needed a “tasks” concept to guide students through their journey — something to give them a sense of what to do next. Nobody could say what a task actually was. The client couldn't articulate it, and the designer didn't have enough visibility into the advising workflow to fill the gap. So defining it fell to me." },
      { visual: "tasks" },
      { h: "The reasoning" },
      { p: "The app's whole job is collecting and tracking student data. A checklist that doesn't feed that data isn't helping anyone — it's decoration, and it's a second copy of the truth waiting to drift out of sync. So a task shouldn't be an arbitrary to-do item. It should be a read of the student's actual data: pending or complete based on whether the underlying data condition is met, and completing it just means updating the relevant data." },
      { h: "Shipping it" },
      { p: "I built v1 hardcoded — a fixed set of tasks mapped to fixed data conditions — but shaped so it could grow into something configurable, by exposing the filtering tools we'd already built as a task-config screen down the line." },
    ],
  },
  {
    slug: "scripts-to-prompts",
    no: "04",
    title: "Scripts to Prompts",
    tag: "Strategic reframe",
    summary: "Replaced a legacy SMS script system with an agent that reads real student data.",
    blocks: [
      { h: "The problem" },
      { p: "The client used a legacy student messaging platform to send script-based SMS messages guiding students through their college journey. My investigation showed it had an abysmally low engagement rate. We had just built a student-facing AI chatbot, and we already had an SMS system inside GRACE — so: connect the dots. Replace the underperforming tool with something that doesn't need students manually exported into a second system, that can reference their actual data, that can use the full toolset we'd built for the chatbot, and that feeds results back into the outcomes the client actually measures." },
      { h: "How" },
      { p: "That was an open question. The client rep works with these scripts every day and needed guiding into the world of prompts rather than scripts." },
      { h: "The solution" },
      { p: "Two new modes in our campaign scheduler. The first, “from AI,” sends messages to students matched by highly configurable targeting filters. The message can be pre-composed or generated per student from a prompt, with the agent free to look up that student's real records. For example: “this message targets students with in-progress college applications. Let's move those toward applied. Look up the student's applications and offer to help them finish, referencing the specific schools, as character limits allow.”" },
      { visual: "sms" },
      { p: "The old system couldn't come close. The agent always carries its system prompt and understands its directive — help students, keep their data current. Where there are talking points we want hit in a particular conversation, we attach a per-conversation prompt that persists across future messages. Script-like control, a fraction of the work." },
      { p: "The second mode I pitched and built, which the client named “automated touch points,” shares the same filters and prompt field but runs on an ongoing basis. Rather than going out at a set date and time, these messages fire whenever a student newly matches the filter condition — something the previous system had no answer for at all." },
      { h: "One detail I liked" },
      { p: "There's considerably more here, but a favourite: wrong numbers. We can't risk exposing student information to whoever inherited a recycled phone number. The fix is to just ask for their name and check it against our records. A wrong number isn't going to guess it. Simple, cheap two-factor." },
    ],
  },
];
