FRASER PAGE

Throw me your fuzziest briefs. 

What? No, not underpants.

Give me an ill-defined problem, and I'm happy. It's where i can demonstrate my competence most fully. Where i get to dig in and think things through and contribute top to bottom. 

Is it weird to say I love an ill-defined problem? (Can't be weirder than an underpants joke on a 'professional' portfolio?) I mean, that's where you get to do the most thinking. That's where you get to have the most impact. That's where you get to deliver from top to bottom. When you get to 'own' a feature and put in the hard work to make it shine. Properly define the ask; jump into data; design, pitch, implement a solution. Good stuff you can be proud of. That's the whole thing isn't it? 

Fraser: a dev who takes pride in his work. (But don't we all?)

Fraser: a dev who jumps at the opportunity to be impactful. a dev who gets it top to bottom. 

Latest: 
At: Springloaded A bleeding-edge dev studio. Our products are elegant front to back. (I think we're really good.)



Push AI Chatbot over SMS

The problem: client uses a legacy student messaging platform to send script-based SMS messages to students to guide them in their college journey. My investigation shows that this has an absmally low engagement rate. We've just built out a student facing AI chatbot. We already have an SMS messaging system in GRACE. Let's connect the dots, replace the outdated, underperforming system with something better, which doesn't require manually exporting students from our system and into another, which can communicate intelligently, reference students' actual data and make use of the full toolset we've built for the chatbot, feeding data back into our system and contributing to measurable outcomes client cares about. 

How: this was an open question. Client rep works with the scripts every day and required guidance into world of AI prompts. 

Solution: two new modes in our Campaign scheduler: 'from AI' - sends messages to students based on highly configurable targeting filters. That message may be pre-composed or AI generated per student based on a prompt - agent has access to retrieval tools and can reference actual student data. E.g. "this message is targeting students who have 'in-progress' college applications. let's move those toward 'applied'. look up the student's college applications and offer to help them finish their applications. reference the schools the student has applications in progress for, as character limits allow."
The old system couldn't come close to this. The agent always has it's system prompt attached and understands its directive of helping students and keeping their data uptodate. Where we have talking points we wish for the agent to hit in this specific conversation, we attach an additional 'per-conversation' prompt that will persist across future messages. this gives 'script'-like control to the resultant conversation with a fraction of the work involved. 
The second ai sending mode I pitched and built out the client chose to call 'automated touch points.' It shares the same filters and prompts field but functions on an 'ongoing' basis and unlocks functionality the previous system couldn't come close to touching. Rather than sending at a specific date and time, these 'automated touch point' campaign messages are sent out whenever a student newly matches the filter condition.

There is considerably more here - e.g. how we solved for wrong numbers. we don't want to expose our student info to the wrong person by mistake. solve: just ask for their name and validate that against our records. a wrong number is not going to guess that right. simple, easy 'two-factor'.


Lesson: context is agent ui 
the problem: make a complex system accessible to a chat via a set of tools
Our application lets students make submissions to update their data. Keeping student data up to date is essentially the main function of the app and what advisers spend significant amounts of time doing so this an opportunity to take some work off their plate. These student submissions get stored as diffs on their own model and get merged to their target once an adviser approves (or rejects) the request. It's a simple framework that has a fair bit of complexity in its implementation: open and rejected requests need distinct form states, requests to create records appear to students as actual records but with a pending approval label, many different end points for different data types, etc. Our initial AI tool design explained the system, gave context to the student and adviser submission workflow and handed over all of the student's data -- existing records, diffs on those, the status of the submissions, explained when to use the id of the submission in the tool vs the id of the record, etc. the thesis was: we're using a smart model, give it all the info and let it run. Actual use showed: consistent confusion on the model's part. It struggled to make sense of all we had dumped on it and to explain it suscinctly to students. It would mix up the status of a submission with the status of a college application; it would share model data and just state 'some updates are pending'. 
the lesson: model context is its ui. our student ui shows only what they need to see. if they've made a request to change data, we don't need to show the old data. requests to add new records look as much like actual records as possible. we were piling on complexity that our ui had handled for it by the back end. solution: update the agent surface to mirror the ui. don't explain inner workings that should not be surfaced to the student. handle the complexity in code in the name of a simple surface and let the agent focus on its prime directive, not on decoding complex rules. 


---

Below: starting points pulled from Claude's earlier skeletons, not yet in Fraser's voice. For editing, not for shipping as-is.

Tasks system:

A new student portal needed a "tasks" concept to guide students through their journey — something to give them a sense of what to do next. Neither the client nor the designer could really define what a task should be: the client couldn't articulate it, and the designer didn't have enough visibility into the actual advising workflow to fill the gap. Fell to me to define it.

Reasoning: the app's whole job is collecting and tracking student data. A checklist that doesn't feed that data isn't actually helping anyone — it's just decoration. So tasks shouldn't be an arbitrary to-do list; they should be a read of the student's actual data. A task is pending or complete based on whether the underlying data condition is met, and completing a task just means updating the relevant data.

Built v1 hardcoded — a fixed set of tasks mapped to fixed data conditions — but shaped so it could grow into something configurable later, by exposing the filtering tools we'd already built as a task-config screen down the line.

Smart Interaction:

Brief was vague — advisers log an "interaction" every time they talk to a student, and the ask was just "can we make this better with AI?" No spec, no interface in mind.

Usage data showed the actual friction: some advisers were doing this in batches — open the form, log one interaction, close it, reopen, log the next. Rather than guess at one fix, built for three different habits at once: extended the existing bulk-import tool to fully support interaction records via a table view (which improved every other bulk tool along the way, not just this one); added a "keep window open" toggle for advisers who prefer the one-at-a-time dialog but want less friction re-entering it; and, for single entries, added AI smart-fill — advisers jot a few words in a notes field they already use, click a button, and the form fills itself, reading from adviser documentation baked into the agent and filtered to exclude student names for privacy.

The real Linear ticket that kicked this off exists as a screenshot (colleague's handle needs redacting before use) — worth showing as proof alongside the narrative rather than just describing it.
