import re

with open('/app/src/routes/_authenticated/_sidebar.tsx', 'r') as f:
    text = f.read()

widget = """
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Escuchando ahora
          </h4>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
              <span className="text-white text-[10px] text-center leading-tight opacity-50 px-1">Favourite Worst</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-foreground truncate">505</span>
              <span className="text-[13px] text-muted-foreground truncate">Arctic Monkeys</span>
              <span className="text-[13px] text-muted-foreground truncate">Favourite Wor...</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground">1:42</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="w-2/5 h-full bg-[#0b439c]" />
            </div>
            <span className="text-[11px] text-muted-foreground">4:13</span>
          </div>
        </div>
      </aside>"""

text = text.replace('      </aside>', widget)

with open('/app/src/routes/_authenticated/_sidebar.tsx', 'w') as f:
    f.write(text)
