import re

with open("src/components/ui/calendar.tsx", "r") as f:
    content = f.read()

# Add necessary imports
if "useState" not in content:
    content = content.replace('import * as React from "react";', 'import * as React from "react";\nimport { useState, useRef } from "react";')

# We need to wrap DayPicker to add wheel and touch events and manage the month state
# Since `Calendar` already wraps `DayPicker`, we can just modify `Calendar`

# Find Calendar component declaration
calendar_def_match = re.search(r'function Calendar\(\{[^\}]*\}\s*:\s*CalendarProps\)\s*\{', content)
if calendar_def_match:
    def_end = calendar_def_match.end()

    # We will replace the entire function body since we are doing multiple changes

# Instead of complex regex, let's just rewrite the file content using standard python logic or write the full file out.
