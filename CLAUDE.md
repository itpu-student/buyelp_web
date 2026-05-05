

Always be highly concise and Sacrifice grammar for the sake of concision.



## Plans
- At the end of each plan, give me a list of unresolved qustions to answer, if any. Make questions highly concise. Sacrifice grammer for the sake of concision.



# Breaking Change (Feel Free To change code)
- Backward compatibility - is not a thing for us
- This project not relised yet, so we can do as much as changes as we want


# Backend Api docs
- read file ~/github.com/itpu-student/s101_api/docs/swagger.yaml
- for file storage: 
- - POST /files/upload file:file, usage:oneOf["avatar","review","place"]


# UI/UX Philosophy

Intentional, user-serving UI. Feels considered, not assembled.

- **Consistent visual language** — colors, shapes, motion are uniform across the app. If something means X in one view, it means X everywhere. Don't invent new patterns when existing ones work.
- **Color communicates state** — green=ok/active, amber=pending/warning, red=danger/blocked, teal=primary action, gray=inactive. User understands status before reading text.
- **Everything reacts** — every clickable has a visible hover state. New elements animate in (fade up from below). Cards subtly lift. Nothing feels dead or static.
- **Data can be interactive** — depending on context, an entity (user, place, review) can be clickable to trigger a focused action. Choose what makes sense for the situation: sometimes a modal, sometimes navigation.
- **Context before action** — before any destructive or irreversible action, show the user what they're acting on. Never blind confirmations.
- **Progressive disclosure** — lists show just enough (preview, key badges, status). Detail views show everything. Don't overload lists.
- **Minimize unnecessary navigation** — when a quick action is common, surface it where the user already is. Reserve full pages for complex workflows.
- **Loading/empty states are human** — "Loading…" inline, or a spinner. Empty = a clear sentence, not silence or a code.
