## Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --turbopack --yes
```

Now let's move back to the parent directory and move all files.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

## Processing Your Files

**IMPORTANT: Process ALL markdown files in your download folder in sequential order (by their number prefix).**

Each markdown file contains HTML/CSS code that needs to be converted into functional React components.

**Critical Processing Rules:**
- Process ONE markdown file at a time
- Complete the CURRENT file before advancing to the next
- Generate ALL required code from each file
- Verify full implementation before moving on
- Follow the instructions in each markdown file exactly

**Component Best Practices:**
- Use 'use client' directive for interactive components
- Create reusable layout components (Header, Footer, Sidebar if present)
- Place layout components in `src/components/layout/` directory
- Import layout components in root layout (`src/app/layout.tsx`), not in individual pages
- Each page should only contain its main content area

**Styling Guidelines:**
- Follow the Tailwind import instructions in the tailwind-imports-best-practice.md file
- Maintain design consistency across all components
- Ensure layout components extend full viewport height and width using min-h-screen and w-full
- Avoid curly quotes in code - use escaped apostrophes (\') or double quotes
- Maintain readable contrast (avoid light gray text on white backgrounds)

**Note:** The files in your download include all the components and pages needed to build your complete application. Process them sequentially for best results.

