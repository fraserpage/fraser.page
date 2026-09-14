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
    title: "Model context is its UI",
    tag: "Agent Design",
    summary: "We context dumped the whole backend system into the agent, and it failed.",
    blocks: [
      { h: "The system" },
      { p: "GRACE lets students make submissions to update their own data. Keeping student data up to date is essentially the main function of the app, and what advisers spend significant amounts of time doing — so this project was an opportunity to take some work off their plate. Student submissions get stored as diffs on their own model, and merge to their target once an adviser approves the request." },
      { p: "It's a simple framework with a fair bit of complexity in its implementation: open and rejected requests need distinct form states, requests to create records appear to students as actual records but with a pending-approval label, many different endpoints for different data types, and so on." },
      { h: "The attempt" },
      { p: "Our initial AI tool design explained the system, gave context on the student and adviser submission workflow, and handed over all of the student's data — existing records, diffs on those, the status of each submission, when to use the id of the submission vs. the id of the record. The thesis was: we're using a smart model, give it all the info and let it run." },
      { p: "Actual use showed consistent confusion on the model's part. It struggled to make sense of everything we had dumped on it, and to explain any of it succinctly to students. It would mix up the status of a submission with the status of a college application; it would share model internals or say “some updates are pending” when the details of those updates were what the student needed to know." },
      { h: "The lesson" },
      { p: "Model context is its UI. Our student UI shows only what a student needs to see — if they've requested a change, we don't show them the old value; requests to add new records look as much like real records as possible. We were handing the model complexity that our own UI had never asked a human to deal with." },
      { p: "So I rebuilt the agent surface to mirror the UI: don't explain inner workings that aren't surfaced to the student, handle the complexity in code in the name of a simple surface, and let the agent spend its attention on its prime directive rather than on decoding our data model." },
    ],
  },
  {
    slug: "smart-interaction",
    no: "02",
    title: "Vague client ask → three targeted features",
    tag: "Product Discovery",
    summary: "The three features I ended up building came out of watching how advisers already worked, not from the brief.",
    blocks: [
      { h: "The brief" },
      { p: "This project came about after we had completed much of the extensive student-facing AI build-out. The question we asked in a client call was: “where can we integrate AI to make advisers' lives easier?” What evolved out of it was a “smart interaction” tool to assist advisers with their most common data-input task — logging an interaction every time they talk to a student." },
      { h: "Narrowing it down" },
      { p: "In that first conversation we all pictured a new interface in the app. My work, including research into existing UI patterns, narrowed it to something much smaller: a “fill fields from notes” button sitting under the notes field in the existing interaction form. A small intervention that meets advisers where they are." },
      { p: "An agent with the form's rules and the adviser documentation baked in reads the notes advisers already write and infers form state, filling the form in for them — with student names filtered out of what gets sent. A transition on the affected fields makes the magic-fill visible as it happens. We run form validation on what the agent filled out, which has the benefit of showing the user where they need to manually add some information. I ran automated testing across several models to pick the right one for the task, prioritizing speed and balancing accuracy against cost." },
      { visual: "notes" },
      { h: "What the research turned up" },
      { p: "Scoping the feature, I dug into how advisers were actually using the form and found many of them working in batches — opening the modal, logging one interaction, closing it, opening it again. So I pitched and built two more features on the back of that." },
      { p: "First, a “keep window open” toggle, for advisers who like the one-at-a-time dialog but shouldn't have to keep re-opening it. That toggle is visible in the video above. A simple intervention that saves users a repeated hassle. Second, for the power users, a new bulk import mode. This entailed extending our existing importer to handle the interaction form's harder requirements — conditional fields, clearable selects, better error messages — which improved every other bulk import in the app along the way and was a far bigger lift than the original feature — some 7k lines of code added over 100 files and 7 PRs." },
    ],
  },
  {
    slug: "tasks-system",
    no: "03",
    title: "Student tasks that create (and complete) themselves",
    tag: "System Design",
    summary: "Designed from top to bottom: the data that defines a task, the filter language the app already spoke, and an engine cheap enough to run them all in one pass.",
    blocks: [
      { h: "The gap" },
      { p: "A new student portal needed a “tasks” concept to guide students through their journey — something to give them a sense of what to do next. Our designer did his best, but he was not a domain expert. The client, on the other hand, was, but lacked the systems thinking needed to put together a comprehensive list of student tasks. As a result, my first task when starting work on the feature was defining the tasks." },
      { visual: "tasks" },
      { h: "The reasoning" },
      { p: "The app's whole job is collecting and tracking student data. A checklist that doesn't write back to that data would just be a second copy of it, waiting to drift out of sync. Talking this through with the dev team, we decided: each task is a read of the student's actual data: pending or complete depending on whether the underlying condition is met. Completing a task means updating that data." },
      { p: "Even then, we weren't quite sure what the tasks should be. The designer had already tried, and so had the client. I looked at the data itself: each piece has an obvious flow, keyed on its status field. Those statuses translated into tasks." },
      { p: "Each task may have four conditions (when it appears, when it's complete, when it's dismissed, and when it expires) and one lifecycle the engine runs for all of them. Students don't tick tasks off. They update something like their application status, and the task reads as complete on the next pass." },
      { h: "Borrowing a language we already had" },
      { p: "I reused GRACE's existing filter system for the conditions. Advisers already use it to build and save searches across student data, so a rule like “create this task for every application with a status of interested” is the same object the search UI produces when an adviser builds that filter by hand." },
      { p: "The plan was: tasks will be an admin-facing configuration. But we wanted to get the student-facing side built first. So I shipped v1 with the definitions hardcoded (eighteen of them, each a small class). Those classes had to be the same shape as the rows they'd become. They sit behind a repository, so the whole set swaps by changing one implementation. And the test suite already runs against a different one, so we can test independently of the definition classes. When the definitions move into the database and get a config screen, that screen can be a UI over a filter language the app already uses and already stores." },
      { h: "Making it cheap" },
      { p: "A naive version of this would be a query disaster: eighteen definitions, four conditions each, run against every application, test and scholarship a student has, each one a database round trip." },
      { p: "Before the engine runs, each task type declares the relations it needs, and those load in a single batch. I also gave the filter system a second way to execute. Alongside the path that compiles a filter into SQL, I added an in-memory path that evaluates the same filter object against data that's already loaded. After that first load, every condition check is free, so the engine costs the same whether it's running eighteen definitions or eighty." },
    ],
  },
  {
    slug: "scripts-to-prompts",
    no: "04",
    title: "The chatbot that replaced the script system",
    tag: "AI Engineering",
    summary: "Replacing a vendor tool whose scripts couldn't see any of the student data we were already sitting on.",
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
      { p: "There's considerably more here, but a favourite: wrong numbers. We can't risk exposing student information if an adviser entered the wrong number for a student. The fix is a simple validation step. We ask the student to confirm their name and check it against our records. A wrong number isn't going to guess it. Simple, cheap two-factor." },
    ],
  },
];
