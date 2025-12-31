# Debug Steps - Blank Screen Issue

## Step 1: Check Browser Console
1. Open your browser
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. Look for **RED error messages**
5. **Copy and share** any errors you see

## Step 2: Test Simple Pages

Try these URLs one by one:

1. **http://localhost:3000/test** 
   - Should show "React is Working! ✅"
   - If this works, React is fine

2. **http://localhost:3000/simple**
   - Should show landing page without auth
   - If this works, the issue is with auth context

3. **http://localhost:3000/**
   - Main landing page
   - If this doesn't work but /simple works, it's an auth issue

## Step 3: Check Terminal

Look at the terminal where you ran `npm run dev`:
- Are there any **red error messages**?
- Does it say "Local: http://localhost:3000"?
- Share the terminal output

## Step 4: Quick Fixes

### Fix 1: Clear Everything
```bash
# Stop the server (Ctrl + C)
cd spendsmart-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Fix 2: Check Port
Make sure nothing else is using port 3000:
```bash
# Windows PowerShell
netstat -ano | findstr :3000
```

### Fix 3: Hard Refresh Browser
- Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
- Or clear browser cache completely

## Step 5: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for files with **red status** (404, 500, etc.)
5. Check if `main.jsx` and `App.jsx` are loading

## Common Errors & Solutions

### Error: "Cannot read property of undefined"
**Solution:** Check if all imports are correct

### Error: "Module not found"
**Solution:** Run `npm install`

### Error: "Hooks can only be called inside..."
**Solution:** Make sure hooks are called at the top level

### Blank screen with no errors
**Solution:** Check if CSS is loading, try `/test` page

## What to Share

Please share:
1. **Browser console errors** (screenshot or copy text)
2. **Terminal output** when running `npm run dev`
3. **Which URL works** (/test, /simple, or /)
4. **Browser name and version**

This will help identify the exact issue!


