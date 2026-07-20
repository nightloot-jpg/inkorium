import re

with open('/app/src/routes/_authenticated/_sidebar/feed.tsx', 'r') as f:
    text = f.read()

# Replace the wrapper div class to remove the 200px column
text = text.replace(
    'lg:grid-cols-[200px_minmax(0,1fr)_220px]',
    'lg:grid-cols-[minmax(0,1fr)_220px]'
)

# Replace the <main> with a <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_220px] gap-4 w-full"> to match the grid but act as a child block
text = text.replace(
    '<main className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_220px] gap-4 py-4 w-full max-w-[980px] mx-auto px-2 lg:px-0">',
    '<div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_220px] gap-4 w-full">'
)

text = text.replace(
    '</main>',
    '</div>'
)

# Remove the aside block
# We find the first <aside ...> and its matching </aside>
start_idx = text.find('      {/* Sidebar izquierdo */}')
end_idx = text.find('      {/* Feed */}')

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + text[end_idx:]

with open('/app/src/routes/_authenticated/_sidebar/feed.tsx', 'w') as f:
    f.write(text)
