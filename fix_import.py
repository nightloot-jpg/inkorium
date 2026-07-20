import re

with open("src/routes/_authenticated/_sidebar/feed.tsx", "r") as f:
    content = f.read()

old_import = 'import {, ArrowRight, BarChart2, Bookmark, Calendar as CalendarIcon, ChevronDown, Flag, Globe2, Home, Image as ImageIcon, MapPin, Music, Newspaper, Search, Settings, Upload, Users, Video, X} from "lucide-react";'
new_import = 'import { ArrowRight, BarChart2, Bookmark, Calendar as CalendarIcon, ChevronDown, Flag, Globe2, Home, Image as ImageIcon, MapPin, Music, Newspaper, Search, Settings, Upload, Users, Video, X } from "lucide-react";'

content = content.replace(old_import, new_import)

with open("src/routes/_authenticated/_sidebar/feed.tsx", "w") as f:
    f.write(content)
